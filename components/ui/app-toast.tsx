"use client";

import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type AppToastType = "alert" | "info" | "warn" | "success";

interface AppToastProps {
  duration?: number;
  message: string;
  type: AppToastType;
}

const DEFAULT_DURATION = 3000;

const toastStyles: Record<AppToastType, { container: string; icon: string; Icon: typeof InfoIcon }> = {
  alert: {
    container: "border-red-200 bg-red-50 text-red-950",
    icon: "text-red-600",
    Icon: CircleAlertIcon,
  },
  info: {
    container: "border-blue-200 bg-blue-50 text-blue-950",
    icon: "text-blue-600",
    Icon: InfoIcon,
  },
  warn: {
    container: "border-yellow-200 bg-yellow-50 text-yellow-950",
    icon: "text-yellow-600",
    Icon: TriangleAlertIcon,
  },
  success: {
    container: "border-green-200 bg-green-50 text-green-950",
    icon: "text-green-600",
    Icon: CircleCheckIcon,
  },
};

export function AppToast({ message, type }: Omit<AppToastProps, "duration">) {
  const { container, icon, Icon } = toastStyles[type];

  return (
    <div
      className={cn(
        "flex min-w-80 items-start gap-3 rounded-lg border px-4 py-3 shadow-lg",
        container
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", icon)} />
      <p className="text-sm font-medium leading-5">{message}</p>
    </div>
  );
}

export function showToast({ duration = DEFAULT_DURATION, message, type }: AppToastProps) {
  toast.custom(() => <AppToast message={message} type={type} />, {
    duration,
  });
}
