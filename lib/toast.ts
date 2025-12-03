import { useToast } from "@/hooks/useToast";

// Helper funkcija za prikaz toast notifikacija
// Može se koristiti bilo gde u aplikaciji
export function showToast(message: string, type: "success" | "error" | "warning" | "info" = "info") {
  // Koristi Zustand store direktno
  const store = useToast.getState();
  store.addToast(message, type);
}
