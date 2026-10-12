import { type MasterPlan, type Course, MASTERINRIKTNINGAR } from "./types";

export interface Requirement {
  id: string;
  label: string;
  isMet: (plan: MasterPlan) => boolean;
  progress?: (plan: MasterPlan) => { have: number; need: number };
}

export type Catalog = Course[];

export interface SpecializationRequirements {
  code: string;
  reqs: (catalog: Catalog, plan: MasterPlan) => Requirement[];
}

const planHas = (p: MasterPlan, code: string) =>
  (p.courses ?? []).some((c) => c.courseCode === code);

// Planen har denna specifika kurs
const hasCourse = (courseCode: string): Requirement => ({
  id: `has${courseCode}`,
  label: `Planen måste ha ${courseCode}`,
  isMet: (p) => planHas(p, courseCode),
});

// Planen har minst n av dessa kurser
const hasAtLeast = (n: number, courseCodes: string[]): Requirement => ({
  id: `hasAtLeast${n}of_${courseCodes.join("_")}`,
  label: `Minst ${n} av: ${courseCodes.join(", ")}`,
  isMet: (p) => courseCodes.filter((id) => planHas(p, id)).length >= n,
});

// Planen har alla dessa kurser
const missingCourses = (p: MasterPlan, codes: string[]) =>
  codes.filter((code) => !planHas(p, code));

const hasAll = (courseCodes: string[]): Requirement => ({
  id: `hasAll_${courseCodes.join("_")}`,
  label: `Obligatoriska kurser: ${courseCodes.join(", ")}`,
  isMet: (p) => missingCourses(p, courseCodes).length === 0,
  progress: (p) => ({
    have: courseCodes.length - missingCourses(p, courseCodes).length,
    need: courseCodes.length,
  }),
});

interface CourseFilter {
  advanced?: boolean;
  areas?: string[];
  courseCodes?: string[];
}

const isAdvanced = (c: Course) => c.level.startsWith("A");

const matches = (c: Course, f: CourseFilter) =>
  (!f.advanced || isAdvanced(c)) &&
  (!f.areas?.length || f.areas.some((a) => c.subjectAreas.includes(a))) &&
  (!f.courseCodes || f.courseCodes.includes(c.courseCode));

const sumCredits = (p: MasterPlan, f: CourseFilter) =>
  p.courses.filter((c) => matches(c, f)).reduce((sum, c) => sum + c.credits, 0);

// Planen har minst n HP i detta område i grund/avancerad nivå
const hasCredits = (
  minCredits: number,
  filter: CourseFilter,
  label?: string,
): Requirement => ({
  id: `hasCredits${minCredits}_${filter.advanced ? "A" : "any"}_${
    filter.areas?.join("+") ?? "any"
  }_${filter.courseCodes?.join("+") ?? "any"}`,
  label:
    label ??
    `Minst ${minCredits} hp${filter.advanced ? " på avancerad nivå" : ""}${
      filter.areas?.length ? ` inom ${filter.areas.join(" eller ")}` : ""
    } ${filter.courseCodes ? `från ${filter.courseCodes.join(", ")}` : ""}`,
  isMet: (p) => sumCredits(p, filter) >= minCredits,
  progress: (p) => ({ have: sumCredits(p, filter), need: minCredits }),
});

const coursesInSpecialization = (catalog: Catalog, specialization: string) =>
  catalog.filter((c) => c.specialization.includes(specialization));

const specializationName = (program: string, code: string) =>
  MASTERINRIKTNINGAR[program]?.find((s) => s.code === code)?.name ?? code;

// Planen har minst n HP av grund/avancerade kurser från denna inriktning
const hasCreditsInSpecialization = (
  minCredits: number,
  catalog: Catalog,
  program: string,
  specialization: string,
  filter: Omit<CourseFilter, "courseCodes"> = {},
): Requirement => {
  const courseCodes = coursesInSpecialization(catalog, specialization).map(
    (c) => c.courseCode,
  );
  return {
    ...hasCredits(
      minCredits,
      { ...filter, courseCodes },
      `Minst ${minCredits} hp${filter.advanced ? " på avancerad nivå" : ""} från ${specializationName(program, specialization)}`,
    ),
    id: `hasCreditsInSpec${minCredits}_${specialization}_${filter.advanced ? "A" : "any"}`,
  };
};

