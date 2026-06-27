import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function roleLinks(role: string) {
  switch (role) {
    case 'FARMER':
      return [
        { to: '/farmer/profile', label: 'Profile' },
        { to: '/farmer/extract', label: 'List produce' },
        { to: '/farmer/offers', label: 'Offers' },
      ];
    case 'BUYER':
      return [
        { to: '/buyer/marketplace', label: 'Marketplace' },
        { to: '/buyer/recommendations', label: 'Recommendations' },
      ];
    case 'ADMIN':
      return [{ to: '/admin', label: 'Dashboard' }];
    default:
      return [];
  }
}

export function AppShell() {
  const { user, logout } = useAuth();
  const links = user ? roleLinks(user.role) : [];

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="brand">
          FarmLink AI
        </Link>
        {user && (
          <nav className="nav" aria-label="Main">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}
        <div className="topbar-actions">
          {user ? (
            <>
              <span className="user-chip">{user.fullName}</span>
              <button type="button" className="btn btn-ghost" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
