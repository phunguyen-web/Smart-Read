import { defineTool } from "@cursor/bdk/tools";
import * as z from "zod/v4";
import { KV_PLAN_KEY, readPlan } from "../lib/pipeline.js";

export default defineTool({
  description:
    "Read the durable Smart-Read product plan recorded by the product-planner stage.",
  effect: "read",
  inputSchema: z.object({}),
  async execute(_input, ctx) {
    const plan = readPlan(await ctx.host.kv.get(KV_PLAN_KEY));
    return {
      hasPlan: plan !== null,
      plan,
    };
  },
});
