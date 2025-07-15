"use client";
import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
          className="w-full h-14 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
        >
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path d="M44.5 20H24V28.5H36.9C35.5 32.1 32.1 34.5 28 34.5C22.8 34.5 18.5 30.2 18.5 25C18.5 19.8 22.8 15.5 28 15.5C30.2 15.5 32.2 16.3 33.7 17.6L39.1 12.2C36.2 9.7 32.3 8 28 8C17.5 8 9 16.5 9 27C9 37.5 17.5 46 28 46C38.5 46 47 37.5 47 27C47 25.3 46.8 23.7 46.4 22.2L44.5 20Z" fill="#4285F4"/>
              <path d="M6.3 14.7L12.1 19.1C13.7 16.1 16.6 13.9 20 13.3V8.1C14.7 9.1 10.2 12.7 6.3 14.7Z" fill="#34A853"/>
              <path d="M28 8C32.3 8 36.2 9.7 39.1 12.2L33.7 17.6C32.2 16.3 30.2 15.5 28 15.5V8Z" fill="#FBBC05"/>
              <path d="M9 27C9 37.5 17.5 46 28 46C32.3 46 36.2 44.3 39.1 41.8L33.7 36.4C32.2 37.7 30.2 38.5 28 38.5C22.8 38.5 18.5 34.2 18.5 29C18.5 23.8 22.8 19.5 28 19.5C30.2 19.5 32.2 20.3 33.7 21.6L39.1 16.2C36.2 13.7 32.3 12 28 12C17.5 12 9 20.5 9 31C9 41.5 17.5 50 28 50C38.5 50 47 41.5 47 31C47 29.3 46.8 27.7 46.4 26.2L44.5 24Z" fill="#EA4335"/>
            </g>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
} 