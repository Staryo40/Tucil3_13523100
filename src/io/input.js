const fs = require('fs');
const path = require('path');
const { InputStruct } = require('../struct/inputstruct.js');

/**
 * Reads and parses a rush hour puzzle file (.txt)
 * @param {string} filePath - Path to the .txt file
 * @returns {InputStruct} Parsed puzzle structure
 */
function inputBoard(filePath) {
  const absPath = path.resolve(filePath);
  const errors = [];

  let row = 0, col = 0;
  let numCars = 0;
  let state = [];
  let goalPos = null;
  let goalFound = false;
  let primaryFound = false;
  let kCount = 0;

  try {
    const raw = fs.readFileSync(absPath, 'utf-8');
    const lines = raw.trim().split('\n');

    // 1. Dimensions
    if (!lines[0]) {
      errors.push("Row and column of board is not present");
      return new InputStruct(0, 0, numCars, [], null, errors);
    }

    const dims = lines[0].trim().split(/\s+/);
    if (dims.length !== 2 || dims.some(x => isNaN(parseInt(x)))) {
      errors.push(`Row and col are not valid: "${lines[0].trim()}"`);
      return new InputStruct(0, 0, numCars, [], null, errors);
    }

    row = parseInt(dims[0]);
    col = parseInt(dims[1]);

    // 2. Number of Cars
    if (!lines[1]) {
      errors.push("Number of cars not present");
      return new InputStruct(row, col, numCars,[] , null, errors);
    }

    numCars = parseInt(lines[1]);
    if (isNaN(numCars)) {
      errors.push(`Number of cars is not valid: "${lines[1].trim()}"`);
      return new InputStruct(row, col, numCars,[] , null, errors);
    }

    // 3. Process Lines
    const boardLines = [];
    var startIndex = 2;
    const expectedLines = lines.length;

    if (!goalFound && startIndex >= 1) {
        const aboveLine = lines[startIndex].trim();

        if (aboveLine === 'K') {
            const chars = aboveLine.split('');
            const kIndex = chars.indexOf('K');

            kCount += chars.filter(ch => ch === 'K').length;

            if (kIndex !== -1) {
                if (kIndex < col) {
                    startIndex = startIndex + 1;
                    goalFound = true;
                    goalPos = [0, kIndex]; 
                } else {
                    errors.push(`Goal is out of range at colIndex: ${kIndex}, when column size is: ${col}`);
                    return new InputStruct(row, col, numCars, [] , null, errors);
                }
            }
        }
    }

    for (let i = 0; i < row; i++) {
        const lineIdx = startIndex + i;
        // Check for row
        if (lineIdx >= expectedLines) {
            errors.push(`Expected ${row} rows, got ${i} rows`);
            return new InputStruct(row, col, numCars,[] , null, errors);
        }

        // Check for valid characters
        const line = lines[lineIdx].trim();
        const chars = line.split('');
        for (const ch of chars) {
            if (!isValidChar(ch)) {
                errors.push(`Invalid character '${ch}' found at line ${lineIdx + 1}`);
                return new InputStruct(row, col, numCars, [], null, errors);
            }
        }

        kCount += chars.filter(ch => ch === 'K').length;
        const containsGoal = chars.includes('K');
        if (containsGoal) goalFound = true;
        if (kCount > 1){
            errors.push(`More than 1 goal detected`);
            return new InputStruct(row, col, numCars, [], null, errors);
        }

        if (containsGoal) {
            const goalIndex = chars.indexOf('K');

            if (chars.length === col + 1) {
                if (goalIndex === col) {
                    goalPos = [i, col - 1]; // K is right of board
                    boardLines.push(chars.slice(0, col));
                } else if (goalIndex === 0) {
                    goalPos = [i, 0]; // K is left of board
                    boardLines.push(chars.slice(1, col + 1));
                } else {
                    errors.push(`Line ${lineIdx + 1} has goal (K) at invalid position; it must be at start or end`);
                    return new InputStruct(row, col, numCars, [], null, errors);
                }
            } else if (chars.length === col) {
                if (goalIndex !== -1) {
                    errors.push(`Line ${lineIdx + 1} goal (K) is in the middle of the board`);
                    return new InputStruct(row, col, numCars, [], null, errors);
                } else {
                    errors.push(`Line ${lineIdx + 1} with goal (K) must be length ${col + 1}`);
                    return new InputStruct(row, col, numCars, [], null, errors);
                }
            } else {
                errors.push(`Line ${lineIdx + 1} has invalid length`);
                return new InputStruct(row, col, numCars, [], null, errors);
            }
      } else {
        if (chars.length !== col) {
          errors.push(`Line ${lineIdx + 1} should have exactly ${col} characters, but has ${chars.length} characters`);
          return new InputStruct(row, col, numCars, [], null, errors);
        }
        boardLines.push(chars);
      }

      if (chars.includes('P')) primaryFound = true;
    }

    // Check for goal separate line
    if (!goalFound && startIndex + row < expectedLines) {
        const extraLine = lines[startIndex + row]; 
        const chars = extraLine.split('');
        const kIndex = chars.indexOf('K');

        kCount += chars.filter(ch => ch === 'K').length;

        if (kIndex !== -1) {
            if (kIndex >= col + 1) {
                errors.push(`Goal (K) below board is misaligned (column ${kIndex} out of bounds)`);
                return new InputStruct(row, col, numCars, [], null, errors);
            }
            goalFound = true;
            goalPos = [row - 1, kIndex]; 
        } else {
            errors.push("Expected goal (K) on separate line but format is invalid");
            return new InputStruct(row, col, numCars, [], null, errors);
        }
    }

    if (!goalFound) {
      errors.push("Goal (K) not found");
      return new InputStruct(row, col, numCars, [], null, errors);
    }

    if (!primaryFound) {
      errors.push("Primary car (P) not found");
      return new InputStruct(row, col, numCars, [], null, errors);
    }

    state = boardLines

  } catch (err) {
    errors.push(`Error reading file: ${err.message}`);
    return new InputStruct(row, col, numCars, [], null, errors);
  }

  return new InputStruct(row, col, numCars, state, goalPos, errors);
}

