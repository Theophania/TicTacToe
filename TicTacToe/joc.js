var initTable; //Array wo wir die Daten jeder Position speichern {x,0,nichts}
const spieler = 'X';
const computer = 'O';
const gluckliche_komb = [  //Array mit allen Gewinnkombinationen
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2]
]; 

const cells = document.querySelectorAll('.cell'); // cells Variable wird eine Referenz zu jedem Element mit Klasse 'cell' speichern 
startGame(); // Wir rufen die Funktion an, die den Spiel startet


//die Startfunktion - wird auch beim Replay angerufen
function startGame() {  document.querySelector(".endgame").style.display = "none"
 initTable = Array.from(Array(9).keys()) //Array mit allen Zahlen von 0-9
 for (var i=0; i< cells.length; i++) {
  cells[i].innerText = ''; //nichts im cell 
  cells[i].style.removeProperty('background-color'); //kein background color
  cells[i].addEventListener('click', turnClick, false); //Eventlistener fur die Click-fkt fur den Spieler
    }
} 


//Definition fur turnclick
function turnClick (square) {
  if (typeof initTable[square.target.id] === 'number') { //falls der Id eine Zahl ist, bedeutet es dass niemanden hier gespielt hatte
    turn(square.target.id, spieler) //Zug des Spielers
    if (!checkTie()) turn(bestSpot(), computer); //Verifizierung ob es Gleichstand ist, falls nicht, so beginnt der Zug des AI's
    }   
} 


//Definition fur turn-funktion
function turn(squareId, player) {
  initTable[squareId] = player;
    document.getElementById(squareId).innerText = player; //Update fur display damit wir die Aktion des Spielers sehen
 let gameWon = checkWin(initTable, player)
 if (gameWon) gameOver(gameWon) // Nach jedem Zug verifizieren wir ob jemand das Spiel gewonnen hat
} 


// Definition fur checkWin-funktion
function checkWin(board, player) {
  let plays = board.reduce((a, e, i) => 
  (e === player) ? a.concat(i) : a, []); //Such jeden Index wo der Spieler gespielt hat
  let gameWon = null;
  for (let [index, win] of gluckliche_komb.entries()) { //Verifizieren ob jemand gewonnen hat indem wir den Array mit Gewinnkombinationen durchlaufen
    if (win.every(elem => plays.indexOf(elem) > -1)) { //falls der Spieler tatsachlich in jede Position der Gewinnkombinationen gespielt hat
      gameWon = {index: index, player: player};  //die Gewinnkombinationen und der Spieler der gewinnt hat
      break;
    } 
} 
return gameWon;
} 


//Definition fur gameOver-funktion
function gameOver(gameWon) {
  for (let index of gluckliche_komb[gameWon.index]) { //wir gehen durch jeden Index der gluckliche_komb
    document.getElementById(index).style.backgroundColor = 
    gameWon.player === spieler ? "#4da6ff" : "#ff0000"; //Falls Spieler gewinnt=>background color blue und falls AI gewinnt-> background color red
}
  for (var i= 0; i < cells.length; i++ ) { //Disable cells damit man nicht mehr spielen kann
    cells[i].removeEventListener('click', turnClick, false);
}
  declareWinner(gameWon.player === spieler ? "Felicitari, ai castigat!" : "Ai pierdut!"); //Text fur den Spieler
} 


//Definition declareWinner-funktion
function declareWinner(who) {
    document.querySelector(".endgame").style.display = "block";
    document.querySelector(".endgame .text").innerText = who;
}

//Definition fur emptySuares-funktion  
function emptySquares() {
    return initTable.filter(s => typeof s === 'number'); //Filtriere jeden Element im initTable um zu sehen ob der Typ des Elements gleich der Zahl ist.
                                                        //Falls ja->return(tiles mit Zahlen sind leer, und tiles mit X und 0 sind nicht leer)
}


//Definition fur bestSpot=funktion
function bestSpot() {
    return minimax(initTable, computer).index; //wird immer im ersten leeren cell spielen nachdem die zelle mit minimax gerechnet wird
}


//Definition checkTie-funktion
function checkTie() {
    if (emptySquares().length === 0) { //Falls alle tiles besetzt sind und niemand gewonnen hat -> Gleichstand
        for (var i = 0; i < cells.length; i++) { 
            cells[i].style.backgroundColor = "#66ff66"; //background color green
            cells[i].removeEventListener('click', turnClick, false); //sicherstellen dass man nicht mehr spielen kann
        }
        declareWinner("Remiza!!")
        return true; //wahr falls Gleichstand
    }
    return false;
}


//Definition minimax function
function minimax(newBoard, player) {
    var availSpots = emptySquares(newBoard); //definiere die Indexe der gultigen Platze auf dem Brett

    if(checkWin(newBoard, player)) { // untersuche wer gewinnt
        return {score: -10}; //falls x->-10
    } else if (checkWin(newBoard, computer)) {
        return {score: 10} // falls 0 gewinnt ->10
    } else if (availSpots.length === 0) {
        return {score: 0} //Gleichstand->return 0
    }
    var moves = []; //Nimm alle Punktenanzahle von den tiles fur spaetere evaluierung
    for (var i = 0; i < availSpots.length; i++) {
        var move = {};
        move.index = newBoard[availSpots[i]]; //Setze die index Zahl des leeren Platzes, der als Zahl im initTable gespeichert war, zur index Eigenschaft des move Objektes
        newBoard[availSpots[i]] = player; //setze leerer Platz auf einem neuen Brett fur Spieler

        if (player === computer) { //ruf die minimax-funktion fur den AI
            var result = minimax(newBoard, spieler);
            move.score = result.score; //speichere die Punkenanzahleigenschaft zur move Objekten.score
        } else {
            var result = minimax(newBoard, computer);
            move.score = result.score; //Die Minimax-Funktion untersucht jeden Fall bis sie zu einem Terminierungszustand kommt
        }

        newBoard[availSpots[i]] = move.index; // minimax macht reset auf dem newBoard
        
        moves.push(move);//Wir speichern den move Objekt
        }

        var bestMove; //minimax algo der die beste Bewegung in movearray evaluiert
        if(player === computer) {  //wahle grosste Punktenanzahl fur AI und kleinste fur Spieler    
            var bestScore = -10000; //falls der jetzige Spieler der AI ist, setze die Variable zu eine sehr kleine Zahl
            for (var i = 0; i < moves.length; i++) { 
                if (moves[i].score > bestScore) { //falls eine Bewegung eine grossere Punktenanzahl als bestscore hat, wir diese gespeichert
                    bestScore = moves[i].score;
                    bestMove = i; //falls mehrere Bewegungen gleiche Punktenanzahl haben, nimm die Erste
                }
            }
        } else { // fall fur den Spieler
            var bestScore = 10000;
            for(var i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) { //suche Bewegung mit kleinster Punktenanzahl
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }
        return moves[bestMove];
    }