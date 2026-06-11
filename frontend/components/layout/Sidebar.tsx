"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, FolderOpen, PlusCircle,
  Settings, LogOut, HardHat, ChevronRight,
  Zap, GitCompare,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",            label: "Dashboard",  icon: LayoutDashboard },
  { href: "/dashboard/projects",   label: "Projects",   icon: FolderOpen      },
  { href: "/dashboard/projects/new",label:"New Project",icon: PlusCircle      },
  { href: "/dashboard/compare",    label: "Compare",    icon: GitCompare      },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-border">
        <div className="w-8 h-8 bg-brand-500 rounded-md flex items-center justify-center shrink-0">
          <HardHat className="w-4 h-4 text-white"/>
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight tracking-tight">ConstructVision</p>
          <p className="text-[10px] text-muted-foreground leading-tight">AI Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2">Menu</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                active ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                       : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}>
              <Icon className={cn("w-4 h-4 shrink-0", active && "text-brand-500")}/>
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 text-brand-400"/>}
            </Link>
          );
        })}

        {/* AI badge */}
        <div className="mt-6 mx-2 rounded-lg border border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-950/30 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3.5 h-3.5 text-brand-500"/>
            <p className="text-xs font-semibold text-brand-700 dark:text-brand-400">AI Ready</p>
          </div>
          <p className="text-[11px] text-brand-600/70 dark:text-brand-500/70 leading-relaxed">
            Gemini 2.0 Flash powers cost estimation. Create a project to start.
          </p>
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-3 space-y-0.5">
        <Link href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
            pathname === "/dashboard/settings"
              ? "bg-brand-500/10 text-brand-600"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}>
          <Settings className="w-4 h-4"/>Settings
        </Link>
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-concrete-200 dark:bg-concrete-700 flex items-center justify-center text-xs font-semibold shrink-0">
            {session?.user?.name ? getInitials(session.user.name) : "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{session?.user?.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{session?.user?.email}</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="text-muted-foreground hover:text-destructive transition-colors" aria-label="Sign out">
            <LogOut className="w-3.5 h-3.5"/>
          </button>
        </div>
      </div>
    </aside>
  );
}
