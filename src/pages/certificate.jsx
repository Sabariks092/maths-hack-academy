import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { ErrorNote, Field, FormPage, Honeypot, SubmitButton, SuccessPanel } from '../components/forms/formKit'
import { PHONE_PATTERN, useSheetForm } from '../components/forms/sheetForm'

const initial = { studentName: '', email: '', mobile: '', website: '' }

function CertificatePage() {
  const { values, status, onChange, onSubmit, reset } = useSheetForm('certificate', initial)

  return (
    <FormPage
      eyebrow="Course completion"
      title="Get your course certificate"
      intro="Use the same student name, email and mobile number you registered with. Your certificate will be emailed to you."
    >
      {status.state === 'success' ? (
        <SuccessPanel
          title="Certificate on its way!"
          message={status.message}
          actionLabel="Back to the form"
          onAction={reset}
        />
      ) : (
        <form onSubmit={onSubmit} className="relative grid gap-5">
          <Honeypot value={values.website} onChange={onChange} />
          <Field
            label="Student name"
            name="studentName"
            value={values.studentName}
            onChange={onChange}
            required
            autoComplete="off"
            maxLength={80}
            hint="This is how the name will appear on the certificate."
          />
          <Field
            label="Student / parent email"
            name="email"
            type="email"
            value={values.email}
            onChange={onChange}
            required
            autoComplete="email"
            placeholder="name@example.com"
          />
          <Field
            label="Student / parent mobile"
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
          <ErrorNote message={status.state === 'error' ? status.message : ''} />
          <SubmitButton sending={status.state === 'sending'}>Get my certificate</SubmitButton>
        </form>
      )}
    </FormPage>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CertificatePage />
  </StrictMode>,
)
