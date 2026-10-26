# Etsuko — Capacitor and Android WebView Engineering Rules

## Project constraints

- Etsuko uses vanilla JavaScript, HTML5, CSS3, Capacitor 8, Android WebView, and a PWA service worker.
- Preserve the existing architecture. Do not migrate to React, Flutter, React Native, or another framework unless explicitly requested.
- Inspect the existing package.json, capacitor.config.*, Android configuration, plugin versions, and source files before making implementation decisions.
- Use APIs supported by the project's installed Capacitor version. Verify unfamiliar APIs against official documentation.

## Android WebView compatibility

- Treat the Android WebView as the primary native-app runtime and ordinary browsers as a separate execution environment.
- Do not assume every browser API, autoplay behavior, media permission, or background capability behaves identically on Android.
- Handle keyboard visibility, safe areas, orientation, app suspension, foreground restoration, network changes, and Android back navigation appropriately.
- Use Capacitor plugins when native functionality is required. Do not introduce plugins if the existing web APIs already solve the problem reliably.
- Preserve the current application ID, signing setup, permissions, and native configuration unless a requested change requires modification.

## Music playback and artwork

- Preserve audio playback state when navigating between screens or when UI components update.
- Keep track IDs, metadata, artwork URLs, queue state, and playback state associated with the correct song.
- Prevent outdated asynchronous image or metadata requests from overwriting the currently selected track.
- Use consistent image dimensions, appropriate aspect ratios, graceful fallbacks, and efficient image caching.
- Do not route entire audio streams through a JSON request handler or buffer entire audio files unnecessarily.
- Test seeking, track changes, playback errors, repeated play/pause actions, and network interruptions.
- Do not assume Android background playback or lock-screen controls work without checking the existing implementation and native capabilities.

## Networking and APIs

- Inspect the actual API response, URL format, permissions, caching behavior, and error handling before modifying networking code.
- Use CapacitorHttp only where appropriate and supported by the installed configuration. Do not assume it automatically fixes every CORS, streaming, or authorization problem.
- Avoid duplicate requests, stale responses, unsafe retries, and unnecessary downloads.
- Handle timeouts, offline conditions, HTTP errors, invalid JSON, and missing metadata.
- Never expose private API keys, tokens, or server secrets in frontend JavaScript.

## Home-page refresh and caching

- Investigate application state, API caching, artwork caching, and service-worker caching separately.
- Refresh relevant home content on startup, foreground restoration, and explicit pull-to-refresh.
- Handle local calendar-day changes for daily content without relying solely on a fixed 24-hour timer.
- Update the UI after successful data changes and invalidate only the cache entries that need refreshing.
- Preserve usable cached content when offline where appropriate.
- Version service-worker caches and verify update behavior without unexpectedly discarding working offline content or trapping users on stale assets.
- Do not assume native Android APK updates are delivered by a PWA service worker.

## Capacitor lifecycle and plugins

- Inspect the installed plugins and their documentation before adding lifecycle listeners or native features.
- Register listeners carefully and remove obsolete listeners when appropriate.
- Verify listener behavior when the app backgrounds, resumes, loses connectivity, or changes accounts.
- Do not add duplicate listeners each time a screen mounts.
- Check plugin permissions, native Android configuration, and Gradle compatibility after relevant changes.
- Synchronize Capacitor configuration with Android only when appropriate; inspect generated native changes before overwriting or removing anything.

## Security and reliability

- Validate external data before rendering or using it.
- Avoid unsafe HTML injection, insecure URL handling, and storing sensitive credentials in local storage.
- Preserve user data and existing working functionality.
- Never hide errors simply to make the interface appear functional.
- Make small, reversible changes and explain significant architectural changes before implementing them.

## Required verification

- Run the repository's available lint, test, and build commands.
- Verify the actual installed scripts instead of assuming commands exist.
- When applicable, validate the web build, run Capacitor synchronization, and build the Android project using its existing Gradle setup.
- Test in an Android WebView or emulator when available, not only in a desktop browser.
- Check artwork rendering, music playback, app resume, pull-to-refresh, offline behavior, navigation, and service-worker updates after related modifications.
- Never claim tests passed or functionality works unless the corresponding checks were performed.

For each task, report the root cause, files changed, checks actually executed, results, and remaining blockers.
