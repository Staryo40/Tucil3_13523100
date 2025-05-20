# Tugas Kecil 3 Strategi Algoritma 2025     
## Solving Rush Hour Puzzle with Pathfinding Algorithms (UCS, GBFS, A*, IDA*)
Rush Hour is a logic-based grid board game with the goal of navigating the primary car (usually red) out of a traffic jam by sliding other vehicles out of the way within a confined grid. There are four important components of this game:  
1. Board: the place where the game takes place and is made up of cells, which has the dimension of 6x6 in the original game, however in this program, you can have customized size of the board.
2. Primary Piece: this is the piece that needs to be removed from the board in order to complete the puzzle, it is unique that it is the only car that can get out of the board.
3. Piece: other pieces of this puzzle other than the primary piece acts as obstacles that block the primary piece from leaving, it is the assignment of the player to shift around these pieces to make a path for the primary piece so that it can get out of the board.  
4. Exit: there are only one in the game and is the goal of the primary piece to get out of the board via this exit.  
In this program, the Uniform Cost Search (UCS), Greedy Best First Search (GBFS), A Star (A*), and Iterative Deepening A Star (IDA*) algorithms are implemented in order to solve this puzzle. With the exception of UCS, other algorithms can also experiment using the two heuristics implemented in this program, which are:
1. Blocked Cars: this is a simple heuristic that counts the number of cars blocking the primary car from the exit
2. Distance to Freedom: this is an evolution of Blocked Cars by rather than just counting the cars directly blocking the primary car, we also count the cars that are blocking those blocked cars too until we find a car that can be moved, it can be said this heuristic is a recursive version of Blocked Cars  
The program receives and outputs via .txt files, for the input, the first line contains the dimension of the board with the format [row, col], the second line is the number of cars other than the primary car, and below that is the starting board of the game. P is denoted to be the primary car of this program, K is the exit of the puzzle an needs to be located outside of the board, can be placed anywhere from left, right, top, or bottom of the board, but there could only exist 1 exit in the game. Lastly dots (.) denotes empty spaces in this program.    
<p align="center">
<img src="" alt="Rush Hour Solver Program Demonstration" width="700"/>
<img src="" alt="Rush Hour Traditional Puzzle" width="700"/>
</p>

## Program Requirements
1. Node.js  
## Compiling the Program
Navigate to the directory that contains bin, doc, src, and test (root directory)
Then run the line below to install node packages used in this project
```bash
npm install
```  
After installing node packages, bundle the frontend of the program using:
```bash
npx vite build
```  
## Running the Program
Run the line below in the root directory to run the program
```bash
npm start
```
If the line above does not work, try to compile the program before running the line again.  
## About The Creators
<table>
  <tr>
    <th>Nama Lengkap</th>
    <th>NIM</th>
    <th>Kelas</th>
  </tr>
  <tr>
    <td>Aryo Wisanggeni</td>
    <td>13523100</td>
    <th>K02</th>
  </tr>
</table>
