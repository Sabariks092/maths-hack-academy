import { useState } from 'react'

const SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL

/**
 * Posts a form to the Google Apps Script web app.
 * Sent as text/plain so the browser makes a "simple" request (no CORS preflight,
 * which Apps Script cannot answer); the script parses the JSON body itself.
 */
export async function submitToSheet(action, data) {
  if (!SCRIPT_URL) throw new Error('The form is not connected yet (VITE_APPS_SCRIPT_URL is missing).')
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...data }),
  })
  let json
  try {
    json = await res.json()
  } catch {
    throw new Error('Unexpected response from the server. Please try again.')
  }
  if (!json.ok) {
    const err = new Error(json.message || 'Something went wrong. Please try again.')
    err.code = json.code // e.g. 'auth' when the admin password is wrong
    throw err
  }
  return json
}

/** Holds form state + submit status for a simple controlled form. */
export function useSheetForm(action, initial) {
  const [values, setValues] = useState(initial)
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (status.state === 'sending') return
    setStatus({ state: 'sending', message: '' })
    try {
      const res = await submitToSheet(action, values)
      setStatus({ state: 'success', message: res.message })
      setValues(initial)
    } catch (err) {
      setStatus({ state: 'error', message: err.message })
    }
  }

  const reset = () => setStatus({ state: 'idle', message: '' })

  return { values, status, onChange, onSubmit, reset }
}

// Indian mobile numbers, with optional +91 / 0 prefix and spaces/dashes.
// (Hyphen escaped: browsers compile `pattern` with the regex `v` flag.)
export const PHONE_PATTERN = '(\\+?91[\\s\\-]?|0)?[6-9]\\d{4}[\\s\\-]?\\d{5}'
