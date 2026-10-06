import type { MasterPlan, Course } from "./types";

export interface Requirement {
  id: string;
  label: string;
  isMet: (plan: MasterPlan) => boolean;
  progress?: (plan: MasterPlan) => { have: number; need: number };
}

export interface SpecializationRequirements {
  code: string;
  reqs: Requirement[];
}

const planHas = (p: MasterPlan, code: string) =>
  (p.courses ?? []).some((c) => c.courseCode === code);

const hasCourse = (courseCode: string): Requirement => ({
  id: `has${courseCode}`,
  label: `Planen måste ha ${courseCode}`,
  isMet: (p) => planHas(p, courseCode),
});

const hasAtLeast = (
  n: number,
  courseCodes: string[],
  label?: string,
): Requirement => ({
  id: `hasAtLeast${n}of_${courseCodes.join("_")}`,
  label: label ?? `Minst ${n} av: ${courseCodes.join(", ")}`,
  isMet: (p) => courseCodes.filter((id) => planHas(p, id)).length >= n,
});

interface CourseFilter {
  advanced?: boolean;
  areas?: string[];
}

const isAdvanced = (c: Course) => c.level.startsWith("A");

const matches = (c: Course, f: CourseFilter) =>
  (!f.advanced || isAdvanced(c)) &&
  (!f.areas?.length || f.areas.some((a) => c.subjectAreas.includes(a)));

const sumCredits = (p: MasterPlan, f: CourseFilter) =>
  p.courses.filter((c) => matches(c, f)).reduce((sum, c) => sum + c.credits, 0);

const hasCredits = (
  minCredits: number,
  filter: CourseFilter,
  label?: string,
): Requirement => ({
  id: `hasCredits${minCredits}_${filter.advanced ? "A" : "any"}_${
    filter.areas?.join("+") ?? "any"
  }`,
  label:
    label ??
    `Minst ${minCredits} hp${filter.advanced ? " på avancerad nivå" : ""}${
      filter.areas?.length ? ` inom ${filter.areas.join(" eller ")}` : ""
    }`,
  isMet: (p) => sumCredits(p, filter) >= minCredits,
  progress: (p) => ({ have: sumCredits(p, filter), need: minCredits }),
});

const missingCourses = (p: MasterPlan, codes: string[]) =>
  codes.filter((code) => !planHas(p, code));

const hasAll = (courseCodes: string[], label?: string): Requirement => ({
  id: `hasAll_${courseCodes.join("_")}`,
  label: label ?? `Obligatoriska kurser: ${courseCodes.join(", ")}`,
  isMet: (p) => missingCourses(p, courseCodes).length === 0,
  progress: (p) => ({
    have: courseCodes.length - missingCourses(p, courseCodes).length,
    need: courseCodes.length,
  }),
});

export const REQUIREMENTS: Record<string, SpecializationRequirements[]> = {
  "6CDDD": [
    {
      code: "DPRO",
      reqs: [
        hasCourse("TQXX33"),
        hasAll(["TDDD37", "TSIT02", "TDDE52"]),
        hasAtLeast(1, ["TANA21", "TANA24"]),
        hasAtLeast(2, ["TATA64", "TDDD08", "TDDD14", "TDDD20", "TDDE34"]),
        hasCredits(90, { advanced: true }),
        hasCredits(120, {}),
        hasCredits(30, {
          advanced: true,
          areas: ["Datateknik", "Datavetenskap"],
        }),
        hasCredits(42, {
          areas: ["Datateknik", "Datavetenskap"],
        }),
      ],
    },
  ],
};

export function getRequirements(
  program: string,
  specialization: string,
): Requirement[] {
  return (
    REQUIREMENTS[program]?.find((s) => s.code === specialization)?.reqs ?? []
  );
}

export function evaluateRequirements(plan: MasterPlan) {
  const results = getRequirements(plan.program, plan.specialization).map(
    (r) => ({
      ...r,
      met: r.isMet(plan),
      progress: r.progress?.(plan),
    }),
  );
  return {
    results,
    unmet: results.filter((r) => !r.met),
    allMet: results.every((r) => r.met),
  };
}
