import HistoryLineChart from "./HistoryLineChart";
import { formatWattsFromMilliwatts } from "../../utils/format";

const VALUE_KEYS = [["avg_load_mw", "Average load per cycle"]];

function AverageLoadPerCycleChart({ cycles = [] }) {
  const includedCycles = cycles.filter((cycle) => !cycle.is_excluded);

  return (
    <HistoryLineChart
      dateKeys={["ended_at_client"]}
      emptyMessage="No included cycles with average load yet."
      fallbackLabel="Average load per cycle"
      format={formatWattsFromMilliwatts}
      history={includedCycles}
      showPointLabels
      valueKeys={VALUE_KEYS}
      yMin={0}
    />
  );
}

export default AverageLoadPerCycleChart;
