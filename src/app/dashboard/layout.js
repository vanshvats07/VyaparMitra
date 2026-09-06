"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/useLanguage";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checkingSession, setCheckingSession] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me")
      .then((response) => {
        if (!response.ok) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        if (active) setCheckingSession(false);
      })
      .catch(() => {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      });

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">{t("dashboard.loading")}</p>
      </main>
    );
  }

  return children;
}
