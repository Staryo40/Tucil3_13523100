import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { useState } from 'react';

const algorithms = ['UCS', 'GBFS', 'A*', 'IDA*'];
const heuristics = ['Blocked Cars', 'Distance to Freedom'];

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// export default function App() {
//   const [boardText, setBoardText] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [algorithm, setAlgorithm] = useState(algorithms[0]);
//   const [heuristic, setHeuristic] = useState(heuristics[0]);
//   const [isValid, setIsValid] = useState(false);

//   const handleFilePick = async () => {
//     const result = await window.electronAPI.pickInputFile();

//     if (result.error) {
//       setErrorMessage(result.error);
//       setBoardText('');
//       setIsValid(false);
//       return;
//     }

//     // Assume result contains `board` and `valid` fields
//     setErrorMessage('');
//     setBoardText(result.board);
//     setIsValid(result.valid);
//   };

//   const handleExecute = () => {
//     if (!isValid) {
//       setErrorMessage('Cannot run solver: input is invalid');
//       return;
//     }

//     window.electronAPI.runSolver({
//       algorithm,
//       heuristic,
//       board: boardText,
//     });
//   };

//   return (
//     <div className="p-6 max-w-3xl mx-auto space-y-6">
//       <h1 className="text-3xl font-bold text-center">Rush Hour Solver</h1>

//       {/* File and Error */}
//       <div className="space-y-2">
//         <button
//           onClick={handleFilePick}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//         >
//           📂 Load Input File
//         </button>

//         {errorMessage && (
//           <div className="text-red-600 border border-red-300 bg-red-100 p-2 rounded">
//             {errorMessage}
//           </div>
//         )}
//       </div>

//       {/* Board Preview */}
//       <div className="bg-gray-100 border p-4 rounded whitespace-pre font-mono">
//         {boardText || 'No board loaded'}
//       </div>

//       {/* Config Selectors */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <div>
//           <label className="block font-semibold mb-1">Algorithm</label>
//           <select
//             className="w-full border rounded p-2"
//             value={algorithm}
//             onChange={(e) => setAlgorithm(e.target.value)}
//           >
//             {algorithms.map((alg) => (
//               <option key={alg} value={alg}>{alg}</option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block font-semibold mb-1">Heuristic</label>
//           <select
//             className="w-full border rounded p-2"
//             value={heuristic}
//             onChange={(e) => setHeuristic(e.target.value)}
//           >
//             {heuristics.map((heur) => (
//               <option key={heur} value={heur}>{heur}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Execute Button */}
//       <div>
//         <button
//           disabled={!isValid}
//           onClick={handleExecute}
//           className={`px-4 py-2 rounded text-white transition
//             ${isValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
//         >
//           ▶️ Execute Solver
//         </button>
//       </div>
//     </div>
//   );
// }
