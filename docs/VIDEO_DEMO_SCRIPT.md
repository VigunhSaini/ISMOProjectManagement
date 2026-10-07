# 5-Minute Video Demonstration Script

This document provides the scene-by-scene script and checklist for the required 5-minute technical demonstration video.

---

## Video Overview & Target Timeline

| Timestamp | Scene Focus | Key Action & Talking Points |
| :--- | :--- | :--- |
| **0:00 – 0:30** | Introduction & Architecture | Welcome, present tech stack (Node.js/Express, Prisma 6, Supabase, React Vite, Expo Android), show live URLs. |
| **0:30 – 1:15** | Web Registration & Dashboard | Register new user `demo@example.com`, show form validation, view dashboard with 5 metrics. |
| **1:15 – 2:00** | Create Project on Web | Create project *"Mobile Launch"*, set description and target dates, add tasks under project. |
| **2:00 – 2:45** | Mobile Login (Same Account) | Open Android mobile app, log in with `demo@example.com`, verify single-account unified database access. |
| **2:45 – 3:30** | Real-Time Sync (Cross-Platform) | Create task *"Test on Pixel Phone"* on web $\rightarrow$ pull-to-refresh on mobile $\rightarrow$ task appears immediately! |
| **3:30 – 4:10** | Mobile Task Updates | Mark task *"Test on Pixel Phone"* as completed on mobile $\rightarrow$ refresh web $\rightarrow$ status updates to 100%. |
| **4:10 – 4:40** | Search, Filters & Edge Cases | Filter tasks by priority/status; demonstrate network offline banner ("No internet connection"); show token expiration redirect. |
| **4:40 – 5:00** | Strict Data Isolation & Wrap Up | Log in with second user $\rightarrow$ demonstrate zero visibility into first user's data; conclude presentation. |

---

## Detailed Step-by-Step Walkthrough

### Scene 1: Introduction (0:00 – 0:30)
- **Voiceover**: *"Hello, this is a demonstration of the Full Stack Project Management System. It features a unified Node.js and Express REST backend with Prisma ORM connecting to Supabase PostgreSQL, serving both a responsive React web application and an Expo React Native Android mobile client."*

### Scene 2: Web Authentication & Dashboard (0:30 – 1:15)
- **Action**: Open web app. Intentionally enter an invalid email and a weak password (e.g. `123`) $\rightarrow$ show Zod field validation errors in real time.
- **Action**: Complete valid registration with `alex@example.com` / `Password123!`.
- **Action**: Land on Dashboard. Point out the 5 core assessment metrics: Total Projects, Projects In Progress, Total Tasks, Completed Tasks, and Pending Tasks.

### Scene 3: Web Project & Task Management (1:15 – 2:00)
- **Action**: Click **New Project**. Fill in Name: *"E-Commerce Launch"*, Description: *"Q4 product release"*, Status: *"In Progress"*, Dates: start and end date.
- **Action**: Click into the project. Click **Add Task**. Add task *"Design Checkout Wireframes"* with High Priority.

### Scene 4: Mobile App Login (2:00 – 2:45)
- **Action**: Bring up Android screen (either via screen mirroring / recording or emulator).
- **Voiceover**: *"Now, opening our Android app. As required by the specification, both platforms talk to the exact same backend with no separate mobile API."*
- **Action**: Log in on Android using `alex@example.com` and `Password123!`.
- **Action**: Show that the token is securely stored in Android Keystore via `expo-secure-store`. Land on Mobile Dashboard.

### Scene 5: Cross-Platform Sync Demonstration (2:45 – 3:30)
- **Voiceover**: *"Let's test instant synchronization between web and mobile."*
- **Action**: On Web, add a new task: *"Implement Stripe Payment"* under the project.
- **Action**: On Mobile, perform a **Pull-to-Refresh** gesture on the screen.
- **Voiceover**: *"As you can see, pulling down to refresh instantly queries our backend and the new task appears seamlessly on mobile."*

### Scene 6: Mobile Task Status Toggle (3:30 – 4:10)
- **Action**: On Mobile, tap the status circle for *"Implement Stripe Payment"* $\rightarrow$ marks it as **Completed**.
- **Action**: On Web, click refresh (or reload page) $\rightarrow$ the task reflects **Completed** with green status badge, and the progress bar updates.

### Scene 7: Error & Edge Case Handling (4:10 – 4:40)
- **Action**: Enable Airplane mode on the phone $\rightarrow$ point out the clear banner: *"⚠️ No internet connection. Please check your network."* Notice the app does not crash or show a blank screen.
- **Action**: Turn Wi-Fi back on. Demonstrate invalid password attempt on login $\rightarrow$ shows *"Invalid email or password"*, NOT a misleading *"Session expired"*.

### Scene 8: Security & Data Isolation (4:40 – 5:00)
- **Action**: In an incognito tab, log in as second user `other@example.com`. Show that their project list is completely empty $\rightarrow$ zero access to Alex's data.
- **Voiceover**: *"All database operations are strictly scoped to the authenticated user's ID, guaranteeing zero cross-tenant leakage. Thank you for watching!"*
