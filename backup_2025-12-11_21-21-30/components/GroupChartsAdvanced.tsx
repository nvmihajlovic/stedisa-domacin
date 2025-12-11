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
                      <TrendUp size={16} weight="bold" style={{color: "#C339B5"}} />
                      <span className="text-xs font-medium" style={{color: "#C339B5"}}>
                        +{Math.abs(yoyData.percentageChange).toFixed(1)}%
                      </span>
                    </>
                  ) : yoyData.percentageChange < 0 ? (
                    <>
                      <TrendDown size={16} weight="bold" style={{color: "#1FBFA4"}} />
                      <span className="text-xs font-medium" style={{color: "#1FBFA4"}}>
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
                        className="text-xs font-semibold"
                        style={{
                          color: momData.expensesChange > 0 ? "#C339B5" : momData.expensesChange < 0 ? "#1FBFA4" : "#9CA3AF"
                        }}
                      >
                        {momData.expensesChange > 0 ? "+" : ""}
                        {momData.expensesChange.toFixed(1)}%
                      </span>
                      {momData.expensesChange > 0 ? (
                        <TrendUp size={14} weight="bold" style={{color: "#C339B5"}} />
                      ) : momData.expensesChange < 0 ? (
                        <TrendDown size={14} weight="bold" style={{color: "#1FBFA4"}} />
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
                        className="text-xs font-semibold"
                        style={{
                          color: momData.incomesChange > 0 ? "#1FBFA4" : momData.incomesChange < 0 ? "#C339B5" : "#9CA3AF"
                        }}
                      >
                        {momData.incomesChange > 0 ? "+" : ""}
                        {momData.incomesChange.toFixed(1)}%
                      </span>
                      {momData.incomesChange > 0 ? (
                        <TrendUp size={14} weight="bold" style={{color: "#1FBFA4"}} />
                      ) : momData.incomesChange < 0 ? (
                        <TrendDown size={14} weight="bold" style={{color: "#C339B5"}} />
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
            <ChartLine size={24} style={{color: "#4EC8E4"}} />
            Bilans kroz vreme (12 meseci)
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyTrend}>
              <defs>
                <linearGradient id="expensesGradientGroup" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C339B5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#C339B5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="incomesGradientGroup" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1FBFA4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1FBFA4" stopOpacity={0}/>
                </linearGradient>
                <filter id="shadowExpensesGroup">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#C339B5" floodOpacity="0.3"/>
                </filter>
                <filter id="shadowIncomesGroup">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1FBFA4" floodOpacity="0.3"/>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="rgba(165,164,182,0.6)" 
                tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 12}}
                axisLine={{stroke: 'rgba(255,255,255,0.1)'}}
              />
              <YAxis 
                stroke="rgba(165,164,182,0.6)" 
                tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 12}}
                axisLine={{stroke: 'rgba(255,255,255,0.1)'}}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(26, 24, 37, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                }}
                labelStyle={{color: '#FFFFFF', fontWeight: 600, marginBottom: '8px'}}
                itemStyle={{color: '#FFFFFF', padding: '4px 0'}}
              />
              <Legend 
                wrapperStyle={{fontSize: '13px', fontFamily: '"Inter", sans-serif', paddingTop: '20px'}}
                iconType="circle"
                formatter={(value) => <span style={{color: '#FFFFFF', fontSize: '13px', fontWeight: 500}}>{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#C339B5"
                strokeWidth={3}
                name="Troškovi"
                dot={{fill: '#C339B5', strokeWidth: 2, r: 4, stroke: '#1A1825'}}
                activeDot={{r: 6, fill: '#C339B5', stroke: '#FFFFFF', strokeWidth: 2}}
                filter="url(#shadowExpensesGroup)"
              />
              <Line
                type="monotone"
                dataKey="incomes"
                stroke="#1FBFA4"
                strokeWidth={3}
                name="Prihodi"
                dot={{fill: '#1FBFA4', strokeWidth: 2, r: 4, stroke: '#1A1825'}}
                activeDot={{r: 6, fill: '#1FBFA4', stroke: '#FFFFFF', strokeWidth: 2}}
                filter="url(#shadowIncomesGroup)"
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
              <ChartPie size={24} style={{color: "#C339B5"}} />
              Troškovi po kategorijama
            </h2>
            <div className="flex items-center gap-6">
              <div style={{ width: "200px", height: "200px", flexShrink: 0 }}>
                <svg viewBox="0 0 100 100" style={{width: '100%', height: '100%'}}>
                  <defs>
                    <linearGradient id="expenseGradient1Group" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF6B9D" />
                      <stop offset="100%" stopColor="#C339B5" />
                    </linearGradient>
                    <linearGradient id="expenseGradient2Group" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFB3E6" />
                      <stop offset="100%" stopColor="#FF68C2" />
                    </linearGradient>
                    <linearGradient id="expenseGradient3Group" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#B794FF" />
                      <stop offset="100%" stopColor="#8A63D2" />
                    </linearGradient>
                    <linearGradient id="expenseGradient4Group" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#E488A0" />
                      <stop offset="100%" stopColor="#D16B8C" />
                    </linearGradient>
                    <linearGradient id="expenseGradient5Group" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFA0D2" />
                      <stop offset="100%" stopColor="#FF79BF" />
                    </linearGradient>
                    <linearGradient id="expenseGradient6Group" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#C77DFF" />
                      <stop offset="100%" stopColor="#9D4EDD" />
                    </linearGradient>
                    <radialGradient id="depthShadowExpGroup" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                      <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
                    </radialGradient>
                    <radialGradient id="segmentShineExpGroup" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>
                    <filter id="innerShadowExpGroup">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
                      <feOffset dx="0" dy="1" result="offsetblur" />
                      <feComponentTransfer><feFuncA type="linear" slope="0.3" /></feComponentTransfer>
                      <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  <g>
                    {(() => {
                      const categories = expensePieData;
                      const total = categories.reduce((sum, cat) => sum + cat.value, 0);
                      
                      if (categories.length === 1) {
                        return (
                          <g>
                            <circle cx="51.5" cy="51.5" r="45" fill="rgba(0,0,0,0.25)" opacity="0.6" />
                            <circle cx="50" cy="50" r="45" fill="url(#expenseGradient1Group)" style={{filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.5))'}} />
                            <circle cx="50" cy="50" r="45" fill="rgba(0,0,0,0.15)" style={{filter: 'url(#innerShadowExpGroup)'}} />
                            <circle cx="50" cy="50" r="45" fill="url(#segmentShineExpGroup)" opacity="0.18" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />
                          </g>
                        );
                      }
                      
                      let currentAngle = 0;
                      return categories.map((cat, idx) => {
                        const percentage = (cat.value / total) * 100;
                        const angle = (percentage / 100) * 360;
                        const startAngle = currentAngle;
                        currentAngle += angle;
                        
                        const startRad = (startAngle * Math.PI) / 180;
                        const endRad = (currentAngle * Math.PI) / 180;
                        const x1 = 50 + 45 * Math.cos(startRad);
                        const y1 = 50 + 45 * Math.sin(startRad);
                        const x2 = 50 + 45 * Math.cos(endRad);
                        const y2 = 50 + 45 * Math.sin(endRad);
                        const largeArc = angle > 180 ? 1 : 0;
                        const shadowIntensity = 0.4 - (idx * 0.08);
                        const offsetX = idx * 0.15;
                        const offsetY = idx * 0.15;
                        const depthOffset = 1.5;
                        
                        return (
                          <g key={idx} transform={`translate(${offsetX}, ${offsetY})`}>
                            <path d={`M ${50 + depthOffset} ${50 + depthOffset} L ${x1 + depthOffset} ${y1 + depthOffset} A 45 45 0 ${largeArc} 1 ${x2 + depthOffset} ${y2 + depthOffset} Z`} fill="rgba(0,0,0,0.25)" opacity="0.6" />
                            <path d={`M ${x1} ${y1} L ${x1 + depthOffset} ${y1 + depthOffset} A 45 45 0 ${largeArc} 1 ${x2 + depthOffset} ${y2 + depthOffset} L ${x2} ${y2} A 45 45 0 ${largeArc ? 0 : 1} 0 ${x1} ${y1} Z`} fill="url(#depthShadowExpGroup)" opacity="0.5" />
                            <path d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`} fill={cat.color} className="hover:opacity-95 transition-all" style={{filter: `drop-shadow(0 ${2 + idx * 0.5}px ${5 + idx * 1.5}px rgba(0,0,0,${shadowIntensity + 0.15}))`, transform: `translateZ(${idx * 2}px)`}} />
                            <path d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`} fill="rgba(0,0,0,0.15)" style={{filter: 'url(#innerShadowExpGroup)'}} />
                            <path d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`} fill="url(#segmentShineExpGroup)" opacity={0.18 + (idx * 0.02)} />
                            <path d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`} fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />
                            <path d={`A 45 45 0 ${largeArc} 1 ${x2} ${y2}`} fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" strokeLinecap="round" transform={`translate(${x1}, ${y1})`} opacity="0.4" />
                          </g>
                        );
                      });
                    })()}
                  </g>
                  <circle cx="50" cy="50" r="20" fill="#10111A" stroke="rgba(255, 179, 230, 0.35)" strokeWidth="1.5" />
                  <text x="50" y="48" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold" style={{textShadow: '0 0 6px rgba(255, 255, 255, 0.12)'}}>
                    {expensePieData.length}
                  </text>
                  <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize="8" opacity="0.9" style={{textShadow: '0 0 6px rgba(255, 255, 255, 0.12)'}}>
                    kat.
                  </text>
                </svg>
              </div>
              <div className="flex-1 space-y-1.5 overflow-hidden flex flex-col justify-center">
                {expensePieData.slice(0, 4).map((cat, idx) => {
                  const Icon = getIcon(cat.name);
                  const total = expensePieData.reduce((sum, c) => sum + c.value, 0);
                  const percentage = ((cat.value / total) * 100).toFixed(1);
                  return (
                    <div key={idx} className="flex items-center gap-2.5 group">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background: cat.color}}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold truncate" style={{color: '#FFD9EF'}}>{cat.name}</div>
                      </div>
                      <div className="text-[9px] font-bold" style={{color: cat.color}}>{percentage}%</div>
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
              <ChartPie size={24} style={{color: "#1FBFA4"}} />
              Prihodi po kategorijama
            </h2>
            <div className="flex items-center gap-6">
              <div style={{ width: "200px", height: "200px", flexShrink: 0 }}>
                <svg viewBox="0 0 100 100" style={{width: '100%', height: '100%'}}>
                  <defs>
                    <linearGradient id="incomeGradient1Group" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4DD0E1" />
                      <stop offset="100%" stopColor="#1FBFA4" />
                    </linearGradient>
                    <linearGradient id="incomeGradient2Group" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#81C784" />
                      <stop offset="100%" stopColor="#66BB6A" />
                    </linearGradient>
                    <linearGradient id="incomeGradient3Group" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4DB6AC" />
                      <stop offset="100%" stopColor="#26A69A" />
                    </linearGradient>
                    <linearGradient id="incomeGradient4Group" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#AED581" />
                      <stop offset="100%" stopColor="#9CCC65" />
                    </linearGradient>
                    <linearGradient id="incomeGradient5Group" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4FC3F7" />
                      <stop offset="100%" stopColor="#29B6F6" />
                    </linearGradient>
                    <linearGradient id="incomeGradient6Group" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#64DD17" />
                      <stop offset="100%" stopColor="#76FF03" />
                    </linearGradient>
                    <radialGradient id="depthShadowIncGroup" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                      <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
                    </radialGradient>
                    <radialGradient id="segmentShineIncGroup" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>
                    <filter id="innerShadowIncGroup">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
                      <feOffset dx="0" dy="1" result="offsetblur" />
                      <feComponentTransfer><feFuncA type="linear" slope="0.3" /></feComponentTransfer>
                      <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  <g>
                    {(() => {
                      const categories = incomePieData;
                      const total = categories.reduce((sum, cat) => sum + cat.value, 0);
                      
                      if (categories.length === 1) {
                        return (
                          <g>
                            <circle cx="51.5" cy="51.5" r="45" fill="rgba(0,0,0,0.25)" opacity="0.6" />
                            <circle cx="50" cy="50" r="45" fill="url(#incomeGradient1Group)" style={{filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.5))'}} />
                            <circle cx="50" cy="50" r="45" fill="rgba(0,0,0,0.15)" style={{filter: 'url(#innerShadowIncGroup)'}} />
                            <circle cx="50" cy="50" r="45" fill="url(#segmentShineIncGroup)" opacity="0.18" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />
                          </g>
                        );
                      }
                      
                      let currentAngle = 0;
                      return categories.map((cat, idx) => {
                        const percentage = (cat.value / total) * 100;
                        const angle = (percentage / 100) * 360;
                        const startAngle = currentAngle;
                        currentAngle += angle;
                        
                        const startRad = (startAngle * Math.PI) / 180;
                        const endRad = (currentAngle * Math.PI) / 180;
                        const x1 = 50 + 45 * Math.cos(startRad);
                        const y1 = 50 + 45 * Math.sin(startRad);
                        const x2 = 50 + 45 * Math.cos(endRad);
                        const y2 = 50 + 45 * Math.sin(endRad);
                        const largeArc = angle > 180 ? 1 : 0;
                        const shadowIntensity = 0.4 - (idx * 0.08);
                        const offsetX = idx * 0.15;
                        const offsetY = idx * 0.15;
                        const depthOffset = 1.5;
                        
                        return (
                          <g key={idx} transform={`translate(${offsetX}, ${offsetY})`}>
                            <path d={`M ${50 + depthOffset} ${50 + depthOffset} L ${x1 + depthOffset} ${y1 + depthOffset} A 45 45 0 ${largeArc} 1 ${x2 + depthOffset} ${y2 + depthOffset} Z`} fill="rgba(0,0,0,0.25)" opacity="0.6" />
                            <path d={`M ${x1} ${y1} L ${x1 + depthOffset} ${y1 + depthOffset} A 45 45 0 ${largeArc} 1 ${x2 + depthOffset} ${y2 + depthOffset} L ${x2} ${y2} A 45 45 0 ${largeArc ? 0 : 1} 0 ${x1} ${y1} Z`} fill="url(#depthShadowIncGroup)" opacity="0.5" />
                            <path d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`} fill={cat.color} className="hover:opacity-95 transition-all" style={{filter: `drop-shadow(0 ${2 + idx * 0.5}px ${5 + idx * 1.5}px rgba(0,0,0,${shadowIntensity + 0.15}))`, transform: `translateZ(${idx * 2}px)`}} />
                            <path d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`} fill="rgba(0,0,0,0.15)" style={{filter: 'url(#innerShadowIncGroup)'}} />
                            <path d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`} fill="url(#segmentShineIncGroup)" opacity={0.18 + (idx * 0.02)} />
                            <path d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`} fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />
                            <path d={`A 45 45 0 ${largeArc} 1 ${x2} ${y2}`} fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" strokeLinecap="round" transform={`translate(${x1}, ${y1})`} opacity="0.4" />
                          </g>
                        );
                      });
                    })()}
                  </g>
                  <circle cx="50" cy="50" r="20" fill="#10111A" stroke="rgba(100, 243, 194, 0.35)" strokeWidth="1.5" />
                  <text x="50" y="48" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold" style={{textShadow: '0 0 6px rgba(255, 255, 255, 0.12)'}}>
                    {incomePieData.length}
                  </text>
                  <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize="8" opacity="0.9" style={{textShadow: '0 0 6px rgba(255, 255, 255, 0.12)'}}>
                    kat.
                  </text>
                </svg>
              </div>
              <div className="flex-1 space-y-1.5 overflow-hidden flex flex-col justify-center">
                {incomePieData.slice(0, 4).map((cat, idx) => {
                  const Icon = getIcon(cat.name);
                  const total = incomePieData.reduce((sum, c) => sum + c.value, 0);
                  const percentage = ((cat.value / total) * 100).toFixed(1);
                  return (
                    <div key={idx} className="flex items-center gap-2.5 group">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background: cat.color}}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold truncate" style={{color: '#D3FFF2'}}>{cat.name}</div>
                      </div>
                      <div className="text-[9px] font-bold" style={{color: cat.color}}>{percentage}%</div>
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
              <ChartBar size={24} style={{color: "#8A63D2"}} />
              Troškovi po danima
            </h2>
            <ResponsiveContainer width="100%" height={375}>
              <BarChart data={dailyExpenses}>
                <defs>
                  <linearGradient id="barGradientExpGroup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFB3E6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#B794FF" stopOpacity={0.8}/>
                  </linearGradient>
                  <filter id="barShadowGroup">
                    <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#FFB3E6" floodOpacity="0.4"/>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="rgba(165,164,182,0.6)" 
                  tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 11}}
                  axisLine={{stroke: 'rgba(255,255,255,0.1)'}}
                />
                <YAxis 
                  stroke="rgba(165,164,182,0.6)" 
                  tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 11}}
                  axisLine={{stroke: 'rgba(255,255,255,0.1)'}}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(26, 24, 37, 0.95)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '12px', 
                    color: '#FFFFFF',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                  }}
                  cursor={{fill: 'rgba(255, 179, 230, 0.1)'}}
                  formatter={(value: any) => [`${Number(value).toLocaleString('sr-RS')} RSD`, 'Iznos']}
                />
                <Bar 
                  dataKey="amount" 
                  fill="url(#barGradientExpGroup)" 
                  name="Iznos"
                  radius={[8, 8, 0, 0]}
                  filter="url(#barShadowGroup)"
                />
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
              <defs>
                <linearGradient id="memberExpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFB3E6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#C339B5" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="memberIncGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6FFFC4" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#1FBFA4" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="rgba(165,164,182,0.6)" 
                tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 11}}
                axisLine={{stroke: 'rgba(255,255,255,0.1)'}}
              />
              <YAxis 
                stroke="rgba(165,164,182,0.6)" 
                tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 11}}
                axisLine={{stroke: 'rgba(255,255,255,0.1)'}}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(26, 24, 37, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                }}
              />
              <Legend 
                wrapperStyle={{fontSize: '13px', fontFamily: '"Inter", sans-serif'}}
                iconType="circle"
              />
              <Bar dataKey="expenses" fill="url(#memberExpGradient)" name="Troškovi" radius={[6, 6, 0, 0]} />
              <Bar dataKey="incomes" fill="url(#memberIncGradient)" name="Prihodi" radius={[6, 6, 0, 0]} />
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
                  <defs>
                    <linearGradient id="hourlyBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B794FF" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#8A63D2" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="hour" 
                    stroke="rgba(165,164,182,0.6)" 
                    tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}}
                    axisLine={{stroke: 'rgba(255,255,255,0.1)'}}
                  />
                  <YAxis 
                    stroke="rgba(165,164,182,0.6)" 
                    tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}}
                    axisLine={{stroke: 'rgba(255,255,255,0.1)'}}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(26, 24, 37, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                    }}
                  />
                  <Bar dataKey="amount" fill="url(#hourlyBarGradient)" name="Iznos" radius={[6, 6, 0, 0]} />
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
                  <defs>
                    <linearGradient id="last30ExpGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#FFB3E6" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#B794FF" stopOpacity={1}/>
                    </linearGradient>
                    <linearGradient id="last30IncGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6FFFC4" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#4DD0E1" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(165,164,182,0.6)" 
                    tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 9}}
                    axisLine={{stroke: 'rgba(255,255,255,0.1)'}}
                  />
                  <YAxis 
                    stroke="rgba(165,164,182,0.6)" 
                    tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}}
                    axisLine={{stroke: 'rgba(255,255,255,0.1)'}}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(26, 24, 37, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{fontSize: '12px', fontFamily: '"Inter", sans-serif'}}
                    iconType="circle"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="url(#last30ExpGradient)"
                    strokeWidth={2.5}
                    name="Troškovi"
                    dot={false}
                    style={{filter: 'drop-shadow(0 2px 4px rgba(255, 179, 230, 0.3))'}}
                  />
                  <Line
                    type="monotone"
                    dataKey="incomes"
                    stroke="url(#last30IncGradient)"
                    strokeWidth={2.5}
                    name="Prihodi"
                    dot={false}
                    style={{filter: 'drop-shadow(0 2px 4px rgba(111, 255, 196, 0.3))'}}
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
                  <defs>
                    <linearGradient id="growthBarGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4EC8E4" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#7FDFFF" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis 
                    type="number" 
                    stroke="rgba(165,164,182,0.6)" 
                    tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}}
                    axisLine={{stroke: 'rgba(255,255,255,0.1)'}}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="rgba(165,164,182,0.6)"
                    tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}}
                    axisLine={{stroke: 'rgba(255,255,255,0.1)'}}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(26, 24, 37, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                    }}
                  />
                  <Bar dataKey="growth" fill="url(#growthBarGradient)" name="Rast %" radius={[0, 6, 6, 0]} />
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
                    style={{ color: monthsInProfit >= 6 ? "#1FBFA4" : "#C339B5" }}
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

      {/* Monthly Breakdown Table */}
      {monthlyTrend.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-6 border border-white/10"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Wallet size={24} className="text-purple-400" />
            Mesečni pregled
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/70">Mesec</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-white/70">Troškovi</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-white/70">Prihodi</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-white/70">Bilans</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-white/70">Status</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTrend.slice().reverse().map((month, idx) => {
                  const balance = month.incomes - month.expenses;
                  const isPositive = balance >= 0;
                  return (
                    <motion.tr
                      key={month.month}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + idx * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-white">{month.month}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-semibold text-red-400">
                          -{month.expenses.toLocaleString("sr-RS")} RSD
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-semibold text-green-400">
                          +{month.incomes.toLocaleString("sr-RS")} RSD
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}{balance.toLocaleString("sr-RS")} RSD
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPositive ? (
                            <>
                              <span className="text-xs font-medium text-green-400">Profit</span>
                              <div className="w-2 h-2 rounded-full bg-green-400" />
                            </>
                          ) : (
                            <>
                              <span className="text-xs font-medium text-red-400">Deficit</span>
                              <div className="w-2 h-2 rounded-full bg-red-400" />
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-white/50">Ukupni troškovi</span>
              <span className="text-xl font-bold" style={{color: "#C339B5"}}>
                {monthlyTrend.reduce((sum, m) => sum + m.expenses, 0).toLocaleString("sr-RS")} RSD
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-white/50">Ukupni prihodi</span>
              <span className="text-xl font-bold" style={{color: "#1FBFA4"}}>
                {monthlyTrend.reduce((sum, m) => sum + m.incomes, 0).toLocaleString("sr-RS")} RSD
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-white/50">Ukupan bilans</span>
              <span className="text-xl font-bold" style={{
                color: monthlyTrend.reduce((sum, m) => sum + (m.incomes - m.expenses), 0) >= 0 ? "#1FBFA4" : "#C339B5"
              }}>
                {monthlyTrend.reduce((sum, m) => sum + (m.incomes - m.expenses), 0).toLocaleString("sr-RS")} RSD
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
