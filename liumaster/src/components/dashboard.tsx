import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import type { MasterPlan } from "../types";
import { MASTERINRIKTNINGAR } from "../types";
import { useUserProfile } from "../helpers/useUserProfile";
import { useUserPlan } from "../helpers/useUserPlan";

type DashBoardCardProps = {
  destinationPage: string;
  name?: string;
  spec?: string;
  id: string;
  program?: string;
  programCode?: string;
  isCreating?: boolean;
  onStartCreate?: () => void;
  onCancelCreate?: () => void;
  onSavePlan?: (planName: string, track: string) => void;
};

// Kort som används i dashboard för att till exempel skapa nya masterplaner.
function DashBoardCard({
  destinationPage,
  name,
  spec,
  program,
  programCode,
  id,
  isCreating,
  onStartCreate,
  onCancelCreate,
  onSavePlan,
}: DashBoardCardProps) {
  const navigate = useNavigate();
  const [planName, setPlanName] = useState<string>("");
  const { loading } = useUserProfile();

  const specializations = programCode ? MASTERINRIKTNINGAR[programCode] : [];
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>(
    specializations[0]?.code || "",
  );

  const handleClick = async () => {
    if (id === "+" && !isCreating) {
      if (onStartCreate) onStartCreate();
    } else if (!isCreating) {
      navigate(`${destinationPage}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSavePlan) {
      onSavePlan(planName, selectedSpecialization);
    }
  };

  if (loading) {
    return <h1>Loading</h1>;
  }

  return (
    <div
      onClick={handleClick}
      className="grid grid-col-5 h-60 border-2 rounded-md border-gray-800 bg-gray-500 items-center justify-center hover:cursor-pointer hover:shadow-[0px_6px_12px_6px_rgba(0,_0,_0,_0.45)] transition-shadow p-4"
    >
      {!isCreating && (
        <div className="flex flex-col gap-2">
          <h1 className="text-white">{name}</h1>
          <h1 className="text-white">{program}</h1>
          <h1 className="text-white">{spec}</h1>
          <h1 className="text-white">{id}</h1>
        </div>
      )}

      {isCreating && (
        <form
          onClick={(e) => e.stopPropagation()} // Hindrar att klick i formuläret stänger det
          className="flex flex-col gap-3 w-full"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1">
            <label className="text-white text-sm">Plannamn</label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Skriv namn här..."
              className="p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-400"
              autoFocus
            />
            <label className="text-white text-sm">Inriktning</label>
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-400"
            >
              {specializations.map((spec) => (
                <option
                  key={spec.code}
                  value={spec.code}
                  className="bg-neutral-800 text-white"
                >
                  {spec.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-500"
              onClick={onCancelCreate}
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-500"
            >
              Skapa
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// Dashboard för hemsidan
function Dashboard() {
  const [currentPlans, setCurrentPlans] = useState<MasterPlan[]>([]);
  const { profile, loading } = useUserProfile();
  const { plans, createNewMasterPlan } = useUserPlan();
  const [isCreating, setIsCreating] = useState<boolean>(false);

  useEffect(() => {
    async function loadPlans() {
      setCurrentPlans(plans);
    }
    loadPlans();
  }, [plans]);

  // Hantera sparandet utan att ladda om hela sidan
  const handleSavePlan = async (planName: string, planSpec: string) => {
    const newPlanID = await createNewMasterPlan(planName, planSpec);

    // Uppdatera state direkt
    setCurrentPlans((prevPlans) => [
      ...prevPlans,
      {
        id: newPlanID,
        name: planName,
        specialization: planSpec,
        program: profile.program,
      } as MasterPlan,
    ]);

    setIsCreating(false);
  };

  if (loading) {
    return <h1>Profile is loading1</h1>;
  }

  return (
    <div className="flex items-center flex-col size-full gap-2 p-4">
      <div id="center" className="grid grid-cols-4 h-full w-full gap-4">
        <DashBoardCard
          destinationPage="/planner"
          id="+"
          programCode={profile?.program}
          isCreating={isCreating}
          onStartCreate={() => setIsCreating(true)}
          onCancelCreate={() => setIsCreating(false)}
          onSavePlan={handleSavePlan}
        />
        {currentPlans.map((plan) => (
          <DashBoardCard
            key={plan.id}
            destinationPage={`/planner/${plan.id}`}
            id={plan.id}
            name={plan.name || `Plan: ${plan.id}`}
            spec={plan.specialization}
            program={plan.program}
            programCode={plan.program}
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
