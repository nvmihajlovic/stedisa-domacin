"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Users,
  UserPlus,
  SignOut,
  Crown,
  TrendUp,
  TrendDown,
  Wallet,
  Receipt,
  Plus,
  X,
  Check,
  Warning,
  ChartLine,
  ChartPie,
  Trash,
} from "phosphor-react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { useToast } from "@/hooks/useToast";
import { getIcon } from "@/lib/iconMapping";
import GroupTabs from "@/components/GroupTabs";
import GroupDashboard from "@/components/GroupDashboard";
import MemberDashboard from "@/components/MemberDashboard";
import CreateGroupModal from "@/components/groups/CreateGroupModal";
import GroupSwitcher from "@/components/groups/GroupSwitcher";

interface User {
  id: string;
  name: string;
  email: string;
}

interface GroupMember {
  id: string;
  userId: string;
  role: string;
  permissions: string;
  joinedAt: string;
  leftAt?: string | null;
  user: User;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  owner: User;
  members: GroupMember[];
  isOwner: boolean;
  canInvite: boolean;
  currentUserRole?: string;
  type?: string;
  endDate?: string | null;
  isActive?: boolean;
}

interface Stats {
  totalExpenses: number;
  totalIncomes: number;
  balance: number;
  transactionCount: number;
}

interface CategoryData {
  total: number;
  color: string;
  icon: string;
}

interface MemberComparison {
  userId: string;
  name: string;
  expenses: number;
  incomes: number;
  balance: number;
}

interface MonthlyTrend {
  month: string;
  expenses: number;
  incomes: number;
}

interface Transaction {
  id: string;
  type: "expense" | "income";
  amount: number;
  description: string;
  date: string;
  category: any;
  user: User;
  canEdit: boolean;
}

interface GroupStats {
  group: Group;
  stats: Stats;
  categoryExpenses: Record<string, CategoryData>;
  categoryIncomes: Record<string, CategoryData>;
  memberComparison: MemberComparison[];
  monthlyTrend: MonthlyTrend[];
  transactions: Transaction[];
  yoyData?: any;
  momData?: any;
  hourlyExpenses?: any[];
  last30Days?: any[];
  consistentCategories?: any[];
  categoryGrowth?: any[];
  monthsInProfit?: number;
  weekdayExpenses?: any[];
  dailyExpenses?: any[];
  topExpenses?: any[];
  averages?: any;
}

