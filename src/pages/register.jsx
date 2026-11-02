import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { ErrorNote, Field, FormPage, Honeypot, SubmitButton, SuccessPanel } from '../components/forms/formKit'
import { PHONE_PATTERN, useSheetForm } from '../components/forms/sheetForm'

const initial = { studentName: '', parentName: '', mobile: '', email: '', dob: '', message: '', website: '' }
const today = new Date().toISOString().slice(0, 10)

function RegisterPage() {
  const { values, status, onChange, onSubmit, reset } = useSheetForm('register', initial)

  return (
    <FormPage
      eyebrow="Student registration"
      title="Register for Vedic Maths classes"
      intro="Fill in the details below and our team will get in touch with you shortly."
    >
      {status.state === 'success' ? (
        <SuccessPanel
          title="Registration received!"
          message={status.message}
          actionLabel="Register another student"
          onAction={reset}
        />
      ) : (
        <form onSubmit={onSubmit} className="relative grid gap-5 sm:grid-cols-2">
          <Honeypot value={values.website} onChange={onChange} />
          <Field
            label="Student name"
            name="studentName"
            value={values.studentName}
            onChange={onChange}
            required
            autoComplete="off"
            maxLength={80}
            className="sm:col-span-2"
          />
          <Field
            label="Parent name"
            name="parentName"
            value={values.parentName}
            onChange={onChange}
            required
            autoComplete="name"
            maxLength={80}
            className="sm:col-span-2"
          />
          <Field
            label="Parent / student mobile"
            name="mobile"
            type="tel"
            inputMode="tel"
            value={values.mobile}
            onChange={onChange}
            required
            autoComplete="tel"
            pattern={PHONE_PATTERN}
            title="Enter a valid 10-digit mobile number"
            placeholder="98765 43210"
          />
          <Field
            label="Student date of birth"
            name="dob"
            type="date"
            value={values.dob}
            onChange={onChange}
            required
            max={today}
          />
          <Field
            label="Parent / student email"
            name="email"
            type="email"
            value={values.email}
            onChange={onChange}
            required
            autoComplete="email"
            placeholder="name@example.com"
            className="sm:col-span-2"
          />
          <Field
            label="Message"
            name="message"
            as="textarea"
            value={values.message}
            onChange={onChange}
            maxLength={1000}
            placeholder="Student's grade, preferred timings, or anything you'd like us to know"
            className="sm:col-span-2"
          />
          <div className="grid gap-4 sm:col-span-2">
            <ErrorNote message={status.state === 'error' ? status.message : ''} />
            <SubmitButton sending={status.state === 'sending'}>Submit registration</SubmitButton>
          </div>
        </form>
      )}
    </FormPage>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RegisterPage />
  </StrictMode>,
)
