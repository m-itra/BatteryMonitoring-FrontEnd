import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MetricCard from "../components/ui/MetricCard";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../utils/errors";
import { translateRole } from "../utils/labels";

function ProfilePage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleLogout() {
    setError("");
    try {
      await auth.logout();
      navigate("/auth", { replace: true });
    } catch (logoutError) {
      setError(getErrorMessage(logoutError, "Не удалось выйти."));
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm("Удалить ваш аккаунт и связанные данные батарей?")) {
      return;
    }

    setError("");
    try {
      await auth.deleteAccount();
      navigate("/auth", { replace: true });
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Не удалось удалить аккаунт."));
    }
  }

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Аккаунт</span>
          <h1>Профиль</h1>
          <p>Данные пользователя восстановлены через /api/auth/me.</p>
        </div>
      </header>

      {error && <div className="notice notice-error">{error}</div>}

      <section className="metric-grid">
        <MetricCard label="Имя" value={auth.user?.name} />
        <MetricCard label="Email" value={auth.user?.email} />
        <MetricCard label="Роль" value={translateRole(auth.user?.role)} />
        <MetricCard label="ID пользователя" value={auth.user?.user_id} />
      </section>

      <section className="section-block danger-zone">
        <div className="section-heading">
          <div>
            <h2>Сессия и аккаунт</h2>
            <p>Выход очищает cookie-сессию. Удаление аккаунта удаляет профиль на сервере.</p>
          </div>
        </div>
        <div className="button-row">
          <button
            className="button"
            disabled={auth.logoutStatus.isPending}
            type="button"
            onClick={handleLogout}
          >
            {auth.logoutStatus.isPending ? "Выходим..." : "Выйти"}
          </button>
          <button
            className="button button-danger"
            disabled={auth.deleteAccountStatus.isPending}
            type="button"
            onClick={handleDeleteAccount}
          >
            {auth.deleteAccountStatus.isPending ? "Удаляем..." : "Удалить аккаунт"}
          </button>
        </div>
      </section>
    </section>
  );
}

export default ProfilePage;
