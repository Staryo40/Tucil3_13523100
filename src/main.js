const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

const { inputBoard, finalInputChecker } = require('./io/input.js');
const { outputCreation, outputToFile } = require('./io/output.js');
const { uniformCostSearch } = require('./algorithms/solverUniformCostSearch.js')
const { greedyBestFirstSearch } = require('./algorithms/solverGreedyBestFirstSearch.js')
const { algoAStar } = require('./algorithms/solverAstar.js')
const { iterativeDeepeningAstar } = require('./algorithms/solverIterativeDeepeningAstar.js')
const { heuristicBlockerCount, heuristicDistanceToFreedom } = require('./solver/heuristic.js');
const { time } = require('console');

let cachedInput = null;
let cachedFilePath = null;
let cachedOutput = null;

function createWindow() {
    const win = new BrowserWindow({
    show: false,              // create window but don't show yet
    fullscreenable: true,
    frame: true,
    autoHideMenuBar: false,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true
    }
    });

    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

    win.once('ready-to-show', () => {
    win.maximize();           // make it fullscreen-safe
    win.show();               // only show when ready
    });
}

app.whenReady().then(createWindow);

ipcMain.handle('open-input', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Select Input File',
    defaultPath: process.cwd(), // ✅ working directory
    filters: [{ name: 'Text Files', extensions: ['txt'] }],
    properties: ['openFile'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { error: 'No file selected.' };
  }

  try {
    const filePath = result.filePaths[0];
    const input = inputBoard(filePath);
    const pureinput = finalInputChecker(input);

    cachedInput = pureinput;
    cachedFilePath = filePath;

    return pureinput;
  } catch (err) {
    return { error: 'Failed to read file.' };
  }
});

ipcMain.handle('run-solver', async (event, config) => {
  if (!cachedInput) return { error: 'No input loaded' };

  const { algorithm, heuristic } = config;

  let heuristicFn = null;
  if (heuristic === 'Blocked Cars') {
    heuristicFn = heuristicBlockerCount;
  } else if (heuristic === 'Distance to Freedom') {
    heuristicFn = heuristicDistanceToFreedom;
  }

  let solution = null;
  const start = performance.now();

  if (algorithm === 'UCS') {
    solution = uniformCostSearch(cachedInput);
  } else if (algorithm === 'GBFS') {
    solution = greedyBestFirstSearch(cachedInput, heuristicFn);
  } else if (algorithm === 'A*') {
    solution = algoAStar(cachedInput, heuristicFn);
  } else if (algorithm === 'IDA*') {
    solution = iterativeDeepeningAstar(cachedInput, heuristicFn);
  } else {
    return { error: 'Invalid algorithm' };
  }

  const end = performance.now();
  const time = (end - start).toFixed(3); 
  cachedOutput = outputCreation(time, solution.totalMove, solution.node);

  return { success: true };
});


ipcMain.handle('export-output', async () => {
  if (!cachedOutput) {
    return { error: 'No solution has been generated yet.' };
  }

  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Save Solver Output',
    buttonLabel: 'Save Output',
    filters: [{ name: 'Text Files', extensions: ['txt'] }],
    properties: ['createDirectory', 'showOverwriteConfirmation'],
  });

  if (canceled || !filePath) {
    return { error: 'Save operation cancelled.' };
  }

  try {
    outputToFile(cachedOutput, filePath);
    return { success: true, path: filePath };
  } catch (err) {
    console.error(err);
    return { error: 'Failed to write output file.' };
  }
});
