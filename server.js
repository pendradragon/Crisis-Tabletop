require("dotenv").config();
const express = require("express");
const { nanoid } = require("nanoid");
const path = require("path");

const { listScenarios, loadScenario } = require("./engine/scenarioLoader");
const { runTurn } = require("./engine/claudeClient");
const {
    createSession,
    getSession,
    updateSession,
    deleteSession,
} = require("./engine/sessionStore");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const DEFAULT_ROUND_COUNT = 5;

// List available disaster scenarios and their severity levels.
app.get("/api/scenarios", (req, res) => {
    res.json(listScenarios());
});

// Start a new exercise.
app.post("/api/session/start", async (req, res) => {
    try {
        const { scenarioId, severityLevel, orgProfile, consentGiven } = req.body;

        if (!consentGiven) {
            return res.status(400).json({
                error:
                    "consentGiven must be true. The upload/description disclaimer must be acknowledged before starting an exercise.",
            });
        }

        const scenario = loadScenario(scenarioId);
        if (!scenario) {
            return res.status(404).json({ error: `Unknown scenario: ${scenarioId}` });
        }
        if (!scenario.severity_levels[severityLevel]) {
            return res.status(400).json({ error: `Invalid severity level: ${severityLevel}` });
        }
        if (!orgProfile || typeof orgProfile !== "string" || orgProfile.trim().length < 10) {
            return res.status(400).json({
                error: "orgProfile must be a non-empty description of the organization being exercised.",
            });
        }

        const roundCount = scenario.default_round_count || DEFAULT_ROUND_COUNT;
        const sessionId = nanoid();

        const session = createSession({
            id: sessionId,
            scenarioId,
            severityLevel,
            orgProfile,
            roundCount,
            round: 1,
            history: [],
            createdAt: Date.now(),
        });

        const { turn } = await runTurn({
            scenario,
            severityLevel,
            orgProfile,
            roundCount,
            history: session.history,
            playerResponse: null,
        });

        const updatedHistory = [
            ...session.history,
            { role: "user", content: "Begin the exercise with round 1." },
            { role: "assistant", content: JSON.stringify(turn) },
        ];
        updateSession(sessionId, { history: updatedHistory });

        res.json({ sessionId, round: 1, roundCount, turn });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to start exercise. Check server logs." });
    }
});

// Submit a response and advance the exercise by one round.
app.post("/api/session/turn", async (req, res) => {
    try {
        const { sessionId, response } = req.body;
        const session = getSession(sessionId);
        if (!session) {
            return res.status(404).json({ error: "Session not found or expired." });
        }
        if (!response || typeof response !== "string" || !response.trim()) {
            return res.status(400).json({ error: "response must be a non-empty string." });
        }

        const scenario = loadScenario(session.scenarioId);
        const nextRound = session.round + 1;

        const { turn } = await runTurn({
            scenario,
            severityLevel: session.severityLevel,
            orgProfile: session.orgProfile,
            roundCount: session.roundCount,
            history: session.history,
            playerResponse: response,
        });

        const updatedHistory = [
            ...session.history,
            { role: "user", content: response },
            { role: "assistant", content: JSON.stringify(turn) },
        ];
        updateSession(sessionId, { history: updatedHistory, round: nextRound });

        res.json({ sessionId, round: nextRound, roundCount: session.roundCount, turn });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to advance exercise. Check server logs." });
    }
});

// End a session explicitly and drop its state (including any org profile text).
app.post("/api/session/end", (req, res) => {
    const { sessionId } = req.body;
    deleteSession(sessionId);
    res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Crisis tabletop simulator running at http://localhost:${PORT}`);
    if (!process.env.ANTHROPIC_API_KEY) {
        console.warn("WARNING: ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.");
    }
});