/**
 * Checks if a character is valid in the Rush Hour puzzle.
 * Valid characters are uppercase A–Z and '.' (dot for empty cell).
 * @param {string} ch - A single character to validate.
 * @returns {boolean} True if the character is valid, false otherwise.
 */
function isValidChar(ch) {
  return /^[A-Z.]$/.test(ch);
}

/**
 * Performs final validation on a parsed InputStruct to ensure all
 * board characters are either '.' or capital A–Z.
 * Adds errors to input.errors if invalid characters are found.
 * @param {InputStruct} input - The parsed input structure to validate.
 * @returns {InputStruct} The same InputStruct, possibly with errors added.
 */
function finalInputChecker(input) {
  const { row, col, count, state, goalPos } = input;
  const errors = [];

  if (input.errors.length > 0) {
    return input;
  }

  const positions = {}; 
  const seen = new Set();

  // 1. Collect all car positions
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      const ch = state[i][j];
      if (ch === '.' || ch === 'K') continue;

      if (!positions[ch]) {
        positions[ch] = [];
      }
      positions[ch].push([i, j]);
    }
  }

  // 2. Check car count (excluding 'P')
  const carLetters = Object.keys(positions).filter(ch => ch !== 'P');
  if (carLetters.length !== count) {
    errors.push(`Car count mismatch: expected ${count}, found ${carLetters.length}`);
    return new InputStruct(row, col, count, state, goalPos, errors);
  }

  // 3. Check each car is aligned and continuous
  for (const [car, cells] of Object.entries(positions)) {
    if (cells.length < 2) {
      errors.push(`Car '${car}' occupies only one cell, which is not allowed`);
      return new InputStruct(row, col, count, state, goalPos, errors);
    }
    let orientation = null;

    const rows = cells.map(([r, _]) => r);
    const cols = cells.map(([_, c]) => c);

    const allSameRow = rows.every(r => r === rows[0]);
    const allSameCol = cols.every(c => c === cols[0]);

    if (allSameRow) {
      orientation = 'horizontal';
      const sorted = cols.sort((a, b) => a - b);
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] !== sorted[i - 1] + 1) {
          errors.push(`Car '${car}' is not continuous horizontally`);
          return new InputStruct(row, col, count, state, goalPos, errors);
        }
      }
    } else if (allSameCol) {
      orientation = 'vertical';
      const sorted = rows.sort((a, b) => a - b);
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] !== sorted[i - 1] + 1) {
          errors.push(`Car '${car}' is not continuous vertically`);
          return new InputStruct(row, col, count, state, goalPos, errors);
        }
      }
    } else {
      errors.push(`Car '${car}' is not aligned in a single line`);
      return new InputStruct(row, col, count, state, goalPos, errors);
    }

    // Prevent reused letters for disjoint cars 
    if (seen.has(car)) {
      errors.push(`Car '${car}' appears in multiple disconnected regions`);
      return new InputStruct(row, col, count, state, goalPos, errors);
    }
    seen.add(car);
  }

  // 4. Check primary car alignment with goal
  const pCells = positions['P'];
  if (!pCells) {
    errors.push("Primary car (P) is missing");
    return new InputStruct(row, col, count, state, goalPos, errors);
  }

  const pRows = pCells.map(([r, _]) => r);
  const pCols = pCells.map(([_, c]) => c);
  const pAllSameRow = pRows.every(r => r === pRows[0]);
  const pAllSameCol = pCols.every(c => c === pCols[0]);

  if (pAllSameRow) {
    if (pRows[0] !== goalPos[0]) {
      errors.push(`Primary car is horizontal, but not aligned with goal row`);
      return new InputStruct(row, col, count, state, goalPos, errors);
    }
  } else if (pAllSameCol) {
    if (pCols[0] !== goalPos[1]) {
      errors.push(`Primary car is vertical, but not aligned with goal column`);
      return new InputStruct(row, col, count, state, goalPos, errors);
    }
  } else {
    errors.push(`Primary car is not aligned correctly`);
    return new InputStruct(row, col, count, state, goalPos, errors);
  }

  return input;
}

module.exports = {
  inputBoard,
  finalInputChecker
};
