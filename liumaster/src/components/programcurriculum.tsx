// components/ProgramCurriculum.tsx
import { useEffect, useState } from "react";
import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase";

interface Course {
	courseCode: string;
	courseName: string;
	credits: string;
}

interface Period {
	period: string;
	courses: Course[];
}

interface Semester {
	semester: string;
	periods: Period[];
}

export function ProgramCurriculum({ programCode }: { programCode: string }) {
	const [semesters, setSemesters] = useState<Semester[]>([]);
	const [periods, setPeriods] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchCurriculum() {
			const programRef = doc(db, "programs", programCode);
			const semestersSnap = await getDocs(collection(programRef, "semesters"));

			const allPeriodNames = new Set<string>();
			const semesterData: Semester[] = [];

			for (const semDoc of semestersSnap.docs) {
				const periodsSnap = await getDocs(collection(semDoc.ref, "periods"));
				const periodData: Period[] = [];

				for (const periodDoc of periodsSnap.docs) {
					const coursesSnap = await getDocs(
						collection(periodDoc.ref, "courses")
					);
					const courses = coursesSnap.docs.map((c) => c.data() as Course);

					periodData.push({ period: periodDoc.id, courses });
					allPeriodNames.add(periodDoc.id);
				}

				// Sort periods alphabetically (Period 1, Period 2, ...)
				periodData.sort((a, b) => a.period.localeCompare(b.period));
				semesterData.push({ semester: semDoc.id, periods: periodData });
			}

			// Sort semesters
			semesterData.sort((a, b) => a.semester.localeCompare(b.semester));
			setSemesters(semesterData);
			setPeriods([...allPeriodNames].sort());
			setLoading(false);
		}

		fetchCurriculum();
	}, [programCode]);

	if (loading) return <p>Loading curriculum...</p>;

	return (
		<div className="overflow-x-auto">
			<table className="w-full border-collapse table-fixed">
				<thead>
					<tr>
						<th className="w-48 px-4 py-3 border border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-600">
							Semester
						</th>
						{periods.map((p) => (
							<th
								key={p}
								className="w-56 px-4 py-3 border border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-600"
							>
								{p}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{semesters.map((sem) => (
						<tr key={sem.semester}>
							<td className="h-14 px-4 py-3 border border-gray-200 bg-gray-50 text-sm font-medium text-gray-600 whitespace-nowrap align-middle">
								{sem.semester}
							</td>
							{periods.map((periodName) => {
								const period = sem.periods.find((p) => p.period === periodName);
								return (
									<td
										key={periodName}
										className="h-14 px-4 py-3 border border-gray-200 align-middle"
									>
										{period ? (
											<select className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-800 cursor-pointer">
												{period.courses.map((course) => (
													<option
														key={course.courseCode}
														value={course.courseCode}
													>
														{course.courseCode} – {course.courseName} (
														{course.credits}hp)
													</option>
												))}
											</select>
										) : (
											<span className="text-gray-400">—</span>
										)}
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
