import HistoryLineChart from "./HistoryLineChart";
import { formatEnergy } from "../../utils/format";

const VALUE_KEYS = [
  ["total_energy_mwh", "Рассчитанная ёмкость исходя из энергопотребления"],
];

function EnergyPerCycleChart({ cycles = [], yMax }) {
  const includedCycles = cycles.filter((cycle) => !cycle.is_excluded);

  return (
    <HistoryLineChart
      dateKeys={["ended_at_client"]}
      emptyMessage="Пока нет включённых циклов с расходом энергии."
      fallbackLabel="Рассчитанная ёмкость исходя из энергопотребления"
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
