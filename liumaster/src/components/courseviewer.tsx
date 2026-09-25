import { useState, useMemo } from "react";
import type { ChangeEvent } from "react";
import {
  type Course,
  type MasterPlan,
  type Year,
  MASTERINRIKTNINGAR,
} from "../types.ts";
import CourseCard from "./coursecard.tsx";

interface CourseViewerProps {
  selectedPlan: MasterPlan;
  years: Year[];
  handleAddCourse: (course: Course) => void;
  isOwner: boolean;
}

function CourseViewer({
  selectedPlan,
  years,
  handleAddCourse,
  isOwner,
}: CourseViewerProps) {
  if (!selectedPlan) {
    return <div className="text-white">Laddar kursplan...</div>;
  }

  const programCode = selectedPlan.program;
  const specializations = programCode
    ? MASTERINRIKTNINGAR[programCode] || []
    : [];

  const [selectedSpecialization, setSelectedSpecialization] =
    useState<string>("ALL");
  const [selectedTerm, setSelectedTerm] = useState<string>("ALL");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("ALL");
  const [selectedBlock, setSelectedBlock] = useState<string>("ALL");

  // Filtrerar kurserna utifrån inriktning, termin, period och block
  const filteredYears = useMemo(() => {
    return years.map((yr) => ({
      ...yr,
      courses: yr.courses.filter((c) => {
        const matchesSpec =
          selectedSpecialization === "ALL" ||
          (c.specialization &&
            c.specialization.includes(selectedSpecialization));

        const matchesTermPeriodAndBlock =
          (selectedTerm === "ALL" &&
            selectedPeriod === "ALL" &&
            selectedBlock === "ALL") ||
          (c.offerings &&
            c.offerings.some((offering) => {
              const matchTerm =
                selectedTerm === "ALL" || offering.termin === selectedTerm;
              const matchPeriod =
                selectedPeriod === "ALL" ||
                String(offering.period) === selectedPeriod;

              const matchBlock =
                selectedBlock === "ALL" ||
                String(offering.block) === selectedBlock;

              return matchTerm && matchPeriod && matchBlock;
            }));

        return matchesSpec && matchesTermPeriodAndBlock;
      }),
    }));
  }, [
    years,
    selectedSpecialization,
    selectedTerm,
    selectedPeriod,
    selectedBlock,
  ]);

  function groupByPeriod(yr: Year) {
    const groupMap: Record<string, { course: Course; courseIndex: number }[]> =
      {
        "HT 1": [],
        "HT 2": [],
        "VT 1": [],
        "VT 2": [],
      };

    yr.courses.forEach((course) => {
      if (course.offerings && Array.isArray(course.offerings)) {
        course.offerings.forEach((offering, index) => {
          const label = `${offering.termin} ${offering.period}`;

          if (selectedTerm !== "ALL" && offering.termin !== selectedTerm)
            return;
          if (
            selectedPeriod !== "ALL" &&
            String(offering.period) !== selectedPeriod
          )
            return;

          if (
            selectedBlock !== "ALL" &&
            String(offering.block) !== selectedBlock
          )
            return;

          if (!groupMap[label]) {
            groupMap[label] = [];
          }
          groupMap[label].push({ course, courseIndex: index });
        });
      }
    });

    const groups = Object.entries(groupMap).map(([label, items]) => ({
      label,
      items,
    }));

    return { groups };
  }

  return (
    <div className="flex flex-col gap-8 text-white">
      <div className="flex flex-row gap-4 flex-wrap">
        <select
          name="specialization"
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setSelectedSpecialization(e.target.value)
          }
          className="w-1/4 p-2 bg-neutral-800 text-white border-2 border-neutral-700 rounded-md cursor-pointer focus:outline-none focus:border-neutral-500"
        >
          <option key="ALL" value="ALL">
            Alla inriktningar
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

        <select
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setSelectedTerm(e.target.value)
          }
          className="w-1/6 p-2 bg-neutral-800 text-white border-2 border-neutral-700 rounded-md cursor-pointer focus:outline-none focus:border-neutral-500"
        >
          <option value="ALL">Alla terminer</option>
          <option value="HT">HT</option>
          <option value="VT">VT</option>
        </select>

        <select
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setSelectedPeriod(e.target.value)
          }
          className="w-1/6 p-2 bg-neutral-800 text-white border-2 border-neutral-700 rounded-md cursor-pointer focus:outline-none focus:border-neutral-500"
        >
          <option value="ALL">Alla perioder</option>
          <option value="1">Period 1</option>
          <option value="2">Period 2</option>
        </select>

        <select
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setSelectedBlock(e.target.value)
          }
          className="w-1/6 p-2 bg-neutral-800 text-white border-2 border-neutral-700 rounded-md cursor-pointer focus:outline-none focus:border-neutral-500"
        >
          <option value="ALL">Alla block</option>
          <option value="1">Block 1</option>
          <option value="2">Block 2</option>
          <option value="3">Block 3</option>
          <option value="4">Block 4</option>
        </select>
      </div>

      {filteredYears.map((yr) => {
        const yrGroups = groupByPeriod(yr);

        if (yr.courses.length === 0) return null;

        return (
          <div key={yr.year} className="flex flex-col gap-4">
            <div className="bg-blue-900/30 p-2 rounded-md border-l-4 border-blue-500">
              <h2 className="text-2xl font-bold text-white">År {yr.year}</h2>
            </div>
            {yrGroups.groups.map((grp) => {
              if (grp.items.length === 0) return null;

              return (
                <div key={grp.label} className="flex flex-col gap-3">
                  <h2 className="font-bold text-xl">{grp.label}</h2>
                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-2">
                    {grp.items.map(({ course, courseIndex }, idx) => {
                      const currentPlan = selectedPlan.courses || [];
                      const inPlan = currentPlan.some(
                        (s) => s.courseCode === course.courseCode
                      );

                      if (inPlan) return null;
                      return (
                        <div key={`${course.courseCode}-${courseIndex}-${idx}`}>
                          <CourseCard
                            course={course}
                            courseIndex={courseIndex}
                            onButtonClick={() => handleAddCourse(course)}
                            inPlan={inPlan}
                            isOwner={isOwner}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default CourseViewer;
