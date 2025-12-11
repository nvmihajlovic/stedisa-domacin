"use client";

import { useEffect, useState } from "react";
import { TrendUp, TrendDown, Wallet, Receipt } from "phosphor-react";
import CountUp from "react-countup";
import {
  LineChart,
  Line,
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
import { getIcon } from "@/lib/iconMapping";

interface MemberStats {
  totalExpenses: number;
  totalIncomes: number;
  balance: number;
  transactionCount: number;
}

interface MonthlyData {
  month: string;
  expenses: number;
  incomes: number;
}

interface CategoryData {
  name: string;
  total: number;
  color: string;
  icon: string;
}

interface Transaction {
  id: string;
  type: "expense" | "income";
  amount: number;
  description: string;
  date: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
}

interface MemberDashboardProps {
  groupId: string;
  memberId: string;
  memberName: string;
}

export default function MemberDashboard({ groupId, memberId, memberName }: MemberDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MemberStats>({
    totalExpenses: 0,
    totalIncomes: 0,
    balance: 0,
    transactionCount: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<CategoryData[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<CategoryData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchMemberData();
  }, [groupId, memberId]);

  const fetchMemberData = async () => {
    try {
      const res = await fetch(`/api/group/member-stats?groupId=${groupId}&memberId=${memberId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch member data");
      }

      const text = await res.text();
      const data = text ? JSON.parse(text) : { stats: {}, monthlyData: [], expenseCategories: [], incomeCategories: [], transactions: [] };
      setStats(data.stats);
      setMonthlyData(data.monthlyData || []);
      setExpenseCategories(data.expenseCategories || []);
      setIncomeCategories(data.incomeCategories || []);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching member data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white text-xl">Učitavam podatke za {memberName}...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Troškovi */}
        <div
          className="rounded-3xl cursor-pointer hover:scale-[1.02] transition-all duration-300 relative p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] hover:shadow-[0_0_40px_-8px_rgba(228,88,110,0.3)]"
          style={{
            background: "linear-gradient(145deg, #1E1B2A, #171421)",
            border: "1px solid rgba(255,255,255,0.06)",
            height: "120px",
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="text-sm font-semibold"
              style={{ color: "rgba(255,255,255,0.55)", fontFamily: '"Inter", sans-serif' }}
            >
              Troškovi
            </div>
            <TrendDown size={20} weight="duotone" style={{ color: "#C339B5" }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: "#FFFFFF", fontFamily: '"Inter", sans-serif' }}>
            <CountUp end={stats.totalExpenses} duration={0.8} decimals={0} separator="." preserveValue />
            <span style={{ fontSize: "0.65em", opacity: 0.6, fontWeight: 500, marginLeft: "4px" }}>RSD</span>
          </div>
        </div>

        {/* Prihodi */}
        <div
          className="rounded-3xl cursor-pointer hover:scale-[1.02] transition-all duration-300 relative p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] hover:shadow-[0_0_40px_-8px_rgba(27,217,106,0.3)]"
          style={{
            background: "linear-gradient(145deg, #1E1B2A, #171421)",
            border: "1px solid rgba(255,255,255,0.06)",
            height: "120px",
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="text-sm font-semibold"
              style={{ color: "rgba(255,255,255,0.55)", fontFamily: '"Inter", sans-serif' }}
            >
              Prihodi
            </div>
            <TrendUp size={20} weight="duotone" style={{ color: "#1FBFA4" }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: "#FFFFFF", fontFamily: '"Inter", sans-serif' }}>
            <CountUp end={stats.totalIncomes} duration={0.8} decimals={0} separator="." preserveValue />
            <span style={{ fontSize: "0.65em", opacity: 0.6, fontWeight: 500, marginLeft: "4px" }}>RSD</span>
          </div>
        </div>

        {/* Bilans */}
        <div
          className="rounded-3xl relative p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)]"
          style={{
            background: "linear-gradient(145deg, #1E1B2A, #171421)",
            border: "1px solid rgba(255,255,255,0.06)",
            height: "120px",
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="text-sm font-semibold"
              style={{ color: "rgba(255,255,255,0.55)", fontFamily: '"Inter", sans-serif' }}
            >
              Bilans
            </div>
            <Wallet size={20} weight="duotone" style={{ color: stats.balance >= 0 ? "#4EC8E4" : "#C339B5" }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: "#FFFFFF", fontFamily: '"Inter", sans-serif' }}>
            <CountUp end={stats.balance} duration={0.8} decimals={0} separator="." preserveValue />
            <span style={{ fontSize: "0.65em", opacity: 0.6, fontWeight: 500, marginLeft: "4px" }}>RSD</span>
          </div>
        </div>

        {/* Transakcije */}
        <div
          className="rounded-3xl relative p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)]"
          style={{
            background: "linear-gradient(145deg, #1E1B2A, #171421)",
            border: "1px solid rgba(255,255,255,0.06)",
            height: "120px",
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="text-sm font-semibold"
              style={{ color: "rgba(255,255,255,0.55)", fontFamily: '"Inter", sans-serif' }}
            >
              Transakcije
            </div>
            <Receipt size={20} weight="duotone" style={{ color: "#D19CFF" }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: "#FFFFFF", fontFamily: '"Inter", sans-serif' }}>
            <CountUp end={stats.transactionCount} duration={0.8} preserveValue />
          </div>
        </div>
      </div>

      {/* Top Categories & Recent Transactions (Statistics Section) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top 5 Expense Categories */}
        <div
          className="rounded-3xl p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)]"
          style={{
            background: "linear-gradient(145deg, #1E1B2A, #171421)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h3 className="text-xl font-semibold mb-6" style={{ color: "#FFFFFF", fontFamily: '"Inter", sans-serif' }}>
            Top 5 kategorija troškova
          </h3>
          {expenseCategories.length > 0 ? (
            <div className="space-y-4">
              {expenseCategories.slice(0, 5).map((category) => {
                const IconComponent = getIcon(category.icon);
                const percentage = stats.totalExpenses > 0 ? (category.total / stats.totalExpenses) * 100 : 0;
                return (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <IconComponent size={24} weight="duotone" style={{ color: category.color }} />
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: "#FFFFFF", fontFamily: '"Inter", sans-serif' }}>
                            {category.name}
                          </p>
                          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)", fontFamily: '"Inter", sans-serif' }}>
                            {percentage.toFixed(1)}% ukupnih troškova
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-lg" style={{ color: "#C339B5", fontFamily: '"Inter", sans-serif' }}>
                        {category.total.toLocaleString("sr-RS")} RSD
                      </p>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          background: `linear-gradient(90deg, ${category.color}80, ${category.color})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p style={{ color: "rgba(255,255,255,0.45)", fontFamily: '"Inter", sans-serif' }}>
                Nema troškova za prikaz
              </p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div
          className="rounded-3xl p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)]"
          style={{
            background: "linear-gradient(145deg, #1E1B2A, #171421)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h3 className="text-xl font-semibold mb-6" style={{ color: "#FFFFFF", fontFamily: '"Inter", sans-serif' }}>
            Nedavne transakcije
          </h3>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => {
                const IconComponent = getIcon(transaction.category?.icon || "Question");
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-2xl transition-all duration-200 hover:scale-[1.01]"
                    style={{
                      background: "rgba(0, 0, 0, 0.2)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${transaction.category?.color || "#666"}20` }}
                      >
                        <IconComponent size={20} weight="duotone" style={{ color: transaction.category?.color || "#666" }} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "#FFFFFF", fontFamily: '"Inter", sans-serif' }}>
                          {transaction.description}
                        </p>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)", fontFamily: '"Inter", sans-serif' }}>
                          {transaction.category?.name || "Ostalo"} • {new Date(transaction.date).toLocaleDateString("sr-RS")}
                        </p>
                      </div>
                    </div>
                    <div
                      className="text-sm font-bold"
                      style={{
                        color: transaction.type === "expense" ? "#C339B5" : "#1FBFA4",
                        fontFamily: '"Inter", sans-serif',
                      }}
                    >
                      {transaction.type === "expense" ? "-" : "+"}
                      {transaction.amount.toLocaleString("sr-RS")}{" "}
                      {transaction.currency || "RSD"}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p style={{ color: "rgba(255,255,255,0.45)", fontFamily: '"Inter", sans-serif' }}>
                Nema transakcija za prikaz
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trend */}
      {monthlyData.length > 0 && (
        <div
          className="rounded-3xl p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)]"
          style={{
            background: "linear-gradient(145deg, #1E1B2A, #171421)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h3 className="text-xl font-semibold mb-6" style={{ color: "#FFFFFF", fontFamily: '"Inter", sans-serif' }}>
            Mesečni trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
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
              <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} name="Troškovi" dot={{ fill: "#EF4444", r: 4 }} />
              <Line type="monotone" dataKey="incomes" stroke="#10B981" strokeWidth={3} name="Prihodi" dot={{ fill: "#10B981", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top 5 Income Categories */}
      {incomeCategories.length > 0 && (
        <div
          className="rounded-3xl p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] mb-6"
          style={{
            background: "linear-gradient(145deg, #1E1B2A, #171421)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h3 className="text-xl font-semibold mb-6" style={{ color: "#FFFFFF", fontFamily: '"Inter", sans-serif' }}>
            Top 5 kategorija prihoda
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomeCategories.slice(0, 5).map((category) => {
              const IconComponent = getIcon(category.icon);
              const percentage = stats.totalIncomes > 0 ? (category.total / stats.totalIncomes) * 100 : 0;
              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <IconComponent size={20} weight="duotone" style={{ color: category.color }} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "#FFFFFF", fontFamily: '"Inter", sans-serif' }}>
                          {category.name}
                        </p>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)", fontFamily: '"Inter", sans-serif' }}>
                          {percentage.toFixed(1)}% prihoda
                        </p>
                      </div>
                    </div>
                    <p className="font-bold" style={{ color: "#1FBFA4", fontFamily: '"Inter", sans-serif' }}>
                      {category.total.toLocaleString("sr-RS")}
                    </p>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${category.color}80, ${category.color})`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories */}
        {expenseCategories.length > 0 && (
          <div
            className="rounded-3xl p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)]"
            style={{
              background: "linear-gradient(145deg, #1E1B2A, #171421)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h3 className="text-xl font-semibold mb-6" style={{ color: "#FFFFFF", fontFamily: '"Inter", sans-serif' }}>
              Raspodela troškova
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseCategories as any}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {expenseCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1b23",
                    border: "1px solid #444",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                  }}
                  formatter={(value: any, name: string, props: any) => {
                    return [`${Number(value).toLocaleString('sr-RS')} RSD`, props.payload.name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Income Categories */}
        {incomeCategories.length > 0 && (
          <div
            className="rounded-3xl p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)]"
            style={{
              background: "linear-gradient(145deg, #1E1B2A, #171421)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h3 className="text-xl font-semibold mb-6" style={{ color: "#FFFFFF", fontFamily: '"Inter", sans-serif' }}>
              Raspodela prihoda
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeCategories as any}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {incomeCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1b23",
                    border: "1px solid #444",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                  }}
                  formatter={(value: any, name: string, props: any) => {
                    return [`${Number(value).toLocaleString('sr-RS')} RSD`, props.payload.name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
