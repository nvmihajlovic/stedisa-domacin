"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Question, X, Sparkle, MagnifyingGlass, Lightning, Rocket,
  Receipt, TrendUp, Users, Tag, ChartLine, Gear, BookOpen,
  Play, CheckCircle, Warning, Info, CaretRight, ArrowRight,
  PencilSimple, Funnel, FilePdf, Repeat, Lightbulb, CheckSquare, Plus,
  UsersThree, CurrencyCircleDollar, Crown, TagSimple, ChartLineUp,
  FolderOpen, Palette, ListChecks, ChartDonut, FileText, UserCircle,
  Bell, LockKey, ChartBar, TrendDown, ForkKnife, House, GameController,
  ShoppingCart, Heart, Book, DotsThree, Briefcase, Code, Gift, ArrowsClockwise
} from "@phosphor-icons/react";
import { helpContent, HelpCard as ImportedHelpCard } from "../lib/helpContent";

interface HelpCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  gradient: string;
  category: string;
  content: {
    main: string;
    steps?: { title: string; desc: string }[];
    tips?: string[];
    warnings?: string[];
  };
}

interface ModernHelpModalProps {
  page: "dashboard" | "expenses" | "incomes" | "groups" | "categories" | "statistics" | "profile" | "budgets";
  isOpen: boolean;
  onClose: () => void;
}

// Icon mapping - mapiramo string ime ikone iz helpContent na React komponentu
const iconMap: Record<string, any> = {
  "Rocket": Rocket,
  "Sparkle": Sparkle,
  "Lightning": Lightning,
  "Receipt": Receipt,
  "TrendUp": TrendUp,
  "Users": Users,
  "Tag": Tag,
  "ChartLine": ChartLine,
  "Gear": Gear,
  "UsersThree": UsersThree,
  "CurrencyCircleDollar": CurrencyCircleDollar,
  "Crown": Crown,
  "TagSimple": TagSimple,
  "ChartLineUp": ChartLineUp,
  "PencilSimple": PencilSimple,
  "Funnel": Funnel,
  "FilePdf": FilePdf,
  "Repeat": Repeat,
  "FolderOpen": FolderOpen,
  "Palette": Palette,
  "ListChecks": ListChecks,
  "ChartDonut": ChartDonut,
  "FileText": FileText,
  "UserCircle": UserCircle,
  "Bell": Bell,
  "LockKey": LockKey,
  "ChartBar": ChartBar,
  "Plus": Plus,
  "TrendDown": TrendDown,
  "ForkKnife": ForkKnife,
  "House": House,
  "GameController": GameController,
  "ShoppingCart": ShoppingCart,
  "Heart": Heart,
  "Book": Book,
  "DotsThree": DotsThree,
  "Briefcase": Briefcase,
  "Code": Code,
  "Gift": Gift,
  "ArrowsClockwise": ArrowsClockwise,
  "CheckSquare": CheckSquare,
  "Lightbulb": Lightbulb,
  "Warning": Warning,
  "CheckCircle": CheckCircle,
  "Info": Info,
  "BookOpen": BookOpen,
  "Question": Question,
  "Play": Play
};


// Transformišemo importovani helpContent da koristi React komponente za ikone
const helpCards: Record<string, HelpCard[]> = Object.entries(helpContent).reduce((acc, [page, cards]) => {
  acc[page] = (cards as ImportedHelpCard[]).map(card => ({
    ...card,
    icon: iconMap[card.icon] || Question // fallback na Question ako ikona ne postoji
  }));
  return acc;
}, {} as Record<string, HelpCard[]>);


