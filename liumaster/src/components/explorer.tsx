import { usePublicPlan } from "../helpers/usePublicPlan";
import { PlanViewerCard } from "./planviewercard";

function PlanExplorer() {
  const { publicPlans, loading } = usePublicPlan();

  if (loading) {
    return <h1>Loading public plans</h1>;
  }

  return (
    <div className="flex items-center flex-col size-full gap-2 p-4">
      <div id="center" className="grid grid-cols-4 h-full w-full gap-4">
        {publicPlans.map((plan) => (
          <PlanViewerCard
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
