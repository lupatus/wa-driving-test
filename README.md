# WA Driving Test Study

Study app for the Washington State DOL knowledge test — 387 questions, a 36-card
numbers deck, mock exams, and spaced repetition. One React codebase runs on the
web, iOS and Android via Expo.

> [!WARNING]
> **Unofficial and unverified.** Not affiliated with or endorsed by the
> Washington State Department of Licensing. The study data was generated with AI
> assistance from published DOL material and **has not been reviewed by any
> authority — expect errors.** It is not legal advice or driving instruction, and
> it is no substitute for the [official Driver Guide][guide]. Use at your own
> risk; provided as-is with no warranty and no liability. See
> [DISCLAIMER.md](DISCLAIMER.md).

[guide]: https://dol.wa.gov/driver-licenses-and-permits/driver-training-and-testing/driver-guides

## Why this exists

I built this for my son while he was studying for his Washington knowledge test.
Working through the Driver Guide on its own is hard going — it's long, and
there's no good way to find out what you've actually retained.

The apps that solve this charge a lot, sometimes tens of dollars, for practice
questions drawn from a guide the state publishes free online. I didn't think
that was worth paying, so I made this instead. It's free, it works offline, and
it has no ads, no accounts and no tracking of any kind.

If it helps someone else pass, good. If you spot a wrong answer, please open an
issue — that's worth more to the next person than anything else you could
contribute.

## Running it

Toolchain is pinned with [mise](https://mise.jdx.dev) — Node 24, Temurin JDK 17
(Android Gradle), Ruby 3.3 + CocoaPods (iOS `pod install`):

```bash
mise install     # once
npm install      # once
```

Then:

| Command | What it does |
|---|---|
| `mise run web` | Browser at localhost |
| `mise run ios` | iOS simulator |
| `mise run android` | Android emulator |
| `mise run typecheck` | `tsc --noEmit` |
| `mise run build-web` | Static export to `dist/` |

`npm run start|web|ios|android` work the same if you'd rather skip mise tasks.

## What's in it

Five tabs plus a review screen:

- **Home** — coverage, accuracy, day streak, and your three weakest topics
- **Study** — the 10 topics, each with its WA Driver Guide sections; questions
  give immediate feedback with the explanation and citation
- **Test** — 40-question mock exam matching the real topic mix; pass mark is 32
  (80%). Answers stay hidden until you submit, or tick "Check answers as I go"
  to reveal them one at a time — selecting stays neutral, and nothing is graded
  until you press "Check now", which then locks that answer. Results break down
  by topic
- **Cards** — the Numbers deck, filterable by category, tap to flip
- **Progress** — per-topic accuracy, Leitner box distribution, test history, reset
- **Review** — questions you get wrong more often than right, gated by their
  spaced-repetition interval

Every answer feeds one shared store, so a mock exam moves the same counters that
Study and Review read.

## Layout

```
data/                     the datasets
  question-bank.json      387 questions — the source of truth
  flashcards.json         36 numbers cards
  topics.json             10 topics: labels, guide sections, exam quotas
src/
  app/                    expo-router routes
    (tabs)/               index, study/, test, flashcards, progress
    review.tsx            pushed over the tabs
  components/
    ui.tsx                Screen, Card, Button, ProgressBar, Pill, StatTile…
    question-card.tsx     one question with its options and explanation
    question-runner.tsx   sequential practice, shared by Study and Review
  lib/
    questions.ts          loads the bank, derives topic from the id
    exam.ts               EXAM_CONFIG, blueprint, buildExam, gradeExam
    leitner.ts            5-box scheduling
    store.tsx             AsyncStorage-backed progress, via context
```

The datasets are plain JSON imported at build time — no fetch, so everything
works offline on device.

## Data model

**Provenance:** the questions, answers and explanations in `data/` were produced
with AI assistance from the publicly published Washington State Driver Guide, and
carry a `source` citation naming the guide section each came from. They have not
been verified by the DOL or any qualified reviewer — treat them as a study aid,
not an authority, and read [DISCLAIMER.md](DISCLAIMER.md).

```jsonc
{
  "id": "licenses-001",              // "<topic>-<3-digit seq>"
  "question": "…",
  "options": ["…", "…", "…", "…"],   // always exactly 4
  "correctIndex": 0,                 // 0-based index into options
  "explanation": "…",
  "source": "WA Driver Guide §1.8, p. 25",
  "difficulty": "easy",              // easy | medium | hard
  "tags": ["permit", "age"]
}
```

Questions carry no `topic` field; it's derived from the id
(`id.replace(/-\d{3}$/, '')`, so `licenses-001` → `licenses`).

Flashcards are `{ id, front, back, category, source }`. `topics.json` holds each
topic's id, long and short labels, guide sections, question count and exam quota.

Exam rules and the Leitner intervals are not invented — they're recovered from
the original build and live in `src/lib/exam.ts` and `src/lib/leitner.ts`:
40 questions, pass at 32, topic quotas summing to 40, box intervals of
0/1/3/7/14 days.

## Deploying

**Web** — `mise run build-web` writes a static `dist/`. To put it back on the
same Cloudflare project:

```bash
npx wrangler pages deploy dist --project-name=wa-driving-test
```

That needs a token with Pages **write** access; the one used for recovery was
read-only.

**iOS / Android** — builds go through EAS (`eas.json` has development, preview
and production profiles):

```bash
npx eas-cli build --platform ios --profile preview
npx eas-cli build --platform android --profile preview
```

Local native builds work too, and are what `mise run ios` / `mise run android`
do. Both have been run against Xcode 26.6 / iOS 26.5 simulator and a `Pixel_9`
AVD. `/ios` and `/android` are generated by prebuild and gitignored — delete
them any time and they regenerate.

Bundle id / package is `com.lupatus.wadrivingtest`, set in `app.json`.

## Notes

- Progress is stored per-device under the key `wa-driving-study`. It does not
  sync, and reinstalling clears it.
- The original site's access-code gate was not carried over. It ran entirely in
  the browser, so it never actually protected anything.
- No analytics, no accounts, no network calls. The datasets are bundled at build
  time, so the app works fully offline.

## Contributing

Corrections to the question bank are the most valuable contribution — open an
issue with the question `id` (e.g. `licenses-001`) and the guide section that
contradicts it.

## License

[MIT](LICENSE) — do what you like with the code, commercially or otherwise. The
only condition is that the copyright notice and permission notice travel with
it, so a credit somewhere is appreciated and, for substantial portions, required.

The MIT grant covers **the source code**. It does not extend to the underlying
Washington State Driver Guide material the study data derives from — see
[DISCLAIMER.md](DISCLAIMER.md) before redistributing `data/`, particularly for
commercial use.
