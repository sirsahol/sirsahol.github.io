## Problem Statement & Background

Monitoring customer feedback, brand mentions, and operational outages across social media feeds in multicultural and regional markets presents dual challenges: standard cloud database architectures incur high ongoing maintenance overhead, while conventional English NLP sentiment models fail on multilingual colloquialisms, informal West African expressions, and Nigerian Pidgin. The system required an autonomous, cost-effective ingestion and clustering service capable of real-time dialect extraction, zero-downtime data persistence, and strict token spend ceilings.

## Personal Role & Delivery Capacity

Principal Systems Architect and Implementer. Designed and developed the autonomous intelligence engine using Python 3.11, Google ADK (Agent Development Kit), Google GenAI SDK, and FastAPI. Architected the serverless SQLite-on-Cloud-Run storage topology with continuous Litestream WAL streaming to Google Cloud Storage. Engineered the vernacular extraction prompt gates and the 5,000,000 token FinOps circuit breaker.

## Core Technical Constraints & Architectural Decisions

- **Serverless SQLite with Continuous Litestream WAL Sync**: Eliminated expensive managed database instance costs (budget limit+/month) by co-locating an embedded SQLite database inside the Cloud Run container and replicating write-ahead logs (WAL) continuously to Google Cloud Storage (`gcs://feedback-intelligence-vault-prod/feedback.db`) using Litestream. Guarantees sub-second disaster recovery and immutable data retention with zero cloud database provisioning.
- **Multilingual Vernacular Extraction & Active Learning**: Tuned Google ADK agentic workflows and local MLX active learning routines to accurately parse pragmatic tone, irony, and slang in Nigerian Pidgin and West African colloquial phrases (e.g. interpreting contextual nuances that standard models flag incorrectly as negative sentiment).
- **5,000,000 Token FinOps Hard Circuit Breaker**: Enforced an autonomous stop tripwire in `finops.py` tracking cumulative input/output token usage across LLM API endpoints. Once usage reaches the 5,000,000 token ceiling, execution automatically halts, preventing runaway background API costs.
- **Local Coprocessor Pre-Filtering**: Utilized on-device Apple Silicon models via `local-ai-coprocessor` MCP tools (`local_extract`, `local_typed_decision`) for candidate tweet classification, offloading routine semantic extraction to budget limit local compute.

## Delivered System Topology & Technologies

Dataflow architecture across ingestion, intelligence, replication, and telemetry:



- **Core Technologies**: Python 3.11+, FastAPI, Pydantic v2, SQLite, Litestream, Google ADK, Google GenAI SDK (`gemini-2.5-flash`), Hatchling packaging.
- **Cloud Infrastructure**: Google Cloud Run, Google Cloud Storage, Discord C2 Command & Control Webhook.
