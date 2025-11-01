"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { IconBrain, IconLoader2, IconUsers, IconSend } from "@tabler/icons-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function SAGEChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hello! I'm SAGE, your personal AI advisor for freelance success.\n\nI've analyzed your job decisions, skill performance, and market positioning to provide data-driven insights that can help you:\n\n✨ Increase your acceptance rates\n📈 Command higher rates\n🎯 Focus on your most profitable skills\n🚀 Identify growth opportunities\n\nWhat aspect of your freelance journey would you like to explore first?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "How can I increase my acceptance rate?",
    "What skills should I focus on?",
    "Which platforms work best for me?",
    "How can I command higher rates?",
    "What's my biggest opportunity?",
    "Where should I improve first?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSend = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/sage/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || "I apologize, but I'm having trouble generating a response right now.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('SAGE chat error:', err);
      setError(`Error: ${err.message}`);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment. 🔧",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: "👋 Hello! I'm SAGE, your personal AI advisor for freelance success.\n\nI've analyzed your job decisions, skill performance, and market positioning to provide data-driven insights that can help you:\n\n✨ Increase your acceptance rates\n📈 Command higher rates\n🎯 Focus on your most profitable skills\n🚀 Identify growth opportunities\n\nWhat aspect of your freelance journey would you like to explore first?",
      timestamp: new Date()
    }]);
    setError("");
  };

  const handleSendClick = () => onSend();
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto bg-background">
      {/* Ultra-minimal header - Jony Ive style */}
      <div className="flex items-center justify-center py-4 border-b border-border/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <IconBrain className="h-3 w-3 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground tracking-wide">SAGE</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearMessages}
          className="absolute right-4 text-muted-foreground/60 hover:text-muted-foreground transition-colors text-xs"
        >
          New chat
        </Button>
      </div>

      {/* Messages - ChatGPT style with Jony Ive proportions */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-full">
          {messages.map((msg, index) => (
            <div key={msg.id} className={`group py-6 px-6 ${
              msg.role === 'assistant' ? 'bg-muted/20' : ''
            } ${index === 0 ? 'pt-8' : ''}`}>
              <div className="max-w-2xl mx-auto">
                <div className="flex gap-6 items-start">
                  {/* Avatar - minimal and precise */}
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {msg.role === 'user' ? 'Y' : 'S'}
                  </div>
                  
                  {/* Message Content - perfect typography */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="text-[15px] leading-7 text-foreground whitespace-pre-wrap font-normal">
                      {msg.content}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator - subtle and elegant */}
          {isLoading && (
            <div className="group py-6 px-6 bg-muted/20">
              <div className="max-w-2xl mx-auto">
                <div className="flex gap-6 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                    S
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display - minimal and clean */}
          {error && (
            <div className="py-6 px-6">
              <div className="max-w-2xl mx-auto">
                <div className="flex gap-6 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-xs font-medium text-destructive">
                    !
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="text-[15px] leading-7 text-destructive">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Questions - subtle suggestions */}
      {messages.length <= 1 && (
        <div className="px-6 pb-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => onSend(question)}
                  disabled={isLoading}
                  className="text-sm text-muted-foreground hover:text-foreground border border-border hover:border-primary/30 rounded-full px-4 py-2 transition-all duration-200 hover:bg-muted/20 disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area - ChatGPT inspired with perfect proportions */}
      <div className="border-t border-border/10 bg-background">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message SAGE"
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="min-h-[52px] max-h-40 resize-none rounded-3xl border border-border bg-background px-5 py-4 pr-14 text-[15px] leading-6 placeholder:text-muted-foreground/60 focus:border-primary/30 focus:outline-none focus:ring-0 transition-colors shadow-sm"
              rows={1}
            />
            <Button
              onClick={handleSendClick}
              disabled={isLoading || !input.trim()}
              size="sm"
              className="absolute right-2 top-2 h-9 w-9 p-0 rounded-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-all duration-150"
            >
              {isLoading ? (
                <IconLoader2 className="w-4 h-4 animate-spin" />
              ) : (
                <IconSend className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
