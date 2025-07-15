import AuthPage from "@/components/sm-components/AuthPage";
import { Suspense } from "react";


export default function SignInPage() {
  return (
    <Suspense>
      <AuthPage />
    </Suspense>
  );
} 