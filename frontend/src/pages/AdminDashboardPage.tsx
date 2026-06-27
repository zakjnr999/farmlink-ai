import { useEffect, useState } from 'react';
import { FarmLinkApiError } from '../api/client';
import { api } from '../lib/api';
import type { AdminDashboard } from '../types/extra';

export function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [users, setUsers] = useState<unknown[]>([]);
  const [listings, setListings] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [dashRes, usersRes, listingsRes] = await Promise.all([
          api.call<AdminDashboard>('GET', '/admin/dashboard'),
          api.call<{ users: unknown[] }>('GET', '/admin/users', undefined, { page: 1, limit: 5 }),
          api.call<{ listings: unknown[] }>('GET', '/admin/listings', undefined, {
            page: 1,
            limit: 5,
          }),
        ]);
        setDashboard(dashRes.data);
        setUsers(usersRes.data.users);
        setListings(listingsRes.data.listings);
      } catch (err) {
        setError(err instanceof FarmLinkApiError ? err.message : 'Could not load admin data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="page"><p className="muted">Loading dashboard…</p></div>;
  if (error) return <div className="page"><p className="error">{error}</p></div>;
  if (!dashboard) return null;

  return (
    <div className="page">
      <h1>Admin dashboard</h1>
      <p className="muted">Platform overview and recent activity.</p>
      <div className="stats-grid">
        <div className="stat-card">
          <span>Users</span>
          <strong>{dashboard.users.total}</strong>
          <small>
            {dashboard.users.farmers} farmers · {dashboard.users.buyers} buyers
          </small>
        </div>
        <div className="stat-card">
          <span>Listings</span>
          <strong>{dashboard.listings.active ?? dashboard.listings.total ?? 0}</strong>
          <small>{dashboard.listings.published ?? 'active'} published</small>
        </div>
        <div className="stat-card">
          <span>Offers</span>
          <strong>{(dashboard.offers.pending ?? 0) + (dashboard.offers.accepted ?? 0)}</strong>
          <small>{dashboard.offers.pending ?? 0} pending</small>
        </div>
        <div className="stat-card">
          <span>Transactions</span>
          <strong>{dashboard.transactions.total}</strong>
          <small>{dashboard.transactions.completed} completed</small>
        </div>
      </div>
      <div className="grid-2">
        <section className="card">
          <h2>Recent users</h2>
          <pre className="code-block">{JSON.stringify(users, null, 2)}</pre>
        </section>
        <section className="card">
          <h2>Recent listings</h2>
          <pre className="code-block">{JSON.stringify(listings, null, 2)}</pre>
        </section>
      </div>
    </div>
  );
}
