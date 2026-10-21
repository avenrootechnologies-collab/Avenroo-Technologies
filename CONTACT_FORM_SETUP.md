# Form and Deployment Setup

Both public enquiry forms use the same API. The contact form submits its project brief to `POST /api/contact`; the student form sends its course or internship details to that endpoint as a contact record. The services page reads `GET /api/services`. In development, Vite proxies `/api` to the local Express server.

The API validates submissions, saves them to MongoDB, then sends an enquiry notification and confirmation email when SMTP is configured. Production submissions require MongoDB; the API returns an error instead of pretending a submission was saved if the database is unavailable.

## Local environment

Copy `AvenrooTechnologies/backend/.env.example` to `AvenrooTechnologies/backend/.env`, then set `MONGO_URI` and, if email delivery is needed, the SMTP values. Copy `AvenrooTechnologies/frontend/.env.example` to `AvenrooTechnologies/frontend/.env` for the site's public contact details. The local Vite proxy forwards `/api` to the Express server.

Never commit `.env` files. SMTP credentials and the Atlas URI must stay in Render's environment settings; `VITE_*` values are public and are compiled into the frontend.

## Vercel frontend

Create or link a Vercel project to the GitHub repository and set its **Root Directory** to `AvenrooTechnologies/frontend`. Vercel serves the Vite `dist` output. `vercel.json` enables direct navigation to React Router pages such as `/contact` and `/services`.

Set these public Vercel environment variables for Production, Preview, and Development as needed:

```env
VITE_CONTACT_PHONE=+91XXXXXXXXXX
VITE_WHATSAPP_NUMBER=91XXXXXXXXXX
VITE_WHATSAPP_MESSAGE=Hi Avenroo Technologies, I want to discuss a project.
VITE_LINKEDIN_URL=https://www.linkedin.com/company/your-company
VITE_INSTAGRAM_URL=https://www.instagram.com/your-profile
VITE_FACEBOOK_URL=https://www.facebook.com/your-page
```

The Vercel `/api/*` rewrite points at the deployed Render API, keeping browser requests on the site origin for the secure session cookie. If your Render service URL changes, update the external destination in `AvenrooTechnologies/frontend/vercel.json` and redeploy. The public site contact email is set in the frontend source to `connect@avenroo.in`.

## Render API and Atlas

Create a Render Blueprint from `render.yaml` at the repository root. The service builds and runs only the Express API. Supply these values when Render asks for them:

- `MONGO_URI`: an Atlas database user's connection string for the app database.
- `CLIENT_URLS`: the Vercel site origin is set by the Blueprint. Add a separate preview origin only if preview forms should be allowed.
- `CONTACT_TO_EMAIL`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM_EMAIL`: required for enquiry notifications, account confirmations, invitations, and campaigns. `SMTP_FROM_EMAIL` must be a verified `connect@avenroo.in` sender. The Blueprint defaults to port `587` and non-SSL SMTP.

## Admin operations panel

Open `/admin` on the deployed site. Register the initial owner using `connect@avenroo.in`; a confirmation link will arrive from that same official address. After email verification, sign in with the password you created. Invite additional users from **Team access**; they must register from the emailed link and confirm their own email. Admin sessions are stored server-side and expire after 12 hours. The panel tracks enquiries, lets you update or archive public services, and stores an editable contact sheet. The sheet can import and export Excel-compatible CSV files with `Name`, `Email`, `Company`, `Status`, `Notes`, and `Marketing consent` columns. Campaigns send one email per valid, opted-in address, with a limit of 100 recipients per send; SMTP must be configured for delivery.

Atlas organization access does not itself provide an application database login. Create or use a database user with access to the app database, then allow the Render service's outbound IP ranges in Atlas Network Access. Keep `ALLOW_PRODUCTION_LOCAL_CONTACT_STORAGE=false`; local file storage is not durable on Render.

After deployment, check `https://<your-render-service>.onrender.com/api/health`. It returns HTTP 503 while MongoDB is disconnected in production and becomes healthy when the API can store submissions. The response includes safe database and mail configuration status when `HEALTH_INCLUDE_DETAILS=true`.

## Form verification

Submit the contact form and the student enquiry/internship form on the deployed site. Each should show a success message after the API returns HTTP 201. Confirm that a record appears in the Atlas app database and that the notification and confirmation emails arrive when SMTP is configured. The services page should load its list from `GET /api/services`.
