import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import {
  HardHat, Zap, FileText, BarChart3,
  CheckCircle2, ArrowRight, Star, Brain,
  FileSpreadsheet, GitCompare, Shield
} from "lucide-react";

const FEATURES = [
  { icon: Zap,            title: "AI Cost Estimation",     desc: "Gemini 2.0 generates 40–55 line BOQ in under 60 seconds from your project specs."        },
  { icon: FileText,       title: "Professional BOQ",       desc: "Editable Bill of Quantities grouped by Civil, Electrical, Plumbing, Finishing & External." },
  { icon: BarChart3,      title: "Cost Breakdown Charts",  desc: "Interactive donut and bar charts visualising your cost distribution at a glance."          },
  { icon: Brain,          title: "AI Intelligence Report", desc: "Risk assessment, construction timeline, market benchmarking, and smart recommendations."   },
  { icon: FileSpreadsheet,title: "PDF & Excel Export",     desc: "Download print-ready PDF reports and styled 3-sheet Excel workbooks for tender submission." },
  { icon: GitCompare,     title: "Project Comparison",     desc: "Compare up to 4 projects side by side — cost, area, finish quality, and BOQ metrics."      },
];

const STATS = [
  { value: "< 60s", label: "Full BOQ generation" },
  { value: "200+",  label: "Indian material rates" },
  { value: "₹0",    label: "Cost to get started" },
  { value: "40–55", label: "BOQ line items" },
];

const TESTIMONIALS = [
  { name: "Arjun Mehta",   role: "Site Engineer, Pune",        text: "Saved me 3 days of manual estimation. The AI rates for Maharashtra are surprisingly accurate." },
  { name: "Priya Sharma",  role: "Civil Engineering Student",   text: "Used this for my thesis project cost analysis. Impressed recruiters at the campus placement." },
  { name: "Ravi Contractor",role:"Builder, Hyderabad",          text: "The PDF export looks more professional than what our firm was producing manually. Clients love it." },
];

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="h-16 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-md flex items-center justify-center">
            <HardHat className="w-4 h-4 text-white"/>
          </div>
          <span className="font-display text-base font-semibold tracking-tight">ConstructVision AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link href="/auth/register"
            className="flex items-center gap-1.5 h-8 px-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors">
            Get started free <ArrowRight className="w-3.5 h-3.5"/>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30"/>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"/>
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
            <Zap className="w-3.5 h-3.5"/>
            Powered by Google Gemini 2.0 Flash
          </div>
          <h1 className="text-5xl sm:text-6xl font-display font-bold tracking-tight leading-tight mb-6">
            AI-Powered Construction
            <br />
            <span className="text-brand-500">Cost Estimation</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Generate a complete Bill of Quantities with 40+ line items in under 60 seconds.
            Built for Indian civil engineers using CPWD/PWD rate schedules.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/register"
              className="flex items-center gap-2 h-12 px-8 bg-brand-500 hover:bg-brand-600 text-white text-base font-semibold rounded-xl transition-colors">
              Start estimating free
              <ArrowRight className="w-4 h-4"/>
            </Link>
            <Link href="/auth/login"
              className="flex items-center gap-2 h-12 px-8 border border-border hover:bg-secondary text-base font-medium rounded-xl transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-concrete-950 dark:bg-concrete-900 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-display font-bold text-brand-400 mb-1">{value}</p>
              <p className="text-sm text-concrete-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold mb-3">Everything you need to estimate smarter</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From raw project specs to a tender-ready BOQ — in one AI-powered workflow.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title}
              className="bg-card border border-border rounded-xl p-5 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-brand-500"/>
              </div>
              <h3 className="text-sm font-semibold mb-1.5">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-secondary/30">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-display font-bold text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Create Project",   desc: "Fill in project type, location, area, floors, and finish quality. Optionally upload a floor plan." },
              { step: "2", title: "Run AI Estimation", desc: "Gemini analyses your specs against regional PWD rate schedules and generates a detailed BOQ in seconds." },
              { step: "3", title: "Export & Submit",   desc: "Download a professional PDF or styled Excel workbook. Ready for client presentation or tender submission." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-500 text-white font-display text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="text-sm font-semibold mb-2">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-display font-bold text-center mb-10">Trusted by engineers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ name, role, text }) => (
            <div key={name} className="bg-card border border-border rounded-xl p-5">
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-brand-400 text-brand-400"/>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{text}"</p>
              <div>
                <p className="text-xs font-semibold">{name}</p>
                <p className="text-[11px] text-muted-foreground">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-concrete-950 dark:bg-concrete-900 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HardHat className="w-8 h-8 text-white"/>
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Start estimating in 60 seconds
          </h2>
          <p className="text-concrete-300 mb-8 leading-relaxed">
            Free to use. No credit card required. Built for Indian civil engineers and contractors.
          </p>
          <Link href="/auth/register"
            className="inline-flex items-center gap-2 h-12 px-8 bg-brand-500 hover:bg-brand-600 text-white text-base font-semibold rounded-xl transition-colors">
            Create free account
            <ArrowRight className="w-4 h-4"/>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-500 rounded flex items-center justify-center">
              <HardHat className="w-3.5 h-3.5 text-white"/>
            </div>
            <span className="text-sm font-semibold">ConstructVision AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            AI-powered BOQ generation for Indian construction · Built in 7 days
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5"/>
            <span>Secure · Free · No credit card</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
