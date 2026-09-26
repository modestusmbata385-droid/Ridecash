import React, { useState } from 'react';
import { login } from './api';

export default function LoginPage({ onLoggedIn }) {
  const [phone, setPhone] = useState('255700000000');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const user = await login(phone, password);
      onLoggedIn(user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <h1>RideCash Admin</h1>
        <p className="muted">Sign in with an ADMIN account.</p>
        <label>Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
