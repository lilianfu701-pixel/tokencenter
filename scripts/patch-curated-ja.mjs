#!/usr/bin/env node
/**
 * 19件の精選モデルに description.ja を追加する（models.ts）
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, "../src/data/models.ts");
let src = readFileSync(PATH, "utf8");

const patches = [
  {
    de: `de: "GPT-4o ist ein schnelles multimodales Modell von OpenAI, optimiert für Dialog, Code und Bildanalyse.",`,
    ja: `ja: "GPT-4oはOpenAIの高速マルチモーダルモデルで、チャット、コーディング、画像認識タスクに最適化されています。",`,
  },
  {
    de: `de: "GPT-4.1 ist OpenAIs neueste Generation mit einer Million Token Kontext und verbesserter Anweisungsfolge.",`,
    ja: `ja: "GPT-4.1はOpenAIの最新世代モデルで、100万トークンのコンテキストと優れた指示への追従性を備えています。",`,
  },
  {
    de: `de: "GPT-5 ist das leistungsstärkste Modell von OpenAI und vereint fortgeschrittenes Reasoning mit multimodalem Verständnis.",`,
    ja: `ja: "GPT-5はOpenAI最高性能のモデルで、高度な推論能力とマルチモーダル理解を統合しています。",`,
  },
  {
    de: `de: "Claude Opus ist Anthropics intelligentestes Modell für komplexes Reasoning und agentische Aufgaben.",`,
    ja: `ja: "Claude OpusはAnthropicの最高知能モデルで、複雑な推論とエージェント的タスクを得意とします。",`,
  },
  {
    de: `de: "Claude Sonnet bietet das beste Gleichgewicht zwischen Intelligenz und Geschwindigkeit für Hochdurchsatz-Aufgaben.",`,
    ja: `ja: "Claude Sonnetは知性と速度の最良バランスを実現し、高スループットのタスクに対応します。",`,
  },
  {
    de: `de: "Claude Haiku ist Anthropics schnellstes und kompaktestes Modell für nahezu sofortige Reaktionen.",`,
    ja: `ja: "Claude HaikuはAnthropicの最速・最軽量モデルで、ほぼリアルタイムの応答を実現します。",`,
  },
  {
    de: `de: "Gemini 2.5 Pro ist Googles leistungsstärkstes Modell mit nativem Einer-Million-Token-Kontext und modernstem Reasoning.",`,
    ja: `ja: "Gemini 2.5 ProはGoogleの最強モデルで、ネイティブ100万トークンコンテキストと最先端の推論能力を持ちます。",`,
  },
  {
    de: `de: "Gemini 2.0 Flash ist Googles Allzweckmodell — schnell, effizient und multimodal.",`,
    ja: `ja: "Gemini 2.0 FlashはGoogleの万能モデルで、高速・高効率・マルチモーダル対応が特徴です。",`,
  },
  {
    de: `de: "DeepSeek V3 ist ein hochwettbewerbsfähiges MoE-Modell für Code und allgemeines Reasoning zu niedrigen Kosten.",`,
    ja: `ja: "DeepSeek V3はコードと汎用推論に優れた競争力の高いMoEモデルで、低コストが魅力です。",`,
  },
  {
    de: `de: "DeepSeek R1 ist ein Chain-of-Thought-Reasoning-Modell, das o1 zu einem Bruchteil der Kosten ebenbürtig ist.",`,
    ja: `ja: "DeepSeek R1はo1に匹敵する連鎖思考推論モデルで、コストはその数分の一です。",`,
  },
  {
    de: `de: "Qwen 2.5 72B ist Alibabas Open-Source-Flaggschiff mit hervorragenden mehrsprachigen und Code-Fähigkeiten.",`,
    ja: `ja: "Qwen 2.5 72BはAlibabaのオープンソース旗艦モデルで、多言語対応とコーディング能力に優れています。",`,
  },
  {
    de: `de: "Moonshot Kimi K1.5 ist ein multimodales Reasoning-Modell mit starker Unterstützung der chinesischen Sprache.",`,
    ja: `ja: "Moonshot Kimi K1.5はマルチモーダル推論モデルで、中国語への強力なサポートを備えています。",`,
  },
  {
    de: `de: "FLUX.1 ist ein hochmodernes Bildgenerierungsmodell, bekannt für Fotorealismus und Prompt-Genauigkeit.",`,
    ja: `ja: "FLUX.1はフォトリアリズムとプロンプト精度で知られる最先端の画像生成モデルです。",`,
  },
  {
    de: `de: "Midjourney v6 erzeugt atemberaubende künstlerische Bilder mit außergewöhnlicher ästhetischer Qualität.",`,
    ja: `ja: "Midjourney v6は卓越した美的品質を持つ、息をのむほど美しいアート画像を生成します。",`,
  },
  {
    de: `de: "Stable Diffusion XL ist das führende Open-Source-Bildgenerierungsmodell für lokale Bereitstellung.",`,
    ja: `ja: "Stable Diffusion XLはローカル環境での利用に最適な、主要なオープンソース画像生成モデルです。",`,
  },
  {
    de: `de: "Sora generiert realistische und fantasievolle Videos aus Textprompts mit bis zu 60 Sekunden Länge.",`,
    ja: `ja: "Soraはテキストプロンプトから最長60秒のリアルかつ想像力豊かな動画を生成します。",`,
  },
  {
    de: `de: "Kling AI generiert hochwertige Videos mit realistischen Bewegungen und flüssigen Übergängen.",`,
    ja: `ja: "Kling AIはリアルな動きと滑らかなトランジションを持つ高品質な動画を生成します。",`,
  },
  {
    de: `de: "Veo 2 ist Googles fortschrittliches Videogenerierungsmodell mit kinematischer Qualität und Physikverständnis.",`,
    ja: `ja: "Veo 2はGoogleの高度な動画生成モデルで、映画品質と物理現象の理解力を備えています。",`,
  },
  {
    de: `de: "Runway Gen-3 Alpha ist ein leistungsstarkes Videogenerierungsmodell mit API-Zugang für Entwickler.",`,
    ja: `ja: "Runway Gen-3 Alphaは開発者向けAPIアクセスを備えた強力な動画生成モデルです。",`,
  },
];

let count = 0;
for (const p of patches) {
  if (src.includes(p.de) && !src.includes(p.ja)) {
    src = src.split(p.de).join(p.de + "\n      " + p.ja);
    count++;
  }
}

writeFileSync(PATH, src, "utf8");
console.log(`✓ ${count}件の精選モデルに description.ja を追加しました`);
