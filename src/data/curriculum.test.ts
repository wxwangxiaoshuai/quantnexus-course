import { describe, expect, it } from "vitest";
import { curriculum, stages, totalLessons, LEGACY_LESSON_ID_MAP } from "../data/curriculum";

describe("curriculum structure", () => {
  it("has 14 modules and 68 lessons", () => {
    expect(curriculum.modules).toHaveLength(14);
    expect(totalLessons).toBe(68);
  });

  it("has 7 stages covering 1–14", () => {
    expect(stages).toHaveLength(7);
    expect(stages[0].range).toEqual([1, 2]);
    expect(stages[6].range).toEqual([12, 14]);
  });

  it("every module has a project", () => {
    for (const m of curriculum.modules) {
      expect(m.project).toBeTruthy();
      expect(m.project!.module).toBe(m.id);
    }
  });

  it("legacy id map covers all lessons", () => {
    expect(Object.keys(LEGACY_LESSON_ID_MAP).length).toBe(68);
    for (const m of curriculum.modules) {
      for (const l of m.lessons) {
        expect(LEGACY_LESSON_ID_MAP[l.legacyId]).toBe(l.id);
      }
    }
  });

  it("every project has enriched metadata", () => {
    for (const m of curriculum.modules) {
      const p = m.project!;
      expect(p.durationMinutes).toBeGreaterThan(0);
      expect(p.objectives.length).toBeGreaterThan(0);
      expect(p.relatedLessons.length).toBeGreaterThan(0);
      expect(p.acceptanceCriteria.length).toBeGreaterThan(0);
    }
  });

  it("m14 l14-01 recommends m10 ic lesson as prerequisite", () => {
    const m14 = curriculum.modules.find((m) => m.id === 14)!;
    const l01 = m14.lessons.find((l) => l.id === "L14-01")!;
    expect(l01.prerequisites).toContain("L10-02");
  });

  it("m13 hours reflects practice time", () => {
    const m13 = curriculum.modules.find((m) => m.id === 13)!;
    expect(m13.hours).toBeGreaterThanOrEqual(2);
  });

  it("p11 related lessons include lookAhead home L11-04 and L06-02", () => {
    const p11 = curriculum.modules.find((m) => m.id === 11)!.project!;
    expect(p11.relatedLessons).toContain("L11-04");
    expect(p11.relatedLessons).toContain("L06-02");
  });

  it("elective modules are m10/m11 only", () => {
    const elective = curriculum.modules.filter((m) => m.elective).map((m) => m.id);
    expect(elective).toEqual([10, 11]);
  });
});
