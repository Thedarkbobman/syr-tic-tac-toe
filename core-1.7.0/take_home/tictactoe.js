import {
  Component,
  Render,
  View,
  Dimensions,
  Animated,
  Text,
  Button,
  Image,
  TouchableOpacity,
  LinearGradient,
  PixelRatio,
  Platform,
  NativeModules,
  TextView
} from '@syr/core';

import { MoveMaker, PlayerType } from './tttalgo.js';
require('./tttalgo.js');

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const offset = 100;
const thickness = 10;
var styles = [];

const TILE_TYPE = {
  NONE: 0,
  X: 1,
  O: 2
};

class Tile {
  constructor() {
    this.type = TILE_TYPE.NONE;
  }
  select(type) {
    this.type = type;
  }
}
class GameState {
  constructor() {
    this.tiles = [];
    this.endWindows = [];
    for (let i = 0; i < 3; i++) {
      this.tiles[i] = [];
      for (let j = 0; j < 3; j++) {
      this.tiles[i].push(new Tile());
      }
    }
  
    this.playerType = PlayerType.O;
    this.moveMaker = new MoveMaker(this.playerType*-1);
  }
  attach(component) {
    this.ttt = component;
  }
}
const gameState = new GameState();

const Styles = {
  backgroundView: {
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#FFFFFF'
  },
  verticalLine: function(n) {
    //board divides into thirds
    if (n < 0 || n > 1) {
      throw 'Invalid Vertical Line Number (must be 0 or 1)';
    }

    const leftEdgeOffset = (screenWidth / 3) * (n + 1);
    const color = '#000000';
    return {
      height: screenHeight - offset,
      width: thickness,
      top: offset / 2,
      left: leftEdgeOffset,
      backgroundColor: color
    };
  },
  horizontalLine: function(n) {
    //board divides into thirds
    if (n < 0 || n > 1) {
      throw 'Invalid Vertical Line Number (must be 0 or 1)';
    }
    const topEdgeOffset = (screenHeight / 3) * (n + 1);

    const color = '#000000';

    return {
      height: thickness,
      width: screenWidth - offset,
      top: topEdgeOffset,
      left: offset / 2,
      backgroundColor: color
    };
  }
};

const tile = {
  set: false,
  type: TILE_TYPE.NONE
};

function calculateTileStyle(n) {
  let topOffset;
  let leftOffset;
  console.log('tile');

  switch (n[0]) {
    case 0:
      topOffset = offset / 2;
      break;
    case 1:
      let horzStyle = Styles.horizontalLine(0);
      console.log(horzStyle.top + thickness);
      console.log(offset / 2 + (screenHeight - offset) / 3);
      topOffset = horzStyle.top + thickness + offset / 4;
      //topOffset = offset/2+(screenHeight - offset) / 3;
      break;
    case 2:
      horzStyle = Styles.horizontalLine(1);
      topOffset = horzStyle.top + thickness;
      //topOffset = offset/2+2*(screenHeight - offset) / 3+3*thickness;
      break;
  }
  switch (n[1]) {
    case 0:
      leftOffset = offset / 4;
      break;
    case 1:
      let vertStyle = Styles.verticalLine(0);
      leftOffset = vertStyle.left + thickness + offset / 4;
      //leftOffset = offset/2+(screenWidth - offset) / 3;
      break;
    case 2:
      vertStyle = Styles.verticalLine(1);
      leftOffset = vertStyle.left + thickness + offset / 4;
      //leftOffset = offset/2+2*(screenWidth - offset) / 3;
      break;
  }
  console.log('for ' + n + ' x: ' + leftOffset + '; y:' + topOffset);
  return {
    height: (screenHeight - offset) / 3 - thickness,
    width: (screenWidth - offset) / 3 - thickness,
    top: topOffset,
    left: leftOffset
  };
}


