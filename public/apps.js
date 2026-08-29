const state = {
    scenarios: [],
    selectedScenarioId: null,
    selectedSeverity: null,
    sessionId: null,
    round: 0,
    roundCount: 0,
};

const el = (id) => document.getElementById(id);

async function init() {
    const res = await fetch("/api/scenarios");
    state.scenarios = await res.json();
    renderScenarioList();

    el("consentCheckbox").addEventListener("change", onConsentChange);
    el("orgProfile").addEventListener("input", validateStart);
    el("startBtn").addEventListener("click", startExercise);
    el("submitResponseBtn").addEventListener("click", submitResponse);
    el("restartBtn").addEventListener("click", () => window.location.reload());
}