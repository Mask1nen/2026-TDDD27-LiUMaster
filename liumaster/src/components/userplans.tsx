import { useUserProfile } from "../helpers/useUserProfile";
import { useUserPlan } from "../helpers/useUserPlan";

import { UserPlanCard, CreateNewPlanCard } from "./userplancard";
import PlanViewer from "./planviewer";

// Dashboard för hemsidan
function UserPlanViewer() {
  const { profile, loadingProfile } = useUserProfile();

  const { plans, loadingPlan } = useUserPlan();

  if (loadingProfile || loadingPlan) {
    return <h1>Loading plans</h1>;
  }

  const activePlan = plans.find((p) => p.id === profile?.activePlanID);

  return (
    <div className="flex flex-row size-full p-2 bg-neutral-900">
      <div className="flex flex-col w-1/2 h-full border-2 border-neutral-500 rounded-md m-2 mr-5">
        <h1 className="text-center font-bold text-3xl bg-neutral-800 p-1">
          Active plan
        </h1>
        <div className="overflow-scroll m-5">
          {activePlan ? (
            <PlanViewer selectedPlan={activePlan} canEdit={false} />
          ) : (
            <div className="text-white p-4">Du har ingen aktiv plan än.</div>
          )}
        </div>
      </div>

      <div id="center" className="grid grid-cols-2 h-fit w-1/2 gap-2">
        {plans.map((plan) => (
          <UserPlanCard
            key={plan.id}
            destinationPage={`/planner/${plan.id}`}
            plan={plan}
            authorName={profile?.displayName || "Unknown user"}
          />
        ))}
        <CreateNewPlanCard program={profile?.program} />
      </div>
    </div>
  );
}

export default UserPlanViewer;
