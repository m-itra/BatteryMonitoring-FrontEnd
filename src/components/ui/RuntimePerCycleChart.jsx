import HistoryLineChart from "./HistoryLineChart";
import { formatDuration } from "../../utils/format";

const VALUE_KEYS = [["total_duration_seconds", "Runtime per cycle"]];

function RuntimePerCycleChart({ cycles = [] }) {
  const includedCycles = cycles.filter((cycle) => !cycle.is_excluded);

  return (
    <HistoryLineChart
      dateKeys={["ended_at_client"]}
      emptyMessage="No included cycles with runtime yet."
      fallbackLabel="Runtime per cycle"
      format={formatDuration}
      history={includedCycles}
      showPointLabels
      valueKeys={VALUE_KEYS}
      yMin={0}
    />
  );
}

export default RuntimePerCycleChart;
