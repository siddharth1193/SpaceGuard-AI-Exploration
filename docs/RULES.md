# SpaceGuard AI — Engineering Rules

## Code

- Write readable, self-documenting code. Prefer clarity over cleverness.
- Keep functions small and focused — one responsibility per function.
- No dead code. If code is commented out, delete it.
- No duplicate logic. Extract shared behavior into utilities or services.
- Use meaningful naming: `evaluateHealth()` not `check()`, `anomalies` not `data`.
- No hidden side effects in functions that appear to be pure.

## React

- Declare all hook dependencies correctly — no suppressed ESLint warnings.
- Use `useCallback` / `useMemo` only when there is a measured or obvious performance need.
- Clean up effects: unsubscribe sockets, clear intervals, cancel requests.
- Never store derived state — compute it during render.
- Use Error Boundaries to prevent white-screen crashes.
- Prefer controlled components for forms and inputs.

## API Contracts

- All endpoints return `{ success: boolean, data: any, meta: object }`.
- Error responses use appropriate HTTP status codes (400, 404, 500).
- Error responses include `{ success: false, error: string }`.
- Validate inputs on POST endpoints before processing.
- Set timeouts on all outbound HTTP requests.

## Backend

- Separate concerns: routes handle HTTP, services handle business logic.
- Use centralized error handling via Express error middleware.
- Log errors with `console.error` and warnings with `console.warn`.
- Implement graceful shutdown on SIGTERM/SIGINT.
- Add health check endpoints for monitoring.
- Never crash on unhandled promise rejections in service code — use try/catch.

## Security

- **Never commit secrets** — use `.env` files, check `.gitignore`.
- Validate and sanitize all user inputs.
- Configure CORS to specific origins in production (not `*`).
- Apply rate limiting to API endpoints.
- Set security headers (X-Content-Type-Options, X-Frame-Options, etc.).
- Use environment variables for all configuration that varies by environment.

## Testing

- Tests must be deterministic — no dependency on wall clock, network, or randomness.
- Isolate units — mock external dependencies (NOAA API, watsonx, etc.).
- Follow Arrange / Act / Assert pattern.
- Test behavior, not implementation details.
- Include edge cases: null inputs, empty arrays, boundary values.
- Name tests descriptively: `'returns CRITICAL for telemetry missing 30 hours'`.

## Deployment

- Production configuration is separate from development.
- Build before deployment — never deploy source files directly.
- No `localhost` references in production code — use environment variables.
- Verify health endpoint after deployment.
- Document rollback procedure for every deployment target.
