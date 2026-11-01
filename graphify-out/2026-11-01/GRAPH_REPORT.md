# Graph Report - Ordexa  (2026-11-01)

## Corpus Check
- Corpus is ~5,326 words - fits in a single context window. You may not need a graph.

## Summary
- 42 nodes · 45 edges · 10 communities (6 shown, 4 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.91)
- Token cost: 5,326 input · 1,500 output

## Community Hubs (Navigation)
- Frontend & PWA Dashboards
- Backend Architecture & Infra
- Multi-Tenancy, Branches & Menu
- Payment Gateway & QR Ordering
- Subscription & Package Lifecycle
- Realtime KDS & POS Operations
- QA, Acceptance & Testing
- Roadmap & Implementation Phases
- Ordexa Platform Vision
- Inventory Management

## God Nodes (most connected - your core abstractions)
1. `Next.js 16 Frontend App` - 11 edges
2. `Laravel 13 (PHP 8.4) Modular API` - 9 edges
3. `SaaS Subscription & Billing Engine` - 5 edges
4. `Multi-Tenant SaaS Architecture` - 4 edges
5. `Customer QR Table Ordering` - 4 edges
6. `Kitchen Display System (KDS)` - 3 edges
7. `Monorepo Structure (apps/web, apps/api, packages)` - 3 edges
8. `Laravel Reverb WebSockets` - 3 edges
9. `PostgreSQL Shared Schema with Tenant Isolation` - 3 edges
10. `Payment Provider Abstraction Layer` - 3 edges

## Surprising Connections (you probably didn't know these)
- `SaaS Subscription & Billing Engine` --references--> `Midtrans Payment Gateway (Platform Subscription)`  [INFERRED]
  PRD.md → TECH.md
- `Next.js 16 Frontend App` --implements--> `POS / Cashier System`  [EXTRACTED]
  TECH.md → PRD.md
- `Laravel 13 (PHP 8.4) Modular API` --implements--> `Multi-Tenant SaaS Architecture`  [EXTRACTED]
  TECH.md → PRD.md
- `PostgreSQL Shared Schema with Tenant Isolation` --implements--> `Multi-Tenant SaaS Architecture`  [EXTRACTED]
  TECH.md → PRD.md
- `Laravel 13 (PHP 8.4) Modular API` --implements--> `RBAC Roles & Permissions`  [EXTRACTED]
  TECH.md → PRD.md

## Hyperedges (group relationships)
- **Dual-Track Multi-Tenant Payment Engine** — prd_dual_payment_system, tech_payment_abstraction_layer, tech_xendit_xenplatform, tech_midtrans_gateway, prd_subscription_billing [EXTRACTED 1.00]
- **Order-to-Kitchen Realtime Flow** — prd_qr_table_ordering, prd_kds_kitchen_display, prd_pos_cashier, tech_reverb_realtime [EXTRACTED 1.00]
- **Multi-Tenant Data Isolation Guardrail** — prd_multi_tenant_architecture, tech_postgresql_shared_schema, tech_sanctum_auth, prd_user_roles [EXTRACTED 1.00]

## Communities (10 total, 4 thin omitted)

### Community 0 - "Frontend & PWA Dashboards"
Cohesion: 0.25
Nodes (9): Public Marketing & Registration Portal, Hybrid Web & PWA Architecture, Restaurant Management Dashboard, Super Admin Platform Dashboard, Multi-Subdomain Routing Architecture, Next.js 16 Frontend App, PWA Manifest & Service Worker, Tailwind CSS & shadcn/ui Design System (+1 more)

### Community 1 - "Backend Architecture & Infra"
Cohesion: 0.25
Nodes (9): RBAC Roles & Permissions, Modular Monolith Technical Architecture, Docker Compose VPS Deployment, Laravel 13 (PHP 8.4) Modular API, Monorepo Structure (apps/web, apps/api, packages), PostgreSQL Shared Schema with Tenant Isolation, Laravel Queue & Scheduler Workers, Redis Cache, Session & Queue Store (+1 more)

### Community 2 - "Multi-Tenancy, Branches & Menu"
Cohesion: 0.40
Nodes (5): Branch Operations Management, Menu & Category Management, Multi-Tenant SaaS Architecture, Unlimited Multi-Branch Concept, Cloudflare R2 Object Storage & CDN

### Community 3 - "Payment Gateway & QR Ordering"
Cohesion: 0.40
Nodes (5): Dual Payment Architecture (Subscription vs Customer), Customer QR Table Ordering, Midtrans Payment Gateway (Platform Subscription), Payment Provider Abstraction Layer, Xendit xenPlatform Sub-Merchant Engine

### Community 4 - "Subscription & Package Lifecycle"
Cohesion: 0.40
Nodes (5): Enterprise Subscription Tier, Professional Subscription Tier, Starter Subscription Tier, SaaS Subscription & Billing Engine, Subscription Lifecycle States

### Community 5 - "Realtime KDS & POS Operations"
Cohesion: 0.67
Nodes (3): Kitchen Display System (KDS), POS / Cashier System, Laravel Reverb WebSockets

## Knowledge Gaps
- **22 isolated node(s):** `Ordexa Restaurant SaaS Overview`, `Unlimited Multi-Branch Concept`, `RBAC Roles & Permissions`, `Super Admin Platform Dashboard`, `Inventory & Stock Tracking` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 22 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Next.js 16 Frontend App` connect `Frontend & PWA Dashboards` to `Backend Architecture & Infra`, `Payment Gateway & QR Ordering`, `Realtime KDS & POS Operations`?**
  _High betweenness centrality (0.423) - this node is a cross-community bridge._
- **Why does `Customer QR Table Ordering` connect `Payment Gateway & QR Ordering` to `Frontend & PWA Dashboards`, `Realtime KDS & POS Operations`?**
  _High betweenness centrality (0.297) - this node is a cross-community bridge._
- **Why does `Laravel 13 (PHP 8.4) Modular API` connect `Backend Architecture & Infra` to `Multi-Tenancy, Branches & Menu`, `Realtime KDS & POS Operations`?**
  _High betweenness centrality (0.284) - this node is a cross-community bridge._
- **What connects `Ordexa Restaurant SaaS Overview`, `Unlimited Multi-Branch Concept`, `RBAC Roles & Permissions` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._