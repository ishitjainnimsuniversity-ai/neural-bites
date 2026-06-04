You're asking for a lot at once — let me lock the scope before I build, because some of it (a real human female teacher on screen, full-body live health streaming with real anatomy, accredited bachelor/master degrees with legally valid certificates) cannot be built literally in a web app. I'll explain what's realistically possible and how I'll deliver the *feeling* of each request.

## What I'll build now

### 1. Fix the mic (Voice Assistant)
- Verify the permission banner + retry flow works.
- Add an explicit "Allow microphone" CTA before first use, clearer error copy.

### 2. AI Mirror — major upgrade ("Train with live AI coach")
- **User profile gate**: Before training, collect Name, Age, Sex, Weight, Height, Photo upload, Goal (lose fat / gain muscle / endurance / flexibility / rehab / general fitness), Goal intensity (rapid / moderate / slow), Target fat loss (kg), Daily fast/eating window.
- Save profile to localStorage so name + photo show in the live stream HUD instead of dummy data.
- **Live HUD overlay** on the webcam: user's photo, name, age, real-time heart-zone estimate (from movement intensity), calories, reps, session time, body-region activity bar (upper / core / lower) derived from motion detection on the video frame.
- **Movement tracking**: lightweight motion-energy tracker per region of the frame (no extra ML deps) so reps and active body areas update from actual movement, not a fixed timer.
- **"Female AI coach" presence**: render a generated female coach avatar (looping subtle idle animation, lip-flash while speaking) next to the camera feed. I'll be upfront: this is an AI-rendered avatar, not a real human teacher streaming in — real human trainers require a separate live-streaming service and hiring real coaches.
- **Goal-based program library**: replace "fat loss only" drills with categories — Fat loss, Muscle build, Endurance, Flexibility/Yoga, Rehab/Mobility, Senior-friendly, Kids/Teens — each filtered by age group (under-18, 18-39, 40-59, 60+).
- **Auto-generated plan + diet chart** from profile (using Mifflin-St Jeor + goal intensity) — workout split per week and a 7-day diet chart (kcal target, protein/carb/fat grams, sample meals).

### 3. NeuralBites Academy (new section)
A free in-app learning hub with three tracks shown side-by-side in columns:

| Column | Crash Course (2h) | Bachelor (BSc) track | Master (MSc) track |
|---|---|---|---|
| Length | 2 hours, 10 modules | Multi-month, video-based | Multi-month, video-based |
| Content | Your 10-module syllabus (Anatomy → Career roadmap) | MIU Yoga & Ayurveda style + ASU Health Sciences style | VaYU MS Yoga, Creighton Integrative Health, Bastyr Exercise Science styles |
| Price | Free | Free | Free |

For each course:
- Registration form (name, email, age, ID photo) stored in backend.
- Module list with **full-length embedded video lessons** — I'll wire the player and seed it with curated public YouTube lecture playlists for each topic (anatomy, FITT, pranayama, nutrition, etc.). I cannot host original 1000-hour video myself; the player + progress tracking + module structure is real, the video sources are curated public lectures.
- **Progress + anti-skip enforcement**: video must play to ≥95% before next module unlocks; skipping forward is blocked; if a user abandons a course for >X days, credits reset to 0 (per your "no shortcut" rule).
- **Exams**: weekly quiz, periodic (monthly) exam, yearly final. Negative marking (-0.25 per wrong). Auto-graded. Pass threshold per exam.
- **Certificate generation** on full completion: PDF with user name, course, date, dual signatures **Ishit Jain (CEO, NeuralBites)** and **Shreya Thakur (CEO, NeuralBites)**, and a serial number stored in DB so a `/verify/:serial` page can confirm authenticity.

## Honest limits I need you to accept before I build

1. **Real human female teacher live on screen** — not possible without hiring actual trainers and running a video-conference platform (Zoom/LiveKit/Agora). I'll ship a **generated female AI coach avatar** with voice. If you want real humans later, that's a separate business + integration.
2. **"World's first healthcare"-grade body scanning / full anatomy from webcam** — true medical-grade vitals from a webcam aren't real. I'll ship **estimated** metrics (movement intensity → heart-zone estimate, calories from MET tables) clearly labeled as estimates, plus a body-region activity overlay from motion detection. No fake "live ECG / live blood pressure".
3. **Legally accredited Bachelor/Master degrees** — Lovable cannot issue real BSc/MSc degrees from MIU, ASU, VaYU, Creighton, Bastyr. Those are real universities; I can't impersonate them. What I *can* ship: a **NeuralBites Academy certificate** (clearly a NeuralBites credential, not a university degree) signed by Ishit Jain and Shreya Thakur, with verifiable serial numbers. The course *content* will mirror the syllabus you listed.
4. **Full-length original video** for every module — I'll embed curated public lectures (YouTube) per topic and track progress against them. Producing original 1000-hour video isn't something an app build can do.

## Technical plan

- DB tables: `profiles` (user fitness profile + photo url), `courses`, `modules` (with `video_url`, `duration_sec`, `order`), `enrollments` (user_id, course_id, started_at, last_active_at), `module_progress` (watched_seconds, completed), `exams`, `exam_attempts` (score, negative_marks), `certificates` (serial, user_id, course_id, issued_at).
- Storage bucket `user-photos` for profile pictures.
- Edge functions: `enroll-course`, `submit-exam`, `issue-certificate` (generates PDF server-side), `verify-certificate`.
- Frontend: new `/academy`, `/academy/:courseId`, `/academy/:courseId/module/:moduleId`, `/verify/:serial` routes. Profile gate component reused across AI Mirror + Academy.
- AI Mirror: motion-energy tracker via canvas pixel diff; generated female coach avatar image (premium imagegen) with CSS speaking animation; existing `ai-coach` edge function expanded to take profile + goal + age group.
- Anti-skip: `<video>` `onseeking` blocked beyond `maxWatched`; `requestVideoFrameCallback` to update watched seconds; unlock next module when `watched_seconds / duration >= 0.95`.

## Build order (so you see progress fast)

1. Profile gate + localStorage profile + photo upload → AI Mirror HUD with real name/photo/age + motion-based reps and body-region activity.
2. Female AI coach avatar + expanded goal/age-group drill library + auto diet chart.
3. Voice Assistant mic polish.
4. Academy: DB schema + course/module/enrollment/progress + Crash Course seeded with your 10 modules + UI with the three-column track view.
5. Exam engine (weekly/periodic/yearly, negative marking) + anti-skip video.
6. Certificate generation + verification page.

This is large — expect it across several turns. Reply **"approve"** to start with step 1, or tell me which limit you'd like to revisit first.
