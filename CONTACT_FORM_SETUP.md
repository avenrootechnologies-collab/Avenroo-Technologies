# Form and Deployment Setup

Both public enquiry forms use the same API. The contact form submits its project brief to `POST /api/contact`; the student form sends its course or internship details to that endpoint as a contact record. The services page reads `GET /api/services`. In development, Vite proxies `/api` to the local Express server.

The API validates submissions, saves them to MongoDB, then sends an enquiry notification and confirmation email when SMTP is configured. Production submissions require MongoDB; the API returns an error instead of pretending a submission was saved if the database is unavailable.

## Local environment

Copy `AvenrooTechnologies/backend/.env.example` to `AvenrooTechnologies/backend/.env`, then set `MONGO_URI` and, if email delivery is needed, the SMTP values. Copy `AvenrooTechnologies/frontend/.env.example` to `AvenrooTechnologies/frontend/.env` for the site's public contact details. The local Vite proxy means `VITE_API_BASE_URL=/api` works locally.

Never commit `.env` files. SMTP credentials and the Atlas URI must stay in Render's environment settings; `VITE_*` values are public and are compiled into the frontend.

## Vercel frontend

Create or link a Vercel project to the GitHub repository and set its **Root Directory** to `AvenrooTechnologies/frontend`. Vercel serves the Vite `dist` output. `vercel.json` enables direct navigation to React Router pages such as `/contact` and `/services`.

Set these Vercel environment variables for Production, Preview, and Development as needed:

```env
VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api
VITE_CONTACT_EMAIL=your-public-contact@example.com
VITE_CONTACT_PHONE=+91XXXXXXXXXX
VITE_WHATSAPP_NUMBER=91XXXXXXXXXX
VITE_WHATSAPP_MESSAGE=Hi Avenroo Technologies, I want to discuss a project.
VITE_LINKEDIN_URL=https://www.linkedin.com/company/your-company
VITE_INSTAGRAM_URL=https://www.instagram.com/your-profile
VITE_FACEBOOK_URL=https://www.facebook.com/your-page
```

Use the actual service URL Render assigns for `VITE_API_BASE_URL`, then redeploy Vercel so Vite includes it in the built frontend.

## Render API and Atlas

Create a Render Blueprint from `render.yaml` at the repository root. The service builds and runs only the Express API. Supply these values when Render asks for them:

- `MONGO_URI`: an Atlas database user's connection string for the app database.
- `CLIENT_URLS`: the exact Vercel site origin, with no trailing slash. Add any separate preview origin only if preview forms should be allowed.
- `CONTACT_TO_EMAIL`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM_EMAIL`: required for enquiry and confirmation emails. `SMTP_FROM_EMAIL` must be a verified sender. The Blueprint defaults to port `587` and non-SSL SMTP.

Atlas organization access does not itself provide an application database login. Create or use a database user with access to the app database, then allow the Render service's outbound IP ranges in Atlas Network Access. Keep `ALLOW_PRODUCTION_LOCAL_CONTACT_STORAGE=false`; local file storage is not durable on Render.

After deployment, check `https://<your-render-service>.onrender.com/api/health`. It returns HTTP 503 while MongoDB is disconnected in production and becomes healthy when the API can store submissions. The response includes safe database and mail configuration status when `HEALTH_INCLUDE_DETAILS=true`.

## Form verification

Submit the contact form and the student enquiry/internship form on the deployed site. Each should show a success message after the API returns HTTP 201. Confirm that a record appears in the Atlas app database and that the notification and confirmation emails arrive when SMTP is configured. The services page should load its list from `GET /api/services`.
