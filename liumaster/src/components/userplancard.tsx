import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { useUserPlan } from "../hooks/useUserPlan";
import { MASTERINRIKTNINGAR, type MasterPlan } from "../types";

const INITIAL_FORM_STATE = {
  name: "",
  selectedSpecialization: "",
  private: false,
};

type CreateNewPlanCardProps = {
  program?: string;
};

export function CreateNewPlanCard({ program }: CreateNewPlanCardProps) {
  const { createNewMasterPlan } = useUserPlan();

  const specializations = program ? MASTERINRIKTNINGAR[program] : [];
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hantera sparandet utan att ladda om hela sidan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); //Förhindra att sidan laddas om när man klickar på submit
    if (!program || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createNewMasterPlan(
        formData.name,
        formData.selectedSpecialization,
        formData.private,
        program,
      );
      setFormData(INITIAL_FORM_STATE);
      setIsCreating(false);
    } catch (error) {
      console.error("Misslyckades med att skapa en ny plan.", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setFormData(INITIAL_FORM_STATE);
  };

  return (
    <div className="h-60 p-4 rounded-md bg-surface-raised items-center justify-center hover:cursor-pointer hover:text-cyan-500">
      {!isCreating && (
        <div
          className="flex size-full items-center justify-center"
          onClick={() => setIsCreating(true)}
        >
          <h1 className="size-fit text-7xl">+</h1>
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
              <label className="text-content text-sm">Namn på plan</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Skriv namn här..."
                className="p-2 rounded bg-surface-raised border border-neutral-500 text-content focus:outline-none focus:border-blue-400"
                autoFocus
              />
              <label className="text-content text-sm">Inriktning</label>
              <select
                value={formData.selectedSpecialization}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    selectedSpecialization: e.target.value,
                  })
                }
                required
                className="p-2 rounded bg-surface-raised border border-neutral-500 text-content focus:outline-none focus:border-blue-400"
              >
                <option value="" disabled hidden>
                  Välj master
                </option>
                {specializations.map((spec) => (
                  <option
                    key={spec.code}
                    value={spec.code}
                    className=" text-white"
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
                <div className="relative w-9 h-5 bg-neutral-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-buffer after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="select-none ms-3 text-sm text-content">
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

type UserPlanCardProps = {
  destinationPage?: string;
  plan: MasterPlan;
  authorName: string;
  isActive?: boolean;
};

// Kort som används i dashboard för att visa skapade planer
export function UserPlanCard({
  destinationPage,
  plan,
  authorName,
  isActive = false,
}: UserPlanCardProps) {
  const navigate = useNavigate();
  const programSpecs = MASTERINRIKTNINGAR[plan.program];
  const foundSpec = programSpecs.find((s) => s.code == plan.specialization);
  const specName = foundSpec?.name;

  const handleClick = () => {
    navigate(`${destinationPage}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`h-60 p-4 rounded-xl border-2 text-content ${isActive ? "border-4 border-cyan-500 bg-cyan-500/50" : "border-neutral-700 bg-surface-raised"} items-center justify-center hover:cursor-pointer hover:text-cyan-500`}
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex gap-2 justify-between">
          <div>
            <h1 className="text-3xl font-bold">{plan.name}</h1>
            <h1 className="text-content">{authorName}</h1>
            {}
          </div>
          <h1 className="text-content">{plan.program}</h1>
        </div>
        <div className="flex justify-between">
          <h1 className="text-content">{specName}</h1>
          {plan.private ? (
            <h1 className="text-content">Privat</h1>
          ) : (
            <h1 className="text-content">Offentlig</h1>
          )}
        </div>
      </div>
    </div>
  );
}

export default { UserPlanCard, CreateNewPlanCard };
