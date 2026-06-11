"use client";

import { useState } from "react";
import {
  FileText, FileSpreadsheet, Download, CheckCircle2,
  Loader2, Share2, Copy, ExternalLink, Info
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import { exportApi } from "@/lib/estimation";
import type { Estimation, Project } from "@/types";

interface ExportPanelProps {
  estimation: Estimation;
  project: Project;
}

type ExportFormat = "pdf" | "excel";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportPanel({ estimation, project }: ExportPanelProps) {
  const [loading, setLoading] = useState<ExportFormat | null>(null);
  const [done, setDone]       = useState<ExportFormat | null>(null);
  const [copied, setCopied]   = useState(false);

  const handleDownload = async (format: ExportFormat) => {
    setLoading(format);
    setDone(null);
    try {
      const res = format === "pdf"
        ? await exportApi.downloadPDF(estimation.id)
        : await exportApi.downloadExcel(estimation.id);

      const ext      = format === "pdf" ? "pdf" : "xlsx";
      const safeName = project.name.replace(/[^a-zA-Z0-9 _-]/g, "").slice(0, 40).trim();
      const date     = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const filename = `BOQ_${safeName}_${date}.${ext}`;

      triggerDownload(new Blob([res.data]), filename);
      setDone(format);
      toast.success(`${format.toUpperCase()} downloaded!`);
    } catch (err: any) {
      toast.error(err.message || `Failed to export ${format.toUpperCase()}`);
    } finally {
      setLoading(null);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/dashboard/projects/${project.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const itemCount  = estimation.boq_items?.length ?? 0;
  const totalCost  = estimation.total_cost ?? 0;
  const categories = [...new Set(estimation.boq_items?.map(i => i.category) ?? [])].length;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Export BOQ</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Download professional documents for tender submission
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* Export meta */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "BOQ Items",   value: itemCount },
            { label: "Categories",  value: categories },
            { label: "Version",     value: `v${estimation.version}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-secondary/50 rounded-lg py-2 px-1">
              <p className="text-sm font-bold">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* PDF Export */}
        <ExportButton
          icon={FileText}
          iconColor="text-red-500"
          iconBg="bg-red-50 dark:bg-red-950/40"
          title="PDF Report"
          description="Professional BOQ with header, breakdown bars, and disclaimer"
          badge="A4 · Print-ready"
          format="pdf"
          loading={loading === "pdf"}
          done={done === "pdf"}
          onClick={() => handleDownload("pdf")}
        />

        {/* Excel Export */}
        <ExportButton
          icon={FileSpreadsheet}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          title="Excel Workbook"
          description="3 sheets: Summary dashboard, full BOQ, category totals + bar chart"
          badge="3 sheets · Editable"
          format="excel"
          loading={loading === "excel"}
          done={done === "excel"}
          onClick={() => handleDownload("excel")}
        />

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Share link */}
        <div>
          <p className="text-xs font-medium mb-2">Share project link</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-8 px-3 bg-secondary/50 rounded-lg flex items-center overflow-hidden">
              <span className="text-[11px] text-muted-foreground truncate">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/dashboard/projects/${project.id}`
                  : `/dashboard/projects/${project.id}`}
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-lg border transition-all",
                copied
                  ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                  : "border-border hover:bg-secondary text-muted-foreground"
              )}
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* AI disclaimer note */}
        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
            AI-generated estimate. Verify with a licensed QS before tender submission.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Export button sub-component ───────────────────────────────────────────────
function ExportButton({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  badge,
  format,
  loading,
  done,
  onClick,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  badge: string;
  format: string;
  loading: boolean;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
        done
          ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800"
          : loading
          ? "border-brand-300 bg-brand-50 dark:bg-brand-950/20 opacity-80 cursor-not-allowed"
          : "border-border hover:border-brand-300 dark:hover:border-brand-700 hover:bg-secondary/50"
      )}
    >
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5", iconBg)}>
        {loading ? (
          <Loader2 className={cn("w-4 h-4 animate-spin", iconColor)} />
        ) : done ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <Icon className={cn("w-4 h-4", iconColor)} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold leading-tight">{title}</p>
          <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full hidden sm:block">
            {badge}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        {done && (
          <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Downloaded
          </p>
        )}
        {loading && (
          <p className="text-[11px] text-brand-500 font-medium mt-1">Generating…</p>
        )}
      </div>
      {!loading && !done && (
        <Download className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
      )}
    </button>
  );
}
