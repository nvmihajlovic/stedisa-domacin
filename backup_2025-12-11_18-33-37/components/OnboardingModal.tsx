"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  UploadSimple,
  UsersThree,
  Sparkle,
  ArrowRight,
  X,
  ChartLineUp,
  Receipt,
  CurrencyCircleDollar,
  Robot
} from "@phosphor-icons/react";

interface OnboardingModalProps {
  onComplete: () => void;
  userName: string;
}

export default function OnboardingModal({ onComplete, userName }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    {
      id: 1,
      title: `Dobrodošli, ${userName}!`,
      description: "Vaša moderna fintech aplikacija za potpunu kontrolu finansija",
      icon: Sparkle,
      color: "#9F70FF",
      gradient: "from-purple-500 via-purple-600 to-blue-500",
      features: [
        { icon: ChartLineUp, text: "Automatsko praćenje troškova i prihoda" },
        { icon: Robot, text: "OCR - skeniranje računa pomoću AI" },
        { icon: UsersThree, text: "Grupne finansije i podela troškova" },
        { icon: ChartLineUp, text: "Detaljne statistike i predviđanja" }
      ]
    },
    {
      id: 2,
      title: "Dodajte Troškove Brzo",
      description: "Fotografišite račun - AI će automatski izvući sve podatke",
      icon: UploadSimple,
      color: "#7FDFFF",
      gradient: "from-cyan-500 via-blue-500 to-indigo-500",
      features: [
        { icon: Receipt, text: "Fotografišite ili uploadujte račun" },
        { icon: Robot, text: "AI automatski prepoznaje iznos i datum" },
        { icon: CurrencyCircleDollar, text: "Smart kategorizacija troškova" },
        { icon: CheckCircle, text: "Potvrda i čuvanje u bazi" }
      ],
      hint: "Kliknite '+ Dodaj Trošak' i prevucite sliku računa!"
    },
    {
      id: 3,
      title: "Podelite Troškove",
      description: "Kreirajte grupe sa cimerom, porodicom ili prijateljima",
      icon: UsersThree,
      color: "#45D38A",
      gradient: "from-emerald-500 via-teal-500 to-green-500",
      features: [
        { icon: UsersThree, text: "Pozovite članove preko linka" },
        { icon: CurrencyCircleDollar, text: "Automatska podela troškova" },
        { icon: ChartLineUp, text: "Mesečni pregledi po članovima" },
        { icon: CheckCircle, text: "Praćenje dugovanja u realnom vremenu" }
      ],
      hint: "Idite na 'Grupe' → 'Kreiraj Grupu' i pozovite ljude!"
    },
    {
      id: 4,
      title: "Spremni Za Start!",
      description: "Sve je podešeno - počnite sa kontrolom Vaših finansija",
      icon: CheckCircle,
      color: "#6FFFC4",
      gradient: "from-green-400 via-emerald-500 to-teal-500",
      features: [
        { icon: Sparkle, text: "Optimizovano za sve uređaje" },
        { icon: CheckCircle, text: "Notifikacije za važne akcije" },
        { icon: ChartLineUp, text: "Brzi pristup svim funkcijama" },
        { icon: Robot, text: "AI pomoćnik za savete" }
      ]
    }
  ];

  const currentStep = steps[step - 1];
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
      localStorage.setItem("onboarding_completed", "true");
    }, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="relative w-full max-w-2xl bg-gradient-to-br from-[#1C1A2E]/95 to-[#0F0F1A]/95 rounded-3xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-2xl"
          >
            {/* Animated Gradient Background */}
            <div 
              className={`absolute top-0 left-0 right-0 h-56 opacity-15 bg-gradient-to-br ${currentStep.gradient} blur-2xl`}
              style={{ animation: 'pulse 4s ease-in-out infinite' }}
            />

            {/* Close Button */}
            {step > 1 && (
              <button
                onClick={handleSkip}
                className="absolute top-6 right-6 z-10 text-gray-400 hover:text-white transition-all duration-200 p-2 rounded-full hover:bg-white/10"
              >
                <X size={24} weight="bold" />
              </button>
            )}

            <div className="relative p-8 md:p-12">
              {/* Progress Indicators */}
              <div className="flex gap-2.5 justify-center mb-10">
                {steps.map((s, idx) => (
                  <motion.div
                    key={s.id}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      idx + 1 <= step
                        ? `bg-gradient-to-r ${currentStep.gradient} shadow-lg`
                        : "bg-white/10"
                    }`}
                    style={{ 
                      width: idx + 1 === step ? "56px" : "28px",
                      boxShadow: idx + 1 === step ? `0 0 20px ${currentStep.color}60` : 'none'
                    }}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: idx + 1 === step ? 1 : 0.95 }}
                  />
                ))}
              </div>

              {/* Icon with Glow */}
              <motion.div
                key={step}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 180, damping: 12 }}
                className="flex justify-center mb-8"
              >
                <div
                  className={`relative w-28 h-28 rounded-2xl flex items-center justify-center bg-gradient-to-br ${currentStep.gradient}`}
                  style={{ boxShadow: `0 12px 48px ${currentStep.color}50` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                  <Icon size={56} weight="duotone" className="text-white relative z-10" />
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                key={`content-${step}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="text-center mb-8"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  {currentStep.title}
                </h2>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  {currentStep.description}
                </p>

                {/* Features Grid */}
                <div className="bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm">
                  <div className="grid grid-cols-1 gap-4">
                    {currentStep.features.map((feature, idx) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + idx * 0.1 }}
                          className="flex items-center gap-4 text-left p-3 rounded-xl hover:bg-white/5 transition-all duration-200 group"
                        >
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${currentStep.gradient} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <FeatureIcon size={22} weight="duotone" className="text-white" />
                          </div>
                          <span className="text-gray-200 font-medium">{feature.text}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Hint */}
                {currentStep.hint && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className={`mt-6 p-5 rounded-xl bg-gradient-to-r ${currentStep.gradient} bg-opacity-10 border border-white/20 backdrop-blur-sm`}
                    style={{ boxShadow: `0 4px 20px ${currentStep.color}20` }}
                  >
                    <p className="text-sm text-white font-medium flex items-center gap-2">
                      <Sparkle size={18} weight="fill" />
                      {currentStep.hint}
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* Buttons */}
              <div className="flex gap-4">
                {step > 1 && step < steps.length && (
                  <button
                    onClick={handleSkip}
                    className="flex-1 py-4 rounded-xl font-semibold text-gray-300 hover:bg-white/10 transition-all duration-200 border border-white/10"
                  >
                    Preskoči
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className={`${
                    step === 1 || step === steps.length ? "w-full" : "flex-1"
                  } py-4 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2.5 group relative overflow-hidden`}
                  style={{
                    background: `linear-gradient(135deg, ${currentStep.color}, ${currentStep.color}dd)`,
                    boxShadow: `0 6px 24px ${currentStep.color}60`,
                  }}
                >
                  <span className="relative z-10">
                    {step === steps.length ? "Počnite!" : "Sledeće"}
                  </span>
                  {step < steps.length && (
                    <ArrowRight
                      size={20}
                      weight="bold"
                      className="group-hover:translate-x-1 transition-transform relative z-10"
                    />
                  )}
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite'
                  }} />
                </button>
              </div>

              {/* Step Counter */}
              <p className="text-center text-sm text-gray-500 mt-6 font-medium">
                Korak {step} od {steps.length}
              </p>
            </div>
          </motion.div>

          <style jsx>{`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );
}
