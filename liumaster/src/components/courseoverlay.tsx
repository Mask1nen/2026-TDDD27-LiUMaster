import type { Course } from "../types";

function CourseOverlay(course : Course) {
	return (
		<div className="size-screen bg-black/50">
			<div className="flex flex-col size-1/3 bg-gray-900">
			<h1>{course.Kurskod}</h1>
			<h1>{course.Kursnamn}</h1>
			<h1>{course.HP}</h1>
			<h1>{course.Område}</h1>
			<h1>{course.Nivå}</h1>
			<h1>{course.Block}</h1>
			<h1>{course.URL}</h1>
			<h1>{course["Fri text"]}</h1>
		</div>
		</div>
	)
}

export default CourseOverlay;