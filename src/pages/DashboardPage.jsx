import { Link } from "react-router-dom";
import MetricCard from "../components/ui/MetricCard";
import StatusBadge from "../components/ui/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/State";
import { useAuth } from "../hooks/useAuth";
import { useDashboardAnalytics, useDevices } from "../hooks/useAnalytics";
import { asArray, getCycleId, getDeviceId, getDeviceName, pick } from "../utils/data";
import { formatDate, formatEnergy, formatPercent } from "../utils/format";

function DashboardPage() {
  const { user } = useAuth();
  const analyticsQuery = useDashboardAnalytics();
  const devicesQuery = useDevices();

  if (analyticsQuery.isPending) {
    return <LoadingState title="Загрузка обзора" message="Получаем аналитику через шлюз." />;
  }

  if (analyticsQuery.isError) {
    return <ErrorState error={analyticsQuery.error} title="Обзор недоступен" />;
  }

  const analytics = analyticsQuery.data || {};
  const analyticsDevices = asArray(analytics, ["devices"]);
  const devices = asArray(devicesQuery.data, ["devices"]).length
    ? asArray(devicesQuery.data, ["devices"])
    : analyticsDevices;
  const recentCycles = asArray(analytics, ["recent_cycles", "cycles"]);
  const totalCycleCount = pick(
    analytics,
    ["total_cycle_count", "total_cycles", "equivalent_cycles_count"],
    recentCycles.length,
  );

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Обзор</span>
          <h1>Панель мониторинга</h1>
          <p>Состояние устройств на основе аналитики, рассчитанной сервером.</p>
        </div>
      </header>

      <section className="metric-grid">
        <MetricCard label="Текущий пользователь" value={user?.name || user?.email} helper={user?.email} />
        <MetricCard label="Устройства" value={devices.length} helper="Привязаны к этому аккаунту" />
        <MetricCard label="Всего циклов" value={totalCycleCount} helper="Без исключённых циклов" />
        <MetricCard label="Недавние циклы" value={recentCycles.length} helper="Последние данные сервера" />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Устройства</h2>
            <p>Заряд, SOE, SOH и статус активности.</p>
          </div>
          {devicesQuery.isError && <StatusBadge variant="warning">Резервный список</StatusBadge>}
        </div>

        {devices.length === 0 ? (
          <EmptyState title="Устройств пока нет" message="Устройства появятся после получения телеметрии сервером." />
        ) : (
          <div className="device-grid">
            {devices.map((device) => {
              const deviceId = getDeviceId(device);
              const activeSession = pick(device, ["has_active_session", "active_session"], false);

              return (
                <Link className="device-card" key={deviceId || getDeviceName(device)} to={`/devices/${deviceId}`}>
                  <div className="device-card-head">
                    <h3>{getDeviceName(device)}</h3>
                    {activeSession ? (
                      <StatusBadge variant="success">Активно</StatusBadge>
                    ) : (
                      <StatusBadge>Ожидание</StatusBadge>
                    )}
                  </div>
                  <div className="device-stats">
                    <span>
                      Заряд
                      <strong>{formatPercent(pick(device, ["charge_percent", "current_charge_percent"]))}</strong>
                    </span>
                    <span>
                      SOE
                      <strong>{formatPercent(pick(device, ["soe_percent", "current_soe_percent"]))}</strong>
                    </span>
                    <span>
                      SOH по ёмкости
                      <strong>
                        {formatPercent(
                          pick(device, ["soh_capacity_percent", "current_soh_capacity_percent"]),
                        )}
                      </strong>
                    </span>
                    <span>
                      SOH по энергии
                      <strong>
                        {formatPercent(pick(device, ["soh_energy_percent", "current_soh_energy_percent"]))}
                      </strong>
                    </span>
                  </div>
                  <footer>
                    Последняя активность: {formatDate(pick(device, ["last_seen_at", "last_seen", "updated_at"]))}
                  </footer>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Недавние циклы</h2>
            <p>Исключённые циклы остаются видимыми, но отображаются приглушённо.</p>
          </div>
        </div>
        {recentCycles.length === 0 ? (
          <EmptyState title="Циклов пока нет" message="Недавние эквивалентные циклы появятся здесь." />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Начало</th>
                  <th>Конец</th>
                  <th>Энергия</th>
                  <th>SOH по энергии</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {recentCycles.map((cycle) => (
                  <tr className={cycle.is_excluded ? "muted-row" : ""} key={getCycleId(cycle)}>
                    <td>{formatDate(cycle.started_at)}</td>
                    <td>{formatDate(cycle.ended_at)}</td>
                    <td>{formatEnergy(cycle.total_energy_mwh)}</td>
                    <td>{formatPercent(cycle.soh_energy_percent)}</td>
                    <td>
                      {cycle.is_excluded ? (
                        <StatusBadge variant="muted">Исключён</StatusBadge>
                      ) : (
                        <StatusBadge variant="success">Учитывается</StatusBadge>
                      )}
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

export default DashboardPage;
