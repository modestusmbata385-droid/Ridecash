RideCash v3 (complete)
A cash ride-hailing platform with three apps sharing one backend:
Passenger app (Expo/React Native) — request a ride, track status, cancel, report safety issues
Driver app (Expo/React Native, same codebase) — go online, see incoming requests, accept/start/complete trips, submit KYC, settle commission debt
Admin dashboard (Vite/React, web) — approve/reject KYC, suspend/reactivate drivers, monitor rides, review safety reports, approve commission settlements
What changed in this pass
Compared to the previous drop, the following gaps are now closed:
OTP — POST /api/otp/request and POST /api/otp/verify are live (schema's Otp model was previously unused). In dev, the code is logged to the server console and returned as devCode since no SMS provider is wired up yet.
KYC — drivers submit documents (POST /api/kyc/documents), admin lists/approves/rejects them (/api/admin/kyc...), approving flips Driver.kycStatus to APPROVED automatically. Wired into both the driver app and the admin dashboard.
Safety reports — POST /api/safety/reports (passenger or driver, tied to a ride), listed for admin at /api/admin/safety-reports. Wired into both mobile screens.
Commission settlement — driver submits a payment claim (POST /api/commission/payments), admin approves/rejects (/api/admin/commission-payments/...); approving decrements the driver's debt.
Admin dashboard was a static placeholder before — it's now a full app: login (ADMIN-role account), Overview stats, Drivers table with suspend/reactivate, KYC review queue, Rides table, Safety reports, Commission settlement queue.
Ride lifecycle bug fix — accept/complete previously looked up the driver by the wrong ID field, so a driver could never actually accept a ride. Fixed, and a missing start step was added (ACCEPTED → STARTED → COMPLETED), plus GET /api/rides/available (driver's incoming-requests list), GET /api/rides/mine, GET /api/rides/:id, and POST /api/rides/:id/cancel.
Prisma schema bug fix — User declared two ambiguous back-relations to Ride and Driver had no back-relation to Ride at all; either would have made prisma migrate fail outright. Fixed.
Mobile app had no registration screen — AuthScreen now supports both login and register (with passenger/driver role choice).
Admin dashboard had no real index.html/vite.config.js — added, so npm run dev / npm run build work.
Stack
Mobile: Expo React Native + TypeScript
API: Node.js + Express + TypeScript
DB: PostgreSQL + Prisma
Realtime: Socket.IO (ride-location channel is wired server-side; mobile currently uses polling for status/requests for reliability — swap in mobile/src/services/socket.ts if you want push-based updates instead)
Admin: Vite + React
Run the backend
cd backend
copy .env.example to .env
docker compose up -d db (from project root)
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed — creates:
Passenger: 255700000001 / Password123!
Driver: 255700000002 / Password123! (KYC pending — approve it in the admin dashboard before it can go online)
Admin: 255700000000 / Password123!
npm run dev
Run the mobile app
cd mobile
npm install
copy .env.example to .env, set EXPO_PUBLIC_API_URL to your computer's LAN IP (e.g. http://192.168.1.10:4000/api)
npx expo start
Run the admin dashboard
cd admin
npm install
copy .env.example to .env, set VITE_API_URL if your backend isn't on localhost:4000
npm run dev → open the printed local URL, log in with the admin account above
Typical end-to-end test
Log into admin, check KYC tab — approve the seeded driver's KYC (submit one first from the driver app, or approve manually in the DB if testing the dashboard alone).
Driver app: register/login as the driver, submit a KYC document, go online.
Passenger app: register/login as a passenger, request a ride.
Driver app: pull to refresh (or wait ~6s), see the request under "Incoming ride requests", accept it, start it, complete it.
Passenger app: watch the ride status update; after completion the driver owes 12% commission.
Driver app: submit a commission settlement; approve it from the admin Commission tab.
Still not production-ready
This is a working MVP, not a production system. Before real users/money touch it, you still need: a real SMS provider for OTP, real document storage (S3/Cloudinary) with signed uploads for KYC images, HTTPS + secrets manager for env vars, push notifications, rate limiting tuned for real traffic, and a legal/compliance review for ride-hailing regulations in your market.
