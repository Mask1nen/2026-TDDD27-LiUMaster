import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase.ts";
import { useState, useEffect } from "react";

interface Course {
	courseCode: string;
	courseName: string;
	credits: string;
	level: string;
	block: string;
}

interface Period {
	period: string;
	courses: Course[]; // all courses offered in this period (from the program's master curriculum)
}

interface Semester {
	semester: string;
	periods: Period[];
}

type CourseCardProps = {
	courseCode: string;
	courseName: string;
	courseMarks: string;
	courseDifficulty: string;
	courseSemester: string;
	coursePeriod: string;
	courseBlock: string;
};

function CourseCard({
	courseCode,
	courseName,
	courseMarks,
	courseDifficulty,
	courseSemester,
	coursePeriod,
	courseBlock,
}: CourseCardProps) {
	const [showCourseOverlay, setshowCourseOverlay] = useState(false);
	const isAdvanced = courseDifficulty === "A1N";

	return (
		<button
			onClick={() => setshowCourseOverlay(!showCourseOverlay)}
			className={`flex items-center justify-center hover:bg-blue-500/50 ${isAdvanced ? "bg-red-500" : "bg-green-500"} hover:cursor-pointer w-full h-40 border-2 border-neutral-600 shadow-sm shadow-black`}
		>
			<div className="flex flex-col gap-2 items-center size-full justify-between text-shadow-black text-shadow-md">
				<div className="flex flex-col gap-2 text-md">
					<h1>{courseName}</h1>
					<h1>{courseCode}</h1>
				</div>
				<div className="flex w-full justify-between p-1 text-sm">
					<h2>
						{courseSemester}
						{coursePeriod}/{courseBlock}
					</h2>
					<h2>{courseMarks}HP</h2>
				</div>
			</div>
		</button>
	);
}

function getPeriodLabel(semester: string, period: string): string {
	const semesterNumber = parseInt(semester, 10);
	const prefix = semesterNumber % 2 === 1 ? "HT" : "VT";
	return `${prefix}${period}`;
}

function CourseViewer() {
	const [semesters, setSemesters] = useState<Semester[]>([]);
	const [periods, setPeriods] = useState<string[]>([]);
	const [programCode, setprogramCode] = useState<string>("");

	useEffect(() => {
		async function fetchCurriculum(programCode: string) {
			const programRef = doc(db, "programs", programCode);
			const semestersSnap = await getDocs(collection(programRef, "semesters"));

			const allPeriodNames = new Set<string>();
			const semesterData: Semester[] = [];

			for (const semDoc of semestersSnap.docs) {
				const periodsSnap = await getDocs(collection(semDoc.ref, "periods"));
				const periodData: Period[] = [];

				for (const periodDoc of periodsSnap.docs) {
					const coursesSnap = await getDocs(
						collection(periodDoc.ref, "courses"),
					);
					const courses = coursesSnap.docs.map((c) => c.data() as Course);

					periodData.push({ period: periodDoc.id, courses });
					allPeriodNames.add(periodDoc.id);
				}

				periodData.sort((a, b) => a.period.localeCompare(b.period));
				semesterData.push({ semester: semDoc.id, periods: periodData });
			}

			semesterData.sort((a, b) => a.semester.localeCompare(b.semester));
			setSemesters(semesterData);
			setPeriods([...allPeriodNames].sort());
		}

		fetchCurriculum(programCode);
	}, [programCode]);

	return (
		<div className="flex flex-col">
			<div className="flex width-full gap-2">
				<button
					onClick={() => setprogramCode("6CDDD")}
					className="flex items-center justify-center bg-[#98E5EB] hover:bg-blue-500/50 hover:cursor-pointer size-fit p-2 border-2 border-neutral-600 shadow-sm shadow-black text-shadow-black text-shadow-md"
				>
					6CDDD
				</button>
				<button
					onClick={() => setprogramCode("6CMJU")}
					className="flex items-center justify-center bg-[#98E5EB] hover:bg-blue-500/50 hover:cursor-pointer size-fit p-2 border-2 border-neutral-600 shadow-sm shadow-black text-shadow-black text-shadow-md"
				>
					6CMJU
				</button>
			</div>
			<div className="flex flex-col gap-4 size-full">
				{semesters.map((sem) => (
					<div key={sem.semester} className="flex flex-col gap-2 size-full">
						<h2 className="font-bold text-lg">{sem.semester}</h2>
						{sem.periods.map((per) => (
							<div
								key={per.period}
								className="grid grid-cols-4 gap-10 size-full"
							>
								{per.courses.map((course) => (
									<CourseCard
										key={course.courseCode}
										courseCode={course.courseCode}
										courseName={course.courseName}
										courseMarks={course.credits}
										courseDifficulty={course.level}
										courseSemester={getPeriodLabel(sem.semester, per.period)}
										coursePeriod=""
										courseBlock={course.block}
									/>
								))}
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	);
}

export default CourseViewer;
