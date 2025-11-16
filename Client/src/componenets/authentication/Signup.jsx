import React, { useEffect, useState } from "react";
import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiEye, FiEyeOff, FiLock, FiMail, FiUser } from "react-icons/fi";
import Header from "../resume/Header";
import Footer from "../resume/Footer";

const highlights = [
  "Tailored resume feedback powered by AI",
  "Mock interviews with recruiter personas",
  "Performance tracking across all attempts"
];

export default function Signup() {
  const [form, setForm] = useState({ fullname: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [token , setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const navigate = useNavigate();
  function validatePassword(pw) {
    const checks = {
      length: pw.length >= 8,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      number: /[0-9]/.test(pw),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
    }; return { ok: Object.values(checks).every(Boolean), checks };
  }

  const pwResult = validatePassword(form.password);
  const passwordsMatch = form.password && form.password === form.confirm;
  const canSubmit = form.fullname.trim() && form.email.trim() && pwResult.ok && passwordsMatch;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // live field-level checks
    if (name === "password") {
      const res = validatePassword(value);
      setErrors((prev) => ({
        ...prev,
        password: res.ok ? "" : "Password does not meet requirements",
      }));
    }
    if (name === "confirm") {
      setErrors((prev) => ({
        ...prev,
        confirm: value === form.password ? "" : "Passwords do not match",
      }));
    }
    if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Invalid email format",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);

    const res = validatePassword(form.password);
    const newErrors = {};

    if (!form.fullname.trim()) newErrors.fullname = "Full name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!res.ok) newErrors.password = "Password does not meet requirements";
    if (!passwordsMatch) newErrors.confirm = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5197/api/User/Register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: form.fullname,
          email: form.email,
          password: form.password,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) throw new Error(payload);
      navigate("/login")
      console.log("Server Response:", payload);
      setForm({ fullname: "", email: "", password: "", confirm: "" });
      setLoading(false);
      // You might want to redirect to login or show success message
    } catch (error) {
      console.error("Error:", error);
      setSubmitError(error.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Header isLoggedIn={!!token} />
      <main className="auth-page">
        <div className="auth-card">
          <div className="auth-card__copy">
            <span className="auth-badge">Get started</span>
            <h1 className="auth-title">Create your Depi AI account</h1>
            <p className="auth-subtitle">
              Build a personalised path to your next role with insights, guidance, and interview preparation powered by AI.
            </p>
            <ul className="auth-benefits">
              {highlights.map((item) => (
                <li key={item}>
                  <FiCheckCircle />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-form__header">
              <h2>Sign up</h2>
              <p>Fill in your details to unlock the platform.</p>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-name">Full name</label>
              <div className="auth-input-wrapper">
                <FiUser className="auth-input-icon" />
                <input
                  className="auth-input"
                  type="text"
                  name="fullname"
                  id="signup-name"
                  placeholder="Enter your full name"
                  value={form.fullname}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.fullname && <div className="field-error">{errors.fullname}</div>}
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">Email address</label>
              <div className="auth-input-wrapper">
                <FiMail className="auth-input-icon" />
                <input
                  className="auth-input"
                  type="email"
                  name="email"
                  id="signup-email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            <div className="auth-field">
              <label htmlFor="signup-password">Password</label>
              <div className="auth-input-wrapper">
                <FiLock className="auth-input-icon" />
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="signup-password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  className="auth-toggle"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <div className="field-error">{errors.password}</div>}

              <div className="pw-checklist">
                <small>Password must include:</small>
                <ul>
                  <li data-valid={pwResult.checks.length}>Minimum 8 characters</li>
                  <li data-valid={pwResult.checks.upper}>Uppercase letter</li>
                  <li data-valid={pwResult.checks.lower}>Lowercase letter</li>
                  <li data-valid={pwResult.checks.number}>Number</li>
                  <li data-valid={pwResult.checks.special}>Special character</li>
                </ul>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-confirm">Confirm password</label>
              <div className="auth-input-wrapper">
                <FiLock className="auth-input-icon" />
                <input
                  className="auth-input"
                  type="password"
                  name="confirm"
                  id="signup-confirm"
                  placeholder="Re-enter your password"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.confirm && <div className="field-error">{errors.confirm}</div>}
              {!errors.confirm && form.confirm && (
                <div className="field-ok">{passwordsMatch ? "Passwords match" : "Passwords do not match"}</div>
              )}
            </div>

            {submitError && (
              <div className="auth-error">
                <p>{submitError}</p>
              </div>
            )}
            <button className="auth-submit" type="submit" disabled={!canSubmit || loading}>
              {loading ? (
                <>
                  <span className="loading-spinner-small"></span>
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
            <p className="auth-switch">
              Already have an account?
              <Link to="/login"> Log in</Link>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}