import { useState } from "react";
import type { Course } from "../types";

interface CourseCardProps {
  course: Course;
  courseIndex: number;
  onClick?: () => void;
  onButtonClick?: (course: Course) => void;
  inPlan: boolean;
  isOwner: boolean;
}

// Kurskort som visas i Courseviewer
function CourseCard({
  course,
  courseIndex,
  onButtonClick,
  inPlan,
  isOwner,
}: CourseCardProps) {
  const isAdvanced = course.level[0] === "A";
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const bgClass = isAdvanced
    ? "border-l-5 border-l-amber-400"
    : "border-l-5 border-l-blue-400";

  return (
    <div className="relative w-full h-40">
      <div
        onClick={() => setIsSelected(!isSelected)}
        className={`
          ${
            isSelected
              ? "absolute top-0 left-0 w-full h-min-70 z-50 shadow-2xl scale-105"
              : "w-full h-full justify-between hover:shadow-white"
          }
          transition-all bg-neutral-700 duration-200 shadow-black hover:cursor-pointer ${bgClass}
          flex flex-col p-2 text-shadow-black text-shadow-md rounded-lg overflow-hidden relative text-lg
        `}
      >
        <div className="flex flex-col gap-2 text-md w-full">
          <div className="flex flex-row justify-between">
            <h1 className="font-bold">{course.courseName}</h1>
          </div>
          <p>{course.courseCode}</p>
        </div>

        {isSelected && (
          <div className="my-2 flex flex-col gap-1 text-sm border-t border-b border-black/20 py-2">
            <p>{course.subjectAreas?.join(", ")}</p>
            <p>Nivå: {course.level}</p>
            {course.url && (
              <a
                href={course.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="underline text-blue-200"
              >
                {course.url}
              </a>
            )}
            <p className="mt-1">{course?.freeText}</p>
          </div>
        )}

        <div className="flex w-full justify-between text-sm">
          <span>{course.credits} HP</span>
          {!inPlan && <span>Block {course.offerings[courseIndex].block}</span>}
        </div>

        {isSelected && isOwner && (
          <div
            className={`
              ${inPlan ? "bg-red-600" : "bg-green-600"} border-black/20 mt-2
            `}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onButtonClick?.(course);
              }}
              className="w-full text-center hover:cursor-pointer hover:bg-black/50"
            >
              {!inPlan && <h1>+</h1>}
              {inPlan && <h1>-</h1>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseCard;
