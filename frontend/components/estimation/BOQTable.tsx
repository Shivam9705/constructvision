"use client";

import { useState, useCallback } from "react";
import { Pencil, Check, X, PenLine, PlusCircle, Trash2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useUpdateBOQItem, useAddBOQItem, useDeleteBOQItem } from "@/hooks/useEstimation";
import type { BOQItem, Estimation } from "@/types";

const CATEGORY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  civil:        { label: "Civil Work",    color: "text-blue-700 dark:text-blue-300   bg-blue-50   dark:bg-blue-950/40   border-blue-200 dark:border-blue-800",    dot: "bg-blue-500"   },
  civil_work:   { label: "Civil Work",    color: "text-blue-700 dark:text-blue-300   bg-blue-50   dark:bg-blue-950/40   border-blue-200 dark:border-blue-800",    dot: "bg-blue-500"   },
  finishing:    { label: "Finishing",     color: "text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800", dot: "bg-purple-500" },
  electrical:   { label: "Electrical",   color: "text-amber-700 dark:text-amber-300  bg-amber-50  dark:bg-amber-950/40  border-amber-200 dark:border-amber-800",  dot: "bg-amber-500"  },
  plumbing:     { label: "Plumbing",     color: "text-cyan-700  dark:text-cyan-300   bg-cyan-50   dark:bg-cyan-950/40   border-cyan-200 dark:border-cyan-800",   dot: "bg-cyan-500"   },
  external:     { label: "External Work",color: "text-green-700 dark:text-green-300  bg-green-50  dark:bg-green-950/40  border-green-200 dark:border-green-800", dot: "bg-green-500"  },
  external_work:{ label: "External Work",color: "text-green-700 dark:text-green-300  bg-green-50  dark:bg-green-950/40  border-green-200 dark:border-green-800", dot: "bg-green-500"  },
};
const getCfg = (cat: string) => CATEGORY_CONFIG[cat.toLowerCase()] ?? { label: cat, color: "text-slate-700 bg-slate-50 border-slate-200", dot: "bg-slate-400" };
const CATEGORY_ORDER = ["civil","civil_work","plumbing","electrical","finishing","external","external_work"];

// ── Inline editable number cell ───────────────────────────────────────────────
function EditCell({ value, onSave }: { value: number; onSave:(v:number)=>void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const commit = () => {
    const n = parseFloat(draft);
    if (!isNaN(n) && n >= 0) onSave(n);
    setEditing(false);
  };

  if (editing) return (
    <div className="flex items-center gap-1">
      <input autoFocus type="number" min="0" value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if(e.key==="Enter") commit(); if(e.key==="Escape") setEditing(false); }}
        className="w-24 h-7 px-2 text-xs border border-brand-400 rounded bg-card focus:outline-none" />
      <button onClick={commit} className="text-emerald-600"><Check className="w-3.5 h-3.5"/></button>
      <button onClick={()=>setEditing(false)} className="text-muted-foreground"><X className="w-3.5 h-3.5"/></button>
    </div>
  );

  return (
    <button onClick={()=>{ setDraft(String(value)); setEditing(true); }}
      className="group flex items-center gap-1 tabular-nums hover:text-brand-600 transition-colors">
      {value?.toLocaleString("en-IN",{maximumFractionDigits:2})}
      <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity"/>
    </button>
  );
}

