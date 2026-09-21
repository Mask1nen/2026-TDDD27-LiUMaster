import type { Course } from "../types";

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
  isSelected: boolean;
}

//Kurskort som visas i Courseviewer
function CourseCard({ course, onClick, isSelected }: CourseCardProps) {
  const isAdvanced = course.level === "A1N";
  const bgClass = isAdvanced ? "bg-violet-400" : "bg-green-500";

  return (
    <div className="relative w-full h-40">
      <div
        onClick={onClick}
        className={`
                    ${isSelected ? "absolute top-0 left-0 w-full h-min-70 z-30 shadow-2xl scale-105" : "w-full h-full justify-between hover:shadow-white"}
                    transition-all duration-200 border-2 border-neutral-600 shadow-black hover:cursor-pointer ${bgClass}
                    flex flex-col p-2 text-shadow-black text-shadow-md rounded
                `}
      >
        <div className="flex flex-col gap-2 text-md w-full">
          <div className="flex flex-row justify-between">
            <h1 className="font-bold">{course.courseName}</h1>
            <p className="min-w-10 text-end text-sm">{course.mandatory}</p>
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
          <span>Block {course.block}</span>
          <span>{course.credits} HP</span>
        </div>
        {isSelected && (
          <div className="border-t-2 border-black/20 bg-white/20 mt-2">
            <button className="w-full text-center hover:cursor-pointer hover:bg-black/50">
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseCard;
