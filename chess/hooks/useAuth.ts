import { AuthContext, AuthContextType } from "@/context/AuthContext";
import { useContext } from "react";

export function useAuth() : AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}