# Copilot Instructions for AI Agents

## Project Overview
- This is an Angular 21 web application, generated with Angular CLI, using TypeScript and Tailwind CSS for styling.
- The main entry point is `src/main.ts`, which bootstraps the root `App` component (`src/app/app.ts`).
- Routing is configured in `src/app/app.routes.ts` (currently empty, but use Angular Router patterns).
- The app is built for deployment with Caddy (see `Caddyfile` and `railway.toml` for deployment and build phases).

## Key Workflows
- **Development server:** `npm start` or `ng serve` (see `package.json` and `.vscode/tasks.json`).
- **Build:** `npm run build` (outputs to `browser/` for Caddy serving).
- **Unit tests:** `npm test` (runs `ng test` with Vitest integration).
- **Scaffolding:** Use Angular CLI (`ng generate component <name>`, etc.).
- **Formatting:** Tailwind and PostCSS are configured; see `.postcssrc.json` and `src/styles.css`.

## Project Structure & Conventions
- **Source code:** All app code is in `src/` (entry: `main.ts`, root HTML: `index.html`).
- **App code:** `src/app/` contains the main app component, config, and routes.
- **Component style:** Use Angular standalone components (see `App` in `app.ts`).
- **Styling:** Use Tailwind via `@import "tailwindcss";` in `src/styles.css`.
- **Testing:** Specs are colocated with code (e.g., `app.spec.ts`).
- **Build output:** Production build artifacts are in `browser/browser/` (served by Caddy).

## Deployment & Integration
- **Caddy server:** Configured in `Caddyfile` to serve from `/app/browser/browser` and handle SPA fallback.
- **Railway/Nixpacks:** Build and deploy phases are defined in `railway.toml`.
- **Environment variables:** Set in `railway.toml` under `[variables]`.

## Patterns & Tips
- Check the context of the application before making a change to avoid breaking what already works
- Prefer Angular's latest standalone component and routing APIs.
- Consult the official documentation before applying the change.
- Use signals for state (see `App` class).
- Keep all new code in `src/app/` unless adding global styles/assets.
- Use tailwind and daisyui for styles
- Always create minimalist styles using the colors already defined by the theme (corporate of deisyui) we are using
- Do not write css inline or in the component files, only in the global `src/styles.css` file
- For new routes, update `app.routes.ts` and provide them in `app.config.ts`.
- For deployment, ensure build output matches Caddy's expected directory.
- Follow Angular 21 and Angular CLI patterns
- Use **signals** for state management whenever possible.
- The changes made must be associated with the current version that is being used
- Configurations and files that are not necessary must always be removed



## References
- [README.md](../README.md): CLI usage, build/test instructions.
- [Caddyfile](../Caddyfile): Production server config.
- [railway.toml](../railway.toml): Build/deploy automation.
- [package.json](../package.json): Scripts, dependencies.
- [src/app/](../src/app/): Main app code and patterns.

---

For any unclear or missing conventions, check the above files or ask for clarification.
