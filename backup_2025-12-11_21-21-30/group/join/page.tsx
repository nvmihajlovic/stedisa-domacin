"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, Check, Warning, ArrowLeft } from "phosphor-react";
import { motion } from "framer-motion";

function JoinGroupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [wrongAccount, setWrongAccount] = useState(false);
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Nevažeća pozivnica - token nedostaje");
      setLoading(false);
      return;
    }

    handleJoinGroup();
  }, [token]);

  const handleJoinGroup = async () => {
    try {
      const res = await fetch("/api/group/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        // Ako treba registracija, preusmeri na register stranicu
        if (data.needsRegistration) {
          router.push(`/register?inviteToken=${token}&email=${encodeURIComponent(data.email)}`);
          return;
        }

        setSuccess(true);
        setGroupName(data.group?.name || "grupu");
        setTimeout(() => {
          router.push("/groups");
        }, 3000);
      } else {
        // Ako treba login, preusmeri na login
        if (data.needsLogin) {
          router.push(`/login?inviteToken=${token}&email=${encodeURIComponent(data.email)}`);
          return;
        }
        
        // Ako je korisnik ulogovan sa pogrešnim nalogom
        if (data.wrongAccount) {
          setWrongAccount(true);
          setInviteEmail(data.inviteEmail);
          setErrorDetails(data.details);
        }
        
        setError(data.error || "Greška pri pridruživanju grupi");
      }
    } catch (error) {
      console.error("Error joining group:", error);
      setError("Greška pri pridruživanju grupi");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0D11] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
          </div>
          <p className="text-gray-400">Pridružujem vas grupi...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0C0D11] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-8 border border-white/10 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
              <Warning size={32} className="text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Greška
            </h2>
            <p className="text-gray-400 mb-4">{error}</p>
            
            {wrongAccount && (
              <>
                {errorDetails && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6 text-left">
                    <p className="text-orange-300 text-sm mb-3">{errorDetails}</p>
                    <p className="text-gray-400 text-sm">
                      💡 Molimo odjavite se i prijavite sa email-om: <strong className="text-white">{inviteEmail}</strong>
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={async () => {
                      await fetch("/api/logout", { method: "POST" });
                      router.push(`/login?inviteToken=${token}&email=${encodeURIComponent(inviteEmail || '')}`);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    Odjavi se i prijavi sa pravim nalogom
                  </button>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="px-6 py-3 bg-white/5 text-gray-300 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                  >
                    Nazad na Dashboard
                  </button>
                </div>
              </>
            )}
            
            {!wrongAccount && (
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-3 bg-white/5 text-gray-300 rounded-xl font-semibold hover:bg-white/10 transition-colors flex items-center gap-2 mx-auto"
              >
                <ArrowLeft size={20} />
                Nazad na Dashboard
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0C0D11] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="relative rounded-2xl bg-gradient-to-br from-[#1a1b23] to-[#0f1015] p-8 border border-white/10 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl"></div>
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center"
              >
                <Check size={32} className="text-green-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Uspešno pridruženi!
              </h2>
              <p className="text-gray-400 mb-6">
                Sada ste član grupe <strong className="text-white">{groupName}</strong>
              </p>
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                <Users size={24} className="text-purple-400" />
              </div>
              <p className="text-sm text-gray-500">
                Preusmeravamo vas na stranicu grupe...
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}

export default function JoinGroupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-gray-600">Učitavanje...</div>
      </div>
    }>
      <JoinGroupContent />
    </Suspense>
  );
}
