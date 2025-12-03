"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Warning, Info, XCircle } from "phosphor-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={24} weight="fill" />,
    error: <XCircle size={24} weight="fill" />,
    warning: <Warning size={24} weight="fill" />,
    info: <Info size={24} weight="fill" />,
  };

  const colors = {
    success: {
      bg: "from-green-500/20 to-emerald-500/20",
      border: "border-green-500/30",
      icon: "text-green-400",
      text: "text-green-100",
    },
    error: {
      bg: "from-red-500/20 to-rose-500/20",
      border: "border-red-500/30",
      icon: "text-red-400",
      text: "text-red-100",
    },
    warning: {
      bg: "from-orange-500/20 to-yellow-500/20",
      border: "border-orange-500/30",
      icon: "text-orange-400",
      text: "text-orange-100",
    },
    info: {
      bg: "from-blue-500/20 to-cyan-500/20",
      border: "border-blue-500/30",
      icon: "text-blue-400",
      text: "text-blue-100",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`
        relative rounded-xl bg-gradient-to-br ${colors[type].bg}
        border ${colors[type].border}
        backdrop-blur-xl
        p-4 pr-12
        shadow-2xl
        min-w-[320px] max-w-[500px]
      `}
    >
      <div className="flex items-start gap-3">
        <div className={colors[type].icon}>{icons[type]}</div>
        <p className={`${colors[type].text} text-sm font-medium leading-relaxed`}>
          {message}
        </p>
      </div>
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
      >
        <X size={20} />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type: ToastType;
  }>;
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
