import { defineTool } from "@cursor/bdk/tools";
import * as z from "zod/v4";
import {
  KV_STAGE_KEY,
  PIPELINE_STAGES,
  nextStage,
  readStage,
} from "../lib/pipeline.js";

export default defineTool({
  description:
    "Read the ordered Smart-Read agent pipeline and the current stage. Call this before delegating or advancing.",
  effect: "read",
  inputSchema: z.object({}),
  async execute(_input, ctx) {
    const stage = readStage(await ctx.host.kv.get(KV_STAGE_KEY));
    const current = PIPELINE_STAGES.find((item) => item.id === stage) ?? PIPELINE_STAGES[0];
    const upcoming = nextStage(stage);
    return {
      currentStage: current.id,
      currentTitle: current.title,
      nextStage: upcoming,
      stages: PIPELINE_STAGES.map((item, index) => ({
        order: index + 1,
        id: item.id,
        subagent: item.subagent,
        title: item.title,
        summary: item.summary,
        active: item.id === stage,
      })),
    };
  },
});
