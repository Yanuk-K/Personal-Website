# [Yeunwook Kim](https://yeunwook.kim/)

An interactive personal portfolio built as a Kubuntu/KDE Plasma-inspired desktop.

## Features

- Draggable, resizable Breeze-style application windows
- Coffee app with live brew timers and step timelines parsed from `coffeerecipe.txt`, plus a built-in grinder calculator
- Per-brewer animations: V60 cone, flat-bottom B75 with drip assist, the AeroPress chamber and the OXO Rapid Brewer tower, each with its own pour, stir, shake and press motion
- Plasma panel, Kickoff launcher, KRunner, notifications, system tray, and calendar
- Dolphin file manager, Konsole terminal, Contacts, and System Settings
- Kate notebook with portfolio documents, embedded resume, persistent personal notes, quick open, find, and mobile sidebar controls
- Breeze Light and Dark themes, accent colors, and bundled high-resolution wallpaper choices
- Desktop and mobile layouts backed by the same portfolio content

## Stack

- React 18, TypeScript, and Vite
- Tailwind CSS
- React Router and React Markdown
- AWS Amplify deployment with Route 53 hosting

## Development

```bash
npm install
npm run dev
```

## Validation And Production Build

```bash
npm run lint
npm run build
```

The production build is emitted to `dist/`; the build script also creates `dist/200.html` for SPA route fallback on Amplify.
