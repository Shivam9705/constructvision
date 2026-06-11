import api from "./api";
import type { Estimation, BOQItem } from "@/types";

export const estimationApi = {
  run: (projectId: string, useBlueprint = false) =>
    api.post<Estimation>("/estimate", {
      project_id: projectId,
      use_blueprint: useBlueprint,
    }),

  getLatest: (projectId: string) =>
    api.get<Estimation>(`/estimate/project/${projectId}/latest`),

  getAll: (projectId: string) =>
    api.get<Estimation[]>(`/estimate/project/${projectId}`),

  getById: (estimationId: string) =>
    api.get<Estimation>(`/estimate/${estimationId}`),

  updateBOQItem: (itemId: string, data: { quantity?: number; rate?: number }) =>
    api.patch<BOQItem>(`/estimate/boq/${itemId}`, data),
};

export const boqApi = {
  addItem: (estimationId: string, data: {
    category: string; description: string;
    unit: string; quantity: number; rate: number;
  }) => api.post<import("@/types").BOQItem>(`/estimate/${estimationId}/items`, data),

  deleteItem: (itemId: string) =>
    api.delete(`/estimate/boq/${itemId}`),

  getMaterials: (estimationId: string) =>
    api.get<import("@/types").MaterialSchedule>(`/estimate/${estimationId}/materials`),
};

export const exportApi = {
  preview: (estimationId: string) =>
    api.get<{
      project_name: string;
      estimation_id: string;
      total_cost: number;
      item_count: number;
      version: number;
      created_at: string;
      pdf_url: string;
      excel_url: string;
    }>(`/export/preview/${estimationId}`),

  downloadPDF: (estimationId: string) =>
    api.get(`/export/pdf/${estimationId}`, { responseType: "blob" }),

  downloadExcel: (estimationId: string) =>
    api.get(`/export/excel/${estimationId}`, { responseType: "blob" }),
};
