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
import { UtensilsCrossed, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    restaurant_name: z.string().min(2, "Nama restoran minimal 2 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    password_confirmation: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Konfirmasi password tidak cocok",
    path: ["password_confirmation"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await authService.register(data);
      toast.success("Akun & Restoran berhasil didaftarkan! Mengalihkan ke dashboard...");
      router.push("/restaurant");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Pendaftaran gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-lg">
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
            Daftarkan Restoran Anda
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Satu akun untuk kelola cabang tanpa batas & QR ordering instan
          </p>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-xs text-zinc-600">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Cabang Tanpa Batas
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> QR Ordering Siap Pakai
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Tanpa Kontrak
          </span>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nama Pemilik / PIC</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  disabled={loading}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="restaurant_name">Nama Restoran / Brand</Label>
                <Input
                  id="restaurant_name"
                  type="text"
                  placeholder="Contoh: Kopi Kenangan Senopati"
                  disabled={loading}
                  {...register("restaurant_name")}
                />
                {errors.restaurant_name && (
                  <p className="text-xs text-red-500 mt-1">{errors.restaurant_name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Bisnis</Label>
              <Input
                id="email"
                type="email"
                placeholder="budi@namarestoran.com"
                autoComplete="email"
                disabled={loading}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 karakter"
                  autoComplete="new-password"
                  disabled={loading}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password_confirmation">Ulangi Password</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  placeholder="Ulangi password"
                  autoComplete="new-password"
                  disabled={loading}
                  {...register("password_confirmation")}
                />
                {errors.password_confirmation && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password_confirmation.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mendaftarkan Restoran...
                </>
              ) : (
                <>
                  Mulai Sekarang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-100 text-center">
            <p className="text-sm text-zinc-500">
              Sudah memiliki akun?{" "}
              <Link
                href="/login"
                className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-400">
          Dengan mendaftar, Anda menyetujui Ketentuan Layanan & Kebijakan Privasi Ordexa.
        </p>
      </div>
    </div>
  );
}
