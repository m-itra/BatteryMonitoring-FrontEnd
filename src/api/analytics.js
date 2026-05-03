import { api } from "./client";

export async function getDashboardAnalytics() {
  const { data } = await api.get("/analytics");
  return data;
}

export async function getDevices() {
  const { data } = await api.get("/analytics/devices");
  return data;
}

export async function getDeviceAnalytics(deviceId) {
  const { data } = await api.get(`/analytics/devices/${encodeURIComponent(deviceId)}`, {
    params: {
      session_limit: 50,
      cycle_limit: 50,
    },
  });
  return data;
}

export async function getDeviceCycles(deviceId) {
  const { data } = await api.get("/analytics/cycles", {
    params: {
      device_id: deviceId,
      limit: 50,
      include_excluded: true,
    },
  });
  return data;
}

export async function renameDevice({ deviceId, deviceName }) {
  const { data } = await api.put(`/analytics/devices/${encodeURIComponent(deviceId)}`, {
    device_name: deviceName,
  });
  return data;
}

export async function deleteDevice(deviceId) {
  const { data } = await api.delete(`/analytics/devices/${encodeURIComponent(deviceId)}`);
  return data;
}

export async function excludeCycle({ deviceId, cycleId }) {
  const { data } = await api.post(
    `/analytics/devices/${encodeURIComponent(deviceId)}/cycles/${encodeURIComponent(cycleId)}/exclude`,
  );
  return data;
}

export async function includeCycle({ deviceId, cycleId }) {
  const { data } = await api.post(
    `/analytics/devices/${encodeURIComponent(deviceId)}/cycles/${encodeURIComponent(cycleId)}/include`,
  );
  return data;
}

export async function deleteCycle({ deviceId, cycleId }) {
  const { data } = await api.delete(
    `/analytics/devices/${encodeURIComponent(deviceId)}/cycles/${encodeURIComponent(cycleId)}`,
  );
  return data;
}
