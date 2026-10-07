import { useMemo } from "react";
import { useUserProfile } from "../hooks/useUserProfile";
import { useUserPlan } from "../hooks/useUserPlan";

import { UserPlanCard, CreateNewPlanCard } from "./userplancard";
import PlanViewer from "./planviewer";

// Dashboard för hemsidan
function UserPlanViewer() {
  const { profile, loadingProfile } = useUserProfile();

  const { plans, loadingPlan } = useUserPlan();

  const sortedPlans = useMemo(() => {
    const primaryID = profile?.primaryPlanID;
    if (!primaryID) return plans;

    return [...plans].sort((a, b) => {
      if (a.id === primaryID) return -1;
      if (b.id === primaryID) return 1;
      return 0;
    });
  }, [plans, profile?.primaryPlanID]);

  if (loadingProfile || loadingPlan) {
    return <h1>Loading plans</h1>;
  }

  const activePlan = plans.find((p) => p.id === profile?.primaryPlanID);

  return (
    <div className="flex flex-row w-full min-h-full items-start p-2">
      <div className="flex flex-col w-1/2 border-4 border-cyan-500 rounded-md mr-5">
        <h1 className="text-center font-bold text-3xl bg-cyan-500/50 p-1">
          Primär plan
        </h1>
        <div>
          {activePlan ? (
            <PlanViewer selectedPlan={activePlan} canEdit={false} />
          ) : (
            <div className="text-content p-4 text-center">
              Du har ingen primär plan ännu.
            </div>
          )}
        </div>
      </div>

      <div id="center" className="grid grid-cols-2 h-fit w-1/2 gap-2">
        {sortedPlans.map((plan) => (
          <UserPlanCard
            key={plan.id}
            destinationPage={`/planner/${plan.id}`}
            plan={plan}
            isActive={plan.id === profile?.primaryPlanID}
            authorName={profile?.displayName || "Unknown user"}
          />
        ))}
        <CreateNewPlanCard program={profile?.program} />
      </div>
    </div>
  );
}

export default UserPlanViewer;
