const path = require('path');
const { inputBoard, finalInputChecker } = require('../src/io/input.js');
const { inputToPuzzleState } = require('../src/utils/structConverter.js');
const { generateNextStates } = require('../src/solver/helper.js');

const inputPath = path.resolve(__dirname, '../test/check.txt');

// Input
const input = inputBoard(inputPath);
const filteredInput = finalInputChecker(input)
filteredInput.print()

// Convert to Puzzlestate
const state = inputToPuzzleState(filteredInput)
let nextStates = generateNextStates(state)
for (const entry of nextStates) {
    entry.print(); 
}