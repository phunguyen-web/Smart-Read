import { defineTool } from "@cursor/bdk/tools";
import * as z from "zod/v4";
import { KV_PLAN_KEY } from "../lib/pipeline.js";

export default defineTool({
  description:
    "Save the product plan after the product-planner stage (goal plus implementation notes).",
  effect: "write",
  inputSchema: z.object({
    goal: z.string().min(1),
    notes: z.string().min(1),
  }),
  dryRunResult: ({ goal, notes }) => ({
    saved: false,
    dryRun: true,
    goal,
    notes,
  }),
  async execute({ goal, notes }, ctx) {
    const recordedAt = new Date().toISOString();
    const plan = { goal, notes, recordedAt };
    await ctx.host.kv.put(KV_PLAN_KEY, plan);
    return { saved: true, plan };
  },
});
