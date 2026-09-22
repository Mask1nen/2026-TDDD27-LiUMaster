import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { ProgramsJSON } from "../types.ts";

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
      let courseCount = 0;

      for (const [programCode, program] of Object.entries(programs)) {
        // Skapa program-dokumentet med info-fältet
        const programRef = doc(db, "programs", programCode);
        await setDoc(programRef, { info: program.info });
        programCount++;

        for (const [year, yearData] of Object.entries(program.years)) {
          // Skapa subkollektionen "years" med år (t.ex. "2029") som ID
          const yearRef = doc(programRef, "years", year);
          await setDoc(yearRef, { year: Number(year) || year });
          yearCount++;

          // Gå igenom "courses" direkt under varje år
          for (const [courseCode, course] of Object.entries(yearData.courses)) {
            // Skapa subkollektionen "courses" med kurskod (t.ex. "TANA21") som ID
            const courseRef = doc(yearRef, "courses", courseCode);
            await setDoc(courseRef, course);
            courseCount++;
          }
        }
      }

      setStatus(
        `✅ Laddade upp ${programCount} program, ${yearCount} år och ${courseCount} kurs(er) med den nya strukturen.`,
      );
    } catch (err) {
      setStatus(`❌ Fel vid uppladdning: ${err}`);
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
