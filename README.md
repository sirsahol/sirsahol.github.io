# Saheed Olaide — Systems Architecture & Engineering Portfolio

[![Astro](https://img.shields.io/badge/Astro-5.0-BC52EE?style=flat-square&logo=astro&logoColor=white)](https://astro.build/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PageSpeed](https://img.shields.io/badge/PageSpeed-100%2F100-10B981?style=flat-square&logo=googlechrome&logoColor=white)](https://pagespeed.web.dev/)
[![Accessibility](https://img.shields.io/badge/A11y-WCAG_AAA-blue?style=flat-square)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![License: MIT](https://img.shields.io/badge/License-MIT-slate?style=flat-square)](LICENSE)

Technical portfolio and systems architecture showcase for **Saheed Olaide** (`@sirsahol`), Principal Systems Architect & Technical Operator.

Designed with an unboxed, editorial documentation aesthetic, this repository showcases production systems across on-device Apple Silicon quantization, distributed device meshes, high-trust edge cloud infrastructure, and deployed web applications.

Live Site: **[sirsahol.github.io](https://sirsahol.github.io)**

---

## Architecture

Built with **Astro 5 Static Site Generation (SSG)**. The entire site compiles to pure, zero-runtime semantic HTML and CSS with structured `/llms.txt` machine discovery.

---

## Featured Systems & Specifications

| System | Domain | Technical Highlights |
|:---|:---|:---|
| **[MLX Foundry](https://sirsahol.github.io/projects/mlx-foundry)** | Edge ML & Quantization | Apple Silicon unified RAM quantization (4/8/16-bit) and Google AI Edge LiteRT-LM flatbuffer compilation. |
| **[Silicon-Grounder](https://sirsahol.github.io/projects/silicon-grounder)** | OS Automation | FastMCP server introducing macOS virtual display coexistence with sub-5ms warp-and-restore mouse clicks. |
| **[Platform Core](https://sirsahol.github.io/projects/platform-core)** | Cloud Infrastructure | Consolidated single-box VPS enclave with zero published host ports and Cloudflare Anycast origin shield. |
| **[CTS Router](https://sirsahol.github.io/projects/cts-router)** | Model Gateways | Next.js 16 model gateway featuring dual Paystack NGN + native BIP-84 SegWit BTC/LTC non-custodial settlement. |
| **[Skills Mesh](https://sirsahol.github.io/projects/skills-mesh)** | Agent Security | Mac-vetted skill distribution with 68 capability-gated skills, ephemeral session mounts, and mode-0600 audit logging. |
| **[Device Mesh](https://sirsahol.github.io/projects/device-mesh)** | Mesh Control Planes | 3-node Tailscale mesh orchestrating an 18-server MCP SSOT across OpenCode, Claude Code, Antigravity, and JeikCode. |
| **[Cloud Image Pipeline](https://sirsahol.github.io/projects/cloud-image-pipeline)** | Autonomous Media | Dual-tier multimodal and GPU diffusion pipeline with automated out-of-band execution watchdogs. |
| **[Social Feedback Engine](https://sirsahol.github.io/projects/social-feedback-engine)** | NLP & Data Pipelines | Serverless SQLite on Cloud Run with continuous Litestream WAL replication to GCS and Nigerian Pidgin extraction. |
| **[AI Benchmark Tracker](https://sirsahol.github.io/projects/ai-benchmark-tracker)** | Frontier Evaluation | Longitudinal frontier model benchmark evaluation engine tracking 32 models across 16 canonical benchmarks. |

---

## Deployed Web Platforms

| Platform | Production Scope | Live Deployment |
|:---|:---|:---|
| **AthMotes Luxe** | Luxury bespoke couture e-commerce platform & bespoke wardrobe manager | [athmotes.com](https://athmotes.com) |
| **Podium Empire** | High-performance talent showcase & entertainment agency platform | [podium-empire.vercel.app](https://podium-empire.vercel.app) |
| **AccessPHS** | Healthcare access & public health consultation staging environment | [accessphs-prod.web.app](https://accessphs-prod.web.app) |
| **Zynox** | Edge microservices & high-throughput streaming proxy worker | [zynox.sirsahol.workers.dev](https://zynox.sirsahol.workers.dev) |
| **TYFPAC** | Civic engagement, youth advocacy, and political action committee portal | [tyfpac.org](https://tyfpac.org) |

---

## Local Development & Build

### Prerequisites
- Node.js 20+ (recommended v22+)
- pnpm 9+ or 10+

### Setup

```bash
# Clone the repository
git clone https://github.com/sirsahol/sirsahol.github.io.git
cd sirsahol.github.io

# Install dependencies
pnpm install

# Start local development server
pnpm dev
```

### Static Build & Preview

```bash
# Compile static HTML to dist/
pnpm build

# Preview production build locally
pnpm preview
```

---

## Project Structure

```text
sirsahol.github.io/
├── .github/workflows/deploy.yml   # Automated GitHub Pages CI/CD pipeline
├── public/
│   ├── llms.txt                   # LLM context manifest for agentic web discovery
│   └── robots.txt                 # Search crawler directives
├── src/
│   ├── components/
│   │   └── SystemsTopography.astro# Unboxed interactive system network diagram
│   ├── data/
│   │   └── records-summary.json   # Verified systems dataset
│   ├── layouts/
│   │   └── BaseLayout.astro       # Core HTML shell, anti-FOUC theme script, and JSON-LD
│   ├── pages/
│   │   ├── index.astro            # Portfolio homepage gateway
│   │   ├── systems/index.astro    # Full systems directory & classification matrix
│   │   └── projects/[slug].astro  # Deep architectural case study pages
│   └── styles/
│       └── global.css             # Tailwind v4 import & custom theme variants
├── astro.config.mjs               # Astro framework configuration
└── package.json
```

---

## Connect & Verify

- **Website:** [sirsahol.github.io](https://sirsahol.github.io)
- **GitHub:** [@sirsahol](https://github.com/sirsahol)
- **Hugging Face:** [@SirSahOl](https://huggingface.co/SirSahOl)
- **LinkedIn:** [@zahyd](https://www.linkedin.com/in/zahyd/)

---

## License

This project is licensed under the [MIT License](LICENSE).
