'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, Leaf, Loader2, Send, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AdvisoryMessageBody } from '@/features/farm-advisory/components/AdvisoryMessageBody';
import { useAuth } from '@/hooks/use-auth';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { farmAdvisoryApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { AdvisoryMessage, AdvisoryUrgency } from '@/types/farm-advisory';

const STARTER_PROMPTS = [
  'Why are my plantain leaves turning black?',
  'My tomatoes have spots on the leaves after rain',
  'Maize leaves look streaky and yellow',
  'Something is eating my vegetable leaves',
];

const WELCOME_MESSAGE: AdvisoryMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Ask me about crop diseases, pests, soil issues, or farm practices. I will ask follow-up questions when needed to understand your situation — for example, if plantain leaves are turning black, I can help narrow down Sigatoka, waterlogging, or nutrient stress.',
  createdAt: new Date().toISOString(),
};

function createUserMessage(content: string): AdvisoryMessage {
  return {
    id: `user-${Date.now()}`,
    role: 'user',
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };
}

function urgencyStyles(urgency?: AdvisoryUrgency): string {
  switch (urgency) {
    case 'high':
      return 'border-tomato-red/40 bg-tomato-red/10 text-tomato-red';
    case 'medium':
      return 'border-harvest-gold/40 bg-harvest-gold/10 text-deep-soil';
    default:
      return 'border-farm-green/30 bg-farm-green/5 text-field-ink';
  }
}

export function FarmAdvisoryChat() {
  const { profile } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [messages, setMessages] = useState<AdvisoryMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>(STARTER_PROMPTS);
  const [activeTopic, setActiveTopic] = useState<string | undefined>();
  const [urgency, setUrgency] = useState<AdvisoryUrgency | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chatMutation = useMutation({
    mutationFn: (history: AdvisoryMessage[]) =>
      farmAdvisoryApi.sendAdvisoryMessage({
        messages: history.filter((m) => m.id !== 'welcome'),
        cropHint: profile?.primaryCrops?.[0],
        regionHint: profile?.region,
      }),
    onSuccess: (response) => {
      setMessages((prev) => [...prev, response.message]);
      setSuggestedFollowUps(response.suggestedFollowUps ?? []);
      setActiveTopic(response.topicLabel);
      setUrgency(response.urgency);
    },
  });

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatMutation.isPending, scrollToBottom]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || chatMutation.isPending) return;

    if (!isOnline) return;

    const userMessage = createUserMessage(trimmed);
    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInput('');
    setSuggestedFollowUps([]);

    await chatMutation.mutateAsync(nextHistory);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-4.5rem)] max-w-3xl flex-col px-4 py-5 lg:h-[calc(100dvh-2rem)]">
      <PageHeader
        title="Farm Advisor"
        subtitle="AI guidance on crops, pests, and field problems"
        className="shrink-0 border-none pb-4"
      />

      <div
        className={cn(
          'mb-3 flex items-start gap-2 rounded-xl border px-3 py-2 text-xs',
          urgencyStyles(urgency),
        )}
      >
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          FarmLink advisor supports your decisions but does not replace your district extension
          officer. Seek in-person help for severe or spreading outbreaks.
        </p>
      </div>

      {activeTopic && (
        <p className="mb-3 text-xs font-medium text-muted-text">
          Topic: <span className="text-field-ink">{activeTopic}</span>
          {profile?.region ? ` · ${profile.region}` : null}
        </p>
      )}

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto rounded-2xl border border-morning-mist bg-warm-paper p-4"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
            >
              <div
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full',
                  isUser ? 'bg-farm-green/15 text-farm-green' : 'bg-leaf-green/15 text-leaf-green',
                )}
                aria-hidden
              >
                {isUser ? <Leaf className="size-4" /> : <Sparkles className="size-4" />}
              </div>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3',
                  isUser
                    ? 'bg-farm-green text-white'
                    : 'border border-morning-mist bg-field-cream text-field-ink',
                )}
              >
                {isUser ? (
                  <p className="text-sm leading-relaxed">{message.content}</p>
                ) : (
                  <AdvisoryMessageBody content={message.content} />
                )}
              </div>
            </div>
          );
        })}

        {chatMutation.isPending && (
          <div className="flex items-center gap-3 text-sm text-muted-text">
            <div className="flex size-9 items-center justify-center rounded-full bg-leaf-green/15">
              <Loader2 className="size-4 animate-spin text-leaf-green" aria-hidden />
            </div>
            <span>Farm Advisor is thinking…</span>
          </div>
        )}

        {chatMutation.isError && (
          <p className="rounded-xl border border-tomato-red/30 bg-tomato-red/10 px-4 py-3 text-sm text-tomato-red">
            Could not reach the advisor right now. Check your connection and try again.
          </p>
        )}
      </div>

      {suggestedFollowUps.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestedFollowUps.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={chatMutation.isPending || !isOnline}
              onClick={() => void sendMessage(prompt)}
              className="rounded-full border border-morning-mist bg-warm-paper px-3 py-1.5 text-left text-xs font-medium text-field-ink transition-colors hover:border-farm-green hover:bg-farm-green/5 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-3 shrink-0 rounded-2xl border border-morning-mist bg-warm-paper p-3"
      >
        {!isOnline && (
          <p className="mb-2 text-xs text-clay-orange">
            You are offline. Reconnect to ask the farm advisor.
          </p>
        )}
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Describe your crop problem… e.g. plantain leaves turning black"
            rows={2}
            disabled={chatMutation.isPending || !isOnline}
            className="min-h-[3.5rem] resize-none border-morning-mist bg-field-cream"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void sendMessage(input);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="size-11 shrink-0 self-end"
            disabled={!input.trim() || chatMutation.isPending || !isOnline}
            aria-label="Send message"
          >
            <Send className="size-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
