# 🎅 Secret Santa Web App

A festive Secret Santa organizer built with Next.js, TypeScript, Tailwind CSS, and Resend. Add your participants, generate a no-self-match Secret Santa shuffle, and send each person a private email revealing who they are buying for.

## What the app does

- Collects participant names and email addresses in a polished holiday-themed form
- Validates that every entry is complete and uses a valid email format
- Randomly creates Secret Santa assignments while preventing self-assignments
- Sends one private email per participant through Resend
- Shows the organizer a success screen with the full assignment list for reference

## Prerequisites

- Node.js 18 or newer
- An npm-compatible environment
- A free Resend account and API key

## Setup

1. Clone the repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the example environment file:

   ```bash
   cp .env.local.example .env.local
   ```

4. Open `.env.local` and replace the placeholder with your real Resend API key.
5. Start the development server:

   ```bash
   npm run dev
   ```

6. Visit `http://localhost:3000`.

## Getting a free Resend API key

1. Go to [resend.com](https://resend.com).
2. Create a free account or sign in.
3. Open the API keys section in the dashboard.
4. Create a new API key and paste it into `.env.local` as `RESEND_API_KEY`.

## Important note about the sandbox sender

This app uses `onboarding@resend.dev`, which is Resend's sandbox sender. On the free tier, Resend only allows sandbox emails to be delivered to your verified email address, so test the app with email addresses you have verified in Resend.

## Deploying to Vercel

1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Add the `RESEND_API_KEY` environment variable in the Vercel project settings.
4. Deploy.

## Project structure

```text
secret_santa/
├── app/
│   ├── api/
│   │   └── send-santa/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ParticipantForm.tsx
├── lib/
│   ├── email.ts
│   └── shuffle.ts
├── .env.local.example
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```
