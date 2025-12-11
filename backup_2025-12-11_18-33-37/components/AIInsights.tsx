"use client";

import { useEffect, useState } from "react";
import {
  Sparkle,
  TrendUp,
  TrendDown,
  Warning,
  WarningCircle,
  CheckCircle,
  Coin,
  Target,
  Trophy,
  Question,
  MagnifyingGlass,
  ChartBar,
  Repeat,
  Calendar,
  ArrowsLeftRight,
  X,
  Brain,
  Lightning,
  Star,
} from "phosphor-react";

interface FinancialInsight {
  id: string;
  type: "success" | "warning" | "info" | "tip";
  title: string;
  message: string;
  icon: string;
  action?: {
    label: string;
    href?: string;
  };
  priority: number;
}

const iconMap: Record<string, any> = {
  Sparkle,
  TrendUp,
  TrendDown,
  Warning,
  WarningCircle,
  CheckCircle,
  Coin,
  Target,
  Trophy,
  Question,
  MagnifyingGlass,
  ChartBar,
  Repeat,
};

interface QuickQuestion {
  id: string;
  question: string;
  icon: any;
  color: string;
  minDataRequired?: 'expenses' | 'income' | 'both' | 'categories' | 'none';
}

const quickQuestions: QuickQuestion[] = [
  { id: "monthly-spending", question: "Koliko trošim ovaj mesec?", icon: Coin, color: "#60A5FA", minDataRequired: 'expenses' },
  { id: "top-category", question: "Gde najviše trošim?", icon: ChartBar, color: "#F59E0B", minDataRequired: 'categories' },
  { id: "savings-potential", question: "Koliko mogu da uštedim?", icon: Target, color: "#10B981", minDataRequired: 'expenses' },
  { id: "budget-status", question: "Status mojih budžeta?", icon: WarningCircle, color: "#EF4444", minDataRequired: 'none' },
  { id: "monthly-trends", question: "Kakav je trend troškova?", icon: TrendUp, color: "#8B5CF6", minDataRequired: 'expenses' },
  { id: "savings-progress", question: "Napredak ciljeva štednje?", icon: Trophy, color: "#EC4899", minDataRequired: 'none' },
  { id: "weekly-spending", question: "Koliko sam potrošio ove nedelje?", icon: Calendar, color: "#3B82F6", minDataRequired: 'expenses' },
  { id: "biggest-expenses", question: "Šta su moji najveći troškovi?", icon: MagnifyingGlass, color: "#F97316", minDataRequired: 'categories' },
  { id: "income-vs-expenses", question: "Koliko zarađujem vs. trošim?", icon: ArrowsLeftRight, color: "#14B8A6", minDataRequired: 'both' },
  { id: "recurring-expenses", question: "Da li imam ponavljajuće troškove?", icon: Repeat, color: "#A855F7", minDataRequired: 'categories' },
];

interface AIInsightsProps {
  isOpen: boolean;
  onClose: () => void;
  autoShowOnLogin?: boolean;
}