// Planen har minst n HP i ett huvudområde
const hasCreditsInOneArea = (
  minCredits: number,
  areas: string[],
  filter: Omit<CourseFilter, "areas"> = {},
  label?: string,
): Requirement => {
  const best = (p: MasterPlan) =>
    Math.max(0, ...areas.map((a) => sumCredits(p, { ...filter, areas: [a] })));

  return {
    id: `hasCreditsInOneArea${minCredits}_${filter.advanced ? "A" : "any"}_${areas.join("+")}`,
    label:
      label ??
      `Minst ${minCredits} hp${filter.advanced ? " på avancerad nivå" : ""} inom ett av huvudområdena: ${areas.join(", ")}`,
    isMet: (p) => best(p) >= minCredits,
    progress: (p) => ({ have: best(p), need: minCredits }),
  };
};

const PROGRAM_REQUIREMENTS: Record<string, Requirement[]> = {
  "6CDDD": [
    hasCourse("TQXX33"),
    hasCourse("TDDD89"),
    hasAtLeast(1, ["TANA21", "TANA24"]),
    hasCredits(120, {}),
    hasCredits(90, { advanced: true }),
    hasCredits(30, {
      advanced: true,
      areas: ["Datateknik", "Datavetenskap"],
    }),
  ],
  "6CMMM": [
    hasCourse("TQXX33"),
    hasCredits(120, {}),
    hasCredits(90, { advanced: true }),
    hasCredits(18, {
      advanced: true,
      areas: ["Maskinteknik"],
    }),
    hasCreditsInOneArea(
      30,
      [
        "Elektroteknik",
        "Energi- och miljöteknik",
        "Flygteknik",
        "Industriell ekonomi",
        "Maskinteknik",
      ],
      { advanced: true },
    ),
  ],
};

