const path = require('path');
const { inputBoard, finalInputChecker } = require('../src/io/input');
const { fileURLToPath } = require('url');

const inputPath = path.resolve(__dirname, '../test/acak.txt');

const input = inputBoard(inputPath);
input.print();

const filteredInput = finalInputChecker(input)
filteredInput.print()