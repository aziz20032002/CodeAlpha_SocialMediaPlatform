import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/register", { name, email, password });
      setSuccess("Account created successfully.");
      window.setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <aside className="auth-showcase" aria-label="CodeAlpha Social">
        <div className="auth-showcase-mark" aria-hidden="true">CA</div>
        <div>
          <strong>CodeAlpha Social</strong>
          <h2>Build your community.</h2>
          <p>Create your account, share your work and meet new people.</p>
        </div>
        <div className="auth-orbit auth-orbit-one" aria-hidden="true" />
        <div className="auth-orbit auth-orbit-two" aria-hidden="true" />
      </aside>
      <div className="auth-card">
      <div className="auth-brand" aria-hidden="true">C</div>
      <p className="auth-eyebrow">Join the community</p>
      <h1>Create your account</h1>
      <p className="auth-intro">Join the community and start sharing.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="register-name">Name</label>
          <input autoComplete="name" disabled={loading} id="register-name" name="name" placeholder="Your name" type="text" required />
        </div>
        <div className="form-group">
          <label htmlFor="register-email">Email</label>
          <input autoComplete="email" disabled={loading} id="register-email" name="email" placeholder="you@example.com" type="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="register-password">Password</label>
          <input autoComplete="new-password" disabled={loading} id="register-password" name="password" placeholder="Create a password" type="password" required />
        </div>
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input autoComplete="new-password" disabled={loading} id="confirm-password" name="confirmPassword" placeholder="Confirm your password" type="password" required />
        </div>
        {error && <p className="form-message form-error" role="alert">{error}</p>}
        {success && <p className="form-message form-success" role="status">{success}</p>}
        <button className="button button-block" disabled={loading} type="submit">
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
      </div>
    </section>
  );
}

export default Register;
