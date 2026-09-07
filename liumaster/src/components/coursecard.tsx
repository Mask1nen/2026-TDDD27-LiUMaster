import type { Course } from "../types";

interface CourseCardProps {
    course: Course;
    onClick?: () => void;
	isSelected: boolean;
}

function CourseCard({ course, onClick, isSelected }: CourseCardProps) {
    const isAdvanced = course.Nivå === "A1N";
    const bgClass = isAdvanced ? "bg-violet-400" : "bg-green-500";

    return (
        /* Yttre platshållare som garanterar att grid-cellen inte ändrar storlek */
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
                    <h1 className="font-bold">{course.Kursnamn}</h1>
                    <p>{course.Kurskod}</p>
                </div>

                {isSelected && (
                    <div className="my-2 flex flex-col gap-1 text-sm border-t border-b border-black/20 py-2">
                        <p>{course.Område?.join(", ")}</p>
                        <p>Nivå: {course.Nivå}</p>
                        {course.URL && (
                            <a 
                                href={course.URL} 
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="underline text-blue-200"
                            >
                                {course.URL}
                            </a>
                        )}
                        <p className="mt-1">{course?.["Fri text"]}</p>
                    </div>
                )}

                <div className="flex w-full justify-between text-sm">
                    <span>Block {course.Block}</span>
                    <span>{course.HP} HP</span>
                </div>
            </div>
        </div>
    );
}

export default CourseCard;