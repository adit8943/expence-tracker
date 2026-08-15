import { useState } from 'react';
import { Wallet } from 'lucide-react';
import api from '../../api';

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login'); const [form, setForm] = useState({ name: '', email: '', password: '' }); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { const { data } = await api.post(`/auth/${mode}`, form); onAuthenticated(data); } catch (err) { setError(err.response?.data?.message || 'Unable to continue.'); } finally { setBusy(false); } };
  return <main className="auth"><section className="auth-card"><div className="brand"><Wallet /> Spendwise</div><h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1><p>Know where every rupee goes.</p><form onSubmit={submit}>{mode === 'register' && <label>Name<input required minLength="2" value={form.name} onChange={update('name')} placeholder="Your name" /></label>}<label>Email<input required type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" /></label><label>Password<input required minLength="6" type="password" value={form.password} onChange={update('password')} placeholder="At least 6 characters" /></label>{error && <p className="error">{error}</p>}<button className="primary" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button></form><button className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button></section></main>;
}
