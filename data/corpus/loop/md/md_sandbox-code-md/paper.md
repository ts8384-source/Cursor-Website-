# sandbox/code.md

---
title: Sandbox — code
slug: sandbox-code
id: page:sandbox-code
type: page
nav: Code
order: 2
parent: page:sandbox
sandbox: true
sandboxLane: code
depth: long
pageBudget: 500
gist: Lab bench for code notes and patches-in-prose. Not main. Not Docker.
summaryShort: Disposable code lane
summaryLong: Coding-hat writeups land here before promote. Git fork/lab is separate. Promote copies the MD note; it does not merge the branch.
tags:
  - sandbox
  - coding
  - temporary
related:
  - page:sandbox
  - page:workbench-sandbox
  - page:agents-coding-generate
  - page:sandbox-idea
  - page:sandbox-research
updated: 2026-09-06
questions:
  - Where does a coding turn leave its writeup?
  - What does promote not do?
glossary:
  - term: code lane
    def: Sandbox tab for implement notes. The git lab is POST /api/sandbox/fork.
citations:
  - swe-agent-2024
  - gorilla-2023
  - living-papers-heer-2023
---

# Sandbox — code

Coding still uses a designed ACI [@swe-agent-2024] [@gorilla-2023]. The **writeup** for a risky change lives here so the website is the bench, not the chat transcript.

## What

`data/md/sandbox/` files with `sandboxLane: code`. Optional `sandboxFor: page:agents-coding-generate` (or whichever host page). `depth: long` — do not leave a one-liner.

## Why

The git lab (`POST /api/sandbox/fork`) is a branch / worktree. This lane is the **readable** lab. Promote copies the note to `data/md/`. It does **not** merge the branch. That merge is still discuss.

## How

1. Implement in the lab if the work is risky.
2. Write the note under this lane (`parent: page:sandbox-code`).
3. Chat: only the URL (`/site/<slug>`).
4. Human looks. `POST /api/sandbox/propose` for the git lab. `POST /api/sandbox/promote` for the MD note — phrase **promote to main**.

## Tools / MD paths

`.cursor/skills/coding-agent/SKILL.md`. `GET /api/tools`. This file: `data/md/sandbox/code.md`. [Code generation](/site/agents-coding-generate).

## Worked example

The depth-knob patch on this pass is already on main (house style). Future coding writeups start **here** unless the operator asked for a standing article.
