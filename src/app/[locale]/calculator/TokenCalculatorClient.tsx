"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { encode } from "gpt-tokenizer";
import { models } from "@/data/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function formatUSD(amount: number) {
  if (amount === 0) return "$0.00";
  if (amount < 0.0001) return `$${amount.toExponential(2)}`;
  return `$${amount.toFixed(4)}`;
}

export default function TokenCalculatorClient() {
  const t = useTranslations("calculator");

  const [text, setText] = useState("");
  const [modelId, setModelId] = useState<string>("");
  const [outputTokens, setOutputTokens] = useState<number>(500);

  const selectedModel = models.find((m) => m.id === modelId);

  const tokenCount = useMemo(() => {
    if (!text) return 0;
    try {
      return encode(text).length;
    } catch {
      return Math.round(text.length / 4);
    }
  }, [text]);

  const inputCost = useMemo(() => {
    if (!selectedModel || tokenCount === 0) return 0;
    return (tokenCount / 1_000_000) * selectedModel.pricing.input;
  }, [selectedModel, tokenCount]);

  const outputCost = useMemo(() => {
    if (!selectedModel || outputTokens === 0) return 0;
    return (outputTokens / 1_000_000) * selectedModel.pricing.output;
  }, [selectedModel, outputTokens]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          {t("title")}
        </h1>
        <p className="mt-1 text-neutral-500">{t("subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input panel */}
        <Card className="border-neutral-200 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">{t("inputLabel")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="h-48 w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-800 placeholder-neutral-400 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-colors"
              placeholder={t("inputPlaceholder")}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                {t("modelLabel")}
              </label>
              <Select value={modelId} onValueChange={(v) => setModelId(v ?? "")}>
                <SelectTrigger className="border-neutral-200">
                  <SelectValue placeholder={t("selectModel")} />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                {t("outputTokensLabel")}
              </label>
              <Input
                type="number"
                min={0}
                value={outputTokens}
                onChange={(e) => setOutputTokens(Number(e.target.value))}
                className="border-neutral-200"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setText("");
                setModelId("");
                setOutputTokens(500);
              }}
            >
              {t("clear")}
            </Button>
          </CardContent>
        </Card>

        {/* Results panel */}
        <Card className="border-neutral-200 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ResultRow label={t("results.tokenCount")} value={tokenCount.toLocaleString()} />
            <Separator />
            <ResultRow label={t("results.inputCost")} value={formatUSD(inputCost)} mono />
            <ResultRow label={t("results.outputCost")} value={formatUSD(outputCost)} mono />
            <Separator />
            <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3">
              <span className="text-sm font-semibold text-neutral-700">
                {t("results.totalCost")}
              </span>
              <span className="font-mono text-lg font-semibold text-neutral-900">
                {formatUSD(inputCost + outputCost)}
              </span>
            </div>

            {selectedModel && (
              <div className="mt-4 rounded-lg border border-neutral-200 p-4 text-sm space-y-1">
                <p className="font-medium text-neutral-700">{selectedModel.name}</p>
                <p className="text-neutral-500">
                  Input: ${selectedModel.pricing.input} · Output: ${selectedModel.pricing.output} / 1M tokens
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-600">{label}</span>
      <span className={`text-sm font-medium text-neutral-900 ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}
