"use client";

import { motion } from "framer-motion";
import { ChartLine, TrendUp, TrendDown, ChartBar, ChartPie, Wallet } from "phosphor-react";
import { getIcon } from "@/lib/iconMapping";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MonthlyTrend {
  month: string;
  expenses: number;
  incomes: number;
}

interface MemberComparison {
  userId: string;
  name: string;
  expenses: number;
  incomes: number;
  balance: number;
}

interface CategoryData {
  total: number;
  color: string;
  icon: string;
}

interface GroupChartsAdvancedProps {
  monthlyTrend: MonthlyTrend[];
  memberComparison: MemberComparison[];
  categoryExpenses: Record<string, CategoryData>;
  categoryIncomes: Record<string, CategoryData>;
  totalExpenses: number;
  totalIncomes: number;
  // Nove props za dodatne statistike
  yoyData?: {
    currentYearTotal: number;
    previousYearTotal: number;
    percentageChange: number;
    monthlyTrend: number[];
  };
  momData?: {
    currentMonthExpenses: number;
    previousMonthExpenses: number;
    expensesChange: number;
    currentMonthIncomes: number;
    previousMonthIncomes: number;
    incomesChange: number;
    currentMonthBalance: number;
    previousMonthBalance: number;
    balanceChange: number;
    monthlyTrend: { expenses: number; incomes: number; balance: number }[];
  };
  hourlyExpenses?: { hour: string; amount: number }[];
  last30Days?: { date: string; expenses: number; incomes: number }[];
  consistentCategories?: { name: string; months: number }[];
  categoryGrowth?: { name: string; growth: number }[];
  monthsInProfit?: number;
  weekdayExpenses?: { day: string; amount: number }[];
  dailyExpenses?: { day: string; amount: number }[];
  topExpenses?: {
    id: string;
    description: string;
    amount: number;
    category: string;
    icon: string;
    date: string;
  }[];
  averages?: { expenses: number; incomes: number };
}