export const SPEC_REQUIREMENTS: Record<string, SpecializationRequirements[]> = {
  "6CDDD": [
    {
      code: "DAIM",
      reqs: (catalog, plan) => [
        hasAll(["TDDC17", "TGTU99", "TDDE01", "TDDE19"]),
        hasCreditsInSpecialization(
          30,
          catalog,
          plan.program,
          plan.specialization,
          {
            advanced: true,
          },
        ),
        hasCreditsInSpecialization(
          36,
          catalog,
          plan.program,
          plan.specialization,
          {
            advanced: false,
          },
        ),
      ],
    },
    {
      code: "DAUT",
      reqs: (catalog, plan) => [
        hasAll(["TDDC17", "TSBB08", "TSFS12", "TSRT07", "TDDE01"]),
        hasCreditsInSpecialization(
          30,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: true },
        ),
        hasCreditsInSpecialization(
          36,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: false },
        ),
      ],
    },
    {
      code: "DDSA",
      reqs: (catalog, plan) => [
        hasAll(["TSBB06", "TSBB08", "TSBB21"]),
        hasCreditsInSpecialization(
          36,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: false },
        ),
      ],
    },
    {
      code: "DDAS",
      reqs: (catalog, plan) => [
        hasAll(["TDDE21"]),
        hasCreditsInSpecialization(
          48,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: false },
        ),
      ],
    },
    {
      code: "DIDS",
      reqs: (catalog, plan) => [
        hasAll(["TDTS08", "TSTE86", "TSTE12", "TSTE87"]),
        hasCreditsInSpecialization(
          36,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: false },
        ),
      ],
    },
    {
      code: "DIND",
      reqs: (catalog, plan) => [
        hasAll([
          "TEAE01",
          "TEIO32",
          "TDDC34",
          "TDDE02",
          "TEIO32",
          "TEIO06",
          "TEIM11",
          "TEIO90",
        ]),
        hasAtLeast(1, ["TDEI74", "TEIO13"]),
        hasCreditsInSpecialization(
          30,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: true },
        ),
      ],
    },
    {
      code: "DMED",
      reqs: (catalog, plan) => [
        hasAll(["TBME04", "TBMI19"]),
        hasCreditsInSpecialization(
          30,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: true },
        ),
        hasCreditsInSpecialization(
          36,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: false },
        ),
      ],
    },
    {
      code: "DMIK",
      reqs: (catalog, plan) => [
        hasAll([
          "TSEK02",
          "TSTE86",
          "TSEK02",
          "TSEK37",
          "TSEK13",
          "TSEK03",
          "TSEK07",
        ]),
        hasCreditsInSpecialization(
          36,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: false },
        ),
      ],
    },
    {
      code: "DPRO",
      reqs: (catalog, plan) => [
        hasAll(["TDDD37", "TSIT02", "TDDE52"]),
        hasAtLeast(2, ["TATA64", "TDDD08", "TDDD14", "TDDD20", "TDDE34"]),
        hasCreditsInSpecialization(
          30,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: true },
        ),
        hasCreditsInSpecialization(
          42,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: false },
        ),
      ],
    },
    {
      code: "DSPE",
      reqs: (catalog, plan) => [
        hasAll(["TDDD23", "TDDC73", "TDDD57", "TSBK07", "TSBK03"]),
        hasCreditsInSpecialization(
          30,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: true },
        ),
        hasCreditsInSpecialization(
          36,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: false },
        ),
      ],
    },
    {
      code: "DSTO",
      reqs: (catalog, plan) => [
        hasAll(["TDDE52"]),
        hasCreditsInSpecialization(
          30,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: true },
        ),
        hasCreditsInSpecialization(
          36,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: false },
        ),
      ],
    },
    {
      code: "DSAK",
      reqs: (catalog, plan) => [
        hasAll(["TDTS06", "TSIT02", "TDDE62", "TDDC90"]),
        hasAtLeast(1, ["TDDE21", "TDDE63"]),
      ],
    },
  ],
  "6CMMM": [
    {
      code: "MENE",
      reqs: (catalog, plan) => [
        hasCreditsInSpecialization(
          60,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: false },
        ),
        hasAll([
          "TAOP88",
          "TKMJ53",
          "TMES17",
          "TKMJ55",
          "TMES21",
          "TKMJ29",
          "TMPE10",
        ]),
      ],
    },
    {
      code: "MFLY",
      reqs: (catalog, plan) => [
        hasCreditsInSpecialization(
          60,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: false },
        ),
        hasAll([
          "TMAL02",
          "TMMV01",
          "TMHP03",
          "TMME50",
          "TMAL51",
          "TMMV08",
          "TMAL06",
        ]),
        hasCredits(12, { courseCodes: ["TMPM10", "TMAL07", "TMAL08"] }),
      ],
    },
    {
      code: "MINP",
      reqs: (catalog, plan) => [
        hasCreditsInSpecialization(
          60,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: false },
        ),
        hasAll(["TAOP88", "TMPS27", "TMPS22", "TMPM08", "TMPR07"]),
      ],
    },
    {
      code: "MKON",
      reqs: (catalog, plan) => [
        hasCreditsInSpecialization(
          60,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: false },
        ),
        hasAll(["TMKO02", "TMKM90", "TMPM09"]),
        hasAtLeast(2, ["TMKO01", "TMKO04", "TMKO03", "TMKO06"]),
      ],
    },
    {
      code: "MKVA",
      reqs: (catalog, plan) => [
        hasCreditsInSpecialization(
          60,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: false },
        ),
        hasAll(["TAOP88", "TMPR04", "TMKT48", "TMKT74", "TMKT77", "TMPM05"]),
      ],
    },
    {
      code: "MLOG",
      reqs: (catalog, plan) => [
        hasCreditsInSpecialization(
          60,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: false },
        ),
        hasAll(["TAOP88", "TETS37", "TETS27", "TETS57", "TETS36", "TETS38"]),
      ],
    },
    {
      code: "MEKA",
      reqs: (catalog, plan) => [
        hasCreditsInSpecialization(
          60,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: false },
        ),
        hasAll(["TMHP02", "TSFS09", "TSRT06", "TMHP51"]),
        hasAtLeast(1, ["TMPM06", "TSRT28"]),
      ],
    },

    {
      code: "MPRL",
      reqs: (catalog, plan) => [
        hasCreditsInSpecialization(
          60,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: false },
        ),
        hasAll(["TAOP88", "TPPE16", "TPPE76", "TPPE78", "TPPE74", "TPPE73"]),
      ],
    },

    {
      code: "MMEK",
      reqs: (catalog, plan) => [
        hasCreditsInSpecialization(
          60,
          catalog,
          plan.program,
          plan.specialization,
          { advanced: false },
        ),
        hasAll(["TMHL03", "TMHL41", "TMPM10"]),
        hasAtLeast(1, ["TMHL62", "TMMV08"]),
      ],
    },
  ],
};

export function getRequirements(
  plan: MasterPlan,
  catalog: Catalog,
): Requirement[] {
  const allReqs = [
    ...(PROGRAM_REQUIREMENTS[plan.program] ?? []),
    ...(SPEC_REQUIREMENTS[plan.program]
      ?.find((s) => s.code === plan.specialization)
      ?.reqs(catalog, plan) ?? []),
  ];
  return [...new Map(allReqs.map((r) => [r.id, r])).values()];
}

export function evaluateRequirements(plan: MasterPlan, catalog: Catalog) {
  const results = getRequirements(plan, catalog).map((r) => ({
    ...r,
    met: r.isMet(plan),
    progress: r.progress?.(plan),
  }));
  return {
    results,
    unmet: results.filter((r) => !r.met),
    allMet: results.every((r) => r.met),
  };
}
