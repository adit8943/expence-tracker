import { useCallback, useEffect, useState } from 'react';
import api from '../api';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionRows from '../components/transactions/TransactionRows';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]); const [categories, setCategories] = useState([]); const [editing, setEditing] = useState(null); const [page, setPage] = useState(1); const [pages, setPages] = useState(1); const [notice, setNotice] = useState(''); const [filters, setFilters] = useState({ search: '', type: '', category: '', startDate: '', endDate: '' });
  const load = useCallback(async () => { const { data } = await api.get('/transactions', { params: { page, ...filters } }); setTransactions(data.transactions); setPages(data.pagination.pages || 1); }, [page, filters]);
  const loadCategories = () => api.get('/transactions/categories').then(({ data }) => setCategories(data.categories));
  useEffect(() => { load().catch(() => setNotice('Could not load transactions.')); }, [load]); useEffect(() => { loadCategories(); }, []);
  const filter = (field) => (event) => { setPage(1); setFilters({ ...filters, [field]: event.target.value }); };
  const saved = (message) => { setNotice(message); setEditing(null); load(); loadCategories(); };
  const remove = async (id) => { if (!window.confirm('Delete this transaction?')) return; try { await api.delete(`/transactions/${id}`); setNotice('Transaction deleted.'); load(); } catch { setNotice('Could not delete transaction.'); } };
  return <><header><p className="eyebrow">MONEY LOG</p><h1>Transactions</h1></header><div className="transactions-layout"><TransactionForm editing={editing} categories={categories} onSaved={saved} onCancel={() => setEditing(null)} /><section className="panel list-panel"><div className="list-head"><h2>All transactions</h2><div className="filters"><input placeholder="Search title" value={filters.search} onChange={filter('search')} /><select value={filters.type} onChange={filter('type')}><option value="">All types</option><option value="income">Income</option><option value="expense">Expenses</option></select><select value={filters.category} onChange={filter('category')}><option value="">All categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select><input type="date" title="Start date" value={filters.startDate} onChange={filter('startDate')} /><input type="date" title="End date" value={filters.endDate} onChange={filter('endDate')} /></div></div>{notice && <p className="notice">{notice}</p>}<TransactionRows transactions={transactions} onEdit={setEditing} onDelete={remove} /><div className="pagination"><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button></div></section></div></>;
}
