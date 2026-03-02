import { createContext, useContext, useState, ReactNode } from "react";

interface LeagueContextType {
  selectedLeague: string; // league id or "all"
  setSelectedLeague: (id: string) => void;
}

const LeagueContext = createContext<LeagueContextType>({
  selectedLeague: "all",
  setSelectedLeague: () => {},
});

export const LeagueProvider = ({ children }: { children: ReactNode }) => {
  const [selectedLeague, setSelectedLeague] = useState("all");
  return (
    <LeagueContext.Provider value={{ selectedLeague, setSelectedLeague }}>
      {children}
    </LeagueContext.Provider>
  );
};

export const useLeague = () => useContext(LeagueContext);
