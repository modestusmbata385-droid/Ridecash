import React, { useState } from 'react';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) return <LoginPage onLoggedIn={setUser} />;
  return <Dashboard user={user} onLogout={() => setUser(null)} />;
}
