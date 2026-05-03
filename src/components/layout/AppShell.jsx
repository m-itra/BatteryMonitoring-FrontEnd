import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function AppShell() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <NavLink className="brand" to="/">
          <span className="brand-mark" aria-hidden="true">
            BM
          </span>
          <span>
            <strong>Battery Monitoring</strong>
            <small>Analytics console</small>
          </span>
        </NavLink>

        <nav className="nav-list">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/profile">Profile</NavLink>
          {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
        </nav>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Signed in</span>
            <p>{user?.name || user?.email}</p>
          </div>
          <span className="role-pill">{user?.role || "user"}</span>
        </header>

        <main className="page-frame">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
