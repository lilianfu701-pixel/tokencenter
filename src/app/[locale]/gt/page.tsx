import fs from "fs/promises"
import path from "path"

type HistoryItem = {
  date: string
  stars: number
  daily_growth: number
}

type Repo = {
  name: string
  category: string
  url: string
  stars: number
  forks: number
  language: string
  description: string
  created_at: string
  updated_at: string
  daily_growth: number
  weekly_growth: number
  monthly_growth: number
  growth_slope: number
  burst_time: string
  local_ai_summary?: string
  history?: HistoryItem[]
}

async function getData() {
  try {
    const filePath = path.join(process.cwd(), "public", "github-trending-ai.json")
    const file = await fs.readFile(filePath, "utf8")
    return JSON.parse(file)
  } catch {
    return { updated_at: "", categories: [], items: [] }
  }
}

function sortItems(items: Repo[], type: string) {
  if (type === "daily") return [...items].sort((a, b) => b.daily_growth - a.daily_growth)
  if (type === "weekly") return [...items].sort((a, b) => b.weekly_growth - a.weekly_growth)
  if (type === "monthly") return [...items].sort((a, b) => b.monthly_growth - a.monthly_growth)
  if (type === "new") return [...items].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
  return [...items].sort((a, b) => b.stars - a.stars)
}

export default async function GitHubTrendingPage() {
  const data = await getData()
  const items: Repo[] = data.items || []
  const categories = ["全部", ...(data.categories || [])]

  const rankingBlocks = [
    { key: "daily", title: "今日 Star 增长最快" },
    { key: "weekly", title: "本周 Star 增长最快" },
    { key: "monthly", title: "本月 Star 增长最快" },
    { key: "new", title: "最新创建项目" },
    { key: "stars", title: "总 Star 最高" },
  ]

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <section className="mb-10">
        <h1 className="text-4xl font-bold mb-4">GitHub 中文趋势榜</h1>
        <p className="text-muted-foreground max-w-3xl">
          自动追踪 GitHub 上的网站项目、AI 项目、软件工具、应用项目。数据由本地 Mac mini 抓取，
          使用本地 Ollama 大模型生成中文分析，并自动发布到网站。
        </p>
        <div className="mt-4 text-sm text-muted-foreground">
          更新时间：{data.updated_at || "暂无"}
        </div>
      </section>

      <section className="mb-10 flex flex-wrap gap-3">
        {categories.map((cat) => (
          <a
            key={cat}
            href={`#${cat}`}
            className="rounded-full border px-4 py-2 text-sm hover:bg-muted"
          >
            {cat}
          </a>
        ))}
      </section>

      {rankingBlocks.map((block) => (
        <section key={block.key} className="mb-12">
          <h2 className="mb-5 text-2xl font-bold">{block.title}</h2>

          <div className="grid gap-4 md:grid-cols-2">
            {sortItems(items, block.key).slice(0, 8).map((repo) => (
              <details key={`${block.key}-${repo.name}`} className="rounded-2xl border p-5">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{repo.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {repo.category} · {repo.language} · ⭐ {repo.stars}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <div>日增：+{repo.daily_growth || 0}</div>
                      <div>周增：+{repo.weekly_growth || 0}</div>
                      <div>月增：+{repo.monthly_growth || 0}</div>
                    </div>
                  </div>
                </summary>

                <div className="mt-4 space-y-3 text-sm">
                  <p>{repo.description || "暂无描述"}</p>

                  {repo.local_ai_summary && (
                    <div className="rounded-xl bg-muted p-3">
                      {repo.local_ai_summary}
                    </div>
                  )}

                  <div className="grid gap-2 md:grid-cols-2">
                    <div>创建时间：{repo.created_at?.slice(0, 10)}</div>
                    <div>更新时间：{repo.updated_at?.slice(0, 10)}</div>
                    <div>增长斜率：{repo.growth_slope || 0} Star/天</div>
                    <div>爆发时间：{repo.burst_time || "数据积累中"}</div>
                  </div>

                  <div className="rounded-xl border p-3">
                    <div className="mb-2 font-medium">最近 Star 增长记录</div>
                    <div className="space-y-1">
                      {(repo.history || []).slice(-10).map((h) => (
                        <div key={h.date} className="flex justify-between">
                          <span>{h.date}</span>
                          <span>⭐ {h.stars} / 日增 +{h.daily_growth}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-lg border px-4 py-2 hover:bg-muted"
                  >
                    打开 GitHub 项目
                  </a>
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}

      {categories.filter((c) => c !== "全部").map((cat) => (
        <section key={cat} id={cat} className="mb-12">
          <h2 className="mb-5 text-2xl font-bold">{cat}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {items.filter((x) => x.category === cat).slice(0, 12).map((repo) => (
              <a
                key={`${cat}-${repo.name}`}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border p-5 hover:bg-muted"
              >
                <h3 className="text-lg font-semibold">{repo.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {repo.language} · ⭐ {repo.stars} · 日增 +{repo.daily_growth || 0}
                </p>
                <p className="mt-3 text-sm">{repo.local_ai_summary || repo.description}</p>
              </a>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