// ── Add item modal ────────────────────────────────────────────────────────────
function AddItemModal({ estimationId, projectId, onClose }: {
  estimationId: string; projectId: string; onClose: ()=>void;
}) {
  const addItem = useAddBOQItem(estimationId, projectId);
  const [form, setForm] = useState({ category:"civil", description:"", unit:"ls", quantity:"1", rate:"0" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addItem.mutateAsync({
      category: form.category,
      description: form.description,
      unit: form.unit,
      quantity: parseFloat(form.quantity)||1,
      rate: parseFloat(form.rate)||0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Add BOQ Item</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4"/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}
                className="w-full h-9 px-2.5 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-brand-500">
                {["civil","finishing","electrical","plumbing","external"].map(c=>(
                  <option key={c} value={c} className="capitalize">{getCfg(c).label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Unit</label>
              <select value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}
                className="w-full h-9 px-2.5 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-brand-500">
                {["sqm","cum","rmt","nos","kg","MT","ls"].map(u=><option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <input type="text" required placeholder="e.g. MS Grille for compound wall" value={form.description}
              onChange={e=>setForm(f=>({...f,description:e.target.value}))}
              className="w-full h-9 px-3 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-brand-500"/>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Quantity</label>
              <input type="number" min="0" step="any" value={form.quantity}
                onChange={e=>setForm(f=>({...f,quantity:e.target.value}))}
                className="w-full h-9 px-3 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-brand-500"/>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Rate (₹)</label>
              <input type="number" min="0" step="any" value={form.rate}
                onChange={e=>setForm(f=>({...f,rate:e.target.value}))}
                className="w-full h-9 px-3 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-brand-500"/>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Amount: <span className="font-semibold text-foreground">
                {formatCurrency((parseFloat(form.quantity)||0)*(parseFloat(form.rate)||0))}
              </span>
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={onClose}
                className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={addItem.isPending}
                className="h-8 px-4 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors disabled:opacity-60">
                {addItem.isPending ? "Adding…" : "Add Item"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main BOQ Table ────────────────────────────────────────────────────────────
export default function BOQTable({ estimation }: { estimation: Estimation }) {
  const [showAdd, setShowAdd] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const updateItem = useUpdateBOQItem(estimation.project_id);
  const deleteItem = useDeleteBOQItem(estimation.project_id);

  const handleUpdate = useCallback((itemId: string, field: "quantity"|"rate", value: number) => {
    updateItem.mutate({ itemId, data: { [field]: value } });
  }, [updateItem]);

  const toggleCategory = (cat: string) => {
    setCollapsed(prev => { const s = new Set(prev); s.has(cat) ? s.delete(cat) : s.add(cat); return s; });
  };

  // Group by category
  const grouped = estimation.boq_items.reduce<Record<string, BOQItem[]>>((acc, item) => {
    const c = item.category.toLowerCase();
    (acc[c] = acc[c]||[]).push(item);
    return acc;
  }, {});
  const cats = Object.keys(grouped).sort((a,b) => CATEGORY_ORDER.indexOf(a)-CATEGORY_ORDER.indexOf(b));

  return (
    <>
      {showAdd && (
        <AddItemModal
          estimationId={estimation.id}
          projectId={estimation.project_id}
          onClose={() => setShowAdd(false)}
        />
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-secondary/40">
          <div className="flex items-center gap-2">
            <PenLine className="w-4 h-4 text-muted-foreground"/>
            <h3 className="text-sm font-semibold">Bill of Quantities</h3>
            <span className="text-xs text-muted-foreground">({estimation.boq_items.length} items)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground hidden sm:block">Click qty/rate to edit</span>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 h-7 px-2.5 text-xs font-medium bg-brand-500 hover:bg-brand-600 text-white rounded-md transition-colors">
              <PlusCircle className="w-3.5 h-3.5"/> Add Item
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/20">
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground w-16">Code</th>
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Description</th>
                <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground w-14">Unit</th>
                <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground w-24">Qty</th>
                <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground w-28">Rate (₹)</th>
                <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground w-28">Amount (₹)</th>
                <th className="w-8 px-2"/>
              </tr>
            </thead>
            <tbody>
              {cats.map(cat => {
                const items = grouped[cat];
                const subtotal = items.reduce((s,i) => s+(i.amount??0), 0);
                const cfg = getCfg(cat);
                const isCollapsed = collapsed.has(cat);

                return (
                  <> 
                    {/* Category header */}
                    <tr key={`hdr-${cat}`} className="border-b border-border">
                      <td colSpan={7} className="px-4 py-2">
                        <button onClick={() => toggleCategory(cat)}
                          className="flex items-center gap-2 w-full text-left hover:opacity-80 transition-opacity">
                          <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border", cfg.color)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)}/>
                            {cfg.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {isCollapsed ? `▸ ${items.length} items hidden` : `▾ ${items.length} items`}
                          </span>
                        </button>
                      </td>
                    </tr>

                    {/* Items (collapsible) */}
                    {!isCollapsed && items.map(item => (
                      <tr key={item.id}
                        className={cn("border-b border-border/40 hover:bg-secondary/30 transition-colors group",
                          item.is_user_edited && "bg-brand-50/20 dark:bg-brand-950/10")}>
                        <td className="px-4 py-2.5 text-muted-foreground font-mono text-[10px]">{item.item_code}</td>
                        <td className="px-4 py-2.5 max-w-xs">
                          <span className="leading-snug">{item.description}</span>
                          {item.is_user_edited && (
                            <span className="ml-1.5 text-[10px] text-brand-500 font-medium">edited</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center text-muted-foreground uppercase tracking-wide">{item.unit}</td>
                        <td className="px-4 py-2.5 text-right">
                          <EditCell value={item.quantity??0} onSave={v=>handleUpdate(item.id,"quantity",v)}/>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <EditCell value={item.rate??0} onSave={v=>handleUpdate(item.id,"rate",v)}/>
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                          {formatCurrency(item.amount??0)}
                        </td>
                        <td className="px-2 py-2.5">
                          <button onClick={()=>deleteItem.mutate(item.id)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                            <Trash2 className="w-3.5 h-3.5"/>
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Subtotal */}
                    <tr key={`sub-${cat}`} className="border-b-2 border-border bg-secondary/30">
                      <td colSpan={6} className="px-4 py-2 text-right text-[11px] font-semibold text-muted-foreground">
                        {cfg.label} Subtotal
                      </td>
                      <td className="px-4 py-2 text-right text-[11px] font-bold tabular-nums">
                        {formatCurrency(subtotal)}
                      </td>
                    </tr>
                  </>
                );
              })}

              {/* Grand total */}
              <tr className="bg-concrete-950 dark:bg-concrete-900">
                <td colSpan={6} className="px-4 py-4 text-right text-sm font-bold text-concrete-100">
                  TOTAL PROJECT COST (incl. 5% Contingency)
                </td>
                <td className="px-4 py-4 text-right text-sm font-bold text-brand-400 tabular-nums">
                  {formatCurrency(estimation.total_cost??0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
