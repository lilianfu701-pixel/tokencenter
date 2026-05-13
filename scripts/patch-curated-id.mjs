#!/usr/bin/env node
/**
 * Menambahkan description.id ke 19 model pilihan di models.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, "../src/data/models.ts");
let src = readFileSync(PATH, "utf8");

const patches = [
  {
    ar: `ar: "GPT-4o نموذج متعدد الوسائط سريع من OpenAI، محسَّن للدردشة والبرمجة وتحليل الصور.",`,
    id: `id: "GPT-4o adalah model multimodal cepat dari OpenAI, dioptimalkan untuk obrolan, kode, dan analisis gambar.",`,
  },
  {
    ar: `ar: "GPT-4.1 هو الجيل الأحدث من OpenAI مع سياق مليون رمز واتباع أفضل للتعليمات.",`,
    id: `id: "GPT-4.1 adalah generasi terbaru OpenAI dengan konteks satu juta token dan kemampuan mengikuti instruksi yang lebih baik.",`,
  },
  {
    ar: `ar: "GPT-5 هو أقوى نماذج OpenAI، يجمع بين الاستدلال المتقدم والفهم متعدد الوسائط.",`,
    id: `id: "GPT-5 adalah model OpenAI paling canggih, menggabungkan penalaran tingkat lanjut dan pemahaman multimodal.",`,
  },
  {
    ar: `ar: "Claude Opus هو أذكى نماذج Anthropic للاستدلال المعقد والمهام الوكيلة.",`,
    id: `id: "Claude Opus adalah model paling cerdas dari Anthropic untuk penalaran kompleks dan tugas agentic.",`,
  },
  {
    ar: `ar: "Claude Sonnet يوفر أفضل توازن بين الذكاء والسرعة للمهام ذات الإنتاجية العالية.",`,
    id: `id: "Claude Sonnet menawarkan keseimbangan terbaik antara kecerdasan dan kecepatan untuk tugas throughput tinggi.",`,
  },
  {
    ar: `ar: "Claude Haiku هو أسرع وأخف نماذج Anthropic، يوفر استجابة شبه فورية.",`,
    id: `id: "Claude Haiku adalah model tercepat dan paling ringkas dari Anthropic, dengan respons hampir instan.",`,
  },
  {
    ar: `ar: "Gemini 2.5 Pro هو الأقوى من Google مع سياق مليون رمز أصلي وقدرات استدلال متطورة.",`,
    id: `id: "Gemini 2.5 Pro adalah model terkuat Google dengan konteks satu juta token native dan kemampuan penalaran mutakhir.",`,
  },
  {
    ar: `ar: "Gemini 2.0 Flash هو نموذج Google متعدد الأغراض — سريع وكفء ومتعدد الوسائط.",`,
    id: `id: "Gemini 2.0 Flash adalah model serbaguna Google — cepat, efisien, dan multimodal.",`,
  },
  {
    ar: `ar: "DeepSeek V3 نموذج MoE تنافسي للغاية للبرمجة والاستدلال العام بتكلفة منخفضة.",`,
    id: `id: "DeepSeek V3 adalah model MoE yang sangat kompetitif untuk kode dan penalaran umum dengan biaya rendah.",`,
  },
  {
    ar: `ar: "DeepSeek R1 نموذج استدلال بسلسلة الأفكار يضاهي o1 بجزء بسيط من تكلفته.",`,
    id: `id: "DeepSeek R1 adalah model penalaran rantai pikiran yang menyaingi o1 dengan sebagian kecil biayanya.",`,
  },
  {
    ar: `ar: "Qwen 2.5 72B هو النموذج المفتوح المصدر الرئيسي من Alibaba بإمكانيات متعددة اللغات والبرمجة.",`,
    id: `id: "Qwen 2.5 72B adalah model open-source unggulan Alibaba dengan kemampuan multibahasa dan kode yang luar biasa.",`,
  },
  {
    ar: `ar: "Moonshot Kimi K1.5 نموذج استدلال متعدد الوسائط مع دعم قوي للغة الصينية.",`,
    id: `id: "Moonshot Kimi K1.5 adalah model penalaran multimodal dengan dukungan bahasa Mandarin yang kuat.",`,
  },
  {
    ar: `ar: "FLUX.1 نموذج توليد صور متطور يُعرف بواقعيته الفوتوغرافية ودقة اتباع التعليمات.",`,
    id: `id: "FLUX.1 adalah model pembuatan gambar mutakhir yang dikenal karena realisme foto dan akurasi promptnya.",`,
  },
  {
    ar: `ar: "Midjourney v6 ينتج صورًا فنية مذهلة بجودة جمالية استثنائية.",`,
    id: `id: "Midjourney v6 menghasilkan gambar artistik yang memukau dengan kualitas estetika luar biasa.",`,
  },
  {
    ar: `ar: "Stable Diffusion XL هو النموذج المفتوح المصدر الرائد لتوليد الصور للنشر المحلي.",`,
    id: `id: "Stable Diffusion XL adalah model pembuatan gambar open-source terdepan untuk penerapan lokal.",`,
  },
  {
    ar: `ar: "Sora يولِّد مقاطع فيديو واقعية وإبداعية من التعليمات النصية بمدة تصل إلى 60 ثانية.",`,
    id: `id: "Sora menghasilkan video realistis dan imajinatif dari prompt teks hingga 60 detik.",`,
  },
  {
    ar: `ar: "Kling AI يولِّد مقاطع فيديو عالية الجودة بحركة واقعية وانتقالات سلسة.",`,
    id: `id: "Kling AI menghasilkan video berkualitas tinggi dengan gerakan realistis dan transisi yang mulus.",`,
  },
  {
    ar: `ar: "Veo 2 هو نموذج توليد فيديو متقدم من Google بجودة سينمائية وفهم للفيزياء.",`,
    id: `id: "Veo 2 adalah model pembuatan video canggih dari Google dengan kualitas sinematik dan pemahaman fisika.",`,
  },
  {
    ar: `ar: "Runway Gen-3 Alpha نموذج توليد فيديو قوي مع وصول API للمطورين.",`,
    id: `id: "Runway Gen-3 Alpha adalah model pembuatan video yang powerful dengan akses API untuk pengembang.",`,
  },
];

let count = 0;
for (const p of patches) {
  if (src.includes(p.ar) && !src.includes(p.id)) {
    src = src.split(p.ar).join(p.ar + "\n      " + p.id);
    count++;
  }
}

writeFileSync(PATH, src, "utf8");
console.log(`✓ Berhasil menambahkan description.id ke ${count} model pilihan`);
