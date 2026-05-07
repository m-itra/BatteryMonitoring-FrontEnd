import { formatDate, formatPercent } from "../../utils/format";

const SERIES = [
  {
    className: "chart-line-capacity",
    key: "soh_capacity_percent",
    label: "SOH по ёмкости",
    format: formatPercent,
  },
  {
    className: "chart-line-energy",
    key: "soh_energy_percent",
    label: "SOH по энергии",
    format: formatPercent,
  },
];

function CapacityHistoryChart({ history = [] }) {
  const activeSeries = SERIES.map((definition) => ({
    ...definition,
    points: history
      .map((point, index) => ({
        date: point.recorded_at,
        index,
        value: Number(point[definition.key]),
      }))
      .filter((point) => !Number.isNaN(point.value)),
  })).filter((series) => series.points.length > 0);

  if (activeSeries.length === 0) {
    return (
      <div className="chart-empty">
        <p>Пока нет истории ёмкости.</p>
      </div>
    );
  }

  const width = 680;
  const height = 240;
  const padding = 42;
  const percentValues = activeSeries.flatMap((series) => series.points.map((point) => point.value));
  const domainMin = 0;
  const domainMax = Math.max(100, ...percentValues);
  const spread = domainMax - domainMin || 1;
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount }, (_, index) => {
    const ratio = index / (tickCount - 1);
    return domainMin + ratio * spread;
  });
  const timeline = history.map((point, index) => ({
    index,
    timestamp: new Date(point.recorded_at).getTime(),
  }));
  const hasValidTimeline =
    timeline.length > 0 && timeline.every((point) => !Number.isNaN(point.timestamp));
  const minTime = hasValidTimeline ? Math.min(...timeline.map((point) => point.timestamp)) : 0;
  const maxTime = hasValidTimeline ? Math.max(...timeline.map((point) => point.timestamp)) : 0;
  const timeSpread = maxTime - minTime || 1;
  const maxIndex = Math.max(history.length - 1, 1);

  function getX(point) {
    const timestamp = new Date(point.date).getTime();

    if (hasValidTimeline && !Number.isNaN(timestamp)) {
      return padding + ((timestamp - minTime) / timeSpread) * (width - padding * 2);
    }

    return padding + (point.index / maxIndex) * (width - padding * 2);
  }

  function getY(point) {
    return height - padding - ((point.value - domainMin) / spread) * (height - padding * 2);
  }

  return (
    <div className="chart-wrap">
      <div className="chart-heading">
        <strong>История ёмкости</strong>
        <span>Значения подготовлены сервером</span>
      </div>
      <div className="chart-legend">
        {activeSeries.map((series) => (
          <span key={series.key}>
            <i className={series.className} aria-hidden="true" />
            {series.label}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="График истории ёмкости">
        {ticks.map((tick) => {
          const y = height - padding - ((tick - domainMin) / spread) * (height - padding * 2);

          return (
            <g key={tick}>
              <line className="chart-grid-line" x1={padding} y1={y} x2={width - padding} y2={y} />
              <text className="chart-tick-label" x={padding - 8} y={y + 4}>
                {formatPercent(tick)}
              </text>
            </g>
          );
        })}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
        <text className="chart-axis-label" x={padding} y={padding - 12}>
          SOH %
        </text>
        {activeSeries.map((series) => {
          const coordinates = series.points.map((point) => ({
            ...point,
            x: getX(point),
            y: getY(point),
          }));
          const polyline = coordinates.map((point) => `${point.x},${point.y}`).join(" ");

          return (
            <g key={series.key}>
              <polyline className={`chart-line ${series.className}`} points={polyline} />
              {coordinates.map((point) => (
                <circle
                  className={`chart-point ${series.className}`}
                  cx={point.x}
                  cy={point.y}
                  key={`${series.key}-${point.index}-${point.value}`}
                  r="4"
                >
                  <title>
                    {formatDate(point.date)}: {series.label} {series.format(point.value)}
                  </title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default CapacityHistoryChart;
