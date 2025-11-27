# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Convergence is an intelligent concentrated liquidity management platform for Aptos DEXes. The project is a monorepo containing:
- **Rust Backend**: API server and blockchain data scrapers
- **SvelteKit Frontend**: Web application for liquidity management
- **Move Contracts**: On-chain smart contracts for Aptos

## Repository Structure

```
.
├── rust/                   # Rust workspace
│   ├── api/               # Axum REST API server
│   ├── crates/
│   │   ├── core/         # Core utilities (currently minimal)
│   │   └── db/           # SeaORM database entities and connection
│   ├── scrapers/          # DEX data scrapers (workspace members)
│   │   ├── tapp/         # TAPP DEX scraper (fully implemented)
│   │   ├── thala/        # Thala DEX scraper (in progress)
│   │   └── hyperion/     # Hyperion DEX scraper (in progress)
│   └── DEX_RESEARCH.md   # Research guide for new DEX integrations
├── app/                   # SvelteKit frontend application
│   └── src/
│       ├── lib/          # Shared components, utilities, and services
│       ├── routes/       # SvelteKit routes
│       └── stories/      # Storybook stories
├── move/                  # Aptos Move smart contracts
└── packages/             # Shared pnpm packages
```

## Development Commands

### Frontend (SvelteKit)
```bash
# Navigate to app directory first
cd app

# Development
pnpm dev                  # Start dev server
pnpm build               # Production build
pnpm preview             # Preview production build

# Quality checks
pnpm check               # Type-check with svelte-check
pnpm check:watch         # Type-check in watch mode
pnpm lint                # Run ESLint and Prettier checks
pnpm format              # Format with Prettier

# Testing
pnpm test:unit           # Run Vitest unit tests
pnpm test:e2e            # Run Playwright E2E tests
pnpm test                # Run all tests

# Database (Drizzle ORM in frontend)
pnpm db:start            # Start PostgreSQL via Docker Compose
pnpm db:push             # Push schema to database
pnpm db:generate         # Generate migrations
pnpm db:migrate          # Run migrations
pnpm db:studio           # Open Drizzle Studio

# Storybook
pnpm storybook           # Start Storybook dev server
pnpm build-storybook     # Build Storybook
```

### Backend (Rust)
```bash
# Navigate to rust directory
cd rust

# Development
cargo run -p api         # Run API server (http://127.0.0.1:3000)
cargo run -p tapp        # Run TAPP scraper
cargo run -p thala       # Run Thala scraper (when implemented)
cargo run -p hyperion    # Run Hyperion scraper (when implemented)

# Testing
cargo test               # Run all tests
cargo test -p api        # Run tests for specific package
cargo test -- --nocapture # Run tests with output

# Build
cargo build              # Debug build
cargo build --release    # Release build

# Other
cargo fmt                # Format code
cargo clippy             # Run linter
```

### Database
```bash
# Start PostgreSQL container
docker compose up        # From root or app/ directory

# Database connection strings vary:
# - API server: postgresql://root:mysecretpassword@localhost:5432/passive_liquidity_db
# - Frontend: Uses connection defined in environment
```

### Move Contracts
```bash
cd move
# Commands depend on Aptos CLI (not yet documented in codebase)
```

## Architecture

### Rust Backend Architecture

The Rust backend follows a workspace structure with clear separation of concerns:

**API Layer** (`rust/api/src/`):
- `main.rs`: Axum server setup with route configuration and OpenAPI docs (Scalar UI at `/scalar`)
- `pools/`: Pools API module with query handlers, job endpoints for refreshing pool data
- `errors.rs`: Centralized error handling with `AppError` and `AppResult` types
- Uses Axum for HTTP routing, SeaORM for database access, and utoipa for OpenAPI documentation

**Database Layer** (`rust/crates/db/`):
- SeaORM entities generated from PostgreSQL schema
- Entities: `pools`, `tokens`, `positions`, `managed_positions`, `users`, `user_balances`, `user_movements`
- Connection factory pattern: `db::create_connection()` returns `DatabaseConnection`

