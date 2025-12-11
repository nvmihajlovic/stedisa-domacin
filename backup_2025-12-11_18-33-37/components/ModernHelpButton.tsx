"use client";

import { useState } from "react";
import { Question } from "@phosphor-icons/react";
import ModernHelpModal from "./ModernHelpModal";

interface ModernHelpButtonProps {
  page: "dashboard" | "expenses" | "incomes" | "groups" | "categories" | "statistics" | "profile";
  className?: string;
}

export default function ModernHelpButton({ page, className = "" }: ModernHelpButtonProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsHelpOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative p-3 rounded-2xl hover:scale-105 transition-all duration-300 group ${className}`}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        title="Pomoć & Tutorijali"
      >
        <Question 
          size={22} 
          weight="bold"
          className="transition-all duration-300"
          style={{
            color: isHovered ? '#9F70FF' : '#E8D9FF'
          }}
        />
      </button>

      {/* Help Modal */}
      <ModernHelpModal
        page={page}
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </>
  );
}
