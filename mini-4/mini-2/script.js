// Local Storage Keys
const TASKS_KEY = 'tasks';
const HABITS_KEY = 'habits';
const HABIT_LOGS_KEY = 'habitLogs';
const DAILY_STATS_KEY = 'dailyStats';

// Initialize Storage
function initializeStorage() {
    if (!localStorage.getItem(TASKS_KEY)) localStorage.setItem(TASKS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(HABITS_KEY)) localStorage.setItem(HABITS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(HABIT_LOGS_KEY)) localStorage.setItem(HABIT_LOGS_KEY, JSON.stringify({}));
    if (!localStorage.getItem(DAILY_STATS_KEY)) localStorage.setItem(DAILY_STATS_KEY, JSON.stringify({}));
}

// Get Today's Date
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// ============ TASK MANAGEMENT ============
function addTask(taskName, hours) {
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY));
    const task = {
        id: Date.now(),
        name: taskName,
        hours: parseFloat(hours),
        date: getTodayDate()
    };
    tasks.push(task);
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    updateDailyStats();
    renderTasks();
    updateAnalytics();
}

function deleteTask(taskId) {
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY));
    const filtered = tasks.filter(t => t.id !== taskId);
    localStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
    updateDailyStats();
    renderTasks();
    updateAnalytics();
}

function renderTasks() {
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY));
    const todayTasks = tasks.filter(t => t.date === getTodayDate());
    const taskList = document.getElementById('taskList');
    
    if (todayTasks.length === 0) {
        taskList.innerHTML = '<li style="border-left: none; justify-content: center;"><em>No tasks yet. Add one to get started!</em></li>';
        return;
    }
    
    taskList.innerHTML = todayTasks.map(task => `
        <li>
            <div>
                <strong>${task.name}</strong><br>
                <small>${task.hours} hour(s)</small>
            </div>
            <button onclick="deleteTask(${task.id})">Delete</button>
        </li>
    `).join('');
}

// ============ HABIT MANAGEMENT ============
function addHabit(habitName) {
    const habits = JSON.parse(localStorage.getItem(HABITS_KEY));
    const habit = {
        id: Date.now(),
        name: habitName,
        createdDate: getTodayDate()
    };
    habits.push(habit);
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    renderHabits();
    updateAnalytics();
}

function completeHabit(habitId) {
    const logs = JSON.parse(localStorage.getItem(HABIT_LOGS_KEY));
    const today = getTodayDate();
    
    if (!logs[habitId]) logs[habitId] = [];
    
    // Toggle completion
    const index = logs[habitId].indexOf(today);
    if (index > -1) {
        logs[habitId].splice(index, 1);
    } else {
        logs[habitId].push(today);
    }
    
    localStorage.setItem(HABIT_LOGS_KEY, JSON.stringify(logs));
    renderHabits();
    updateAnalytics();
}

function deleteHabit(habitId) {
    const habits = JSON.parse(localStorage.getItem(HABITS_KEY));
    const filtered = habits.filter(h => h.id !== habitId);
    localStorage.setItem(HABITS_KEY, JSON.stringify(filtered));
    renderHabits();
    updateAnalytics();
}

function getStreak(habitId) {
    const logs = JSON.parse(localStorage.getItem(HABIT_LOGS_KEY));
    const habitLogs = logs[habitId] || [];
    
    if (habitLogs.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    
    // Sort logs in descending order
    const sortedLogs = habitLogs.sort().reverse();
    
    for (let i = 0; i < sortedLogs.length; i++) {
        const logDate = new Date(sortedLogs[i]);
        const expectedDate = new Date(currentDate);
        expectedDate.setDate(expectedDate.getDate() - i);
        
        const logDateStr = logDate.toISOString().split('T')[0];
        const expectedDateStr = expectedDate.toISOString().split('T')[0];
        
        if (logDateStr === expectedDateStr) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

function getLastCompleted(habitId) {
    const logs = JSON.parse(localStorage.getItem(HABIT_LOGS_KEY));
    const habitLogs = logs[habitId] || [];
    
    if (habitLogs.length === 0) return 'Never';
    
    const lastDate = new Date(habitLogs[habitLogs.length - 1]);
    const today = new Date();
    const diff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff} days ago`;
}

function isCompletedToday(habitId) {
    const logs = JSON.parse(localStorage.getItem(HABIT_LOGS_KEY));
    const habitLogs = logs[habitId] || [];
    return habitLogs.includes(getTodayDate());
}

function renderHabits() {
    const habits = JSON.parse(localStorage.getItem(HABITS_KEY));
    const habitList = document.getElementById('habitList');
    
    if (habits.length === 0) {
        habitList.innerHTML = '<div style="padding: 15px; text-align: center;"><em>No habits yet. Add one to start tracking!</em></div>';
        return;
    }
    
    habitList.innerHTML = habits.map(habit => {
        const streak = getStreak(habit.id);
        const lastCompleted = getLastCompleted(habit.id);
        const completedToday = isCompletedToday(habit.id);
        
        return `
            <div class="habit-item">
                <div class="habit-header">
                    <span class="habit-name">${habit.name}</span>
                    <span class="streak">🔥 ${streak}</span>
                </div>
                <div class="last-completed">Last: ${lastCompleted}</div>
                <div class="habit-buttons">
                    <button class="complete-btn" onclick="completeHabit(${habit.id})">
                        ${completedToday ? '✓ Completed' : 'Mark Complete'}
                    </button>
                    <button class="delete-btn" onclick="deleteHabit(${habit.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// ============ ANALYTICS ============
function updateDailyStats() {
    const stats = JSON.parse(localStorage.getItem(DAILY_STATS_KEY));
    const today = getTodayDate();
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY));
    const todayTasks = tasks.filter(t => t.date === today);
    
    const totalHours = todayTasks.reduce((sum, t) => sum + t.hours, 0);
    
    if (!stats[today]) {
        stats[today] = { hours: 0, habits: 0 };
    }
    stats[today].hours = totalHours;
    
    localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(stats));
}

