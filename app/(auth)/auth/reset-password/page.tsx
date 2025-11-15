import { Suspense } from "react";

import { ResetPasswordClient } from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-slate-600">
          Loading secure reset experience...
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
