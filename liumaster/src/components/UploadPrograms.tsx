// components/UploadPrograms.tsx
import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// A single course's attributes, matching the "has" node in the data model:
// Year -> Semester -> Period -> Course -> {URL, HP, Block, Kursnamn, Fri text, Nivå, Kurskod, Område}
interface Course {
	Kurskod: string;
	Kursnamn: string | null;
	HP: string | null;
	Nivå: string | null;
	Block: string | null;
	"Fri text": string;
	URL: string | null;
	Område: string[];
}

// Period[number] -> Course[course code]
type PeriodCourses = Record<string, Course>;

// Semester[VT/HT] -> Period[number]
type SemesterPeriods = Record<string, PeriodCourses>;

// Year[number] -> Semester[VT/HT]
type YearSemesters = Record<string, SemesterPeriods>;

// Program -> { info, years }
interface Program {
	info: Record<string, string | null>;
	years: Record<string, YearSemesters>;
}

// Top level: Program code
interface ProgramsJSON {
	programs: Record<string, Program>;
}

export function UploadPrograms() {
	const [status, setStatus] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setLoading(true);
		setStatus(null);

		try {
			const text = await file.text();
			const json: ProgramsJSON = JSON.parse(text);
			const programs = json.programs;

			let programCount = 0;
			let yearCount = 0;
			let semesterCount = 0;
			let periodCount = 0;
			let courseCount = 0;

			for (const [programCode, program] of Object.entries(programs)) {
				// Create the program document with info fields
				const programRef = doc(db, "programs", programCode);
				await setDoc(programRef, { info: program.info });
				programCount++;

				for (const [year, semesters] of Object.entries(program.years)) {
					// Create year subcollection using year number as ID
					const yearRef = doc(programRef, "years", year);
					await setDoc(yearRef, { year: Number(year) });
					yearCount++;

					for (const [semesterName, periods] of Object.entries(semesters)) {
						// Create semester subcollection using semester name (VT/HT) as ID
						const semesterRef = doc(yearRef, "semesters", semesterName);
						await setDoc(semesterRef, { semester: semesterName });
						semesterCount++;

						for (const [periodName, courses] of Object.entries(periods)) {
							// Create period subcollection using period number as ID
							const periodRef = doc(semesterRef, "periods", periodName);
							await setDoc(periodRef, { period: Number(periodName) || periodName });
							periodCount++;

							for (const [courseCode, course] of Object.entries(courses)) {
								// Create course document using course code as ID
								const courseRef = doc(periodRef, "courses", courseCode);
								await setDoc(courseRef, course);
								courseCount++;
							}
						}
					}
				}
			}

			setStatus(
				`✅ Successfully uploaded ${programCount} program(s), ${yearCount} year(s), ${semesterCount} semester(s), ${periodCount} period(s), ${courseCount} course(s)`
			);
		} catch (err) {
			setStatus(`❌ Error: ${err}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h2>Upload Programs</h2>
			<input
				type="file"
				accept=".json"
				disabled={loading}
				onChange={handleFileChange}
			/>
			{loading && <p>Uploading...</p>}
			{status && <p>{status}</p>}
		</div>
	);
}
