"use client";

import { Bot } from "lucide-react";

type Props = {
  onClick: () => void;
};

export default function AiTutorBubble({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Buka AI Tutor"
      style={{
        position: "fixed",
        right: "24px",
        bottom: "24px",
        width: "68px",
        height: "68px",
        borderRadius: "9999px",
        border: "none",
        outline: "none",
        cursor: "pointer",
        background: "var(--surface, #e9eef5)",
        boxShadow:
          "10px 10px 20px var(--shadow-dark, #c5ccd6), -10px -10px 20px var(--shadow-light, #ffffff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2147483647,
        color: "var(--accent, #2f80ed)",
      }}

    >
      <Bot size={28} strokeWidth={2.2} />
    </button>
  );

  
}