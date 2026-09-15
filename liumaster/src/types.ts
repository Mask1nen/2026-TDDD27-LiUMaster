// En enskild kurs så som den ser ut i JSON-filen
export interface Course {
  courseCode: string;
  courseName: string;
  credits: string;
  level: string;
  block: string;
  mandatory: string;
  spansMultiplePeriods: boolean;
  freeText: string;
  url: string;
  subjectAreas: string[];
  specialization: string[];
}

// Mappning av kurskod -> Course (t.ex. "TANA21": { ... })
export type PeriodCourses = Record<string, Course>;

// Mappning av periodnamn -> PeriodCourses (t.ex. "HT1": { ... })
export type YearPeriods = Record<string, PeriodCourses>;

// Information om programmet
export interface ProgramInfo {
  programName: string;
  instructionLanguage: string;
  studyLocation: string;
  degreeTitle: string;
  studyPace: string;
}

// Programobjektet (info + år)
export interface Program {
  info: ProgramInfo;
  years: Record<string, YearPeriods>;
}

// Toppnivån för JSON-filen
export interface ProgramsJSON {
  programs: Record<string, Program>;
}

// Hjälptyper om du behöver hantera datan i komponenten/appen senare:
export interface Period {
  period: string; // t.ex. "HT1"
  courses: Course[];
}

export interface Year {
  year: string; // t.ex. "2029"
  periods: Period[];
}

export interface TaggedCourse extends Course {
  semesterLabel: string;
}

export interface YearGroups {
  year: string;
  groups: { label: string; sortKey: number; courses: TaggedCourse[] }[];
}
