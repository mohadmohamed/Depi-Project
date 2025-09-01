import React, { useState } from 'react'
import './login.css'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})

  function validatePassword(pw) {
    const checks = {
      length: pw.length >= 8,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      number: /[0-9]/.test(pw),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
    }
    return { ok: Object.values(checks).every(Boolean), checks }
  }

  const pwResult = validatePassword(form.password)
  const passwordsMatch = form.password && form.password === form.confirm
  const canSubmit = form.name.trim() && form.email.trim() && pwResult.ok && passwordsMatch

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    // live field-level checks
    if (name === 'password') {
      const res = validatePassword(value)
      setErrors(prev => ({ ...prev, password: res.ok ? '' : 'Password does not meet requirements' }))
    }
    if (name === 'confirm') {
      setErrors(prev => ({ ...prev, confirm: value === form.password ? '' : 'Passwords do not match' }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const res = validatePassword(form.password)
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Full name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    if (!res.ok) newErrors.password = 'Password does not meet requirements'
    if (!passwordsMatch) newErrors.confirm = 'Passwords do not match'

    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      // success: replace with actual signup call
      console.log('Signup payload', { name: form.name, email: form.email })
      alert('Client-side validation passed. Ready to submit to server.')
    }
  }

  return (
    <main id ="su-main">
    
      <form onSubmit={handleSubmit} noValidate id='signup-form'>
        <div className="card-outer">
          <div className="card-inner">
              <h1>Create Your Account</h1>
      <p>Join Us and Kickstart Your Job Search!</p>
            <div>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <div className="field-error">{errors.name}</div>}
            </div>

            <div>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && <div className="field-error">{errors.password}</div>}

              <div className="pw-checklist">
                <small>Password must include:</small>
                <ul>
                  <li style={{ color: pwResult.checks.length ? 'green' : '#312f2fff' }}>Minimum 8 characters</li>
                  <li style={{ color: pwResult.checks.upper ? 'green' : '#312f2fff'}}>Uppercase letter</li>
                  <li style={{ color: pwResult.checks.lower ? 'green' : '#312f2fff' }}>Lowercase letter</li>
                  <li style={{ color: pwResult.checks.number ? 'green' : '#312f2fff' }}>Number</li>
                  <li style={{ color: pwResult.checks.special ? 'green' : '#312f2fff' }}>Special character</li>
                </ul>
              </div>
            </div>

            <div>
              <label htmlFor="confirm">Confirm Password</label>
              <input
                type="password"
                name="confirm"
                id="confirm"
                placeholder="Confirm your password"
                value={form.confirm}
                onChange={handleChange}
              />
              {errors.confirm && <div className="field-error">{errors.confirm}</div>}
              {!errors.confirm && form.confirm && (
                <div className="field-ok">{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</div>
              )}
            </div>

            <button type="submit" id="submit" disabled={!canSubmit}>
              Sign Up
            </button>
          </div>
        </div>
      </form>

      <span id="su-span">Already have an account? <a href="./Login.jsx">Log In</a></span>
    </main>
  )
}