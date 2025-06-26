// === CONFIG ===
const GITHUB_USER = 'cbitosc';
const GITHUB_REPO = 'HackWeek-Create-A-Pull-Request';
const COMMITS_API = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/commits`;
const REFRESH_INTERVAL = 60 * 1000; // 60 seconds
const RECENT_COMMITS_COUNT = 10;

// === DOM ELEMENTS ===
const counterEl = document.getElementById('counter');
const userEl = document.getElementById('github-user');
const repoEl = document.getElementById('github-repo');
const lastUpdateEl = document.getElementById('last-update');
const refreshBtn = document.getElementById('refresh');
const detailsBtn = document.getElementById('details');
const resetViewBtn = document.getElementById('reset-view');
const spinner = document.getElementById('spinner');
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('close-modal');
const commitList = document.getElementById('commit-list');
const toggleTodayBtn = document.getElementById('toggle-today');
const toggleWeekBtn = document.getElementById('toggle-week');

// === STATE ===
let commitData = {
  count: 0,
  lastUpdate: null,
  recent: [],
  since: null, // ISO string for current filter
};
let autoRefreshTimer = null;
let lastDay = new Date().getDate();
let currentFilter = 'today';

// === UTILS ===
function formatDate(date) {
  return date.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}
function getTodayISO() {
  const now = new Date();
  now.setHours(0,0,0,0);
  return now.toISOString();
}
function getWeekISO() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  const monday = new Date(now.setDate(diff));
  monday.setHours(0,0,0,0);
  return monday.toISOString();
}
function showSpinner(show) {
  spinner.style.display = show ? 'block' : 'none';
}
function animateCounter() {
  counterEl.classList.remove('pop');
  void counterEl.offsetWidth;
  counterEl.classList.add('pop');
}

// === LOCAL STORAGE ===
function saveCache() {
  localStorage.setItem('commitCounterCache', JSON.stringify(commitData));
}
function loadCache() {
  const cache = localStorage.getItem('commitCounterCache');
  if (cache) {
    try {
      commitData = JSON.parse(cache);
      updateUI();
    } catch {}
  }
}

// === FETCH COMMITS ===
async function fetchCommits(sinceISO) {
  showSpinner(true);
  let page = 1;
  let allCommits = [];
  let keepGoing = true;
  while (keepGoing) {
    const url = `${COMMITS_API}?since=${encodeURIComponent(sinceISO)}&per_page=100&page=${page}`;
    const resp = await fetch(url);
    if (!resp.ok) break;
    const commits = await resp.json();
    allCommits = allCommits.concat(commits);
    if (commits.length < 100) keepGoing = false;
    else page++;
  }
  showSpinner(false);
  return allCommits;
}

// === UPDATE UI ===
function updateUI() {
  counterEl.textContent = commitData.count;
  animateCounter();
  lastUpdateEl.textContent = commitData.lastUpdate ? `Last update: ${formatDate(new Date(commitData.lastUpdate))}` : 'Last update: --';
  userEl.textContent = GITHUB_USER;
  repoEl.textContent = GITHUB_REPO;
}

// === MAIN LOGIC ===
async function updateCommitCount(filter) {
  let sinceISO = filter === 'today' ? getTodayISO() : getWeekISO();
  commitData.since = sinceISO;
  const commits = await fetchCommits(sinceISO);
  commitData.count = commits.length;
  commitData.lastUpdate = new Date().toISOString();
  commitData.recent = commits.slice(0, RECENT_COMMITS_COUNT).map(c => ({
    message: c.commit.message,
    author: c.commit.author.name,
    date: c.commit.author.date,
    url: c.html_url
  }));
  saveCache();
  updateUI();
}

// === MODAL ===
function showModal() {
  commitList.innerHTML = '';
  if (!commitData.recent.length) {
    commitList.innerHTML = '<li>No recent commits found.</li>';
  } else {
    commitData.recent.forEach(c => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${c.author}</strong> <span style="color:#7ee787;">${formatDate(new Date(c.date))}</span><br><span style="color:#a0c4ff;">${c.message.replace(/</g,'&lt;')}</span> <a href="${c.url}" target="_blank" style="color:#fee140;">🔗</a>`;
      commitList.appendChild(li);
    });
  }
  modal.style.display = 'flex';
}
function hideModal() {
  modal.style.display = 'none';
}

// === AUTO-RESET AT MIDNIGHT ===
function setupAutoReset(filter) {
  setInterval(() => {
    const now = new Date();
    if (filter === 'today' && now.getDate() !== lastDay) {
      lastDay = now.getDate();
      commitData.count = 0;
      commitData.recent = [];
      commitData.lastUpdate = null;
      saveCache();
      updateUI();
      updateCommitCount('today');
    }
    if (filter === 'week' && now.getDay() === 1 && now.getHours() === 0 && now.getMinutes() < 1) {
      // Monday 00:00, reset for week
      commitData.count = 0;
      commitData.recent = [];
      commitData.lastUpdate = null;
      saveCache();
      updateUI();
      updateCommitCount('week');
    }
  }, 30 * 1000); // check every 30s
}

// === TOGGLE ===
function setToggle(filter) {
  currentFilter = filter;
  if (filter === 'today') {
    toggleTodayBtn.classList.add('active');
    toggleWeekBtn.classList.remove('active');
  } else {
    toggleTodayBtn.classList.remove('active');
    toggleWeekBtn.classList.add('active');
  }
}

toggleTodayBtn.addEventListener('click', () => {
  if (currentFilter !== 'today') {
    setToggle('today');
    updateCommitCount('today');
    if (autoRefreshTimer) clearInterval(autoRefreshTimer);
    autoRefreshTimer = setInterval(() => updateCommitCount('today'), REFRESH_INTERVAL);
    setupAutoReset('today');
  }
});

toggleWeekBtn.addEventListener('click', () => {
  if (currentFilter !== 'week') {
    setToggle('week');
    updateCommitCount('week');
    if (autoRefreshTimer) clearInterval(autoRefreshTimer);
    autoRefreshTimer = setInterval(() => updateCommitCount('week'), REFRESH_INTERVAL);
    setupAutoReset('week');
  }
});

// === EVENT HANDLERS ===
refreshBtn.addEventListener('click', () => updateCommitCount(currentFilter));
detailsBtn.addEventListener('click', showModal);
closeModalBtn.addEventListener('click', hideModal);
window.addEventListener('click', e => { if (e.target === modal) hideModal(); });
resetViewBtn.addEventListener('click', () => {
  commitData.count = 0;
  commitData.recent = [];
  commitData.lastUpdate = null;
  saveCache();
  updateUI();
});

// === INIT ===
function startApp() {
  userEl.textContent = GITHUB_USER;
  repoEl.textContent = GITHUB_REPO;
  loadCache();
  setToggle('today');
  updateCommitCount('today');
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
  autoRefreshTimer = setInterval(() => updateCommitCount('today'), REFRESH_INTERVAL);
  setupAutoReset('today');
}

// === ANIMATION FOR COUNTER ===
const style = document.createElement('style');
style.textContent = `
  .pop { animation: pop 0.25s; }
  @keyframes pop { 0% { transform: scale(1); } 40% { transform: scale(1.18); } 100% { transform: scale(1); } }
`;
document.head.appendChild(style);

startApp(); 