import { useMemo, type ReactNode } from "react";
import { UserPlanCard } from "./userplancard";
import type { MasterPlan } from "../types";

const colsClass: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
};

interface PlanListProps {
  plans: MasterPlan[];
  primaryPlanID?: string;
  numberOfCols?: keyof typeof colsClass;
  extraCards?: ReactNode;
}

function PlanList({
  plans,
  primaryPlanID,
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
    <div className={`grid ${colsClass[numberOfCols ?? 2]} h-fit gap-2`}>
      {sortedPlans.map((plan) => (
        <UserPlanCard
          key={plan.id}
          destinationPage={`/planner/${plan.id}`}
          plan={plan}
          isActive={plan.id === primaryPlanID}
          authorName={plan.authorName}
        />
      ))}
      {extraCards}
    </div>
  );
}

export default PlanList;
