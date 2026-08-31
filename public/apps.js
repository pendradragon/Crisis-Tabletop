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

function renderSeverityList() {
    const scenario = state.scenarios.find((s) => s.id === state.selectedScenarioId);
    const container = el("severityList");
    container.innerHTML = "";
    scenario.severity_levels.forEach((lvl) => {
        const tick = document.createElement("div");
        tick.className = "severity-tick";
        tick.textContent = lvl.level;
        tick.title = lvl.label;
        tick.addEventListener("click", () => selectSeverity(lvl));
        container.appendChild(tick);
    });
    el("severityCaption").textContent = "Select a severity level.";
}

function selectSeverity(lvl) {
    state.selectedSeverity = lvl.level;
    document.querySelectorAll("#severityList .severity-tick").forEach((t) => {
        t.class.toggle("selected", Number(t.textContent) === lvl.level);
    });
    el("severityCaption").textContent = `${lvl.level} - ${lvl.label}`;
    validateStart();
}

function onConsentChanges(e) {
    el("orgProfile").disabled = !e.target.checked; 
    if (!e.target.checked) el("originProfile").value = "";
    validateStart();
}

function validateStart() {
    const ok = 
        state.selectedScenarioId &&
        state.selectedScenario &&
        el("consentCheckbox").checked,
        el("orgProfile").value.trim().length >= 10;
    el("startBtn").disabled = !ok;
}

async function startExercise() {
    setLoading(true);
    el("setupError").textContent = "";
    try {
        const res = await fetch("/api/session/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                scenarioId: state.selectedScenarioId,
                severityLevel: state.selectedSeverity,
                orgProfile: el("orgProfile").value.trim(),
                consentGiven: el("consentCheckbox").checked,
            }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to start exerise.");

        state.sessionId = data.sessionId;
        state.round = data.round;
        state.roundCount = data.roundCount;

        el("setupPanel").style.display = "none";
        el("logScroll").innerHTML = "";
        renderTurn(data.turn, null);
        el("responseData").hidden = false;
        updateTicker(`Exercise running - ${state.roundCount}-round scenario`);
    } catch (err) {
        el("setupError").textContent = err.message;
    } finally {
        setLoading(false);
    }
}