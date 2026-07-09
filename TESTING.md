# Manual Testing Checklist

Verified via Claude Preview browser tools on 2026-07-09.

- [x] Initial message loads with correct family context (Sarah, Crete, summer 2025)
- [x] Carousel appears with 3 homes after initial message
- [x] Carousel left/right arrows scroll smoothly
- [x] Click "View More" opens modal with image, name, location, price, amenities, rating, availability
- [x] "Show All" amenities expands the full list
- [x] Modal closes with X button, returns to chat
- [x] Click a predefined button → user message appears → typing indicator (~1.5s) → new agent message + new carousel
- [x] Second turn via free text input + Send button triggers a response (fallback "default" reasoning)
- [x] Upvote button toggles active/purple state (downvote deactivates it and vice versa)
- [x] Responsive: mobile width (375px) stacks buttons to single column, no horizontal scroll or broken layout
- [x] No errors in browser console during the full flow (only the expected Tailwind CDN dev-mode warning)
- [x] email.html renders correctly, CTA button links to `https://alexsyna.github.io/hometogo-dash/?user_id=123&trip_id=xyz`