class EndScreenComponent extends Component{
  render(){
    let message = this.props.key;
    return (<View style = {{backgroundColor:"#EEEEEE", borderWidth:4, height:100, width:200,left: screenWidth/2, top:screenHeight/2}}>
    <Text>{message}</Text>
    <Button onPress={() => this.onClick()} style={{height:50, width:100, borderRadius:15, backgroundColor:"#e91e63"}}>New Game</Button>
    </View>);
  }
  onClick(){
    console.log("new Game Button");
  }
}


class TileComponent extends Component {
  render() {
    let k = this.props.key;
    let n = [k%3, Math.floor(k/3)];
    let tileStyle = calculateTileStyle(n);
    console.log("done styles")
    let image = null;
    console.log(n);
    //console.log(gameState.tiles)
    console.log(gameState.tiles[n[0]][n[1]])
    switch (gameState.tiles[n[0]][n[1]].type) {
      case TILE_TYPE.NONE:
        return (
          <TouchableOpacity
            onPress={() => this.onClick(n)}
            style={tileStyle}
          />
        );
      case TILE_TYPE.X:
        image = (
          <Image
            source={{ uri: 'icon_profile_phantom_black' }}
            style={{
              width: tileStyle.width - thickness,
              height: tileStyle.height - thickness
            }}
          />
        );
        break;
      case TILE_TYPE.O:
        image = (
          <Image
            source={{ uri: 'icon_chevron_forward_blue' }}
            style={{
              width: tileStyle.width - thickness,
              height: tileStyle.height - thickness
            }}
          />
        );
        break;
    }

    return <TouchableOpacity style={tileStyle}>{image}</TouchableOpacity>;
  }
  onClick(n) {
    console.log('hit ' + n);
    let tileType;
    switch (gameState.playerType) {
      case PlayerType.O:
        tileType = TILE_TYPE.O;
        break;
      case PlayerType.X:
        tileType = TILE_TYPE.X;
        break;
    }
    gameState.tiles[n[0]][n[1]].select(tileType);
    gameState.moveMaker.updateBoard(
      gameState.playerType,
      n[0],
      n[1]
    );
    let final = gameState.moveMaker.isFinalGameState(gameState.moveMaker.board);
    
    if(final){
      let message = "";
      if(gameState.moveMaker.winner(gameState.moveMaker.board, this.playerType)){
        //player won
        message = "You Won!!!";
      }
      else if(gameState.moveMaker.winner(gameState.moveMaker.board, this.playerType*-1)){
        //ai won
        message = "The Computer Won :(";
      }
       else {
        //it is a filled board with no winners so it is a tie
        message = "The Game was a Tie";
       }
       gameState.endWindows.push(<EndScreenComponent key={message}/>);
    }
    else{
      tileType;
      switch (gameState.playerType) {
        case PlayerType.O:
          tileType = TILE_TYPE.X;
          break;
        case PlayerType.X:
          tileType = TILE_TYPE.O;
          break;
      }
      let nextMove = gameState.moveMaker.nextMove();
      gameState.tiles[nextMove[0]][nextMove[1]].select(tileType);
    }
    Render(TicTacToe);
  }
}


class TicTacToe extends Component {
  constructor(props) {
    super(props);
    gameState.attach(this);
    console.log('constructor');
    this.state.tiles = [];
    for (let i = 0; i < 9; i++) {
      //for (let j = 0; j < 3; j++) {
      this.state.tiles.push(<TileComponent key={i} />);
      //}
    }

    console.log(
      'horz1 top:' +
        Styles.horizontalLine(0).top +
        '; horz2 top: ' +
        Styles.horizontalLine(1).top
    );
    console.log(this.state.tiles);
  }
  render() {
    console.log('render beginning');

    console.log(this.state.tiles);
    
    return (
      <View style={Styles.backgroundView}>
        <View style={Styles.horizontalLine(0)} />
        <View style={Styles.horizontalLine(1)} />
        <View style={Styles.verticalLine(0)} />
        <View style={Styles.verticalLine(1)} />
        {this.state.tiles}
        {gameState.endWindows}
      </View>
    );
  }
}


Render(TicTacToe);
