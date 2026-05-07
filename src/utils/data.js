export function normalizeUser(value) {
  if (!value) {
    return null;
  }

  if (value.user) {
    return value.user;
  }

  if (value.data?.user) {
    return value.data.user;
  }

  if (value.user_id || value.email) {
    return value;
  }

  return null;
}

export function asArray(value, keys = []) {
  if (Array.isArray(value)) {
    return value;
  }

  for (const key of keys) {
    if (Array.isArray(value?.[key])) {
      return value[key];
    }
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  return [];
}

export function pick(value, keys, fallback = null) {
  for (const key of keys) {
    const candidate = value?.[key];
    if (candidate !== undefined && candidate !== null && candidate !== "") {
      return candidate;
    }
  }

  return fallback;
}

export function getDeviceId(device) {
  return pick(device, ["device_id", "id", "_id", "uuid"]);
}

export function getDeviceName(device) {
  return pick(device, ["device_name", "name", "title", "label"], getDeviceId(device) || "Устройство");
}

export function getCycleId(cycle) {
  return pick(cycle, ["cycle_id", "id", "_id", "equivalent_cycle_id"]);
}
