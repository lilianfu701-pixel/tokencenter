#!/usr/bin/env node
/**
 * Fügt description.de zu den 19 kuratierten Modellen in models.ts hinzu
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, "../src/data/models.ts");
let src = readFileSync(PATH, "utf8");

const patches = [
  {
    pt: `pt: "GPT-4o é um modelo multimodal rápido da OpenAI, otimizado para diálogo, código e análise de imagens.",`,
    de: `de: "GPT-4o ist ein schnelles multimodales Modell von OpenAI, optimiert für Dialog, Code und Bildanalyse.",`,
  },
  {
    pt: `pt: "GPT-4.1 é a última geração da OpenAI com um milhão de tokens de contexto e melhor seguimento de instruções.",`,
    de: `de: "GPT-4.1 ist OpenAIs neueste Generation mit einer Million Token Kontext und verbesserter Anweisungsfolge.",`,
  },
  {
    pt: `pt: "GPT-5 é o modelo mais potente da OpenAI, combinando raciocínio avançado e compreensão multimodal.",`,
    de: `de: "GPT-5 ist das leistungsstärkste Modell von OpenAI und vereint fortgeschrittenes Reasoning mit multimodalem Verständnis.",`,
  },
  {
    pt: `pt: "Claude Opus é o modelo mais inteligente da Anthropic, concebido para raciocínio complexo e tarefas agênticas.",`,
    de: `de: "Claude Opus ist Anthropics intelligentestes Modell für komplexes Reasoning und agentische Aufgaben.",`,
  },
  {
    pt: `pt: "Claude Sonnet oferece o melhor equilíbrio entre inteligência e velocidade para tarefas de alto desempenho.",`,
    de: `de: "Claude Sonnet bietet das beste Gleichgewicht zwischen Intelligenz und Geschwindigkeit für Hochdurchsatz-Aufgaben.",`,
  },
  {
    pt: `pt: "Claude Haiku é o modelo mais rápido e compacto da Anthropic, com resposta quase instantânea.",`,
    de: `de: "Claude Haiku ist Anthropics schnellstes und kompaktestes Modell für nahezu sofortige Reaktionen.",`,
  },
  {
    pt: `pt: "Gemini 2.5 Pro é o modelo estrela do Google com um milhão de tokens de contexto nativo e raciocínio de ponta.",`,
    de: `de: "Gemini 2.5 Pro ist Googles leistungsstärkstes Modell mit nativem Einer-Million-Token-Kontext und modernstem Reasoning.",`,
  },
  {
    pt: `pt: "Gemini 2.0 Flash é o modelo polivalente do Google — rápido, eficiente e multimodal.",`,
    de: `de: "Gemini 2.0 Flash ist Googles Allzweckmodell — schnell, effizient und multimodal.",`,
  },
  {
    pt: `pt: "DeepSeek V3 é um modelo MoE muito competitivo para código e raciocínio geral a baixo custo.",`,
    de: `de: "DeepSeek V3 ist ein hochwettbewerbsfähiges MoE-Modell für Code und allgemeines Reasoning zu niedrigen Kosten.",`,
  },
  {
    pt: `pt: "DeepSeek R1 é um modelo de raciocínio por cadeia de pensamento que rivaliza com o o1 a uma fração do preço.",`,
    de: `de: "DeepSeek R1 ist ein Chain-of-Thought-Reasoning-Modell, das o1 zu einem Bruchteil der Kosten ebenbürtig ist.",`,
  },
  {
    pt: `pt: "Qwen 2.5 72B é o modelo open-source insignia da Alibaba, com excelentes capacidades multilingue e de código.",`,
    de: `de: "Qwen 2.5 72B ist Alibabas Open-Source-Flaggschiff mit hervorragenden mehrsprachigen und Code-Fähigkeiten.",`,
  },
  {
    pt: `pt: "Moonshot Kimi K1.5 é um modelo de raciocínio multimodal com excelente suporte do chinês.",`,
    de: `de: "Moonshot Kimi K1.5 ist ein multimodales Reasoning-Modell mit starker Unterstützung der chinesischen Sprache.",`,
  },
  {
    pt: `pt: "FLUX.1 é um modelo de geração de imagens de ponta, reconhecido pelo seu fotorrealismo e precisão.",`,
    de: `de: "FLUX.1 ist ein hochmodernes Bildgenerierungsmodell, bekannt für Fotorealismus und Prompt-Genauigkeit.",`,
  },
  {
    pt: `pt: "Midjourney v6 produz imagens artísticas impressionantes com uma qualidade estética excecional.",`,
    de: `de: "Midjourney v6 erzeugt atemberaubende künstlerische Bilder mit außergewöhnlicher ästhetischer Qualität.",`,
  },
  {
    pt: `pt: "Stable Diffusion XL é o modelo open-source de referência para geração de imagens em local.",`,
    de: `de: "Stable Diffusion XL ist das führende Open-Source-Bildgenerierungsmodell für lokale Bereitstellung.",`,
  },
  {
    pt: `pt: "Sora gera vídeos realistas e criativos a partir de texto, até 60 segundos.",`,
    de: `de: "Sora generiert realistische und fantasievolle Videos aus Textprompts mit bis zu 60 Sekunden Länge.",`,
  },
  {
    pt: `pt: "Kling AI gera vídeos de alta qualidade com movimentos realistas e transições fluidas.",`,
    de: `de: "Kling AI generiert hochwertige Videos mit realistischen Bewegungen und flüssigen Übergängen.",`,
  },
  {
    pt: `pt: "Veo 2 é o modelo de vídeo avançado do Google, com qualidade cinematográfica e compreensão física.",`,
    de: `de: "Veo 2 ist Googles fortschrittliches Videogenerierungsmodell mit kinematischer Qualität und Physikverständnis.",`,
  },
  {
    pt: `pt: "Runway Gen-3 Alpha é um poderoso modelo de geração de vídeo com acesso API para desenvolvedores.",`,
    de: `de: "Runway Gen-3 Alpha ist ein leistungsstarkes Videogenerierungsmodell mit API-Zugang für Entwickler.",`,
  },
];

let count = 0;
for (const p of patches) {
  if (src.includes(p.pt) && !src.includes(p.de)) {
    src = src.split(p.pt).join(p.pt + "\n      " + p.de);
    count++;
  }
}

writeFileSync(PATH, src, "utf8");
console.log(`✓ ${count} kuratierte Modelle mit description.de gepatcht`);
