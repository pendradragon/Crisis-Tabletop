const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

//Forces the tool to give us a predictable JSON file layout from Claude every turn. No need for free-form response parsing -- resposne format varies too much to do so effectively
const TURN_TOOL{
    name: "emit_turn",
    description:
        "Emit the next beat of the tabletop exercise as structured data.",
    input_schema: {
        type: "object",
        properties: {
            narrative: {
                type: "string",
                description:
                "2-4 paragraphs describing what is happening right now, in the voice of an exercise controller/facilitator. Concrete and specific to the organization profile provided.",
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


function buildSystemPrompt(scenario, severityLevel, orgProfile, roundCount) {
    const sev = scenario.severity_levels[severityLevel];
    return `You are the exercise controller for a tabletop crisis-response \
training exercise. You are not a real emergency authority and this is not \
a real event; everyone participating knows this is a training simulation.

SCENARIO ${scenario.label}(${scenario.category})
${scenario.description}

SEVERITY LEVEL ${severityLevel} - ${sev.label}
${sev.framing}

RELEVANT THEMES FOR THE SCENARIO (draw injects from these -- do not cover them all at once);
${scenario.inject_themes.map((t) => '-{t}').join("\n")}

THE ORGANIZATION DOING THE EXERCISE:
${orgProfile}

EXERCISE STRUCTURE:
This exercise rounds for ${roundCount} rounds. Each round you present a \
situation update and a concrete descision the response team must make, \
then, wait for their response. On the next round, incorporate the \
consequences of their last decision realistically before presenting the \
next inject. Escalate or de-escalate the situation based on the severity \
level's  escalation rate and on how well the team's decision addresses the \
themes above. Mark is_final_round as true on ${roundCount}, and \
give that round a sense of resolution (stabilization, handoff, or \
after-action framing) rather than a new cliffhanger. 

GROUND RULES:
- Stay focused on organizational decision-making: communications \
command structure, resource allocation, prioritizaion, and trade-offs \
under uncertainty. 
- For any technological/cyber-related scenario, NEVER include exploit mechanics, \
attacker tooling, or technical instructions that would have real-world \
misuse value. Keep it at the organizational response level. 
- Be concrete and specific to the organization profile given above rather \
than generic. Reference their actual departments, systems, or structure \
when it's applicable and provided. 
- Do not be gratuitious. This is a professional training tool -- not \
disaster fiction for its own sake. \
- Always respond calling the emit_turn tool. Do not respond in plain-text';
}