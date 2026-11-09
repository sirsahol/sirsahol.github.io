## Problem Statement & Background

Autonomous agent workflows across heterogeneous workstations, virtual machines, and cloud sandboxes suffer from configuration drift, unauthorized capability exposure, and repository pollution when skills or prompt instructions are committed directly into codebases. The agent fleet required a centralized trust boundary ensuring that agent tools are vetted at a single authoring point, verified cryptographically before consumption, and dynamically mounted for temporary execution sessions without permanent repository changes.

## Personal Role & Delivery Capacity

Sole Architect and Author (`SirSahOl`). Conceived, designed, and implemented the entire `skills-mesh` trust architecture, including the parameterized resolver (`scripts/skills_resolver.py`), pack integrity validator (`scripts/verify-pack.py`), installer (`scripts/install-pack.sh`), capability profile schemas (`pack/capabilities.json`), and the mode-`0600` JSONL audit subsystem.

## Core Technical Constraints & Architectural Decisions

- **Single Authoring Node with Read-Only Consumer Nodes**: Enforced a strict trust model where new agent capabilities are inspected, vetted, and committed solely on the primary workstation (macOS). Heterogeneous consumers (cloud sandboxes, headless VMs, GPU servers) pull the repository strictly read-only.
- **Pre-Install Cryptographic Manifest Verification**: Consumers are prohibited from mounting or installing skills without verifying `manifest.sha256`. The installer automatically creates timestamped backups of active configs, runs schema validations, and applies files into `~/.gemini/skills/config` without altering unmanaged user configurations.
- **Ephemeral Session Mounts with SHA-256 Tree Hashing**: Replaced permanent skill check-ins with isolated workspace session mounts under `<workspace>/.agent/session_skills/<session>/`. Each mounted skill records a per-skill SHA-256 tree digest in `manifest.json`. Sessions automatically expire and prune after an 8-hour TTL (`session_ttl_hours: 8`).
- **Hardened Append-Only Audit Trail**: Every resolution, mount, unmount, and pruning operation writes a deterministic JSONL record to `~/.gemini/skills/audit/skills-audit.jsonl` with strict POSIX permissions (`0600`).

## Delivered System Topology & Technologies

Architectural layout of the vetting, distribution, and mounting lifecycle:



- **Core Technologies**: Python 3.10+ standard library, POSIX shell scripts, JSONL streaming, SHA-256 cryptographic hashing.
- **Integration Sinks**: OpenCode, Claude Code, Google Antigravity, JeikCode.
