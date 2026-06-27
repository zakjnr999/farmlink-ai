import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login, user, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('farmer@farmlink.local');
  const [password, setPassword] = useState('FarmerPassword123!');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await login({ identifier, password });
      navigate('/');
    } catch {
      /* error in context */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page narrow">
      <h1>Sign in</h1>
      <p className="muted">Use your email or phone number and password.</p>
      <form className="card stack" onSubmit={onSubmit}>
        <label>
          Email or phone
          <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="muted center">
        No account? <Link to="/register">Register</Link>
      </p>
      <details className="card">
        <summary>Demo credentials</summary>
        <ul className="demo-list">
          <li>Farmer: farmer@farmlink.local / FarmerPassword123!</li>
          <li>Buyer: buyer@farmlink.local / BuyerPassword123!</li>
          <li>Admin: admin@farmlink.local / AdminPassword123!</li>
        </ul>
      </details>
    </div>
  );
}
