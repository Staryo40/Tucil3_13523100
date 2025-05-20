import { useState } from 'react';

const algorithms = ['UCS', 'GBFS', 'A*', 'IDA*'];
const heuristics = ['Blocked Cars', 'Distance to Freedom'];

export default function App() {
  const [boardText, setBoardText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [algorithm, setAlgorithm] = useState(algorithms[0]);
  const [heuristic, setHeuristic] = useState(heuristics[0]);
  const [isValid, setIsValid] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const handleFilePick = async () => {
    const result = await window.electronAPI.pickInputFile();

    if (result.error) {
      setErrorMessage(result.error);
      setBoardText('');
      setIsValid(false);
      setHasRun(false);
      return;
    }

    if (result.errors.length > 0) {
      setErrorMessage(result.errors.join('\n'));
      setBoardText(result.state);
      setIsValid(false);
      setHasRun(false);
      return;
    }

    setErrorMessage('');
    setBoardText(result.state);
    setIsValid(true);
    setHasRun(false);
  };

  const handleExecute = () => {
    if (!isValid) {
      setErrorMessage('Cannot execute solver: input is invalid.');
      return;
    }

    window.electronAPI.runSolver({ algorithm, heuristic });
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

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">Rush Hour Solver</h1>

      <div className="space-y-2">
        <button
          onClick={handleFilePick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Load Input File
        </button>

        {errorMessage && (
          <div className="text-red-600 border border-red-300 bg-red-100 p-2 rounded">
            {errorMessage}
          </div>
        )}
      </div>

      <div className="bg-gray-100 border p-4 rounded whitespace-pre font-mono min-h-[120px]">
        {boardText || 'No board loaded yet.'}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">Algorithm:</label>
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

        <div>
          <label className="block font-semibold mb-1">Heuristic:</label>
          <select
            value={heuristic}
            onChange={(e) => setHeuristic(e.target.value)}
            className="border p-2 rounded w-full"
          >
            {heuristics.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleExecute}
          disabled={!isValid}
          className={`px-4 py-2 rounded text-white transition ${
            isValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Execute Solver
        </button>

        <button
          onClick={handleExport}
          disabled={!hasRun}
          className={`px-4 py-2 rounded text-white transition ${
            hasRun ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Export Output
        </button>
      </div>
    </div>
  );
}
