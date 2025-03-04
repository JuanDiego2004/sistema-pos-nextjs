// components/client-side-provider.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

// Tipo para el usuario serializable
type AuthUser = {
  id: string;
  email?: string;
  role: string;
  metadata: {
    [key: string]: any;
  };
};

const UserContext = createContext<{
  user: AuthUser | null;
  role: string;
}>({
  user: null,
  role: "guest",
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [userState, setUserState] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<string>("guest");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user;
        
        if (currentUser) {
          const userData: AuthUser = {
            id: currentUser.id,
            email: currentUser.email,
            role: currentUser.user_metadata?.role || "user",
            metadata: {
              ...currentUser.user_metadata,
              ...currentUser.app_metadata,
            },
          };
          
          setUserState(userData);
          setRole(userData.role);
        } else {
          setUserState(null);
          setRole("guest");
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user: userState, role }}>
      {children}
    </UserContext.Provider>
  );
}