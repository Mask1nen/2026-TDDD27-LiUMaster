import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import CourseCard from "./coursecard";
import type { Course, MasterPlan } from "../types";
import { MASTERINRIKTNINGAR } from "../types";
import { useUserPlan } from "../hooks/useUserPlan";
import { useProgramCatalog } from "../hooks/useProgramCatalog";
import { useUserProfile } from "../hooks/useUserProfile";
import { evaluateRequirements } from "../requirements";
import UserAvatar from "./useravatar";
import { useNavigate } from "react-router-dom";

interface PlanViewerProps {
  selectedPlan: MasterPlan;
  handleRemoveCourse?: (course: Course) => void;
  isOwner?: boolean;
  canEdit?: boolean;
  onDelete?: () => void;
  onUpdatePlan?: (updatedFields: Partial<MasterPlan>) => void;
}

function PlanViewer({
  selectedPlan,
  handleRemoveCourse,
  isOwner = false,
  canEdit = false,
  onDelete,
  onUpdatePlan,
}: PlanViewerProps) {
  const { unpublishPlan, publishPlan, setPrimaryPlan, clearPrimaryPlan } =
    useUserPlan();
  const { years, loadingYears } = useProgramCatalog(selectedPlan.program);
  const { profile, updateProfile, loadingProfile } = useUserProfile();
  const navigate = useNavigate();

  const programSpecs = MASTERINRIKTNINGAR[selectedPlan.program];
  const isPrimary = profile?.primaryPlanID === selectedPlan.id;

  const [planName, setPlanName] = useState<string>(selectedPlan.name);
  const [planSpec, setPlanSpec] = useState<string>(selectedPlan.specialization);
  const [isPrivate, setIsPrivate] = useState<boolean>(selectedPlan.private);

  // Synka lokala states till databasen
  useEffect(() => {
    setPlanName(selectedPlan.name);
    setPlanSpec(selectedPlan.specialization);
    setIsPrivate(selectedPlan.private);
  }, [selectedPlan.name, selectedPlan.specialization, selectedPlan.private]);

  // Debounce för planName så den inte sparar i databasen vid varje enskilt tangenttryck
  useEffect(() => {
    if (planName === selectedPlan.name || !onUpdatePlan) return;

    const timer = setTimeout(() => {
      onUpdatePlan({ name: planName });
    }, 500); // Vänta 500ms efter sista tecknet

    return () => clearTimeout(timer);
  }, [planName, selectedPlan.name, onUpdatePlan]);

  const programCatalog = useMemo(
    () => years.flatMap((y) => y.courses),
    [years],
  );
  const { unmet } = useMemo(
    () => evaluateRequirements(selectedPlan, programCatalog),
    [selectedPlan],
  );

  const handleSpecChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (!onUpdatePlan) return;
    const newSpec = e.target.value;
    setPlanSpec(newSpec);
    onUpdatePlan({ specialization: newSpec });
  };

  const handlePrivateChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isOwner) {
      const newPrivate = e.target.checked;
      setIsPrivate(newPrivate);

      if (newPrivate) {
        unpublishPlan(selectedPlan);
      } else {
        publishPlan(selectedPlan);
      }
    } else {
      console.error(
        "Användaren är inte ägaren av planen, och kan därför inte ändra publikationsstatus",
      );
    }
  };

  const handlePrimaryChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isOwner || !profile) return;
    const oldPlanID = profile?.primaryPlanID;
    if (e.target.checked) {
      updateProfile({ primaryPlanID: selectedPlan.id });
      setPrimaryPlan(selectedPlan.id, oldPlanID || undefined);
    } else {
      clearPrimaryPlan(selectedPlan.id);
    }
  };

  // Sorteringsfunktion som sorterar perioder efter listan av sorterade perioder för att få kronologisk ordning
  const orderedPeriods: string[] = ["HT 1", "HT 2", "VT 1", "VT 2"];
  const sortPeriods = (periods: string[]) => {
    return periods.sort((a, b) => {
      const idxA = orderedPeriods.indexOf(a);
      const idxB = orderedPeriods.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  };

  // Gruppera kurser enligt: År -> Period -> Block
  const groupedPlan = useMemo(() => {
    const groups: Record<
      string,
      Record<
        string,
        Record<string, { course: Course; offeringIndex: number }[]>
      >
    > = {};

    // Skapa ett tomt schema först, så det finns även utan kurser
    const baseYears = years.map((yr) => yr.year);

    baseYears.forEach((year) => {
      groups[year] = {};
      orderedPeriods.forEach((period) => {
        groups[year][period] = {
          "1": [],
          "2": [],
          "3": [],
          "4": [],
          other: [],
        };
      });
    });

    // Fyll sedan på med kurserna i planen (om det finns några)
    (selectedPlan?.courses ?? []).forEach((course) => {
      let courseYear = "Övrigt";
      for (const yr of years) {
        if (yr.courses.some((c) => c.courseCode === course.courseCode)) {
          courseYear = yr.year;
          break;
        }
      }

      if (!groups[courseYear]) {
        groups[courseYear] = {};
      }

      if (!course.offerings) return;

      course.offerings.forEach((offering, offeringIndex) => {
        const periodLabel = `${offering.termin} ${offering.period}`;

        if (!groups[courseYear][periodLabel]) {
          groups[courseYear][periodLabel] = {
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            other: [],
          };
        }
        const blockKey = offering.block ? offering.block : "other";

        groups[courseYear][periodLabel][blockKey].push({
          course,
          offeringIndex,
        });
      });
    });

    return groups;
  }, [selectedPlan?.courses, years]);

  // Sortera år i kronologisk ordning
  const sortedYears = Object.keys(groupedPlan).sort((a, b) => {
    if (a === "Övrigt") return 1; // Lägg okända kurser sist
    if (b === "Övrigt") return -1;
    return parseInt(a) - parseInt(b);
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  if (loadingYears || loadingProfile) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="w-full pr-4 pl-4 flex flex-col gap-6">
      <div className="flex flex-row gap-2 justify-between min-w-0">
        <div className="flex flex-row w-full min-w-0 justify-between gap-2 items-baseline">
          <div className="flex flex-row rounded-md w-full min-w-0 items-center gap-2">
            {!isOwner && (
              <div className="flex shrink-0">
                <UserAvatar
                  userID={selectedPlan.authorID}
                  pictureSize="w-12 h-12 shrink-0"
                  showTooltip={true}
                  isOwner={false}
                  onClick={() => navigate(`/profile/${selectedPlan.authorID}`)}
                />
              </div>
            )}
            <div className="flex w-full min-w-0 gap-2 items-baseline">
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                onKeyDown={handleKeyDown}
                readOnly={!canEdit}
                placeholder="Namn på plan"
                className="field-sizing-content min-w-32 max-w-xs shrink-0 truncate font-extrabold text-2xl p-2 pl-4 pr-4 rounded border-2 border-themedBorder bg-surface-raised text-content focus:outline-0 focus:border-neutral-500 read-only:cursor-default read-only:focus:border-themedBorder m-1"
              />
              <select
                name="specialization"
                onChange={handleSpecChange}
                value={planSpec}
                disabled={!canEdit}
                className="flex-1 min-w-0 truncate p-2 bg-surface-raised text-content border-2 border-themedBorder rounded-md focus:outline-none focus:border-neutral-500 enabled:cursor-pointer disabled:cursor-default disabled:opacity-100 m-1"
              >
                {programSpecs.map((spec) => (
                  <option
                    key={spec.code}
                    value={spec.code}
                    className="bg-neutral-800 text-content"
                  >
                    {spec.name}
                  </option>
                ))}
              </select>
              {isOwner && canEdit && (
                <label
                  className="shrink-0 inline-flex flex-col items-center gap-1 cursor-pointer has-disabled:cursor-not-allowed has-disabled:opacity-50"
                  title={
                    isPrivate
                      ? "En privat plan kan inte vara primär"
                      : undefined
                  }
                >
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isPrivate}
                    onChange={handlePrivateChange}
                  />
                  <div className="relative w-9 h-5 bg-neutral-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-buffer after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-disabled:peer-checked:bg-neutral-600"></div>
                  <span className="select-none text-sm text-content">
                    Privat
                  </span>
                </label>
              )}

              {isOwner && canEdit && (
                <label
                  className="shrink-0 inline-flex flex-col items-center gap-1 cursor-pointer has-disabled:cursor-not-allowed has-disabled:opacity-50"
                  title={
                    isPrivate
                      ? "En privat plan kan inte vara primär"
                      : undefined
                  }
                >
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isPrimary}
                    disabled={isPrivate}
                    onChange={handlePrimaryChange}
                  />
                  <div className="relative w-9 h-5 bg-neutral-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-buffer after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-disabled:peer-checked:bg-neutral-600"></div>
                  <span className="select-none text-sm text-content">
                    Primär
                  </span>
                </label>
              )}
            </div>
            {isOwner && canEdit && (
              <button
                type="button"
                onClick={onDelete}
                className="p-2 bg-red-700 border-2 border-red-500 shadow-xl rounded-md cursor-pointer min-w-40 hover:bg-red-500 font-semibold text-white"
              >
                Radera plan
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        {unmet.length > 0 && (
          <ul
            role="alert"
            className="flex flex-col gap-1 p-3 rounded-md border-l-4 border-yellow-500 bg-yellow-500/10 text-content"
          >
            {unmet.map((r) => (
              <li key={r.id}>
                {r.label}
                {r.progress && ` (${r.progress.have}/${r.progress.need})`}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-10 w-full p-2">
        {sortedYears.map((year) => {
          const periods = sortPeriods(Object.keys(groupedPlan[year]));

          return (
            <div key={year} className="flex flex-col gap-6">
              <div className="bg-blue-900/30 p-2 rounded-md border-l-4 border-blue-500">
                <h2 className="text-2xl font-bold text-content">År {year}</h2>
              </div>

              {periods.map((period) => (
                <div key={period} className="flex flex-col gap-3 pl-2">
                  <h3 className="text-xl font-bold text-content border-b border-white pb-1">
                    {period}
                  </h3>

                  <div className="grid grid-cols-4 gap-2">
                    {["1", "2", "3", "4"].map((block) => (
                      <div
                        key={block}
                        className="flex flex-col gap-2 border-r border-dashed border-white/50 pr-2 last:border-0 min-h-20"
                      >
                        <h4 className="text-center text-md font-semibold">
                          Block {block}
                        </h4>
                        {groupedPlan[year][period][block].map(
                          ({ course, offeringIndex }, i) => (
                            <CourseCard
                              key={`${course.courseCode}-${offeringIndex}-${i}`}
                              course={course}
                              courseIndex={offeringIndex}
                              inPlan={true}
                              isOwner={isOwner}
                              canEdit={canEdit}
                              onButtonClick={
                                handleRemoveCourse
                                  ? () => handleRemoveCourse(course)
                                  : undefined
                              }
                            />
                          ),
                        )}
                      </div>
                    ))}
                  </div>

                  {groupedPlan[year][period].other.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {groupedPlan[year][period].other.map(
                        ({ course, offeringIndex }, i) => (
                          <CourseCard
                            key={`${course.courseCode}-${offeringIndex}-${i}`}
                            course={course}
                            courseIndex={offeringIndex}
                            inPlan={true}
                            isOwner={isOwner}
                            canEdit={canEdit}
                            onButtonClick={
                              handleRemoveCourse
                                ? () => handleRemoveCourse(course)
                                : undefined
                            }
                          />
                        ),
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlanViewer;
