import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { useUserProfile } from "../helpers/useUserProfile";
import { useUserPlan } from "../helpers/useUserPlan";
import { MASTERINRIKTNINGAR, type MasterPlan } from "../types";

const INITIAL_FORM_STATE = {
  name: "",
  selectedSpecialization: "",
  private: false,
};

type CreateNewPlanCardProps = {
  program: string;
};

export function CreateNewPlanCard({ program }: CreateNewPlanCardProps) {
  const { createNewMasterPlan } = useUserPlan();

  const specializations = program ? MASTERINRIKTNINGAR[program] : [];
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Hantera sparandet utan att ladda om hela sidan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); //Förhindra att sidan laddas om när man klickar på submit
    const newPlanID = await createNewMasterPlan(
      formData.name,
      formData.selectedSpecialization,
      formData.private,
      program,
    );

    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setFormData(INITIAL_FORM_STATE);
  };

  return (
    <div className="h-60 border-2 rounded-md border-gray-800 bg-gray-500 items-center justify-center hover:cursor-pointer hover:shadow-[0px_6px_12px_6px_rgba(0,0,0,0.45)] transition-shadow p-4">
      {!isCreating && (
        <div
          className="flex size-full items-center justify-center"
          onClick={() => setIsCreating(true)}
        >
          <h1 className="size-fit text-7xl text-white">+</h1>
        </div>
      )}
      {isCreating && (
        <div>
          <form
            onClick={(e) => e.stopPropagation()} // Hindrar att klick i formuläret stänger det
            className="flex flex-col gap-3 w-full"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-1">
              <label className="text-white text-sm">Plannamn</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Skriv namn här..."
                className="p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-400"
                autoFocus
              />
              <label className="text-white text-sm">Inriktning</label>
              <select
                value={formData.selectedSpecialization}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    selectedSpecialization: e.target.value,
                  })
                }
                className="p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-400"
              >
                <option value="" selected disabled hidden>
                  Välj master
                </option>
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

              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value=""
                  className="sr-only peer"
                  checked={formData.private}
                  onChange={(e) =>
                    setFormData({ ...formData, private: e.target.checked })
                  }
                />
                <div className="relative w-9 h-5 bg-gray-900 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-buffer after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="select-none ms-3 text-sm font-medium text-heading">
                  Privat
                </span>
              </label>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-500"
                onClick={handleCancel}
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
        </div>
      )}
    </div>
  );
}

type DashboardCardProps = {
  id: string;
  destinationPage?: string;
  plan: MasterPlan;
};

// Kort som används i dashboard för att visa skapade planer
export function DashboardCard({
  id,
  destinationPage,
  plan,
}: DashboardCardProps) {
  const navigate = useNavigate();
  const { loading } = useUserProfile();
  const programSpecs = MASTERINRIKTNINGAR[plan.program];
  const foundSpec = programSpecs.find((s) => s.code == plan.specialization);
  const specName = foundSpec?.name;

  const handleClick = () => {
    navigate(`${destinationPage}`);
  };
  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div
      onClick={handleClick}
      className="h-60 border-2 rounded-md border-gray-800 bg-blue-950 items-center justify-center hover:cursor-pointer hover:shadow-[0px_6px_12px_6px_rgba(0,0,0,0.45)] transition-shadow p-4"
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex gap-2 justify-between">
          <div>
            <h1 className="text-white text-3xl">{plan.name}</h1>
            {plan.private && <h1>Private</h1>}
            {!plan.private && <h1>Public</h1>}
          </div>
          <h1 className="text-white">{plan.program}</h1>
        </div>
        <div>
          <h1 className="text-white">{specName}</h1>
        </div>
      </div>
    </div>
  );
}

export default { DashboardCard, CreateNewPlanCard };
