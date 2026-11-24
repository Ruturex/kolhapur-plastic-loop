# Kolhapur Plastic Loop

A mobile-first demonstration MVP for plastic collection, community recovery, materials, recycling workflows and EPR context in **Kolhapur city, Maharashtra, India**. It is a prototype, not a municipal service.

## Run locally

Requires Node.js 20.19+ (or 22.12+) and npm. Install the current Node.js LTS release from [nodejs.org](https://nodejs.org/) if these are not available; the installer includes npm.

```sh
npm install
npm run dev
```

Production build and logic tests:

```sh
npm run build
npm test
```

## What is implemented

- Hash-based navigation with overview, collection, materials, community, provisional facility, prospective buyer categories, EPR and impact/economics sections.
- Demonstration collection requests stored in browser localStorage, a status progression, and a confirmed reset limited to the app's own storage key.
- Weight-unit conversion that excludes bags, containers and items from mass calculations; collector earnings and recovery calculations are separate business logic.
- Explicitly labelled simulated operational data and separately sourced official benchmarks with period, geographic scope, classification and links.
- Responsive charts, touch-friendly mobile navigation, semantic controls and visible focus styling.

## Research boundary

The 6.08 tonnes/day benchmark refers to the Kolhapur Municipal Corporation area in the 2021 district plan. The 11.18 tonnes/day figure is district-wide. MPCB's 2022–23 figures (8,270 generated, 8,284 collected, 8,032 channelled) cover the Kolhapur MPCB region across 44 urban local bodies. They must not be interpreted as current city-only measures. See `src/data.ts` and the Impact page for source links.

Facility name, location, operator, capability and installed capacity remain unverified. Buyer entries are categories, not confirmed companies. No payments, pickups, transactions or EPR certificates are generated.

## Architecture

- `src/models.ts`: typed domain records.
- `src/calculations.ts`: weight, recovery and earnings calculations.
- `src/data.ts`: isolated research benchmarks and simulated material records.
- `src/App.tsx`: navigation, page modules and demonstration interactions.
- `src/App.css`: responsive product styles.
- `src/calculations.test.ts`: calculation tests.

The localStorage namespace is `kolhapur-plastic-loop-demo-v1`. The future backend can replace the browser storage adapter while retaining the domain model and calculation layer.

## Boundaries and limitations

Data entered in the browser does not synchronize between people. The platform has no user accounts, partner integrations, live municipal data, verified processor inventory, payment handling or dispatch. Illustrative financial assumptions are not local price or wage claims. Accessibility has been designed for keyboard operation and responsive touch use but has not undergone a formal WCAG audit.

Deployment instructions are in `DEPLOYMENT.md`.
