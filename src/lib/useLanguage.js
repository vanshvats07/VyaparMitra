"use client";

import { useEffect, useState } from "react";
import { normalizeLanguage, translate } from "@/lib/translations";

const LANGUAGE_KEY = "vyaparMitraLanguage";

export function useLanguage(profileLanguage) {
  const [language, setLanguageState] = useState(() => {
    if (profileLanguage) return normalizeLanguage(profileLanguage);
    if (typeof window === "undefined") return "en";
    return normalizeLanguage(window.localStorage.getItem(LANGUAGE_KEY));
  });

  useEffect(() => {
    const nextLanguage = normalizeLanguage(profileLanguage || language);
    window.localStorage.setItem(LANGUAGE_KEY, nextLanguage);
    document.documentElement.lang = nextLanguage;
  }, [profileLanguage, language]);

  function setLanguage(nextLanguage) {
    const normalized = normalizeLanguage(nextLanguage);
    setLanguageState(normalized);
    window.localStorage.setItem(LANGUAGE_KEY, normalized);
    document.documentElement.lang = normalized;
  }

  return {
    language: normalizeLanguage(profileLanguage || language),
    setLanguage,
    t: (key, variables) => translate(profileLanguage || language, key, variables),
  };
}
