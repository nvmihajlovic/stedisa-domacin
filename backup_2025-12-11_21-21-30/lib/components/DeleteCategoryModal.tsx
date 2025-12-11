"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, WarningCircle, Trash } from "phosphor-react";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName: string;
  hasTransactions: boolean;
  transactionCount?: number;
}

export default function DeleteCategoryModal({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  hasTransactions,
  transactionCount = 0,
}: DeleteCategoryModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
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
            className="w-full max-w-md p-1 rounded-3xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 107, 157, 0.2) 0%, rgba(159, 112, 255, 0.2) 100%)",
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
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: hasTransactions
                    ? "rgba(251, 191, 36, 0.15)"
                    : "rgba(239, 68, 68, 0.15)",
                  border: hasTransactions
                    ? "1px solid rgba(251, 191, 36, 0.3)"
                    : "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                {hasTransactions ? (
                  <WarningCircle
                    size={24}
                    weight="duotone"
                    style={{ color: "#FBB024" }}
                  />
                ) : (
                  <Trash
                    size={24}
                    weight="duotone"
                    style={{ color: "#EF4444" }}
                  />
                )}
              </div>
              <h2
                className="text-xl font-bold text-white"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                {hasTransactions ? "Ne može se obrisati" : "Brisanje kategorije"}
              </h2>
            </div>
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

          {/* Content */}
          <div className="mb-8">
            {hasTransactions ? (
              <>
                <p
                  className="text-base mb-4"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  Kategorija <strong className="text-white">{categoryName}</strong> se ne može obrisati jer je u upotrebi.
                </p>
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: "rgba(251, 191, 36, 0.1)",
                    border: "1px solid rgba(251, 191, 36, 0.2)",
                  }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#FBB024" }}
                  >
                    Broj transakcija: {transactionCount}
                  </p>
                  <p
                    className="text-sm mt-2"
                    style={{ color: "rgba(255, 255, 255, 0.7)" }}
                  >
                    Morate prvo obrisati sve transakcije koje koriste ovu kategoriju.
                  </p>
                </div>
              </>
            ) : (
              <>
                <p
                  className="text-base mb-2"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  Da li želite da obrišete kategoriju{" "}
                  <strong className="text-white">{categoryName}</strong>?
                </p>
                <p
                  className="text-sm"
                  style={{ color: "rgba(255, 255, 255, 0.5)" }}
                >
                  Ova radnja je trajna i ne može se poništiti.
                </p>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {hasTransactions ? (
              <button
                onClick={onClose}
                className="flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200"
                style={{
                  background:
                    "linear-gradient(135deg, #7B5CFF 0%, #4DB5FF 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 30px -10px rgba(123, 92, 255, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Razumem
              </button>
            ) : (
              <>
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
                  onClick={onConfirm}
                  className="flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200"
                  style={{
                    background:
                      "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 30px -10px rgba(239, 68, 68, 0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Obriši
                </button>
              </>
            )}
          </div>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
