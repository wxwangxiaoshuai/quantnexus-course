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

  it("elective modules are m10/m11 only", () => {
    const elective = curriculum.modules.filter((m) => m.elective).map((m) => m.id);
    expect(elective).toEqual([10, 11]);
  });
});
