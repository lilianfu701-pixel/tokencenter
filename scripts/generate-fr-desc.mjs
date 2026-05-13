#!/usr/bin/env node
/**
 * Génère les descriptions françaises pour generated-models.json
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, "../src/data/generated-models.json");
const models = JSON.parse(readFileSync(PATH, "utf8"));

const CATEGORY_FR = {
  chat:      "dialogue généraliste",
  coding:    "génération de code",
  reasoning: "raisonnement avancé",
  image:     "génération d'images",
  video:     "génération de vidéos",
};

const SPEED_FR = {
  fast:   "rapide",
  medium: "vitesse intermédiaire",
  slow:   "plus lent mais plus puissant",
};

function fmtCtx(n) {
  if (!n || n === 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M tokens`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K tokens`;
  return `${n} tokens`;
}

function fmtPrice(input, output) {
  if (!input || input === 0) return "gratuit via OpenRouter";
  return `entrée $${input}/million de tokens, sortie $${output}/million de tokens`;
}

function genFr(m) {
  const cat   = CATEGORY_FR[m.category] ?? "modèle de langage";
  const speed = SPEED_FR[m.speed] ?? "vitesse intermédiaire";
  const ctx   = fmtCtx(m.contextWindow);
  const price = fmtPrice(m.pricing.input, m.pricing.output);

  const caps = [];
  if (m.supportsVision) caps.push("analyse d'images");
  if (m.supportsTools)  caps.push("utilisation d'outils");
  if (m.supportsLocal)  caps.push("déploiement local");
  if (m.supportsApi)    caps.push("accès API");

  const enClean = m.description.en
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\.{2,}$/, "")
    .trim();
  const firstSentence = enClean.split(/(?<=\.)\s+/)[0] ?? "";

  let desc = `${m.name} est un modèle IA de ${cat} proposé par ${m.provider}, ${speed}.`;
  if (ctx) desc += ` Fenêtre de contexte jusqu'à ${ctx}.`;
  if (caps.length > 0) desc += ` Capacités : ${caps.join(", ")}.`;
  desc += ` Tarification : ${price}.`;
  if (firstSentence && firstSentence.length > 20) {
    desc += ` (Description officielle : ${firstSentence})`;
  }
  return desc;
}

let count = 0;
for (const m of models) {
  if (!m.description.fr) {
    m.description.fr = genFr(m);
    count++;
  }
}

writeFileSync(PATH, JSON.stringify(models, null, 2), "utf8");
console.log(`✓ ${count} descriptions françaises générées`);
