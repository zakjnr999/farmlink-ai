"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Square, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type RecorderState = "idle" | "recording" | "paused" | "unsupported";

interface VoiceRecorderProps {
  onTranscript?: (text: string) => void;
  onAudioBlob?: (blob: Blob) => void;
  className?: string;
  lang?: string;
}

function getSpeechRecognition(): typeof SpeechRecognition | null {
  if (typeof window === "undefined") return null;
  const w = window as Window &
    typeof globalThis & {
      SpeechRecognition?: typeof SpeechRecognition;
      webkitSpeechRecognition?: typeof SpeechRecognition;
    };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function getSupportedMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? null;
}

export function VoiceRecorder({
  onTranscript,
  onAudioBlob,
  className,
  lang = "en-US",
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [supportsSpeech, setSupportsSpeech] = useState(false);
  const [supportsMedia, setSupportsMedia] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setSupportsSpeech(!!getSpeechRecognition());
    setSupportsMedia(
      typeof navigator !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia &&
        typeof MediaRecorder !== "undefined",
    );
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;

    recognitionRef.current?.stop();
    recognitionRef.current = null;

    setState("idle");
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript("");
    chunksRef.current = [];

    if (!supportsMedia && !supportsSpeech) {
      setState("unsupported");
      setError(
        "Voice recording is not supported in this browser. Type your notes instead.",
      );
      return;
    }

    try {
      if (supportsMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = getSupportedMimeType();
        const recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, {
              type: mimeType ?? "audio/webm",
            });
            onAudioBlob?.(blob);
          }
        };

        mediaRecorderRef.current = recorder;
        recorder.start(250);
      }

      if (supportsSpeech) {
        const SpeechRecognitionCtor = getSpeechRecognition();
        if (SpeechRecognitionCtor) {
          const recognition = new SpeechRecognitionCtor();
          recognition.lang = lang;
          recognition.continuous = true;
          recognition.interimResults = true;

          recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = "";
            let final = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const result = event.results[i];
              if (result.isFinal) {
                final += result[0].transcript;
              } else {
                interim += result[0].transcript;
              }
            }
            const combined = (final || interim).trim();
            setTranscript(combined);
            if (final) onTranscript?.(final.trim());
          };

          recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error !== "aborted") {
              setError(
                "Speech recognition unavailable. Audio is still being recorded.",
              );
            }
          };

          recognitionRef.current = recognition;
          recognition.start();
        }
      }

      setState("recording");
    } catch {
      setError(
        "Microphone access denied. Enable microphone permissions to record voice notes.",
      );
      setState("idle");
    }
  }, [supportsMedia, supportsSpeech, lang, onTranscript, onAudioBlob]);

  useEffect(() => {
    return () => stopRecording();
  }, [stopRecording]);

  const isRecording = state === "recording";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        {!isRecording ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={startRecording}
            disabled={state === "unsupported"}
            className="gap-2"
            aria-label="Start voice recording"
          >
            <Mic className="size-5" aria-hidden="true" />
            Record voice note
          </Button>
        ) : (
          <Button
            type="button"
            variant="destructive"
            size="lg"
            onClick={stopRecording}
            className="gap-2"
            aria-label="Stop recording"
          >
            <Square className="size-4 fill-current" aria-hidden="true" />
            Stop
          </Button>
        )}

        {isRecording && (
          <span className="inline-flex items-center gap-2 text-sm text-tomato-red">
            <span className="size-2 animate-pulse rounded-full bg-tomato-red" />
            Recording…
          </span>
        )}
      </div>

      {!supportsSpeech && supportsMedia && (
        <p className="text-xs text-muted-foreground">
          Live transcription is not available in this browser. Audio will be
          saved for later processing.
        </p>
      )}

      {transcript && (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
          {transcript}
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-clay-orange/30 bg-clay-orange/10 px-3 py-2 text-sm text-deep-soil dark:text-field-cream"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {state === "unsupported" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MicOff className="size-4" aria-hidden="true" />
          Voice input not supported — use the text field below.
        </div>
      )}
    </div>
  );
}
