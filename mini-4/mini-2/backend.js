const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'routine_db'
});

app.post('/add', (req, res) => {
    const {task, hours} = req.body;
    db.query('INSERT INTO tasks (task, hours) VALUES (?, ?)', [task, hours]);
    res.send('Added');
});
app.get('/tasks', (req, res) => {
    db.query('SELECT * FROM tasks', (err, result) => {
        res.json(result);
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));