const pattern = `
//**************************************************************************************
//**************************************************************************************
//**************************************************************************************
//**************************************************************************************
//************░█▀▀▄░▒█░░░░▒█▀▀█░▒█▀▀▀█░▒█▀▀▄░█▀▀▄░▒█▀▀▀█░▒█░▄▀░▒█▀▀▀░▀▀█▀▀**************
//************▒█▄▄█░▒█░░░░▒█░▄▄░▒█░░▒█░▒█▀▀▄▒█▄▄█░░▀▀▀▄▄░▒█▀▄░░▒█▀▀▀░░▒█░░**************
//************▒█░▒█░▒█▄▄█░▒█▄▄▀░▒█▄▄▄█░▒█▄▄█▒█░▒█░▒█▄▄▄█░▒█░▒█░▒█▄▄▄░░▒█░░**************
//**************************************************************************************
//************************** ▀▄▀▄▀▄GitHub - algobasket▄▀▄▀▄▀ ***************************
//**************************************************************************************
//**************************************************************************************
//**************************************************************************************
`;
console.log(pattern);
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

// Function to execute a command and handle errors
const executeCommand = (command, callback) => {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            callback(error.message);
            return;
        }
        if (stderr) {
            callback(stderr);
            return;
        }
        callback(null, stdout.trim());
    });
};

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check if Node.js is installed and has the correct version
executeCommand('node --version', (error, nodeVersion) => {
    if (error) {
        console.error('Node.js is not installed.');
        return;
    }

    if (nodeVersion !== 'v18.10.0') {
        console.error(`Node.js version 18.10.0 is required, but found version ${nodeVersion}.`);
        return;
    }

    // Check if Python is installed and has the correct version
    executeCommand('python --version', (error, pythonVersion) => {
        if (error) {
            console.error('Python is not installed.');
            return;
        }

        pythonVersion = pythonVersion.split(' ')[1].trim();
        if (pythonVersion !== '3.8.0') {
            console.error(`Python version 3.8.0 is required, but found version ${pythonVersion}.`);
            return;
        }

        // Resolve the path to script.mjs relative to run.mjs
        const scriptPath = path.resolve(__dirname, 'script.mjs');

        // Run the Node.js script file
        executeCommand(`node ${scriptPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
    });
});
