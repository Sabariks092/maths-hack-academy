import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { ErrorNote, Field, FormPage, SubmitButton } from '../components/forms/formKit'
import { submitToSheet } from '../components/forms/sheetForm'
import { Brand } from '../components/ui/Brand'
import { Diamond } from '../components/ui/primitives'

/*
 * Admin dashboard. The password is checked by the Apps Script on every request
 * (Script property ADMIN_PASS), so nothing secret ships in this bundle. It is
 * kept in sessionStorage only so a page refresh doesn't log the admin out.
 */

const PASS_KEY = 'mh-admin-pass'
const passStore = {
  get() {
    try {
      return sessionStorage.getItem(PASS_KEY) || ''
    } catch {
      return ''
    }
  },
  set(value) {
    try {
      if (value) sessionStorage.setItem(PASS_KEY, value)
      else sessionStorage.removeItem(PASS_KEY)
    } catch {
      /* storage blocked — the admin just logs in again after a refresh */
    }
  },
}

const STATUS = {
  NONE: 'Not requested',
  REQUESTED: 'Requested',
  ISSUED: 'Issued',
  REJECTED: 'Rejected',
}
const FILTERS = ['All', STATUS.REQUESTED, STATUS.ISSUED, STATUS.NONE, STATUS.REJECTED]

