import HistoryLineChart from "./HistoryLineChart";
import { formatEnergy } from "../../utils/format";

const VALUE_KEYS = [["full_charge_capacity_mwh", "Full charge capacity"]];

function FullChargeCapacityChart({ history = [], referenceCapacityMwh }) {
  return (
    <HistoryLineChart
      dateKeys={["recorded_at"]}
      emptyMessage="No full charge capacity history yet."
      fallbackLabel="Full charge capacity"
      format={formatEnergy}
      history={history}
      showPointLabels
      strictYMax
      valueKeys={VALUE_KEYS}
      yMax={referenceCapacityMwh}
      yMin={0}
    />
  );
}

export default FullChargeCapacityChart;
