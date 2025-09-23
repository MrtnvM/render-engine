**Service with Backend-Driven Approach to Building User Interfaces**
_Technical Specification_

---

## 1. Context and Relevance

Avito is a Russian online service for posting ads about goods, real estate, jobs, resumes, and services, ranking first in the world among classifieds sites.
Each week, dozens of new features and experiments are added to the product, which must be simultaneously supported across multiple platforms: Android, iOS, and Web.

Mobile releases require store moderation, slowing delivery and increasing the cycle from idea to launch. This complicates rapid iteration and A/B testing.

**Release Process:**

1. **Monitoring & Regression Testing** — crash data collection, functional verification, fixing critical bugs.
2. **Gradual Rollout** — after successful testing, the release is rolled out to a percentage of users on iOS and Android. If problems are found, the cycle repeats.
3. **Fixes & Restrictions** — only critical fixes are allowed during testing/rollout. No new features.
4. **Final Release** — if no issues, updates are released to all users.

**Backend-Driven UI (BDUI)** shifts interface-building logic partially or fully to the server, enabling fast screen structure/content changes without rebuilding apps.
For Avito, this means:

- Faster delivery of changes
- Reduced developer workload
- Increased flexibility & scalability

---

## 2. Task Description

You must develop a **backend-driven UI framework** for Avito — a platform that manages user interfaces for Android, iOS, and Web apps via centralized configuration.

**Requirements:**

- Service for storing UI screen JSON configurations
- Admin panel for editing configurations for interfaces.
- Support at all platforms (Android/iOS/Web) where apps fetch configs from server and render screens.
- Real-time editing of screens **without app updates**.
- Analytics: which screens/elements users interact with and how long.
- **Demo:** implement provided screen layouts using your approach.

**Optional (bonus):**

- A/B testing support
- Template reuse/inheritance
- Multi-platform support
- Internationalization (i18n)
- Conditional rendering logic
- Interactive UI components (clicks, navigation, forms)
- Ability to describe logic

---

## 3. Software & Hardware Requirements

**Hardware:**

- Android smartphone/emulator (API 24+) or iOS (14+)
- Modern web browser (Chrome/Firefox/Safari)

**Software (recommended stack):**

- Backend: TypeScript
- Config storage: JSON + PostgreSQL
- Frontend/Web: React
- Mobile: Android (Kotlin), iOS (Swift)
- Admin panel: Web UI (shadcn/ui)
- Analytics: Firebase, Amplitude

---

## 4. Presentation/Demo Requirements

- Short architecture & principle description
- Admin panel demo: screen assembly + instant update on client app
- Client demo (Android/iOS/Web) fetching configs correctly
- Analytics demo (usage stats for screens/elements)

---

## 5. Documentation Requirements

- **README:** project launch instructions (backend, admin, client)
- Short architecture description (diagrams, sequence flows)
- Example config files (JSON/YAML)
- Documentation for additional functionality (analytics, A/B, i18n, etc.)
- Scalability documentation for other platforms

---

## 6. Resources

- [Scenario Layout (Figma)](https://www.figma.com/design/fPrvzQcUQdX0ddXunxDhHS/%D0%9B%D0%A6%D0%A2.-%D0%90%D0%B2%D0%B8%D1%82%D0%BE?node-id=0-1&t=V11m3gwCMUZx3ODc-1)
- [Figma Guidelines](https://www.figma.com/design/DglrdmxGmbi3VwIWfchxhi/--23--%D0%93%D0%B0%D0%B9%D0%B4%D0%BB%D0%B0%D0%B9%D0%BD%D1%8B-%D0%B4%D0%BB%D1%8F-%D0%B4%D0%B8%D0%B7%D0%B0%D0%B9%D0%BD%D0%B5%D1%80%D0%B0?node-id=501-11022&p=f&t=mUY5PxGlL1fvf7pv-0)
- Avito Design Materials (on site)
- [Avito Mobile Meetup (YouTube)](https://www.youtube.com/live/kP6Ev8k5ixg)

---

## 7. Deliverables

**Intermediate Submission:**

- Service for storing screen layouts
- Basic admin panel
- App for rendering JSON configs

**Final Submission:**

- Implement provided layout using your solution

**Bonus Features:**

- A/B testing
- Template reuse/inheritance
- i18n
- Conditional rendering logic
- Interactive UI components

---

## 8. Evaluation Criteria

### Team Approach

- **Assessed:** Organization, transparency, communication, decomposition, risk/data handling
- **Artifacts:**

  - Problem statement, goals, success metrics, assumptions, boundaries
  - Decomposition & prioritization: board/plan, critical path, DoR/DoD
  - Risk registry with mitigations
  - Data-driven decisions/experiments
  - Documentation: ADRs, diagrams, README, CI checklists

### Technical Solution

- **Assessed:** BDUI architecture, code quality, testing, performance, reliability, security, scalability, DX
- **Artifacts:**

  - Architecture: layers, component contracts, schema/DSL versioning, backward compatibility
  - Code quality: modularity, readability, linting, typing
  - Tests: unit/contract/e2e for backend/admin/client
  - Performance: latency/CPU/RAM budgets, cold start, caching
  - Reliability: error handling, config rollback, feature flags
  - Security: config validation, logic restrictions, admin permissions
  - Observability: logs, metrics, tracing, alerts
  - CI/CD: builds, contract checks, preview envs
  - Cross-platform support & design system compliance

### Task Fit

- **Assessed:** How well the solution meets case requirements & demo scenario

- **Must have:**

  - Config storage service (JSON/React DSL)
  - Admin panel for visual UI assembly
  - Client on at least one platform
  - Real-time editing without app store updates
  - Usage analytics
  - Demo of given layout

- **Optional:** A/B tests, template reuse, multi-platform, i18n, conditional logic, interactivity, logic description

### Effectiveness

- **Assessed:** Practical usefulness: iteration speed, ownership cost, stability, product impact
- **Metrics:**

  - Performance: config fetch/render latency, size, caching
  - Economy & DX: onboarding simplicity, screen assembly speed, docs quality
  - Flexibility: feature flags, partial rollout, version compatibility
  - Bonus: meaningful SLOs, pre/post metrics (how BDUI reduces release cycle)

### Pitch Session (Final)

- **Assessed:** Story clarity, live demo, Q\&A, roadmap
- **Artifacts:**

  - Structure: problem → solution → architecture → demo → metrics → risks → plans
  - Demo: admin screen build + instant client render; analytics demo
  - Clarity/timing: within slot, no overload
  - Q\&A: confident answers, tradeoffs knowledge
  - Materials: slides, demo script, backup plan
  - Bonus: live metrics, honest risk review
