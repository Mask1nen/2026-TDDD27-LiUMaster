import type { Course } from "../types";

interface CourseCardProps {
    course: Course;
    onClick?: () => void;
}

function CourseCard(courseProps: CourseCardProps) {
	const isAdvanced = courseProps.course.Nivå === "A1N";

	return (
		<div
			onClick={courseProps.onClick}
			className={`flex items-center justify-center hover:bg-blue-500/50 ${isAdvanced ? "bg-violet-400" : "bg-green-500"} hover:cursor-pointer w-full h-40 border-2 border-neutral-600 shadow-sm shadow-black`}
		>
			<div className="flex flex-col gap-2 p-2 pt-1 pb-1 items-center size-full justify-between text-shadow-black text-shadow-md">
				<div className="flex flex-col gap-2 text-md w-full">
					<h1>{courseProps.course.Kursnamn}</h1>
					<h1>{courseProps.course.Kurskod}</h1>
				</div>
				<div className="flex w-full justify-between p-1 text-sm">
					<h2>
						Block {courseProps.course.Block}
					</h2>
					<h2>{courseProps.course.HP}HP</h2>
				</div>
			</div>
		</div>
	);
}

export default CourseCard;