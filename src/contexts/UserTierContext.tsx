import { createContext, useContext, useState, ReactNode } from "react";

export type Tier = "base" | "pro" | "elite";

interface UserTierContextType {
  tier: Tier;
  setTier: (tier: Tier) => void;
  isPro: boolean;
  isElite: boolean;
  hasAccess: (requiredTier: Tier) => boolean;
}

const tierLevel: Record<Tier, number> = { base: 0, pro: 1, elite: 2 };

const UserTierContext = createContext<UserTierContextType>({
  tier: "base",
  setTier: () => {},
  isPro: false,
  isElite: false,
  hasAccess: () => false,
});

export const UserTierProvider = ({ children }: { children: ReactNode }) => {
  const [tier, setTier] = useState<Tier>("base");
  return (
    <UserTierContext.Provider value={{
      tier,
      setTier,
      isPro: tierLevel[tier] >= 1,
      isElite: tier === "elite",
      hasAccess: (required: Tier) => tierLevel[tier] >= tierLevel[required],
    }}>
      {children}
    </UserTierContext.Provider>
  );
};

export const useUserTier = () => useContext(UserTierContext);
