"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-slate-100">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Critical Error</h1>
                <p className="text-sm text-slate-600">The application encountered a critical error</p>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="p-3 bg-slate-100 rounded-lg text-xs font-mono overflow-auto max-h-40">
                <p className="text-red-600 font-semibold mb-2">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-slate-600 mb-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            <p className="text-sm text-slate-600">
              We're sorry for the inconvenience. The error has been reported to our team.
              Please try refreshing the page.
            </p>

            <Button
              onClick={reset}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
