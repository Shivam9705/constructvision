import api from "./api";
import type { Project, CreateProjectPayload } from "@/types";

export const projectsApi = {
  list: () =>
    api.get<{ projects: Project[]; total: number }>("/projects"),

  get: (id: string) =>
    api.get<Project>(`/projects/${id}`),

  create: (payload: CreateProjectPayload) =>
    api.post<Project>("/projects", payload),

  update: (id: string, payload: Partial<CreateProjectPayload>) =>
    api.put<Project>(`/projects/${id}`, payload),

  delete: (id: string) =>
    api.delete(`/projects/${id}`),

  stats: () =>
    api.get<{
      total_projects: number;
      draft: number;
      estimated: number;
      exported: number;
      by_type: Record<string, number>;
    }>("/projects/stats"),

  uploadBlueprint: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<Project>(`/projects/${id}/upload`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
