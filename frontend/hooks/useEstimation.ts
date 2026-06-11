"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { estimationApi, boqApi } from "@/lib/estimation";

export const estimationKey = (projectId: string) =>
  ["estimation", "latest", projectId] as const;

export function useLatestEstimation(projectId: string) {
  return useQuery({
    queryKey: estimationKey(projectId),
    queryFn: () => estimationApi.getLatest(projectId).then((r) => r.data),
    enabled: !!projectId,
    retry: false,         // 404 means no estimation yet — don't retry
  });
}

export function useAllEstimations(projectId: string) {
  return useQuery({
    queryKey: ["estimations", projectId],
    queryFn: () => estimationApi.getAll(projectId).then((r) => r.data),
    enabled: !!projectId,
  });
}

export function useRunEstimation(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (useBlueprint = false) =>
      estimationApi.run(projectId, useBlueprint).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: estimationKey(projectId) });
      qc.invalidateQueries({ queryKey: ["estimations", projectId] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Estimation complete!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "AI estimation failed. Please try again.");
    },
  });
}

export function useUpdateBOQItem(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: { quantity?: number; rate?: number };
    }) => estimationApi.updateBOQItem(itemId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: estimationKey(projectId) });
      toast.success("Item updated");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Update failed");
    },
  });
}

export function useAddBOQItem(estimationId: string, projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      category: string; description: string;
      unit: string; quantity: number; rate: number;
    }) => boqApi.addItem(estimationId, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: estimationKey(projectId) });
      toast.success("Item added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteBOQItem(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => boqApi.deleteItem(itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: estimationKey(projectId) });
      toast.success("Item removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMaterialSchedule(estimationId: string) {
  return useQuery({
    queryKey: ["materials", estimationId],
    queryFn: () => boqApi.getMaterials(estimationId).then(r => r.data),
    enabled: !!estimationId,
  });
}
