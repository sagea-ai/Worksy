import { useState, useCallback } from "react";
import { ChatMessage, AIProvider } from "@/types/oploven";

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (
      content: string,
      provider: AIProvider["name"] = "openai",
      model: string = "gpt-4"
    ) => {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        // TODO: Implement proper chat API endpoint
        // const response = await fetch('/api/oploven/chat', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     messages: [...messages, userMessage].map(msg => ({
        //       role: msg.role,
        //       content: msg.content,
        //     })),
        //     provider,
        //     model,
        //   }),
        // });

        // if (!response.ok) {
        //   throw new Error('Failed to send message');
        // }

        // const data = await response.json();

        // Temporary mock response until proper API is implemented
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Chat functionality is currently under development.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
