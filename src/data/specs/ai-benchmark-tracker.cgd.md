## Problem Statement & Background

Public AI evaluations and leaderboard scores are scattered across disparate whitepapers, corporate blog posts, and dynamic leaderboards that frequently alter methodology or suffer from silent retrofitting. Researchers and systems architects require an immutable, machine-readable repository of frontier model evaluations paired with a fast, zero-backend interactive exploration interface.

## Personal Role & Delivery Capacity

Sole author and architect (`sirsahol`). Designed the declarative YAML evaluation schema, automated Python compilation pipeline (`build_json.py`), interactive Svelte 5 frontend, and GitHub Actions continuous deployment workflow.

## Core Technical Constraints & Architectural Decisions

- **Git-Grounded Machine-Readable Provenance**: Standardized model evaluations in versioned YAML records (`data/models/*.yaml`), ensuring every claimed benchmark score links to a verified commit and source citation.
- **Zero-Backend Static SSG Architecture**: Eliminated server maintenance and cloud hosting bills by compiling the dataset into a static JSON payload imported directly by Vite 6 and Svelte 5, serving the full dashboard over GitHub Pages.
- **Component-Driven Modernization**: Refactored legacy monolithic JavaScript into a modular Svelte 5 reactive component hierarchy with Chart.js visualization.

## Delivered System Topology & Technologies

Declarative data compilation pipeline with client-side reactive filtering:



- **Runtime Technologies**: Vite 6, Svelte 5, TypeScript, Chart.js, Python 3.10+ (build pipeline), pnpm.
- **Dataset Scope**: 32 frontier models (Gemini 3.1, GPT-5.4, Claude Opus 4.6, Llama 4, DeepSeek-R2, Kimi K2.5) across 16 canonical benchmarks (SWE-Bench, GPQA, FrontierMath, ARC-AGI-2).
