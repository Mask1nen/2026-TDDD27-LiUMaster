import { useEffect, useState } from "react";

import type { MasterPlan } from "../types";
import { useUserProfile } from "../helpers/useUserProfile";
import { useUserPlan } from "../helpers/useUserPlan";

import { UserPlanCard, CreateNewPlanCard } from "./userplancard";

// Dashboard för hemsidan
function UserPlanViewer() {
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
    <div className="flex items-center flex-col size-full p-2 bg-neutral-900">
      <div id="center" className="grid grid-cols-4 h-full w-full gap-2">
        {currentPlans.map((plan) => (
          <UserPlanCard
            key={plan.id}
            destinationPage={`/planner/${plan.id}`}
            plan={plan}
          />
        ))}
        <CreateNewPlanCard program={profile?.program} />
      </div>
    </div>
  );
}

export default UserPlanViewer;
