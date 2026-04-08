"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import AiTutorBubble from "./AiTutorBubble";
import AiTutorWindow from "./AiTutorWindow";

export default function FloatingAiTutor() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      <AiTutorWindow open={open} onClose={() => setOpen(false)} />
      <AiTutorBubble onClick={() => setOpen((prev) => !prev)} />
    </>,
    document.body
  );
}