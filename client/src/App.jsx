import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { Edit3, LayoutDashboard, LogOut, Plus, ReceiptText, Settings, Trash2, Wallet } from 'lucide-react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from './api';
import './App.css';

const money = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
const categoryDefaults = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment'],
};
const newTransaction = () => ({ title: '', amount: '', type: 'expense', category: 'Food', date: new Date().toISOString().slice(0, 10), notes: '' });

function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const { data } = await api.post(`/auth/${mode}`, form);
      onAuthenticated(data);
    } catch (err) { setError(err.response?.data?.message || 'Unable to continue.'); }
    finally { setBusy(false); }
  };

  return <main className="auth"><section className="auth-card">
    <div className="brand"><Wallet /> Spendwise</div>
    <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
    <p>Know where every rupee goes.</p>
    <form onSubmit={submit}>
      {mode === 'register' && <label>Name<input required minLength="2" value={form.name} onChange={update('name')} placeholder="Your name" /></label>}
      <label>Email<input required type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" /></label>
      <label>Password<input required minLength="6" type="password" value={form.password} onChange={update('password')} placeholder="At least 6 characters" /></label>
      {error && <p className="error">{error}</p>}
      <button className="primary" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
    </form>
    <button className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
      {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}
    </button>
  </section></main>;
}

function TransactionRows({ transactions, onEdit, onDelete }) {
  if (!transactions.length) return <p className="empty">No transactions found.</p>;
  return <div className="transaction-list">{transactions.map((transaction) => <div className="transaction" key={transaction._id}>
    <i className={`dot ${transaction.type}`} />
    <div><strong>{transaction.title}</strong><small>{transaction.category} · {new Date(transaction.date).toLocaleDateString()}</small></div>
    <b className={transaction.type}>{transaction.type === 'income' ? '+' : '-'}{money(transaction.amount)}</b>
    {(onEdit || onDelete) && <div className="row-actions">
      {onEdit && <button className="icon" title="Edit transaction" onClick={() => onEdit(transaction)}><Edit3 size={16} /></button>}
      {onDelete && <button className="icon danger" title="Delete transaction" onClick={() => onDelete(transaction._id)}><Trash2 size={16} /></button>}
    </div>}
  </div>)}</div>;
}

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([api.get('/transactions/summary'), api.get('/transactions?limit=5')])
      .then(([summaryResult, transactionsResult]) => { setSummary(summaryResult.data); setRecent(transactionsResult.data.transactions); })
      .catch(() => setError('Could not load your dashboard. Please refresh.'));
  }, []);
  if (error) return <p className="error">{error}</p>;
  if (!summary) return <p className="muted">Loading dashboard…</p>;
  const monthly = Object.values(summary.monthly.reduce((result, item) => {
    if (!result[item._id.month]) result[item._id.month] = { month: item._id.month, income: 0, expense: 0 };
    result[item._id.month][item._id.type] = item.total;
    return result;
  }, {}));
  const colors = ['#4c6fff', '#e46e54', '#f3b544', '#2e9b69', '#8368d9'];
  return <><header><p className="eyebrow">OVERVIEW</p><h1>Your money, at a glance</h1></header>
    <div className="cards">{[
      ['Total balance', summary.totals.balance, 'balance'], ['Total income', summary.totals.income, 'income'], ['Total expenses', summary.totals.expense, 'expense'],
    ].map(([label, value, kind]) => <article className="stat" key={label}><span>{label}</span><strong className={kind}>{money(value)}</strong></article>)}</div>
    <div className="grid"><section className="panel chart-panel"><h2>Monthly cash flow</h2><ResponsiveContainer width="100%" height={260}><BarChart data={monthly}><XAxis dataKey="month" /><YAxis /><Tooltip formatter={money} /><Bar dataKey="income" fill="#2e9b69" radius={[5, 5, 0, 0]} /><Bar dataKey="expense" fill="#e46e54" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></section>
      <section className="panel chart-panel"><h2>Expense categories</h2>{summary.byCategory.length ? <ResponsiveContainer width="100%" height={260}><PieChart><Pie data={summary.byCategory} dataKey="total" nameKey="_id" outerRadius={88}>{summary.byCategory.map((item, index) => <Cell key={item._id} fill={colors[index % colors.length]} />)}</Pie><Tooltip formatter={money} /></PieChart></ResponsiveContainer> : <p className="empty">Add an expense to view category data.</p>}</section></div>
    <section className="panel"><h2>Recent transactions</h2><TransactionRows transactions={recent} /></section>
  </>;
}

