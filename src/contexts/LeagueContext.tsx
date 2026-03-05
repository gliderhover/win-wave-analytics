import { createContext, useContext, useState, ReactNode } from "react";

// Default to MLS (Sportmonks ID 779) for testing.
export const DEFAULT_LEAGUE_ID = "779";

interface LeagueContextType {
  selectedLeague: string; // league id or "all"
  setSelectedLeague: (id: string) => void;
}

const LeagueContext = createContext<LeagueContextType>({
  selectedLeague: "all",
  setSelectedLeague: () => {},
});

export const LeagueProvider = ({ children }: { children: ReactNode }) => {
  const [selectedLeague, setSelectedLeague] = useState(`sm:${DEFAULT_LEAGUE_ID}`);
  return (
    <LeagueContext.Provider value={{ selectedLeague, setSelectedLeague }}>
      {children}
    </LeagueContext.Provider>
  );
};

export const useLeague = () => useContext(LeagueContext);
