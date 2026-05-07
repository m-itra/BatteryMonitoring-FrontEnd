export function formatValue(value, fallback = "-") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "number") {
    return Number.isInteger(value)
      ? value.toLocaleString()
      : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  return String(value);
}

export function formatPercent(value) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  const number = Number(value);
  if (Number.isNaN(number)) {
    return String(value);
  }

  return `${number.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
}

export function formatEnergy(value, unit = "mWh") {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  const number = Number(value);
  if (Number.isNaN(number)) {
    return String(value);
  }

  return `${number.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`;
}

export function formatWattHoursFromMilliwattHours(value) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  const number = Number(value);
  if (Number.isNaN(number)) {
    return String(value);
  }

  return `${(number / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} Wh`;
}

export function formatPowerMw(value) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  const number = Number(value);
  if (Number.isNaN(number)) {
    return String(value);
  }

  return `${number.toLocaleString(undefined, { maximumFractionDigits: 2 })} mW`;
}

export function formatWattsFromMilliwatts(value) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  const number = Number(value);
  if (Number.isNaN(number)) {
    return String(value);
  }

  return `${(number / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} W`;
}

export function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
}

export function formatDuration(seconds) {
  if (seconds === undefined || seconds === null || seconds === "") {
    return "-";
  }

  const totalSeconds = Number(seconds);
  if (Number.isNaN(totalSeconds)) {
    return String(seconds);
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours} ч ${String(minutes).padStart(2, "0")} мин`;
  }

  if (minutes > 0) {
    return `${minutes} мин ${remainingSeconds} с`;
  }

  return `${remainingSeconds} с`;
}
