"use client";

import { motion } from "framer-motion";
import { ChartPie, Receipt } from "phosphor-react";
import { getIcon } from "@/lib/iconMapping";

interface CategoryData {
  total: number;
  color: string;
  icon: string;
}

interface Transaction {
  id: string;
  type: "expense" | "income";
  amount: number;
  description: string;
  category: any;
  user: any;
}

interface GroupStatisticsProps {
  categoryExpenses: Record<string, CategoryData>;
  categoryIncomes: Record<string, CategoryData>;
  transactions: Transaction[];
}

export default function GroupStatistics({
  categoryExpenses,
  categoryIncomes,
  transactions,
}: GroupStatisticsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Top Expense Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-6 border border-white/10"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ChartPie size={24} className="text-red-400" />
          Top kategorije troškova
        </h2>
        <div className="space-y-3">
          {Object.entries(categoryExpenses).length > 0 ? (
            Object.entries(categoryExpenses)
              .sort((a, b) => b[1].total - a[1].total)
              .slice(0, 5)
              .map(([name, data]) => {
                const IconComponent = getIcon(data.icon);
                return (
                  <div
                    key={name}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${data.color}20` }}
                      >
                        <IconComponent
                          size={20}
                          weight="duotone"
                          style={{ color: data.color }}
                        />
                      </div>
                      <span className="text-gray-300 font-medium">{name}</span>
                    </div>
                    <span className="text-white font-semibold">
                      {data.total.toLocaleString("sr-RS", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      RSD
                    </span>
                  </div>
                );
              })
          ) : (
            <p className="text-gray-500 text-center py-8">Nema podataka</p>
          )}
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-6 border border-white/10"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Receipt size={24} className="text-purple-400" />
          Nedavne transakcije
        </h2>
        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions.slice(0, 5).map((transaction) => {
              const IconComponent = getIcon(
                transaction.category?.icon || "Question"
              );
              const isExpense = transaction.type === "expense";
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${
                          transaction.category?.color || "#6B7280"
                        }20`,
                      }}
                    >
                      <IconComponent
                        size={20}
                        weight="duotone"
                        style={{
                          color: transaction.category?.color || "#6B7280",
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {transaction.description}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {transaction.user.name} •{" "}
                        {new Date(transaction.date).toLocaleString("sr-RS", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-bold text-sm ${
                      isExpense ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {isExpense ? "-" : "+"}
                    {transaction.amount.toLocaleString("sr-RS", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    {transaction.currency || "RSD"}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-8">Nema transakcija</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
