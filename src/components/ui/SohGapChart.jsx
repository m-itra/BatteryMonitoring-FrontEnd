import HistoryLineChart from "./HistoryLineChart";
import { formatPercent } from "../../utils/format";

const VALUE_KEYS = [["soh_gap_percent", "Разница SOH"]];

function hasValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function SohGapChart({ history = [] }) {
  const gapHistory = history
    .map((point) => {
      if (!hasValue(point.soh_capacity_percent) || !hasValue(point.soh_energy_percent)) {
        return null;
      }

      const capacity = Number(point.soh_capacity_percent);
      const energy = Number(point.soh_energy_percent);

      if (Number.isNaN(capacity) || Number.isNaN(energy)) {
        return null;
      }

      return {
        recorded_at: point.recorded_at,
        soh_gap_percent: capacity - energy,
      };
    })
    .filter(Boolean);
  const values = gapHistory.map((point) => point.soh_gap_percent);
  const yMin = Math.min(0, ...values);
  const yMax = Math.max(0, ...values);

  return (
    <HistoryLineChart
      dateKeys={["recorded_at"]}
      emptyMessage="Пока нет данных для разницы SOH."
      fallbackLabel="Разница SOH"
      format={formatPercent}
      history={gapHistory}
      showPointLabels
      valueKeys={VALUE_KEYS}
      yMax={yMax}
      yMin={yMin}
    />
  );
}

export default SohGapChart;
