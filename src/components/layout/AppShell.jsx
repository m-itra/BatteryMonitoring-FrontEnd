import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { translateRole } from "../../utils/labels";

function AppShell() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Основная навигация">
        <NavLink className="brand" to="/">
          <span className="brand-mark" aria-hidden="true">
            BM
          </span>
          <span>
            <strong>Мониторинг батареи</strong>
            <small>Панель аналитики</small>
          </span>
        </NavLink>

        <nav className="nav-list">
          <NavLink to="/" end>
            Обзор
          </NavLink>
          <NavLink to="/profile">Профиль</NavLink>
          {user?.role === "admin" && <NavLink to="/admin">Админ</NavLink>}
        </nav>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Вы вошли как</span>
            <p>{user?.name || user?.email}</p>
          </div>
          <span className="role-pill">{translateRole(user?.role || "user")}</span>
        </header>

        <main className="page-frame">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
