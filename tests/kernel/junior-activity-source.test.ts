import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AUTHORED_ACTIVITY_RAILS, scenarioActivitiesForLesson } from "@/lib/junior/activity-source";
import { publicJuniorActivityRail } from "@/lib/junior/activity-rail";
import { juniorScenarioActivitiesSchema } from "../../packages/junior-content/schema/topic";

const TOPICS = join(process.cwd(), "packages/junior-content/topics");

describe("etkinlik tek yazarı", () => {
  it("konu dosyasındaki activities yalnız activity-source ihracıdır", () => {
    const authored = scenarioActivitiesForLesson("jr_06_mat-5");
    expect(authored).not.toBeNull();
    const parsed = juniorScenarioActivitiesSchema.parse(authored);
    const onDisk = JSON.parse(readFileSync(join(TOPICS, "jr_06_mat-5.json"), "utf8")) as {
      activities?: unknown;
    };
    expect(juniorScenarioActivitiesSchema.parse(onDisk.activities)).toEqual(parsed);

    const files = readdirSync(TOPICS).filter((name) => name.endsWith(".json"));
    const withActivities = files.filter((name) => {
      const body = JSON.parse(readFileSync(join(TOPICS, name), "utf8")) as { activities?: unknown };
      return body.activities !== undefined;
    });
    expect(withActivities).toEqual(["jr_06_mat-5.json"]);
    expect(scenarioActivitiesForLesson("jr_06_mat-6")).toBeNull();
    expect(scenarioActivitiesForLesson("jr_06_mat-34")).toBeNull();
    expect(Object.keys(AUTHORED_ACTIVITY_RAILS)).toEqual(["jr_06_mat-5"]);
  });

  it("ray, ihracın eşleştirme ve boşluk cevaplarını okur", () => {
    const authored = scenarioActivitiesForLesson("jr_06_mat-5");
    expect(authored).not.toBeNull();
    const rail = publicJuniorActivityRail("jr_06_mat-5");
    const match = rail.find((item) => item.kind === "match");
    expect(match && match.kind === "match" ? match.left.map((item) => item.label) : []).toEqual(
      authored!.matching.map((item) => item.left),
    );
    const cloze = rail.find((item) => item.kind === "cloze");
    expect(cloze && cloze.kind === "cloze" ? cloze.gaps?.map((gap) => gap.before) : []).toEqual(
      authored!.fillGaps.map((gap) => gap.before),
    );
  });
});
