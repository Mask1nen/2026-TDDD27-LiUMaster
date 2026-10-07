import { useMemo, type ReactNode } from "react";
import { UserPlanCard } from "./userplancard";
import type { MasterPlan } from "../types";

interface PlanListProps {
  plans: MasterPlan[];
  primaryPlanID?: string;
  authorName: string;
  numberOfCols: number;
  extraCards?: ReactNode;
}

function PlanList({
  plans,
  primaryPlanID,
  authorName,
  numberOfCols,
  extraCards,
}: PlanListProps) {
  const sortedPlans = useMemo(() => {
    if (!primaryPlanID) return plans;
    return [...plans].sort((a, b) => {
      if (a.id === primaryPlanID) return -1;
      if (b.id === primaryPlanID) return 1;
      return 0;
    });
  }, [plans, primaryPlanID]);

  return (
    <div className={`grid grid-cols-${numberOfCols} h-fit gap-2`}>
      {sortedPlans.map((plan) => (
        <UserPlanCard
          key={plan.id}
          destinationPage={`/planner/${plan.id}`}
          plan={plan}
          isActive={plan.id === primaryPlanID}
          authorName={authorName}
        />
      ))}
      {extraCards}
    </div>
  );
}

export default PlanList;
