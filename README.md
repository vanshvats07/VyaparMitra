# VyaparMitra

VyaparMitra is a starting point for aspiring entrepreneurs and small business
owners who want practical guidance shaped by their experience, budget, business
idea, and local context. The first version focuses on collecting a profile,
showing profile-based prompts, and maintaining a simple action checklist.

## What it includes

- English and Hindi onboarding and dashboard interfaces.
- Profile fields for contact details, location, business idea, category, budget,
  business status, and experience.
- MongoDB persistence through Mongoose and shared Zod validation.
- A private, browser-bound session for viewing and updating the profile.
- Deterministic first-step prompts and a saved, editable checklist.
- Same-origin checks, bounded JSON request bodies, secure session cookies, and
  baseline HTTP security headers.

Recommendations are general prompts, not verified market research or
financial, legal, or regulatory advice.

## Requirements

- Node.js 22.16 or later.
- npm.
- A MongoDB instance accessible to the application.

## Setup

Install dependencies and create a local environment file:

```bash
npm install
cp .env.example .env.local
```

Set `MONGODB_URI` in `.env.local` to a MongoDB connection string available to
your machine. For a local MongoDB server, the example file uses
`mongodb://127.0.0.1:27017/vyaparmitra`. Do not commit credentials or real
environment files.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validation commands

```bash
npm test
npm run lint
npm run build
```

The test command uses Node's built-in test runner and TypeScript type stripping.
The tests cover profile and plan validation, locale options, budget formatting,
recommendation generation, and request-origin/body-size checks. Database-backed
flows require a running MongoDB instance and are not exercised by the unit test
suite.

## Profile and session behavior

Creating a profile stores the submitted contact and business information in
MongoDB and creates a 30-day, HTTP-only browser session. In production the
session cookie is marked `Secure`; serve the application over HTTPS. Signing
out revokes the browser session but does not delete the stored profile.

This first version does not verify phone numbers with OTP, provide account
recovery, or let a user retrieve a profile from another browser. A browser
session is not proof of phone ownership. Do not treat it as production-grade
account authentication; add a suitable authentication and recovery flow before
using this application for sensitive production data. Protect `MONGODB_URI`,
restrict database access, and configure deployment-level abuse controls such
as rate limiting.

## Main routes

- `/` — product introduction.
- `/onboarding` — create a profile.
- `/dashboard` — view profile details, suggestions, and saved plan tasks.
- `/dashboard/edit` — update business status, idea, category, available budget,
  and experience.

The API persists profiles in MongoDB. Configure `MONGODB_URI` before submitting
onboarding or making dashboard updates.
