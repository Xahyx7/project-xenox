class EduGo {
    constructor() {
        this.timeLeft = 25 * 60; // 25 minutes
        this.isRunning = false;
        this.isPaused = false;
        this.isBreak = false;
        this.goals = [];
        this.todayStats = {
            time: 0,
            goalsDone: 0,
            totalGoals: 0
        };
        this.streak = 7;
        this.init();
    }

    init() {
        this.loadData();
        this.updateDisplay();
        this.setupEventListeners();
        this.renderGoals();
        this.updateStats();
        console.log('🎓 EduGo Ready!');
    }

    loadData() {
        const savedGoals = localStorage.getItem('edugo_goals');
        const savedStats = localStorage.getItem('edugo_stats');
        const savedStreak = localStorage.getItem('edugo_streak');
        
        if (savedGoals) this.goals = JSON.parse(savedGoals);
        if (savedStats) this.todayStats = JSON.parse(savedStats);
        if (savedStreak) this.streak = parseInt(savedStreak);
        
        document.getElementById('streakCount').textContent = this.streak;
        this.updateStats();
    }

    saveData() {
        localStorage.setItem('edugo_goals', JSON.stringify(this.goals));
        localStorage.setItem('edugo_stats', JSON.stringify(this.todayStats));
        localStorage.setItem('edugo_streak', this.streak.toString());
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startTimer());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseTimer());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopTimer());
        document.getElementById('modeBtn').addEventListener('click', () => this.switchMode());
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('timerDisplay').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('sessionType').textContent = this.isBreak ? 'BREAK TIME' : 'WORK SESSION';
        
        const progress = ((25 * 60 - this.timeLeft) / (25 * 60)) * 880;
        document.getElementById('progressFill').style.strokeDashoffset = 880 - progress;
    }

    startTimer() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'inline-flex';
        
        this.timer = setInterval(() => {
            if (this.timeLeft <= 0) {
                this.timerComplete();
                return;
            }
            this.timeLeft--;
            this.updateDisplay();
        }, 1000);
    }

    pauseTimer() {
        if (!this.isRunning) return;
        
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            clearInterval(this.timer);
            document.getElementById('pauseBtn').textContent = '▶ RESUME';
        } else {
            this.startTimer();
            document.getElementById('pauseBtn').textContent = '⏸ PAUSE';
        }
    }

    stopTimer() {
        clearInterval(this.timer);
        this.isRunning = false;
        this.isPaused = false;
        this.timeLeft = 25 * 60;
        document.getElementById('startBtn').style.display = 'inline-flex';
        document.getElementById('pauseBtn').style.display = 'none';
        this.updateDisplay();
    }

    switchMode() {
        this.stopTimer();
        if (this.isBreak) {
            this.timeLeft = 25 * 60;
            this.isBreak = false;
        } else {
            this.timeLeft = 5 * 60;
            this.isBreak = true;
        }
        document.getElementById('modeBtn').textContent = this.isBreak ? '25/5' : '5/25';
        this.updateDisplay();
    }

    timerComplete() {
        clearInterval(this.timer);
        this.isRunning = false;
        
        // Update stats
        this.todayStats.time += 25 * 60;
        this.updateStats();
        this.saveData();
        
        // Switch to break
        this.isBreak = !this.isBreak;
        this.timeLeft = this.isBreak ? 5 * 60 : 25 * 60;
        
        document.getElementById('startBtn').style.display = 'inline-flex';
        document.getElementById('pauseBtn').style.display = 'none';
        document.getElementById('modeBtn').textContent = this.isBreak ? '25/5' : '5/25';
        
        this.updateDisplay();
        this.notifyComplete();
    }

    notifyComplete() {
        // Visual feedback
        document.body.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => document.body.style.animation = '', 500);
    }

    updateStats() {
        const hours = Math.floor(this.todayStats.time / 3600);
        const minutes = Math.floor((this.todayStats.time % 3600) / 60);
        document.getElementById('todayTime').textContent = 
            `${hours}h ${minutes}m`;
        document.getElementById('goalsDone').textContent = 
            `${this.todayStats.goalsDone}/${this.todayStats.totalGoals}`;
        document.getElementById('focusScore').textContent = '92%';
    }

    renderGoals() {
        const container = document.getElementById('goalsList');
        container.innerHTML = this.goals.map(goal => `
            <div class="goal-item">
                <div class="goal-info">
                    <span class="goal-progress">${goal.progress}%</span>
                    <div>
                        <div class="goal-subject">${goal.subject}</div>
                        <div class="goal-time">${goal.time} min</div>
                    </div>
                </div>
                <span style="color: ${goal.progress === 100 ? '#00ff88' : '#ff6b6b'}">
                    ${goal.progress === 100 ? '✓' : '⏳'}
                </span>
            </div>
        `).join('') || '<div style="text-align:center;color:rgba(255,255,255,0.4);">No goals set</div>';
    }
}

// Global Functions
function showGoalModal() {
    document.getElementById('goalModal').classList.add('show');
}

function hideGoalModal() {
    document.getElementById('goalModal').classList.remove('show');
}

function addGoal() {
    const subject = document.getElementById('goalSubject').value;
    const time = parseInt(document.getElementById('goalTime').value);
    
    if (time >= 15 && time <= 360) {
        edugo.goals.push({
            subject,
            time,
            progress: 0,
            setDate: new Date().toDateString()
        });
        edugo.todayStats.totalGoals++;
        edugo.saveData();
        edugo.renderGoals();
        hideGoalModal();
    }
}

// Initialize
let edugo;
document.addEventListener('DOMContentLoaded', () => {
    edugo = new EduGo();
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
`;
document.head.appendChild(style);
