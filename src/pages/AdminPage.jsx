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
import { translateRole } from "../utils/labels";

const statLabels = {
  users_count: "Пользователи",
  devices_count: "Устройства",
  active_sessions_count: "Активные сессии",
  completed_sessions_count: "Завершённые сессии",
  interrupted_sessions_count: "Прерванные сессии",
  equivalent_cycles_count: "Циклы",
  excluded_cycles_count: "Исключённые циклы",
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
    return <LoadingState title="Загрузка админки" message="Получаем системную статистику и пользователей." />;
  }

  if (statsQuery.isError) {
    return <ErrorState error={statsQuery.error} title="Статистика админки недоступна" />;
  }

  if (usersQuery.isError) {
    return <ErrorState error={usersQuery.error} title="Список пользователей недоступен" />;
  }

  const users = asArray(usersQuery.data, ["users"]);

  async function handleDeleteUser(targetUser) {
    if (!window.confirm(`Удалить ${targetUser.email} и связанные данные батарей?`)) {
      return;
    }

    setError("");
    try {
      await deleteUserMutation.mutateAsync(targetUser.user_id);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Не удалось удалить пользователя."));
    }
  }

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Администрирование</span>
          <h1>Панель администратора</h1>
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
            <h2>Пользователи</h2>
            <p>Удаление пользователя также удаляет связанные данные батарей на сервере.</p>
          </div>
        </div>

        {users.length === 0 ? (
          <EmptyState title="Пользователей пока нет" message="Зарегистрированные пользователи появятся здесь." />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Создан</th>
                  <th>ID пользователя</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((account) => (
                  <tr key={account.user_id}>
                    <td>{formatValue(account.name)}</td>
                    <td>{formatValue(account.email)}</td>
                    <td>
                      <StatusBadge variant={account.role === "admin" ? "warning" : "neutral"}>
                        {translateRole(account.role)}
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
                        {account.user_id === user?.user_id ? "Текущий пользователь" : "Удалить"}
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
