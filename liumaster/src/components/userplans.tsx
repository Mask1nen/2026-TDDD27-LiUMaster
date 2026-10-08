import { useUserProfile } from "../hooks/useUserProfile";
import { useUserPlan } from "../hooks/useUserPlan";

import { CreateNewPlanCard } from "./userplancard";
import PlanViewer from "./planviewer";
import PlanList from "./planlist";

// Dashboard för hemsidan
function UserPlanViewer() {
  const { profile, loadingProfile } = useUserProfile();

  const { plans, loadingPlan } = useUserPlan();

  const activePlan = plans.find((p) => p.id === profile?.primaryPlanID);

  if (loadingPlan || loadingProfile) {
    return <h1>Loading...</h1>;
  }

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
      <div className="w-1/2">
        <PlanList
          plans={plans}
          numberOfCols={2}
          primaryPlanID={profile?.primaryPlanID || ""}
          extraCards={<CreateNewPlanCard program={profile?.program} />}
        />
      </div>
    </div>
  );
}

export default UserPlanViewer;
