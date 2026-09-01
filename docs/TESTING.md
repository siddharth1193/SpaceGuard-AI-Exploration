# SpaceGuard AI — Testing

## Test Strategy

### Unit Tests (Backend)

**Framework:** Jest 29  
**Location:** `backend/tests/`  
**Command:** `cd backend && npm test`

| Test File | Coverage |
|-----------|----------|
| `healthService.test.js` | All 4 health check rules, severity escalation, multi-issue handling |
| `anomalyService.test.js` | All 5 anomaly types, severity levels, aggregate detection |
| `alertService.test.js` | Anomaly→alert conversion, space weather alerts, severity sorting |
| `spaceWeatherService.test.js` | Data structure, value ranges, fallback behavior |

### Test Principles

1. **Deterministic** — No dependency on wall clock, network, or randomness
2. **Isolated** — Each test creates its own data via helper factories (`makeSat()`)
3. **Arrange / Act / Assert** — Clear structure in every test
4. **Behavior-focused** — Tests verify outputs, not internal implementation
5. **Edge cases** — Null values, boundary thresholds, multi-condition scenarios

### Running Tests

```bash
# All backend tests
cd backend && npm test

# Specific test file
cd backend && npx jest tests/healthService.test.js

# With coverage
cd backend && npx jest --coverage
```

## Future Test Plans

### Integration Tests
- API endpoint testing with supertest
- Full request→response contract validation
- Socket.IO connection and event testing

### Frontend Tests
- Utility function tests (colors.js) with Vitest
- Component rendering tests with React Testing Library
- Hook testing for `useSpaceGuardData`

### E2E Tests
- Playwright or Cypress for critical user flows
- Page navigation smoke tests
- Loading/error state verification
