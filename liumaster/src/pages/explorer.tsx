import { type ChangeEvent, useMemo, useState } from "react";
import { MASTERINRIKTNINGAR } from "../types";
import { usePublicPlans } from "../hooks/usePublicPlans";
import { useAuth } from "../context/UserAuthContext";
import PlanList from "../components/planlist";

function PlanExplorer() {
  const { user } = useAuth();
  const { publicPlans, loadingPublicPlans } = usePublicPlans({
    excludeAuthorID: user?.uid,
  });

  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedSpecialization, setSelectedSpecialization] =
    useState<string>("");

  const programs = Object.keys(MASTERINRIKTNINGAR);
  const specOptions = selectedProgram
    ? MASTERINRIKTNINGAR[selectedProgram as keyof typeof MASTERINRIKTNINGAR]
    : [];

  const filteredPlans = useMemo(
    () =>
      publicPlans.filter(
        (plan) =>
          (!selectedProgram || selectedProgram == plan.program) &&
          (!selectedSpecialization ||
            selectedSpecialization == plan.specialization),
      ),
    [publicPlans, selectedProgram, selectedSpecialization],
  );

  if (loadingPublicPlans) {
    return <h1>Loading public plans</h1>;
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-col bg-surface-raised p-2 border-b-2 border-themedBorder rounded-md">
        <h1 className="text-5xl font-bold">Utforskaren</h1>
        <p>Utforska andra användares planer för inspiration.</p>
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
        {filteredPlans.length > 0 && (
          <div>
            <PlanList numberOfCols={4} plans={filteredPlans} />
          </div>
        )}
        {filteredPlans.length == 0 && (
          <div className="flex flex-1 min-h-0 justify-center items-center">
            <div className="text-center p-2 bg-surface-raised m-2 border-2 border-themedBorder rounded-md">
              <h1 className="text-2xl font-bold">Här var det tomt...</h1>
              <p>Försök ändra i filtreringen för att hitta fler planer!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlanExplorer;
