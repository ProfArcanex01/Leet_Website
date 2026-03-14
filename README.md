# Leet Carpooling Website

This is a [Next.js](https://nextjs.org) project bootstrapped for the Leet Carpooling platform.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Sanity Studio

Sanity is configured as an embedded Studio inside this Next.js app.

1. Copy the Sanity values from `.env.example` into `.env.local` if needed.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.
4. Open `http://localhost:3000/studio`.

Sanity source files live in `src/sanity/`, with Studio configuration in `sanity.config.ts` and CLI configuration in `sanity.cli.ts`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Project Structure

- `src/app/` - App Router directory containing pages and layouts
- `src/components/` - Reusable React components
- `public/` - Static assets
