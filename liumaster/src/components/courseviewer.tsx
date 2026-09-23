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
}

function CourseViewer({
  selectedPlan,
  years,
  handleAddCourse,
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

  // Filtrerar kurserna utifrån vald inriktning på årsnivå
  const filteredYears = useMemo(() => {
    if (selectedSpecialization === "ALL") return years;

    return years.map((yr) => ({
      ...yr,
      courses: yr.courses.filter(
        (c) =>
          c.specialization && c.specialization.includes(selectedSpecialization),
      ),
    }));
  }, [years, selectedSpecialization]);

  // Funktion som sparar både kurs och dess offering-index
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
      <select
        name="specialization"
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setSelectedSpecialization(e.target.value)
        }
        className="w-1/2 p-2 bg-neutral-800 text-white border-2 border-neutral-700 shadow-xl rounded-md cursor-pointer focus:outline-none focus:border-neutral-500"
      >
        <option key="ALL" value="ALL">
          Alla kurser
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

      {filteredYears.map((yr) => {
        const yrGroups = groupByPeriod(yr);

        // Hoppa över året om det inte finns några kurser (bra vid strikta filtreringar)
        if (yr.courses.length === 0) return null;

        return (
          <div key={yr.year} className="flex flex-col gap-4">
            <h1 className="font-bold text-2xl text-blue-400">År {yr.year}</h1>
            {yrGroups.groups.map((grp) => {
              if (grp.items.length === 0) return null;

              return (
                <div key={grp.label} className="flex flex-col gap-3">
                  <h2 className="font-semibold text-lg text-gray-300">
                    {grp.label}
                  </h2>
                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-2">
                    {grp.items.map(({ course, courseIndex }, idx) => {
                      const currentPlan = selectedPlan.courses || [];
                      const inPlan = currentPlan.some(
                        (s) => s.courseCode === course.courseCode,
                      );

                      if (inPlan) return null;
                      return (
                        <div key={`${course.courseCode}-${courseIndex}-${idx}`}>
                          <CourseCard
                            course={course}
                            courseIndex={courseIndex}
                            onButtonClick={() => handleAddCourse(course)}
                            inPlan={inPlan}
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
