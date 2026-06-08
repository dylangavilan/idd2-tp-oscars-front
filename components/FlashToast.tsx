"use client";

import { useEffect } from "react";
import { AppToastType, showToast } from "@/components/ui/app-toast";

interface FlashToastProps {
  duration?: number;
  message?: string;
  type?: AppToastType;
}

export function FlashToast({ duration, message, type = "success" }: FlashToastProps) {
  useEffect(() => {
    if (!message) return;
    showToast({ duration, message, type });
  }, [duration, message, type]);

  return null;
}
