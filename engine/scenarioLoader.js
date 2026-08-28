const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const SCENARIOS_DIR = path.join(__dirname, "..", "scenarios");

function listScenarios() {
    return fs
        .readdirSync(SCENARIOS_DIR)
        .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
        .map((f) => {
            const doc = yaml.load(
                fs.readFileSync(path.join(SCENARIOS_DIR, f), "utf-8")
            );
            return {
                id: doc.id,
                label: doc.label,
                category: doc.category,
                description: doc.description,
                severity_levels: Object.entries(doc.severity_levels).map(
                    ([level, v] =>({ level: Number(level), label: v.label })
                ),
            };
        });
}