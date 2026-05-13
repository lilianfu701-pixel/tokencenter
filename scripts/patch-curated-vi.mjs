#!/usr/bin/env node
/**
 * Thêm description.vi vào 19 mô hình được tuyển chọn trong models.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, "../src/data/models.ts");
let src = readFileSync(PATH, "utf8");

const patches = [
  {
    id: `id: "GPT-4o adalah model multimodal cepat dari OpenAI, dioptimalkan untuk obrolan, kode, dan analisis gambar.",`,
    vi: `vi: "GPT-4o là mô hình đa phương thức nhanh của OpenAI, được tối ưu hóa cho trò chuyện, lập trình và phân tích ảnh.",`,
  },
  {
    id: `id: "GPT-4.1 adalah generasi terbaru OpenAI dengan konteks satu juta token dan kemampuan mengikuti instruksi yang lebih baik.",`,
    vi: `vi: "GPT-4.1 là thế hệ mới nhất của OpenAI với ngữ cảnh một triệu token và khả năng theo dõi hướng dẫn được cải thiện.",`,
  },
  {
    id: `id: "GPT-5 adalah model OpenAI paling canggih, menggabungkan penalaran tingkat lanjut dan pemahaman multimodal.",`,
    vi: `vi: "GPT-5 là mô hình mạnh mẽ nhất của OpenAI, kết hợp suy luận nâng cao và hiểu biết đa phương thức.",`,
  },
  {
    id: `id: "Claude Opus adalah model paling cerdas dari Anthropic untuk penalaran kompleks dan tugas agentic.",`,
    vi: `vi: "Claude Opus là mô hình thông minh nhất của Anthropic dành cho suy luận phức tạp và các tác vụ agentic.",`,
  },
  {
    id: `id: "Claude Sonnet menawarkan keseimbangan terbaik antara kecerdasan dan kecepatan untuk tugas throughput tinggi.",`,
    vi: `vi: "Claude Sonnet mang lại sự cân bằng tốt nhất giữa trí thông minh và tốc độ cho các tác vụ thông lượng cao.",`,
  },
  {
    id: `id: "Claude Haiku adalah model tercepat dan paling ringkas dari Anthropic, dengan respons hampir instan.",`,
    vi: `vi: "Claude Haiku là mô hình nhanh nhất và nhỏ gọn nhất của Anthropic, với phản hồi gần như tức thì.",`,
  },
  {
    id: `id: "Gemini 2.5 Pro adalah model terkuat Google dengan konteks satu juta token native dan kemampuan penalaran mutakhir.",`,
    vi: `vi: "Gemini 2.5 Pro là mô hình mạnh nhất của Google với ngữ cảnh một triệu token gốc và khả năng suy luận tiên tiến.",`,
  },
  {
    id: `id: "Gemini 2.0 Flash adalah model serbaguna Google — cepat, efisien, dan multimodal.",`,
    vi: `vi: "Gemini 2.0 Flash là mô hình đa năng của Google — nhanh, hiệu quả và đa phương thức.",`,
  },
  {
    id: `id: "DeepSeek V3 adalah model MoE yang sangat kompetitif untuk kode dan penalaran umum dengan biaya rendah.",`,
    vi: `vi: "DeepSeek V3 là mô hình MoE rất cạnh tranh cho lập trình và suy luận tổng quát với chi phí thấp.",`,
  },
  {
    id: `id: "DeepSeek R1 adalah model penalaran rantai pikiran yang menyaingi o1 dengan sebagian kecil biayanya.",`,
    vi: `vi: "DeepSeek R1 là mô hình suy luận chuỗi suy nghĩ sánh ngang o1 với một phần nhỏ chi phí.",`,
  },
  {
    id: `id: "Qwen 2.5 72B adalah model open-source unggulan Alibaba dengan kemampuan multibahasa dan kode yang luar biasa.",`,
    vi: `vi: "Qwen 2.5 72B là mô hình mã nguồn mở hàng đầu của Alibaba với khả năng đa ngôn ngữ và lập trình xuất sắc.",`,
  },
  {
    id: `id: "Moonshot Kimi K1.5 adalah model penalaran multimodal dengan dukungan bahasa Mandarin yang kuat.",`,
    vi: `vi: "Moonshot Kimi K1.5 là mô hình suy luận đa phương thức với hỗ trợ tiếng Trung mạnh mẽ.",`,
  },
  {
    id: `id: "FLUX.1 adalah model pembuatan gambar mutakhir yang dikenal karena realisme foto dan akurasi promptnya.",`,
    vi: `vi: "FLUX.1 là mô hình tạo ảnh tiên tiến, nổi tiếng với độ chân thực như ảnh chụp và độ chính xác theo prompt.",`,
  },
  {
    id: `id: "Midjourney v6 menghasilkan gambar artistik yang memukau dengan kualitas estetika luar biasa.",`,
    vi: `vi: "Midjourney v6 tạo ra những hình ảnh nghệ thuật tuyệt đẹp với chất lượng thẩm mỹ vượt trội.",`,
  },
  {
    id: `id: "Stable Diffusion XL adalah model pembuatan gambar open-source terdepan untuk penerapan lokal.",`,
    vi: `vi: "Stable Diffusion XL là mô hình tạo ảnh mã nguồn mở hàng đầu cho triển khai cục bộ.",`,
  },
  {
    id: `id: "Sora menghasilkan video realistis dan imajinatif dari prompt teks hingga 60 detik.",`,
    vi: `vi: "Sora tạo ra các video chân thực và sáng tạo từ prompt văn bản dài đến 60 giây.",`,
  },
  {
    id: `id: "Kling AI menghasilkan video berkualitas tinggi dengan gerakan realistis dan transisi yang mulus.",`,
    vi: `vi: "Kling AI tạo ra video chất lượng cao với chuyển động chân thực và hiệu ứng chuyển tiếp mượt mà.",`,
  },
  {
    id: `id: "Veo 2 adalah model pembuatan video canggih dari Google dengan kualitas sinematik dan pemahaman fisika.",`,
    vi: `vi: "Veo 2 là mô hình tạo video tiên tiến của Google với chất lượng điện ảnh và khả năng hiểu vật lý.",`,
  },
  {
    id: `id: "Runway Gen-3 Alpha adalah model pembuatan video yang powerful dengan akses API untuk pengembang.",`,
    vi: `vi: "Runway Gen-3 Alpha là mô hình tạo video mạnh mẽ với quyền truy cập API dành cho nhà phát triển.",`,
  },
];

let count = 0;
for (const p of patches) {
  if (src.includes(p.id) && !src.includes(p.vi)) {
    src = src.split(p.id).join(p.id + "\n      " + p.vi);
    count++;
  }
}

writeFileSync(PATH, src, "utf8");
console.log(`✓ Đã thêm description.vi vào ${count} mô hình được tuyển chọn`);
