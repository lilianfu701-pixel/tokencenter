import json, time, subprocess, os
from datetime import datetime, timezone
from pathlib import Path
import requests

MODEL = "qwen2.5:7b"

ROOT = Path("/Users/macserver/Projects/tokencenter")
DATA_FILE = ROOT / "public/github-trending-ai.json"
HISTORY_FILE = ROOT / "public/github-trending-history.json"

CATEGORIES = {
    "AI项目": ["ai agent", "llm", "mcp", "ollama", "claude code", "local ai"],
    "网站项目": ["nextjs", "website", "saas", "dashboard", "cms"],
    "软件工具": ["developer tool", "cli", "automation", "productivity"],
    "应用项目": ["app", "mobile app", "desktop app", "chrome extension"],
}

def ask_ollama(repo):

    prompt = f"""
请把这个 GitHub 项目翻译并详细介绍成中文。

项目名：
{repo["name"]}

原始简介：
{repo.get("description","")}

语言：
{repo.get("language","Unknown")}

Star：
{repo["stars"]}

要求：

1. 中文翻译
2. 保留原项目核心信息
3. 说明项目是干什么的
4. 适合什么用户
5. 为什么值得关注
6. 不超过220字
7. 不要废话
"""

    try:
        r = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": False,
            },
            timeout=120,
        )

        return r.json().get("response", "").strip()

    except Exception as e:
        return repo.get("description", "")

def load_history():
    if HISTORY_FILE.exists():
        return json.loads(HISTORY_FILE.read_text("utf-8"))
    return {}

def save_history(history):
    HISTORY_FILE.write_text(json.dumps(history, ensure_ascii=False, indent=2), "utf-8")

def calc_growth(history, name, current_stars):
    records = history.get(name, [])
    if not records:
        return {"daily": 0, "weekly": 0, "monthly": 0, "slope": 0, "burst_time": "数据积累中"}

    latest = records[-1]["stars"]
    daily = current_stars - latest

    weekly_base = records[-7]["stars"] if len(records) >= 7 else records[0]["stars"]
    monthly_base = records[-30]["stars"] if len(records) >= 30 else records[0]["stars"]

    weekly = current_stars - weekly_base
    monthly = current_stars - monthly_base

    days = max(len(records), 1)
    slope = round((current_stars - records[0]["stars"]) / days, 2)

    burst = max(records, key=lambda x: x.get("daily_growth", 0)) if records else None
    burst_time = burst["date"] if burst and burst.get("daily_growth", 0) > 0 else "数据积累中"

    return {
        "daily": daily,
        "weekly": weekly,
        "monthly": monthly,
        "slope": slope,
        "burst_time": burst_time,
    }

def fetch_category(category, keywords):
    results = []

    for kw in keywords:
        r = requests.get(
            "https://api.github.com/search/repositories",
            params={
                "q": f'{kw} stars:>100 pushed:>2026-01-01',
                "sort": "stars",
                "order": "desc",
                "per_page": 2,
            },
            timeout=30,
        )
        data = r.json()

        for item in data.get("items", []):
            name = item["full_name"]
            if any(x["name"] == name for x in results):
                continue

            results.append({
                "name": name,
                "category": category,
                "url": item["html_url"],
                "stars": item["stargazers_count"],
                "forks": item["forks_count"],
                "language": item.get("language") or "Unknown",
                "description": item.get("description") or "",
                "created_at": item["created_at"],
                "updated_at": item["updated_at"],
            })

        time.sleep(2)

    return results

def git_push():
    subprocess.run(["git", "add", "public/github-trending-ai.json", "public/github-trending-history.json"], cwd=ROOT)
    subprocess.run(["git", "commit", "-m", "Update GitHub trending rankings"], cwd=ROOT)
    subprocess.run(["git", "push"], cwd=ROOT)

def main():
    today = datetime.now(timezone.utc).date().isoformat()
    history = load_history()
    all_repos = []

    for category, keywords in CATEGORIES.items():
        all_repos += fetch_category(category, keywords)

    dedup = {}
    for repo in all_repos:
        dedup[repo["name"]] = repo

    final = []

    for repo in dedup.values():
        name = repo["name"]
        current = repo["stars"]

        old_records = history.get(name, [])
        last_stars = old_records[-1]["stars"] if old_records else current
        daily_growth = current - last_stars

        record = {
            "date": today,
            "stars": current,
            "daily_growth": daily_growth,
        }

        if not old_records or old_records[-1]["date"] != today:
            old_records.append(record)
        else:
            old_records[-1] = record

        history[name] = old_records[-60:]

        growth = calc_growth(history, name, current)

        repo.update({
            "daily_growth": growth["daily"],
            "weekly_growth": growth["weekly"],
            "monthly_growth": growth["monthly"],
            "growth_slope": growth["slope"],
            "burst_time": growth["burst_time"],
            "history": history[name][-30:],
            "local_ai_summary": ask_ollama(repo),
        })

        final.append(repo)
        time.sleep(1)

    output = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "title": "GitHub中文趋势榜",
        "categories": list(CATEGORIES.keys()),
        "items": final,
    }

    DATA_FILE.write_text(json.dumps(output, ensure_ascii=False, indent=2), "utf-8")
    save_history(history)
    git_push()

if __name__ == "__main__":
    main()
