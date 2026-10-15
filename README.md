# Fitzy

**Eat. Train. Track.** A meal, protein and water tracker for people who lift, built around Indian home food.

Built with Ionic 6, Angular 15 and Capacitor 4 (Android).

## Features

- **Sign-in** with mobile number and a one-time code, then a short "about you" step (name, gender, age, weight, height)
- **Meals**: day strip, calorie ring, protein/carb/fat bars, 46 built-in Indian and gym foods, custom foods, copy the previous day
- **Targets**: calories from the Mifflin–St Jeor formula, activity level and goal; protein in g per kg; BMI gauge with the healthy weight range
- **Water**: goal of 35 ml per kg (+500 ml on gym days), quick-add buttons, 7-day chart
- **Progress**: weigh-ins with a 7-day average trend, weekly summary, coach notes, front/side/back progress photos
- **Profile**: photo, diet preference (filters food search), theme, data backup to the clipboard
- All data is stored on the phone

## Run it

```bash
npm install
npx ionic serve          # browser, http://localhost:8100
```

Android:

```bash
npx ionic build
npx cap sync android
npx cap open android     # opens Android Studio
```

## Not connected yet

| Feature | Where | What's needed |
|---|---|---|
| OTP by SMS | `src/app/core/auth.service.ts` | An SMS provider; any 4-digit code is accepted for now |
| Reminders | `profile.page.ts`, `water.page.ts` | `@capacitor/local-notifications` |
| Product scan | `src/app/scan/scan.page.ts` | ML Kit barcode scanning or a vision API |

New accounts start with two weeks of realistic history so every screen is filled in. Set `SEED_HISTORY = false` in `src/app/core/tracker.service.ts` to start empty.

## Project layout

```
src/app/core      data model, calculations, storage, auth
src/app/shared    calorie ring, macro bars, BMI gauge, food search sheet
src/app/<page>    splash, login, today (Meals), water, scan, progress, profile, targets
resources/        logo source and generated icon masters
```