function AdminApp() {
  const [password, setPassword] = useState(passStore.get)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const logout = (message = '') => {
    passStore.set('')
    setPassword('')
    setData(null)
    setLoginError(message)
  }

  /** Every admin call goes through here; a wrong/expired password logs out. */
  const api = async (action, extra = {}, pass = password) => {
    try {
      return await submitToSheet(action, { password: pass, ...extra })
    } catch (err) {
      if (err.code === 'auth') logout(err.message)
      throw err
    }
  }

  const load = async (pass = password) => {
    setLoading(true)
    setLoginError('')
    try {
      const res = await api('adminList', {}, pass)
      passStore.set(pass)
      setPassword(pass)
      setData({ students: res.students, trainers: res.trainers, modes: res.modes })
      return true
    } catch (err) {
      if (err.code !== 'auth') setLoginError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Resume a session after a refresh.
  useEffect(() => {
    if (password) load(password)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!data) {
    return <Login loading={loading} error={loginError} onLogin={load} resuming={loading && !!password} />
  }

  return (
    <Dashboard
      data={data}
      setData={setData}
      api={api}
      refreshing={loading}
      onRefresh={() => load()}
      onLogout={() => logout()}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Login                                                                     */
/* -------------------------------------------------------------------------- */

function Login({ loading, error, onLogin, resuming }) {
  const [value, setValue] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    if (!loading && value) onLogin(value)
  }

  return (
    <FormPage eyebrow="Admin" title="Academy dashboard" intro="Enter the admin password to manage students and certificates.">
      {resuming ? (
        <p className="text-sm text-muted">Signing you back in…</p>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-5">
          <Field
            label="Password"
            name="password"
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            autoComplete="current-password"
            autoFocus
          />
          <ErrorNote message={error} />
          <SubmitButton sending={loading}>Sign in</SubmitButton>
        </form>
      )}
    </FormPage>
  )
}

/* -------------------------------------------------------------------------- */
/*  Dashboard                                                                 */
/* -------------------------------------------------------------------------- */

function Dashboard({ data, setData, api, refreshing, onRefresh, onLogout }) {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState(null) // { type: 'ok' | 'error', text }

  const { students, trainers, modes } = data

  const counts = useMemo(() => {
    const c = { All: students.length }
    for (const s of students) c[s.certStatus] = (c[s.certStatus] || 0) + 1
    return c
  }, [students])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return students
      .filter((s) => filter === 'All' || s.certStatus === filter)
      .filter((s) =>
        !q ||
        [s.regId, s.studentName, s.parentName, s.email, s.mobile, s.trainer].some((v) => v.toLowerCase().includes(q)),
      )
      .slice()
      .reverse() // newest registrations first
  }, [students, filter, search])

  const replaceStudent = (student) =>
    setData((d) => ({ ...d, students: d.students.map((s) => (s.regId === student.regId ? student : s)) }))

  const say = (type, text) => setNotice({ type, text })

  return (
    <div className="min-h-svh bg-paper">
      <header className="border-b border-ink/10 bg-[#fffcf3]">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-4">
          <a href="/" aria-label="Math Hacks — home">
            <Brand />
          </a>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onRefresh} disabled={refreshing} className={btn.outline}>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
            <button type="button" onClick={onLogout} className={btn.outline}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="container-page py-8">
        <p className="flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted">
          <Diamond /> Admin
        </p>
        <h1 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.5rem)] leading-tight font-light tracking-[-0.02em]">
          Students &amp; certificates
        </h1>

        {counts[STATUS.REQUESTED] > 0 && filter !== STATUS.REQUESTED && (
          <button
            type="button"
            onClick={() => setFilter(STATUS.REQUESTED)}
            className="mt-5 block w-full border-l-2 border-gold bg-gold-soft/50 px-4 py-3 text-left text-sm font-semibold text-ink hover:bg-gold-soft"
          >
            {counts[STATUS.REQUESTED]} certificate request{counts[STATUS.REQUESTED] > 1 ? 's' : ''} waiting for approval →
          </button>
        )}

        {notice && (
          <div
            role={notice.type === 'error' ? 'alert' : 'status'}
            className={`mt-5 flex items-start justify-between gap-4 border-l-2 px-4 py-3 text-sm ${
              notice.type === 'error' ? 'border-red-700 bg-red-50 text-red-800' : 'border-teal bg-teal-soft/60 text-teal-deep'
            }`}
          >
            <span>{notice.text}</span>
            <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="font-semibold">
              ×
            </button>
          </div>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`px-3 py-2 text-xs font-semibold tracking-wide transition-colors ${
                  filter === f ? 'bg-ink text-paper' : 'border border-ink/20 text-ink hover:border-ink'
                }`}
              >
                {f} <span className="opacity-60">({counts[f] || 0})</span>
              </button>
            ))}
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, mobile, ID…"
            aria-label="Search students"
            className={`${inputSm} w-full lg:w-72`}
          />
        </div>

        <AddTrainer
          api={api}
          trainers={trainers}
          onAdded={(list, message) => {
            setData((d) => ({ ...d, trainers: list }))
            say('ok', message)
          }}
          onError={(m) => say('error', m)}
        />

        <div className="mt-6 overflow-x-auto border border-ink/10 bg-[#fffcf3]">
          <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-paper-deep/60 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-muted">
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3">Student</th>
                <th className="px-3 py-3">Contact</th>
                <th className="px-3 py-3">DOB</th>
                <th className="px-3 py-3">Registered</th>
                <th className="px-3 py-3">Trainer</th>
                <th className="px-3 py-3">Mode of training</th>
                <th className="px-3 py-3">Certificate</th>
                <th className="px-3 py-3">Certificate URL</th>
                <th className="px-3 py-3">Issue date</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s) => (
                <StudentRow
                  key={s.regId}
                  student={s}
                  trainers={trainers}
                  modes={modes}
                  api={api}
                  onUpdated={replaceStudent}
                  say={say}
                />
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan={10} className="px-3 py-12 text-center text-muted">
                    {students.length ? 'No students match this filter.' : 'No registrations yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

function AddTrainer({ api, trainers, onAdded, onError }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (busy || !name.trim()) return
    setBusy(true)
    try {
      const res = await api('adminAddTrainer', { name })
      setName('')
      onAdded(res.trainers, res.message)
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-wrap items-center gap-2 text-sm">
      <span className="font-semibold text-ink-soft">Trainers:</span>
      <span className="text-muted">{trainers.length ? trainers.join(', ') : 'none yet'}</span>
      <span className="flex grow flex-wrap gap-2 sm:ml-auto sm:grow-0">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New trainer name"
          aria-label="New trainer name"
          maxLength={80}
          className={`${inputSm} grow sm:w-56 sm:grow-0`}
        />
        <button type="submit" disabled={busy || !name.trim()} className={btn.ink}>
          {busy ? 'Adding…' : 'Add trainer'}
        </button>
      </span>
    </form>
  )
}

function StudentRow({ student: s, trainers, modes, api, onUpdated, say }) {
  const [busy, setBusy] = useState('') // '' | 'save' | 'issue' | 'reject'

  const run = async (kind, action, extra) => {
    setBusy(kind)
    try {
      const res = await api(action, { regId: s.regId, ...extra })
      if (res.student) onUpdated(res.student)
      if (kind !== 'save') say('ok', res.message)
    } catch (err) {
      if (kind === 'save') onUpdated(s) // undo the optimistic change
      say('error', `${s.studentName}: ${err.message}`)
    } finally {
      setBusy('')
    }
  }

  const save = (patch) => {
    const next = { trainer: s.trainer, mode: s.mode, ...patch }
    onUpdated({ ...s, ...next }) // optimistic; the server's copy replaces it
    run('save', 'adminSaveStudent', next)
  }

  const issue = () => {
    if (window.confirm(`Issue the certificate for ${s.studentName}?\nIt will be emailed to ${s.email}.`)) {
      run('issue', 'adminIssue')
    }
  }
  const reject = () => {
    if (window.confirm(`Reject the certificate request from ${s.studentName}?`)) run('reject', 'adminReject')
  }

  const trainerOptions = s.trainer && !trainers.includes(s.trainer) ? [...trainers, s.trainer] : trainers

  return (
    <tr className="border-b border-ink/5 align-top last:border-0 hover:bg-paper/60">
      <td className="px-3 py-3 font-mono text-xs whitespace-nowrap text-muted">{s.regId}</td>
      <td className="px-3 py-3">
        <div className="font-semibold">{s.studentName}</div>
        <div className="text-xs text-muted">Parent: {s.parentName}</div>
        {s.message && (
          <div className="mt-1 max-w-56 truncate text-xs text-muted italic" title={s.message}>
            “{s.message}”
          </div>
        )}
      </td>
      <td className="px-3 py-3 text-xs">
        <a href={`tel:${s.mobile}`} className="block whitespace-nowrap hover:text-teal">
          {s.mobile}
        </a>
        <a href={`mailto:${s.email}`} className="block break-all text-muted hover:text-teal">
          {s.email}
        </a>
      </td>
      <td className="px-3 py-3 text-xs whitespace-nowrap">{s.dob}</td>
      <td className="px-3 py-3 text-xs whitespace-nowrap text-muted">{s.registeredAt}</td>
      <td className="px-3 py-3">
        <select
          value={s.trainer}
          onChange={(e) => save({ trainer: e.target.value })}
          disabled={busy === 'save'}
          aria-label={`Trainer for ${s.studentName}`}
          className={`${inputSm} w-40`}
        >
          <option value="">— Unassigned —</option>
          {trainerOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-3">
        <select
          value={s.mode}
          onChange={(e) => save({ mode: e.target.value })}
          disabled={busy === 'save'}
          aria-label={`Mode of training for ${s.studentName}`}
          className={`${inputSm} w-32`}
        >
          <option value="">— Not set —</option>
          {modes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-3">
        <StatusBadge status={s.certStatus} />
        {s.certStatus === STATUS.REQUESTED && (
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={issue} disabled={!!busy} className={btn.teal}>
              {busy === 'issue' ? 'Issuing…' : 'Issue'}
            </button>
            <button type="button" onClick={reject} disabled={!!busy} className={btn.reject}>
              {busy === 'reject' ? 'Rejecting…' : 'Reject'}
            </button>
          </div>
        )}
        {busy === 'issue' && <p className="mt-1 text-[0.7rem] text-muted">Takes about 20 seconds…</p>}
      </td>
      <td className="px-3 py-3 text-xs">
        {s.certUrl ? (
          <a href={s.certUrl} target="_blank" rel="noreferrer" className="font-semibold text-teal underline-offset-2 hover:underline">
            Open in Drive ↗
          </a>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td className="px-3 py-3 text-xs whitespace-nowrap">{s.certDate || <span className="text-muted">—</span>}</td>
    </tr>
  )
}

function StatusBadge({ status }) {
  const tone = {
    [STATUS.NONE]: 'bg-ink/5 text-muted',
    [STATUS.REQUESTED]: 'bg-gold-soft text-ink',
    [STATUS.ISSUED]: 'bg-teal-soft text-teal-deep',
    [STATUS.REJECTED]: 'bg-red-50 text-red-800',
  }[status]
  return (
    <span className={`inline-block px-2 py-1 text-[0.7rem] font-semibold whitespace-nowrap ${tone || 'bg-ink/5 text-muted'}`}>
      {status}
    </span>
  )
}

const inputSm =
  'border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20 disabled:opacity-60'

const btnBase =
  'px-3 py-2 text-xs font-semibold tracking-wide whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-wait disabled:opacity-60'
const btn = {
  ink: `${btnBase} bg-ink text-paper hover:bg-ink-soft`,
  outline: `${btnBase} border border-ink/30 text-ink hover:bg-ink hover:text-paper`,
  teal: `${btnBase} bg-teal text-paper hover:bg-teal-deep`,
  reject: `${btnBase} border border-red-700/50 text-red-800 hover:bg-red-50`,
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
)
