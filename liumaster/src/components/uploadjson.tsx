// components/UploadPrograms.tsx
import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

interface Course {
	courseCode: string;
	courseName: string;
	credits: string;
	level: string;
	block: string;
	type: string;
	courseUrl: string;
	details: string[];
}

interface Period {
	period: string;
	courses: Course[];
}

interface Semester {
	semester: string;
	periods: Period[];
}

interface Program {
	program: Record<string, string | null>;
	curriculum: Semester[];
}

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

			for (const [programCode, data] of Object.entries(programs)) {
				// Create the program document with info fields
				const programRef = doc(db, "programs", programCode);
				await setDoc(programRef, { info: data.program });

				for (const semester of data.curriculum) {
					// Create semester subcollection using semester name as ID
					const semesterRef = doc(programRef, "semesters", semester.semester);
					await setDoc(semesterRef, { semester: semester.semester });

					for (const period of semester.periods) {
						// Create period subcollection using period name as ID
						const periodRef = doc(semesterRef, "periods", period.period);
						await setDoc(periodRef, { period: period.period });

						for (const course of period.courses) {
							// Create course document using course code as ID
							const courseRef = doc(periodRef, "courses", course.courseCode);
							await setDoc(courseRef, course);
						}
					}
				}
			}

			const count = Object.keys(programs).length;
			setStatus(`✅ Successfully uploaded ${count} program(s)`);
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
