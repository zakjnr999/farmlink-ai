"use client";

import { useCallback } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TranscriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  label?: string;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

export function TranscriptEditor({
  value,
  onChange,
  onClear,
  label = "Transcript",
  placeholder = "Your voice note will appear here, or type directly…",
  className,
  maxLength = 2000,
  showCharCount = true,
}: TranscriptEditorProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value;
      if (maxLength && next.length > maxLength) return;
      onChange(next);
    },
    [onChange, maxLength],
  );

  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="transcript-editor" className="flex items-center gap-2">
          <Sparkles className="size-4 text-harvest-gold" aria-hidden="true" />
          {label}
        </Label>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-8 gap-1.5 text-xs text-muted-foreground"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            Clear
          </Button>
        )}
      </div>

      <Textarea
        id="transcript-editor"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={5}
        aria-describedby={
          showCharCount ? "transcript-char-count" : undefined
        }
      />

      {showCharCount && (
        <p
          id="transcript-char-count"
          className="text-right text-xs text-muted-foreground"
        >
          {value.length}
          {maxLength ? ` / ${maxLength}` : ""} characters
        </p>
      )}
    </div>
  );
}
