import HistoryLineChart from "./HistoryLineChart";
import { formatDuration } from "../../utils/format";

const VALUE_KEYS = [["total_duration_seconds", "Время работы за цикл"]];

function RuntimePerCycleChart({ cycles = [] }) {
  const includedCycles = cycles.filter((cycle) => !cycle.is_excluded);

  return (
    <HistoryLineChart
      dateKeys={["ended_at_client"]}
      emptyMessage="Пока нет включённых циклов с длительностью."
      fallbackLabel="Время работы за цикл"
      format={formatDuration}
      history={includedCycles}
      showPointLabels
      valueKeys={VALUE_KEYS}
      yMin={0}
    />
  );
}

export default RuntimePerCycleChart;