export default function ModernHelpModal({ page, isOpen, onClose }: ModernHelpModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Sve");

  // Combine all cards from all pages
  const allCards = useMemo(() => {
    const combined: HelpCard[] = [];
    Object.values(helpCards).forEach(cards => combined.push(...cards));
    return combined;
  }, []);

  // Get page-specific category name for highlighting
  const pageCategory = useMemo(() => {
    const pageCategoryMap: Record<string, string> = {
      dashboard: "Dashboard",
      expenses: "Troškovi",
      incomes: "Prihodi",
      groups: "Grupe",
      categories: "Kategorije",
      statistics: "Statistika",
      profile: "Profil",
      budgets: "Budžeti"
    };
    return pageCategoryMap[page] || "Dashboard";
  }, [page]);

  // Set active category to current page when modal opens
  useMemo(() => {
    if (isOpen && !searchQuery) {
      setActiveCategory(pageCategory);
    }
  }, [isOpen, pageCategory, searchQuery]);

  const categories = useMemo(() => {
    const cats = new Set<string>(["Sve"]);
    allCards.forEach(card => cats.add(card.category));
    return Array.from(cats);
  }, [allCards]);

  const filteredCards = useMemo(() => {
    return allCards.filter(card => {
      const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           card.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "Sve" || card.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allCards, searchQuery, activeCategory]);

  const selectedCardData = selectedCard 
    ? allCards.find(c => c.id === selectedCard)
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden"
            style={{ 
              background: "linear-gradient(145deg, #1E1B2A 0%, #14121C 100%)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10" />
              <div className="relative px-8 py-6 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <Question size={24} weight="bold" style={{ color: "#C339B5" }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Pomoć & Tutorijali</h2>
                    <p className="text-sm text-white/50">Brze i jednostavne smernice</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X size={24} weight="bold" style={{ color: "rgba(255,255,255,0.7)" }} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 100px)" }}>
              {!selectedCard ? (
                <div className="p-8">
                  {/* Search Bar */}
                  <div className="mb-6">
                    {/* Current Page Notice */}
                    {activeCategory === pageCategory && !searchQuery && (
                      <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-500/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Info size={20} weight="bold" className="text-purple-300" />
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">
                              📍 Prikazane su pomoći za <span className="text-purple-300">{pageCategory}</span> stranicu
                            </p>
                            <p className="text-white/60 text-xs mt-1">
                              Klikni "Sve" ili drugu kategoriju da vidiš ostale pomoći
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="relative">
                      <MagnifyingGlass 
                        size={20} 
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                        weight="bold"
                      />
                      <input
                        type="text"
                        placeholder="Pretraži pomoć..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Category Filters */}
                  <div className="mb-8 flex gap-3 flex-wrap">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                          activeCategory === cat
                            ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/40 text-white"
                            : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Help Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCards.map((card) => {
                      const isCurrentPage = card.category === pageCategory;
                      return (
                        <motion.button
                          key={card.id}
                          onClick={() => setSelectedCard(card.id)}
                          className={`relative group text-left overflow-hidden rounded-2xl transition-all duration-300 ${
                            isCurrentPage 
                              ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 shadow-lg shadow-purple-500/25" 
                              : "bg-white/5 border border-white/10 hover:border-white/20"
                          }`}
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Current Page Badge */}
                          {isCurrentPage && (
                            <div className="absolute top-3 right-3 z-10">
                              <div className="px-2 py-1 rounded-lg text-[10px] font-bold bg-purple-500/30 border border-purple-400/50 text-purple-200">
                                TRENUTNA STRANICA
                              </div>
                            </div>
                          )}
                        {/* Gradient Background */}
                        <div 
                          className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                        />
                        
                        <div className="relative p-6">
                          {/* Icon */}
                          <div 
                            className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center"
                            style={{ 
                              background: `linear-gradient(135deg, ${card.color}20, ${card.color}10)`,
                              border: `1px solid ${card.color}30`
                            }}
                          >
                            <card.icon size={28} weight="bold" style={{ color: card.color }} />
                          </div>

                          {/* Content */}
                          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                            {card.title}
                          </h3>
                          <p className="text-sm text-white/60 mb-4 line-clamp-2">
                            {card.description}
                          </p>

                          {/* Category Badge */}
                          <div className="flex items-center justify-between">
                            <span 
                              className="px-3 py-1 rounded-lg text-xs font-semibold"
                              style={{ 
                                background: `${card.color}20`,
                                color: card.color,
                                border: `1px solid ${card.color}30`
                              }}
                            >
                              {card.category}
                            </span>
                            <ArrowRight 
                              size={18} 
                              weight="bold" 
                              className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all"
                            />
                          </div>
                        </div>
                      </motion.button>
                    );
                    })}
                  </div>

                  {/* No Results */}
                  {filteredCards.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                        <MagnifyingGlass size={32} weight="bold" className="text-white/30" />
                      </div>
                      <p className="text-white/50 text-lg">Nema rezultata pretrage</p>
                      <p className="text-white/30 text-sm mt-2">Pokušajte sa drugačijim ključnim rečima</p>
                    </div>
                  )}

                  {/* Quick Tips Section */}
                  <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Lightning size={24} weight="fill" style={{ color: "#1FBFA4" }} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg mb-2">💡 Brzi savet</h4>
                        <p className="text-white/70">
                          {page === "dashboard" && "Koristite OCR za brzo dodavanje računa - jednostavno uploadujte sliku i sistem sve sam popuni!"}
                          {page === "expenses" && "Postavite ponavljajuće troškove za račune koji dolaze svaki mesec - aplikacija će vas podsetiti!"}
                          {page === "incomes" && "Redovno ažurirajte prihode za tačnu sliku budžeta i finansijskog zdravlja."}
                          {page === "groups" && "Kreirajte grupu za automatsku podelu troškova - fer i bez komplikacija!"}
                          {page === "categories" && "Kategorije vam pomažu da vidite gde najviše trošite - prvi korak ka boljoj kontroli!"}
                          {page === "statistics" && "Pratite trendove na grafikonima da identifikujete oblasti za uštedu."}
                          {page === "profile" && "Omogućite notifikacije da ne propustite važne podsetnike!"}
                          {page === "budgets" && "Počnite sa realnim ciljevima za 2-3 glavne kategorije - onda postepeno optimizujte!"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8">
                  {/* Back Button */}
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
                  >
                    <CaretRight size={20} weight="bold" className="rotate-180" />
                    <span className="font-semibold">Nazad</span>
                  </button>

                  {/* Card Detail */}
                  {selectedCardData && (
                    <div>
                      {/* Header */}
                      <div className="flex items-start gap-6 mb-8">
                        <div 
                          className="w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0"
                          style={{ 
                            background: `linear-gradient(135deg, ${selectedCardData.color}30, ${selectedCardData.color}10)`,
                            border: `2px solid ${selectedCardData.color}40`
                          }}
                        >
                          <selectedCardData.icon size={40} weight="bold" style={{ color: selectedCardData.color }} />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-3xl font-bold text-white mb-3">
                            {selectedCardData.title}
                          </h2>
                          <p className="text-white/60 text-lg">
                            {selectedCardData.description}
                          </p>
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10">
                        <p className="text-white/80 leading-relaxed text-lg">
                          {selectedCardData.content.main}
                        </p>
                      </div>

                      {/* Steps */}
                      {selectedCardData.content.steps && (
                        <div className="mb-8">
                          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <CheckSquare size={24} weight="bold" style={{ color: selectedCardData.color }} />
                            Koraci
                          </h3>
                          <div className="space-y-3">
                            {selectedCardData.content.steps.map((step, idx) => (
                              <div
                                key={idx}
                                className="flex gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors"
                              >
                                <div 
                                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0"
                                  style={{ background: selectedCardData.color }}
                                >
                                  {idx + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-white mb-1">
                                    {step.title}
                                  </div>
                                  <div className="text-white/60 text-sm">
                                    {step.desc}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tips */}
                      {selectedCardData.content.tips && selectedCardData.content.tips.length > 0 && (
                        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Lightbulb size={24} weight="fill" style={{ color: "#1FBFA4" }} />
                            Saveti
                          </h3>
                          <ul className="space-y-3">
                            {selectedCardData.content.tips.map((tip, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-white/70">
                                <CheckCircle size={20} weight="fill" className="flex-shrink-0 mt-0.5" style={{ color: "#1FBFA4" }} />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Warnings */}
                      {selectedCardData.content.warnings && selectedCardData.content.warnings.length > 0 && (
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Warning size={24} weight="fill" style={{ color: "#F97316" }} />
                            Upozorenja
                          </h3>
                          <ul className="space-y-3">
                            {selectedCardData.content.warnings.map((warning, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-orange-200">
                                <Info size={20} weight="fill" className="flex-shrink-0 mt-0.5" style={{ color: "#F97316" }} />
                                <span>{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
