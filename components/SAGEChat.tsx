"use client";

import { useState } from "react";
import { useAIChat } from "@/hooks/useAIChat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IconBrain, IconLoader2, IconUsers } from "@tabler/icons-react";

export default function SAGEChat() {
  const { messages, isLoading, error, sendMessage, clearMessages } = useAIChat();
  const [input, setInput] = useState("");

  const onSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessage(text, "openai", process.env.NEXT_PUBLIC_SAGEA_MODEL || "gpt-4o-mini");
  };

  return (
    <div className="flex flex-col h-full border rounded-xl">
      <div className="flex items-center justify-between p-3 border-b bg-card/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <IconBrain className="h-5 w-5 text-primary" />
          <span className="font-semibold">SAGE</span>
          <span className="text-xs text-muted-foreground">Your personalized AI assistant</span>
        </div>
        <Button variant="ghost" size="sm" onClick={clearMessages}>Clear</Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card border border-border rounded-bl-md'}`}>
              <div className="flex items-center gap-2 mb-1">
                {msg.role === 'user' ? (
                  <IconUsers className="h-4 w-4" />
                ) : (
                  <IconBrain className="h-4 w-4 text-primary" />
                )}
                <span className="text-xs font-medium">{msg.role === 'user' ? 'You' : 'SAGE'}</span>
              </div>
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-center">
            <IconLoader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500">{error}</div>
        )}
      </div>

      <div className="p-3 border-t flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask SAGE anything about your profile, jobs, or next steps..."
          className="min-h-[48px] max-h-40"
        />
        <Button onClick={onSend} disabled={isLoading || !input.trim()}>
          {isLoading ? (<><IconLoader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>) : 'Send'}
        </Button>
      </div>
    </div>
  );
}
