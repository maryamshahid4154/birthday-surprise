# Birthday Website — HTML / CSS / Vanilla JS

A cinematic dark-navy, gold-and-blue birthday experience recreated from the reference video.
No frameworks, no build step, no backend.

## Run it
Open `index.html` directly, or serve the folder (recommended):

```bash
cd birthday-website
python3 -m http.server 8000      # then open http://localhost:8000
```

## Page flow (matches the video order)
0. **Incoming call screen** — "Birthday 🎂 is calling…" covers the site until answered (slide / tap / Enter)
1. Cinematic intro (click / any key to skip, auto-ends in ~2.4 s)
2. Hero — "Happy Birthday / My Brother", typewriter line, **Open your surprise** (opens the "Dil Se Dua" letter dialog)
3. Blue marquee band
4. Letter — "My only wish" message
5. **Cherished Moments** — tilted, auto-scrolling photo rows (hover pauses, click opens the viewer)
6. **Brotherhood Milestones** coverflow deck with 3 photos: `milestone-01.jpg` (collage), `milestone-02.jpg` (family), `milestone-03.jpg` (burger) — drag, arrows, dots, ← → keys
7. Kinetic wavy text ("From day one… Brotherhood Beyond Words…")
8. **Why You Are My Ultimate Legend** cards
9. **Milestones** counters (362+, 993+, ∞, 1)
10. **Burger** — "A Lil Treat From Your Little Sister 🍔" with the label **Tap to eat**: tap anywhere on the burger and a bite is taken right there (crumbs fly) with a **bite/crunch sound** (generated in the browser, no file needed). When the burger is finished (confetti) **no new burger appears — "Happy Birthday 🎂" is shown instead**. Enter/Space also takes a bite.
11. Double banner → Final "Happy Birthday, My Legend Brother!" (**Launch grand celebration** = fireworks/confetti)
12. **Video section (last)** — **Download video** button above a video player. Put your file at `assets/video/birthday-video.mp4` (see "Video" below).

## Customize (HTML only — no JS edits needed)
| What | Where in `index.html` |
|---|---|
| Name under "Happy Birthday" | `<span id="heroName">My Brother</span>` |
| Typewriter lines | `data-lines="line 1\|line 2\|line 3"` on `#typewriter` |
| Birthday message | `<p id="birthdayMessage">` in the `#letter` section |
| Letter popup text | `<dialog id="letterModal">` |
| Final title / script line | `#finalTitle`, `.final__script` |
| Stats numbers | `data-count` + label in `#stats` |

## Replace photographs
All photos live in `assets/images/`. **Overwrite files, keeping the same names:**

| File | Used in |
|---|---|
| `memory-01.jpg` | Gallery, coverflow card 1 |
| `memory-02.jpg` | Gallery, coverflow card 2 |
| `memory-03.jpg` | Gallery, coverflow card 3 |
| `memory-04.jpg` | Gallery, coverflow card 5 |
| `memory-05.jpg` | Gallery |
| `memory-06.jpg` | Gallery, coverflow card 4 |

Landscape ~1200×900 works best (the coverflow crops to portrait with `object-fit: cover`).
Update the `alt` text and the `data-title` / caption beside each image in `index.html`.

## Notes
- `memory-01.jpg` is a low-resolution frame cropped from your reference video — replace it with the original file for sharp results.
- `memory-02` to `memory-06` are clearly labeled generated placeholders, **not** the photos from the video (they can't be recovered from the video at usable quality).
- Fonts load from Google Fonts (Playfair Display, Great Vibes, Cormorant Garamond, Montserrat, Open Sans). If offline, system serif/sans fonts are used and the site stays fully usable.
- `prefers-reduced-motion` disables floaters, marquees, wave text and long animations. Without JavaScript all content stays visible.
- No audio, camera, microphone or other permissions are used.

## Incoming call screen
Shown first on every page load (refresh = it rings again). Slide the green button, or tap/click it, or press Enter/Space/→.
After answering: a short simulated "connected" screen (timer + controls), then the site opens at the hero.

| What | Where |
|---|---|
| Month title ("October") | `<p class="call__month">` in `#call` |
| Message preview text | `<p id="callBubble">` |
| Colors / timing | CSS custom properties on `.call` (`--call-bg`, `--call-green`, `--call-t`…) |
| Remove the feature | delete `#call` in `index.html`, section 13 of `style.css`, `initCall()` in `script.js`, and change the last boot line to `initIntro(() => { initReveal(); initTypewriter(); });` |

Everything is simulated: no real call and no microphone/camera/contacts/notification permissions.
On the connected screen, using any control (mute, speaker, keypad…) pauses the auto-open and shows **Open the surprise →**.
The red button ends the *simulated* call and returns to the ringing screen; the website is never affected.

## Audio
Two local mp3 files, each played by a single persistent audio player (they never overlap):

| File | Where it plays | Status |
|---|---|---|
| `assets/audio/incoming-ringtone.mp3` | call screen, loops until answered | included (original ringtone made for this project, royalty-free) |
| `assets/audio/birthday-song.mp3` | website, loops after answering | **you must add this file** |

- **You supply the birthday song.** Put your legally obtained copy of "Baar Baar Din Ye Aaye" (Mohammed Rafi) at `assets/audio/birthday-song.mp3`. It is not included, because the recording is copyrighted and cannot be bundled here.
- Until that file exists, the website shows a small note ("Add assets/audio/birthday-song.mp3 to play music") instead of the music buttons. Nothing else breaks.
- Browsers block autoplay: the ringtone starts on the visitor's first tap/key press (hint: "Tap anywhere for ringtone"). If the song is blocked too, a gold **Tap to play music** button appears.
- Website controls (bottom-right): **play/pause** (resumes where it paused, never restarts) and **mute/unmute**. The call screen has its own ringtone mute button (top-left).
- Paths are set on `<body data-ringtone-src="..." data-music-src="...">` in `index.html` (relative paths, so they work locally and when deployed in a folder).
- To change the ringtone, just replace `incoming-ringtone.mp3` with your own mp3 of the same name.

## Video
Put your video at `assets/video/birthday-video.mp4` (mp4 works everywhere). It appears in the last section with a **Download video** button above it.
- Different file name? Change `src` in `<source>` inside `#video` in `index.html` (the Download button follows it automatically; also update `href`/`download` there if you want no-JS to work).
- Until the file exists the section shows "Video coming soon…" and the Download button is greyed out.
- While the video plays, the birthday song pauses and resumes afterwards.
