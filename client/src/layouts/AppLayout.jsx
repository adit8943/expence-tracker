import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { LayoutDashboard, LogOut, ReceiptText, Settings, Wallet } from 'lucide-react';
import DashboardPage from '../pages/DashboardPage';
import TransactionsPage from '../pages/TransactionsPage';
import SettingsPage from '../pages/SettingsPage';

export default function AppLayout({ session, onLogout, onUserUpdated }) {
  return <div className="shell"><aside><div className="brand"><Wallet /> Spendwise</div><nav><NavLink to="/"><LayoutDashboard /> Dashboard</NavLink><NavLink to="/transactions"><ReceiptText /> Transactions</NavLink><NavLink to="/settings"><Settings /> Settings</NavLink></nav><div className="sidebar-footer"><span>{session.user.name}</span><button onClick={onLogout}><LogOut /> Sign out</button></div></aside><main className="content"><Routes><Route path="/" element={<DashboardPage />} /><Route path="/transactions" element={<TransactionsPage />} /><Route path="/settings" element={<SettingsPage user={session.user} onUserUpdated={onUserUpdated} />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></main></div>;
}
