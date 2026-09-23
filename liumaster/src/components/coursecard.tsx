import { useState } from "react";
import type { Course } from "../types";

interface CourseCardProps {
  course: Course;
  courseIndex: number;
  onClick?: () => void;
  onButtonClick: (course: Course) => void;
  inPlan: boolean;
}

// Kurskort som visas i Courseviewer
function CourseCard({
  course,
  courseIndex,
  onButtonClick,
  inPlan,
}: CourseCardProps) {
  const isAdvanced = course.level === "A1N";
  let triangleColour = "bg-transparent";
  switch (course.mandatory) {
    case "O":
      triangleColour = "bg-red-600";
      break;
    case "O/V":
      triangleColour = "bg-yellow-300";
      break;
    case "":
      triangleColour = "bg-transparent";
  }
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const bgClass = isAdvanced ? "bg-violet-400" : "bg-green-500";

  return (
    <div className="relative w-full h-40">
      <div
        onClick={() => setIsSelected(!isSelected)}
        className={`
          ${isSelected ? "absolute top-0 left-0 w-full h-min-70 z-50 shadow-2xl scale-105" : "w-full h-full justify-between hover:shadow-white"}
          transition-all duration-200 border-2 border-neutral-600 shadow-black hover:cursor-pointer ${bgClass}
          flex flex-col p-2 text-shadow-black text-shadow-md rounded overflow-hidden relative text-lg
        `}
      >
        {/* Röd triangel i övre högra hörnet om kursen är obligatorisk */}
        {course.mandatory && (
          <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none z-20">
            <div
              className={`absolute -top-4 -right-4 w-8 h-8 ${triangleColour} rotate-45`}
            />
          </div>
        )}

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

        {isSelected && (
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
