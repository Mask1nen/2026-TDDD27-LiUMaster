import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase.ts";
import { useState, useEffect, useMemo } from "react";
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
  handleAddCourse: (course: Course) => void;
}

function CourseViewer({ selectedPlan, handleAddCourse }: CourseViewerProps) {
  if (!selectedPlan) {
    return <div className="text-white">Laddar kursplan...</div>;
  }
  const [years, setYears] = useState<Year[]>([]);
  const programCode = selectedPlan.program;
  const specializations = programCode
    ? MASTERINRIKTNINGAR[programCode] || []
    : [];
  const [selectedSpecialization, setSelectedSpecialization] =
    useState<string>("ALL");

  useEffect(() => {
    async function fetchCurriculum() {
      if (!programCode) return;

      const programRef = doc(db, "programs", programCode);
      const yearsSnap = await getDocs(collection(programRef, "years"));

      const yearPromises = yearsSnap.docs.map(async (yearDoc) => {
        const coursesSnap = await getDocs(collection(yearDoc.ref, "courses"));
        const courses = coursesSnap.docs.map((c) => c.data() as Course);

        return { year: yearDoc.id, courses };
      });

      const yearData = await Promise.all(yearPromises);
      yearData.sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));

      setYears(yearData);
    }

    fetchCurriculum();
  }, [programCode]);

  // Uppdaterad funktion som sparar både kurs och dess offering-index
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

  return (
    <div className="flex flex-col gap-8">
      <select
        name="specialization"
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setSelectedSpecialization(e.target.value)
        }
        className="w-3/11 p-2 bg-neutral-800 text-white border-2 border-neutral-700 shadow-xl rounded-md cursor-pointer focus:outline-none focus:border-neutral-500"
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
        return (
          <div key={yr.year} className="flex flex-col gap-4">
            <h1 className="font-bold text-2xl">År {yr.year}</h1>
            {yrGroups.groups.map((grp) => {
              // Dölj tomma perioder vid filtrering
              if (grp.items.length === 0) return null;

              return (
                <div key={grp.label} className="flex flex-col gap-3">
                  <h2 className="font-semibold text-lg">{grp.label}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
