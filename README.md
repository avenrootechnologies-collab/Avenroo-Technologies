# Avenroo Technologies

React/Vite frontend and Express API for Avenroo Technologies. Contact and student enquiry forms submit to the Express API, which stores submissions in MongoDB and sends email notifications when SMTP is configured.

The private operations panel is available at `/admin`. It supports verified email/password accounts, invitation-based team registration, enquiry status tracking, service listing controls, an editable contact sheet with Excel-compatible CSV import/export, email campaigns for opted-in contacts, and API/mail status.

## Project layout

- Frontend: `AvenrooTechnologies/frontend`
- Backend: `AvenrooTechnologies/backend`
- Render Blueprint: `render.yaml`

## Local development

1. Install the backend dependencies and start the API:

   ```powershell
   cd AvenrooTechnologies/backend
   npm ci
   npm run dev
   ```

2. In a second terminal, install the frontend dependencies and start Vite:

   ```powershell
   cd AvenrooTechnologies/frontend
   npm ci
   npm run dev
   ```

Vite proxies `/api` to `http://localhost:5000`. Copy each `.env.example` to `.env` and set the local MongoDB and mail configuration as needed. Never commit `.env` files.

## Deployment

- **Vercel frontend root:** `AvenrooTechnologies/frontend`
- **Render API:** create from the root `render.yaml`; it uses `AvenrooTechnologies/backend` as its root directory and serves `/api/*` only.
- **Vercel frontend root:** `AvenrooTechnologies/frontend`; its `/api/*` rewrite proxies requests to the Render service on the same site origin.
- **Render environment:** set `MONGO_URI` to the Atlas application user's connection string. Configure SMTP credentials for mail from `connect@avenroo.in`; the Blueprint sets the official site URL and allowed origin.

The first owner account must register as `connect@avenroo.in` and confirm the link delivered to that inbox. Afterward, an admin can invite teammates from the Team access tab; each invited user must set a password and verify their own email. Authenticated routes use an HttpOnly server session cookie. Bulk campaign delivery also requires working SMTP credentials; the sender address is set to `connect@avenroo.in` in the Blueprint.

See [CONTACT_FORM_SETUP.md](CONTACT_FORM_SETUP.md) for the form flow and deployment settings.
