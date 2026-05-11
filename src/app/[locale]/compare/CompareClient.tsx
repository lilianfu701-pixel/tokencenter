"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { models, type Model } from "@/data/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

function formatPrice(price: number) {
  return `$${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`;
}

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

const sourceColors: Record<string, string> = {
  official: "bg-green-50 text-green-700 border-green-200",
  estimated: "bg-yellow-50 text-yellow-700 border-yellow-200",
  experimental: "bg-purple-50 text-purple-700 border-purple-200",
};

function WinnerDot({ winner }: { winner: "left" | "right" | "tie" }) {
  if (winner === "tie") return null;
  return (
    <span
      className={`absolute -top-1 h-2 w-2 rounded-full bg-blue-500 ${
        winner === "left" ? "-left-3" : "-right-3"
      }`}
    />
  );
}

interface CompareRowProps {
  label: string;
  left: React.ReactNode;
  right: React.ReactNode;
  winner?: "left" | "right" | "tie";
}

function CompareRow({ label, left, right, winner }: CompareRowProps) {
  return (
    <tr className="border-b border-neutral-100 last:border-0">
      <td className="py-3 pr-4 text-sm text-neutral-500 w-40">{label}</td>
      <td className="py-3 px-4 text-sm text-center relative">
        {winner === "left" && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500" />
        )}
        {left}
      </td>
      <td className="py-3 pl-4 text-sm text-center relative">
        {winner === "right" && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500" />
        )}
        {right}
      </td>
    </tr>
  );
}

function ModelColumn({ model, tSource }: { model: Model; tSource: ReturnType<typeof useTranslations> }) {
  const t = useTranslations("compare");

  return (
    <div className="text-center">
      <p className="font-semibold text-neutral-900">{model.name}</p>
      <p className="text-sm text-neutral-500">{model.provider}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-1">
        {model.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-600"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CompareClient() {
  const t = useTranslations("compare");
  const tSource = useTranslations("dataSource");

  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");

  const left = models.find((m) => m.id === leftId);
  const right = models.find((m) => m.id === rightId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          {t("title")}
        </h1>
        <p className="mt-1 text-neutral-500">{t("subtitle")}</p>
      </div>

      {/* Model selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">{t("model1")}</label>
          <Select value={leftId} onValueChange={(v) => setLeftId(v ?? "")}>
            <SelectTrigger className="border-neutral-200">
              <SelectValue placeholder={t("selectModel")} />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.id} value={m.id} disabled={m.id === rightId}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">{t("model2")}</label>
          <Select value={rightId} onValueChange={(v) => setRightId(v ?? "")}>
            <SelectTrigger className="border-neutral-200">
              <SelectValue placeholder={t("selectModel")} />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.id} value={m.id} disabled={m.id === leftId}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comparison table */}
      {left && right ? (
        <div className="overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="py-4 pr-4 text-left text-sm font-medium text-neutral-600 w-40">
                  {t("table.feature")}
                </th>
                <th className="py-4 px-4 text-center">
                  <ModelColumn model={left} tSource={tSource} />
                </th>
                <th className="py-4 pl-4 text-center">
                  <ModelColumn model={right} tSource={tSource} />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-0 px-4">
              <CompareRow
                label={t("table.inputPrice")}
                left={<span className="font-mono font-medium">{formatPrice(left.pricing.input)}</span>}
                right={<span className="font-mono font-medium">{formatPrice(right.pricing.input)}</span>}
                winner={
                  left.pricing.input < right.pricing.input
                    ? "left"
                    : right.pricing.input < left.pricing.input
                    ? "right"
                    : "tie"
                }
              />
              <CompareRow
                label={t("table.outputPrice")}
                left={<span className="font-mono font-medium">{formatPrice(left.pricing.output)}</span>}
                right={<span className="font-mono font-medium">{formatPrice(right.pricing.output)}</span>}
                winner={
                  left.pricing.output < right.pricing.output
                    ? "left"
                    : right.pricing.output < left.pricing.output
                    ? "right"
                    : "tie"
                }
              />
              <CompareRow
                label={t("table.contextWindow")}
                left={<span className="font-mono">{formatTokens(left.contextWindow)}</span>}
                right={<span className="font-mono">{formatTokens(right.contextWindow)}</span>}
                winner={
                  left.contextWindow > right.contextWindow
                    ? "left"
                    : right.contextWindow > left.contextWindow
                    ? "right"
                    : "tie"
                }
              />
              <CompareRow
                label={t("table.maxOutput")}
                left={<span className="font-mono">{formatTokens(left.maxOutput)}</span>}
                right={<span className="font-mono">{formatTokens(right.maxOutput)}</span>}
                winner={
                  left.maxOutput > right.maxOutput
                    ? "left"
                    : right.maxOutput > left.maxOutput
                    ? "right"
                    : "tie"
                }
              />
              <CompareRow
                label={t("table.vision")}
                left={
                  left.supportsVision ? (
                    <CheckCircle2 className="mx-auto h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="mx-auto h-4 w-4 text-neutral-300" />
                  )
                }
                right={
                  right.supportsVision ? (
                    <CheckCircle2 className="mx-auto h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="mx-auto h-4 w-4 text-neutral-300" />
                  )
                }
              />
              <CompareRow
                label={t("table.tools")}
                left={
                  left.supportsTools ? (
                    <CheckCircle2 className="mx-auto h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="mx-auto h-4 w-4 text-neutral-300" />
                  )
                }
                right={
                  right.supportsTools ? (
                    <CheckCircle2 className="mx-auto h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="mx-auto h-4 w-4 text-neutral-300" />
                  )
                }
              />
              <CompareRow
                label={t("table.releaseDate")}
                left={<span className="text-neutral-600">{left.releaseDate}</span>}
                right={<span className="text-neutral-600">{right.releaseDate}</span>}
              />
              <CompareRow
                label={t("table.dataSource")}
                left={
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${sourceColors[left.dataSource]}`}
                  >
                    {tSource(left.dataSource)}
                  </span>
                }
                right={
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${sourceColors[right.dataSource]}`}
                  >
                    {tSource(right.dataSource)}
                  </span>
                }
              />
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-neutral-200 text-sm text-neutral-400">
          {t("selectModel")} ↑
        </div>
      )}
    </div>
  );
}
