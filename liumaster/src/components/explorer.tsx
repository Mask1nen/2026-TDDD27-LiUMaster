import { usePublicPlan } from "../helpers/usePublicPlan";
import { UserPlanCard } from "./userplancard";

function PlanExplorer() {
  const { publicPlans, loading } = usePublicPlan();

  if (loading) {
    return <h1>Loading public plans</h1>;
  }

  return (
    <div className="flex items-center flex-col size-full p-2 bg-neutral-900">
      <div id="center" className="grid grid-cols-4 h-full w-full gap-2">
        {publicPlans.map((plan) => (
          <UserPlanCard
            key={plan.id}
            destinationPage={`/planner/${plan.id}`}
            plan={plan}
          />
        ))}
      </div>
    </div>
  );
}

export default PlanExplorer;
