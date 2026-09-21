import { useEffect, useState } from "react";

import type { MasterPlan } from "../types";
import { useUserProfile } from "../helpers/useUserProfile";
import { useUserPlan } from "../helpers/useUserPlan";

import { DashBoardCard, CreateNewPlanCard } from "./dashboardcard";

// Dashboard för hemsidan
function Dashboard() {
  const [currentPlans, setCurrentPlans] = useState<MasterPlan[]>([]);
  const { profile, loading } = useUserProfile();
  const { plans } = useUserPlan();

  useEffect(() => {
    async function loadPlans() {
      setCurrentPlans(plans);
    }
    loadPlans();
  }, [plans]);

  if (loading) {
    return <h1>Plans are loading</h1>;
  }

  return (
    <div className="flex items-center flex-col size-full gap-2 p-4">
      <div id="center" className="grid grid-cols-4 h-full w-full gap-4">
        <CreateNewPlanCard program={profile?.program} />
        {currentPlans.map((plan) => (
          <DashBoardCard
            key={plan.id}
            destinationPage={`/planner/${plan.id}`}
            id={plan.id}
            name={plan.name || `Plan: ${plan.id}`}
            spec={plan.specialization}
            program={plan.program}
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
