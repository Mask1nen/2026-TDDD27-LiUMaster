import { useMemo } from "react";
import CourseCard from "./coursecard";
import type { Course, MasterPlan, Year } from "../types";
import { MASTERINRIKTNINGAR } from "../types";

interface PlanViewerProps {
  selectedPlan: MasterPlan;
  years: Year[];
  handleRemoveCourse: (course: Course) => void;
  isOwner: boolean;
}

function PlanViewer({
  selectedPlan,
  years,
  handleRemoveCourse,
  isOwner,
}: PlanViewerProps) {
  const programSpecs = MASTERINRIKTNINGAR[selectedPlan.program];
  const foundSpec = programSpecs.find(
    (s) => s.code == selectedPlan.specialization
  );
  const specName = foundSpec?.name;

  // Gruppera kurser enligt: År -> Period -> Block
  const groupedPlan = useMemo(() => {
    const groups: Record<
      string,
      Record<string, Record<string, { course: Course; oIdx: number }[]>>
    > = {};

    if (!selectedPlan?.courses) return groups;

    selectedPlan.courses.forEach((course) => {
      // Hitta vilket år kursen tillhör genom att leta i kurskatalogen (years)
      let courseYear = "Övrigt";
      for (const yr of years) {
        if (yr.courses.some((c) => c.courseCode === course.courseCode)) {
          courseYear = yr.year;
          break;
        }
      }

      // Skapa årsobjektet om det inte finns
      if (!groups[courseYear]) {
        groups[courseYear] = {};
      }

      if (!course.offerings) return;

      course.offerings.forEach((offering, oIdx) => {
        const periodLabel = `${offering.termin} ${offering.period}`;

        // Skapa perioden om den inte finns under aktuellt år
        if (!groups[courseYear][periodLabel]) {
          groups[courseYear][periodLabel] = {
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            other: [],
          };
        }

        const blockMatch = String(offering.block).match(/[1-4]/);
        const blockKey = blockMatch ? blockMatch[0] : "other";

        groups[courseYear][periodLabel][blockKey].push({ course, oIdx });
      });
    });

    return groups;
  }, [selectedPlan?.courses, years]);

  // Sorteringshjälp för år
  const sortedYears = Object.keys(groupedPlan).sort((a, b) => {
    if (a === "Övrigt") return 1; // Lägg okända kurser sist
    if (b === "Övrigt") return -1;
    return parseInt(a) - parseInt(b);
  });

  // Sorteringshjälp för perioder
  const orderedPeriods = ["HT 1", "HT 2", "VT 1", "VT 2"];
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

  return (
    <div className="w-1/2 pr-4 flex flex-col gap-6">
      <div className="flex flex-row justify-between gap-2">
        <div className="flex flex-row gap-2 bg-neutral-800 text-white border-2 border-neutral-700 p-1 rounded-md items-baseline w-full">
          <h1 className="text-2xl font-bold">{selectedPlan.name}</h1>
          {selectedPlan.private ? <h3>Privat</h3> : <h3>Offentlig</h3>}
          <h3>{specName}</h3>
        </div>
        <button className="items-center justify-center border-2 border-neutral-700 p-1 pl-2 pr-2 rounded-md hover:cursor-pointer hover:bg-blue-700/50">
          Redigera
        </button>
      </div>

      {selectedPlan?.courses && selectedPlan.courses.length > 0 ? (
        <div className="flex flex-col gap-10 w-full p-2">
          {sortedYears.map((year) => {
            const periods = sortPeriods(Object.keys(groupedPlan[year]));

            return (
              <div key={year} className="flex flex-col gap-6">
                <div className="bg-blue-900/30 p-2 rounded-md border-l-4 border-blue-500">
                  <h2 className="text-2xl font-bold text-white">År {year}</h2>
                </div>

                {periods.map((period) => (
                  <div key={period} className="flex flex-col gap-3 pl-2">
                    <h3 className="text-xl font-bold text-white border-b border-gray-600 pb-1">
                      {period}
                    </h3>

                    <div className="grid grid-cols-4 gap-2">
                      {["1", "2", "3", "4"].map((block) => (
                        <div
                          key={block}
                          className="flex flex-col gap-2 border-r border-dashed border-gray-600/50 pr-2 last:border-0 min-h-20"
                        >
                          <h4 className="text-center text-md font-semibold">
                            Block {block}
                          </h4>
                          {groupedPlan[year][period][block].map(
                            ({ course, oIdx }, i) => (
                              <CourseCard
                                key={`${course.courseCode}-${oIdx}-${i}`}
                                course={course}
                                courseIndex={oIdx}
                                inPlan={true}
                                isOwner={isOwner}
                                onButtonClick={() => handleRemoveCourse(course)}
                              />
                            )
                          )}
                        </div>
                      ))}
                    </div>

                    {groupedPlan[year][period].other.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {groupedPlan[year][period].other.map(
                          ({ course, oIdx }, i) => (
                            <CourseCard
                              key={`${course.courseCode}-${oIdx}-${i}`}
                              course={course}
                              courseIndex={oIdx}
                              inPlan={true}
                              isOwner={isOwner}
                              onButtonClick={() => handleRemoveCourse(course)}
                            />
                          )
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="size-full mt-4">
          <h1 className="text-white text-lg">
            Inga kurser tillagda i denna plan!
          </h1>
        </div>
      )}
    </div>
  );
}

export default PlanViewer;
