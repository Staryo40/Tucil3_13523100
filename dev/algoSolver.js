const path = require('path');
const { inputBoard, finalInputChecker } = require('../src/io/input.js');
const { inputToPuzzleState } = require('../src/utils/structConverter.js');
const { outputCreation } = require('../src/io/output.js')
const { heuristicBlockerCount, heuristicDistanceToFreedom } = require('../src/solver/heuristic.js')

const { uniformCostSearch } = require('../src/algorithms/solverUniformCostSearch.js')
const { greedyBestFirstSearch } = require('../src/algorithms/solverGreedyBestFirstSearch.js')
const { algoAStar } = require('../src/algorithms/solverAstar.js')

const inputPath = path.resolve(__dirname, '../test/spec.txt');

// Input
const input = inputBoard(inputPath);
const filteredInput = finalInputChecker(input)
filteredInput.print()


const state = inputToPuzzleState(filteredInput)

// const solutionNode = uniformCostSearch(state)
const solutionNode = algoAStar(state, heuristicDistanceToFreedom)
// const solutionNode = greedyBestFirstSearch(state, heuristicDistanceToFreedom)

const output = outputCreation(0, solutionNode)
output.print()
