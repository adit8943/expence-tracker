import { Edit3, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function TransactionRows({ transactions, onEdit, onDelete }) {
  if (!transactions.length) return <p className="empty">No transactions found.</p>;
  return <div className="transaction-list">{transactions.map((transaction) => <div className="transaction" key={transaction._id}>
    <i className={`dot ${transaction.type}`} />
    <div><strong>{transaction.title}</strong><small>{transaction.category} · {new Date(transaction.date).toLocaleDateString()}</small></div>
    <b className={transaction.type}>{transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}</b>
    {(onEdit || onDelete) && <div className="row-actions">{onEdit && <button className="icon" title="Edit transaction" onClick={() => onEdit(transaction)}><Edit3 size={16} /></button>}{onDelete && <button className="icon danger" title="Delete transaction" onClick={() => onDelete(transaction._id)}><Trash2 size={16} /></button>}</div>}
  </div>)}</div>;
}
