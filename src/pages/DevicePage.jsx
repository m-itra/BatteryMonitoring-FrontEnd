import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AverageLoadPerCycleChart from "../components/ui/AverageLoadPerCycleChart";
import CapacityHistoryChart from "../components/ui/CapacityHistoryChart";
import EnergyPerCycleChart from "../components/ui/EnergyPerCycleChart";
import FullChargeCapacityChart from "../components/ui/FullChargeCapacityChart";
import MetricCard from "../components/ui/MetricCard";
import RuntimePerCycleChart from "../components/ui/RuntimePerCycleChart";
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
import {
  formatDate,
  formatDuration,
  formatEnergy,
  formatPercent,
  formatPowerMw,
  formatValue,
  formatWattsFromMilliwatts,
} from "../utils/format";

function getSohGap(device) {
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

  if (analyticsQuery.isPending) {
    return <LoadingState title="Loading device" message="Collecting sessions, cycles, and capacity history." />;
  }

  if (analyticsQuery.isError) {
    return <ErrorState error={analyticsQuery.error} title="Device unavailable" />;
  }

  async function handleRename(event) {
    event.preventDefault();
    setNotice("");
    setError("");

    try {
      await renameMutation.mutateAsync({ deviceId, deviceName: deviceName.trim() });
      setNotice("Device renamed.");
    } catch (renameError) {
      setError(getErrorMessage(renameError, "Could not rename device."));
    }
  }

  async function handleDeleteDevice() {
    if (!window.confirm("Delete this device and its battery data?")) {
      return;
    }

    setNotice("");
    setError("");

    try {
      await deleteDeviceMutation.mutateAsync(deviceId);
      navigate("/", { replace: true });
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Could not delete device."));
    }
  }

  async function handleCycleToggle(cycle) {
    const cycleId = getCycleId(cycle);
    if (!cycleId) {
      setError("Cycle id is missing.");
      return;
    }

    setNotice("");
    setError("");

    try {
      if (cycle.is_excluded) {
        await includeCycleMutation.mutateAsync({ deviceId, cycleId });
        setNotice("Cycle included back into analytics.");
      } else {
        await excludeCycleMutation.mutateAsync({ deviceId, cycleId });
        setNotice("Cycle excluded from analytics.");
      }
    } catch (cycleError) {
      setError(getErrorMessage(cycleError, "Could not update cycle."));
    }
  }

  async function handleDeleteCycle(cycle) {
    const cycleId = getCycleId(cycle);
    if (!cycleId) {
      setError("Cycle id is missing.");
      return;
    }

    if (!window.confirm("Permanently delete this cycle and its sessions?")) {
      return;
    }

    setNotice("");
    setError("");

    try {
      await deleteCycleMutation.mutateAsync({ deviceId, cycleId });
      setNotice("Cycle deleted.");
    } catch (cycleError) {
      setError(getErrorMessage(cycleError, "Could not delete cycle."));
    }
  }

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <Link className="back-link" to="/">
            Dashboard
          </Link>
          <h1>{getDeviceName(device)}</h1>
          <p>Device analytics are shown exactly as calculated by the backend.</p>
        </div>
        <button
          className="button button-danger"
          disabled={deleteDeviceMutation.isPending}
          type="button"
          onClick={handleDeleteDevice}
        >
          Delete device
        </button>
      </header>

      {(notice || error) && (
        <div className={`notice ${error ? "notice-error" : "notice-success"}`}>{error || notice}</div>
      )}

      <form className="rename-form" onSubmit={handleRename}>
        <label>
          Device name
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
          {renameMutation.isPending ? "Saving..." : "Rename"}
        </button>
      </form>

      <section className="metric-grid">
        <MetricCard
          label="Current charge"
          value={formatPercent(device.current_charge_percent)}
          helper={`Last seen ${formatDate(device.last_seen)}`}
        />
        <MetricCard
          label="Current power"
          value={formatPowerMw(device.current_net_power_mw)}
          helper="Negative values mean charging"
        />
        <MetricCard
          label="SOE"
          value={formatPercent(device.current_soe_percent)}
          helper="Energy state"
        />
        <MetricCard
          label="SOH capacity"
          value={formatPercent(device.current_soh_capacity_percent)}
          helper="Backend calculated"
        />
        <MetricCard
          label="SOH energy"
          value={formatPercent(device.current_soh_energy_percent)}
          helper="Excludes muted cycles"
        />
        <MetricCard
          label="Reference capacity"
          value={formatEnergy(device.reference_capacity_mwh)}
          helper={formatValue(device.reference_capacity_source)}
        />
        {sohGap !== null && (
          <MetricCard
            label="SOH gap"
            value={formatPercent(sohGap)}
            helper="Capacity SOH minus energy SOH"
          />
        )}
        {overallAverageLoadMw !== null && (
          <MetricCard
            label="Average load overall"
            value={formatWattsFromMilliwatts(overallAverageLoadMw)}
            helper="Weighted by included cycle duration"
          />
        )}
        {averageRuntimeSeconds !== null && (
          <MetricCard
            label="Average runtime overall"
            value={formatDuration(averageRuntimeSeconds)}
            helper="Included cycles only"
          />
        )}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Active session</h2>
            <p>Current discharge session if one exists.</p>
          </div>
        </div>
        {activeSession ? (
          <div className="active-session-grid">
            <StatusBadge variant="success">Active</StatusBadge>
            <span>
              Started
              <strong>{formatDate(activeSession.started_at_client)}</strong>
            </span>
            <span>
              Last client time
              <strong>{formatDate(activeSession.last_client_time)}</strong>
            </span>
            <span>
              Start charge
              <strong>{formatPercent(activeSession.start_charge_percent)}</strong>
            </span>
            <span>
              Current charge
              <strong>{formatPercent(activeSession.current_charge_percent)}</strong>
            </span>
            <span>
              Discharged
              <strong>{formatEnergy(activeSession.discharged_energy_mwh)}</strong>
            </span>
            <span>
              Duration
              <strong>{formatDuration(activeSession.duration_seconds)}</strong>
            </span>
            <span>
              Pending transition
              <strong>{formatValue(activeSession.pending_transition)}</strong>
            </span>
          </div>
        ) : (
          <EmptyState title="No active session" message="This device is idle right now." />
        )}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Capacity history</h2>
            <p>Backend-prepared degradation and capacity values; excluded cycles are already removed.</p>
          </div>
        </div>
        <CapacityHistoryChart history={capacityHistory} />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Energy used per cycle</h2>
            <p>Shows non-excluded cycles for consistency with backend analytics.</p>
          </div>
        </div>
        <EnergyPerCycleChart cycles={cycles} yMax={Number(device.reference_capacity_mwh)} />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Full charge capacity over time</h2>
            <p>System-reported full available battery capacity in mWh.</p>
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
            <h2>Average load per cycle</h2>
            <p>Non-excluded cycle average power, displayed in watts.</p>
          </div>
        </div>
        <AverageLoadPerCycleChart cycles={cycles} />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Runtime per cycle</h2>
            <p>How long each non-excluded equivalent cycle lasted.</p>
          </div>
        </div>
        <RuntimePerCycleChart cycles={cycles} />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Recent sessions</h2>
            <p>Latest session records for this device.</p>
          </div>
        </div>
        {recentSessions.length === 0 ? (
          <EmptyState title="No sessions" message="Sessions will appear as telemetry is processed." />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Started</th>
                  <th>Ended</th>
                  <th>Discharge delta</th>
                  <th>Energy</th>
                  <th>Duration</th>
                  <th>Status</th>
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
                        {formatValue(session.status)}
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
            <h2>Cycles</h2>
            <p>Excluded cycles remain visible and can be included again.</p>
          </div>
        </div>
        {cycles.length === 0 ? (
          <EmptyState title="No cycles" message="Equivalent cycles will appear here." />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Started</th>
                  <th>Ended</th>
                  <th>Energy</th>
                  <th>Discharge</th>
                  <th>SOH energy</th>
                  <th>Degradation</th>
                  <th>Excluded</th>
                  <th>Actions</th>
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
                        <StatusBadge variant="muted">Yes</StatusBadge>
                      ) : (
                        <StatusBadge variant="success">No</StatusBadge>
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
                          {cycle.is_excluded ? "Include" : "Exclude"}
                        </button>
                        <button
                          className="button button-small button-danger"
                          disabled={deleteCycleMutation.isPending}
                          type="button"
                          onClick={() => handleDeleteCycle(cycle)}
                        >
                          Delete
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
