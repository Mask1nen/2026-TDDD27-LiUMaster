import { useMemo, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/UserAuthContext";
import { usePublicPlans } from "../hooks/usePublicPlans";
import { useUserProfile } from "../hooks/useUserProfile";
import { type MasterPlan, type PlanMatch, MASTERINRIKTNINGAR } from "../types";
import MatchList from "../components/matchlist";

export function PlanMatcher() {
  const { publicPlans, loadingPublicPlans } = usePublicPlans();
  const { user } = useAuth();
  const { profile, loadingProfile } = useUserProfile(user?.uid);
  const navigate = useNavigate();

  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedSpecialization, setSelectedSpecialization] =
    useState<string>("");

  const programs = Object.keys(MASTERINRIKTNINGAR);
  const specOptions = selectedProgram
    ? MASTERINRIKTNINGAR[selectedProgram as keyof typeof MASTERINRIKTNINGAR]
    : [];

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
      .filter((p) => p.id !== userPrimaryPlan.id)
      .map((p) => matchPlans(userPrimaryPlan, p))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [publicPrimaryPlans, userPrimaryPlan]);

  const filteredMatches = useMemo(
    () =>
      matches.filter(
        (match) =>
          (!selectedProgram || selectedProgram == match.plan.program) &&
          (!selectedSpecialization ||
            selectedSpecialization == match.plan.specialization),
      ),
    [matches, selectedProgram, selectedSpecialization],
  );

  if (loadingPublicPlans || loadingProfile) {
    return <h1>Loading plans...</h1>;
  }
  if (!userPrimaryPlan) {
    return (
      <div className="flex flex-col items-center gap-4 text-content p-6">
        <h1 className="text-3xl font-bold">Hoppsan!</h1>
        <p>Du har ingen primär plan att matcha med.</p>
        <button
          onClick={() => navigate("/myplans")}
          className="p-2 bg-surface-raised border-2 border-themedBorder rounded-md cursor-pointer hover:bg-surface-hover"
        >
          Sätt igång!
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-col bg-surface-raised p-2 border-b-2 border-themedBorder rounded-md">
        <h1 className="text-5xl font-bold">Matcharen</h1>
        <p>
          Matcha med andra studenters primära planer för att hitta
          pluggkamrater.
        </p>
      </div>
      <div className="flex flex-col p-2 min-w-0 flex-1 gap-5">
        <div className="flex flex-row gap-2">
          <select
            name="program"
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              setSelectedProgram(e.target.value);
              setSelectedSpecialization("");
            }}
            className="w-1/4 p-2 bg-surface-raised text-content border-2 border-themedBorder rounded-md cursor-pointer focus:outline-none focus:border-neutral-500"
          >
            <option key="ALL" value="">
              Alla program
            </option>
            {programs.map((program) => (
              <option key={program} value={program} className="text-content">
                {program}
              </option>
            ))}
          </select>

          {selectedProgram && (
            <select
              name="specialization"
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setSelectedSpecialization(e.target.value)
              }
              className="w-1/4 p-2 bg-surface-raised text-content border-2 border-themedBorder rounded-md cursor-pointer focus:outline-none focus:border-neutral-500"
            >
              <option key="ALL" value="">
                Alla inriktningar
              </option>
              {specOptions.map((spec) => (
                <option
                  key={spec.code}
                  value={spec.code}
                  className="text-content"
                >
                  {spec.name}
                </option>
              ))}
            </select>
          )}
        </div>
        {filteredMatches.length > 0 && (
          <div>
            <MatchList numberOfCols={4} planMatch={filteredMatches} />
          </div>
        )}
        {filteredMatches.length == 0 && (
          <div className="flex flex-1 min-h-0 justify-center items-center">
            <div className="text-center p-2 bg-surface-raised border-2 border-themedBorder rounded-md">
              <h1 className="text-2xl font-bold">Här var det tomt...</h1>
              <p>
                Försök ändra filtreringen eller ändra i din plan för att matcha
                med andra studenter!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlanMatcher;
