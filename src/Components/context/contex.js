import { createContext, useState } from "react";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
    const [addDriver, setAddDriver] = useState(false); // To handle loading state
  return (
    <AuthContext.Provider
      value={{
        addDriver,
        setAddDriver
      }}
    >
      {
        children
      }
    </AuthContext.Provider>
  );
}