# Inbox Guard Dashboard

A modern Next.js dashboard for email deliverability management, providing a clean interface to interact with the Inbox Guard API.

## Features

### Live Status Monitoring

- **Quick Status Panel**: Real-time API health, DNS compliance, DKIM status, and spam rate monitoring
- **Domain Management**: Remember and switch between domains with localStorage persistence
- **Auto-refresh**: Live status updates with refresh timestamps

### DNS Management

- **DNS Check**: Verify SPF and DMARC compliance with detailed analysis
- **DNS Autofix**: Preview and apply automated DNS fixes (dry-run and live mode)
- **DKIM Setup**: Configure DKIM selectors with dynamic form management

### Email Compliance

- **Pre-send Check**: Validate email headers for RFC 8058 one-click unsubscribe compliance
- **Sample Headers**: Built-in valid and invalid header examples
- **Fix Snippets**: Copy-to-clipboard ready header fixes

### Analytics & Reporting

- **Postmaster Tools**: Google Postmaster metrics integration with trend charts
- **Spam Rate Tracking**: Visual charts with threshold indicators (25%, 30%)
- **Domain Reputation**: Historical reputation trend analysis

## Prerequisites

- Node.js 18+ and npm
- Running Inbox Guard API backend (see main README)

## Installation

```bash
# Navigate to the web app directory
cd apps/web

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API URL and optional API key

# Start development server
npm run dev
```

## Environment Variables

Configure these in your `.env.local` file:

```bash
# Required: Backend API URL
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# Optional: API key for write operations
NEXT_PUBLIC_API_KEY=your_api_key_here

# Optional: Default values for forms
DEFAULT_DOMAIN=branddeliverability.org
DEFAULT_DKIM_SELECTOR=selector1._domainkey
```

## Pages Overview

### `/` - Dashboard

- Tool navigation cards
- Live Quick Status panel with 4 key metrics
- Domain input with auto-save to localStorage
- Manual refresh with loading states

### `/dns/check` - DNS Compliance

- Form: zone_root (required), fqdn (optional)
- SPF analysis: status, lookup count, compliance
- DMARC analysis: exists, valid, record content
- Integrated autofix actions (dry-run and apply)

### `/dns/autofix` - Automated DNS Fixes

- Form: zone_root, apply toggle
- Plan preview for dry-run mode
- Applied changes display for live mode
- Post-check verification results

### `/dns/dkim` - DKIM Configuration

- Form: zone_root, dynamic selector list
- Selector management: add/remove, host/target/TTL
- Plan preview and applied changes
- DNS resolution verification with status badges

### `/presend/check` - Header Validation

- Textarea: raw email headers
- Sample buttons: valid and invalid examples
- Decision: PASS/BLOCK with reasoning
- Fix snippets: copy-to-clipboard header fixes
- Header analysis: found vs. missing headers

### `/postmaster` - Analytics Dashboard

- Form: domain, days (7/14/30)
- Current status: spam rate, reputation, domain
- Data summary: fetched/stored record counts
- Charts: spam rate and domain reputation trends
- Threshold indicators: warning and critical lines

## API Client

The dashboard uses a custom API client (`/lib/api.ts`) with:

- **Error Handling**: Structured error responses with user-friendly messages
- **Authentication**: Automatic API key injection for write operations
- **Type Safety**: Full TypeScript support with response interfaces
- **Environment Validation**: Runtime checks for required configuration

### API Methods

```typescript
import { apiGet, apiPost } from "@/lib/api";

// GET with optional query parameters
const data = await apiGet<ResponseType>("/endpoint", { param: "value" });

// POST with optional body and auth requirement
const result = await apiPost<ResponseType>("/endpoint", { data }, true);
```

## Shared Components

### UI Components

- **`StatusBadge`**: Colored status indicators (pass/warn/fail/idle)
- **`FormCard`**: Consistent card wrapper for forms with titles/subtitles
- **`CopyButton`**: One-click copy-to-clipboard with visual feedback
- **`JsonBlock`**: Pretty-printed JSON with copy functionality

### State Management

- **Domain Persistence**: Automatic localStorage saving/loading
- **Default Values**: Environment-based defaults for forms
- **Loading States**: Consistent loading indicators across forms

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Design System**: Consistent spacing, colors, and typography
- **Responsive**: Mobile-first responsive design
- **Accessibility**: Proper focus states and semantic HTML

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## API Integration

The dashboard integrates with these Inbox Guard API endpoints:

### Core Endpoints

- `GET /health` - API health check
- `GET /dns/check` - DNS compliance verification
- `POST /dns/autofix` - Automated DNS fixes
- `POST /dns/dkim/apply` - DKIM selector management
- `POST /presend/check` - Email header validation

### Data Endpoints

- `GET /dns/records` - DNS record listing
- `POST /postmaster/pull-daily` - Postmaster data ingestion
- `GET /postmaster/latest` - Latest postmaster metrics

### Authentication

Write operations require API key authentication via `X-API-Key` header:

- DNS autofix (apply mode)
- DKIM setup (apply mode)
- Pre-send check

## Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy to Vercel with environment variables set
```

### Docker

```bash
# Build production image
docker build -t inbox-guard-web .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://your-api:8000 \
  inbox-guard-web
```

### Static Export

```bash
# Generate static files
npm run build
npm run export

# Serve static files from /out directory
```

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

Modern JavaScript features used:

- ES2020 optional chaining
- Async/await
- Fetch API
- Clipboard API

---

**Ready to manage your email deliverability with style! 🚀**
