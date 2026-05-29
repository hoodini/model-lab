"use client";

import { Lesson } from "./Lesson";
import { TrainingViz } from "./TrainingViz";
import { ShapeViz, OneHotViz, SoftmaxVsSigmoid } from "./FoundationViz";
import { DL_LESSONS } from "@/lib/dl";

/* ───────────────────────────────────────────────────────────────────────────
   Deep Learning Foundations — the math and mechanics under everything, taught
   before the "which model" academy. Three level-aware bilingual lessons:
     1. How a neural network learns   (+ animated training-loop visual)
     2. Turning the world into numbers (+ tensor ladder & one-hot visuals)
     3. What are you predicting?       (+ softmax-vs-sigmoid + decision table)
─────────────────────────────────────────────────────────────────────────── */

const byId = (id: string) => DL_LESSONS.find((l) => l.id === id)!;

export function DeepLearning() {
  return (
    <>
      <Lesson data={byId("dl-learn")}>
        <TrainingViz />
      </Lesson>

      <Lesson data={byId("dl-data")}>
        <ShapeViz />
        <OneHotViz />
      </Lesson>

      <Lesson data={byId("dl-tasks")}>
        <SoftmaxVsSigmoid />
      </Lesson>
    </>
  );
}
