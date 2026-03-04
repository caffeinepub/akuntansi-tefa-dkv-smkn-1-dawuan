import type { ReactNode } from "react";
import { LocalAuthContext, useLocalAuthValue } from "../hooks/useLocalAuth";

export function LocalAuthProvider({ children }: { children: ReactNode }) {
  const value = useLocalAuthValue();
  return (
    <LocalAuthContext.Provider value={value}>
      {children}
    </LocalAuthContext.Provider>
  );
}
