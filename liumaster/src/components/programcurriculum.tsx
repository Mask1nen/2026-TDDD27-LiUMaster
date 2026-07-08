// components/ProgramCurriculum.tsx
import { useEffect, useState } from "react";
import { collection, doc, getDocs, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/UserAuthContext.tsx";

interface Course {
	courseCode: string;
	courseName: string;
	credits: string;
}

interface Period {
	period: string;
	courses: Course[]; // all courses offered in this period (from the program's master curriculum)
}

interface Semester {
	semester: string;
	periods: Period[];
}

// The signed-in user's saved plan: semester -> period -> selected course codes
type PlanSelections = Record<string, Record<string, string[]>>;

export function ProgramCurriculum({ programCode }: { programCode: string }) {
	const { user } = useAuth();
	const [semesters, setSemesters] = useState<Semester[]>([]);
	const [periods, setPeriods] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [selections, setSelections] = useState<PlanSelections>({});
	// Tracks the course currently chosen in each period's "add" dropdown, before Add is clicked.
	// Keyed by `${semester}__${period}`.
	const [pendingChoice, setPendingChoice] = useState<Record<string, string>>(
		{}
	);
	const [saving, setSaving] = useState(false);

	// Fetch the master curriculum (all courses on offer per semester/period)
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

				periodData.sort((a, b) => a.period.localeCompare(b.period));
				semesterData.push({ semester: semDoc.id, periods: periodData });
			}

			semesterData.sort((a, b) => a.semester.localeCompare(b.semester));
			setSemesters(semesterData);
			setPeriods([...allPeriodNames].sort());
			setLoading(false);
		}

		fetchCurriculum();
	}, [programCode]);

	// Fetch the signed-in user's saved plan for this program
	useEffect(() => {
		async function fetchPlan() {
			if (!user) {
				setSelections({});
				return;
			}
			const planRef = doc(db, "users", user.uid, "plans", programCode);
			const planSnap = await getDoc(planRef);
			if (planSnap.exists()) {
				setSelections((planSnap.data().selections as PlanSelections) ?? {});
			} else {
				setSelections({});
			}
		}
		fetchPlan();
	}, [user, programCode]);

	async function savePlan(newSelections: PlanSelections) {
		setSelections(newSelections); // optimistic UI update
		if (!user) return;
		setSaving(true);
		try {
			const planRef = doc(db, "users", user.uid, "plans", programCode);
			await setDoc(planRef, { selections: newSelections }, { merge: true });
		} catch (err) {
			console.error("Failed to save plan:", err);
		} finally {
			setSaving(false);
		}
	}

	function addCourse(semester: string, period: string, courseCode: string) {
		if (!courseCode) return;
		const current = selections[semester]?.[period] ?? [];
		if (current.includes(courseCode)) return;

		const newSelections: PlanSelections = {
			...selections,
			[semester]: {
				...selections[semester],
				[period]: [...current, courseCode],
			},
		};
		savePlan(newSelections);
		setPendingChoice((prev) => ({
			...prev,
			[`${semester}__${period}`]: "",
		}));
	}

	function removeCourse(semester: string, period: string, courseCode: string) {
		const current = selections[semester]?.[period] ?? [];
		const newSelections: PlanSelections = {
			...selections,
			[semester]: {
				...selections[semester],
				[period]: current.filter((c) => c !== courseCode),
			},
		};
		savePlan(newSelections);
	}

	if (loading) return <p>Loading curriculum...</p>;

	return (
		<div className="overflow-x-auto">
			{saving && (
				<p className="text-xs text-gray-500 mb-1">Saving your plan…</p>
			)}
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

								if (!period) {
									return (
										<td
											key={periodName}
											className="px-4 py-3 border border-gray-200 align-middle"
										>
											<span className="text-gray-400">—</span>
										</td>
									);
								}

								const key = `${sem.semester}__${periodName}`;
								const selectedCodes =
									selections[sem.semester]?.[periodName] ?? [];
								const selectedCourses = period.courses.filter((c) =>
									selectedCodes.includes(c.courseCode)
								);
								const availableCourses = period.courses.filter(
									(c) => !selectedCodes.includes(c.courseCode)
								);

								return (
									<td
										key={periodName}
										className="px-4 py-3 border border-gray-200 align-top"
									>
										<div className="flex flex-col gap-1 w-full min-w-0">
											{selectedCourses.map((course) => (
												<div
													key={course.courseCode}
													className="flex items-center justify-between gap-1 text-sm bg-white border border-gray-200 rounded-md px-2 py-1.5 w-full min-w-0"
												>
													<span
														className="truncate min-w-0"
														title={`${course.courseCode} – ${course.courseName} (${course.credits}hp)`}
													>
														{course.courseCode} – {course.courseName} (
														{course.credits}hp)
													</span>
													<button
														type="button"
														onClick={() =>
															removeCourse(
																sem.semester,
																periodName,
																course.courseCode
															)
														}
														className="shrink-0 text-red-500 hover:text-red-700 font-bold px-1 leading-none"
														aria-label={`Remove ${course.courseCode}`}
														title="Remove course"
													>
														×
													</button>
												</div>
											))}

											{availableCourses.length > 0 && (
												<div className="flex gap-1 w-full min-w-0">
													<select
														className="flex-1 min-w-0 w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-800 cursor-pointer"
														value={pendingChoice[key] ?? ""}
														onChange={(e) =>
															setPendingChoice((prev) => ({
																...prev,
																[key]: e.target.value,
															}))
														}
													>
														<option value="">Add a course…</option>
														{availableCourses.map((course) => (
															<option
																key={course.courseCode}
																value={course.courseCode}
															>
																{course.courseCode} – {course.courseName} (
																{course.credits}hp)
															</option>
														))}
													</select>
													<button
														type="button"
														disabled={!pendingChoice[key]}
														onClick={() =>
															addCourse(
																sem.semester,
																periodName,
																pendingChoice[key]
															)
														}
														className="shrink-0 text-sm px-2.5 py-1.5 rounded-md bg-[#98E5EB] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#7fd6dc]"
														title="Add course"
													>
														+
													</button>
												</div>
											)}

											{selectedCourses.length === 0 &&
												availableCourses.length === 0 && (
													<span className="text-gray-400 text-sm">—</span>
												)}
										</div>
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
