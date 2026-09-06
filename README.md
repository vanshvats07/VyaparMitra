# VyaparMitra

VyaparMitra is a business guidance application for small businesses in India. A user creates a business profile, then receives dashboard metrics, government scheme information, AI recommendations, chatbot guidance, and business insights based on the information available for that profile.

## Key Features

- Business onboarding and profile updates
- Personalized dashboard and profile-completion metrics
- Government scheme search with state/category data
- Business performance history and charts
- AI recommendations using Gemini on the server
- AI chatbot for business questions
- AI business insights with opportunities, risks, and next steps
- Loading, validation, error, and empty states

## Technology Stack

- Next.js `16.3.3` App Router
- React `19.2.8`
- MongoDB Atlas with Mongoose
- Gemini API through server-side Next.js routes
- Zod for request and AI-response validation
- Recharts for dashboard charts
- Tailwind CSS

## Project Structure

```text
src/app/                 Pages and API routes
src/app/api/             Server-side backend endpoints
src/app/dashboard/       Dashboard pages and components
src/lib/                 Database, authentication, AI, validation, and calculations
src/models/              Mongoose models
public/                  Static assets
```

## How the Application Works

```text
Frontend pages
		|
		v
Next.js API routes
		|
		+--> MongoDB Atlas for users, schemes, and business metrics
		+--> Gemini for recommendations, chat, and insights
		+--> Market provider when configured
		|
		v
Validated response returned to the frontend
```

User data is stored in MongoDB. The dashboard fetches the signed-in user's profile, calculated profile metrics, and business history. Business calculations run on the server. Gemini is called only from server-side API routes so keys and prompts stay away from the browser.

## Environment Variables

Create a local `.env.local` file or configure these values in the deployment platform. Use placeholders only in documentation:

```bash
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_long_random_session_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
```

`MONGODB_URL` is also supported for compatibility, but `MONGODB_URI` is recommended. `GEMINI_MODEL` is optional and defaults to `gemini-3.6-flash`.

All listed variables are server-only. Do not rename them with `NEXT_PUBLIC_`, commit environment files, or place real values in source code.

## Local Setup

Requirements: Node.js, npm, a MongoDB Atlas connection, and the required environment variables.

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in a browser.

## Production Commands

```bash
npm run lint
npm run build
npm run start
```

The project uses the standard Next.js output and does not require a custom server or special Vercel configuration. Vercel can detect the framework automatically. Configure environment variables in the Vercel project settings before deployment.

## Important API Endpoints

All protected endpoints require the signed session cookie created during onboarding. Requests must use the authenticated user's ID.

### Users and Business Profile

`POST /api/users` creates a profile and starts a session.

```json
{
	"name": "Example User",
	"phone": "9999999999",
	"state": "Maharashtra",
	"district": "Pune",
	"village": "Pune",
	"businessIdea": "Dairy shop",
	"businessCategory": "Dairy",
	"budget": 250000,
	"experience": "Beginner",
	"language": "en"
}
```

`GET /api/users/[id]` reads a protected profile. `PATCH /api/users/[id]` updates the complete validated profile.

### Schemes

`GET /api/schemes?state=Maharashtra&category=Dairy` returns verified scheme records when available.

```json
{
	"success": true,
	"schemes": []
}
```

### Market Data

`GET /api/market?category=Dairy` validates market filters. The current source is not configured, so it returns a clear `503` response instead of fake market values.

### Metrics

`POST /api/metrics` stores a business record:

```json
{
	"userId": "authenticated-user-id",
	"month": "January 2026",
	"sales": 100000,
	"expenses": 70000
}
```

`GET /api/metrics/[userId]` returns business history. `GET /api/users/[id]/metrics` returns calculated profile metrics such as readiness and profile completion.

### AI Recommendations

`POST /api/recommendations`:

```json
{
	"userId": "authenticated-user-id"
}
```

Returns validated recommendation objects with a title, description, reason, and priority.

### AI Chatbot

`POST /api/chat`:

```json
{
	"userId": "authenticated-user-id",
	"message": "How should I plan my budget?"
}
```

```json
{
	"success": true,
	"reply": "..."
}
```

### AI Business Insights

`GET /api/insights?userId=authenticated-user-id` returns:

```json
{
	"success": true,
	"insights": {
		"summary": "...",
		"opportunities": ["..."],
		"risks": ["..."],
		"nextSteps": ["..."]
	}
}
```

`POST /api/ai-guide` is retained as an existing direct guidance endpoint; the current chatbot UI uses `/api/chat`.

## Viva Explanation

1. Onboarding validates the business profile and sends it to `/api/users`.
2. The server stores the profile in MongoDB and creates a signed HTTP-only session cookie.
3. The dashboard uses that session and user ID to load profile data, history, and calculated metrics.
4. Schemes are loaded from the database and filtered by available query parameters.
5. Business metrics are calculated in server-side utility functions, not recreated in the browser.
6. Recommendations, chatbot replies, and insights send limited profile context to Gemini from server-side routes.
7. Gemini output is validated before structured results are returned.
8. API keys, database credentials, and session secrets never go to the frontend.

## Demo Checklist

1. Open the landing page.
2. Complete onboarding with a configured test account.
3. Show the profile in the dashboard.
4. Show readiness and profile-completion metrics.
5. Open Government Schemes and demonstrate filters or the honest empty state.
6. Open the AI Business Guide and generate recommendations.
7. Ask the chatbot a budget or business-category question.
8. Show AI insights on the dashboard.
9. Edit the profile and refresh the dashboard.
10. Show the persisted values and explain the server-side API flow.

## Known Limitations

- The market data source is not configured, so market requests return an unavailable response.
- AI features require `GEMINI_API_KEY`.
- User creation and protected routes require `SESSION_SECRET`.
- Government scheme results depend on the records available in MongoDB.
- AI responses are guidance, not guaranteed financial, legal, or government eligibility advice.
