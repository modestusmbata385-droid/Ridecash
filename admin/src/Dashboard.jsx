import React, { useEffect, useState, useCallback } from 'react';
import { api, logout } from './api';

const TABS = ['Overview', 'Drivers', 'KYC', 'Rides', 'Safety Reports', 'Commission'];

export default function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState('Overview');

  function doLogout() {
    logout();
    onLogout();
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>RideCash</h2>
        <p className="muted">Signed in as {user.name}</p>
        <nav>
          {TABS.map((t) => (
            <button key={t} className={t === tab ? 'nav-btn active' : 'nav-btn'} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </nav>
        <button className="logout-btn" onClick={doLogout}>Log out</button>
      </aside>
      <main className="content">
        {tab === 'Overview' && <Overview />}
        {tab === 'Drivers' && <Drivers />}
        {tab === 'KYC' && <Kyc />}
        {tab === 'Rides' && <Rides />}
        {tab === 'Safety Reports' && <Safety />}
        {tab === 'Commission' && <Commission />}
      </main>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/stats').then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p>Loading...</p>;

  const cards = [
    ['Total drivers', stats.totalDrivers],
    ['Pending KYC', stats.pendingKyc],
    ['Pending settlements', stats.pendingPayments],
    ['Rides today', stats.ridesToday],
    ['Active rides now', stats.activeRides],
    ['Total rides', stats.totalRides],
    ['Outstanding debt (TZS)', stats.totalOutstandingDebt],
  ];

  return (
    <div>
      <h1>Overview</h1>
      <div className="card-grid">
        {cards.map(([label, value]) => (
          <div className="stat-card" key={label}>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api('/admin/drivers').then(setDrivers).catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  async function suspend(id) {
    await api(`/admin/drivers/${id}/suspend`, { method: 'POST' });
    load();
  }
  async function activate(id) {
    await api(`/admin/drivers/${id}/activate`, { method: 'POST' });
    load();
  }

  return (
    <div>
      <h1>Drivers</h1>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr><th>Name</th><th>Phone</th><th>Status</th><th>KYC</th><th>Debt</th><th>Points</th><th>Online</th><th></th></tr>
        </thead>
        <tbody>
          {drivers.map((d) => (
            <tr key={d.id}>
              <td>{d.user.name}</td>
              <td>{d.user.phone}</td>
              <td><span className={`pill ${d.status}`}>{d.status}</span></td>
              <td><span className={`pill ${d.kycStatus}`}>{d.kycStatus}</span></td>
              <td>{d.debt}</td>
              <td>{d.points}</td>
              <td>{d.online ? 'Yes' : 'No'}</td>
              <td>
                {d.status !== 'SUSPENDED' ? (
                  <button className="danger" onClick={() => suspend(d.id)}>Suspend</button>
                ) : (
                  <button onClick={() => activate(d.id)}>Reactivate</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Kyc() {
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api('/admin/kyc?status=PENDING').then(setDocs).catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  async function approve(id) {
    await api(`/admin/kyc/${id}/approve`, { method: 'POST' });
    load();
  }
  async function reject(id) {
    await api(`/admin/kyc/${id}/reject`, { method: 'POST' });
    load();
  }

  return (
    <div>
      <h1>Pending KYC documents</h1>
      {error && <p className="error">{error}</p>}
      {docs.length === 0 && <p className="muted">Nothing pending.</p>}
      <table>
        <thead><tr><th>Driver</th><th>Phone</th><th>Type</th><th>Document</th><th></th></tr></thead>
        <tbody>
          {docs.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.driver.user.name}</td>
              <td>{doc.driver.user.phone}</td>
              <td>{doc.type}</td>
              <td><a href={doc.url} target="_blank" rel="noreferrer">View</a></td>
              <td>
                <button onClick={() => approve(doc.id)}>Approve</button>
                <button className="danger" onClick={() => reject(doc.id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Rides() {
  const [rides, setRides] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/rides').then(setRides).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h1>Rides</h1>
      {error && <p className="error">{error}</p>}
      <table>
        <thead><tr><th>Passenger</th><th>Driver</th><th>Status</th><th>Fare</th><th>Commission</th><th>Requested</th></tr></thead>
        <tbody>
          {rides.map((r) => (
            <tr key={r.id}>
              <td>{r.passenger?.name}</td>
              <td>{r.driver ? r.driver.user.name : '-'}</td>
              <td><span className={`pill ${r.status}`}>{r.status}</span></td>
              <td>{r.fare}</td>
              <td>{r.commission}</td>
              <td>{new Date(r.requestedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Safety() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/safety-reports').then(setReports).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h1>Safety reports</h1>
      {error && <p className="error">{error}</p>}
      {reports.length === 0 && <p className="muted">No reports filed.</p>}
      <table>
        <thead><tr><th>Ride</th><th>Reason</th><th>Details</th><th>Filed</th></tr></thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id}>
              <td>{r.rideId}</td>
              <td>{r.reason}</td>
              <td>{r.details || '-'}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Commission() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api('/admin/commission-payments?status=PENDING').then(setPayments).catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  async function approve(id) {
    await api(`/admin/commission-payments/${id}/approve`, { method: 'POST' });
    load();
  }
  async function reject(id) {
    await api(`/admin/commission-payments/${id}/reject`, { method: 'POST' });
    load();
  }

  return (
    <div>
      <h1>Commission settlements</h1>
      {error && <p className="error">{error}</p>}
      {payments.length === 0 && <p className="muted">Nothing pending.</p>}
      <table>
        <thead><tr><th>Driver</th><th>Phone</th><th>Amount</th><th>Reference</th><th></th></tr></thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.driver.user.name}</td>
              <td>{p.driver.user.phone}</td>
              <td>{p.amount}</td>
              <td>{p.reference || '-'}</td>
              <td>
                <button onClick={() => approve(p.id)}>Approve</button>
                <button className="danger" onClick={() => reject(p.id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
                                                                        }
