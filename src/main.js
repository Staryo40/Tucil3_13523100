const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

const { inputBoard, finalInputChecker } = require('./io/input.js');
const { outputCreation, outputToFile } = require('./io/output.js');
const { inputToPuzzleState } = require('./utils/structConverter.js');
const { uniformCostSearch } = require('./algorithms/solverUniformCostSearch.js')
const { greedyBestFirstSearch } = require('./algorithms/solverGreedyBestFirstSearch.js')
const { algoAStar } = require('./algorithms/solverAstar.js')
const { iterativeDeepeningAstar } = require('./algorithms/solverIterativeDeepeningAstar.js')
const { heuristicBlockerCount, heuristicDistanceToFreedom } = require('./solver/heuristic.js');
const { time } = require('console');

let cachedInput = null;
let cachedFilePath = null;
let cachedOutput = null;

/**
 * Creates the main application window for the Rush Hour solver.
 * Loads the frontend from the Vite build output (`dist/index.html`)
 * and delays showing the window until it's fully ready.
 */
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

/**
 * Initializes the Electron app once it's ready and sets up the main window.
 */
app.whenReady().then(createWindow);

/**
 * Handles the 'open-input' IPC event from the renderer.
 * Opens a file picker dialog, parses and validates the selected text file,
 * and caches the parsed input structure for future use.
 *
 * @returns {Promise<Object|null>} Parsed input data with file name, or null if canceled.
 */
ipcMain.handle('open-input', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Select Input File',
    defaultPath: process.cwd(), 
    filters: [{ name: 'Text Files', extensions: ['txt'] }],
    properties: ['openFile'],
  });

    const filePath = result.filePaths[0];
    if (!filePath) return null;

    const input = inputBoard(filePath);
    const pureinput = finalInputChecker(input);

    cachedInput = pureinput;
    cachedFilePath = filePath;

    return {
      ...pureinput,
      fileName: path.basename(filePath) 
    };
});

/**
 * Handles the 'run-solver' IPC event from the renderer.
 * Executes the selected pathfinding algorithm using the cached input.
 * Returns structured output including timing, moves, and step-by-step states.
 *
 * @param {Electron.IpcMainInvokeEvent} event - The IPC event.
 * @param {{ algorithm: string, heuristic: string }} config - Configuration object.
 * @returns {Promise<Object>} Serialized solution data or error.
 */
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
  const parsedInput = inputToPuzzleState(cachedInput);

  console.log("Processing puzzle...")  

  if (algorithm === 'UCS') {
    solution = uniformCostSearch(parsedInput);
  } else if (algorithm === 'GBFS') {
    solution = greedyBestFirstSearch(parsedInput, heuristicFn);
  } else if (algorithm === 'A*') {
    solution = algoAStar(parsedInput, heuristicFn);
  } else if (algorithm === 'IDA*') {
    solution = iterativeDeepeningAstar(parsedInput, heuristicFn);
  } else {
    return { error: 'Invalid algorithm' };
  }
  
  console.log("Algorithm process finished: solution resolved\n")  

  const end = performance.now();
  const time = (end - start).toFixed(3); 
  cachedOutput = outputCreation(time, solution.totalMove, solution.node);

  if (!solution.node){
    return {
      time: cachedOutput.time,
      totalMove: cachedOutput.totalMove,
      moveCount: cachedOutput.moveCount,
      mainMessage: "Solution not found",
      states: [
        {
          message: "Start of puzzle",
          state: {
            board: parsedInput.board,
            row: parsedInput.row,
            col: parsedInput.col,
            goalPos: parsedInput.goalPos
          }
        }
      ]
    };
  }

  return {
    time: cachedOutput.time,
    totalMove: cachedOutput.totalMove,
    moveCount: cachedOutput.moveCount,
    mainMessage: cachedOutput.mainMessage,
    states: cachedOutput.states.map(s => ({
      message: s.message,
      state: {
        board: s.state.board,
        row: s.state.row,
        col: s.state.col,
        goalPos: s.state.goalPos,
      }
    })),
  };
});

/**
 * Handles the 'export-output' IPC event from the renderer.
 * Prompts the user to choose a file location and writes the solution output to a `.txt` file.
 *
 * @returns {Promise<Object>} Result object with success status or error message.
 */
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
    return { cancelled: true };
  }

  try {
    outputToFile(cachedOutput, filePath);
    return { success: true, path: filePath };
  } catch (err) {
    console.error(err);
    return { error: 'Failed to write output file.' };
  }
});
