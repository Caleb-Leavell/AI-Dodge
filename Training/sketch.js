/*
Program Info
-Running this program will train a model based on the settings below
-The model is trained via reinforcement learning
-Note that this wasn't created to utilize a gpu for training so training may take a fair bit of time depending on settings (it seems to be O^n)
*/

//SETTINGS
const numOfGenerations = 500;
const numOfPlayersPerGeneration = 200;
const numOfFrames = [500,1000]; // min/max # of frames per generation
const numOfInputNodes = 8;
const numOfHiddenNodes = 6; //only one hidden layer
const numOfOutputNodes = 2;
const bias = 10;
const cWidth = 400;
const cHeight = 400;

//player variables are AI variables, not user variables
//also note that most x and y values defined here are 
//converted to pvectors when permitted by the program
let playerSize = 30,
  enemySize = 30;
let playerAccelX = 0,
  playerAccelY = 0;
let playerVelX = 0,
  playerVelY = 0;
let playerPosX = 50,
  playerPosY = 50;
let enemyAccelX = 0,
  enemyAccelY = 0;
let enemyVelX = 0,
  enemyVelY = 0;
let enemyPosX = 350 - enemySize,
  enemyPosY = 350 - enemySize;
let playerSpeed = [1,10], //min/max player/enemy speed in a generation
  enemySpeed = [1,10];
let currentEnemySpeed;

//OTHER VARS/ARRAYS
let enemyPos;
let enemyVel;
let enemyAccel;
let players = [];
let counter = 1;


//NODE CLASS
//instances of this are a single node, not the entire network
class Node {
  constructor(layer, edges) {
    this.layer = layer;
    this.value = 0;
    this.edges = edges;
  }
  doesFire(layer) {
    let sum = 0;
    for (let i = 0; i < layer.length; i++) {
      sum += layer[i].value * this.edges[i];
    }
    if (sum > bias) {
      this.value = 1;
    } else {
      this.value = 0;
    }
  }
}

function setup() {
  createCanvas(400, 400);
  random(enemySpeed[0],enemySpeed[1]);
  
  //initialize enemy vectors
  enemyPos = createVector(enemyPosX, enemyPosY);
  enemyVel = createVector(enemyVelX, enemyVelY);
  enemyAccel = createVector(enemyAccelX, enemyAccelY);
  
  let initSpeed = random(playerSpeed[0],playerSpeed[1]);
  //initialize player vectors and brain
  for (let i = 0; i < numOfPlayersPerGeneration; i++) {
    players.push({
      pos: createVector(playerPosX, playerPosY),
      vel: createVector(playerVelX, playerVelY),
      accel: createVector(playerAccelX, playerAccelY),
      brain: {
        input: [],
        hidden: [],
        output: []
      },
      points: 0,
      speed: initSpeed
    });
  }

  //construct neural network for each player
  for (let i = 0; i < players.length; i++) {
    
    //input layer
    for (let j = 0; j < numOfInputNodes; j++) {
      players[i].brain.input.push(new Node(0, []));
    }
    
    //hidden layer + edges between input and hidden
    for (let j = 0; j < numOfHiddenNodes; j++) {
      let edges = [];
      for (let k = 0; k < players[i].brain.input.length; k++) {
        edges.push(random(-100, 100));
      }
      players[i].brain.hidden.push(new Node(1, edges));
    }
    
    //output layer + edges between hidden and output
    for (let j = 0; j < numOfOutputNodes; j++) {
      let edges = [];
      for (let k = 0; k < players[i].brain.hidden.length; k++) {
        edges.push(random(-100, 100));
      }
      players[i].brain.output.push(new Node(2, edges));
    }
  }
}

