# System Architecture & Technical Specifications ✦ Sanvektro

> **Author**: Saaduddin Mohammed ([github.com/saad2134](https://github.com/saad2134))  
> **Engine**: Sanvektro ✦ 30-Day Financial Trajectory & Decision Simulation Cockpit  
> **Core Stack**: React 19 ✦ TypeScript 5 ✦ Vite 8 ✦ Tailwind CSS v4 ✦ Vitest 3 ✦ Web Audio API

---

## 1. Executive Summary & Design Philosophy

**Sanvektro** is a high-precision, client-side financial simulation cockpit designed to solve the critical "end-of-month cash cliff" experienced by students, interns, and early-career earners managing a constrained ₹10,000 monthly budget.

Unlike retrospective expense trackers that merely record past spending after the damage is done, Sanvektro is **forward-projecting and proactive**. Every financial action (a ₹450 Swiggy order, an ₹800 gym renewal, or an unexpected ₹1,500 bike repair) is simulated across the remaining days of the month *before* capital is committed. The user immediately visualizes the exact consequence vector: how daily safe-to-spend allowance drops, whether fixed obligations remain solvent, and whether balance will deplete before Day 30.

```
+-----------------------------------------------------------------------------------+
|                              SANVEKTRO REACTIVE LOOP                              |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ Current State ] + [ Simulation Draft ]                                         |
|         │                     │                                                   |
|         ▼                     ▼                                                   |
|  ┌─────────────────────────────────────────────────────────────┐                  |
|  │          PURE DETERMINISTIC CALCULATION ENGINE             │                  |
|  │  - Net Liquid Balance       - Dynamic Daily Allowance       │                  |
|  │  - Day-by-Day Forecast      - Runway Depletion Day          │                  |
|  │  - Shock Resilience Ratio   - Composite Health Score        │                  |
|  └────────────────────────────┬────────────────────────────────┘                  |
|                               │                                                   |
|                               ▼                                                   |
|  ┌─────────────────────────────────────────────────────────────┐                  |
|  │             CONSEQUENCE DIFF & TRADE-OFF MATRIX             │                  |
|  │  - Allowance Delta (Δ/day)  - Runway Shift                  │                  |
|  │  - Health Score Penalty     - Opportunity Cost Narrative    │                  |
|  └────────────────────────────┬────────────────────────────────┘                  |
|                               │                                                   |
|             ┌─────────────────┴─────────────────┐                                 |
|             ▼                                   ▼                                 |
|  [ Interactive Visual Cockpit ]      [ Web Audio Acoustic Haptics ]               |
|  - 4-Pillar Metric Cards             - Tactile Slider Clicks                      |
|  - 30-Point SVG Trajectory Curve     - Alert Tones on Critical Risk               |
|  - Calendar Scrubber                 - Harmonic Chimes on Goals                   |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Six-Layer Modular Architecture

Sanvektro enforces strict separation of concerns across six decoupled architectural tiers:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 1: Presentation & Cockpit Shell (React 19 + Tailwind CSS v4)      │
│ Header, MetricCards, CapitalAllocationBar, DeficitAlertBanner, Scrubber,│
│ DecisionSimulator, TrajectoryChart, CategoryBreakdown, Insights, Modals │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 2: Reactive State Orchestration (App.tsx + Hooks)                 │
│ State immutability, optimistic draft sandboxing, hotkey dispatchers     │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 3: Deterministic Financial Mathematics (calculations.ts)          │
│ Pure functions, zero DOM dependencies, 30/30 automated test coverage    │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 4: Defensive Security & Input Sanitization (security.ts)          │
│ DOMPurify XSS scrubbing, prototype pollution defense, range clamping   │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 5: Data Serialization & Multi-Format Export (exportService.ts)    │
│ Tabular CSV compilation, structured JSON archiving, print stylesheet    │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 6: Acoustic Synthesizer & Accessibility (audioService.ts, hotkeys)│
│ Web Audio API oscillators, zero network audio latency, keyboard control │
└─────────────────────────────────────────────────────────────────────────┘
```

### Layer Breakdown

1. **Presentation & Cockpit Shell (`src/components/`)**:
   - Built with Tailwind CSS v4 using modern theme primitives and pure CSS transitions.
   - Enforces square squircle containers (`aspect-square rounded-xl` / `rounded-2xl`) across all action buttons, metric frames, and icon badges.
   - Fully responsive layout adapting from mobile viewports to ultra-wide displays.

2. **Reactive State Orchestration (`src/App.tsx`, `src/hooks/`)**:
   - Maintains an immutable `FinancialState` object tracking budget, transactions, recurring commitments, subscriptions, and savings goals.
   - Separate transient `SimulationDraft` state allowing zero-risk exploratory sandbox testing.
   - Comprehensive keyboard shortcuts listener (`useKeyboardShortcuts`) supporting rapid navigation.

3. **Deterministic Financial Mathematics (`src/utils/calculations.ts`)**:
   - 100% pure TypeScript functions with zero side effects.
   - Computes daily safe-to-spend burn allowance, runway depletion day, shock resilience, and a 4-pillar composite health score (0 to 100).
   - Generates 3-way isolated strategic scenario comparisons (`generateComparisonScenarios`).
   - Tracks per-category budget caps vs actual spend with utilization pacing and 80%/100% alerts.

4. **Defensive Security (`src/services/security.ts`)**:
   - Strict XSS protection via `DOMPurify` for all user-entered transaction titles, commitment labels, and categories.
   - Prototype pollution defense (`hasPrototypePollution`, `sanitizeObject`) blocking `__proto__`, `constructor`, and `prototype` manipulation.
   - Boundary clamping (`sanitizeAmount`) preventing negative numbers, infinite floats, or integer overflows.

5. **Multi-Format Export Engine (`src/services/exportService.ts`)**:
   - **Tabular CSV**: Formats chronological 30-day transactions, commitments, and inflows for spreadsheet analysis.
   - **JSON Archive**: Full snapshot of state, metrics, and audit log for portability.
   - **Print Statement**: Clean layout formatted for physical statements or PDF print preview.

6. **Acoustic Synthesizer (`src/services/audioService.ts`)**:
   - Zero-asset Web Audio API synthesis creating micro-acoustic haptic feedback.
   - Frequency-modulated sine ticks for timeline scrubbing, harmonic major chords for savings progress, and sawtooth alerts for runway breaches.

---

## 3. Mathematical Foundations & Decision Algorithms

### A. Realized Liquid Balance ($B_t$)
At any given day $t \in [1, 30]$:

$$B_t = B_0 + \sum I_{\le t} - \sum T_{\le t} - \sum C_{\text{paid}, \le t} - \sum S_{\text{billed}, \le t}$$

Where:
- $B_0$: Starting monthly capital (₹10,000 baseline)
- $I_{\le t}$: Inflows realized on or before day $t$
- $T_{\le t}$: Discretionary expenses recorded on or before day $t$
- $C_{\text{paid}, \le t}$: Mandatory commitments marked as paid
- $S_{\text{billed}, \le t}$: Subscriptions billed on or before day $t$

### B. Dynamic Daily Safe-to-Spend Allowance ($A_t$)
The safe daily allowance ensures the user will not default on upcoming fixed bills:

$$P_{\text{discretionary}} = \max\left(0, B_t + \sum I_{> t} - \sum C_{\text{unpaid}, > t} - \sum S_{\text{active}, > t} - E_{\text{buffer}} - S_{\text{draft}}\right)$$

$$A_t = \left\lfloor \frac{P_{\text{discretionary}}}{\max(1, 30 - t + 1)} \right\rfloor$$

Where:
- $C_{\text{unpaid}, > t}$: Unpaid essential commitments due between day $t+1$ and day 30
- $S_{\text{active}, > t}$: Active subscriptions billing between day $t+1$ and day 30
- $E_{\text{buffer}}$: Protected emergency cushion (default ₹500 to ₹1,000)
- $S_{\text{draft}}$: Amount of the currently staged "What-If" simulation

### C. 30-Day Forward Trajectory Simulation ($F_d$)
For each forecast day $d \in [1, 30]$:

$$\text{Cash}_d = \text{Cash}_{d-1} + I_d - T_d - C_d - S_d - [d > t \implies A_t]$$

$$\text{DepletionDay} = \min \{ d \in [1, 30] \mid \text{Cash}_d < 0 \}$$

If $\text{Cash}_d \ge 0$ for all $d \in [1, 30]$, $\text{DepletionDay} = \text{null}$.

### D. Composite Financial Health Score ($H \in [5, 100]$)
The health score is a weighted composite of four fundamental financial pillars:

| Pillar | Weight | Metric Evaluated | Calculation Formula |
|---|---|---|---|
| **Pillar A: Runway & Day 30 Surplus** | 35 pts | Solvency & projected end-of-month cash | $\min\left(35, \frac{\text{ProjectedSurplus}}{2500} \times 35\right)$ or $\frac{\text{DepletionDay}}{30} \times 20$ |
| **Pillar B: Obligation Coverage** | 25 pts | Ability of current liquid cash to cover pending bills | $\min\left(25, \frac{B_t}{\text{ObligationsTotal}} \times 25\right)$ |
| **Pillar C: Daily Allowance Cushion** | 20 pts | Gen Z purchasing power benchmark | $\ge ₹250$: 20 pts, $\ge ₹160$: 15 pts, $\ge ₹100$: 10 pts, $\ge ₹50$: 5 pts |
| **Pillar D: Shock Resilience & Goals** | 20 pts | ₹1,000 emergency buffer + savings goal pacing | $(\text{BufferRatio} \times 10) + (\text{GoalRatio} \times 10)$ |

### E. Academic Letter Grade ($G$) & Functional Descriptors
The composite health score ($H$) maps to an academic grade standard with strategic solvency descriptors:
- **A+ (90-100)**: *Elite Solvency ✦ Exceptional Reserve Discipline*
- **A (80-89)**: *Strong Solvency ✦ Healthy Discretionary Buffer*
- **B (70-79)**: *Stable Pacing ✦ Moderate Burn Velocity*
- **C (60-69)**: *Constrained Cushion ✦ Spending Caution Advised*
- **D (50-59)**: *Deficit Hazard ✦ Tight Living Runway*
- **F (<50)**: *Critical Insolvency ✦ Imminent Cash Exhaustion*

### F. Recency-Weighted Burn Velocity ($V_{\text{burn}}$)
Rather than a naive arithmetic mean of all past days, Sanvektro computes a recency-weighted burn velocity that responds aggressively to recent behavioral changes:

$$V_{\text{burn}} = 0.50 \times \overline{\text{Spend}}_{\text{last 3 days}} + 0.30 \times \overline{\text{Spend}}_{\text{days 4 to 7}} + 0.20 \times \overline{\text{Spend}}_{\text{days } > 7}$$

### G. Multi-Cone 3-Scenario Forward Trajectory Forecast
In addition to the expected baseline projection, Sanvektro computes a dynamic forecast cone fanning out from the current day to Day 30:
1. **Best Case (Disciplined ✦ -25% burn)**: Simulates frugal pacing with daily burn capped at $0.75 \times A_t$.
2. **Expected Case (Active Velocity ✦ 1.0x baseline)**: Projects linear continuation of dynamic allowance $A_t$.
3. **Worst Case (Impulse Leakage ✦ +35% burn)**: Simulates uncontained impulse spending with daily burn expanding to $1.35 \times A_t$.

### H. Auditable Optimization Levers with Contextual Evidence
Every recommendation emitted by the intelligence engine includes an immutable `evidence` payload detailing exact empirical proof (e.g. category percentage, days elapsed, subscription ratio vs initial budget, and remaining buffer vs shock thresholds), preventing opaque black-box recommendations.

### I. Guided Onboarding Tour & Interactive Orientation
A 3-stage interactive modal (`OnboardingTourModal.tsx`) introduces new evaluators and users to the ₹10,000 / 30-day decision paradigm, the 3 capital buckets (Spent, Ringfenced, Discretionary), and hands-free power hotkeys (`T`, `S`, `R`, `Space`, `1-3`).

### J. Multi-Tier Consequence Severity & Multi-System Ripple Chains
Decision simulation results are categorized by an objective 4-tier severity rating based on mathematical impact vectors:
- **CRITICAL**: Runway exhausts before Day 30, balance drops below zero, or daily allowance collapses to $\le ₹40$/day.
- **SEVERE**: Health score drops by 15+ points, risk classification transitions to ELEVATED/CRITICAL, active savings goals are compromised, or allowance drops below living survival floor ($< ₹75$/day).
- **MODERATE**: Daily allowance contracts by $> ₹25$/day or health score dips by 6+ points.
- **NEGLIGIBLE**: Frictionless spend with zero goal derailments and daily allowance remaining comfortable.

Each consequence diff calculates:
1. **Committed Bills Shield**: Liquid cash buffer remaining after all upcoming mandatory commitments and active recurring subscriptions are settled ($\text{Buffer} = \max(0, B_{\text{sim}} - \text{Obligations}_{\text{upcoming}})$).
2. **Savings Goals Ripple Chain**: Dynamic recalculation of whether active goals stay on track or incur delay days ($\text{DelayDays} = \min(10, \lceil \frac{S_{\text{draft}}}{A_{\text{sim}}} \times 0.5 \rceil)$).

### K. Goal Feasibility Horizon Date Estimator ($D_{\text{completion}}$)
Each target goal evaluates whether current savings surplus and safe daily burn rate permit completion within the 30-day cycle:
- **Required Daily Save ($S_{\text{daily}}$)**: $\lceil \frac{\text{Target} - \text{Current}}{\max(1, \text{TargetDay} - t)} \rceil$
- **Projected Completion Day ($D_{\text{completion}}$)**: $t + \lceil \frac{\text{Target} - \text{Current}}{\max(25, 0.20 \times A_t)} \rceil$ if $\le 30$, otherwise flagged as *Next Cycle*.

### L. Zero-Dependency Runtime Schema Validator & State Integrity Engine
Located in `src/services/security.ts`, strict runtime type guards validate expense drafts, savings goal updates, and imported JSON state files (`validateExpenseDraft`, `validateGoalPayload`, `validateFinancialStateSchema`, `importStateFromJSON`). Guarantees that corrupted payloads or malicious injection cannot induce unhandled exceptions or state desynchronization.

---

## 4. Security & Fault Tolerance Guarantees

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SECURITY & STABILITY MATRIX                     │
├────────────────────────────┬───────────────────────────────────────────┤
│ Threat / Risk Vector       │ Sanvektro Defensive Implementation        │
├────────────────────────────┼───────────────────────────────────────────┤
│ Cross-Site Scripting (XSS) │ DOMPurify sanitization stripping all tags │
│ Prototype Pollution        │ Object.create(null) + recursive scrubbing │
│ Schema Malformation        │ Runtime type guards & schema validators   │
│ Arithmetic Overflow / NaN  │ Bounded number clamping via sanitizeAmount│
│ Floating-Point Precision   │ safeAdd and safeSub 2-decimal routines    │
│ React Component Crash      │ Class-based ErrorBoundary fallback UI     │
│ Zero-Network Audio Failure │ Graceful silent degradation if Web Audio  │
│                            │ is unsupported or disabled by policy      │
└────────────────────────────┴───────────────────────────────────────────┘
```

1. **DOMPurify HTML Entity Stripping**:  
   User input from custom subscriptions, shocks, and manual ledger entries passes through `DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })`.
2. **Object Prototype Freezing**:  
   Imported and manipulated states are parsed through `sanitizeObject()`, removing `__proto__`, `constructor`, and `prototype` keys before state updates.
3. **Runtime Schema Validation**:  
   All transaction drafts and external state archives are checked against structural schema validators before persisting into memory.
4. **Floating-Point Arithmetic Safety**:  
   `safeAdd` and `safeSub` guarantee decimal safety rounded to two decimal places, preventing floating-point calculation drift.
5. **ErrorBoundary Recovery**:  
   The entire application tree is wrapped in `<ErrorBoundary>`. If any unhandled exception occurs, the cockpit intercepts the error, prevents blank screen failures, displays technical error details, and presents a one-click session restore button.

---

## 5. Verification & Testing Suite

Sanvektro includes a comprehensive test suite running under Vitest and `@testing-library/react`:

| Test Suite | File Path | Focus & Assertions |
|---|---|---|
| **Financial Calculations & Analytics** | `src/__tests__/calculations.test.ts` | 33 tests: ₹10k budget baseline, safe burn allowance, consequence diffs, 30-day trajectory points, critical runway depletion risk, capital allocation distribution, category outflow aggregation, 4-pillar health audit diagnostics, 3 isolated comparison scenarios, category budget caps & 80%/100% alerts, extreme deficit resilience, non-mutating simulation immutability, savings goal allocation integrity, subscription cancellation without fake income, realized expense/inflow balance updates, transaction editing runway recalculation, transaction deletion liquidity restoration, 30-day spending intensity matrix heatmap, savings lockbox ripple trade-off, velocity risk tier benchmarks, integer currency rounding drift invariants, academic letter grade mapping (A+ to F), recency-weighted burn velocity (50/30/20 weights), multi-cone forecast curves (best/expected/worst), ConsequenceMetrics grade integration, empirical audit evidence verification on tips, radial health gauge pillar weight invariants, safe floating-point arithmetic (safeAdd, safeSub), goal feasibility horizon date projection, consequence severity categorization with committed bills protection buffer, integer paise conversion routines (rupeesToPaise, paiseToRupees) eliminating IEEE 754 precision drift, Gen Z Money Personality Archetype diagnosis (calculateMoneyPersonality), and 7-day forward cash pressure radar for scheduled obligations (calculateCashPressureRadar). |
| **Decision Coach Evaluation Engine** | `src/__tests__/coachEvaluator.test.ts` | 7 tests: Deterministic dilemma parsing, safe vs caution vs overdraft classifications, recurring subscription annual run-rate recovery, safe daily runway limits, and savings target feasibility. |
| **Defensive Security & Validation** | `src/__tests__/security.test.ts` | 7 tests: Prototype pollution detection, object cleansing, DOMPurify XSS stripping, boundary number clamping, expense draft schema validation, goal payload validation, and full FinancialState schema JSON import verification. |
| **Fault Recovery** | `src/__tests__/ErrorBoundary.test.tsx` | 2 tests: ErrorBoundary rendering, error capture, fallback display, and child recovery. |
| **Accessibility & WCAG 2.1 AA** | `src/__tests__/a11y.test.ts` | 6 tests: Mathematical relative luminance & contrast ratio validation (dark canvas vs text >= 15:1, body >= 4.5:1, UI accents >= 3:1), sub-zero overdraft consequence invariants, and conflict-free keyboard shortcut uniqueness. |
| **End-to-End App Integration** | `src/__tests__/App.test.tsx` | 3 tests: 4-pillar metric cards mounting, persona switching, and reactive consequence rendering. |

To execute the test suite (58/58 tests passing):
```bash
npm test
```

To execute full type checking and bundle production build:
```bash
npm run ci
```

---

## 6. Typography & UI Geometry Compliance

- **Typography Standard**: All copy, documentation, and code comments strictly enforce the `✦` symbol in place of em dashes.
- **Icon Frame Geometry**: All icon buttons, indicators, and status badges feature square squircle geometry (`aspect-square` with `rounded-xl` / `rounded-2xl`).
- **Color Palette**: Dark-mode primary palette (`#07090e`, `#090d16`, `#0d121e`) with emerald (`#10b981`), cyan (`#06b6d4`), amber (`#f59e0b`), and rose (`#f43f5e`) functional accents.
