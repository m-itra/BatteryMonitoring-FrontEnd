import { formatValue } from "../../utils/format";

function MetricCard({ label, value, helper, tone = "default" }) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{formatValue(value)}</strong>
      {helper && <small>{helper}</small>}
    </article>
  );
}

export default MetricCard;
