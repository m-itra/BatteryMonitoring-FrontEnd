import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MetricCard from "../components/ui/MetricCard";
import StatusBadge from "../components/ui/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/State";
import { useAuth } from "../hooks/useAuth";
import { useAdminStats, useAdminUsers, useDeleteAdminUser } from "../hooks/useAdmin";
import { asArray } from "../utils/data";
import { getErrorMessage } from "../utils/errors";
import { formatDate, formatValue } from "../utils/format";

const statLabels = {
  users_count: "Users",
  devices_count: "Devices",
  active_sessions_count: "Active sessions",
  completed_sessions_count: "Completed sessions",
  interrupted_sessions_count: "Interrupted sessions",
  equivalent_cycles_count: "Cycles",
  excluded_cycles_count: "Excluded cycles",
};

function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const statsQuery = useAdminStats();
  const usersQuery = useAdminUsers();
  const deleteUserMutation = useDeleteAdminUser();
  const [error, setError] = useState("");

  useEffect(() => {
    const status = statsQuery.error?.response?.status || usersQuery.error?.response?.status;
    if (status === 403) {
      navigate("/", { replace: true });
    }
  }, [navigate, statsQuery.error, usersQuery.error]);

  if (statsQuery.isPending || usersQuery.isPending) {
    return <LoadingState title="Loading admin" message="Fetching system statistics and users." />;
  }

  if (statsQuery.isError) {
    return <ErrorState error={statsQuery.error} title="Admin stats unavailable" />;
  }

  if (usersQuery.isError) {
    return <ErrorState error={usersQuery.error} title="Admin users unavailable" />;
  }

  const users = asArray(usersQuery.data, ["users"]);

  async function handleDeleteUser(targetUser) {
    if (!window.confirm(`Delete ${targetUser.email} and related battery data?`)) {
      return;
    }

    setError("");
    try {
      await deleteUserMutation.mutateAsync(targetUser.user_id);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Could not delete user."));
    }
  }

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>System admin</h1>
          <p>Admin-only statistics and user management.</p>
        </div>
      </header>

      {error && <div className="notice notice-error">{error}</div>}

      <section className="metric-grid">
        {Object.entries(statLabels).map(([key, label]) => (
          <MetricCard key={key} label={label} value={statsQuery.data?.[key]} />
        ))}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Users</h2>
            <p>Deleting a user also deletes related battery data on the backend.</p>
          </div>
        </div>

        {users.length === 0 ? (
          <EmptyState title="No users" message="Registered users will appear here." />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>User id</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((account) => (
                  <tr key={account.user_id}>
                    <td>{formatValue(account.name)}</td>
                    <td>{formatValue(account.email)}</td>
                    <td>
                      <StatusBadge variant={account.role === "admin" ? "warning" : "neutral"}>
                        {formatValue(account.role)}
                      </StatusBadge>
                    </td>
                    <td>{formatDate(account.created_at)}</td>
                    <td className="mono-cell">{formatValue(account.user_id)}</td>
                    <td>
                      <button
                        className="button button-small button-danger"
                        disabled={deleteUserMutation.isPending || account.user_id === user?.user_id}
                        type="button"
                        onClick={() => handleDeleteUser(account)}
                      >
                        {account.user_id === user?.user_id ? "Current user" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminPage;
