import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase.ts";
import { useState, useEffect, useMemo } from "react";
import type { ChangeEvent } from "react";

import {
  type Course,
  type MasterPlan,
  type Year,
  type YearGroups,
  MASTERINRIKTNINGAR,
} from "../types.ts";
import CourseCard from "./coursecard.tsx";
import { useUserProfile } from "../helpers/useUserProfile.ts";

// Sorteringsnyckel för perioder (t.ex. HT1, HT2, VT1, VT2)
function periodSortKey(year: string, periodId: string): number {
  const yearNum = parseInt(year, 10);
  const isHT = periodId.startsWith("HT");
  const periodNum = parseInt(periodId.replace(/\D/g, ""), 10) || 1;

  // VT = 0, HT = 10
  const semesterOffset = isHT ? 10 : 0;
  return yearNum * 100 + semesterOffset + periodNum;
}

// Grupperar och sorterar perioder kronologiskt
function groupByPeriod(yr: Year): YearGroups {
  const groups = yr.periods.map((per) => ({
    label: per.period,
    sortKey: periodSortKey(yr.year, per.period),
    courses: per.courses.map((c) => ({
      ...c,
      semesterLabel: per.period.substring(0, 2),
    })),
  }));

  groups.sort((a, b) => a.sortKey - b.sortKey);

  return { year: yr.year, groups };
}

interface CourseViewerProps {
  selectedPlan: MasterPlan;
}

function CourseViewer({ selectedPlan }: CourseViewerProps) {
  const [years, setYears] = useState<Year[]>([]);
  const programCode = selectedPlan.program;
  const specializations = programCode
    ? MASTERINRIKTNINGAR[programCode] || []
    : [];
  const [selectedSpecialization, setSelectedSpecialization] =
    useState<string>("ALL");
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);

  useEffect(() => {
    async function fetchCurriculum() {
      if (!programCode) return;

      const programRef = doc(db, "programs", programCode);
      const yearsSnap = await getDocs(collection(programRef, "years"));

      const yearPromises = yearsSnap.docs.map(async (yearDoc) => {
        // Hämtar perioder (HT1, HT2, VT1, VT2) direkt under varje år
        const periodsSnap = await getDocs(collection(yearDoc.ref, "periods"));

        const periodPromises = periodsSnap.docs.map(async (periodDoc) => {
          const coursesSnap = await getDocs(
            collection(periodDoc.ref, "courses"),
          );
          const courses = coursesSnap.docs.map((c) => c.data() as Course);

          return { period: periodDoc.id, courses };
        });

        const periodData = await Promise.all(periodPromises);
        periodData.sort(
          (a, b) =>
            periodSortKey(yearDoc.id, a.period) -
            periodSortKey(yearDoc.id, b.period),
        );

        return { year: yearDoc.id, periods: periodData };
      });

      const yearData = await Promise.all(yearPromises);
      yearData.sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));

      setYears(yearData);
    }

    fetchCurriculum();
  }, [programCode]);

  // Filtrerar kurserna utifrån vald inriktning
  const filteredYears = useMemo(() => {
    if (selectedSpecialization === "ALL") return years;

    return years.map((yr) => ({
      ...yr,
      periods: yr.periods.map((per) => ({
        ...per,
        courses: per.courses.filter(
          (c) =>
            c.specialization &&
            c.specialization.includes(selectedSpecialization),
        ),
      })),
    }));
  }, [years, selectedSpecialization]);

  function handleClickCard(course: Course) {
    if (currentCourse?.courseCode === course.courseCode) {
      setCurrentCourse(null);
    } else {
      setCurrentCourse(course);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <select
        name="specialization"
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setSelectedSpecialization(e.target.value)
        }
        className="w-3/11 p-2 bg-neutral-800 text-white border-2 border-neutral-700 shadow-xl rounded-md cursor-pointer focus:outline-none focus:border-neutral-500"
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
      {filteredYears.map((yr) => {
        const yrGroups = groupByPeriod(yr);
        return (
          <div key={yr.year} className="flex flex-col gap-4">
            <h1 className="font-bold text-2xl">År {yr.year}</h1>
            {yrGroups.groups.map((grp) => {
              // Dölj tomma perioder vid filtrering
              if (grp.courses.length === 0) return null;

              return (
                <div key={grp.label} className="flex flex-col gap-3">
                  <h2 className="font-semibold text-lg">{grp.label}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {grp.courses.map((course, idx) => {
                      const isSelected =
                        currentCourse?.courseCode === course.courseCode;
                      return (
                        <div key={`${course.courseCode}-${idx}`}>
                          <CourseCard
                            course={course}
                            onClick={() => handleClickCard(course)}
                            isSelected={isSelected}
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
