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

function toBoardGrid(state, row, col) {
  if (!Array.isArray(state)) return [];

  return state.slice(0, row).map(rowArr =>
    Array.isArray(rowArr) ? rowArr.slice(0, col) : []
  );
}

export default function App() {
  const [boardText, setBoardText] = useState('');
  const [boardMeta, setBoardMeta] = useState({ row: 0, col: 0 });
  const [goalPos, setGoalPos] = useState({ row: -1, col: -1 });
  const [textFile, setTextFile] = useState('No file input...');
  const [errorMessage, setErrorMessage] = useState('');
  const [algorithm, setAlgorithm] = useState(algorithms[0]);
  const [heuristic, setHeuristic] = useState(heuristics[0]);
  const [isValid, setIsValid] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [curOutputIndex, setCurOutputIndex] = useState(0)

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
    setHasRun(true);
  };

  const handleExport = async () => {
    const result = await window.electronAPI.exportOutput();

    if (result.error) {
      alert("Export failed: " + result.error);
    } else {
      alert("Output saved to:\n" + result.path);
    }
  };

    return !hasRun ? (
        <div className="flex flex-col h-screen w-screen">
        {/* Top Section (70% height) */}
        <div className="flex flex-row h-4/5">
            {/* Left: Input Controls (30% width) */}
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

            {/* Right: Board Preview (70% width) */}
            <div className="w-4/5 bg-gray-100 border border-gray-300 rounded p-4 overflow-auto flex items-center justify-center">
                {Array.isArray(boardText) &&
                boardMeta.row > 0 &&
                boardMeta.col > 0 &&
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
                            isGoalCell ? 'ring-4 ring-black' : ''
                            }`}
                        >
                            {char !== '.' ? char : ''}
                        </div>
                        );
                    })
                    )}
                </div>
                ) : (
                <p className="text-gray-500 text-center text-lg text-2xl">No board loaded yet.</p>
                )}
            </div>
        </div>

        {/* Bottom Section (30% height) */}
        <div className="flex flex-row h-1/5 border-t border-gray-300 pt-4 mt-2">
            <div className="w-1/2 flex flex-col gap-4 space-y-4 pt-6">
                <div className='w-full h-1/4 pl-6'>
                    <label className="text-xl block font-semibold mb-1">Algorithm:</label>
                    <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    className="border p-2 rounded w-full"
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
                    className={`border p-2 rounded w-full ${
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
        <div className="flex flex-col h-screen w-screen">
            {/* return to input */}
            <div className='pl-10 h-20'>
                <button
                    onClick={setHasRun(false)}
                    className={`h-12 w-1/2 px-4 py-2 rounded text-white text-2xl bg-blue-800 hover:bg-blue-700 transition`}
                >
                    Return to input
                </button>
            </div>
            {/* solution board display */}
            <div className='h-3/4'>

            </div>
            {/* footer control */}
            <div className='h-1'>

            </div>
        </div>
    );
}
