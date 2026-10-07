# Production Deployment Guide

Complete step-by-step deployment guide for the Project Management System.

---

## 1. Database: Supabase PostgreSQL

1. Log in to [supabase.com](https://supabase.com) and click **New Project**.
2. Set a project name (e.g., `ismo-project-management`), choose a database password (save it securely), and select your nearest AWS region.
3. Once provisioned, navigate to **Project Settings $\rightarrow$ Database**:
   - Locate the **Connection string** section.
   - Select the **Transaction pooler (port 6543)** $\rightarrow$ Copy this as `DATABASE_URL` (add `&connection_limit=1`).
   - Select the **Session pooler or Direct (port 5432)** $\rightarrow$ Copy this as `DIRECT_URL`.
4. Apply Prisma migrations from your local terminal:
   ```bash
   cd backend
   npx prisma migrate deploy
   # Optionally seed demo data:
   npx prisma db seed
   ```

---

## 2. Backend API: Render

1. Create a free account at [render.com](https://render.com).
2. Click **New + $\rightarrow$ Web Service** and connect your GitHub repository (`ISMOProjectManagement`).
3. Configure the service settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**:
     ```bash
     npm install && npx prisma generate && npm run build && npx prisma migrate deploy
     ```
   - **Start Command**:
     ```bash
     node dist/index.js
     ```
4. Set the **Environment Variables**:
   | Variable | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` (Render default) |
   | `DATABASE_URL` | Your Supabase pooled URL (port 6543) |
   | `DIRECT_URL` | Your Supabase session/direct URL (port 5432) |
   | `JWT_SECRET` | 64-character random secret string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CORS_ORIGINS` | `https://your-app.vercel.app` (add Vercel domain) |
5. Click **Deploy Web Service**.
6. Note your live URL: `https://<your-service>.onrender.com`.

> [!NOTE]
> Render free tier instances spin down after inactivity. The initial cold request may take 30-50 seconds to boot. Subsequent requests respond in sub-100ms.

---

## 3. Web Frontend: Vercel

1. Log in to [vercel.com](https://vercel.com) and click **Add New $\rightarrow$ Project**.
2. Select your `ISMOProjectManagement` repository.
3. Configure project settings:
   - **Root Directory**: `web`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the **Environment Variable**:
   - `VITE_API_URL`: `https://<your-service>.onrender.com`
5. Click **Deploy**.
6. Copy the assigned Vercel URL and update `CORS_ORIGINS` on Render if not already done.

---

## 4. Mobile App: Android Standalone APK (EAS Build)

1. Sign up for a free account at [expo.dev](https://expo.dev).
2. Install EAS CLI globally on your machine:
   ```bash
   npm install -g eas-cli
   ```
3. Authenticate with your Expo credentials:
   ```bash
   eas login
   ```
4. Navigate to the `mobile` directory and verify `mobile/eas.json`:
   ```bash
   cd mobile
   ```
5. Trigger the standalone Android APK build:
   ```bash
   eas build -p android --profile preview
   ```
6. EAS will package and sign the APK in the cloud. Once complete, you will receive a downloadable link to the `.apk` file that can be installed on any physical Android device.
