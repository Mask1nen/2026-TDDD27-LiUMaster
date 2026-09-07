import type { Course } from "../types";

interface courseOverlayProps {
	course? : Course | null;
	onClose?: () => void;
}

function CourseOverlay(courseProps: courseOverlayProps) {
	if (!courseProps.course) return null;
	const isAdvanced = courseProps.course?.Nivå === "A1N";

	const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Förhindrar att klicket bubblar till bakomliggande kort
    if (courseProps.onClose) courseProps.onClose();
  };

	return (
		<div className="size-full" onClick={handleClick}>
			<div className={`flex flex-col ${isAdvanced ? "bg-violet-400" : "bg-green-500"} p-2 size-full border-2 border-neutral-600 shadow-sm shadow-black`}>
			<h1>{courseProps.course?.Kurskod}</h1>
			<h1>{courseProps.course?.Kursnamn}</h1>
			<h1>{courseProps.course?.HP}HP</h1>
			<div className="flex flex-row">
				<h1>{courseProps.course.Område?.join(", ")}</h1>
			</div>
			<h1>{courseProps.course?.Nivå}</h1>
			<h1>Block {courseProps.course?.Block}</h1>
			<a 
			href={courseProps.course.URL} 
			target="_blank"
			onClick={(e) => e.stopPropagation()}
			className="underline text-blue-400"
			>{courseProps.course.URL}</a>
			<h1>{courseProps.course?.["Fri text"]}</h1>
		</div>
		</div>
	)
}

export default CourseOverlay;