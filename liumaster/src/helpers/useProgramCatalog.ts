import { useEffect, useState } from "react";
import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import type { Course, Year } from "../types";

// Cachar promisen (inte bara resultatet), så att flera komponenter som
// anropar hooken samtidigt delar på samma hämtning.
const catalogCache = new Map<string, Promise<Year[]>>();

function fetchCatalog(programCode: string): Promise<Year[]> {
  const cached = catalogCache.get(programCode);
  if (cached) return cached;

  const promise = (async () => {
    const programRef = doc(db, "programs", programCode);
    const yearsSnap = await getDocs(collection(programRef, "years"));

    const years = await Promise.all(
      yearsSnap.docs.map(async (yearDoc) => {
        const coursesSnap = await getDocs(collection(yearDoc.ref, "courses"));
        const courses = coursesSnap.docs.map((c) => c.data() as Course);
        return { year: yearDoc.id, courses } as Year;
      }),
    );

    return years.sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));
  })();

  // Misslyckade hämtningar ska inte cachas
  promise.catch(() => catalogCache.delete(programCode));

  catalogCache.set(programCode, promise);
  return promise;
}

export function useProgramCatalog(program?: string) {
  const [years, setYears] = useState<Year[]>([]);
  const [loadingYears, setLoadingYears] = useState<boolean>(!!program);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!program) {
      setYears([]);
      setLoadingYears(false);
      return;
    }

    let cancelled = false;
    setLoadingYears(true);
    setError(null);

    fetchCatalog(program)
      .then((data) => {
        if (cancelled) return;
        setYears(data);
        setLoadingYears(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoadingYears(false);
      });

    return () => {
      cancelled = true;
    };
  }, [program]);

  return { years, loadingYears, error };
}
