import { useState } from "react";
import { useAiChat } from "@/api/generated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function AICopilot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const chat = useAiChat();

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    chat.mutate(
      { message: text },
      {
        onSuccess: (data) =>
          setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]),
        onError: () =>
          setMessages((prev) => [...prev, { role: "assistant", text: "Error — could not reach backend." }]),
      }
    );
  };

  return (
    <div className="flex flex-col h-full max-w-2xl">
      <h1 className="text-xl font-semibold mb-4 text-gray-800">AI Copilot</h1>

      <div className="flex-1 flex flex-col gap-3 overflow-auto mb-4 min-h-0 max-h-[calc(100vh-220px)]">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400">Ask anything about your enterprise data…</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`px-4 py-2.5 rounded-lg text-sm max-w-prose ${
              m.role === "user"
                ? "bg-gray-900 text-white self-end"
                : "bg-gray-100 text-gray-800 self-start"
            }`}
          >
            {m.text}
          </div>
        ))}
        {chat.isPending && (
          <div className="px-4 py-2.5 rounded-lg text-sm bg-gray-100 text-gray-400 self-start animate-pulse">
            Thinking…
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
        />
        <Button onClick={handleSend} disabled={chat.isPending || !input.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