export default function GroupChartsAdvanced({
  monthlyTrend,
  memberComparison,
  categoryExpenses,
  categoryIncomes,
  totalExpenses,
  totalIncomes,
  yoyData,
  momData,
  hourlyExpenses,
  last30Days,
  consistentCategories,
  categoryGrowth,
  monthsInProfit,
  weekdayExpenses,
  dailyExpenses,
  topExpenses,
  averages,
}: GroupChartsAdvancedProps) {
  // Priprema podataka za Pie chart
  const expensePieData = Object.entries(categoryExpenses).map(([name, data]) => ({
    name,
    value: data.total,
    color: data.color,
  }));

  const incomePieData = Object.entries(categoryIncomes).map(([name, data]) => ({
    name,
    value: data.total,
    color: data.color,
  }));

  return (
    <div className="space-y-6 mb-8">
      {/* Uporedna analiza - YoY / MoM */}
      {(yoyData || momData) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-6 border border-white/10"
        >
          <h2 className="text-xl font-bold text-white mb-6">Uporedna analiza</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* YoY */}
            {yoyData && (
              <div className="rounded-2xl backdrop-blur-sm p-5 flex flex-col gap-3 border border-white/5">
                <h4 className="text-sm font-medium mb-2 text-white">
                  Godina na godinu (YoY)
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">Trenutna godina</span>
                  <span className="text-sm font-semibold text-white">
                    {yoyData.currentYearTotal.toLocaleString("sr-RS")} RSD
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">Prošla godina</span>
                  <span className="text-sm font-semibold text-white/50">
                    {yoyData.previousYearTotal.toLocaleString("sr-RS")} RSD
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  {yoyData.percentageChange > 0 ? (
                    <>
                      <TrendUp size={16} weight="bold" className="text-red-400" />
                      <span className="text-xs font-medium text-red-400">
                        +{Math.abs(yoyData.percentageChange).toFixed(1)}%
                      </span>
                    </>
                  ) : yoyData.percentageChange < 0 ? (
                    <>
                      <TrendDown size={16} weight="bold" className="text-green-400" />
                      <span className="text-xs font-medium text-green-400">
                        {yoyData.percentageChange.toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-medium text-white/60">0%</span>
                  )}
                  <span className="text-xs ml-auto text-white/60">
                    {yoyData.percentageChange > 0
                      ? "porast"
                      : yoyData.percentageChange < 0
                      ? "pad"
                      : "bez promene"}
                  </span>
                </div>
              </div>
            )}

            {/* MoM */}
            {momData && (
              <div className="rounded-2xl backdrop-blur-sm p-5 flex flex-col gap-3 border border-white/5">
                <h4 className="text-sm font-medium mb-2 text-white">
                  Mesec na mesec (MoM)
                </h4>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">Troškovi</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          momData.expensesChange > 0
                            ? "text-red-400"
                            : momData.expensesChange < 0
                            ? "text-green-400"
                            : "text-gray-400"
                        }`}
                      >
                        {momData.expensesChange > 0 ? "+" : ""}
                        {momData.expensesChange.toFixed(1)}%
                      </span>
                      {momData.expensesChange > 0 ? (
                        <TrendUp size={14} weight="bold" className="text-red-400" />
                      ) : momData.expensesChange < 0 ? (
                        <TrendDown size={14} weight="bold" className="text-green-400" />
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">
                      {momData.currentMonthExpenses.toLocaleString("sr-RS")}
                    </span>
                    <span className="text-white/50">
                      vs {momData.previousMonthExpenses.toLocaleString("sr-RS")}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">Prihodi</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          momData.incomesChange > 0
                            ? "text-green-400"
                            : momData.incomesChange < 0
                            ? "text-red-400"
                            : "text-gray-400"
                        }`}
                      >
                        {momData.incomesChange > 0 ? "+" : ""}
                        {momData.incomesChange.toFixed(1)}%
                      </span>
                      {momData.incomesChange > 0 ? (
                        <TrendUp size={14} weight="bold" className="text-green-400" />
                      ) : momData.incomesChange < 0 ? (
                        <TrendDown size={14} weight="bold" className="text-red-400" />
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">
                      {momData.currentMonthIncomes.toLocaleString("sr-RS")}
                    </span>
                    <span className="text-white/50">
                      vs {momData.previousMonthIncomes.toLocaleString("sr-RS")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Monthly Trend Line Chart */}
      {monthlyTrend.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-6 border border-white/10"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ChartLine size={24} className="text-blue-400" />
            Bilans kroz vreme (12 meseci)
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1b23",
                  border: "1px solid #444",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#FFB3E6"
                strokeWidth={2}
                name="Troškovi"
                dot={{ fill: "#FFB3E6", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="incomes"
                stroke="#6FFFC4"
                strokeWidth={2}
                name="Prihodi"
                dot={{ fill: "#6FFFC4", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Pie Charts for Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses Pie Chart */}
        {expensePieData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-6 border border-white/10"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ChartPie size={24} className="text-red-400" />
              Troškovi po kategorijama
            </h2>
            <div className="flex items-center gap-6">
              <div style={{ width: "240px", height: "240px", flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={115}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1b23",
                        border: "1px solid #444",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2.5">
                {expensePieData.slice(0, 5).map((cat, idx) => {
                  const Icon = getIcon(cat.name);
                  const total = expensePieData.reduce((sum, c) => sum + c.value, 0);
                  const percentage = ((cat.value / total) * 100).toFixed(1);
                  return (
                    <div key={idx} className="flex items-center gap-4">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ background: cat.color }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate text-white">
                          {cat.name}
                        </div>
                      </div>
                      <div className="text-xs font-bold" style={{ color: cat.color }}>
                        {percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Incomes Pie Chart */}
        {incomePieData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-6 border border-white/10"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ChartPie size={24} className="text-green-400" />
              Prihodi po kategorijama
            </h2>
            <div className="flex items-center gap-6">
              <div style={{ width: "240px", height: "240px", flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomePieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={115}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incomePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1b23",
                        border: "1px solid #444",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2.5">
                {incomePieData.slice(0, 5).map((cat, idx) => {
                  const Icon = getIcon(cat.name);
                  const total = incomePieData.reduce((sum, c) => sum + c.value, 0);
                  const percentage = ((cat.value / total) * 100).toFixed(1);
                  return (
                    <div key={idx} className="flex items-center gap-4">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ background: cat.color }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate text-white">
                          {cat.name}
                        </div>
                      </div>
                      <div className="text-xs font-bold" style={{ color: cat.color }}>
                        {percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Section: Daily Bar Chart + Top 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Expenses */}
        {dailyExpenses && dailyExpenses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-6 border border-white/10"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ChartBar size={24} className="text-purple-400" />
              Troškovi po danima
            </h2>
            <ResponsiveContainer width="100%" height={375}>
              <BarChart data={dailyExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1b23",
                    border: "1px solid #444",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="amount" fill="#FFB3E6" name="Iznos" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Top 5 Expenses */}
        {topExpenses && topExpenses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-6 border border-white/10"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendDown size={24} className="text-red-400" />
              Top 5 najvećih troškova
            </h2>
            <div className="space-y-4">
              {topExpenses.map((exp, idx) => {
                const Icon = getIcon(exp.icon);
                return (
                  <div
                    key={exp.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg flex-shrink-0 bg-red-400/20 text-red-400">
                      {idx + 1}
                    </div>
                    <div className="p-2 rounded-lg flex-shrink-0 bg-red-400/15">
                      <Icon size={20} weight="bold" className="text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate text-white">
                        {exp.description}
                      </div>
                      <div className="text-sm text-gray-400">
                        {exp.category} • {exp.date}
                      </div>
                    </div>
                    <div className="font-bold text-lg flex-shrink-0 text-right text-red-400">
                      {exp.amount.toLocaleString("sr-RS")} RSD
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Member Comparison Bar Chart */}
      {memberComparison.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-6 border border-white/10"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ChartBar size={24} className="text-purple-400" />
            Poređenje članova
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memberComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1b23",
                  border: "1px solid #444",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="expenses" fill="#EF4444" name="Troškovi" />
              <Bar dataKey="incomes" fill="#10B981" name="Prihodi" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Dodatne statistike */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-6 text-white">Dodatne statistike</h2>

        {/* Row 1: Hourly + Last 30 Days */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Hourly Expenses */}
          {hourlyExpenses && hourlyExpenses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-6 border border-white/10"
            >
              <h3 className="text-lg font-bold text-white mb-6">
                Troškovi po satima u danu
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={hourlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="hour" stroke="#9CA3AF" style={{ fontSize: "11px" }} />
                  <YAxis stroke="#9CA3AF" style={{ fontSize: "11px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1b23",
                      border: "1px solid #444",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="amount" fill="#B794FF" name="Iznos" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Last 30 Days */}
          {last30Days && last30Days.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-6 border border-white/10"
            >
              <h3 className="text-lg font-bold text-white mb-6">
                Priliv i odliv poslednjih 30 dana
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={last30Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: "10px" }} />
                  <YAxis stroke="#9CA3AF" style={{ fontSize: "11px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1b23",
                      border: "1px solid #444",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} iconType="line" />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#FFB3E6"
                    strokeWidth={2}
                    name="Troškovi"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="incomes"
                    stroke="#6FFFC4"
                    strokeWidth={2}
                    name="Prihodi"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        {/* Row 2: Consistent Categories + Category Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Consistent Categories */}
          {consistentCategories && consistentCategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-6 border border-white/10"
            >
              <h3 className="text-lg font-bold text-white mb-6">
                Najkonzistentnije kategorije
              </h3>
              <div className="space-y-3">
                {consistentCategories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm bg-purple-400/20 text-purple-400">
                        {idx + 1}
                      </div>
                      <span className="font-semibold text-white">{cat.name}</span>
                    </div>
                    <div className="text-sm font-bold text-purple-400">
                      {cat.months}/12 meseci
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Category Growth */}
          {categoryGrowth && categoryGrowth.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-6 border border-white/10"
            >
              <h3 className="text-lg font-bold text-white mb-6">
                Rast kategorija (poslednjih 6 meseci)
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryGrowth} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#9CA3AF" style={{ fontSize: "11px" }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#9CA3AF"
                    style={{ fontSize: "11px" }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1b23",
                      border: "1px solid #444",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="growth" fill="#7FDFFF" name="Rast %" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        {/* Row 3: Months in Profit + Weekday Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Months in Profit */}
          {monthsInProfit !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-6 border border-white/10"
            >
              <h3 className="text-lg font-bold text-white mb-6">
                Meseci u plusu (poslednjih 12)
              </h3>
              <div className="flex items-center justify-center" style={{ height: "120px" }}>
                <div className="text-center">
                  <div
                    className="text-6xl font-bold mb-2"
                    style={{ color: monthsInProfit >= 6 ? "#6FFFC4" : "#FFB3E6" }}
                  >
                    {monthsInProfit}
                  </div>
                  <div className="text-sm text-gray-400">
                    od 12 meseci ({Math.round((monthsInProfit / 12) * 100)}%)
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Weekday Heatmap */}
          {weekdayExpenses && weekdayExpenses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-6 border border-white/10"
            >
              <h3 className="text-lg font-bold text-white mb-6">
                Potrošnja po danima u nedelji
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {weekdayExpenses.map((day, idx) => {
                  const maxAmount = Math.max(...weekdayExpenses.map((d) => d.amount));
                  const intensity = day.amount / maxAmount;
                  return (
                    <div key={idx} className="text-center">
                      <div
                        className="rounded-lg p-4 mb-2"
                        style={{
                          background: `rgba(255, 179, 230, ${intensity * 0.6 + 0.1})`,
                          border: "1px solid rgba(255, 179, 230, 0.3)",
                        }}
                      >
                        <div className="text-xs font-bold text-pink-400">{day.day}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {(day.amount / 1000).toFixed(1)}k
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Averages */}
        {averages && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-6 border border-white/10"
          >
            <h3 className="text-lg font-bold text-white mb-6">
              Prosečni mesečni troškovi i prihodi (12 meseci)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="text-sm font-semibold text-white/55">Prosečni troškovi</div>
                  <TrendDown size={20} weight="duotone" className="text-red-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {averages.expenses.toLocaleString("sr-RS")}{" "}
                  <span className="text-base opacity-60 font-medium ml-1">RSD</span>
                </div>
              </div>

              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="text-sm font-semibold text-white/55">Prosečni prihodi</div>
                  <TrendUp size={20} weight="duotone" className="text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {averages.incomes.toLocaleString("sr-RS")}{" "}
                  <span className="text-base opacity-60 font-medium ml-1">RSD</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
