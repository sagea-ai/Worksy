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
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <IconBrain className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">SAGE</h2>
            <p className="text-purple-100 text-sm">Your AI Growth Advisor</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearMessages} 
          className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
        >
          Clear Chat
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                  : 'bg-gradient-to-br from-purple-500 to-indigo-600'
              }`}>
                {msg.role === 'user' ? (
                  <IconUsers className="w-5 h-5 text-white" />
                ) : (
                  <IconBrain className="w-5 h-5 text-white" />
                )}
              </div>
              
              {/* Message Bubble */}
              <div className={`relative p-5 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                  : 'bg-white border border-gray-100 shadow-md'
              } ${msg.role === 'user' ? 'rounded-tr-md' : 'rounded-tl-md'}`}>
                {msg.role === 'assistant' && (
                  <div className="font-semibold text-purple-600 text-sm mb-3 flex items-center">
                    <IconBrain className="w-4 h-4 mr-2" />
                    SAGE
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
                <div className={`text-xs mt-3 ${
                  msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <IconBrain className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-gray-100 shadow-md p-5 rounded-2xl rounded-tl-md">
                <div className="font-semibold text-purple-600 text-sm mb-3 flex items-center">
                  <IconBrain className="w-4 h-4 mr-2" />
                  SAGE
                </div>
                <div className="flex items-center space-x-3">
                  <IconLoader2 className="w-5 h-5 animate-spin text-purple-500" />
                  <span className="text-sm text-gray-600">Analyzing your freelance data...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-md">
              <div className="text-sm text-red-700 font-medium">{error}</div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions (show only at start) */}
      {messages.length <= 1 && (
        <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">💡</span>
            </div>
            <span className="text-sm text-gray-700 font-semibold">Quick questions to get started:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onSend(question)}
                disabled={isLoading}
                className="text-xs h-10 px-4 bg-white hover:bg-purple-50 hover:border-purple-300 border-gray-200 transition-all duration-200 font-medium text-gray-700 hover:text-purple-700"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-gray-100">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your freelance growth..."
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="min-h-[56px] max-h-32 resize-none border-gray-200 focus:border-purple-400 focus:ring-purple-200 rounded-xl px-4 py-4 text-sm leading-relaxed placeholder:text-gray-400"
            />
          </div>
          <Button
            onClick={handleSendClick}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 self-end"
          >
            {isLoading ? (
              <IconLoader2 className="w-5 h-5 animate-spin" />
            ) : (
              <IconSend className="w-5 h-5" />
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
            <span className="text-white text-xs">💡</span>
          </div>
          <span>Ask about acceptance rates, best skills, market opportunities, or growth strategies</span>
        </div>
      </div>
    </div>
  );
}
