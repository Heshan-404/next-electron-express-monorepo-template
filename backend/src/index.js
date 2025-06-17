// backend/src/index.js

import express from 'express';
import cors from 'cors';
import {PrismaClient} from "../prisma/generated/index.js";

const app = express();
const port = process.env.PORT || 5002;

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
app.use(cors());
app.use(express.json());

app.get('/api/sample', (req, res) => {
    console.log('Received request to /api/sample');
    res.json({message: 'Hello from the Electron backend!!!', timestamp: new Date().toISOString()});
});

function bigIntJsonReplacer(key, value) {
    if (typeof value === 'bigint') {
        return value.toString(); // Convert BigInt to string
    }
    return value;
}

app.set('json replacer', bigIntJsonReplacer);

app.get('/api/users', async (req, res) => {
    console.log('Received request to /api/users');
    try {
        const users = await prisma.user.findMany({orderBy: {"email": "desc"}, take : 10});
        console.log("Fetched users successfully. Count:", users.length);
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({error: "Failed to fetch users from the database."});
    }
});

app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
});

process.stdin.resume();