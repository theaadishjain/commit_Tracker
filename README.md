# COSC GitHub Commit Counter

A visually appealing, modern web app to track live GitHub commits for any public repository, with a focus on HackWeek or similar events.

## Features

- **Live Commit Counter:** Fetches and displays the number of commits from a public GitHub repository using the GitHub REST API.
- **Time Range Toggle:** Switch between counting commits made today or during the current week.
- **Manual & Auto Refresh:** Refresh commit data every 60 seconds or manually with a button.
- **Recent Commits Modal:** View the latest commit messages, authors, timestamps, and links.
- **Auto-Reset:** Counter resets at midnight (for daily) or at the start of the week (for weekly).
- **Loading Spinner:** Shows a spinner while fetching data.
- **Local Caching:** Uses localStorage to cache the latest data for fast reloads.
- **Modern UI:** Glassmorphism/dark mode, responsive design, bold fonts, and smooth animations.

## Demo

![screenshot](screenshot.png) <!-- Add a screenshot if available -->

## Setup & Usage

1. **Clone or Download** this repository.
2. Open `index.html` in your web browser. No build step or server required.

## Customization

- **Change Repository:**
  - Open `script.js`.
  - Edit these lines at the top:
    ```js
    const GITHUB_USER = 'cbitosc';
    const GITHUB_REPO = 'HackWeek-Create-A-Pull-Request';
    ```
  - Save and reload `index.html`.

- **Change Time Range Default:**
  - The app defaults to "Today" but you can toggle to "This Week" using the UI.

## File Structure

- `index.html` – Main UI structure
- `style.css` – Styling, layout, and animations
- `script.js` – All logic: API fetch, filtering, UI updates, toggle, modal, etc.
- `README.md` – This file

## Technical Notes

- Uses only vanilla JavaScript, HTML, and CSS (no frameworks or build tools).
- Uses the public GitHub API (no token required unless you hit rate limits).
- Responsive and works on both desktop and mobile.

## License

MIT 