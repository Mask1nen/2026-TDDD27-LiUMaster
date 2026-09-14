import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase.ts";
import { useState, useEffect } from "react";

import type { Course, Year, Semester, Period, YearGroups } from "../types.ts";
import CourseCard from "./coursecard.tsx";

//Returnerar termin och period i ett format som känns igen av studenter, t.ex. HT1 för period 1 i HT
function getPeriodLabel(semester: string, period: string): string {
  return `${semester}${period}`;
}

//Skapar ett värde för termin och period som kan användas av sort-funktionen vid visning av kurser.
function semesterSortKey(year: string, semester: string): number {
  const yearNum = parseInt(year, 10);
  return yearNum * 2 + (semester === "VT" ? 0 : 1);
}

//Sorterar år och termin/period i kronologisk ordning, används vid visning av kurser.
function groupBySemesterPeriod(yr: Year): YearGroups {
  const groups = yr.semesters.flatMap((sem) =>
    sem.periods.map((per) => ({
      label: getPeriodLabel(sem.semester, per.period),
      sortKey:
        semesterSortKey(yr.year, sem.semester) * 100 +
        (parseInt(per.period, 10) || 0),
      courses: per.courses.map((c) => ({
        ...c,
        semesterLabel: sem.semester,
      })),
    })),
  );

  groups.sort((a, b) => a.sortKey - b.sortKey);

  return { year: yr.year, groups };
}

interface coursePlanProps {
  planID: string;
}

//Visar kurser och filtrerar kring olika inriktningar.
function CourseViewer({ planID }: coursePlanProps) {
  const [years, setYears] = useState<Year[]>([]);
  const [programCode, setprogramCode] = useState<string>("");
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);

  useEffect(() => {
    async function fetchCurriculum(programCode: string) {
      if (!programCode) return;

      const programRef = doc(db, "programs", programCode);
      const yearsSnap = await getDocs(collection(programRef, "years"));

      const yearPromises = yearsSnap.docs.map(async (yearDoc) => {
        const semestersSnap = await getDocs(
          collection(yearDoc.ref, "semesters"),
        );

        const semesterPromises = semestersSnap.docs.map(async (semDoc) => {
          const periodsSnap = await getDocs(collection(semDoc.ref, "periods"));

          const periodPromises = periodsSnap.docs.map(async (periodDoc) => {
            const coursesSnap = await getDocs(
              collection(periodDoc.ref, "courses"),
            );
            const courses = coursesSnap.docs.map((c) => c.data() as Course);

            return { period: periodDoc.id, courses };
          });

          const periodData = await Promise.all(periodPromises);
          periodData.sort((a, b) => a.period.localeCompare(b.period));

          return { semester: semDoc.id, periods: periodData };
        });

        const semesterData = await Promise.all(semesterPromises);
        semesterData.sort(
          (a, b) =>
            semesterSortKey(yearDoc.id, a.semester) -
            semesterSortKey(yearDoc.id, b.semester),
        );

        return { year: yearDoc.id, semesters: semesterData };
      });

      const yearData = await Promise.all(yearPromises);
      yearData.sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));

      setYears(yearData);
    }

    fetchCurriculum(programCode);
  }, [programCode]);

  function handleClickCard(course: Course) {
    if (currentCourse?.Kurskod === course.Kurskod) {
      setCurrentCourse(null);
    } else {
      setCurrentCourse(course);
    }
  }

  return (
    <div>
      <h1>This is showing plan with planID: {planID}</h1>
      <div className="flex flex-col p-4">
        {/* Programvalsknappar */}
        <div className="flex w-full gap-2 pb-4">
          <button
            onClick={() => setprogramCode("6CDDD")}
            className="flex items-center justify-center bg-[#98E5EB] hover:bg-blue-500/50 hover:cursor-pointer p-2 border-2 border-neutral-600 shadow-sm text-black"
          >
            6CDDD
          </button>
          <button
            onClick={() => setprogramCode("6CMJU")}
            className="flex items-center justify-center bg-[#98E5EB] hover:bg-blue-500/50 hover:cursor-pointer p-2 border-2 border-neutral-600 shadow-sm text-black"
          >
            6CMJU
          </button>
        </div>

        {/* Kursplaneraren och Kursvisaren, sammansatt just nu men ska flyttas isär */}
        <div className="flex flex-row w-full gap-6">
          {/* Kursplaneraren, inte implementerad */}
          <div className="w-1/3 border-r pr-4">
            <h1 className="font-bold text-lg">Valda kurser / Innehav</h1>
          </div>

          {/* Kursvisaren, visar alla kurser från databasen. Ska kunna filtrera på inritkningskurser */}
          <div className="flex flex-col gap-8 w-2/3">
            {years.map((yr) => {
              const yrGroups = groupBySemesterPeriod(yr);
              return (
                <div key={yr.year} className="flex flex-col gap-4">
                  <h1 className="font-bold text-2xl">År {yr.year}</h1>
                  {yrGroups.groups.map((grp) => (
                    <div key={grp.label} className="flex flex-col gap-3">
                      <h2 className="font-semibold text-lg">{grp.label}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {grp.courses.map((course, idx) => {
                          const isSelected =
                            currentCourse?.Kurskod === course.Kurskod;
                          return (
                            <div>
                              <CourseCard
                                key={`${course.Kurskod}-${idx}`}
                                course={course}
                                onClick={() => handleClickCard(course)}
                                isSelected={isSelected}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseViewer;
