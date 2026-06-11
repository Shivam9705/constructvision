"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Info } from "lucide-react";
import { cn, INDIAN_STATES } from "@/lib/utils";
import { useCreateProject, useUpdateProject } from "@/hooks/useProjects";
import type { Project } from "@/types";

const schema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  project_type: z.enum(["residential", "commercial", "industrial", "institutional"]),
  city: z.string().optional(),
  state: z.string().optional(),
  total_area_sqft: z.coerce.number().positive("Area must be positive").optional().or(z.literal("")),
  num_floors: z.coerce.number().int().min(1).max(200).default(1),
  finish_quality: z.enum(["basic", "standard", "premium", "luxury"]),
  description: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof schema>;

const PROJECT_TYPES = [
  { value: "residential", label: "Residential", desc: "Houses, villas, apartments" },
  { value: "commercial", label: "Commercial", desc: "Offices, malls, hotels" },
  { value: "industrial", label: "Industrial", desc: "Factories, warehouses" },
  { value: "institutional", label: "Institutional", desc: "Schools, hospitals, govt" },
] as const;

const FINISH_QUALITIES = [
  { value: "basic", label: "Basic", desc: "Economy grade materials", color: "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40" },
  { value: "standard", label: "Standard", desc: "Mid-range materials", color: "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40" },
  { value: "premium", label: "Premium", desc: "High-quality finishes", color: "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40" },
  { value: "luxury", label: "Luxury", desc: "Top-of-the-line", color: "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40" },
] as const;

interface ProjectFormProps {
  project?: Project; // If provided, form is in edit mode
}

export default function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const isEdit = !!project;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: project?.name ?? "",
      project_type: (project?.project_type as any) ?? "residential",
      city: project?.city ?? "",
      state: project?.state ?? "",
      total_area_sqft: project?.total_area_sqft ?? ("" as any),
      num_floors: project?.num_floors ?? 1,
      finish_quality: (project?.finish_quality as any) ?? "standard",
      description: project?.description ?? "",
    },
  });

  const selectedType = watch("project_type");
  const selectedQuality = watch("finish_quality");

  const onSubmit = async (data: FormValues) => {
    const payload = {
      ...data,
      total_area_sqft: data.total_area_sqft === "" ? undefined : Number(data.total_area_sqft),
    };

    if (isEdit && project) {
      await updateProject.mutateAsync({ id: project.id, payload });
      router.push(`/dashboard/projects/${project.id}`);
    } else {
      const created = await createProject.mutateAsync(payload as any);
      router.push(`/dashboard/projects/${created.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      {/* Project name */}
      <section className="space-y-3">
        <div>
          <label className="text-sm font-semibold" htmlFor="name">
            Project name <span className="text-destructive">*</span>
          </label>
          <p className="text-xs text-muted-foreground">Give your project a clear, descriptive name</p>
        </div>
        <input
          id="name"
          type="text"
          placeholder="e.g. Sharma Residence, 3BHK Duplex"
          className="w-full h-11 px-3.5 rounded-lg border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          {...register("name")}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </section>

      {/* Project type */}
      <section className="space-y-3">
        <div>
          <label className="text-sm font-semibold">Project type <span className="text-destructive">*</span></label>
          <p className="text-xs text-muted-foreground">Affects material rates and structural calculations</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PROJECT_TYPES.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("project_type", value, { shouldValidate: true })}
              className={cn(
                "flex flex-col items-start p-3.5 rounded-lg border-2 text-left transition-all",
                selectedType === value
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30"
                  : "border-border hover:border-brand-200 dark:hover:border-brand-800"
              )}
            >
              <span className="text-sm font-semibold leading-tight">{label}</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">{desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Location */}
      <section className="space-y-3">
        <div>
          <label className="text-sm font-semibold">Location</label>
          <p className="text-xs text-muted-foreground">
            Rates vary by state — affects AI estimation accuracy
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              placeholder="e.g. Mumbai, Delhi"
              className="w-full h-10 px-3 rounded-lg border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              {...register("city")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="state">State</label>
            <select
              id="state"
              className="w-full h-10 px-3 rounded-lg border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              {...register("state")}
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Area + floors */}
      <section className="space-y-3">
        <div>
          <label className="text-sm font-semibold">Project dimensions</label>
          <p className="text-xs text-muted-foreground">Used for cost-per-sqft calculations</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="area">
              Total built-up area (sq.ft)
            </label>
            <input
              id="area"
              type="number"
              placeholder="e.g. 2400"
              min="1"
              className="w-full h-10 px-3 rounded-lg border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              {...register("total_area_sqft")}
            />
            {errors.total_area_sqft && (
              <p className="text-xs text-destructive">{errors.total_area_sqft.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="floors">
              Number of floors
            </label>
            <input
              id="floors"
              type="number"
              min="1"
              max="200"
              className="w-full h-10 px-3 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              {...register("num_floors")}
            />
            {errors.num_floors && (
              <p className="text-xs text-destructive">{errors.num_floors.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Finish quality */}
      <section className="space-y-3">
        <div>
          <label className="text-sm font-semibold">Finish quality <span className="text-destructive">*</span></label>
          <p className="text-xs text-muted-foreground">
            Determines material grade — major cost driver (can vary 2–4× between basic and luxury)
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {FINISH_QUALITIES.map(({ value, label, desc, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("finish_quality", value, { shouldValidate: true })}
              className={cn(
                "flex flex-col items-start p-3.5 rounded-lg border-2 text-left transition-all",
                selectedQuality === value
                  ? `border-2 ${color}`
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">{desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Description */}
      <section className="space-y-3">
        <div>
          <label className="text-sm font-semibold" htmlFor="description">
            Project description
            <span className="ml-2 text-xs text-muted-foreground font-normal">(optional)</span>
          </label>
          <p className="text-xs text-muted-foreground">
            More detail = better AI estimates. Include special requirements, site conditions, etc.
          </p>
        </div>
        <textarea
          id="description"
          rows={4}
          placeholder="e.g. G+2 residential bungalow, Vastu-compliant layout, earthquake zone III, RCC framed structure, modular kitchen, 3 bathrooms with imported tiles..."
          className="w-full px-3.5 py-3 rounded-lg border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none leading-relaxed"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </section>

      {/* AI note */}
      <div className="flex items-start gap-2.5 bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 rounded-lg p-3.5">
        <Info className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
        <p className="text-xs text-brand-700 dark:text-brand-300 leading-relaxed">
          After creating this project, you can run{" "}
          <strong>AI Cost Estimation</strong> to generate a full BOQ with 40–60 line items
          in under 60 seconds. You can also upload a floor plan image for better accuracy.
        </p>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || createProject.isPending || updateProject.isPending}
          className="flex items-center gap-2 h-11 px-6 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {(isSubmitting || createProject.isPending || updateProject.isPending) ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isEdit ? "Saving…" : "Creating…"}
            </>
          ) : (
            <>
              {isEdit ? "Save changes" : "Create project"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="h-11 px-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
