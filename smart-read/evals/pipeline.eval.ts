import { defineEval, includes } from "@cursor/bdk/evals";

export default defineEval({
  tags: ["smoke", "pipeline"],
  cases: [
    {
      id: "list-agents",
      description: "The orchestrator reads the sequenced agent pipeline.",
      async test(t) {
        await t.send("Which agents will build Smart-Read, and in what order?");
        t.succeeded();
        t.calledTool("list_pipeline");
        t.notCalledTool("advance_stage");
        t.check(t.reply, includes(/product-planner|planner/i));
      },
    },
    {
      id: "formats",
      description: "Export formats come from the supported_formats tool.",
      async test(t) {
        await t.send("Which file formats can Smart-Read convert a PDF into?");
        t.succeeded();
        t.calledTool("supported_formats");
        t.check(t.reply, includes(/epub|mobi|docx/i));
      },
    },
    {
      id: "record-plan",
      description: "A product-scope request is stored with record_plan.",
      async test(t) {
        await t.send(
          "Record this plan: goal is a browser PDF editor with TXT HTML DOCX EPUB MOBI export; notes: Vite React app, 20MB limit, no accounts.",
        );
        t.succeeded();
        t.calledTool("record_plan");
      },
    },
  ],
});
