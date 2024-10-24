// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000; // Change as needed

app.use(cors());
app.use(bodyParser.json());

// Define the path to the users.json file
const usersFilePath = path.join(__dirname, 'users.json');

// Read users from the JSON file
const readUsersFromFile = () => {
    if (fs.existsSync(usersFilePath)) {
        const data = fs.readFileSync(usersFilePath);
        return JSON.parse(data);
    }
    return [];
};

// Write users to the JSON file
const writeUsersToFile = (users) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// GET all users
app.get('/api/users', (req, res) => {
    const users = readUsersFromFile();
    res.json(users);
});

// GET user by ID
app.get('/api/users/:id', (req, res) => {
    const users = readUsersFromFile();
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// POST create a new user
app.post('/api/users', (req, res) => {
    const newUser = req.body;
    const users = readUsersFromFile();

    // Generate a new ID if the user doesn't already have one
    const newId = users.length ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;

    const userWithId = { ...newUser, id: newId }; // Ensure new user has an ID
    users.push(userWithId);

    writeUsersToFile(users);
    res.status(201).json(userWithId);
});


// PUT update an existing user
app.put('/api/users/:id', (req, res) => {
    const users = readUsersFromFile();
    const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...req.body };
        writeUsersToFile(users);
        res.json(users[userIndex]);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// DELETE a user
// DELETE a user
app.delete('/api/users/:id', (req, res) => {
    let users = readUsersFromFile();
    const userId = parseInt(req.params.id, 10); // Ensure to parse ID as an integer
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        users.splice(userIndex, 1);
        writeUsersToFile(users);
        console.log('User deleted successfully'); // Debugging log
        res.status(204).send(); // No content response
    } else {
        console.error('User not found'); // Debugging log
        res.status(404).json({ message: 'User not found' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
