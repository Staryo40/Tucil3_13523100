import { useState } from 'react';


const algorithms = ['UCS', 'GBFS', 'A*', 'IDA*'];
const heuristics = ['Blocked Cars', 'Distance to Freedom'];

const carColors = {
  A: 'bg-green-600',
  B: 'bg-yellow-400',
  C: 'bg-purple-500',
  D: 'bg-pink-400',
  E: 'bg-pink-600',
  F: 'bg-green-500',
  G: 'bg-indigo-500',
  H: 'bg-blue-500',
  I: 'bg-yellow-500',
  J: 'bg-purple-400',
  L: 'bg-blue-400',
  M: 'bg-green-400',
  N: 'bg-yellow-300',
  P: 'bg-red-500',
  O: 'bg-indigo-400',
  Q: 'bg-pink-300',
  R: 'bg-purple-300',
  S: 'bg-blue-300',
  T: 'bg-blue-700',
  U: 'bg-green-300',
  V: 'bg-yellow-200',
  W: 'bg-pink-200',
  X: 'bg-blue-200',
  Y: 'bg-purple-200',
  Z: 'bg-red-300',
};

function getColorForChar(char) {
  if (char === '.') return 'bg-gray-100';
  if (char === 'P') return 'bg-red-500 text-white font-bold';
  return carColors[char] || 'bg-gray-300';
}

const carTextColors = {
  A: 'text-green-600',
  B: 'text-yellow-400',
  C: 'text-purple-500',
  D: 'text-pink-400',
  E: 'text-pink-600',
  F: 'text-green-500',
  G: 'text-indigo-500',
  H: 'text-blue-500',
  I: 'text-yellow-500',
  J: 'text-purple-400',
  L: 'text-blue-400',
  M: 'text-green-400',
  N: 'text-yellow-300',
  O: 'text-indigo-400',
  P: 'text-red-500',
  Q: 'text-pink-300',
  R: 'text-purple-300',
  S: 'text-blue-300',
  T: 'text-blue-700',
  U: 'text-green-300',
  V: 'text-yellow-200',
  W: 'text-pink-200',
  X: 'text-blue-200',
  Y: 'text-purple-200',
  Z: 'text-red-300',
};

const renderMessage = (message) => {
  if (typeof message !== 'string') return 'Invalid message';

  if (message === 'Start of puzzle') {
    return <span className="text-blue-600">{message}</span>;
  }

  const carId = getCarId(message);
  const color = carTextColors[carId] || 'text-gray-500';

  if (message.includes('Target car reached goal')) {
    const [beforeGoal] = message.split('. Target car reached goal');
    const parts = beforeGoal.split(`Car P`);

    return (
      <>
        {parts[0]}
        <span className={`font-bold ${color}`}>Car {carId}</span>
        {parts[1]}
        {'. '}
        <span className="text-green-600">Target car reached goal</span>
      </>
    );
  }

  if (carId) {
    const parts = message.split(`Car ${carId}`);
    return (
      <>
        {parts[0]}
        <span className={`font-bold ${color}`}>Car {carId}</span>
        {parts[1]}
      </>
    );
  }

  return <>{message}</>;
};

const getCarId = (message) => {
  const carIndex = message.indexOf("Car ");
  if (carIndex === -1 || message.length < carIndex + 5) return null;
  return message[carIndex + 4]; // 4th index after 'Car '
};

function toBoardGrid(state, row, col) {
  if (!Array.isArray(state)) return [];

  return state.slice(0, row).map(rowArr =>
    Array.isArray(rowArr) ? rowArr.slice(0, col) : []
  );
}

function stringBoardToArray(state, row, col) {
  const result = [];
  for (let r = 0; r < row; r++) {
    const startIdx = r * col;
    const endIdx = startIdx + col;
    result.push(state.slice(startIdx, endIdx).split(''));
  }
  return result;
}

