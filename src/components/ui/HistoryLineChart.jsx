import { pick } from "../../utils/data";
import { formatDate, formatValue } from "../../utils/format";

const DATE_KEYS = [
  "ended_at_client",
  "recorded_at",
  "ended_at",
  "started_at",
  "created_at",
  "timestamp",
  "date",
];

function getSeries(history, valueKeys, fallbackLabel, dateKeys) {
  const selected = valueKeys.find(([key]) =>
    history.some((point) => point?.[key] !== undefined && point?.[key] !== null),
  );

  if (!selected) {
    return { label: fallbackLabel, points: [] };
  }

  const [key, label] = selected;
  const points = history
    .map((point, index) => ({
      index,
      date: pick(point, dateKeys),
      value: Number(point[key]),
    }))
    .filter((point) => !Number.isNaN(point.value));

  return { label, points };
}

function HistoryLineChart({
  history = [],
  valueKeys,
  fallbackLabel,
  emptyMessage,
  format = formatValue,
  dateKeys = DATE_KEYS,
  showPointLabels = false,
  strictYMax = false,
  yMax,
  yMin = 0,
}) {
  const { label, points } = getSeries(history, valueKeys, fallbackLabel, dateKeys);

  if (points.length === 0) {
    return (
      <div className="chart-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const width = 680;
  const height = 220;
  const padding = {
    top: 32,
    right: 32,
    bottom: 42,
    left: 96,
  };
  const maxValue = Math.max(...points.map((point) => point.value));
  const requestedMax = Number(yMax);
  const domainMin = yMin;
  const hasRequestedMax = !Number.isNaN(requestedMax);
  const domainMax = strictYMax && hasRequestedMax
    ? Math.max(requestedMax, domainMin + 1)
    : Math.max(hasRequestedMax ? requestedMax : maxValue, maxValue, domainMin + 1);
  const spread = domainMax - domainMin || 1;
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount }, (_, index) => {
    const ratio = index / (tickCount - 1);
    return domainMin + ratio * spread;
  });
  const timestamps = points.map((point) => new Date(point.date).getTime());
  const hasValidTimeline = timestamps.every((timestamp) => !Number.isNaN(timestamp));
  const minTime = hasValidTimeline ? Math.min(...timestamps) : 0;
  const maxTime = hasValidTimeline ? Math.max(...timestamps) : 0;
  const timeSpread = maxTime - minTime || 1;
  const maxIndex = Math.max(points.length - 1, 1);
  const coordinates = points.map((point) => {
    const timestamp = new Date(point.date).getTime();
    const x = hasValidTimeline
      ? padding.left +
        ((timestamp - minTime) / timeSpread) * (width - padding.left - padding.right)
      : padding.left + (point.index / maxIndex) * (width - padding.left - padding.right);
    const y =
      height -
      padding.bottom -
      ((point.value - domainMin) / spread) * (height - padding.top - padding.bottom);
    return { ...point, x, y };
  });
  const polyline = coordinates.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="chart-wrap">
      <div className="chart-heading">
        <strong>{label}</strong>
        <span>
          {format(domainMin)} - {format(domainMax)}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`График: ${label}`}>
        {ticks.map((tick) => {
          const y =
            height -
            padding.bottom -
            ((tick - domainMin) / spread) * (height - padding.top - padding.bottom);

          return (
            <g key={tick}>
              <line
                className="chart-grid-line"
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
              />
              <text className="chart-tick-label" x={padding.left - 10} y={y + 4}>
                {format(tick)}
              </text>
            </g>
          );
        })}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
        />
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
        />
        <polyline points={polyline} />
        {coordinates.map((point) => (
          <g key={`${point.index}-${point.value}`}>
            <circle cx={point.x} cy={point.y} r="4" />
            {showPointLabels && (
              <text className="chart-value-label" x={point.x} y={Math.max(point.y - 10, 14)}>
                {format(point.value)}
              </text>
            )}
            <title>
              {formatDate(point.date)}: {format(point.value)}
            </title>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default HistoryLineChart;
