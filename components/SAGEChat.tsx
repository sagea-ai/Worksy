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
    <div className="flex flex-col h-full bg-background rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <IconBrain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">SAGE</h2>
            <p className="text-muted-foreground text-sm">Your AI Growth Advisor</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearMessages}
        >
          Clear Chat
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
              {/* Avatar */}
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {msg.role === 'user' ? (
                  <IconUsers className="w-4 h-4" />
                ) : (
                  <IconBrain className="w-4 h-4" />
                )}
              </div>
              
              {/* Message Bubble */}
              <div className={`relative p-4 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground ml-12' 
                  : 'bg-muted text-foreground mr-12'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="font-semibold text-primary text-sm mb-2 flex items-center">
                    <IconBrain className="w-4 h-4 mr-2" />
                    SAGE
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
                <div className={`text-xs mt-2 ${
                  msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                <IconBrain className="w-4 h-4" />
              </div>
              <div className="bg-muted p-4 rounded-lg mr-12">
                <div className="font-semibold text-primary text-sm mb-2 flex items-center">
                  <IconBrain className="w-4 h-4 mr-2" />
                  SAGE
                </div>
                <div className="flex items-center space-x-3">
                  <IconLoader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Analyzing your freelance data...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 max-w-md">
              <div className="text-sm text-destructive font-medium">{error}</div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions (show only at start) */}
      {messages.length <= 1 && (
        <div className="p-4 bg-muted/50 border-t">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-xs">💡</span>
            </div>
            <span className="text-sm text-foreground font-medium">Quick questions to get started:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onSend(question)}
                disabled={isLoading}
                className="text-xs h-9 px-3 justify-start"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-card border-t">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your freelance growth..."
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="min-h-14 max-h-32 resize-none rounded-lg px-3 py-3 text-sm leading-relaxed"
            />
          </div>
          <Button
            onClick={handleSendClick}
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 self-end"
          >
            {isLoading ? (
              <IconLoader2 className="w-5 h-5 animate-spin" />
            ) : (
              <IconSend className="w-5 h-5" />
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-xs">💡</span>
          </div>
          <span>Ask about acceptance rates, best skills, market opportunities, or growth strategies</span>
        </div>
      </div>
    </div>
  );
}
