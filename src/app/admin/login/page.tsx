"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Lock, Mail, AlertCircle, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    async function checkExistingAuth() {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          router.push("/admin");
          return;
        }
      }
      const localAuth =
        typeof window !== "undefined" &&
        (localStorage.getItem("anandam_admin_auth") === "true" ||
          localStorage.getItem("virasat_admin_auth") === "true");
      if (localAuth) {
        router.push("/admin");
      }
    }
    checkExistingAuth();
  }, [router]);

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = "Please enter your administrative email address.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email format.";
    }

    if (!password) {
      errors.password = "Please enter your password.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setErrorMessage("Please correct the highlighted fields below.");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMessage(
            error.message.includes("Invalid login credentials")
              ? "Invalid email or password. Only authorized personnel may sign in."
              : "Authentication failed. Please verify credentials and try again."
          );
          setIsLoading(false);
          return;
        }

        if (data.session) {
          localStorage.setItem("anandam_admin_auth", "true");
          localStorage.setItem("anandam_admin_user", data.user.email || email);
          router.push("/admin");
          return;
        }
      }

      // Demo fallback if testing offline
      if (password.length >= 6) {
        localStorage.setItem("anandam_admin_auth", "true");
        localStorage.setItem("anandam_admin_user", email || "admin@anandamsarees.in");
        router.push("/admin");
        return;
      }
    } catch {
      setErrorMessage("An unexpected authentication error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Back to Catalog Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#722F37] hover:text-[#54151C] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Anandam Collection</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Brand Monogram */}
        <div className="text-center">
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-2xl overflow-hidden border border-[#D4AF37] shadow-lg mb-3 bg-[#FDFBF7]">
            <Image
              src="/logo.png"
              alt="Anandam"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <h2 className="font-serif-luxury text-3xl font-bold tracking-tight text-[#241416]">
            Anandam Atelier
          </h2>
          <p className="mt-1 text-xs text-stone-600">
            Authorized Personnel Portal for Catalogue & Inquiries
          </p>
        </div>

        {/* Card Box */}
        <div className="mt-8 bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-[#D4AF37]/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#722F37] via-[#D4AF37] to-[#722F37]" />

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Authorized Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                  }}
                  placeholder="admin@anandamsarees.in"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm bg-[#FDFBF7] rounded-xl border ${
                    fieldErrors.email ? "border-red-400 focus:ring-red-400" : "border-[#EADBCE] focus:border-[#722F37]"
                  } focus:outline-none focus:ring-1 focus:ring-[#722F37]`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm bg-[#FDFBF7] rounded-xl border ${
                    fieldErrors.password ? "border-red-400 focus:ring-red-400" : "border-[#EADBCE] focus:border-[#722F37]"
                  } focus:outline-none focus:ring-1 focus:ring-[#722F37]`}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#722F37] via-[#54151C] to-[#380E13] hover:from-[#54151C] hover:to-[#241416] text-[#F4E5BD] font-semibold text-sm shadow-md transition-all disabled:opacity-50 active:scale-[0.99]"
            >
              {isLoading ? "Verifying..." : "Sign In to Admin Portal"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
