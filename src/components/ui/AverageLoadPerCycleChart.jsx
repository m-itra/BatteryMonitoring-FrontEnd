import HistoryLineChart from "./HistoryLineChart";
import { formatWattsFromMilliwatts } from "../../utils/format";

const VALUE_KEYS = [["avg_load_mw", "Средняя нагрузка за цикл"]];
const formatAverageLoad = (value) => formatWattsFromMilliwatts(value, 3);

function AverageLoadPerCycleChart({ cycles = [] }) {
  const includedCycles = cycles.filter((cycle) => !cycle.is_excluded);

  return (
    <HistoryLineChart
      dateKeys={["ended_at_client"]}
      emptyMessage="Пока нет включённых циклов со средней нагрузкой."
      fallbackLabel="Средняя нагрузка за цикл"
      format={formatAverageLoad}
      history={includedCycles}
      showPointLabels
      valueKeys={VALUE_KEYS}
      yMin={0}
    />
  );
}

export default AverageLoadPerCycleChart;
