# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## API (Vercel Serverless)

All endpoints are consolidated into **one** serverless function: `GET/POST /api/sports?type=...` — stays under Vercel Hobby limit (12 functions).

**Required env (set in Vercel):** `SPORTMONKS_API_TOKEN`, `AI_insight` (OpenAI). Tokens are never returned in responses.

| type | Method | Description |
|------|--------|-------------|
| `health` | GET | Health check; returns `ok`, `sportmonksKeyPresent`, `timestamp`. |
| `fixtures` | GET | Upcoming fixtures. Params: `leagueIds`, `days` (cap 100), `all`, `raw`, `debugUrl`, `includeEuropa`. |
| `live` | GET | Live in-play fixtures. Params: `leagueIds`, `minutes`. |
| `fixture` | GET | Single fixture. Params: `id`. |
| `league` | GET | League info. Params: `id`. |
| `leagues_available` | GET | Leagues with upcoming fixtures. Params: `days`. |
| `leagues_top` | GET | Static top leagues list. |
| `leagues_search` | GET | Search leagues. Params: `q`. |
| `fixtures_season` | GET | Fixtures by season. Params: `seasonId`. |
| `seasons` | GET | Seasons by leagues. Params: `leagueIds`. |
| `ai_insight` | POST | AI match insight. Body: `{ fixtureId }`. |
| `model_probability` | GET | Win-rate model. Params: `fixtureId`. |
| `model_probability_snapshot` | POST | Save snapshot. Body: `{ fixtureId, home, draw, away, ts? }`. |
| `model_probability_movement` | GET | Snapshot history. Params: `fixtureId`, `minutes`. |

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
