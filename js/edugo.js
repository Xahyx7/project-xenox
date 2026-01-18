/* DATE */
const today = new Date();
document.getElementById('todayLabel').textContent =
  today.toDateString();

/* STOPWATCH */
let seconds = 0;
let running = false;
let interval;
let activeGoal = null;

function renderTime(sec, el) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  el.textContent = `${m}:${s}`;
}

startBtn.onclick = () => {
  if (running) return;
  running = true;
  interval = setInterval(() => {
    seconds++;
    renderTime(seconds, timer);
    renderTime(seconds, fsTimer);

    if (activeGoal) {
      activeGoal.done++;
      updateGoals();
    }

    dailyTotal++;
    updateStats();
  }, 1000);
};

pauseBtn.onclick = () => {
  running = false;
  clearInterval(interval);
};

fullscreenBtn.onclick = () => {
  fullscreen.classList.remove('hidden');
};

exitFs.onclick = () => {
  fullscreen.classList.add('hidden');
};

/* GOALS */
let goals = [];
let dailyTotal = 0;
let weeklyTotal = 0;
let overallTotal = 0;

addGoal.onclick = () => {
  const name = goalName.value;
  const target = Number(goalTime.value) * 60;
  if (!name || !target) return;

  goals.push({ name, target, done: 0 });
  goalName.value = '';
  goalTime.value = '';
  updateGoals();
};

function updateGoals() {
  goalsEl.innerHTML = '';
  goals.forEach(goal => {
    const percent = Math.min(100, (goal.done / goal.target) * 100);
    const div = document.createElement('div');
    div.className = 'goal';
    div.onclick = () => activeGoal = goal;

    div.innerHTML = `
      <div class="goal-name">
        <span>${goal.name}</span>
        <span>${Math.floor(goal.done/60)}/${Math.floor(goal.target/60)} min</span>
      </div>
      <div class="progress">
        <div class="progress-bar" style="width:${percent}%"></div>
      </div>
    `;
    goalsEl.appendChild(div);
  });
}

const goalsEl = document.getElementById('goals');

/* STATS */
function updateStats() {
  dailyTime.textContent = Math.floor(dailyTotal / 60);
  weeklyTime.textContent = Math.floor(weeklyTotal / 60);
  overallTime.textContent = Math.floor(overallTotal / 3600);
}