function TransactionForm({ editing, categories, onSaved, onCancel }) {
  const [form, setForm] = useState(editing ? { ...editing, amount: String(editing.amount), date: editing.date.slice(0, 10) } : newTransaction());
  const [error, setError] = useState('');
  useEffect(() => setForm(editing ? { ...editing, amount: String(editing.amount), date: editing.date.slice(0, 10) } : newTransaction()), [editing]);
  const options = useMemo(() => [...new Set([...categoryDefaults[form.type], ...categories])], [form.type, categories]);
  const change = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  const save = async (event) => {
    event.preventDefault(); setError('');
    const payload = { ...form, amount: Number(form.amount) };
    try {
      if (editing) await api.patch(`/transactions/${editing._id}`, payload);
      else await api.post('/transactions', payload);
      onSaved(editing ? 'Transaction updated.' : 'Transaction added.');
    }
    catch (err) { setError(err.response?.data?.message || 'Could not save transaction.'); }
  };
  return <section className="panel form-panel"><h2>{editing ? <><Edit3 size={18} /> Edit transaction</> : <><Plus size={18} /> Add transaction</>}</h2>
    <form onSubmit={save}>
      <label>Type<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value, category: categoryDefaults[event.target.value][0] })}><option value="expense">Expense</option><option value="income">Income</option></select></label>
      <label>Title<input required value={form.title} onChange={change('title')} placeholder="e.g. Grocery shopping" /></label>
      <div className="two"><label>Amount<input required min="0.01" step="0.01" type="number" value={form.amount} onChange={change('amount')} /></label><label>Date<input required type="date" value={form.date} onChange={change('date')} /></label></div>
      <label>Category<input required list="category-options" value={form.category} onChange={change('category')} /><datalist id="category-options">{options.map((category) => <option key={category} value={category} />)}</datalist></label>
      <label>Notes <span>(optional)</span><textarea value={form.notes || ''} onChange={change('notes')} /></label>
      {error && <p className="error">{error}</p>}<button className="primary">{editing ? 'Update transaction' : 'Save transaction'}</button>
      {editing && <button type="button" className="secondary" onClick={onCancel}>Cancel edit</button>}
    </form>
  </section>;
}

function Transactions() {
  const [transactions, setTransactions] = useState([]); const [categories, setCategories] = useState([]); const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1); const [pages, setPages] = useState(1); const [notice, setNotice] = useState('');
  const [filters, setFilters] = useState({ search: '', type: '', category: '', startDate: '', endDate: '' });
  const load = useCallback(async () => { const { data } = await api.get('/transactions', { params: { page, ...filters } }); setTransactions(data.transactions); setPages(data.pagination.pages || 1); }, [page, filters]);
  const loadCategories = () => api.get('/transactions/categories').then(({ data }) => setCategories(data.categories));
  useEffect(() => { load().catch(() => setNotice('Could not load transactions.')); }, [load]); useEffect(() => { loadCategories(); }, []);
  const filter = (field) => (event) => { setPage(1); setFilters({ ...filters, [field]: event.target.value }); };
  const saved = (message) => { setNotice(message); setEditing(null); load(); loadCategories(); };
  const remove = async (id) => { if (!window.confirm('Delete this transaction?')) return; try { await api.delete(`/transactions/${id}`); setNotice('Transaction deleted.'); load(); } catch { setNotice('Could not delete transaction.'); } };
  return <><header><p className="eyebrow">MONEY LOG</p><h1>Transactions</h1></header><div className="transactions-layout">
    <TransactionForm editing={editing} categories={categories} onSaved={saved} onCancel={() => setEditing(null)} />
    <section className="panel list-panel"><div className="list-head"><h2>All transactions</h2><div className="filters">
      <input placeholder="Search title" value={filters.search} onChange={filter('search')} /><select value={filters.type} onChange={filter('type')}><option value="">All types</option><option value="income">Income</option><option value="expense">Expenses</option></select>
      <select value={filters.category} onChange={filter('category')}><option value="">All categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select>
      <input type="date" title="Start date" value={filters.startDate} onChange={filter('startDate')} /><input type="date" title="End date" value={filters.endDate} onChange={filter('endDate')} />
    </div></div>{notice && <p className="notice">{notice}</p>}<TransactionRows transactions={transactions} onEdit={setEditing} onDelete={remove} />
      <div className="pagination"><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button></div>
    </section></div></>;
}

function SettingsPage({ user, onUserUpdated }) {
  const [form, setForm] = useState(user); const [notice, setNotice] = useState('');
  const save = async (event) => { event.preventDefault(); try { const { data } = await api.patch('/auth/me', form); onUserUpdated(data.user); setNotice('Profile saved.'); } catch (err) { setNotice(err.response?.data?.message || 'Could not save profile.'); } };
  return <><header><p className="eyebrow">ACCOUNT</p><h1>Settings</h1></header><section className="panel settings"><h2>Profile</h2><form onSubmit={save}><label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><button className="primary">Save changes</button></form>{notice && <p className="notice">{notice}</p>}</section></>;
}

function AppLayout({ session, onLogout, onUserUpdated }) { return <div className="shell"><aside><div className="brand"><Wallet /> Spendwise</div><nav><NavLink to="/"><LayoutDashboard /> Dashboard</NavLink><NavLink to="/transactions"><ReceiptText /> Transactions</NavLink><NavLink to="/settings"><Settings /> Settings</NavLink></nav><div className="sidebar-footer"><span>{session.user.name}</span><button onClick={onLogout}><LogOut /> Sign out</button></div></aside><main className="content"><Routes><Route path="/" element={<Dashboard />} /><Route path="/transactions" element={<Transactions />} /><Route path="/settings" element={<SettingsPage user={session.user} onUserUpdated={onUserUpdated} />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></main></div>; }

export default function App() {
  const navigate = useNavigate(); const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('expense_tracker_session') || 'null'));
  const saveSession = (data) => { localStorage.setItem('expense_tracker_token', data.token); localStorage.setItem('expense_tracker_session', JSON.stringify(data)); setSession(data); navigate('/'); };
  const updateUser = (user) => { const next = { ...session, user }; localStorage.setItem('expense_tracker_session', JSON.stringify(next)); setSession(next); };
  const logout = () => { localStorage.removeItem('expense_tracker_token'); localStorage.removeItem('expense_tracker_session'); setSession(null); navigate('/'); };
  return session ? <AppLayout session={session} onLogout={logout} onUserUpdated={updateUser} /> : <AuthPage onAuthenticated={saveSession} />;
}
