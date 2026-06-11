"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, ImageIcon, Loader2, CheckCircle2, FileImage, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadBlueprint } from "@/hooks/useProjects";
import type { Project } from "@/types";

interface BlueprintUploadProps {
  project: Project;
}

export default function BlueprintUpload({ project }: BlueprintUploadProps) {
  const [dragOver, setDragOver]     = useState(false);
  const [preview,  setPreview]      = useState<string | null>(null);
  const [lightbox, setLightbox]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const upload  = useUploadBlueprint();

  const existingUrl = project.blueprint_url
    ? `${process.env.NEXT_PUBLIC_API_URL}${project.blueprint_url}`
    : null;

  const handleFile = useCallback((file: File) => {
    const allowed = ["image/jpeg","image/png","image/webp","image/gif","application/pdf"];
    if (!allowed.includes(file.type)) {
      alert("Only JPEG, PNG, WebP, GIF or PDF files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Maximum size is 10 MB.");
      return;
    }
    // Show local preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    upload.mutate({ id: project.id, file });
  }, [project.id, upload]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ""; // reset so same file can be re-selected
  };

  const displayUrl = preview || existingUrl;

  return (
    <>
      {/* Lightbox */}
      {lightbox && displayUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightbox(false)}
          >
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt="Blueprint"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-secondary/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileImage className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Blueprint / Floor Plan</h3>
          </div>
          {existingUrl && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Uploaded
            </span>
          )}
        </div>

        <div className="p-4 space-y-3">
          {/* Existing / preview image */}
          {displayUrl && (
            <div className="relative group rounded-lg overflow-hidden border border-border bg-secondary/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl}
                alt="Floor plan blueprint"
                className="w-full h-40 object-contain"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => setLightbox(true)}
                  className="flex items-center gap-1.5 h-8 px-3 bg-white text-sm font-medium rounded-lg text-slate-800 hover:bg-white/90 transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" /> View full
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 h-8 px-3 bg-brand-500 text-sm font-medium rounded-lg text-white hover:bg-brand-600 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" /> Replace
                </button>
              </div>
            </div>
          )}

          {/* Drop zone */}
          {!displayUrl && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                dragOver
                  ? "border-brand-400 bg-brand-50 dark:bg-brand-950/20"
                  : "border-border hover:border-brand-300 dark:hover:border-brand-700 hover:bg-secondary/50"
              )}
            >
              {upload.isPending ? (
                <div className="space-y-2">
                  <Loader2 className="w-8 h-8 mx-auto text-brand-500 animate-spin" />
                  <p className="text-sm font-medium text-brand-600">Uploading…</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-secondary mx-auto flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">
                    Drop floor plan here or{" "}
                    <span className="text-brand-500">click to browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG, WebP, PDF · Max 10 MB
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Upload loading overlay over existing image */}
          {upload.isPending && displayUrl && (
            <div className="flex items-center gap-2 text-sm text-brand-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading new blueprint…
            </div>
          )}

          {/* Info tip */}
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Uploading a floor plan enables <strong>Gemini Vision analysis</strong> — AI reads
            room areas and adjusts quantities automatically for higher accuracy.
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      </div>
    </>
  );
}
