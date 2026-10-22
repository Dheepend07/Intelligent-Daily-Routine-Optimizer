const form = document.getElementById('taskForm');
const list = document.getElementById('taskList');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const task = document.getElementById('task').value;
    const hours = document.getElementById('hours').value;

    await fetch('http://localhost:3000/add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({task, hours})
    });

    loadTasks();
});
async function loadTasks() {
    const res = await fetch('http://localhost:3000/tasks');
    const data = await res.json();

    list.innerHTML = '';
    data.forEach(t => {
        const li = document.createElement('li');
        li.innerText = `${t.task} - ${t.hours} hrs`;
        list.appendChild(li);
    });
}

loadTasks();