function doFrame() {
  for(let i = 0; i < players.length; i ++) {
    let getPoints = 0; //num of points the player will get or lose

    //player inputs
    players[i].brain.input[0].value = players[i].pos.x;
    players[i].brain.input[1].value = players[i].pos.y;
    players[i].brain.input[2].value = enemyPos.x;
    players[i].brain.input[3].value = enemyPos.y;
    players[i].brain.input[4].value = players[i].vel.x;
    players[i].brain.input[5].value = players[i].vel.y;
    players[i].brain.input[6].value = enemyVel.x;
    players[i].brain.input[7].value = enemyVel.y;

    //determines which hidden nodes fire
    for (let j = 0; j < players[i].brain.hidden.length; j++) {
        players[i].brain.hidden[j].doesFire(players[i].brain.input);
    }
    
    //determines which output nodes fire
    for (let j = 0; j < players[i].brain.output.length; j++) {
      players[i].brain.output[j].doesFire(players[i].brain.hidden);
    }

    //player acceleration based on output nodes
    if (players[i].brain.output[0].value == 1) {
      players[i].accel.x = 1;
    } else {
      players[i].accel.x = -1;
    }
    if (players[i].brain.output[1].value == 1) {
      players[i].accel.y = 1;
    } else {
      players[i].accel.y = -1;
    }
    
    //player movement
    players[i].vel.add(players[i].accel);
    players[i].vel.limit(players[i].speed); //limit velocity
    players[i].pos.add(players[i].vel); 
    
    //player movement constraints (borders)
    //also a punishment for hitting the borders
    if (players[i].pos.x < 0) {
      players[i].pos.x = 0;
      getPoints -= 2;
    }
    if (players[i].pos.x > cWidth - playerSize) {
      players[i].pos.x = cWidth - playerSize;
      getPoints -= 2;
    }
    if (players[i].pos.y < 0) {
      players[i].pos.y = 0;
      getPoints  -= 2;
    }
    if (players[i].pos.y > cHeight - playerSize) {
      players[i].pos.y = cHeight - playerSize;
      getPoints -= 2;
    }
    
    //if player is hit by enemy
    let x = players[i].pos.x;
    let y = players[i].pos.y;
    let s = playerSize;
    let ex = enemyPos.x;
    let ey = enemyPos.y;
    let es = enemySize;
    if (x + s > ex && x < ex + es && y + s > ey && y < ey + es) {
      getPoints -= 4;
    }
    
    getPoints += 1/dist(x,y,ex,ey);
    
    //getPoints -= dist(x,y,cWidth / 2,cHeight / 2) / 200;
    players[i].points += getPoints; 
    
//ENEMY

  //pos/vel/accel calculations

  enemyAccel.add(createVector(random(-0.1, 0.1), random(-0.1, 0.1)));
  enemyAccel.limit(1);
  enemyVel.add(enemyAccel);
  enemyVel.limit(5);
  enemyPos.add(enemyVel);

  //constraints
  if (enemyPos.x < 0) {
    enemyPos.x = 0;
    enemyVel.x *= -1;
    enemyAccel.x *= -1;
  }
  if (enemyPos.x > width - enemySize) {
    enemyPos.x = width - enemySize;
    enemyVel.x *= -1;
    enemyAccel.x *= -1;
  }
  if (enemyPos.y < 0) {
    enemyPos.y = 0;
    enemyVel.y *= -1;
    enemyAccel.y *= -1;
  }
  if (enemyPos.y > height - enemySize) {
    enemyPos.y = height - enemySize;
    enemyVel.y *= -1;
    enemyAccel.y *= -1;
  }
    
  }
}


//returns the element of the player with the most points
function determineBestPlayer() {
  let bestPlayer = 0; //element in players list of player with most points
  
  //finds maximum points value in players list
  for(let i = 0; i < players.length; i ++) {
    if(players[i].points > players[bestPlayer].points) {
      bestPlayer = i;
    }
  }
  //console.log(players[bestPlayer].points)
  return bestPlayer;
}

//TO DO
//creates a new generation of players based on the best player of the current generation
function newGeneration(bestPlayer) {
  let newPos = createVector(random(0,cWidth - playerSize), random(0, cHeight - playerSize));
  let newSpeed = random(playerSpeed[0],playerSpeed[1]);
  
  for(let i = 0; i < players.length; i ++) {
    
    for (let j = 0; j < players[i].brain.hidden.length; j++) {
      for (let k = 0; k < players[i].brain.hidden[j].edges.length; k++) {
        let playerEdge = players[i].brain.hidden[j].edges[k];
        let bestEdge = players[bestPlayer].brain.hidden[j].edges[k];
        players[i].brain.hidden[j].edges[k] = (playerEdge + bestEdge) / 2
      }
    }

    for (let j = 0; j < players[i].brain.output.length; j++) {
      for (let k = 0; k < players[i].brain.output[j].edges.length; k++) {
        let playerEdge = players[i].brain.output[j].edges[k];
        let bestEdge = players[bestPlayer].brain.output[j].edges[k];
        players[i].brain.output[j].edges[k] = (playerEdge + bestEdge) / 2
      }
    }
    players[i].pos.x = newPos.x;
    players[i].pos.y = newPos.y;
    players[i].points = 0;
    players[i].speed = newSpeed;
  }
  currentEnemySpeed = random(enemySpeed[0],enemySpeed[1]);
  
}


//frames are not rendered to increase speed
function doGeneration() {
  //for loop is essentially a faster draw function that doesn't render anything
  for(let i = 0; i < floor(random(numOfFrames[0],numOfFrames[1])); i ++) {
    doFrame();
  }
}

function draw() {
if(counter >= 1) {
for(let i = 0; i < numOfGenerations; i ++) {
  doGeneration();
  newGeneration(determineBestPlayer());
  
}
  
  //format the weights into 2d lists and then print them to the console
  console.log("hidden:\n");
  let output = "[";
  let bestPlayer = determineBestPlayer();
  for (let i = 0; i < players[bestPlayer].brain.hidden.length; i++) {
    output = output.concat("[");
    for (let j = 0; j < players[bestPlayer].brain.hidden[i].edges.length; j++) {
      output = output.concat(players[bestPlayer].brain.hidden[i].edges[j]);
      if (j != players[bestPlayer].brain.hidden[i].edges.length-1) {
        output = output.concat(",");
      }
    }
    output = output.concat("]");
    if (i != players[bestPlayer].brain.hidden.length-1) {
      output = output.concat(",");
    }
  }
  output = output.concat("]");
  console.log(output);
  

  console.log("\n output:\n");
  output = "[";
  for (let i = 0; i < players[bestPlayer].brain.output.length; i++) {
    output = output.concat("[");
    for (let j = 0; j < players[bestPlayer].brain.output[i].edges.length; j++) {
      output = output.concat(players[bestPlayer].brain.output[i].edges[j]);
      if (j != players[bestPlayer].brain.output[i].edges.length-1) {
        output = output.concat(",");
      }
    }
    output = output.concat("]");
    if (i != players[bestPlayer].brain.output.length-1) {
      output = output.concat(",");
    }
  }
  output = output.concat("]");
  console.log(output);
}
 counter --;
}

