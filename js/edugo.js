/* Tabs */
document.querySelectorAll('.edugo-tabs button').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.${btn.dataset.tab}`).classList.add('active');
    document.querySelectorAll('.edugo-tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  };
});

/* Stopwatch */
let seconds = 0, running = false, interval;

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
    renderTime(seconds, timerDisplay);
    renderTime(seconds, fsTime);
  }, 1000);
};

resetBtn.onclick = () => {
  clearInterval(interval);
  running = false;
  seconds = 0;
  renderTime(0, timerDisplay);
};

fullscreenBtn.onclick = () => {
  fullscreenTimer.classList.remove('hidden');
};

exitFullscreen.onclick = () => {
  fullscreenTimer.classList.add('hidden');
};

/* Goals (daily reset-ready) */
goalInput.onkeydown = e => {
  if (e.key === 'Enter' && goalInput.value.trim()) {
    const li = document.createElement('li');
    li.textContent = goalInput.value;
    li.onclick = () => li.classList.toggle('done');
    goalList.appendChild(li);
    goalInput.value = '';
  }
};
