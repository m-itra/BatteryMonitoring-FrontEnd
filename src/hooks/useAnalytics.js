import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteCycle,
  deleteDevice,
  excludeCycle,
  getDashboardAnalytics,
  getDeviceAnalytics,
  getDeviceCycles,
  getDevices,
  includeCycle,
  renameDevice,
} from "../api/analytics";

const DEVICE_ANALYTICS_REFETCH_INTERVAL_MS = 7000;

function invalidateDeviceData(queryClient, deviceId) {
  queryClient.invalidateQueries({ queryKey: ["analytics"] });
  queryClient.invalidateQueries({ queryKey: ["devices"] });
  queryClient.invalidateQueries({ queryKey: ["device", deviceId] });
  queryClient.invalidateQueries({ queryKey: ["cycles", deviceId] });
}

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: getDashboardAnalytics,
    refetchInterval: DEVICE_ANALYTICS_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
}

export function useDevices() {
  return useQuery({
    queryKey: ["devices"],
    queryFn: getDevices,
    refetchInterval: DEVICE_ANALYTICS_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
}

export function useDeviceAnalytics(deviceId) {
  return useQuery({
    queryKey: ["device", deviceId],
    queryFn: () => getDeviceAnalytics(deviceId),
    enabled: Boolean(deviceId),
    refetchInterval: DEVICE_ANALYTICS_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
}

export function useDeviceCycles(deviceId) {
  return useQuery({
    queryKey: ["cycles", deviceId],
    queryFn: () => getDeviceCycles(deviceId),
    enabled: Boolean(deviceId),
  });
}

export function useRenameDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: renameDevice,
    onSuccess: (_, variables) => invalidateDeviceData(queryClient, variables.deviceId),
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDevice,
    onSuccess: (_, deviceId) => invalidateDeviceData(queryClient, deviceId),
  });
}

export function useExcludeCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: excludeCycle,
    onSuccess: (_, variables) => invalidateDeviceData(queryClient, variables.deviceId),
  });
}

export function useIncludeCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: includeCycle,
    onSuccess: (_, variables) => invalidateDeviceData(queryClient, variables.deviceId),
  });
}

export function useDeleteCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCycle,
    onSuccess: (_, variables) => invalidateDeviceData(queryClient, variables.deviceId),
  });
}
