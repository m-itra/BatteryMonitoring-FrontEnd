import { Link } from "react-router-dom";
import StatusBadge from "../components/ui/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/State";
import { useDashboardAnalytics, useDevices } from "../hooks/useAnalytics";
import { asArray, getCycleId, getDeviceId, getDeviceName, pick } from "../utils/data";
import { formatDate, formatEnergy, formatPercent, formatWattHoursFromMilliwattHours } from "../utils/format";

function hasMetricValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function getDeviceSohGap(device) {
  const capacity = pick(device, ["soh_capacity_percent", "current_soh_capacity_percent"], undefined);
  const energy = pick(device, ["soh_energy_percent", "current_soh_energy_percent"], undefined);

  if (!hasMetricValue(capacity) || !hasMetricValue(energy)) {
    return null;
  }

  const capacityNumber = Number(capacity);
  const energyNumber = Number(energy);

  if (Number.isNaN(capacityNumber) || Number.isNaN(energyNumber)) {
    return null;
  }

  return capacityNumber - energyNumber;
}

function getCycleDeviceName(cycle, devices) {
  const cycleDeviceId = pick(cycle, ["device_id", "deviceId", "battery_device_id"], undefined);
  const cycleDeviceName = pick(cycle, ["device_name", "deviceName", "battery_device_name"], undefined);

  if (cycleDeviceName) {
    return cycleDeviceName;
  }

  if (!cycleDeviceId) {
    return "-";
  }

  const device = devices.find((item) => getDeviceId(item) === cycleDeviceId);
  return device ? getDeviceName(device) : cycleDeviceId;
}

function formatDeviceCount(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} устройство`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} устройства`;
  }

  return `${count} устройств`;
}

function DashboardPage() {
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

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Обзор</span>
          <h1>Панель мониторинга</h1>
        </div>
      </header>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Устройства</h2>
          </div>
          <div className="badge-row">
            <StatusBadge>{formatDeviceCount(devices.length)}</StatusBadge>
            {devicesQuery.isError && <StatusBadge variant="warning">Резервный список</StatusBadge>}
          </div>
        </div>

        {devices.length === 0 ? (
          <EmptyState title="Устройств пока нет" message="Устройства появятся после получения телеметрии сервером." />
        ) : (
          <div className="device-grid">
            {devices.map((device) => {
              const deviceId = getDeviceId(device);
              const activeSession = pick(device, ["has_active_session", "active_session"], false);
              const sohGap = getDeviceSohGap(device);

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
                      Эталонная ёмкость
                      <strong>
                        {formatWattHoursFromMilliwattHours(pick(device, ["reference_capacity_mwh"]))}
                      </strong>
                    </span>
                    <span>
                      SOH по данным контроллера
                      <strong>
                        {formatPercent(
                          pick(device, ["soh_capacity_percent", "current_soh_capacity_percent"]),
                        )}
                      </strong>
                    </span>
                    <span>
                      SOH по энергии циклов
                      <strong>
                        {formatPercent(pick(device, ["soh_energy_percent", "current_soh_energy_percent"]))}
                      </strong>
                    </span>
                    <span>
                      Разница между SOH
                      <strong>{formatPercent(sohGap)}</strong>
                    </span>
                  </div>
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
          </div>
        </div>
        {recentCycles.length === 0 ? (
          <EmptyState title="Циклов пока нет" message="Недавние эквивалентные циклы появятся здесь." />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Устройство</th>
                  <th>Начало</th>
                  <th>Конец</th>
                  <th>Энергия</th>
                  <th>SOH по энергии циклов</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {recentCycles.map((cycle) => (
                  <tr className={cycle.is_excluded ? "muted-row" : ""} key={getCycleId(cycle)}>
                    <td>{getCycleDeviceName(cycle, devices)}</td>
                    <td>{formatDate(pick(cycle, ["started_at_client", "started_at"]))}</td>
                    <td>{formatDate(pick(cycle, ["ended_at_client", "ended_at"]))}</td>
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
