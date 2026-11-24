# Deployment

The project is a static Vite site. Hash-based routes keep page navigation and refresh compatible with static hosting.

## Cloudflare Pages

1. Create a new GitHub repository and push the project files. Include `package-lock.json`; do not commit `node_modules`, `.tools`, `.env` files or credentials.
2. In Cloudflare, open **Workers & Pages → Create → Pages → Connect to Git** and authorize/select the repository.
3. Select **Vite** or configure the build manually:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Production branch: `main` (or your chosen default branch)
4. Save and deploy. Cloudflare will show a public `https://<project>.pages.dev` address when the build completes.
5. Open that address on a second phone or computer to check layout and navigation. Local demonstration records are stored separately in each browser and do not synchronize.

## Vercel

Import the GitHub repository into Vercel. Framework preset: **Vite**; build command: `npm run build`; output directory: `dist`. Deploy, then use the assigned HTTPS domain to test another device.

## Netlify

Import the GitHub repository into Netlify. Build command: `npm run build`; publish directory: `dist`. Deploy, then test the generated HTTPS URL on another device. Hash routing requires no SPA rewrite rule.

No hosting account has been connected and this project has not been deployed.
