# Tests Playwright
# Configuration pour tester l'application avec MCP

## Setup
```bash
npm install -D @playwright/test
npx playwright install
```

## Run tests
```bash
npm run dev &
npx playwright test
```

## MCP Integration
Utiliser @playwright/mcp pour:
- Navigate to URL
- Screenshot
- Click elements
- Fill forms
- Assert content
