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

function renderScenarioList() {
    const container = el("scenarioList");
    container.innerHTML = "";
    state.scenarios.forEach((s) => {
        const card = document.createElement("div");
        card.className = "option-card";
        card.setAttribute("role", "radio");
        card.setAttribute("tabindex", "0");
        card.innerHTML = `<div class="option-title">${s.label}</div><div class="option-desc">${s.description.trim()}</div>`;
        card.addEventListener("click", () => selectScenario(s.id));
        container.appendChild(card);
    });
}

function selectScenario(id) {
    state.selectedScenarioId = id;
    state.selectedSeverity = null;
    document.querySelectorAll("#scenarioList .option-card").forEach((c, i) => {
        c.classList.toggle("selected", state.scenarios[i].id === id);
    });
    renderSeverityList();
    validateStart();
}