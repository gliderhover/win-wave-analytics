import { createContext, useContext, useState, ReactNode } from "react";

type Tier = "free" | "pro";

interface UserTierContextType {
  tier: Tier;
  setTier: (tier: Tier) => void;
  isPro: boolean;
}

const UserTierContext = createContext<UserTierContextType>({
  tier: "free",
  setTier: () => {},
  isPro: false,
});

export const UserTierProvider = ({ children }: { children: ReactNode }) => {
  const [tier, setTier] = useState<Tier>("free");
  return (
    <UserTierContext.Provider value={{ tier, setTier, isPro: tier === "pro" }}>
      {children}
    </UserTierContext.Provider>
  );
};

export const useUserTier = () => useContext(UserTierContext);
