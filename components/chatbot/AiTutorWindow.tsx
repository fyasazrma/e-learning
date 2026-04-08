"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, X } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AiTutorWindow({ open, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Halo! Saya AI Tutor. Tanya apa saja tentang Word, Excel, atau PowerPoint.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!open) return null;

  async function handleSend() {
    if (!input.trim() || loading) return;

    const content = input.trim();
    setMessages((prev) => [...prev, { role: "user", content }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: content }),
      });

      const text = await res.text();
      let data: any = null;

      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data?.message ||
              `API error ${res.status}. Cek terminal Next.js.`,
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.success
            ? data.data.reply
            : data?.message || "Terjadi kesalahan saat memproses pesan.",
        },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Koneksi gagal: ${error?.message || "unknown error"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="chatbot-window"
      style={{
        position: "fixed",
        right: "24px",
        bottom: "104px",
        width: "360px",
        height: "520px",
        borderRadius: "28px",
        background: "var(--surface, #e9eef5)",
        boxShadow: `
        0px 20px 40px rgba(0,0,0,0.12),
        10px 10px 20px var(--shadow-dark),
        -10px -10px 20px var(--shadow-light)
        `,
        zIndex: 2147483646,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        className="chatbot-header"
        style={{
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            className="chatbot-header-icon"
            style={{
              width: 42,
              height: 42,
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--surface, #e9eef5)",
              boxShadow:
                "6px 6px 12px var(--shadow-dark, #c5ccd6), -6px -6px 12px var(--shadow-light, #ffffff)",
              color: "var(--accent, #2f80ed)",
            }}
          >
            <Bot size={20} />
          </div>

          <div className="chatbot-header-text">
            <h3 style={{ margin: 0, color: "var(--text-main, #1f2937)" }}>
              AI Tutor
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "13px",
                color: "var(--text-soft, #6b7280)",
              }}
            >
              Tutor Office Learning
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="chatbot-close-btn"
          style={{
            width: 38,
            height: 38,
            borderRadius: "9999px",
            border: "none",
            cursor: "pointer",
            background: "var(--surface, #e9eef5)",
            color: "var(--accent, #2f80ed)",
            boxShadow:
              "6px 6px 12px var(--shadow-dark, #c5ccd6), -6px -6px 12px var(--shadow-light, #ffffff)",
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div
        className="chatbot-messages"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.role === "user" ? "chat-msg-user" : "chat-msg-ai"}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              padding: "12px 14px",
              borderRadius: 18,
              whiteSpace: "pre-wrap",
              lineHeight: 1.5,
              background:
                msg.role === "user"
                  ? "var(--accent, #2f80ed)"
                  : "var(--surface, #e9eef5)",
              color: msg.role === "user" ? "#fff" : "var(--text-main, #1f2937)",
              boxShadow:
                msg.role === "user"
                  ? "none"
                  : "inset 4px 4px 8px var(--shadow-dark, #c5ccd6), inset -4px -4px 8px var(--shadow-light, #ffffff)",
            }}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div
            className="chat-msg-ai"
            style={{
              alignSelf: "flex-start",
              maxWidth: "80%",
              padding: "12px 14px",
              borderRadius: 18,
              background: "var(--surface, #e9eef5)",
              color: "var(--text-soft, #6b7280)",
              boxShadow:
                "inset 4px 4px 8px var(--shadow-dark, #c5ccd6), inset -4px -4px 8px var(--shadow-light, #ffffff)",
            }}
          >
            AI sedang mengetik...
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div
        className="chatbot-input-area"
        style={{ padding: 16, display: "flex", gap: 10 }}
      >
        <input
          className="chatbot-input"
          type="text"
          placeholder="Tanya sesuatu..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            borderRadius: 18,
            padding: "14px 16px",
            background: "var(--surface, #e9eef5)",
            color: "var(--text-main, #1f2937)",
            boxShadow:
              "inset 6px 6px 12px var(--shadow-dark, #c5ccd6), inset -6px -6px 12px var(--shadow-light, #ffffff)",
          }}
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={loading}
          className="chatbot-send-btn"
          style={{
            width: 52,
            border: "none",
            borderRadius: 18,
            cursor: "pointer",
            background: "var(--surface, #e9eef5)",
            color: "var(--accent, #2f80ed)",
            boxShadow:
              "6px 6px 12px var(--shadow-dark, #c5ccd6), -6px -6px 12px var(--shadow-light, #ffffff)",
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}