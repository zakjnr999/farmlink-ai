import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import type { RegisterInput } from '../api/types';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register, user, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterInput>({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    role: 'FARMER',
  });
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await register({
        ...form,
        email: form.email?.trim() || undefined,
      });
      navigate('/');
    } catch {
      /* error in context */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page narrow">
      <h1>Create account</h1>
      <p className="muted">Register as a farmer or buyer.</p>
      <form className="card stack" onSubmit={onSubmit}>
        <label>
          Full name
          <input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
        </label>
        <label>
          Phone number
          <input
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            required
          />
        </label>
        <label>
          Email (optional)
          <input
            type="email"
            value={form.email ?? ''}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength={8}
            required
          />
        </label>
        <fieldset className="role-fieldset">
          <legend>Account type</legend>
          <label className="inline">
            <input
              type="radio"
              name="role"
              checked={form.role === 'FARMER'}
              onChange={() => setForm({ ...form, role: 'FARMER' })}
            />
            Farmer
          </label>
          <label className="inline">
            <input
              type="radio"
              name="role"
              checked={form.role === 'BUYER'}
              onChange={() => setForm({ ...form, role: 'BUYER' })}
            />
            Buyer
          </label>
        </fieldset>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Register'}
        </button>
      </form>
      <p className="muted center">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
