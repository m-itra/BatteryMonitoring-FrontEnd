import HistoryLineChart from "./HistoryLineChart";
import { formatEnergy } from "../../utils/format";

const VALUE_KEYS = [
  ["full_charge_capacity_mwh", "Полная доступная ёмкость батареи по данным системы"],
];

function FullChargeCapacityChart({ history = [], referenceCapacityMwh }) {
  return (
    <HistoryLineChart
      dateKeys={["recorded_at"]}
      emptyMessage="Пока нет истории полной доступной ёмкости."
      fallbackLabel="Полная доступная ёмкость батареи по данным системы"
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
