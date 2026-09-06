"use client";

import { useEffect, useRef, useState } from "react";

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;

  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function getSpeechErrorMessage(errorCode) {
  switch (errorCode) {
    case "not-allowed":
      return "Microphone permission is required for voice input. You can still type your question.";
    case "no-speech":
      return "No speech was detected. Please try again or type your question.";
    case "audio-capture":
      return "No microphone was found. You can still type your question.";
    case "network":
      return "Voice input is temporarily unavailable. Please check your connection or type your question.";
    case "aborted":
      return "Voice input was stopped. You can try again or type your question.";
    default:
      return "Voice input is unavailable right now. You can still type your question.";
  }
}

export function useSpeechRecognition({ language = "hi", onText }) {
  const recognitionRef = useRef(null);
  const onTextRef = useRef(onText);
  const [supported, setSupported] = useState(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    onTextRef.current = onText;
  }, [onText]);

  useEffect(() => {
    const supportCheck = window.setTimeout(() => {
      setSupported(Boolean(getSpeechRecognition()));
    }, 0);

    return () => {
      window.clearTimeout(supportCheck);
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onend = null;
        recognition.onerror = null;
        recognition.onresult = null;
        recognition.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function startListening() {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition || listening) return;

    setError("");
    const recognition = new SpeechRecognition();
    recognition.lang = language === "en" ? "en-IN" : "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      if (transcript) onTextRef.current?.(transcript);
    };

    recognition.onerror = (event) => {
      setError(getSpeechErrorMessage(event.error));
      setListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setListening(true);

    try {
      recognition.start();
    } catch (recognitionError) {
      console.error("Speech recognition start error:", recognitionError);
      setError("Voice input could not start. You can still type your question.");
      setListening(false);
      recognitionRef.current = null;
    }
  }

  function toggleListening() {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }

  return {
    supported,
    listening,
    error,
    toggleListening,
    stopListening,
  };
}
