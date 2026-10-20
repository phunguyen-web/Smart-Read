import { defineAgent } from "@cursor/bdk";

export default defineAgent({
  name: "Smart-Read",
  description:
    "Orchestrates specialist agents that plan and code the Smart-Read PDF editor and format-conversion web app.",
  model: {
    id: "grok-4.5",
    params: [
      { id: "effort", value: "high" },
      { id: "fast", value: "true" },
    ],
  },
});
