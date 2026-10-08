import type { PlanMatch } from "../types";
import { MatchCard } from "./matchcard";

const colsClass: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
};

interface PlanListProps {
  planMatch: PlanMatch[];
  numberOfCols?: keyof typeof colsClass;
}

function MatchList({ planMatch, numberOfCols }: PlanListProps) {
  return (
    <div className={`grid ${colsClass[numberOfCols ?? 2]} h-fit gap-2`}>
      {planMatch.map((match) => (
        <MatchCard
          key={match.plan.id}
          destinationPage={`/planner/${match.plan.id}`}
          match={match}
        />
      ))}
    </div>
  );
}

export default MatchList;
