const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

//Forces the tool to give us a predictable JSON file layout from Claude every turn. No need for free-form response parsing -- resposne format varies too much to do so effectively
const TURN_TOOL{
    name = "emit_turn",
    description = "Emit the next term of the tabletop as a structured data.",
    input_schema: {
        type: "object",
        properties: {
            narrative: {
                type: "string",
                description:
                    "2-4 short paragraphs describing what is happening right now, in the voice of an exercise controller/facilitator. Concrete and specific to the organization profile provided.",
            },
            consequences: {
                type: "string",
                description:
          "What resulted from the team's last decision, in plain terms. Omit or leave empty on round 1.",
            },
            situation: {
                type: "object",
                properties: {
                    elapsed_time: { type: "string" },
                    severity_trend: {
                        type: "string",
                        enum: ["escalating", "stable", "de-escalating"],
                    },
                    media_attention: { type: "integer", minimum: 0, maximum: 5 },
                    operational_impact: { type: "string" },
                    affected_areas: { type: "array", items: { type: "string" } },
                },
                required: [
          "elapsed_time",
                "severity_trend",
                "media_attention",
                "operational_impact",
                "affected_areas",
        ],
      },
decision_prompt: {
    type: "string",
        description:
    "The specific question or decision now facing the response team. This is what the human player must respond to.",
      },
is_final_round: { type: "boolean" },
    },
required: [
    "narrative",
    "situation",
    "decision_prompt",
    "is_final_round",
],
  },
};