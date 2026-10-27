"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SupportedLanguage } from "../../lib/profile-options";
import { messages } from "../../lib/translations";

export default function LogoutButton({
  language,
}: {
  language: SupportedLanguage;
}) {
  const router = useRouter();
  const copy = messages[language];
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function signOut() {
    setIsSigningOut(true);
    setErrorMessage("");

    let response: Response;
    try {
      response = await fetch("/api/session", { method: "DELETE" });
    } catch {
      setErrorMessage(copy.signOutError);
      setIsSigningOut(false);
      return;
    }

    if (!response.ok) {
      setErrorMessage(copy.signOutError);
      setIsSigningOut(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <div>
      <button
        className="rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold transition-colors hover:border-brand hover:text-brand disabled:opacity-60"
        disabled={isSigningOut}
        onClick={signOut}
        type="button"
      >
        {isSigningOut ? copy.signingOut : copy.signOut}
      </button>
      {errorMessage ? (
        <p className="mt-2 text-sm text-red-800" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
