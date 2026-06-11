"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, HardHat, ArrowRight, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (res?.error) {
      toast.error("Invalid email or password. Please try again.");
      return;
    }

    toast.success("Welcome back!");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-concrete-950 relative flex-col justify-between p-12 overflow-hidden">
        {/* Grid texture */}
        <div className="absolute inset-0 grid-bg opacity-20" />

        {/* Decorative diagonal bar */}
        <div
          className="absolute -right-20 top-0 w-64 h-full bg-brand-500 opacity-10"
          style={{ transform: "skewX(-8deg)" }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-brand-500 rounded flex items-center justify-center">
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-display text-xl tracking-tight">
              ConstructVision
            </span>
          </div>

          <h1 className="font-display text-5xl text-white leading-tight mb-6">
            Build smarter.
            <br />
            <span className="text-brand-400 italic">Estimate faster.</span>
          </h1>
          <p className="text-concrete-300 text-lg leading-relaxed max-w-sm">
            AI-powered cost estimation and BOQ generation for civil engineers
            and contractors across India.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6">
          {[
            { value: "₹0", label: "to get started" },
            { value: "< 60s", label: "full BOQ generation" },
            { value: "200+", label: "material rates" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-brand-400 font-display text-2xl">{s.value}</div>
              <div className="text-concrete-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-brand-500 rounded flex items-center justify-center">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-lg">ConstructVision</span>
          </div>

          <h2 className="text-3xl font-display font-bold mb-2">Sign in</h2>
          <p className="text-muted-foreground mb-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-brand-500 hover:text-brand-600 font-medium transition-colors"
            >
              Create one free
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full h-11 px-3.5 rounded-md border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full h-11 px-3.5 pr-10 rounded-md border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-8">
            By signing in you agree to our{" "}
            <span className="underline cursor-pointer hover:text-foreground transition-colors">
              Terms of Service
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
