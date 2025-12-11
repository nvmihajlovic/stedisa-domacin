"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, UserMinus, Warning, X } from "phosphor-react";
import { getIcon } from "@/lib/iconMapping";
import GroupStatistics from "./GroupStatistics";
import GroupChartsAdvanced from "./GroupChartsAdvanced";
import GroupBudgetProgress from "./GroupBudgetProgress";
import { useState } from "react";

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

interface GroupDashboardProps {
  members: GroupMember[];
  categoryExpenses: Record<string, CategoryData>;
  categoryIncomes: Record<string, CategoryData>;
  transactions: Transaction[];
  monthlyTrend: MonthlyTrend[];
  memberComparison: MemberComparison[];
  totalExpenses: number;
  totalIncomes: number;
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
  currentUserRole?: string;
  currentUserId?: string;
  groupId?: string;
  onMemberRemoved?: () => void;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function GroupDashboard({
  members,
  categoryExpenses,
  categoryIncomes,
  transactions,
  monthlyTrend,
  memberComparison,
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
  currentUserRole,
  currentUserId,
  groupId,
  onMemberRemoved,
}: GroupDashboardProps) {
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{id: string, name: string, role: string, leftAt?: string | null} | null>(null);

  const canRemoveMember = currentUserRole === "owner" || currentUserRole === "admin";

  const openRemoveModal = (memberId: string, memberName: string, memberRole: string, leftAt?: string | null) => {
    setMemberToRemove({ id: memberId, name: memberName, role: memberRole, leftAt });
    setShowRemoveModal(true);
  };

  const handleRemoveMember = async () => {
    if (!canRemoveMember || !memberToRemove) return;

    setRemovingMemberId(memberToRemove.id);

    try {
      // Ako je član neaktivan (leftAt postoji), pozivamo delete-member endpoint
      // Inače pozivamo remove-member endpoint
      const endpoint = memberToRemove.leftAt ? "/api/group/delete-member" : "/api/group/remove-member";
      const bodyKey = memberToRemove.leftAt ? "memberIdToDelete" : "memberIdToRemove";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [bodyKey]: memberToRemove.id }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (res.ok) {
        setShowRemoveModal(false);
        if (onMemberRemoved) {
          onMemberRemoved();
        }
      } else {
        alert(data.error || "Greška pri uklanjanju člana");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Greška pri uklanjanju člana");
    } finally {
      setRemovingMemberId(null);
      setMemberToRemove(null);
    }
  };
  return (
    <>
      {/* Statistics Section */}
      <GroupStatistics
        categoryExpenses={categoryExpenses}
        categoryIncomes={categoryIncomes}
        transactions={transactions}
      />

      {/* Group Budgets Section */}
      {groupId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <GroupBudgetProgress
            groupId={groupId}
            isOwnerOrAdmin={currentUserRole === 'owner' || currentUserRole === 'admin'}
          />
        </motion.div>
      )}

      {/* Charts Section */}
      <GroupChartsAdvanced
        monthlyTrend={monthlyTrend}
        memberComparison={memberComparison}
        categoryExpenses={categoryExpenses}
        categoryIncomes={categoryIncomes}
        totalExpenses={totalExpenses}
        totalIncomes={totalIncomes}
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
      />

      {/* Members Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-6 border border-white/10 mb-8"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Users size={24} className="text-purple-400" />
          Članovi grupe
        </h2>
        <div className="space-y-3">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className={`flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors ${member.leftAt ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  {getInitials(member.user.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-semibold">
                      {member.user.name}
                    </p>
                    {member.leftAt && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                        Neaktivan
                      </span>
                    )}
                    {member.role === "owner" && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30">
                        👑 Admin
                      </span>
                    )}
                    {member.role === "admin" && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30">
                        Admin
                      </span>
                    )}
                    {member.role === "member" && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-400 border border-white/10">
                        Član
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-gray-400 text-sm">
                    {new Date(member.joinedAt).toLocaleDateString("sr-RS")}
                  </p>
                </div>
                {canRemoveMember && member.role !== "owner" && !member.leftAt && (
                  <button
                    onClick={() => openRemoveModal(member.id, member.user.name, member.role, member.leftAt)}
                    disabled={removingMemberId === member.id}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                    title="Ukloni člana"
                  >
                    {removingMemberId === member.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-400 border-t-transparent"></div>
                    ) : (
                      <UserMinus size={20} className="text-red-400 group-hover:text-red-300" weight="bold" />
                    )}
                  </button>
                )}
                {canRemoveMember && member.leftAt && (
                  <button
                    onClick={() => openRemoveModal(member.id, member.user.name, member.role, member.leftAt)}
                    disabled={removingMemberId === member.id}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                    title="Obriši člana trajno"
                  >
                    {removingMemberId === member.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-400 border-t-transparent"></div>
                    ) : (
                      <UserMinus size={20} className="text-red-400 group-hover:text-red-300" weight="fill" />
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Remove Member Confirmation Modal */}
      <AnimatePresence>
        {showRemoveModal && memberToRemove && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              if (!removingMemberId) {
                setShowRemoveModal(false);
                setMemberToRemove(null);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
              style={{
                background: "linear-gradient(145deg, #1E1B2A, #171421)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                    <Warning size={24} weight="fill" className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {memberToRemove.leftAt ? "Obriši člana" : "Ukloni člana"}
                    </h3>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {memberToRemove.leftAt ? "Ova akcija je trajna" : "Ova akcija ne može biti poništena"}
                    </p>
                  </div>
                </div>
                {!removingMemberId && (
                  <button
                    onClick={() => {
                      setShowRemoveModal(false);
                      setMemberToRemove(null);
                    }}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="mb-6">
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                  <p className="text-sm text-gray-300">
                    {memberToRemove.leftAt ? (
                      <>
                        Da li ste sigurni da želite da trajno obrišete{" "}
                        <span className="font-semibold text-white">{memberToRemove.name}</span>{" "}
                        iz grupe?
                      </>
                    ) : (
                      <>
                        Da li ste sigurni da želite da uklonite{" "}
                        <span className="font-semibold text-white">{memberToRemove.name}</span>{" "}
                        iz grupe?
                      </>
                    )}
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-gray-400">
                  {memberToRemove.leftAt ? (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span>Svi podaci o troškovima i prihodima člana biće obrisani</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span>Član će biti uklonjen iz istorije grupe</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span>Ova akcija je trajna i ne može biti poništena</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span>Član će izgubiti pristup svim zajedničkim finansijskim podacima</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span>Njegovi podaci ostaju sačuvani ali više ne utiču na statistiku</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span>Moguće je obrisati člana kasnije iz liste neaktivnih</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRemoveModal(false);
                    setMemberToRemove(null);
                  }}
                  disabled={removingMemberId !== null}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "#242236",
                    border: "1px solid #2E2B44",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Otkaži
                </button>
                <button
                  onClick={handleRemoveMember}
                  disabled={removingMemberId !== null}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {removingMemberId ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>{memberToRemove.leftAt ? "Brisanje..." : "Uklanjanje..."}</span>
                    </>
                  ) : (
                    <>
                      <Trash size={20} weight="bold" />
                      <span>{memberToRemove.leftAt ? "Obriši trajno" : "Ukloni člana"}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
