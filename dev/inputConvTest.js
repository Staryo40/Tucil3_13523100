const path = require('path');
const { inputBoard, finalInputChecker } = require('../src/io/input.js');
const { inputToPuzzleState } = require('../src/utils/structConverter.js');
const { Console } = require('console');

const inputPath = path.resolve(__dirname, '../test/acak.txt');

// Input
const input = inputBoard(inputPath);
const filteredInput = finalInputChecker(input)
filteredInput.print()

// Convert to Puzzlestate
const state = inputToPuzzleState(filteredInput)
state.print()
state.cars.get('P').print('P');