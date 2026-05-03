import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MetricCard from "../components/ui/MetricCard";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../utils/errors";
import { formatValue } from "../utils/format";

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
      setError(getErrorMessage(logoutError, "Could not log out."));
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm("Delete your account and related battery data?")) {
      return;
    }

    setError("");
    try {
      await auth.deleteAccount();
      navigate("/auth", { replace: true });
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Could not delete your account."));
    }
  }

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Account</span>
          <h1>Profile</h1>
          <p>Your authenticated user data restored from /api/auth/me.</p>
        </div>
      </header>

      {error && <div className="notice notice-error">{error}</div>}

      <section className="metric-grid">
        <MetricCard label="Name" value={auth.user?.name} />
        <MetricCard label="Email" value={auth.user?.email} />
        <MetricCard label="Role" value={formatValue(auth.user?.role)} />
        <MetricCard label="User id" value={auth.user?.user_id} />
      </section>

      <section className="section-block danger-zone">
        <div className="section-heading">
          <div>
            <h2>Session and account</h2>
            <p>Logout clears the cookie session. Delete account removes your profile on the backend.</p>
          </div>
        </div>
        <div className="button-row">
          <button
            className="button"
            disabled={auth.logoutStatus.isPending}
            type="button"
            onClick={handleLogout}
          >
            {auth.logoutStatus.isPending ? "Logging out..." : "Logout"}
          </button>
          <button
            className="button button-danger"
            disabled={auth.deleteAccountStatus.isPending}
            type="button"
            onClick={handleDeleteAccount}
          >
            {auth.deleteAccountStatus.isPending ? "Deleting..." : "Delete account"}
          </button>
        </div>
      </section>
    </section>
  );
}

export default ProfilePage;