export default function GroupsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [categoryExpenses, setCategoryExpenses] = useState<Record<string, CategoryData>>({});
  const [categoryIncomes, setCategoryIncomes] = useState<Record<string, CategoryData>>({});
  const [memberComparison, setMemberComparison] = useState<MemberComparison[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [yoyData, setYoyData] = useState<any>(null);
  const [momData, setMomData] = useState<any>(null);
  const [hourlyExpenses, setHourlyExpenses] = useState<any[]>([]);
  const [last30Days, setLast30Days] = useState<any[]>([]);
  const [consistentCategories, setConsistentCategories] = useState<any[]>([]);
  const [categoryGrowth, setCategoryGrowth] = useState<any[]>([]);
  const [monthsInProfit, setMonthsInProfit] = useState<number>(0);
  const [weekdayExpenses, setWeekdayExpenses] = useState<any[]>([]);
  const [dailyExpenses, setDailyExpenses] = useState<any[]>([]);
  const [topExpenses, setTopExpenses] = useState<any[]>([]);
  const [averages, setAverages] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("group");
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  useEffect(() => {
    console.log("🟣 Groups page mounted - resetting showCreateModal to false");
    setShowCreateModal(false); // Reset modal state on mount
    fetchGroupData();
    fetchActiveGroup();
  }, []);

  const fetchGroupData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/group/stats");
      if (res.ok) {
        const text = await res.text();
        const data: GroupStats = text ? JSON.parse(text) : { group: null, stats: {}, categoryExpenses: {}, categoryIncomes: {}, memberComparison: [], monthlyTrend: [], transactions: [], yoyData: null, momData: null };
        setGroup(data.group);
        setStats(data.stats);
        setCategoryExpenses(data.categoryExpenses || {});
        setCategoryIncomes(data.categoryIncomes || {});
        setMemberComparison(data.memberComparison || []);
        setMonthlyTrend(data.monthlyTrend || []);
        setTransactions(data.transactions || []);
        setYoyData(data.yoyData || null);
        setMomData(data.momData || null);
        setHourlyExpenses(data.hourlyExpenses || []);
        setLast30Days(data.last30Days || []);
        setConsistentCategories(data.consistentCategories || []);
        setCategoryGrowth(data.categoryGrowth || []);
        setMonthsInProfit(data.monthsInProfit || 0);
        setWeekdayExpenses(data.weekdayExpenses || []);
        setDailyExpenses(data.dailyExpenses || []);
        setTopExpenses(data.topExpenses || []);
        setAverages(data.averages || null);
      } else if (res.status === 404) {
        // Korisnik nema grupu
        setGroup(null);
        setStats(null);
      }
    } catch (error) {
      console.error("Error fetching group:", error);
    }
    setLoading(false);
  };

  const fetchActiveGroup = async () => {
    try {
      const res = await fetch('/api/user/active-group');
      if (res.ok) {
        const data = await res.json();
        setActiveGroupId(data.activeGroup?.id || null);
      }
    } catch (error) {
      console.error('Error fetching active group:', error);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      addToast("Unesite validnu email adresu", "warning");
      return;
    }

    setInviteLoading(true);
    setInviteResult(null);

    try {
      const res = await fetch("/api/group/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailToInvite: inviteEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setInviteResult(data);
        addToast("Pozivnica uspešno poslata", "success");
      } else {
        addToast(data.error || "Greška pri slanju pozivnice", "error");
      }
    } catch (error) {
      console.error("Error sending invite:", error);
      addToast("Greška pri slanju pozivnice", "error");
    }

    setInviteLoading(false);
  };

  const handleLeaveGroup = async () => {
    try {
      const res = await fetch("/api/group/leave", {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        addToast(data.message, "success");
        setShowLeaveModal(false);
        fetchGroupData();
      } else {
        const data = await res.json();
        addToast(data.error || "Greška pri napuštanju grupe", "error");
      }
    } catch (error) {
      console.error("Error leaving group:", error);
      addToast("Greška pri napuštanju grupe", "error");
    }
  };

  const handleDeleteGroup = async () => {
    if (!group) return;

    try {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        addToast(data.message || "Grupa uspešno obrisana", "success");
        setShowDeleteModal(false);
        router.push("/dashboard");
      } else {
        const data = await res.json();
        addToast(data.error || "Greška pri brisanju grupe", "error");
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      addToast("Greška pri brisanju grupe", "error");
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("sr-RS", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0D11] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Empty state - nema grupe
  if (!group) {
    return (
      <div className="min-h-screen bg-[#0C0D11] p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">Grupe</h1>
                <p className="text-gray-400 mt-1">
                  Upravljajte zajedničkim finansijama
                </p>
              </div>
            </div>
          </div>

          {/* Empty state card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-12 text-center border border-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl"></div>
            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                <Users size={48} className="text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Nemate grupu
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Kreirajte grupu kako biste pratili zajedničke troškove i prihode sa porodicom, cimerom
                ili poslovnim partnerima.
              </p>
              <button
                onClick={() => {
                  console.log("🔵 KLIKNUTO: Kreiraj grupu dugme");
                  console.log("📊 State pre: showCreateModal =", showCreateModal);
                  setShowCreateModal(prev => {
                    console.log("📊 setShowCreateModal callback - prev:", prev, " new:", !prev);
                    return !prev;
                  });
                }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/25"
              >
                Kreiraj grupu
              </button>
            </div>
          </motion.div>
        </div>

        {/* Create Group Modal - MORA BITI OVDE za empty state! */}
        {showCreateModal && (
          <>
            {console.log("🟢 RENDERUJEM CreateGroupModal (empty state) - showCreateModal =", showCreateModal)}
            <CreateGroupModal
              onClose={() => setShowCreateModal(false)}
              onSuccess={() => {
                setShowCreateModal(false);
                addToast("Grupa uspešno kreirana!", "success");
                fetchGroupData();
                fetchActiveGroup();
              }}
            />
          </>
        )}
      </div>
    );
  }

  // Grupa postoji - prikaži dashboard
  // Filtriraj aktivne članove samo za prikaz broja
  const activeMembers = group.members.filter(m => !m.leftAt);

  return (
    <div className="min-h-screen px-10 lg:px-14 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8" style={{ paddingTop: "24px" }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 hover:opacity-70 transition-opacity rounded-xl"
              style={{ background: "#242236", border: "1px solid #2E2B44" }}
            >
              <ArrowLeft size={20} style={{ color: "rgba(255,255,255,0.7)" }} />
            </button>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1
                  className="text-[38px] font-bold"
                  style={{
                    color: "#FFFFFF",
                    fontFamily: '"Inter", "SF Pro", "Poppins", sans-serif',
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    lineHeight: 1,
                  }}
                >
                  {group.name}
                </h1>
                {group.isOwner && (
                  <div
                    className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                    style={{
                      background: "rgba(230, 193, 74, 0.15)",
                      color: "#E6C14A",
                      border: "1px solid rgba(230, 193, 74, 0.3)",
                    }}
                  >
                    <Crown size={14} weight="fill" />
                    Admin
                  </div>
                )}
              </div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontFamily: '"Inter", sans-serif' }}>
                {activeMembers.length}{" "}
                {activeMembers.length === 1 ? "aktivni član" : "aktivnih članova"}
              </p>
              
              {/* Group Type and Expiry Info */}
              {group.type && (
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{
                      background: group.type === "PERMANENT" 
                        ? "rgba(16, 185, 129, 0.1)" 
                        : "rgba(59, 130, 246, 0.1)",
                      color: group.type === "PERMANENT" ? "#10b981" : "#3b82f6",
                      border: group.type === "PERMANENT" 
                        ? "1px solid rgba(16, 185, 129, 0.3)" 
                        : "1px solid rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    {group.type === "PERMANENT" ? "Stalna grupa" : "Privremena grupa"}
                  </div>
                  
                  {group.type === "TEMPORARY" && group.endDate && (
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                      Ističe: {new Date(group.endDate).toLocaleDateString("sr-RS", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <GroupSwitcher 
              currentGroupId={activeGroupId} 
              onGroupChange={() => {
                fetchGroupData();
                fetchActiveGroup();
              }}
            />
            
            <button
              onClick={() => {
                console.log("Kreiraj grupu clicked, showCreateModal:", showCreateModal);
                setShowCreateModal(true);
              }}
              className="px-6 py-3 rounded-xl font-semibold hover:opacity-80 transition-all duration-300 flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #4DB2FF 0%, #A64DFF 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Plus size={20} weight="bold" />
              Kreiraj novu grupu
            </button>
            {group.canInvite && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-6 py-3 rounded-xl font-semibold hover:opacity-80 transition-all duration-300 flex items-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #A64DFF 0%, #4DB2FF 100%)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <UserPlus size={20} weight="bold" />
                Pozovi člana
              </button>
            )}
            
            {/* Obriši grupu - samo za vlasnika */}
            {group.isOwner && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-3 rounded-xl font-semibold hover:opacity-80 transition-all duration-300 flex items-center gap-2"
                style={{ 
                  background: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)", 
                  border: "1px solid rgba(220, 38, 38, 0.3)" 
                }}
              >
                <Trash size={20} weight="bold" />
                Obriši grupu
              </button>
            )}
            
            {/* Napusti grupu - za sve članove osim vlasnika */}
            {!group.isOwner && (
              <button
                onClick={() => setShowLeaveModal(true)}
                className="px-6 py-3 rounded-xl font-semibold hover:opacity-80 transition-all duration-300 flex items-center gap-2"
                style={{ background: "#242236", border: "1px solid #2E2B44" }}
              >
                <SignOut size={20} weight="bold" />
                Napusti grupu
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Ukupni troškovi */}
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
                  Ukupni troškovi
                </div>
                <TrendDown size={20} weight="duotone" style={{ color: "#C339B5" }} />
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "#FFFFFF", fontFamily: '"Inter", sans-serif' }}
              >
                <CountUp end={stats.totalExpenses} duration={0.8} decimals={0} separator="." preserveValue />
                <span style={{ fontSize: "0.65em", opacity: 0.6, fontWeight: 500, marginLeft: "4px" }}>
                  RSD
                </span>
              </div>
            </div>

            {/* Ukupni prihodi */}
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
                  Ukupni prihodi
                </div>
                <TrendUp size={20} weight="duotone" style={{ color: "#1FBFA4" }} />
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "#FFFFFF", fontFamily: '"Inter", sans-serif' }}
              >
                <CountUp end={stats.totalIncomes} duration={0.8} decimals={0} separator="." preserveValue />
                <span style={{ fontSize: "0.65em", opacity: 0.6, fontWeight: 500, marginLeft: "4px" }}>
                  RSD
                </span>
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
                <Wallet
                  size={20}
                  weight="duotone"
                  style={{ color: stats.balance >= 0 ? "#4EC8E4" : "#C339B5" }}
                />
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "#FFFFFF", fontFamily: '"Inter", sans-serif' }}
              >
                <CountUp end={stats.balance} duration={0.8} decimals={0} separator="." preserveValue />
                <span style={{ fontSize: "0.65em", opacity: 0.6, fontWeight: 500, marginLeft: "4px" }}>
                  RSD
                </span>
              </div>
            </div>

            {/* Broj transakcija */}
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
                  Broj transakcija
                </div>
                <Receipt size={20} weight="duotone" style={{ color: "#8A63D2" }} />
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "#FFFFFF", fontFamily: '"Inter", sans-serif' }}
              >
                <CountUp end={stats.transactionCount} duration={0.8} preserveValue />
              </div>
            </div>
          </div>
        )}

        {/* Group Tabs */}
        <GroupTabs 
          members={group.members} 
          activeTab={activeTab} 
          onSelect={setActiveTab} 
        />

        {/* Group Dashboard (Tab 1) */}
        {activeTab === "group" && (
          <GroupDashboard
            members={group.members}
            categoryExpenses={categoryExpenses}
            categoryIncomes={categoryIncomes}
            transactions={transactions}
            monthlyTrend={monthlyTrend}
            memberComparison={memberComparison}
            totalExpenses={stats?.totalExpenses || 0}
            totalIncomes={stats?.totalIncomes || 0}
            yoyData={yoyData}
            momData={momData}
            hourlyExpenses={hourlyExpenses}
            last30Days={last30Days}
            consistentCategories={consistentCategories}
            categoryGrowth={categoryGrowth}
            monthsInProfit={monthsInProfit}
            weekdayExpenses={weekdayExpenses}
            dailyExpenses={dailyExpenses}
            topExpenses={topExpenses}
            averages={averages}
            currentUserRole={group.currentUserRole}
            groupId={group.id}
            onMemberRemoved={fetchGroupData}
          />
        )}

        {/* Member Dashboard (Individual Tabs) */}
        {activeTab.startsWith("member-") && (
          <MemberDashboard 
            groupId={group.id} 
            memberId={activeTab.replace("member-", "")} 
            memberName={group.members.find(m => m.userId === activeTab.replace("member-", ""))?.user.name || "Član"}
          />
        )}
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowInviteModal(false);
              setInviteEmail("");
              setInviteResult(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1b23] rounded-2xl p-8 max-w-md w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Pozovi člana
                </h2>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail("");
                    setInviteResult(null);
                  }}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              {!inviteResult ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Email adresa
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-4 py-3 bg-[#0f1015] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                      autoFocus
                    />
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-blue-300 text-sm">
                      💡 Možete pozvati nekoga ko već koristi Domacin ili potpuno
                      novog korisnika.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowInviteModal(false);
                        setInviteEmail("");
                      }}
                      className="flex-1 px-4 py-3 bg-white/5 text-gray-300 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                    >
                      Otkaži
                    </button>
                    <button
                      onClick={handleSendInvite}
                      disabled={
                        !inviteEmail.trim() ||
                        !inviteEmail.includes("@") ||
                        inviteLoading
                      }
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {inviteLoading ? "Šaljem..." : "Pošalji poziv"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
                    <Check size={48} className="text-green-400 mx-auto mb-4" />
                    <p className="text-green-300 font-semibold mb-2">
                      {inviteResult.message}
                    </p>
                    {inviteResult.emailSent ? (
                      inviteResult.userExists ? (
                        <p className="text-gray-400 text-sm">
                          ✉️ Email pozivnica je poslata na adresu korisnika.
                        </p>
                      ) : (
                        <p className="text-gray-400 text-sm">
                          ✉️ Email sa pozivom za registraciju je poslat.
                        </p>
                      )
                    ) : (
                      <p className="text-orange-400 text-sm">
                        ⚠️ Email nije poslat. Link možete kopirati i poslati ručno.
                      </p>
                    )}
                  </div>

                  {inviteResult.inviteLink && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Link za pozivnicu (opciono)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inviteResult.inviteLink}
                          readOnly
                          className="flex-1 px-4 py-3 bg-[#0f1015] border border-white/10 rounded-xl text-gray-300 text-sm"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              inviteResult.inviteLink
                            );
                            addToast("Link kopiran!", "success");
                          }}
                          className="px-4 py-3 bg-white/5 text-gray-300 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                        >
                          Kopiraj
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail("");
                      setInviteResult(null);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    Zatvori
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leave Group Modal */}
      <AnimatePresence>
        {showLeaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowLeaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1b23] rounded-2xl p-8 max-w-md w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Napusti grupu
                </h2>
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 text-center">
                  <Warning size={48} className="text-orange-400 mx-auto mb-4" />
                  <p className="text-white font-semibold mb-2">
                    Da li ste sigurni?
                  </p>
                  <p className="text-gray-400 text-sm">
                    Napustićete grupu. Vaši podaci ostaju vidljivi u grupnoj
                    istoriji za period dok ste bili član.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowLeaveModal(false)}
                    className="flex-1 px-4 py-3 bg-white/5 text-gray-300 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                  >
                    Odustani
                  </button>
                  <button
                    onClick={handleLeaveGroup}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all"
                  >
                    Napusti grupu
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Group Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1b23] rounded-2xl p-8 max-w-md w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Obriši grupu
                </h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                  <Trash size={48} className="text-red-400 mx-auto mb-4" />
                  <p className="text-white font-semibold mb-2">
                    Da li ste sigurni?
                  </p>
                  <p className="text-gray-400 text-sm">
                    Brisanje grupe je trajno. Svi troškovi, prihodi i podaci grupe biće obrisani.
                    Ova akcija se ne može poništiti.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-3 bg-white/5 text-gray-300 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                  >
                    Odustani
                  </button>
                  <button
                    onClick={handleDeleteGroup}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-900 transition-all"
                  >
                    Obriši grupu
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Group Modal */}
      {showCreateModal && (
        <>
          {console.log("🟢 RENDERUJEM CreateGroupModal - showCreateModal =", showCreateModal)}
          <CreateGroupModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              addToast("Grupa uspešno kreirana!", "success");
              fetchGroupData();
              fetchActiveGroup();
            }}
          />
        </>
      )}
      
      {console.log("🔴 Render check: showCreateModal =", showCreateModal)}
    </div>
  );
}


