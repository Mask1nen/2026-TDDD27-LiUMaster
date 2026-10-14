import { useMemo } from "react";

import { useUserProfile } from "../hooks/useUserProfile";
import { useUserPlan } from "../hooks/useUserPlan";

import { CreateNewPlanCard } from "../components/userplancard";
import PlanViewer from "../components/planviewer";
import PlanList from "../components/planlist";
import { useNavigate } from "react-router-dom";
import { usePublicPlans } from "../hooks/usePublicPlans";

// Dashboard för hemsidan
function UserPlanViewer() {
  const { profile, loadingProfile } = useUserProfile();
  const navigate = useNavigate();

  const { plans, loadingPlan } = useUserPlan();
  const { publicPlans, loadingPublicPlans } = usePublicPlans();

  const activePlan = plans.find((p) => p.id === profile?.primaryPlanID);

  const editablePlans = useMemo(
    () =>
      profile
        ? publicPlans.filter(
            (plan) =>
              plan.authorID !== profile.userID &&
              plan.editors?.includes(profile.userID),
          )
        : [],
    [publicPlans, profile],
  );

  if (loadingPlan || loadingProfile || loadingPublicPlans) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="flex flex-row w-full min-h-full items-start p-2">
      <div className="flex flex-col w-1/2 max-h-full border-4 border-cyan-500 rounded-md mr-5 min-h-full">
        <h1
          className="text-center font-bold text-3xl bg-cyan-500/50 p-1 cursor-pointer"
          onClick={() => navigate(`/planner/${profile?.primaryPlanID}`)}
        >
          Primär plan
        </h1>
        <div className="flex-1 min-h-0 overflow-auto">
          {activePlan ? (
            <div className="w-fit mx-auto">
              <PlanViewer
                selectedPlan={activePlan}
                canEdit={false}
                isOwner={true}
              />
            </div>
          ) : (
            <div className="text-content p-4 text-center">
              <h1>Du har ingen primär plan än.</h1>
              <h1>Sätt en plan till primär för att se den här!</h1>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col w-1/2 gap-10">
        <div>
          <h1 className="text-2xl font-bold p-2 bg-surface-raised border-2 border-themedBorder rounded-md mb-2">
            Mina Planer
          </h1>
          <PlanList
            plans={plans}
            numberOfCols={2}
            primaryPlanID={profile?.primaryPlanID || ""}
            extraCards={<CreateNewPlanCard program={profile?.program} />}
          />
        </div>
        {editablePlans.length > 0 && (
          <div>
            <h1 className="text-2xl font-bold p-2 bg-surface-raised border-2 border-themedBorder rounded-md mb-2">
              Planer jag kan redigera
            </h1>
            <PlanList plans={editablePlans} numberOfCols={2} />
          </div>
        )}
      </div>
    </div>
  );
}

export default UserPlanViewer;
