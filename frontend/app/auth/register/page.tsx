"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, HardHat, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import axios from "axios";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

const features = [
  "AI-powered BOQ generation in under 60 seconds",
  "Indian market rates — PWD aligned",
  "PDF & Excel export ready",
  "Free forever for students",
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`,
        data
      );

      // Auto-login after register
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.error) {
        toast.error("Account created but login failed. Please sign in.");
        router.push("/auth/login");
        return;
      }

      toast.success("Account created! Welcome to ConstructVision.");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || err.message || "Registration failed";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-concrete-950 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
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

          <h1 className="font-display text-4xl text-white leading-tight mb-6">
            The AI co-pilot
            <br />
            <span className="text-brand-400 italic">every engineer needs.</span>
          </h1>
          <p className="text-concrete-300 text-base leading-relaxed max-w-sm mb-10">
            Join engineers who estimate costs in minutes, not days.
          </p>

          <div className="space-y-3">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <span className="text-concrete-300 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-concrete-500 text-xs">
          © 2024 ConstructVision AI. Built for Indian civil engineers.
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-brand-500 rounded flex items-center justify-center">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-lg">ConstructVision</span>
          </div>

          <h2 className="text-3xl font-display font-bold mb-2">Create account</h2>
          <p className="text-muted-foreground mb-8">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-brand-500 hover:text-brand-600 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Rahul Sharma"
                autoComplete="name"
                className="w-full h-11 px-3.5 rounded-md border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="email">
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
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create free account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-8">
            By creating an account you agree to our{" "}
            <span className="underline cursor-pointer hover:text-foreground transition-colors">
              Terms of Service
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
