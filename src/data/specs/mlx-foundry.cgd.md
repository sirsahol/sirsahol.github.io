## Problem Statement & Background

Running local LLMs and vision models on edge hardware frequently suffers from memory bottlenecks, inconsistent quantization formats, and cumbersome publishing workflows. Developers on macOS require a reproducible CLI pipeline to convert upstream HuggingFace weights into optimized Apple MLX formats without manual tensor reshaping or ad-hoc benchmarking scripts.

## Personal Role & Delivery Capacity

Sole author and system architect (`SirSahOl`). Designed the end-to-end Python CLI pipeline (`mlx-foundry`), multi-quantization runner, memory profiler, automated model card generator, and Hugging Face Hub publishing integration from scratch.

## Core Technical Constraints & Architectural Decisions

- **Zero-Copy Unified Memory Utilization**: Leverages Apple Silicon unified memory architecture via `mlx-lm` to convert weights without allocating duplicate Host-Device RAM buffers.
- **Fail-Closed Backend Compilation**: Evaluated dual backend targets (Apple MLX and Google AI Edge LiteRT). Designed LiteRT-LM export to fail closed when `ai-edge-torch` or `mediapipe-genai` compilers are absent, guaranteeing no corrupted flatbuffers or placeholder weights are published.
- **Publication Gate Separation**: Strictly separated personal Hugging Face releases under `SirSahOl` from Creative Tech Studios commercial assets, ensuring transparent individual authorship.

## Delivered System Topology & Technologies

The system exposes the `mlx-foundry` CLI powered by Typer and Rich:



- **Runtime Technologies**: Python 3.10+, `mlx-lm>=0.20.0`, `huggingface-hub>=0.25.0`, `typer`, `rich`, `jinja2`, `psutil`.
- **Packaging**: Standardized Hatchling build packaging with PyPI release specification `v0.3.0`.
