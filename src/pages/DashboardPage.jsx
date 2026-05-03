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
    return <LoadingState title="Loading dashboard" message="Fetching analytics from the gateway." />;
  }

  if (analyticsQuery.isError) {
    return <ErrorState error={analyticsQuery.error} title="Dashboard unavailable" />;
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
          <span className="eyebrow">Overview</span>
          <h1>Dashboard</h1>
          <p>Live fleet health based on backend-calculated analytics.</p>
        </div>
      </header>

      <section className="metric-grid">
        <MetricCard label="Current user" value={user?.name || user?.email} helper={user?.email} />
        <MetricCard label="Devices" value={devices.length} helper="Registered to this account" />
        <MetricCard label="Total cycles" value={totalCycleCount} helper="Excludes muted cycles" />
        <MetricCard label="Recent cycles" value={recentCycles.length} helper="Latest backend results" />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Devices</h2>
            <p>Charge, SOE, SOH, and activity status.</p>
          </div>
          {devicesQuery.isError && <StatusBadge variant="warning">Device list fallback</StatusBadge>}
        </div>

        {devices.length === 0 ? (
          <EmptyState title="No devices yet" message="Devices will appear after the backend receives telemetry." />
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
                      <StatusBadge variant="success">Active</StatusBadge>
                    ) : (
                      <StatusBadge>Idle</StatusBadge>
                    )}
                  </div>
                  <div className="device-stats">
                    <span>
                      Charge
                      <strong>{formatPercent(pick(device, ["charge_percent", "current_charge_percent"]))}</strong>
                    </span>
                    <span>
                      SOE
                      <strong>{formatPercent(pick(device, ["soe_percent", "current_soe_percent"]))}</strong>
                    </span>
                    <span>
                      SOH capacity
                      <strong>
                        {formatPercent(
                          pick(device, ["soh_capacity_percent", "current_soh_capacity_percent"]),
                        )}
                      </strong>
                    </span>
                    <span>
                      SOH energy
                      <strong>
                        {formatPercent(pick(device, ["soh_energy_percent", "current_soh_energy_percent"]))}
                      </strong>
                    </span>
                  </div>
                  <footer>
                    Last seen {formatDate(pick(device, ["last_seen_at", "last_seen", "updated_at"]))}
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
            <h2>Recent cycles</h2>
            <p>Excluded cycles stay visible but muted.</p>
          </div>
        </div>
        {recentCycles.length === 0 ? (
          <EmptyState title="No cycles recorded" message="Recent equivalent cycles will appear here." />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Started</th>
                  <th>Ended</th>
                  <th>Energy</th>
                  <th>SOH energy</th>
                  <th>Status</th>
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
                        <StatusBadge variant="muted">Excluded</StatusBadge>
                      ) : (
                        <StatusBadge variant="success">Included</StatusBadge>
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
