## Problem Statement & Background

Civic advocacy organizations require high-integrity public messaging, secure contributor onboarding, and administrative voter record management protected against XSS injection, tamper attacks, and data leakage.

## Personal Role & Delivery Capacity

Lead Architect and Systems Engineer. Designed the Turborepo monorepo, administrative spokes with TanStack Table v8, DOMPurify security sanitization, and automated Firebase Functions triggers.

## Core Technical Constraints & Architectural Decisions

- Security Sanitization: Implemented isomorphic-dompurify across all user and contributor input streams.
- Administrative Data Tables: Integrated TanStack Table v8 spoke with data safety tripwires.
- Automated Cloud Triggers: Configured Firebase Tools functions triggers with Playwright verification.

## Delivered System Topology & Technologies

Turborepo monorepo with apps/ (public portal, admin), packages/ (shared components), triggers/ (cloud functions), and Playwright E2E suites.
