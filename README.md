# HomeToGo Dash Prototype

A responsive web prototype demonstrating Dash, a conversational AI agent for family vacation rental recommendations.

## Quick Start (Local)

Open `index.html` directly in a browser, or serve locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000/?user_id=123&trip_id=xyz`

## Deploying to GitHub Pages (manual)

This repo has no git remote configured. To deploy it yourself:

1. Create a new GitHub repository named `hometogo-dash` under your account
2. Add it as a remote and push:
   ```bash
   git init   # if not already a repo
   git add .
   git commit -m "init"
   git remote add origin https://github.com/alexsyna/hometogo-dash.git
   git branch -M main
   git push -u origin main
   ```
3. In the repo's Settings → Pages, select "Deploy from a branch", branch `main`, folder `/`
4. Visit `https://alexsyna.github.io/hometogo-dash/`

## View the Email

Open `email.html` directly in a browser or email client to preview the deeplink email.

## Features

- **Chat Interface:** Conversational AI agent with message history
- **Carousel:** Swipeable home recommendations, 3 homes per turn
- **Modal:** Detailed home information (amenities, rating, availability)
- **Feedback:** Upvote/downvote agent responses (visual only, no storage)
- **Responsive:** Works on mobile, tablet, desktop

## Tech Stack

- Vanilla JavaScript (no framework)
- Tailwind CSS (via CDN)
- Static JSON data
- GitHub Pages hosting (once deployed)

## File Structure

```
hometogo-dash/
├── index.html          # Main app
├── email.html          # Email template
├── data/
│   └── mock-data.json  # Mock family profiles, agent responses, homes
├── css/
│   └── styles.css      # Styling
└── js/
    └── app.js          # Chat logic
```

## Mock Data

All agent responses and homes are mocked in `data/mock-data.json`. To add more homes or responses, edit this file. The `default` response key is used as the fallback for free-text input.

## Notes

- No real LLM integration — all agent responses are mocked and mapped to fixed intents
- No authentication or user accounts
- No persistent storage — feedback and wishlist state live only in the DOM for the session
- No real booking functionality — "Book Now" links to hometogo.com as a placeholder
- Standalone project, not connected to any other codebase
