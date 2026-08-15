import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthPage from './components/auth/AuthPage';
import AppLayout from './layouts/AppLayout';
import './App.css';

export default function App() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('expense_tracker_session') || 'null'));

  const saveSession = (data) => {
    localStorage.setItem('expense_tracker_token', data.token);
    localStorage.setItem('expense_tracker_session', JSON.stringify(data));
    setSession(data);
    navigate('/');
  };
  const updateUser = (user) => {
    const next = { ...session, user };
    localStorage.setItem('expense_tracker_session', JSON.stringify(next));
    setSession(next);
  };
  const logout = () => {
    localStorage.removeItem('expense_tracker_token');
    localStorage.removeItem('expense_tracker_session');
    setSession(null);
    navigate('/');
  };

  return session
    ? <AppLayout session={session} onLogout={logout} onUserUpdated={updateUser} />
    : <AuthPage onAuthenticated={saveSession} />;
}
