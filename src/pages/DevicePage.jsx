import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AverageLoadPerCycleChart from "../components/ui/AverageLoadPerCycleChart";
import CapacityHistoryChart from "../components/ui/CapacityHistoryChart";
import EnergyPerCycleChart from "../components/ui/EnergyPerCycleChart";
import FullChargeCapacityChart from "../components/ui/FullChargeCapacityChart";
import MetricCard from "../components/ui/MetricCard";
import RuntimePerCycleChart from "../components/ui/RuntimePerCycleChart";
import SohGapChart from "../components/ui/SohGapChart";
import StatusBadge from "../components/ui/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/State";
import {
  useDeleteCycle,
  useDeleteDevice,
  useDeviceAnalytics,
  useExcludeCycle,
  useIncludeCycle,
  useRenameDevice,
} from "../hooks/useAnalytics";
import { asArray, getCycleId, getDeviceName } from "../utils/data";
import { getErrorMessage } from "../utils/errors";
import { translateSessionStatus } from "../utils/labels";
import {
  formatDate,
  formatDuration,
  formatEnergy,
  formatPercent,
  formatPowerMw,
  formatWattsFromMilliwatts,
} from "../utils/format";

function getSohGap(device) {
  if (
    device.current_soh_capacity_percent === undefined ||
    device.current_soh_capacity_percent === null ||
    device.current_soh_capacity_percent === "" ||
    device.current_soh_energy_percent === undefined ||
    device.current_soh_energy_percent === null ||
    device.current_soh_energy_percent === ""
  ) {
    return null;
  }

  const capacity = Number(device.current_soh_capacity_percent);
  const energy = Number(device.current_soh_energy_percent);

  if (Number.isNaN(capacity) || Number.isNaN(energy)) {
    return null;
  }

  return capacity - energy;
}

function getOverallAverageLoadMw(cycles) {
  const totals = cycles.reduce(
    (result, cycle) => {
      const energy = Number(cycle.total_energy_mwh);
      const duration = Number(cycle.total_duration_seconds);

      if (!Number.isNaN(energy) && !Number.isNaN(duration) && duration > 0) {
        return {
          energyMwh: result.energyMwh + energy,
          hours: result.hours + duration / 3600,
        };
      }

      return result;
    },
    { energyMwh: 0, hours: 0 },
  );

  if (totals.hours === 0) {
    return null;
  }

  return totals.energyMwh / totals.hours;
}

function getAverageRuntimeSeconds(cycles) {
  const durations = cycles
    .map((cycle) => Number(cycle.total_duration_seconds))
    .filter((duration) => !Number.isNaN(duration));

  if (durations.length === 0) {
    return null;
  }

  return durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
}