export default function App() {
  // Input
  const [boardText, setBoardText] = useState('');
  const [boardMeta, setBoardMeta] = useState({ row: 0, col: 0 });
  const [goalPos, setGoalPos] = useState({ row: -1, col: -1 });
  const [textFile, setTextFile] = useState('No file input...');
  const [errorMessage, setErrorMessage] = useState('');
  const [algorithm, setAlgorithm] = useState(algorithms[0]);
  const [heuristic, setHeuristic] = useState(heuristics[0]);
  const [isValid, setIsValid] = useState(false);

  // Output
  const [outputContainer, setOutputContainer] = useState(null)
  const [outputStates, setOutputStates] = useState(null)
  const [curOutputIndex, setCurOutputIndex] = useState(0)
  const [hasRun, setHasRun] = useState(false);

  const handleFilePick = async () => {
    const result = await window.electronAPI.pickInputFile();

    if (result){
        if (result.errors && result.errors.length > 0) {
            setErrorMessage(result.errors.join('\n'));
            setBoardText('');
            setGoalPos({ row: -1, col: -1 })
            setIsValid(false);
            setTextFile('Invalid file inputted')
            return;
        }
        
        setErrorMessage('');
        setBoardText(result.state);
        setBoardMeta({ row: result.row, col: result.col });  
        setGoalPos({ row: result.goalPos[0], col: result.goalPos[1] });  
        setIsValid(true);
        setTextFile(result.fileName)
    }
  };

  const handleExecute = async () => {
    if (!isValid) {
      setErrorMessage('Cannot execute solver: input is invalid.');
      return;
    }

    const result = await window.electronAPI.runSolver({ algorithm, heuristic });
    setOutputContainer(result)
    setOutputStates(result.states)
    setHasRun(true);
  };

  const handleExport = async () => {
    const result = await window.electronAPI.exportOutput();

    if (result.cancelled){
        return
    }

    if (result.error) {
      alert("Export failed: " + result.error);
    } else {
      alert("Output saved to:\n" + result.path);
    }
  };

    return !hasRun ? (
        <div className="flex flex-col h-screen w-screen">
        {/* Top Section */}
        <div className="flex flex-row h-4/5">
            {/* Left: Input Controls */}
            <div className="flex flex-col w-1/5 border-r border-gray-300 pr-4 overflow-auto">
                <div className="h-1/5 pt-6 flex flex-col">
                    <h1 className="text-3xl font-bold text-center">Rush Hour Solver</h1>
                    <p className="text-xl text-center text-gray-600">
                        <span className="text-red-600 font-semibold">Warning:</span> max 10x10 board for interface
                    </p>
                </div>
                <div className="h-3/5 flex flex-col items-center justify-center space-y-4">
                    <p className={`text-xl text-center text-gray-600 ${errorMessage ? 'text-red-600' : 'text-gray-600'}`}>{textFile}</p>
                    <button
                    onClick={handleFilePick}
                    className="w-2/3 px-4 py-2 text-center rounded border border-gray-300 bg-blue-600 text-white
                    hover:bg-blue-700 hover:border-blue-500 
                    focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    >
                    Load Text File
                    </button>

                    {errorMessage && (
                        <div className="text-red-600 border border-red-300 bg-red-100 p-2 rounded">
                        {errorMessage}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Board Preview */}
            <div className="w-4/5 bg-gray-100 border border-gray-300 rounded p-4 overflow-auto flex items-center justify-center">
                {Array.isArray(boardText) &&
                boardMeta.row > 0 &&
                boardMeta.col > 0 &&
                (boardMeta.row < 11 ||
                boardMeta.col < 11) &&
                boardText.length === boardMeta.row ? (
                <div
                    className="grid gap-1 bg-white p-2"
                    style={{
                    gridTemplateColumns: `repeat(${boardMeta.col}, 1fr)`,
                    }}
                >
                    {toBoardGrid(boardText, boardMeta.row, boardMeta.col).map((row, rIdx) =>
                    row.map((char, cIdx) => {
                        const isGoalCell = goalPos && rIdx === goalPos.row && cIdx === goalPos.col;
                        const cellColor = getColorForChar(char);

                        return (
                        <div
                            key={`${rIdx}-${cIdx}`}
                            className={`w-24 h-24 flex items-center justify-center border font-mono text-lg text-2xl ${cellColor} ${
                            isGoalCell || char === 'P' ? 'ring-4 ring-black' : ''
                            }`}
                        >
                            {char !== '.' ? char : ''}
                        </div>
                        );
                    })
                    )}
                </div>
                ) : Array.isArray(boardText) &&
                (boardMeta.row > 10 ||
                boardMeta.col > 10) &&
                boardText.length === boardMeta.row ? (
                    <p className="text-center text-lg text-2xl flex flex-col">
                        <span className='text-green-500'>Board succefully loaded!</span>
                        <span className='text-gray-500'>{'But the board is too big to display :('}</span>
                    </p>
                ) : (
                    <p className="text-gray-500 text-center text-lg text-2xl">No board loaded yet.</p>
                )}
            </div>
        </div>

        {/* Bottom Control Section */}
        <div className="flex flex-row h-1/5 border-t border-gray-300 pt-4 mt-2">
            <div className="w-1/2 flex flex-col gap-4 space-y-4 pt-6">
                <div className='w-full h-1/4 pl-6'>
                    <label className="text-xl block font-semibold mb-1">Algorithm:</label>
                    <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    className="border p-2 rounded w-full text-xl"
                    >
                    {algorithms.map(a => (
                        <option key={a} value={a}>{a}</option>
                    ))}
                    </select>
                </div>
                <div className='w-full h-1/2 pl-6'>
                    <label className="text-xl block font-semibold mb-1">Heuristic:</label>
                    <select
                    value={heuristic}
                    onChange={(e) => setHeuristic(e.target.value)}
                    disabled={algorithm === "UCS"}
                    className={`border p-2 rounded w-full text-xl ${
                    algorithm === "UCS" ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    >
                    {heuristics.map(h => (
                        <option key={h} value={h}>{h}</option>
                    ))}
                    </select>
                </div>
            </div>

            <div className="w-1/2 flex items-center justify-center space-x-4">
            <button
                onClick={handleExecute}
                disabled={!isValid}
                className={`h-32 w-1/2 px-4 py-2 rounded text-white text-2xl transition ${
                isValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
                Run Solver!
            </button>
            </div>
        </div>
        </div>
    ) : (
        <div className="flex flex-col h-screen w-screen px-8 py-4">
        {/* Top Controls (auto height) */}
        <div className="space-y-2">
            {/* Return button */}
            <button
            onClick={() => {
                setHasRun(false);
                setOutputContainer(null);
                setOutputStates(null);
                setCurOutputIndex(0);
            }}
            className="p-6 bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded text-lg"
            >
            ← Return to Input
            </button>

            {/* Step navigation */}
            <div className="flex items-center justify-center gap-x-12 border-y border-gray-300 py-1">
            <button
                onClick={() => setCurOutputIndex(Math.max(curOutputIndex - 1, 0))}
                className="text-4xl px-6 py-2 rounded hover:text-gray-300"
            >
                ◀
            </button>
            <div className="text-2xl font-semibold">
                Step: {curOutputIndex} / {outputContainer?.states?.length - 1 || 0}
            </div>
            <button
                onClick={() =>
                setCurOutputIndex(Math.min(curOutputIndex + 1, outputContainer.states.length - 1))
                }
                className="text-4xl px-6 py-2 rounded hover:text-gray-300"
            >
                ▶
            </button>
            </div>

            {/* Step message */}
            <div className="text-3xl text-gray-900 text-center pb-6">
                {renderMessage(outputStates[curOutputIndex].message) || 'No message'}
                {/* {outputStates[curOutputIndex].message || 'No message'} */}
            </div>
        </div>

        {/* Middle: Board (fills space) */}
        <div className="h-2/3 flex justify-center items-center bg-gray-50">
            {stringBoardToArray(outputStates[curOutputIndex].state.board, outputStates[curOutputIndex].state.row, outputStates[curOutputIndex].state.col) &&
            outputStates[curOutputIndex].state.row > 0 &&
            outputStates[curOutputIndex].state.col > 0 &&
            (outputStates[curOutputIndex].state.row < 11 ||
            outputStates[curOutputIndex].state.col < 11) &&
            boardText.length === outputStates[curOutputIndex].state.row ? (
            <div
            className="grid gap-1 bg-white p-2"
            style={{
                gridTemplateColumns: `repeat(${outputStates[curOutputIndex].state.col}, 1fr)`,
            }}
            >
            {stringBoardToArray(outputStates[curOutputIndex].state.board, outputStates[curOutputIndex].state.row, outputStates[curOutputIndex].state.col)
                .map((row, rIdx) =>
                row.map((char, cIdx) => {
                    const isGoalCell = outputStates[curOutputIndex].state.goalPos && rIdx === outputStates[curOutputIndex].state.goalPos[0] && cIdx === outputStates[curOutputIndex].state.goalPos[1];
                    const cellColor = getColorForChar(char);

                    return (
                    <div
                        key={`${rIdx}-${cIdx}`}
                        className={`w-20 h-20 flex items-center justify-center border font-mono text-xl ${cellColor} ${
                        isGoalCell || char === 'P' ? 'ring-4 ring-black' : ''
                        }`}
                    >
                        {char !== '.' ? char : ''}
                    </div>
                    );
                })
                )}
            </div>
            ) : stringBoardToArray(outputStates[curOutputIndex].state.board, outputStates[curOutputIndex].state.row, outputStates[curOutputIndex].state.col) &&
            (outputStates[curOutputIndex].state.row > 10 ||
            outputStates[curOutputIndex].state.col > 10) &&
            boardText.length === outputStates[curOutputIndex].state.row ? (
                <p className="text-center text-lg text-2xl flex flex-col">
                    <span className='text-green-500'>Board succefully processed!</span>
                    <span className='text-gray-500'>{'But the board is too big to display :('}</span>
                </p>
            ) : (
                <p className="text-center text-lg text-2xl flex flex-col">
                    <span className='text-red-500'>Error loading board</span>
                </p>
            )} 
        </div>

        {/* Bottom: Footer Info (auto height) */}
        <div className="flex flex-row w-screen">
            <div className='w-1/2 space-y-3 p-12 text-2xl'>
                <div>
                    <span className="font-bold">Status: </span>
                    <span className={outputContainer.mainMessage === 'Solution found' ? 'text-green-600' : 'text-red-600'}>
                    {outputContainer.mainMessage || 'N/A'}
                    </span>
                </div>
                <div><span className="font-bold">Algorithm: </span>{algorithm}</div>
                {algorithm !== 'UCS' && (
                    <div><span className="font-bold">Heuristic: </span>{heuristic}</div>
                )}
                <div><span className="font-bold">Execution Time: </span>{outputContainer.time} ms</div>
                <div><span className="font-bold">Total Nodes Visited: </span>{outputContainer.totalMove}</div>
                <div><span className="font-bold">Solution total steps: </span>{outputContainer.states.length - 1}</div>
            </div>
            <div className='w-1/2 flex items-center justify-center'>
                <button
                    onClick={handleExport}
                    className={`h-32 w-1/2 px-4 py-2 rounded text-white text-2xl transition bg-green-600 hover:bg-green-700'`}
                >
                    Save solution as .txt
                </button>
            </div>
            </div>
        </div>
    );
}
