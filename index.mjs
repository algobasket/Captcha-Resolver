import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { spawnSync } from 'child_process'; // Import spawnSync

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to handle the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle the button click event
app.post('/runScript', (req, res) => {
    // Execute your script logic here
    const { stdout, stderr, status } = spawnSync('node', ['./script.mjs'], { encoding: 'utf-8' });

    if (status === 0) {
        const output = stdout.trim();
        res.send(`Script is running...<br>Output: ${output}`);
    } else {
        res.status(500).send(`Script encountered an error: ${stderr}`);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 




