import AuthPage from "@/components/sm-components/AuthPage";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In - Jukebox Duo",
  robots: {
    index: false,
    follow: false,
  },
};


export default function SignInPage() {
  return (
    <Suspense>
      <AuthPage />
    </Suspense>
  );
} 