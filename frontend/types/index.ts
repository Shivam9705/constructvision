// ── User ──────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthTokens {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
}

// ── Project ───────────────────────────────────────────────────────────────────
export type ProjectType = "residential" | "commercial" | "industrial" | "institutional";
export type FinishQuality = "basic" | "standard" | "premium" | "luxury";
export type ProjectStatus = "draft" | "estimated" | "exported";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  project_type: ProjectType;
  location?: string;
  city?: string;
  state?: string;
  total_area_sqft?: number;
  num_floors: number;
  finish_quality: FinishQuality;
  description?: string;
  blueprint_url?: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectPayload {
  name: string;
  project_type: ProjectType;
  city?: string;
  state?: string;
  total_area_sqft?: number;
  num_floors?: number;
  finish_quality?: FinishQuality;
  description?: string;
}

// ── API response wrapper ───────────────────────────────────────────────────────
export interface ApiError {
  detail: string;
}


// ── Estimation ────────────────────────────────────────────────────────────────
export interface BOQItem {
  id: string;
  estimation_id: string;
  category: string;
  item_code?: string;
  description: string;
  unit: string;
  quantity?: number;
  rate?: number;
  amount?: number;
  is_user_edited: boolean;
  sort_order: number;
}

export interface EstimationBreakdown {
  civil_work: number;
  finishing: number;
  electrical: number;
  plumbing: number;
  external_work: number;
  contingency: number;
}

export interface Estimation {
  id: string;
  project_id: string;
  total_cost?: number;
  cost_per_sqft?: number;
  civil_work_cost?: number;
  finishing_cost?: number;
  electrical_cost?: number;
  plumbing_cost?: number;
  contingency_pct?: number;
  contingency_cost?: number;
  ai_confidence?: "low" | "medium" | "high";
  ai_notes?: string;
  version: number;
  created_at: string;
  boq_items: BOQItem[];
}

// ── Material Schedule ─────────────────────────────────────────────────────────
export interface MaterialItem {
  material: string;
  specification: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  category: string;
}

export interface MaterialSchedule {
  estimation_id: string;
  items: MaterialItem[];
  total_material_cost: number;
}
