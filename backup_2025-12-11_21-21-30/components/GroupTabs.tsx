"use client";

import { motion } from "framer-motion";
import { Users, User } from "phosphor-react";

interface Member {
  id: string;
  userId: string;
  leftAt?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface GroupTabsProps {
  members: Member[];
  activeTab: string;
  onSelect: (tabId: string) => void;
}

export default function GroupTabs({ members, activeTab, onSelect }: GroupTabsProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex gap-3 min-w-max">
        {/* Group Overview Tab */}
        <button
          onClick={() => onSelect("group")}
          className={`relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 ${
            activeTab === "group"
              ? "shadow-[0_0_25px_-5px_rgba(166,77,255,0.4)]"
              : ""
          }`}
          style={
            activeTab === "group"
              ? {
                  background: "linear-gradient(135deg, rgba(166,77,255,0.2) 0%, rgba(77,178,255,0.2) 100%)",
                  border: "2px solid rgba(166,77,255,0.5)",
                  color: "#FFFFFF",
                }
              : {
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.55)",
                }
          }
        >
          <Users
            size={20}
            weight={activeTab === "group" ? "fill" : "regular"}
            style={{ color: activeTab === "group" ? "#A64DFF" : "rgba(255,255,255,0.55)" }}
          />
          <span style={{ fontFamily: '"Inter", sans-serif' }}>Grupa</span>
          {activeTab === "group" && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ background: "linear-gradient(90deg, #A64DFF 0%, #4DB2FF 100%)" }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </button>

        {/* Member Tabs */}
        {members.map((member) => {
          const tabId = `member-${member.userId}`;
          const isActive = activeTab === tabId;
          const isInactive = !!member.leftAt;

          return (
            <button
              key={member.id}
              onClick={() => onSelect(tabId)}
              className={`relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                isActive ? "shadow-[0_0_25px_-5px_rgba(166,77,255,0.4)]" : ""
              } ${isInactive ? "opacity-50" : ""}`}
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg, rgba(166,77,255,0.2) 0%, rgba(77,178,255,0.2) 100%)",
                      border: "2px solid rgba(166,77,255,0.5)",
                      color: "#FFFFFF",
                    }
                  : {
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.55)",
                    }
              }
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={
                  isActive
                    ? { background: "linear-gradient(135deg, #A64DFF 0%, #4DB2FF 100%)" }
                    : { background: "rgba(255,255,255,0.1)" }
                }
              >
                {getInitials(member.user.name)}
              </div>
              <div className="flex flex-col items-start">
                <span style={{ fontFamily: '"Inter", sans-serif' }}>{member.user.name}</span>
                {isInactive && (
                  <span 
                    className="text-xs font-normal"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Neaktivan
                  </span>
                )}
              </div>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: "linear-gradient(90deg, #A64DFF 0%, #4DB2FF 100%)" }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
