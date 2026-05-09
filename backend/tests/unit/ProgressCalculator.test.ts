import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ProgressCalculator } from "../../src/application/services/ProgressCalculator.js";
import type { Activity } from "../../src/domain/entities/Activity.js";
import type { ActivityCompletion } from "../../src/domain/entities/ActivityCompletion.js";

const calc = new ProgressCalculator();

function makeActivity(
  id: string,
  type: Activity["type"] = "ROUTINE",
  isActive = true
): Activity {
  return {
    id,
    userId: "u1",
    title: `Activity ${id}`,
    description: null,
    type,
    weight: 1.0,
    recurrence: null,
    scheduledDate: null,
    deadlineTime: null,
    isActive,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makeCompletion(activityId: string, completed: boolean, skipped = false): ActivityCompletion {
  return {
    id: `c-${activityId}`,
    activityId,
    userId: "u1",
    completedDate: new Date(),
    completedAt: completed ? new Date() : null,
    skipped,
    createdAt: new Date(),
  };
}

describe("ProgressCalculator", () => {
  it("returns 100% when all mandatory activities completed", () => {
    const activities = [makeActivity("a1"), makeActivity("a2")];
    const completions = [makeCompletion("a1", true), makeCompletion("a2", true)];
    const r = calc.calculate(activities, completions);
    assert.equal(r.progressPercentage, 100);
    assert.equal(r.completedCount, 2);
  });

  it("returns 0% when no completions", () => {
    const activities = [makeActivity("a1"), makeActivity("a2")];
    const r = calc.calculate(activities, []);
    assert.equal(r.progressPercentage, 0);
    assert.equal(r.completedCount, 0);
  });

  it("returns 50% for partial completion", () => {
    const activities = [makeActivity("a1"), makeActivity("a2")];
    const completions = [makeCompletion("a1", true)];
    const r = calc.calculate(activities, completions);
    assert.equal(r.progressPercentage, 50);
    assert.equal(r.completedCount, 1);
  });

  it("excludes OPTIONAL activities from denominator", () => {
    const activities = [makeActivity("a1", "ROUTINE"), makeActivity("a2", "OPTIONAL")];
    const completions = [makeCompletion("a1", true)];
    // denominator = 1 (only ROUTINE), completed mandatory = 1 → 100%
    const r = calc.calculate(activities, completions);
    assert.equal(r.progressPercentage, 100);
    assert.equal(r.totalActivities, 2);
  });

  it("returns 100% when there are only OPTIONAL activities", () => {
    const activities = [makeActivity("a1", "OPTIONAL")];
    const r = calc.calculate(activities, []);
    assert.equal(r.progressPercentage, 100);
  });

  it("excludes inactive activities", () => {
    const activities = [makeActivity("a1"), makeActivity("a2", "ROUTINE", false)];
    const completions = [makeCompletion("a1", true)];
    const r = calc.calculate(activities, completions);
    assert.equal(r.totalActivities, 1);
    assert.equal(r.progressPercentage, 100);
  });

  it("counts skipped activities correctly", () => {
    const activities = [makeActivity("a1"), makeActivity("a2")];
    const completions = [makeCompletion("a1", false, true)];
    const r = calc.calculate(activities, completions);
    assert.equal(r.skippedCount, 1);
    assert.equal(r.completedCount, 0);
  });

  it("handles floating-point correctly (1 of 3 = 33.33%)", () => {
    const activities = [makeActivity("a1"), makeActivity("a2"), makeActivity("a3")];
    const completions = [makeCompletion("a1", true)];
    const r = calc.calculate(activities, completions);
    assert.equal(r.progressPercentage, 33.33);
  });
});
