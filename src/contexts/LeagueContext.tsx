import { createContext, useContext, useState, ReactNode } from "react";

// Default to MLS for testing. Confirm ID via /api/leagues/search?q=mls
const MLS_LEAGUE_ID_FOR_TESTING = "384";

interface LeagueContextType {
  selectedLeague: string; // league id or "all"
  setSelectedLeague: (id: string) => void;
}

const LeagueContext = createContext<LeagueContextType>({
  selectedLeague: "all",
  setSelectedLeague: () => {},
});

export const LeagueProvider = ({ children }: { children: ReactNode }) => {
  const [selectedLeague, setSelectedLeague] = useState(`sm:${MLS_LEAGUE_ID_FOR_TESTING}`);
  return (
    <LeagueContext.Provider value={{ selectedLeague, setSelectedLeague }}>
      {children}
    </LeagueContext.Provider>
  );
};

export const useLeague = () => useContext(LeagueContext);
