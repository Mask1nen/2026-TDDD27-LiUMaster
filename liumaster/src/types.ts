// En enskild kurs så som den ser ut i JSON-filen
export interface CourseOffering {
  termin: string;
  period: number;
  block: number | null;
}

export interface Course {
  courseCode: string;
  courseName: string;
  credits: number; // Ändrad till number
  level: string;
  mandatory: string;
  spansMultiplePeriods: boolean;
  freeText: string;
  url: string;
  subjectAreas: string[];
  specialization: string[];
  offerings: CourseOffering[]; // Tillagd eftersom kurserna har detta nu
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

export interface Year {
  year: string; // t.ex. "2029"
  courses: Course[];
}

export interface MasterPlan {
  id: string;
  name: string;
  specialization: string;
  program: string;
  createdAt: Date;
  private: boolean;
  courses: Course[];
}

export interface Specialization {
  code: string;
  name: string;
}

export const MASTERINRIKTNINGAR: Record<string, Specialization[]> = {
  "6CDDD": [
    { code: "DAIM", name: "Ai och maskininlärning" },
    { code: "DAUT", name: "Autonoma system" },
    { code: "DDSA", name: "Datorseende och signalanalys" },
    { code: "DDAS", name: "Datorsystem" },
    { code: "DIDS", name: "Inbyggda digitala system" },
    { code: "DIND", name: "Industriell ekonomi" },
    { code: "DMED", name: "Medicinsk informatik" },
    { code: "DMIK", name: "Mikroelektronik" },
    { code: "DPRO", name: "Programmering och algoritmer" },
    { code: "DSPE", name: "Spelprogrammering" },
    { code: "DSTO", name: "Storskalig mjukvaruutveckling" },
    { code: "DSAK", name: "Säkra system" },
  ],
  "6CMMM": [
    { code: "MENE", name: "Energi- och miljöteknik" },
    { code: "MFLY", name: "Flygteknik" },
    { code: "MINP", name: "Industriell produktion" },
    { code: "MKON", name: "Konstruktionsteknik och produktutveckling" },
    { code: "MKVA", name: "Kvalitets- och verksamhetsutveckling" },
    { code: "MLOG", name: "Logistik och supply chain management" },
    { code: "MMAT", name: "Materialteknik" },
    { code: "MPRL", name: "Produktionsledning" },
    { code: "MPRT", name: "Produktionsteknik" },
    { code: "MMEK", name: "Tillämpad mekanik" },
  ],
};
