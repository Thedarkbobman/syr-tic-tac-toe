class MoveMaker {
  constructor(type) {
    this.aiType = type;
    this.board = new Array(3);
    for (let i = 0; i < this.board.length; i++) {
      this.board[i] = new Array(3);
      for (let j = 0; j < this.board[i].length; j++) {
        this.board[i][j] = 0;
      }
    }
    //console.log('Test Board');
    //console.log(this.board);
  }
  updateBoard(type, x, y) {
    this.board[x][y] = type;
  }
  nextMove() {
    let turn = this.aiType;
    let move = this.newMinimax(this.board, turn);
    this.updateBoard(this.aiType, move[0], move[1]);
    return move;
    /*let availableMoves = this.getAvailableMoves(this.board);
    let values = [];
    //for each move check its state value
    for (let i = 0; i < availableMoves.length; i++) {
      values.push(
        this.minimax(this.board, this.aiType * -1, availableMoves[i])
      );
    }
    let highest = values[0];
    let highestMove = null; //<- this should always change
    for(let i = 0; i < values.length; i++) {
      if(values[i] >= highest){
        highest = values[i];
        highestMove = availableMoves[i];
      }
    }
    
    //console.log('CurrentPoint');
    //console.log(highestMove);
    this.updateBoard(this.aiType, highestMove[0], highestMove[1]);
    return highestMove;*/
  }

  minimax(state, turn, move) {
    let newState = this.deepCopy(state);

    newState[move[0]][move[1]] = turn;
    //this is our exit condition
    if (this.isFinalGameState(state)) {
      this.logger(state);
      let value = this.getFinalGameStateRank(state);
      //console.log("rank");
      //this.logger(value);
      return value;
    }
    let availableMoves = this.getAvailableMoves(newState);
    //this is currently the AI so max the AI
    let values = [];

    if (turn == this.aiType) {
      for (let i = 0; i < availableMoves.length; i++) {
        values.push(
          this.minimax(newState, this.aiType * -1, availableMoves[i])
        );
      }
      let highest = values[0];
      let highestMove = null; //<- this should always change
      for (let i = 0; i < values.length; i++) {
        if (values[i] >= highest) {
          highest = values[i];
          highestMove = availableMoves[i];
        }
      }
      return highest;
    } else {
      //this is currently the player so min the player
      for (let i = 0; i < availableMoves.length; i++) {
        values.push(this.minimax(newState, this.aiType, availableMoves[i]));
      }
      let lowest = values[0];
      let lowestMove = null; //<- this should always change
      for (let i = 0; i < values.length; i++) {
        if (values[i] <= lowest) {
          lowest = values[i];
          lowestMove = availableMoves.values[i];
        }
      }
      return lowest;
    }
  }

  newMinimax(state, turn) {
    if (this.isFinalGameState(state)) {
      //this.logger(state);
      let value = this.getFinalGameStateRank(state);
      //console.log("rank");
      //this.logger(value);
      return {value: value};
    }
    let availableMoves = this.getAvailableMoves(state);

    let moves = [];
    //for each move do minimax
    for (let i = 0; i < availableMoves.length; i++) {
      let move = availableMoves[i];
      state[move[0]][move[1]] = turn;
      if (turn == this.aiType) {
        move.value = this.newMinimax(state, this.aiType * -1).value;
      } else {
        move.value = this.newMinimax(state, this.aiType).value;
      }
      state[move[0]][move[1]] = PlayerType.Z;
      moves.push(move);
    }
    
    //Determine the best move
    let topMove = null;
    if (turn == this.aiType) {
      let topScore = -1000000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].value > topScore) {
          topScore = moves[i].value;
          topMove = moves[i];
        }
      }
    } else {
      let topScore = 1000000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].value < topScore) {
          topScore = moves[i].value;
          topMove = moves[i];
        }
      }
    }
    return topMove;
  }


  getAvailableMoves(state) {
    let moves = [];
    for (let i = 0; i < state.length; i++) {
      for (let j = 0; j < state.length; j++) {
        if (state[i][j] == PlayerType.Z) {
          moves.push([i, j]);
        }
      }
    }
    return moves;
  }

  isFinalGameState(state) {
    //this.logger(state);
    return (
      this.isFilledBoard(state) ||
      this.winner(state, PlayerType.O) ||
      this.winner(state, PlayerType.X)
    );
  }

  getFinalGameStateRank(state) {
    let x = this.winner(state, PlayerType.X);
    let o = this.winner(state, PlayerType.O);
    //console.log('state');
    //console.log(state);
    let rank = 0;
    if (x && this.aiType == PlayerType.X) {
      rank = 1;
    } else if (x && this.aiType != PlayerType.X) {
      rank = -1;
    } else if (o && this.aiType == PlayerType.O) {
      rank = 1;
    } else if (o && this.aiType != PlayerType.O) {
      rank = -1;
    } else if (this.isFilledBoard(state)) {
      rank = 0;
    }
    //console.log('rank');
    //console.log(rank);
    return rank;
  }
  isFilledBoard(state) {
    for (let i = 0; i < state.length; i++) {
      for (let j = 0; j < state[i].length; j++) {
        if (state[i][j] == PlayerType.Z) {
          return false;
        }
      }
    }
    return true;
  }
  winner(state, type) {
    //rows+cols
    for (let i = 0; i < state.length; i++) {
      if (state[i][0] == type && state[i][1] == type && state[i][2] == type) {
        return true;
      }
      if (state[0][i] == type && state[1][i] == type && state[2][i] == type) {
        return true;
      }
    }
    //diagonals
    if (state[0][0] == type && state[1][1] == type && state[2][2] == type) {
      return true;
    }
    if (state[0][2] == type && state[1][1] == type && state[2][0] == type) {
      return true;
    }

    return false;
  }
  deepCopy(state) {
    //console.log("Deep Copy");
    let copy = [];
    for (let i = 0; i < state.length; i++) {
      copy[i] = [];
      for (let j = 0; j < state[i].length; j++) {
        switch (state[i][j]) {
          case -1:
            copy[i][j] = -1;
            break;
          case 0:
            copy[i][j] = 0;
            break;
          case 1:
            copy[i][j] = 1;
            break;
        }
      }
    }

    return copy;
  }
  logger(state) {
    console.log('State');
    for (let i = 0; i < state.length; i++) {
      console.log(state[i]);
    }
  }
}
const PlayerType = {
  X: -1,
  O: 1,
  Z: 0
};

export { MoveMaker, PlayerType };
