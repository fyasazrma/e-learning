"use client";

import { useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function MahasiswaChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Halo! Saya AI Tutor. Tanya apa saja tentang Word, Excel, atau PowerPoint.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
        }),
      });

      const response = await res.json();

      if (!response.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.message || "Terjadi kesalahan saat memproses chat.",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.data.reply,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Terjadi kesalahan koneksi ke chatbot.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack fade-in">
      <div className="dashboard-card neu-card">
        <h2 style={{ marginBottom: "12px" }}>AI Tutor Chatbot</h2>
        <p style={{ color: "var(--text-soft)" }}>
          Tanya apa saja tentang Docs, Sheets, dan Slides.
        </p>
      </div>

      <div
        className="dashboard-card neu-card"
        style={{
          minHeight: 420,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            flex: 1,
            maxHeight: 420,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            paddingRight: 4,
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "80%",
                padding: "12px 16px",
                borderRadius: 16,
                background:
                  msg.role === "user" ? "var(--accent)" : "var(--surface)",
                color: msg.role === "user" ? "#fff" : "var(--text-main)",
                boxShadow:
                  msg.role === "user"
                    ? "var(--shadow-soft)"
                    : "var(--shadow-inset)",
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
              }}
            >
              {msg.content}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <input
            type="text"
            className="neu-input"
            placeholder="Contoh: bagaimana cara memakai rumus SUM?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            style={{ flex: 1 }}
          />

          <button
            onClick={handleSend}
            className="neu-button"
            disabled={loading}
          >
            {loading ? "Mengirim..." : "Kirim"}
          </button>
        </div>
      </div>
    </div>
  );
}