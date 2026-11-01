"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UtensilsCrossed, ArrowRight, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await authService.login(data);
      toast.success("Login berhasil! Mengalihkan ke dashboard...");
      router.push("/restaurant");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="h-10 w-10 rounded-xl bg-zinc-950 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-zinc-950">
              Ordexa
            </span>
          </Link>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            Masuk ke Portal Manajemen
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Kelola menu, meja, cabang, dan pantau pesanan realtime
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Bisnis</Label>
              <Input
                id="email"
                type="email"
                placeholder="owner@restoran.com"
                autoComplete="email"
                disabled={loading}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Fitur reset password via email segera hadir.");
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-900 underline underline-offset-4"
                >
                  Lupa password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-100 text-center">
            <p className="text-sm text-zinc-500">
              Belum mendaftarkan restoran Anda?{" "}
              <Link
                href="/register"
                className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700"
              >
                Daftar Gratis
              </Link>
            </p>
          </div>
        </div>

        {/* Security footnote */}
        <p className="mt-8 text-center text-xs text-zinc-400">
          Dilindungi oleh enkripsi 256-bit & multi-tenant isolation Ordexa.
        </p>
      </div>
    </div>
  );
}