**Scrapers** (`rust/scrapers/`):
- Each DEX has its own scraper crate with standardized structure:
  - `scraper.rs`: On-chain client using `aptos-rust-sdk` for view function calls
  - `api.rs`: HTTP API client (if DEX provides REST/GraphQL endpoints)
  - `types.rs`: DEX-specific data structures (positions, pools, tokens)
  - `lib.rs`: Public exports
- **TAPP** (`tapp/`): Fully implemented with on-chain and HTTP API access
- **Thala** (`thala/`): Structure created, implementation pending research
- **Hyperion** (`hyperion/`): Structure created, implementation pending research
- Scrapers populate database via API refresh endpoints (`POST /tokens/refresh`, etc.)
- Database schema is DEX-agnostic with `pools.dex` field for multi-DEX support

**Key Patterns**:
- Shared state pattern: `AppState` struct holds `DatabaseConnection` wrapped in `Arc` for thread-safe sharing
- API responses use custom types (e.g., `PoolsResponse` with data + count)
- Complex query parameters (fee filters, volume filters, TVL, APR) with pagination and sorting
- Post-fetch filtering for computed fields (e.g., total APR = bonus_apr + trading_apr)

### Frontend Architecture

**SvelteKit Application** (`app/src/`):
- Uses Svelte 5 with TypeScript
- `lib/`: Reusable components, utilities, server-side services
- `lib/server/`: Server-only code (database access with Drizzle ORM, auth, manager service)
- `routes/`: File-based routing with layout and page components
  - `(earn)/`: Earning/liquidity provision features
  - `api/`: SvelteKit API endpoints
  - `profile/`: User profile pages
  - `assets/`: Static asset routes

**UI Libraries**:
- Tailwind CSS 4 with custom plugins
- bits-ui: Headless UI components
- layerchart: Data visualization
- svelte-sonner: Toast notifications
- Custom component library in Storybook

**Data Flow**:
- Server-side API calls from `lib/server/manager-service.ts`
- Client-side state management via Svelte stores
- Form handling with sveltekit-superforms and Zod validation

### Database Schema

**Core Entities**:
- `pools`: DEX pool information (tokens, fees, APRs, volumes, TVL)
- `positions`: User positions in pools
- `managed_positions`: Strategy-managed positions
- `tokens`: Token metadata
- `users`: User accounts
- `user_balances`: Token balances per user
- `user_movements`: Historical balance changes

### Integration Points

- Frontend calls Rust API at `http://127.0.0.1:3000`
- Scrapers populate database, API reads from database
- Frontend has its own Drizzle ORM setup for direct database access in SvelteKit server routes
- Aptos blockchain integration via `@aptos-labs/ts-sdk` (frontend) and `aptos-rust-sdk` (backend)

## Testing Strategy

**Frontend**:
- Unit tests: Vitest with `@vitest/browser` and `vitest-browser-svelte`
- E2E tests: Playwright
- Component testing: Storybook with `@storybook/addon-vitest`

**Backend**:
- Standard Rust unit and integration tests via `cargo test`
- Tests located inline with code or in `tests/` directories

## Notable Dependencies

**Rust**:
- `axum`: Web framework
- `sea-orm`: ORM with PostgreSQL support
- `aptos-rust-sdk`: Aptos blockchain SDK
- `utoipa`: OpenAPI documentation
- `tokio`: Async runtime

**Frontend**:
- `@aptos-labs/ts-sdk`: Aptos blockchain SDK
- `@aptos-labs/wallet-adapter-core`: Wallet integration
- `drizzle-orm`: TypeScript ORM
- `layerchart`: Charting library
- `sveltekit-superforms`: Form handling

## Environment Setup

- Requires PostgreSQL (via Docker Compose or local installation)
- Rust toolchain (cargo 1.90.0+ recommended)
- Node.js with pnpm package manager
- Aptos CLI for Move contract development

## Workspace Commands

The project uses pnpm workspaces. From the root:
```bash
pnpm install             # Install all dependencies
```

Then navigate to specific directories (`app/`, `rust/`) for development commands.
