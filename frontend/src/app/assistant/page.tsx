"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Globe,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEmergencyStore } from "@/store/emergency-store";
import { useVoice } from "@/hooks/use-voice";
import { aiAPI } from "@/services/api";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: "online" | "offline";
  timestamp: Date;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "te", label: "Telugu" },
  { code: "ta", label: "Tamil" },
  { code: "ne", label: "Nepali" },
];

const QUICK_PROMPTS = [
  "What first aid should I give?",
  "What are emergency numbers?",
  "How to help a bleeding victim?",
  "How to perform CPR?",
  "Nearest hospital directions",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "I'm RoadSOS AI, your emergency assistant. I can help with first aid guidance, emergency numbers, and trauma support. How can I help you?",
      mode: "online",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const language = useEmergencyStore((s) => s.language);
  const setLanguage = useEmergencyStore((s) => s.setLanguage);
  const session = useEmergencyStore((s) => s.session);
  const {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useVoice();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (transcript && !isListening) {
      setInput(transcript);
    }
  }, [transcript, isListening]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await aiAPI.chat(text, language, {
          severity: session?.severity,
          latitude: session?.latitude,
          longitude: session?.longitude,
        });

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: res.data.response,
          mode: res.data.mode,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        speak(res.data.response);
      } catch {
        const offlineMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "I'm currently offline. Emergency numbers:\n• National Emergency: 112\n• Ambulance: 108\n• Police: 100\n\nStay calm. Apply pressure to any bleeding. Keep the victim still.",
          mode: "offline",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, offlineMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [language, session, speak]
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col h-[calc(100vh-3.5rem)] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-400" />
            AI Emergency Assistant
          </h1>
          <p className="text-sm text-muted-foreground">
            Voice-enabled multilingual emergency guidance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-md border bg-background px-2 py-1 text-sm"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => sendMessage(prompt)}
            className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {prompt}
          </button>
        ))}
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs opacity-50">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {msg.mode && (
                    <Badge
                      variant={msg.mode === "online" ? "secondary" : "outline"}
                      className="text-[10px] h-4"
                    >
                      {msg.mode}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Thinking...
                </span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </CardContent>

        <div className="border-t p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2"
          >
            <Button
              type="button"
              size="icon"
              variant={isListening ? "destructive" : "outline"}
              onClick={() =>
                isListening ? stopListening() : startListening()
              }
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or speak your emergency question..."
              className="flex-1"
            />

            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() =>
                isSpeaking ? stopSpeaking() : undefined
              }
            >
              {isSpeaking ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
