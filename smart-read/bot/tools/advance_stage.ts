import { defineTool } from "@cursor/bdk/tools";
import * as z from "zod/v4";
import {
  KV_STAGE_KEY,
  PIPELINE_STAGES,
  STAGE_IDS,
  isStageId,
  nextStage,
  readStage,
  type StageId,
} from "../lib/pipeline.js";

export default defineTool({
  description:
    "Move the Smart-Read pipeline to the next agent, or to an explicit stage when the user asks to jump.",
  effect: "write",
  inputSchema: z.object({
    to: z.enum(STAGE_IDS).optional(),
    reason: z.string().min(1),
  }),
  dryRunResult: ({ to, reason }) => ({
    advanced: false,
    dryRun: true,
    to: to ?? null,
    reason,
  }),
  async execute({ to, reason }, ctx) {
    const current = readStage(await ctx.host.kv.get(KV_STAGE_KEY));
    let target: StageId;
    if (to) {
      if (!isStageId(to)) {
        return { advanced: false, error: "unknown_stage", current };
      }
      target = to;
    } else {
      const upcoming = nextStage(current);
      if (!upcoming) {
        return {
          advanced: false,
          error: "already_complete",
          current,
          reason,
        };
      }
      target = upcoming;
    }
    const updatedAt = new Date().toISOString();
    await ctx.host.kv.put(KV_STAGE_KEY, { stage: target, updatedAt });
    const title = PIPELINE_STAGES.find((item) => item.id === target)?.title ?? target;
    return {
      advanced: true,
      from: current,
      to: target,
      title,
      reason,
      updatedAt,
    };
  },
});
