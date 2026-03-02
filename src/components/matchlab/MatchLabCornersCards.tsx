import { MatchData } from "@/lib/mockData";
import CornersCardsModel from "@/components/tactics/CornersCardsModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, CornerDownRight } from "lucide-react";

interface MatchLabCornersCardsProps {
  match: MatchData;
}

const MatchLabCornersCards = ({ match }: MatchLabCornersCardsProps) => {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-mono flex items-center gap-2">
          <CornerDownRight className="w-4 h-4 text-primary" />
          Corners & Cards Model
          <Tooltip>
            <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
            <TooltipContent className="max-w-[250px]">
              <p className="text-xs">Predicted corners and cards based on tactical profiles, discipline history, and referee data.</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CornersCardsModel matchId={match.id} teamA={match.teamA} teamB={match.teamB} />
      </CardContent>
    </Card>
  );
};

export default MatchLabCornersCards;
