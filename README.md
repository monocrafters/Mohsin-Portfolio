# Portfolio — M. Mohsin

Clean, Apple-inspired developer portfolio built with Next.js, React, and Tailwind CSS.

## Features

- Clean minimal UI (Apple-style)
- Profile photo in hero & about sections
- Project showcase with images
- Skills, experience timeline, contact form
- Fully responsive & SEO optimized

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Customize

Edit `src/data/content.ts` for your name, bio, skills, projects, and experience.

### Add your photo

1. Save your photo as `public/profile.jpg`
2. In `content.ts`, change `profileImage` to `"/profile.jpg"`

### Add project screenshots

1. Add images to `public/projects/` (e.g. `my-app.jpg`)
2. Update the `image` field for each project in `content.ts`

## Tech Stack

- Next.js 15 · React 19 · Tailwind CSS 4 · Framer Motion
