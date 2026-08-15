import { useState } from 'react';
import api from '../api';

export default function SettingsPage({ user, onUserUpdated }) {
  const [form, setForm] = useState(user); const [notice, setNotice] = useState('');
  const save = async (event) => { event.preventDefault(); try { const { data } = await api.patch('/auth/me', form); onUserUpdated(data.user); setNotice('Profile saved.'); } catch (err) { setNotice(err.response?.data?.message || 'Could not save profile.'); } };
  return <><header><p className="eyebrow">ACCOUNT</p><h1>Settings</h1></header><section className="panel settings"><h2>Profile</h2><form onSubmit={save}><label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><button className="primary">Save changes</button></form>{notice && <p className="notice">{notice}</p>}</section></>;
}
