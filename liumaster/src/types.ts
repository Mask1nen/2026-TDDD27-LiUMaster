export interface Course {
    Kurskod: string;
    Kursnamn: string | null;
    HP: string | null;
    Nivå: string | null;
    Block: string | null;
    "Fri text": string;
    URL: string | null;
    Område: string[];
}

export interface Period {
    period: string;
    courses: Course[]; // all courses offered in this period (from the program's master curriculum)
}

export interface Semester {
    semester: string; // "HT" or "VT"
    periods: Period[];
}

export interface Year {
    year: string; // e.g. "2029"
    semesters: Semester[];
}

// A course tagged with which semester (HT/VT) it came from, used once
// courses are regrouped into flat HT1/HT2/VT1/VT2-style groups.
export interface TaggedCourse extends Course {
    semesterLabel: string;
}

// Year -> flat list of semester+period groups, e.g. "HT1", "HT2", "VT1", "VT2"
export interface YearGroups {
    year: string;
    groups: { label: string; sortKey: number; courses: TaggedCourse[] }[];
}
