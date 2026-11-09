## Problem Statement & Background

Visual asset pipelines in production environments face a trade-off between managed API speed and open-weight diffusion control. Commercial APIs offer low latency but enforce strict content constraints and inflexible parameters; self-hosted GPU clusters provide full parameter freedom but risk runaway cloud compute costs, cold-start latency, and driver incompatibilities across diverse GPU microarchitectures.

## Personal Role & Delivery Capacity

Sole author and principal systems architect (`sirsahol`). Designed the entire dual-tier routing architecture, declarative recipe compiler, dual-channel watchdog monitor, FastMCP tool integration, and FinOps spending safety mechanisms.

## Core Technical Constraints & Architectural Decisions

- **FinOps Spending Circuit Breaker**: Automated per-job compute budget ceiling enforced by an out-of-band watchdog process that issues unconditional container destruction commands if an instance exceeds its runtime bounds.
- **Microarchitecture Attention Invariant**: Standardized on native PyTorch Scaled Dot-Product Attention (SDPA) rather than flash-attention C++ extensions, eliminating CUDA driver compilation failures across NVIDIA Ampere, Ada, and Blackwell GPUs.
- **Fail-Safe SSH Allocation SLA**: Strict 45-second SSH handshake timeout for remote Vast.ai workers; triggers automatic instance teardown and alternative host failover upon stall.
- **Separation from CTS Commercial Catalog**: Maintained as a private, independent personal engineering asset and MCP tool rather than a CTS commercial SaaS product.

## Delivered System Topology & Technologies

Dual-engine execution routing between managed cloud endpoints and on-demand GPU micro-VMs:



- **Runtime Technologies**: Python 3.11+, Pydantic v2, Click, PyYAML, Pillow, PyTorch SDPA, ComfyUI Headless, FastMCP.
- **Interfaces**: CLI entrypoint `cip` and native Model Context Protocol (MCP) server.
