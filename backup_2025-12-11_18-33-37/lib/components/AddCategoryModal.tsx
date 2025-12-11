"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "phosphor-react";
import { getIcon } from "@/lib/iconMapping";
import { showToast } from "@/lib/toast";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: { name: string; icon: string; color: string; type: 'expense' | 'income' }) => void;
}

const availableIcons = [
  'ShoppingCart', 'GasPump', 'Drop', 'Sparkle', 'TShirt', 'Sneaker',
  'House', 'Lightning', 'Armchair', 'ForkKnife', 'GameController',
  'Airplane', 'Key', 'Gift', 'CreditCard', 'User', 'Barbell', 'Wrench',
  'Car', 'IdentificationCard', 'GraduationCap', 'Scales', 'ShieldCheck',
  'Bank', 'Users', 'Money', 'Laptop', 'TrendUp', 'Question'
];

const presetColors = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94',
  '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B4D9', '#B4E7CE', '#FFD93D', '#A29BFE', '#FD79A8',
  '#FDCB6E', '#6C5CE7', '#74B9FF', '#81ECEC', '#FAB1A0',
  '#FF7675', '#DFE6E9', '#00B894', '#00CEC9', '#0984E3',
  '#6C5CE7', '#FD79A8'
];

export default function AddCategoryModal({
  isOpen,
  onClose,
  onSave,
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [selectedIcon, setSelectedIcon] = useState("Question");
  const [selectedColor, setSelectedColor] = useState("#FF6B9D");

  const handleSave = () => {
    if (!name.trim()) {
      showToast("Unesite naziv kategorije", "warning");
      return;
    }

    onSave({
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      type,
    });

    // Reset form
    setName("");
    setType('expense');
    setSelectedIcon("Question");
    setSelectedColor("#FF6B9D");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-1 rounded-3xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(159, 112, 255, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
        <div
          className="rounded-3xl backdrop-blur-xl p-8"
          style={{
            background: "rgba(20, 18, 38, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            fontFamily: '"Inter", sans-serif',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">
              Nova kategorija
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all duration-200"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
            >
              <X size={20} weight="bold" style={{ color: "#fff" }} />
            </button>
          </div>

          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-2">
              Naziv kategorije
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Unesite naziv kategorije"
              className="w-full px-4 py-3 rounded-xl transition-all duration-200 outline-none"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#fff",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(167, 139, 250, 0.5)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
            />
          </div>

          {/* Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3">
              Tip kategorije
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setType('expense')}
                className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200"
                style={{
                  background: type === 'expense' ? "rgba(255, 107, 157, 0.2)" : "rgba(255, 255, 255, 0.05)",
                  border: type === 'expense' ? "2px solid #FF6B9D" : "1px solid rgba(255, 255, 255, 0.1)",
                  color: type === 'expense' ? "#FF6B9D" : "rgba(255, 255, 255, 0.6)",
                }}
              >
                Trošak
              </button>
              <button
                onClick={() => setType('income')}
                className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200"
                style={{
                  background: type === 'income' ? "rgba(69, 211, 138, 0.2)" : "rgba(255, 255, 255, 0.05)",
                  border: type === 'income' ? "2px solid #45D38A" : "1px solid rgba(255, 255, 255, 0.1)",
                  color: type === 'income' ? "#45D38A" : "rgba(255, 255, 255, 0.6)",
                }}
              >
                Prihod
              </button>
            </div>
          </div>

          {/* Icon Grid */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3">
              Izaberite ikonu
            </label>
            <div
              className="grid grid-cols-6 md:grid-cols-8 gap-2 p-4 rounded-xl max-h-[200px] overflow-y-auto"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              {availableIcons.map((iconName) => {
                const IconComponent = getIcon(iconName);
                const isSelected = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    onClick={() => setSelectedIcon(iconName)}
                    className="p-3 rounded-lg transition-all duration-200"
                    style={{
                      background: isSelected ? "rgba(167, 139, 250, 0.2)" : "rgba(255, 255, 255, 0.05)",
                      border: isSelected ? "2px solid rgba(167, 139, 250, 0.6)" : "1px solid rgba(255, 255, 255, 0.08)",
                      color: isSelected ? "#A78BFA" : "rgba(255, 255, 255, 0.6)",
                    }}
                  >
                    <IconComponent size={24} weight="duotone" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Picker */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-white mb-3">
              Izaberite boju
            </label>
            <div
              className="grid grid-cols-9 md:grid-cols-12 gap-2 p-4 rounded-xl"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              {presetColors.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="w-10 h-10 rounded-lg transition-all duration-200 flex items-center justify-center"
                    style={{
                      background: color,
                      border: isSelected ? "2px solid #fff" : "1px solid rgba(255, 255, 255, 0.2)",
                      boxShadow: isSelected ? `0 0 15px ${color}` : "none",
                    }}
                  >
                    {isSelected && (
                      <Check size={20} weight="bold" style={{ color: "#fff", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "rgba(255, 255, 255, 0.8)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
              }}
            >
              Otkaži
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200"
              style={{
                background: name.trim()
                  ? "linear-gradient(135deg, #7B5CFF 0%, #4DB5FF 100%)"
                  : "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                cursor: name.trim() ? "pointer" : "not-allowed",
                opacity: name.trim() ? 1 : 0.5,
              }}
              onMouseEnter={(e) => {
                if (name.trim()) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 10px 30px -10px rgba(123, 92, 255, 0.5)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Kreiraj kategoriju
            </button>
          </div>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
