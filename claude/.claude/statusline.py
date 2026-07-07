#!/usr/bin/env python3
# Claude Code statusLine: shows model, session token usage and cost (when available).
# Reads the statusLine JSON payload from stdin (see Claude Code docs).
# Colors follow the Catppuccin Mocha palette (matches starship in this dotfiles setup).
import json
import sys


def rgb(hex_color):
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    return f"\033[38;2;{r};{g};{b}m"


BLUE = rgb("89b4fa")
PEACH = rgb("fab387")
GREEN = rgb("a6e3a1")
YELLOW = rgb("f9e2af")
RED = rgb("f38ba8")
OVERLAY0 = rgb("6c7086")
RESET = "\033[0m"

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

sep = f"{OVERLAY0} | {RESET}"

out = f"{BLUE}{model}{RESET}"
out += sep
out += f"{PEACH}tok: {total_input}in/{total_output}out{RESET}"

if used_pct is not None:
    pct = round(used_pct)
    if pct < 50:
        pct_color = GREEN
    elif pct < 80:
        pct_color = YELLOW
    else:
        pct_color = RED
    out += f" {pct_color}({pct}% ctx){RESET}"

if cost_usd is not None:
    out += sep
    out += f"{GREEN}${cost_usd:.4f}{RESET}"

print(out)