export default function AIInsightsPopup({ isOpen, onClose, autoShowOnLogin = false }: AIInsightsProps) {
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [disableAutoClose, setDisableAutoClose] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<{ question: string; answer: string } | null>(null);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [financialData, setFinancialData] = useState<{
    hasExpenses: boolean;
    hasIncome: boolean;
    hasCategories: boolean;
  }>({ hasExpenses: false, hasIncome: false, hasCategories: false });

  useEffect(() => {
    if (isOpen) {
      fetchInsights();
      setShowAll(false); // Reset when popup opens
      setDisableAutoClose(false); // Reset auto-close
    }
  }, [isOpen]);

  // Auto-close after 10 seconds if opened on login and user hasn't interacted
  useEffect(() => {
    if (isOpen && autoShowOnLogin && !disableAutoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoShowOnLogin, disableAutoClose, onClose]);

  const fetchInsights = async () => {
    try {
      const response = await fetch("/api/financial-insights");
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
        
        // Fetch financial data to determine which questions to show
        const [expensesRes, incomesRes] = await Promise.all([
          fetch("/api/expenses"),
          fetch("/api/incomes")
        ]);
        
        if (expensesRes.ok && incomesRes.ok) {
          const expenses = await expensesRes.json();
          const incomes = await incomesRes.json();
          
          setFinancialData({
            hasExpenses: expenses.expenses && expenses.expenses.length > 0,
            hasIncome: incomes.incomes && incomes.incomes.length > 0,
            hasCategories: expenses.expenses && expenses.expenses.length > 0
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = async (questionId: string, questionText: string) => {
    setLoadingAnswer(true);
    setSelectedAnswer(null);
    
    try {
      const response = await fetch("/api/financial-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionText, questionId: questionId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedAnswer({ question: questionText, answer: data.answer });
      }
    } catch (error) {
      console.error("Failed to get answer:", error);
      setSelectedAnswer({ 
        question: questionText, 
        answer: "😔 Ups! Nešto je pošlo po zlu. Pokušaj ponovo." 
      });
    } finally {
      setLoadingAnswer(false);
    }
  };

  // Filter questions based on available data
  const getVisibleQuestions = () => {
    const { hasExpenses, hasIncome, hasCategories } = financialData;

    return quickQuestions.filter(q => {
      if (!q.minDataRequired || q.minDataRequired === 'none') return true;
      if (q.minDataRequired === 'expenses') return hasExpenses;
      if (q.minDataRequired === 'income') return hasIncome;
      if (q.minDataRequired === 'both') return hasExpenses && hasIncome;
      if (q.minDataRequired === 'categories') return hasCategories;
      return true;
    });
  };

  const visibleQuestions = getVisibleQuestions();

  if (!isOpen) return null;

  // Get insights to display
  const displayedInsights = showAll ? insights : insights.slice(0, 1);
  const remainingCount = insights.length - displayedInsights.length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        style={{ animation: "fadeIn 0.3s ease-out" }}
        onClick={onClose}
      />

      {/* Popup */}
      <div
        className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-lg max-h-[85vh] rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          transform: "translate(-50%, -50%)",
          background: "linear-gradient(145deg, rgba(30, 27, 42, 0.98), rgba(23, 20, 33, 0.98))",
          border: "2px solid rgba(168, 85, 247, 0.3)",
          boxShadow: "0 0 100px rgba(168, 85, 247, 0.5), 0 20px 60px rgba(0, 0, 0, 0.6)",
          animation: "popupFadeIn 0.3s ease-out",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:scale-110 transition-all duration-200 z-10"
          style={{
            background: "rgba(168, 85, 247, 0.15)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            color: "#A855F7",
          }}
        >
          <X size={20} weight="bold" />
        </button>

        {/* Animated gradient background */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 30% 20%, rgba(168, 85, 247, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)",
            animation: "gradientShift 8s ease-in-out infinite"
          }}
        />

        <div className="relative p-8 overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(168, 85, 247, 0.5) transparent' }}>
          {/* AI Icon Header */}
          <div className="flex flex-col items-center mb-5">
            <div 
              className="relative mb-3"
              style={{
                animation: "float 3s ease-in-out infinite"
              }}
            >
              {/* Glow effect */}
              <div 
                className="absolute inset-0 rounded-full blur-2xl"
                style={{
                  background: "radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, transparent 70%)",
                  animation: "pulse 2s ease-in-out infinite"
                }}
              />
              
              {/* Main icon container */}
              <div
                className="relative p-4 rounded-full"
                style={{
                  background: "linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)",
                  border: "2px solid rgba(168, 85, 247, 0.5)",
                  boxShadow: "0 0 40px rgba(168, 85, 247, 0.4), inset 0 0 20px rgba(168, 85, 247, 0.2)"
                }}
              >
                <Brain size={48} weight="duotone" style={{ color: "#A855F7" }} />
                
                {/* Sparkle decorations */}
                <div className="absolute -top-1 -right-1">
                  <Sparkle size={20} weight="fill" style={{ color: "#F0ABFC", animation: "sparkle 2s ease-in-out infinite" }} />
                </div>
                <div className="absolute -bottom-1 -left-1">
                  <Lightning size={16} weight="fill" style={{ color: "#C084FC", animation: "sparkle 2s ease-in-out infinite 0.5s" }} />
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-1 text-center" style={{ color: "#FFFFFF" }}>
              AI Finansijski Asistent
            </h2>
            <p className="text-xs text-center" style={{ color: "#A5A4B6" }}>
              Tvoj pametni vodič kroz finansije
            </p>
          </div>

          {loading ? (
            <div
              className="rounded-2xl p-8 backdrop-blur-xl animate-pulse text-center"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="h-4 bg-white/10 rounded w-3/4 mx-auto mb-3"></div>
              <div className="h-3 bg-white/10 rounded w-full mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-5/6 mx-auto"></div>
            </div>
          ) : insights.length === 0 ? (
            <div
              className="rounded-2xl p-10 backdrop-blur-xl text-center"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Star size={48} weight="duotone" style={{ color: "#9F70FF", margin: "0 auto 16px" }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: "#FFFFFF" }}>
                Spremam analize...
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#A5A4B6" }}>
                Nastavi da dodaješ troškove i prihode, a ja ću ti dati pametne savete i analizirati tvoje finansijske navike!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Insight Cards */}
              {displayedInsights.map((insight, index) => (
                <div
                  key={insight.id}
                  className="rounded-xl p-4 backdrop-blur-xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: insight.type === "success" 
                      ? "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)"
                      : insight.type === "warning"
                      ? "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)"
                      : insight.type === "info"
                      ? "linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)"
                      : "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)",
                    border: `1px solid ${
                      insight.type === "success" ? "rgba(16, 185, 129, 0.3)" :
                      insight.type === "warning" ? "rgba(239, 68, 68, 0.3)" :
                      insight.type === "info" ? "rgba(96, 165, 250, 0.3)" :
                      "rgba(168, 85, 247, 0.3)"
                    }`,
                    boxShadow: `0 0 30px ${
                      insight.type === "success" ? "rgba(16, 185, 129, 0.2)" :
                      insight.type === "warning" ? "rgba(239, 68, 68, 0.2)" :
                      insight.type === "info" ? "rgba(96, 165, 250, 0.2)" :
                      "rgba(168, 85, 247, 0.2)"
                    }`,
                    animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="p-2.5 rounded-xl flex-shrink-0"
                      style={{
                        background: insight.type === "success" ? "rgba(16, 185, 129, 0.2)" :
                                   insight.type === "warning" ? "rgba(239, 68, 68, 0.2)" :
                                   insight.type === "info" ? "rgba(96, 165, 250, 0.2)" :
                                   "rgba(168, 85, 247, 0.2)",
                        border: `1px solid ${
                          insight.type === "success" ? "rgba(16, 185, 129, 0.3)" :
                          insight.type === "warning" ? "rgba(239, 68, 68, 0.3)" :
                          insight.type === "info" ? "rgba(96, 165, 250, 0.3)" :
                          "rgba(168, 85, 247, 0.3)"
                        }`,
                      }}
                    >
                      {(() => {
                        const IconComponent = iconMap[insight.icon] || Sparkle;
                        return <IconComponent size={28} weight="duotone" style={{ 
                          color: insight.type === "success" ? "#10B981" :
                                 insight.type === "warning" ? "#EF4444" :
                                 insight.type === "info" ? "#60A5FA" :
                                 "#A855F7"
                        }} />;
                      })()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold mb-1.5" style={{ color: "#FFFFFF" }}>
                        {insight.title}
                      </h3>
                      <p className="text-xs leading-relaxed mb-2" style={{ color: "#E8E8E8" }}>
                        {insight.message}
                      </p>

                      {/* Action button */}
                      {insight.action && (
                        <a
                          href={insight.action.href || "#"}
                          onClick={onClose}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all hover:scale-105"
                          style={{
                            background: insight.type === "success" ? "rgba(16, 185, 129, 0.25)" :
                                       insight.type === "warning" ? "rgba(239, 68, 68, 0.25)" :
                                       insight.type === "info" ? "rgba(96, 165, 250, 0.25)" :
                                       "rgba(168, 85, 247, 0.25)",
                            border: `1px solid ${
                              insight.type === "success" ? "rgba(16, 185, 129, 0.4)" :
                              insight.type === "warning" ? "rgba(239, 68, 68, 0.4)" :
                              insight.type === "info" ? "rgba(96, 165, 250, 0.4)" :
                              "rgba(168, 85, 247, 0.4)"
                            }`,
                            color: insight.type === "success" ? "#10B981" :
                                   insight.type === "warning" ? "#EF4444" :
                                   insight.type === "info" ? "#60A5FA" :
                                   "#A855F7"
                          }}
                        >
                          {insight.action.label}
                          <TrendUp size={14} weight="bold" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Show More/Less button */}
              {insights.length > 1 && (
                <button
                  onClick={() => {
                    setShowAll(!showAll);
                    setDisableAutoClose(true); // Disable auto-close when user interacts
                  }}
                  className="w-full text-center py-2.5 px-4 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                  style={{
                    background: "rgba(168, 85, 247, 0.15)",
                    border: "1px solid rgba(168, 85, 247, 0.3)",
                    color: "#A855F7"
                  }}
                >
                  {showAll ? (
                    <span className="flex items-center justify-center gap-2 text-sm">
                      Prikaži manje
                      <TrendDown size={14} weight="bold" />
                    </span>
                  ) : (
                    <span className="text-sm">
                      Prikaži još {remainingCount} {remainingCount === 1 ? "savet" : remainingCount < 5 ? "saveta" : "saveta"}
                    </span>
                  )}
                </button>
              )}

              {/* Quick Questions Section */}
              <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <button
                  onClick={() => {
                    setShowQuickQuestions(!showQuickQuestions);
                    setSelectedAnswer(null);
                    setDisableAutoClose(true);
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-xl font-semibold transition-all hover:scale-[1.01]"
                  style={{
                    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.15))",
                    border: "1px solid rgba(168, 85, 247, 0.3)",
                    color: "#A855F7"
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Brain size={20} weight="duotone" />
                    Pitaj AI Asistenta
                    {visibleQuestions.length < quickQuestions.length && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full" style={{
                        background: "rgba(168, 85, 247, 0.2)",
                        border: "1px solid rgba(168, 85, 247, 0.4)",
                        color: "#C4B5FD"
                      }}>
                        {visibleQuestions.length}/{quickQuestions.length}
                      </span>
                    )}
                  </span>
                  <Lightning size={18} weight="bold" style={{ 
                    transform: showQuickQuestions ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s"
                  }} />
                </button>

                {showQuickQuestions && (
                  <div className="mt-4 space-y-3 animate-slideIn">
                    {visibleQuestions.length === 0 ? (
                      <div className="text-center py-8 px-4 rounded-xl" style={{
                        background: "rgba(28, 26, 46, 0.6)",
                        border: "2px solid rgba(168, 85, 247, 0.2)"
                      }}>
                        <Sparkle className="w-12 h-12 mx-auto mb-3" style={{ color: "#A855F7", opacity: 0.6 }} />
                        <p className="text-white/70 text-sm mb-2">📊 AI pitanja se otključavaju kako dodaješ podatke!</p>
                        <p className="text-white/50 text-xs">Dodaj prihode i troškove da vidiš personalizovane insajte 💡</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {visibleQuestions.map((q) => (
                        <button
                          key={q.id}
                          onClick={() => handleQuickQuestion(q.id, q.question)}
                          disabled={loadingAnswer}
                          className="flex items-center gap-3 p-3.5 rounded-xl font-medium transition-all duration-200 hover:scale-[1.03] text-left group cursor-pointer disabled:cursor-wait disabled:opacity-60 disabled:hover:scale-100"
                          style={{
                            background: loadingAnswer ? "rgba(28, 26, 46, 0.4)" : "rgba(28, 26, 46, 0.6)",
                            border: `2px solid ${loadingAnswer ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.1)"}`,
                            color: "#FFF",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                          }}
                          onMouseEnter={(e) => {
                            if (!loadingAnswer) {
                              e.currentTarget.style.background = `linear-gradient(135deg, rgba(28, 26, 46, 0.75) 0%, ${q.color}08 100%)`;
                              e.currentTarget.style.borderColor = `${q.color}30`;
                              e.currentTarget.style.boxShadow = `0 4px 16px ${q.color}20`;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!loadingAnswer) {
                              e.currentTarget.style.background = "rgba(28, 26, 46, 0.6)";
                              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
                            }
                          }}
                        >
                          <div className="group-hover:scale-110 transition-transform" style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: `${q.color}25`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            border: `1px solid ${q.color}40`
                          }}>
                            <q.icon size={20} weight="duotone" style={{ color: q.color }} />
                          </div>
                          <span className="text-sm flex-1 group-hover:translate-x-1 transition-transform">{q.question}</span>
                          <Lightning 
                            size={16} 
                            weight="fill" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity" 
                            style={{ color: q.color }} 
                          />
                        </button>
                      ))}
                    </div>
                    )}

                    {/* Answer Display */}
                    {loadingAnswer && (
                      <div className="p-4 rounded-xl" style={{
                        background: "rgba(28, 26, 46, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.1)"
                      }}>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#A855F7", animationDelay: "0ms" }} />
                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#A855F7", animationDelay: "150ms" }} />
                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#A855F7", animationDelay: "300ms" }} />
                          </div>
                          <span className="text-sm" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                            Analiziram podatke...
                          </span>
                        </div>
                      </div>
                    )}

                    {selectedAnswer && !loadingAnswer && (
                      <div className="p-4 rounded-xl space-y-3 animate-slideIn" style={{
                        background: "rgba(28, 26, 46, 0.8)",
                        border: "1px solid rgba(168, 85, 247, 0.3)"
                      }}>
                        <div className="flex items-start gap-2">
                          <Question size={16} weight="bold" style={{ color: "#A855F7", marginTop: "2px" }} />
                          <p className="text-sm font-medium" style={{ color: "#A855F7" }}>
                            {selectedAnswer.question}
                          </p>
                        </div>
                        <div className="pl-6 prose prose-invert prose-sm max-w-none" style={{
                          color: "#FFF",
                          fontSize: "13px",
                          lineHeight: "1.6"
                        }}>
                          {selectedAnswer.answer.split('\n').map((line, i) => {
                            // Bold text
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return <p key={i} className="font-semibold mb-2" style={{ color: "#FFD700" }}>{line.replace(/\*\*/g, '')}</p>;
                            }
                            // List items
                            if (line.startsWith('- ') || line.startsWith('• ')) {
                              return <p key={i} className="ml-4 mb-1">• {line.substring(2)}</p>;
                            }
                            // Regular text
                            if (line.trim()) {
                              return <p key={i} className="mb-2">{line}</p>;
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes popupFadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.5; transform: scale(0.8) rotate(180deg); }
        }

        @keyframes gradientShift {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
