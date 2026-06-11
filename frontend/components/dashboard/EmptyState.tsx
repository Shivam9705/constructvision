import Link from "next/link";
import { FolderOpen, PlusCircle } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-5">
        <FolderOpen className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-1.5">No projects yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Create your first construction project and let AI generate a complete cost estimate and BOQ.
      </p>
      <Link
        href="/dashboard/projects/new"
        className="inline-flex items-center gap-2 h-9 px-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <PlusCircle className="w-4 h-4" />
        Create first project
      </Link>
    </div>
  );
}
