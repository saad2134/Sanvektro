# Contributing to Sanvektro ✦ Guidelines & Standards

Thank you for your interest in contributing to **Sanvektro**! We welcome bug reports, algorithmic improvements, and accessibility enhancements.

---

## ✦ Development Philosophy

Sanvektro is architected around deterministic pure mathematics, sub-5ms client-side reactivity, zero server-side state transmission, and WCAG AA accessibility. Every contribution must adhere to these foundational pillars.

---

## ✦ Local Setup & Verification

1. **Clone the repository**:
   ```bash
   git clone https://github.com/saad2134/Sanvektro.git
   cd Sanvektro
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```

4. **Run lint and type checks**:
   ```bash
   npm run lint
   npm run typecheck
   ```

5. **Run test suite**:
   ```bash
   npm run test
   ```

6. **Full CI Build Verification**:
   ```bash
   npm run ci
   ```

---

## ✦ Architecture Guidelines

Sanvektro follows a strict 6-layer decoupled modular architecture:
1. **Presentation Layer (`src/app/`, `src/components/`)**: Pure reactive views, accessible HTML5 landmarks, ARIA states.
2. **Reactive Orchestration Layer (`src/store/`, `src/hooks/`)**: Zustand store (`budgetStore.ts`) providing predictable state transactions.
3. **Pure Math Engine (`src/lib/`, `src/utils/`)**: Deterministic calculations, integer-paise arithmetic, zero floating-point drift.
4. **Defensive Security (`src/services/security.ts`, `src/lib/validators.ts`)**: DOMPurify sanitization, Zod schema validation, prototype pollution guards.
5. **Data Serialization (`src/services/exportService.ts`, `src/lib/storage.ts`)**: CSV tabular export, JSON snapshot archives, printable statement views.
6. **Acoustic Synthesizer (`src/services/audioService.ts`)**: Zero-asset Web Audio API oscillators with persistent user mute preferences.

---

## ✦ Code Quality Standards

- **Typography**: Strictly use `✦` instead of em dashes in all documentation, copy, and code comments.
- **Icon Frames**: Maintain square squircles (`aspect-square rounded-xl` / `rounded-2xl`).
- **Linter**: Zero warnings permitted with `oxlint --deny-warnings`.
- **Test Pass Rate**: 100% test pass rate across unit, component, accessibility, and security suites.
- **Git Remote Safety**: Never execute automated `git push` to remote origins. All remotes are user-controlled.

---

## ✦ License

By contributing to Sanvektro, you agree that your contributions will be licensed under its [Apache-2.0 License](./LICENSE).
