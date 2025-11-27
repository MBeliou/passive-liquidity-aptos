# DEX Integration Research Guide

This document outlines the research needed to complete integration of **Thala** and **Hyperion** DEXes on Aptos.

## Research Status

- ✅ **TAPP**: Fully integrated
- 🔨 **Thala**: Structure created, implementation needed
- 🔨 **Hyperion**: Structure created, implementation needed

## Priority Research Items

### Critical: APR Verification
User reports seeing **300-1000%+ APR** on these DEXes. We need to:
1. Verify these numbers are accurate
2. Understand how APR is calculated (trading fees + bonus rewards?)
3. Determine if there are time-limited campaigns inflating APRs
4. Check TVL to ensure pools have sufficient liquidity

---

## Thala DEX Research

### 1. Documentation & Resources
- [ ] Find official Thala documentation
- [ ] Locate smart contract addresses on Aptos mainnet
- [ ] Check for official SDKs (TypeScript, Rust, or other)
- [ ] Find API documentation (if available)

### 2. DEX Architecture
- [ ] What type of AMM? (CLMM, constant product, stable swap, hybrid?)
- [ ] Fee structure (fixed, dynamic, multi-tier?)
- [ ] Position management (concentrated liquidity or standard LP?)

### 3. Data Access

#### On-Chain Data
- [ ] **Smart Contract Addresses**:
  - Main protocol address: `???`
  - Router address: `???`
  - View functions module: `???`

- [ ] **Pool Data**:
  - Resource type for pools: `???`
  - How to query all pools?
  - How to query single pool?
  - Fields: token addresses, fees, TVL, volume?

- [ ] **Position Data**:
  - View function to fetch positions: `???`
  - Position structure (liquidity, ticks, fees)?
  - How positions are indexed/identified?

- [ ] **Token Data**:
  - Where to fetch verified token list?
  - Token metadata structure?

#### HTTP API (if exists)
- [ ] Base URL: `???`
- [ ] Endpoints:
  - Pools list: `???`
  - Pool details: `???`
  - Tokens list: `???`
  - APR data: `???`
- [ ] Authentication required?
- [ ] Rate limits?

### 4. APR Calculation
- [ ] **Source of APR data**:
  - On-chain calculation?
  - API endpoint?
  - Third-party indexer?

- [ ] **APR Components**:
  - Trading fee APR: How calculated?
  - Bonus/rewards APR: Token emissions?
  - Campaign-based incentives?

- [ ] **Verification**:
  - Compare with Thala UI
  - Test calculation with sample pool
  - Identify any caveats (IL, impermanent loss considerations)

### 5. Integration Pattern
Compare with TAPP:
- [ ] Similar concentrated liquidity model?
- [ ] Similar view function patterns?
- [ ] Can reuse tick conversion logic?
- [ ] Position indexing similar?

---

## Hyperion DEX Research

### 1. Documentation & Resources
- [ ] Find official Hyperion documentation
- [ ] Locate smart contract addresses on Aptos mainnet
- [ ] Check for official SDKs
- [ ] Find API documentation (if available)

### 2. DEX Architecture
- [ ] What type of AMM?
- [ ] Fee structure?
- [ ] Position management model?
- [ ] Any unique features?

### 3. Data Access

#### On-Chain Data
- [ ] **Smart Contract Addresses**:
  - Main protocol address: `???`
  - Router address: `???`
  - View functions module: `???`

- [ ] **Pool Data**:
  - Resource type for pools: `???`
  - Query methods?
  - Available fields?

- [ ] **Position Data**:
  - View functions for positions: `???`
  - Position structure?

- [ ] **Token Data**:
  - Token list source?

#### HTTP API (if exists)
- [ ] Base URL: `???`
- [ ] Available endpoints?
- [ ] Authentication/rate limits?

### 4. APR Calculation - **PRIORITY**
This is critical as user reports extremely high APRs (300-1000%+).

- [ ] **Source of APR data**:
  - Where does Hyperion display APR?
  - On-chain or off-chain calculation?

- [ ] **APR Components**:
  - What drives the high APR? (emissions, fees, incentives?)
  - Is this sustainable or time-limited campaign?

- [ ] **Verification Steps**:
  1. Visit Hyperion UI and note highest APR pools
  2. Record pool addresses and token pairs
  3. Check TVL of high-APR pools (low TVL can inflate APR%)
  4. Verify APR calculation methodology
  5. Compare with on-chain data
  6. Document any disclaimers/risks

- [ ] **Risk Assessment**:
  - Is high APR due to low TVL?
  - Are there lock-up periods?
  - Is it from temporary incentive campaigns?
  - What's the sustainability?

### 5. Integration Pattern
- [ ] Similar to TAPP/Thala?
- [ ] Any unique challenges?
- [ ] Code reuse opportunities?

---

## Next Steps

### Phase 1: Initial Research (Current)
1. ✅ Create scraper crate structures
2. 🔄 Document research requirements (this file)
3. ⏳ Gather documentation and resources for both DEXes
4. ⏳ Identify smart contract addresses

### Phase 2: Data Access
1. Implement basic pool fetching for one DEX
2. Verify data format matches database schema
3. Test APR calculations
4. Repeat for second DEX

### Phase 3: Position & Token Data
1. Implement position fetching
2. Implement token list fetching
3. Handle edge cases (empty positions, missing data)

### Phase 4: API Integration
1. Wire up scrapers to API refresh endpoints
2. Add DEX-specific handlers
3. Test with existing filters (`GET /pools?dex=thala`)

### Phase 5: Testing & Validation
1. Verify APR numbers with UI
2. Test multi-DEX queries
3. Validate database upserts
4. Performance testing

---

## Reference: TAPP Integration Pattern

For comparison, here's what TAPP uses:

```rust
// Smart Contract Addresses
view: "0xf5840b576a3a6a42464814bc32ae1160c50456fb885c62be389b817e75b2a385"
router: "0x487e905f899ccb6d46fdaec56ba1e0c4cf119862a16c409904b8c78fab1f5e8a"

// Pool Resource Type
"0x5c2e5a4d1b355b939ab160c618ed5504a6e1addf109388aa3b83b73b207ab6c7::clmm::Pool"

// View Functions
get_positions: "VIEW_ADDR::clmm_views::get_positions"
current_tick_idx: "VIEW_ADDR::clmm_views::current_tick_idx"

// HTTP API
Base URL: https://api.tapp.exchange (or similar)
Endpoints: token list, pool list with APR data
```

Thala and Hyperion likely have similar patterns but with different addresses and possibly different view function names.

---

## Questions to Answer

1. **For Thala**:
   - Does Thala have a REST API like TAPP?
   - What's their main smart contract address?
   - How is APR calculated?

2. **For Hyperion**:
   - What's driving the 300-1000%+ APR claims?
   - Is this sustainable or campaign-based?
   - What's the TVL of high-APR pools?

3. **General**:
   - Are there community resources (Discord, GitHub) for integration help?
   - Are there existing integrations in other languages we can reference?
   - Do they have public analytics pages that show data sources?
