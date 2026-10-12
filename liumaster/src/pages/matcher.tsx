import { useMemo } from "react";

import { useAuth } from "../context/UserAuthContext";
import { usePublicPlans } from "../hooks/usePublicPlans";
import { useUserProfile } from "../hooks/useUserProfile";
import type { MasterPlan, PlanMatch } from "../types";
import MatchList from "../components/matchlist";

export function PlanMatcher() {
  const { publicPlans, loadingPublicPlans } = usePublicPlans();
  const { user } = useAuth();
  const { profile, loadingProfile } = useUserProfile(user?.uid);

  const publicPrimaryPlans = publicPlans.filter((p) => p.isPrimary == true);
  const userPrimaryPlan = publicPlans.find(
    (p) => p.id == profile?.primaryPlanID,
  );

  function matchPlans(base: MasterPlan, other: MasterPlan): PlanMatch {
    const basePlanCourseCodes = new Set(
      (base.courses ?? []).map((c) => c.courseCode),
    );
    const otherPlanCourseCodes = new Set(
      (other.courses ?? []).map((c) => c.courseCode),
    );

    const sharedCourseCodes = [...basePlanCourseCodes].filter((code) =>
      otherPlanCourseCodes.has(code),
    );
    const unionSize = new Set([...basePlanCourseCodes, ...otherPlanCourseCodes])
      .size;
    const score = unionSize === 0 ? 0 : sharedCourseCodes.length / unionSize;

    return { plan: other, score, sharedCourseCodes };
  }

  const matches = useMemo<PlanMatch[]>(() => {
    if (!userPrimaryPlan) return [];

    return publicPrimaryPlans
      .filter((p) => p.id !== userPrimaryPlan.id) // matcha inte mot sig själv
      .map((p) => matchPlans(userPrimaryPlan, p))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [publicPrimaryPlans, userPrimaryPlan]);

  if (loadingPublicPlans || loadingProfile) {
    return <h1>Loading plans...</h1>;
  }
  if (!userPrimaryPlan) {
    return (
      <div className="p-2">
        <h1>Du har ingen primär plan att matcha med. Välj en först!</h1>
      </div>
    );
  }

  return (
    <div className="p-2">
      <h1>Matchande planer:</h1>
      <MatchList numberOfCols={4} planMatch={matches} />
    </div>
  );
}

export default PlanMatcher;
