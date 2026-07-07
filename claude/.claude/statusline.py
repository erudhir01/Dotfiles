#!/usr/bin/env python3
# Claude Code statusLine: shows model, session token usage and cost (when available).
# Reads the statusLine JSON payload from stdin (see Claude Code docs).
import json
import sys

try:
    data = json.load(sys.stdin)
except Exception:
    data = {}

model = data.get("model", {}).get("display_name") or "?"

ctx = data.get("context_window", {}) or {}
total_input = ctx.get("total_input_tokens", 0)
total_output = ctx.get("total_output_tokens", 0)
used_pct = ctx.get("used_percentage")

cost_usd = (data.get("cost") or {}).get("total_cost_usd")

CYAN = "\033[36m"
YELLOW = "\033[33m"
GREEN = "\033[32m"
RESET = "\033[0m"

out = f"{CYAN}{model}{RESET}"
out += f" | {YELLOW}tok: {total_input}in/{total_output}out"
if used_pct is not None:
    out += f" ({round(used_pct)}% ctx)"
out += RESET

if cost_usd is not None:
    out += f" | {GREEN}${cost_usd:.4f}{RESET}"

print(out)