function DevicePage() {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const analyticsQuery = useDeviceAnalytics(deviceId);
  const renameMutation = useRenameDevice();
  const deleteDeviceMutation = useDeleteDevice();
  const excludeCycleMutation = useExcludeCycle();
  const includeCycleMutation = useIncludeCycle();
  const deleteCycleMutation = useDeleteCycle();
  const [deviceNameDrafts, setDeviceNameDrafts] = useState({});
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const analytics = analyticsQuery.data || {};
  const device = analytics.device || {};
  const defaultDeviceName = getDeviceName(device);
  const deviceName = deviceNameDrafts[deviceId] ?? defaultDeviceName;
  const cycles = asArray(analytics, ["cycles"]);
  const includedCycles = cycles.filter((cycle) => !cycle.is_excluded);
  const recentSessions = asArray(analytics, ["recent_sessions", "sessions"]);
  const capacityHistory = asArray(analytics, ["capacity_history"]);
  const activeSession = analytics.active_session || null;
  const sohGap = getSohGap(device);
  const overallAverageLoadMw = getOverallAverageLoadMw(includedCycles);
  const averageRuntimeSeconds = getAverageRuntimeSeconds(includedCycles);
  const currentPowerMw =
    device.current_net_power_mw ?? device.current_power_mw ?? device.current_power ?? device.net_power_mw;

  if (analyticsQuery.isPending) {
    return <LoadingState title="Загрузка устройства" message="Получаем сессии, циклы и историю ёмкости." />;
  }

  if (analyticsQuery.isError) {
    return <ErrorState error={analyticsQuery.error} title="Устройство недоступно" />;
  }

  async function handleRename(event) {
    event.preventDefault();
    setNotice("");
    setError("");

    try {
      await renameMutation.mutateAsync({ deviceId, deviceName: deviceName.trim() });
      setNotice("Устройство переименовано.");
    } catch (renameError) {
      setError(getErrorMessage(renameError, "Не удалось переименовать устройство."));
    }
  }

  async function handleDeleteDevice() {
    if (!window.confirm("Удалить это устройство и его данные батареи?")) {
      return;
    }

    setNotice("");
    setError("");

    try {
      await deleteDeviceMutation.mutateAsync(deviceId);
      navigate("/", { replace: true });
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Не удалось удалить устройство."));
    }
  }

  async function handleCycleToggle(cycle) {
    const cycleId = getCycleId(cycle);
    if (!cycleId) {
      setError("Отсутствует id цикла.");
      return;
    }

    setNotice("");
    setError("");

    try {
      if (cycle.is_excluded) {
        await includeCycleMutation.mutateAsync({ deviceId, cycleId });
        setNotice("Цикл снова учитывается в аналитике.");
      } else {
        await excludeCycleMutation.mutateAsync({ deviceId, cycleId });
        setNotice("Цикл исключён из аналитики.");
      }
    } catch (cycleError) {
      setError(getErrorMessage(cycleError, "Не удалось обновить цикл."));
    }
  }

  async function handleDeleteCycle(cycle) {
    const cycleId = getCycleId(cycle);
    if (!cycleId) {
      setError("Отсутствует id цикла.");
      return;
    }

    if (!window.confirm("Навсегда удалить этот цикл и его сессии?")) {
      return;
    }

    setNotice("");
    setError("");

    try {
      await deleteCycleMutation.mutateAsync({ deviceId, cycleId });
      setNotice("Цикл удалён.");
    } catch (cycleError) {
      setError(getErrorMessage(cycleError, "Не удалось удалить цикл."));
    }
  }

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <Link className="back-link" to="/">
            Обзор
          </Link>
          <h1>{getDeviceName(device)}</h1>
          <p className="device-page-id">ID: {deviceId}</p>
        </div>
        <button
          className="button button-danger"
          disabled={deleteDeviceMutation.isPending}
          type="button"
          onClick={handleDeleteDevice}
        >
          Удалить устройство
        </button>
      </header>

      {(notice || error) && (
        <div className={`notice ${error ? "notice-error" : "notice-success"}`}>{error || notice}</div>
      )}

      <form className="rename-form" onSubmit={handleRename}>
        <label>
          Название устройства
          <input
            required
            type="text"
            value={deviceName}
            onChange={(event) =>
              setDeviceNameDrafts((current) => ({ ...current, [deviceId]: event.target.value }))
            }
          />
        </label>
        <button
          className="button button-primary"
          disabled={renameMutation.isPending || !deviceName.trim()}
          type="submit"
        >
          {renameMutation.isPending ? "Сохраняем..." : "Переименовать"}
        </button>
      </form>

      <section className="metric-grid device-summary-grid">
        <MetricCard
          label="Эталонная ёмкость"
          value={formatEnergy(device.reference_capacity_mwh)}
        />
        <MetricCard
          label="SOH по данным контроллера"
          value={formatPercent(device.current_soh_capacity_percent)}
        />
        <MetricCard
          label="SOH по энергии циклов"
          value={formatPercent(device.current_soh_energy_percent)}
        />
        <MetricCard
          label="Разница между SOH"
          value={formatPercent(sohGap)}
        />
        {overallAverageLoadMw !== null && (
          <MetricCard
            label="Средняя нагрузка"
            value={formatWattsFromMilliwatts(overallAverageLoadMw)}
          />
        )}
        {averageRuntimeSeconds !== null && (
          <MetricCard
            label="Среднее время работы"
            value={formatDuration(averageRuntimeSeconds)}
          />
        )}
      </section>

      {activeSession && (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <h2>Активная сессия</h2>
            </div>
          </div>
          <div className="active-session-grid">
            <span>
              Начало
              <strong>{formatDate(activeSession.started_at_client)}</strong>
            </span>
            <span>
              Последнее время клиента
              <strong>{formatDate(activeSession.last_client_time)}</strong>
            </span>
            <span>
              Длительность
              <strong>{formatDuration(activeSession.duration_seconds)}</strong>
            </span>
            <span>
              Начальный заряд
              <strong>{formatPercent(activeSession.start_charge_percent)}</strong>
            </span>
            <span>
              Текущий заряд
              <strong>{formatPercent(activeSession.current_charge_percent)}</strong>
            </span>
            <span>
              Текущая мощность
              <strong>
                {formatPowerMw(
                  currentPowerMw ??
                    activeSession.current_net_power_mw ??
                    activeSession.current_power_mw ??
                    activeSession.current_power,
                )}
              </strong>
            </span>
            <span>
              Разряжено
              <strong>{formatEnergy(activeSession.discharged_energy_mwh)}</strong>
            </span>
          </div>
        </section>
      )}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>История ёмкости</h2>
          </div>
        </div>
        <CapacityHistoryChart history={capacityHistory} />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Разница между SOH</h2>
          </div>
        </div>
        <SohGapChart history={capacityHistory} />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Рассчитанная ёмкость исходя из энергопотребления</h2>
          </div>
        </div>
        <EnergyPerCycleChart cycles={cycles} yMax={Number(device.reference_capacity_mwh)} />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Полная доступная ёмкость батареи по данным системы</h2>
          </div>
        </div>
        <FullChargeCapacityChart
          history={capacityHistory}
          referenceCapacityMwh={device.reference_capacity_mwh}
        />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Средняя нагрузка за цикл</h2>
          </div>
        </div>
        <AverageLoadPerCycleChart cycles={cycles} />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Время работы за цикл</h2>
          </div>
        </div>
        <RuntimePerCycleChart cycles={cycles} />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Недавние сессии</h2>
          </div>
        </div>
        {recentSessions.length === 0 ? (
          <EmptyState title="Сессий пока нет" message="Сессии появятся после обработки телеметрии." />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Начало</th>
                  <th>Конец</th>
                  <th>Разряд</th>
                  <th>Энергия</th>
                  <th>Длительность</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((session) => (
                  <tr key={session.session_id || `${session.started_at_client}-${session.ended_at_client}`}>
                    <td>{formatDate(session.started_at_client)}</td>
                    <td>{formatDate(session.ended_at_client)}</td>
                    <td>{formatPercent(session.discharge_delta_percent)}</td>
                    <td>{formatEnergy(session.discharged_energy_mwh)}</td>
                    <td>{formatDuration(session.duration_seconds)}</td>
                    <td>
                      <StatusBadge variant={session.status === "completed" ? "success" : "neutral"}>
                        {translateSessionStatus(session.status)}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Циклы</h2>
          </div>
        </div>
        {cycles.length === 0 ? (
          <EmptyState title="Циклов пока нет" message="Эквивалентные циклы появятся здесь." />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Начало</th>
                  <th>Конец</th>
                  <th>Энергия</th>
                  <th>Разряд</th>
                  <th>SOH по энергии циклов</th>
                  <th>Деградация</th>
                  <th>Исключён</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {cycles.map((cycle) => (
                  <tr className={cycle.is_excluded ? "muted-row" : ""} key={getCycleId(cycle)}>
                    <td>{formatDate(cycle.started_at_client)}</td>
                    <td>{formatDate(cycle.ended_at_client)}</td>
                    <td>{formatEnergy(cycle.total_energy_mwh)}</td>
                    <td>{formatPercent(cycle.total_discharge_percent)}</td>
                    <td>{formatPercent(cycle.soh_energy_percent)}</td>
                    <td>{formatPercent(cycle.degradation_energy_percent)}</td>
                    <td>
                      {cycle.is_excluded ? (
                        <StatusBadge variant="muted">Да</StatusBadge>
                      ) : (
                        <StatusBadge variant="success">Нет</StatusBadge>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="button button-small"
                          disabled={excludeCycleMutation.isPending || includeCycleMutation.isPending}
                          type="button"
                          onClick={() => handleCycleToggle(cycle)}
                        >
                          {cycle.is_excluded ? "Вернуть" : "Исключить"}
                        </button>
                        <button
                          className="button button-small button-danger"
                          disabled={deleteCycleMutation.isPending}
                          type="button"
                          onClick={() => handleDeleteCycle(cycle)}
                        >
                          Удалить
                        </button>
                      </div>
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

export default DevicePage;
