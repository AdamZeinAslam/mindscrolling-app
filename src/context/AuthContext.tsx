"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type UserProfile = {
  name: string;
  email: string;
  handle: string;
  joined: string;
  avatarInitials: string;
};

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  signup: (name: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Cek localStorage saat pertama dimuat
  useEffect(() => {
    const storedUser = localStorage.getItem("nalar_user_profile");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Gagal membaca profil dari localStorage", e);
      }
    }
  }, []);

  const login = (email: string) => {
    // Untuk keperluan demo MVP, kita akan mencari user di localStorage atau login semu
    const storedUser = localStorage.getItem("nalar_user_profile");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.email === email) {
        setUser(parsedUser);
        return;
      }
    }
    
    // Jika tidak ada user sebelumnya, buat user dadakan dari email
    const nameFromEmail = email.split("@")[0].replace(/[^a-zA-Z]/g, " ");
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    
    signup(formattedName || "User", email);
  };

  const signup = (name: string, email: string) => {
    const avatarInitials = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "U";
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const d = new Date();
    const joined = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    const handle = `@${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

    const newUser: UserProfile = {
      name,
      email,
      handle,
      joined,
      avatarInitials,
    };

    setUser(newUser);
    localStorage.setItem("nalar_user_profile", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("nalar_user_profile");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
