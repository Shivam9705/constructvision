"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/projects": "Projects",
  "/dashboard/projects/new": "New Project",
  "/dashboard/settings": "Settings",
};

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.includes("/dashboard/projects/") && pathname.endsWith("/edit"))
    return "Edit Project";
  if (pathname.includes("/dashboard/projects/"))
    return "Project Details";
  return "ConstructVision AI";
}

export default function Topbar() {
  const pathname = usePathname();

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10 flex items-center px-6 gap-4">
      {/* Mobile menu button (wired in parent for real apps) */}
      <button className="lg:hidden text-muted-foreground hover:text-foreground transition-colors">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1">
        <h1 className="text-base font-semibold">{getTitle(pathname)}</h1>
      </div>

      {/* Right slot — reserved for notifications / avatar in later days */}
      <div className="flex items-center gap-2">
        <div className="text-[11px] text-muted-foreground border border-border rounded-full px-2.5 py-0.5 hidden sm:block">
          Gemini 1.5 Pro
        </div>
      </div>
    </header>
  );
}
