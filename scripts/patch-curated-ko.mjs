#!/usr/bin/env node
/**
 * models.ts의 19개 정선 모델에 description.ko를 추가합니다
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, "../src/data/models.ts");
let src = readFileSync(PATH, "utf8");

const patches = [
  {
    ja: `ja: "GPT-4oはOpenAIの高速マルチモーダルモデルで、チャット、コーディング、画像認識タスクに最適化されています。",`,
    ko: `ko: "GPT-4o는 OpenAI의 빠른 멀티모달 모델로, 채팅, 코딩, 이미지 인식 작업에 최적화되어 있습니다.",`,
  },
  {
    ja: `ja: "GPT-4.1はOpenAIの最新世代モデルで、100万トークンのコンテキストと優れた指示への追従性を備えています。",`,
    ko: `ko: "GPT-4.1은 OpenAI의 최신 세대 모델로, 100만 토큰 컨텍스트와 향상된 지시 따르기 능력을 갖추고 있습니다.",`,
  },
  {
    ja: `ja: "GPT-5はOpenAI最高性能のモデルで、高度な推論能力とマルチモーダル理解を統合しています。",`,
    ko: `ko: "GPT-5는 OpenAI의 가장 강력한 모델로, 고급 추론 능력과 멀티모달 이해를 결합했습니다.",`,
  },
  {
    ja: `ja: "Claude OpusはAnthropicの最高知能モデルで、複雑な推論とエージェント的タスクを得意とします。",`,
    ko: `ko: "Claude Opus는 Anthropic의 가장 지능적인 모델로, 복잡한 추론과 에이전트 작업에 특화되어 있습니다.",`,
  },
  {
    ja: `ja: "Claude Sonnetは知性と速度の最良バランスを実現し、高スループットのタスクに対応します。",`,
    ko: `ko: "Claude Sonnet은 지능과 속도의 최적 균형을 제공하여 고처리량 작업에 적합합니다.",`,
  },
  {
    ja: `ja: "Claude HaikuはAnthropicの最速・最軽量モデルで、ほぼリアルタイムの応答を実現します。",`,
    ko: `ko: "Claude Haiku는 Anthropic의 가장 빠르고 경량화된 모델로, 거의 실시간에 가까운 응답을 제공합니다.",`,
  },
  {
    ja: `ja: "Gemini 2.5 ProはGoogleの最強モデルで、ネイティブ100万トークンコンテキストと最先端の推論能力を持ちます。",`,
    ko: `ko: "Gemini 2.5 Pro는 Google의 가장 강력한 모델로, 네이티브 100만 토큰 컨텍스트와 최첨단 추론 능력을 갖추고 있습니다.",`,
  },
  {
    ja: `ja: "Gemini 2.0 FlashはGoogleの万能モデルで、高速・高効率・マルチモーダル対応が特徴です。",`,
    ko: `ko: "Gemini 2.0 Flash는 Google의 만능 모델로, 빠르고 효율적이며 멀티모달을 지원합니다.",`,
  },
  {
    ja: `ja: "DeepSeek V3はコードと汎用推論に優れた競争力の高いMoEモデルで、低コストが魅力です。",`,
    ko: `ko: "DeepSeek V3는 코딩과 범용 추론에 강한 경쟁력 있는 MoE 모델로, 저렴한 비용이 매력입니다.",`,
  },
  {
    ja: `ja: "DeepSeek R1はo1に匹敵する連鎖思考推論モデルで、コストはその数分の一です。",`,
    ko: `ko: "DeepSeek R1은 o1에 필적하는 연쇄 사고 추론 모델로, 비용은 그 몇 분의 일에 불과합니다.",`,
  },
  {
    ja: `ja: "Qwen 2.5 72BはAlibabaのオープンソース旗艦モデルで、多言語対応とコーディング能力に優れています。",`,
    ko: `ko: "Qwen 2.5 72B는 Alibaba의 오픈소스 대표 모델로, 뛰어난 다국어 지원과 코딩 능력을 갖추고 있습니다.",`,
  },
  {
    ja: `ja: "Moonshot Kimi K1.5はマルチモーダル推論モデルで、中国語への強力なサポートを備えています。",`,
    ko: `ko: "Moonshot Kimi K1.5는 강력한 중국어 지원을 갖춘 멀티모달 추론 모델입니다.",`,
  },
  {
    ja: `ja: "FLUX.1はフォトリアリズムとプロンプト精度で知られる最先端の画像生成モデルです。",`,
    ko: `ko: "FLUX.1은 사실적인 이미지 품질과 프롬프트 정확성으로 알려진 최첨단 이미지 생성 모델입니다.",`,
  },
  {
    ja: `ja: "Midjourney v6は卓越した美的品質を持つ、息をのむほど美しいアート画像を生成します。",`,
    ko: `ko: "Midjourney v6는 탁월한 미적 품질을 자랑하는 놀라운 예술 이미지를 생성합니다.",`,
  },
  {
    ja: `ja: "Stable Diffusion XLはローカル環境での利用に最適な、主要なオープンソース画像生成モデルです。",`,
    ko: `ko: "Stable Diffusion XL은 로컬 배포를 위한 대표적인 오픈소스 이미지 생성 모델입니다.",`,
  },
  {
    ja: `ja: "Soraはテキストプロンプトから最長60秒のリアルかつ想像力豊かな動画を生成します。",`,
    ko: `ko: "Sora는 텍스트 프롬프트에서 최대 60초 분량의 현실적이고 창의적인 영상을 생성합니다.",`,
  },
  {
    ja: `ja: "Kling AIはリアルな動きと滑らかなトランジションを持つ高品質な動画を生成します。",`,
    ko: `ko: "Kling AI는 사실적인 움직임과 부드러운 전환을 갖춘 고품질 영상을 생성합니다.",`,
  },
  {
    ja: `ja: "Veo 2はGoogleの高度な動画生成モデルで、映画品質と物理現象の理解力を備えています。",`,
    ko: `ko: "Veo 2는 Google의 고급 영상 생성 모델로, 영화 수준의 품질과 물리 현상 이해 능력을 갖추고 있습니다.",`,
  },
  {
    ja: `ja: "Runway Gen-3 Alphaは開発者向けAPIアクセスを備えた強力な動画生成モデルです。",`,
    ko: `ko: "Runway Gen-3 Alpha는 개발자를 위한 API 접근을 제공하는 강력한 영상 생성 모델입니다.",`,
  },
];

let count = 0;
for (const p of patches) {
  if (src.includes(p.ja) && !src.includes(p.ko)) {
    src = src.split(p.ja).join(p.ja + "\n      " + p.ko);
    count++;
  }
}

writeFileSync(PATH, src, "utf8");
console.log(`✓ ${count}개의 정선 모델에 description.ko를 추가했습니다`);
