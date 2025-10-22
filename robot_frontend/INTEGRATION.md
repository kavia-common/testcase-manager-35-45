# Frontend Integration Notes

- Configure API base URL via .env:
  REACT_APP_API_BASE=http://localhost:3001
- The API client in src/api/client.js uses the above base and unprefixed paths:
  - /testcases, /scenarios, /groups, /runs, /logs, /configs
- After changing .env, restart the dev server for changes to take effect.
- CORS: Backend must allow http://localhost:3000 (configured via CORS_ORIGINS/ALLOWED_ORIGINS/FRONTEND_ORIGIN).
