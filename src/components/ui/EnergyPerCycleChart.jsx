import HistoryLineChart from "./HistoryLineChart";
import { formatEnergy } from "../../utils/format";

const VALUE_KEYS = [["total_energy_mwh", "Энергия за цикл"]];

function EnergyPerCycleChart({ cycles = [], yMax }) {
  const includedCycles = cycles.filter((cycle) => !cycle.is_excluded);

  return (
    <HistoryLineChart
      dateKeys={["ended_at_client"]}
      emptyMessage="Пока нет включённых циклов с расходом энергии."
      fallbackLabel="Энергия за цикл"
      format={formatEnergy}
      history={includedCycles}
      showPointLabels
      valueKeys={VALUE_KEYS}
      yMax={yMax}
      yMin={0}
    />
  );
}

export default EnergyPerCycleChart;
