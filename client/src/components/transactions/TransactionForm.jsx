import { useEffect, useMemo, useState } from 'react';
import { Edit3, Plus } from 'lucide-react';
import api from '../../api';
import { categoryDefaults, createEmptyTransaction } from '../../constants/categories';

export default function TransactionForm({ editing, categories, onSaved, onCancel }) {
  const [form, setForm] = useState(() => editing ? { ...editing, amount: String(editing.amount), date: editing.date.slice(0, 10) } : createEmptyTransaction());
  const [error, setError] = useState('');
  useEffect(() => {
    setForm(editing ? { ...editing, amount: String(editing.amount), date: editing.date.slice(0, 10) } : createEmptyTransaction());
  }, [editing]);
  const options = useMemo(() => [...new Set([...categoryDefaults[form.type], ...categories])], [form.type, categories]);
  const change = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  const save = async (event) => { event.preventDefault(); setError(''); const payload = { ...form, amount: Number(form.amount) }; try { if (editing) await api.patch(`/transactions/${editing._id}`, payload); else await api.post('/transactions', payload); onSaved(editing ? 'Transaction updated.' : 'Transaction added.'); } catch (err) { setError(err.response?.data?.message || 'Could not save transaction.'); } };
  return <section className="panel form-panel"><h2>{editing ? <><Edit3 size={18} /> Edit transaction</> : <><Plus size={18} /> Add transaction</>}</h2><form onSubmit={save}>
    <label>Type<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value, category: categoryDefaults[event.target.value][0] })}><option value="expense">Expense</option><option value="income">Income</option></select></label>
    <label>Title<input required value={form.title} onChange={change('title')} placeholder="e.g. Grocery shopping" /></label><div className="two"><label>Amount<input required min="0.01" step="0.01" type="number" value={form.amount} onChange={change('amount')} /></label><label>Date<input required type="date" value={form.date} onChange={change('date')} /></label></div>
    <label>Category<input required list="category-options" value={form.category} onChange={change('category')} /><datalist id="category-options">{options.map((category) => <option key={category} value={category} />)}</datalist></label><label>Notes <span>(optional)</span><textarea value={form.notes || ''} onChange={change('notes')} /></label>
    {error && <p className="error">{error}</p>}<button className="primary">{editing ? 'Update transaction' : 'Save transaction'}</button>{editing && <button type="button" className="secondary" onClick={onCancel}>Cancel edit</button>}
  </form></section>;
}