function getWeeklyStats() {
    const stats = JSON.parse(localStorage.getItem(DAILY_STATS_KEY));
    const today = new Date();
    const weekData = {};
    const labels = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        weekData[dateStr] = stats[dateStr]?.hours || 0;
        labels.push(dayName);
    }
    
    return { weekData, labels };
}

function getHabitCompletionRate() {
    const habits = JSON.parse(localStorage.getItem(HABITS_KEY));
    const logs = JSON.parse(localStorage.getItem(HABIT_LOGS_KEY));
    
    if (habits.length === 0) return 0;
    
    const today = new Date();
    const weekDates = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        weekDates.push(date.toISOString().split('T')[0]);
    }
    
    let totalCompletions = 0;
    habits.forEach(habit => {
        const habitLogs = logs[habit.id] || [];
        const weekCompletions = habitLogs.filter(log => weekDates.includes(log)).length;
        totalCompletions += weekCompletions;
    });
    
    const maxPossible = habits.length * 7;
    return maxPossible === 0 ? 0 : Math.round((totalCompletions / maxPossible) * 100);
}

function drawChart() {
    const canvas = document.getElementById('analyticsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { weekData, labels } = getWeeklyStats();
    const data = labels.map(label => {
        const dateIndex = new Date();
        dateIndex.setDate(dateIndex.getDate() - (6 - labels.indexOf(label)));
        const dateStr = dateIndex.toISOString().split('T')[0];
        return weekData[dateStr];
    });
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const barWidth = chartWidth / labels.length;
    const maxValue = Math.max(...data, 1);
    const scale = chartHeight / maxValue;
    
    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw bars and labels
    ctx.fillStyle = '#667eea';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#666';
    
    labels.forEach((label, i) => {
        const x = padding + i * barWidth + barWidth / 2;
        const barHeight = data[i] * scale;
        const y = canvas.height - padding - barHeight;
        
        // Draw bar
        ctx.fillStyle = '#667eea';
        ctx.fillRect(x - barWidth / 3, y, barWidth / 1.5, barHeight);
        
        // Draw label
        ctx.fillStyle = '#666';
        ctx.fillText(label, x, canvas.height - padding + 20);
        
        // Draw value on bar
        ctx.fillStyle = '#fff';
        if (data[i] > 0) {
            ctx.fillText(data[i].toFixed(1) + 'h', x, y + 15);
        }
    });
}

function updateAnalytics() {
    const { labels } = getWeeklyStats();
    const completionRate = getHabitCompletionRate();
    const habits = JSON.parse(localStorage.getItem(HABITS_KEY));
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY));
    const todayTasks = tasks.filter(t => t.date === getTodayDate());
    const totalHoursToday = todayTasks.reduce((sum, t) => sum + t.hours, 0);
    
    // Draw chart
    drawChart();
    
    // Update stats
    const statsContainer = document.getElementById('statsContainer');
    statsContainer.innerHTML = `
        <div class="stat-box">
            <div class="stat-label">Today's Hours</div>
            <div class="stat-value">${totalHoursToday.toFixed(1)}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Active Habits</div>
            <div class="stat-value">${habits.length}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Habit Completion</div>
            <div class="stat-value">${completionRate}%</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Total Tasks</div>
            <div class="stat-value">${tasks.length}</div>
        </div>
    `;
}

// ============ EVENT LISTENERS ============
document.getElementById('taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const taskName = document.getElementById('task').value;
    const hours = document.getElementById('hours').value;
    
    if (taskName && hours) {
        addTask(taskName, hours);
        document.getElementById('taskForm').reset();
    }
});

document.getElementById('habitForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const habitName = document.getElementById('habitName').value;
    
    if (habitName) {
        addHabit(habitName);
        document.getElementById('habitForm').reset();
    }
});

// ============ INITIALIZE ============
window.addEventListener('load', () => {
    initializeStorage();
    renderTasks();
    renderHabits();
    updateAnalytics();
});
