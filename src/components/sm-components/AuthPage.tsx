"use client";
import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleIcon } from "./GoogleIcon";


export default function AuthPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  if (status === "loading") return null;
  if (session) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      <div className="bg-white/5 p-8 rounded-2xl shadow-2xl border border-white/10 max-w-md w-full flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4 text-center">Sign in to Music Duo</h1>
        <p className="text-gray-300 mb-8 text-center">Sign in to access your dashboard and rooms.</p>
        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="cursor-pointer w-full h-14 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
        >
          <GoogleIcon/>
          Sign in with Google
        </button>
      </div>
    </div>
  );
} 