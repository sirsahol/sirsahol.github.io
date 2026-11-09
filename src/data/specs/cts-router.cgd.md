## Problem Statement & Background

Software engineers and AI application developers in emerging markets and global environments face fragmented access to frontier model providers, prohibitive international card payment restrictions, and privacy risks associated with persistent logging of prompt payloads. CTS Router was engineered as a high-throughput, OpenAI-compatible developer portal and model routing gateway providing transparent cached-input pricing, regional fiat checkout, non-custodial crypto settlement, and zero-retention transit.

## Personal Role & Delivery Capacity

Principal Architect and Full-Stack Implementer. Designed and developed the Next.js 16 / React 19 web portal, cryptographic API key issuance engine, native BIP-84 SegWit address derivation pipeline, Paystack payment integration, and gated public model catalog API. Configured live deployment and radiometry monitoring at `router.creativetechstudios.org`.

## Core Technical Constraints & Architectural Decisions

- **Dual-Currency Billing Architecture**: Integrated regional fiat checkout via Paystack (cards, bank transfer, USSD in Nigerian Naira ₦) alongside native on-chain Bitcoin (BTC) and Litecoin (LTC) top-ups using BIP-84 native SegWit derivation (`bc1q...`, `ltc1q...`). This provides non-custodial cryptographic verification without relying on third-party crypto payment processors.
- **Ephemeral-Transit Guard Pipeline**: Integrated lightweight transit guard sanitization providing prompt injection filtering and sensitive entity redaction in ephemeral memory buffers without durable disk persistence of prompt payloads.
- **Fail-Closed Public Model Catalog**: Implemented strict catalog validation where `GET /api/v1/models` filters candidate routes against verified provider availability, approved positive pricing, and active status. Internal preview routes and administrative test endpoints are excluded by default.
- **Modern Obsidian Visual Architecture**: Built with Next.js 16, React 19, and Tailwind CSS v4, adhering to a high-density Obsidian aesthetic (`#080D18`), noble metallic accents, responsive mobile navigation, and real-time radiometry telemetry (`/console/radiometry`).

## Delivered System Topology & Technologies

CTS Router operates as the client-facing gateway front-end connected to platform infrastructure:



- **Runtime Technologies**: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, TypeScript, PostgreSQL (via platform-core data plane).
- **Billing Integrations**: Paystack API, BIP-84 Hierarchical Deterministic wallet derivation for BTC and LTC.
- **Compatibility**: 100% drop-in drop replacement for OpenAI Python SDK, Anthropic client proxies, Claude Code CLI, and Cursor IDE.
