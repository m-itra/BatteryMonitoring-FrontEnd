import HistoryLineChart from "./HistoryLineChart";
import { formatEnergy } from "../../utils/format";

const VALUE_KEYS = [["total_energy_mwh", "Energy used per cycle"]];

function EnergyPerCycleChart({ cycles = [], yMax }) {
  const includedCycles = cycles.filter((cycle) => !cycle.is_excluded);

  return (
    <HistoryLineChart
      dateKeys={["ended_at_client"]}
      emptyMessage="No included cycles with energy usage yet."
      fallbackLabel="Energy used per cycle"
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
