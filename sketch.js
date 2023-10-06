/*

Description
-This project was done as a learning experience. I have minimal AI training and am currently only in Calculus II, so the methods used here will most likely not be the best methods out there. This was mostly done to see if I could create a neural network from scratch in a language that most people wouldn't use for it before I start using libraries like PyTorch. Based on this, I would say the project is a success.

Program Info
The blue player is the AI. The AI has been tasked with avoiding hitting the red enemy (which moves randomly) but also to avoid hitting walls if possible. This means that for the AI to be perfectly successful it would have to never hit the enemy and never touch the walls.

Current Weaknesses
-to keep it from sitting still in a corner I rewarded it for maintaining a higher velocity, which I would prefer it to not have to do
-could still have improvements on dodging the enemy and not hitting the wall

Link to Training Program
https://editor.p5js.org/pimaster06/sketches/B7YVoPiwP
*/



//SETTINGS
  const numOfPlayersPerGeneration = 50;
  const numOfInputNodes = 8; //changing this will break the program
  const bias = 10;

  //Note: player is controlled by AI, not user
  let playerSize = 30, enemySize = 30;
  let playerAccelX = 0, playerAccelY = 0;
  let playerVelX = 0, playerVelY = 0;
  let playerPosX = 50, playerPosY = 50;
  let enemyAccelX = 0, enemyAccelY = 0;
  let enemyVelX = 0, enemyVelY = 0;
  let enemyPosX = 350 - enemySize, enemyPosY = 350 - enemySize;
  let playerSpeed = 5, enemySpeed = 4;
  let speedUp = 1;

  //Pre-Trained Weights
  let hiddenEdges =
[[-60.39530887169006,55.7557475764325,-10.751252796708513,-82.35622836651919,47.51270717391324,-11.893993890326769,25.334081883099167,80.38737981474196],[-44.65840662730065,-20.5311935654206,36.12422375857686,18.08174842451968,-78.50406069374793,53.89207747743349,-72.99522451124895,69.46757693998566],[-84.03845630085388,-44.754525596362214,-27.02652562626549,59.834453245971545,90.74038139904386,-29.955480305581936,41.88766567409236,7.432896705664266],[65.83028560131837,35.10598131448705,42.2141232189059,-0.7795609805810864,-1.9899175439492494,33.577212771275725,28.266724274560353,-43.40187479341856],[-56.842432166320165,47.00689885777585,-28.021992344289785,20.647712924780343,26.17307279320977,-43.81073854982526,-8.242925855186321,7.706928790655125],[88.26274987451893,-10.42042176995017,-88.2516910407011,12.039902852290925,36.74504436167848,-46.0497916103574,14.158330196096607,41.13755033710481]] ;
  let outputEdges =
[[83.89096984257503,62.60319637015455,24.70896850035289,-68.08706565938922,81.33275934675584,18.742351919417466],[18.74970030600013,80.48476291178116,18.741263928036595,-50.57521026000643,12.964957821746452,42.47901400475935]] ;

//OTHER VARS/ARRAYS
  let t = 0;


  let enemyPos;
  let enemyVel;
  let enemyAccel;
  let player = {};

//NODE CLASS
  class Node
  {
    constructor(layer,edges)
    {
      //takes an int, 0 for input, 1 for hidden 2 for output
      this.layer = layer;
      //input value or 0/1 if hidden or output node
      this.value = 0;
      //weights between this node and the layer before it, will be an array
      //(if input node it's an empty array)
      this.edges = edges;
    }
    doesFire(layer)
    {
      //adds up all the weights between the previous layer and this node
      //then checks if the sum is greater than the bias
      //if yes, then the node value = 1, 
      //if no, then the node value = 0
      //for output, 1 or 0 determines which direction it accelerates
      let sum = 0;
      for(let i = 0; i < layer.length; i ++)
      {
        sum += layer[i].value * this.edges[i];
      }
      if(sum > bias)
      {
        this.value = 1;
      }
      else
      {
        this.value = 0;
      }
    }
  }

function setup() {
createCanvas(400, 400);

//INITIALIZE PLAYER AND ENEMY
  enemyPos = createVector(enemyPosX,enemyPosY);
  enemyVel = createVector(enemyVelX,enemyVelY);
  enemyAccel= createVector(enemyAccelX,enemyAccelY);
  
  player = {
      pos:createVector(playerPosX,playerPosY),
      vel:createVector(playerVelX,playerVelY),
      accel:createVector(playerAccelX,playerAccelY),
      brain:
      {
        input: [],
        hidden: [],
        output: []
      },
      points:0
  }
  
  //creating the neural network and initializing it with
  //the pretrained weights
  for(let i = 0; i < numOfInputNodes; i ++)
  {
    player.brain.input.push(new Node(0,[]));
  }
  
  for(let i = 0; i < hiddenEdges.length; i ++)
  {
    player.brain.hidden.push(new Node(1,hiddenEdges[i]));
  }

  for(let i = 0; i < outputEdges.length; i ++)
  {
    player.brain.output.push(new Node(2, outputEdges[i]));
  }
}


function draw() {
  
//PLAYER
  
  //input values into the input layer
  player.brain.input[0].value = player.pos.x;
  player.brain.input[1].value = player.pos.y;
  player.brain.input[2].value = enemyPos.x;
  player.brain.input[3].value = enemyPos.y;
  player.brain.input[4].value = player.vel.x;
  player.brain.input[5].value = player.vel.y;
  player.brain.input[6].value = enemyVel.x;
  player.brain.input[7].value = enemyVel.y;
  
  //hidden node processes inputs
  for(let j = 0; j < player.brain.hidden.length; j ++)
  {
    player.brain.hidden[j].doesFire(player.brain.input);
  }
  
  //ouput nodes process hidden layer
  for(let j = 0; j < player.brain.output.length; j ++)
  {
    player.brain.output[j].doesFire(player.brain.hidden);
  }
    
  //acceleration based on output values
  if(player.brain.output[0].value == 1)
  {
    player.accel.x = 1; //accelerate right
  }
  else
  {
    player.accel.x = -1; //accelerate left
  }
  if(player.brain.output[1].value == 1)
  {
    player.accel.y = 1; //accelerate down
  }
  else
  {
    player.accel.y = -1; //accelerate up
  }
  
  //do vector addition to handle player movement
  player.vel.add(player.accel);
  player.vel.limit(playerSpeed);
  player.pos.add(player.vel);
  
  //constraints (so it can't leave the canvas)
  if(player.pos.x < 0)
  {
    player.pos.x = 0;

  }
  if(player.pos.x > width - playerSize)
  {
    player.pos.x = width - playerSize;

  }
  if(player.pos.y < 0)
  {
    player.pos.y = 0;

  }
  if(player.pos.y > height - playerSize)
  {
    player.pos.y = height - playerSize;

  }
  
//ENEMY
  
  //pos/vel/accel calculations to handle movement
  enemyAccel.add(createVector(random(-0.1,0.1),random(-0.1,0.1)));
  enemyAccel.limit(1);
  enemyVel.add(enemyAccel);
  enemyVel.limit(5 * speedUp);
  enemyPos.add(enemyVel);
  
  //constraints
  if(enemyPos.x < 0)
  {
    enemyPos.x = 0;
    enemyVel.x *= -1;
    enemyAccel.x *= -1;
  }
  if(enemyPos.x > width - enemySize)
  {
    enemyPos.x = width - enemySize;
    enemyVel.x *= -1;
    enemyAccel.x *= -1;
  }
  if(enemyPos.y < 0)
  {
    enemyPos.y = 0;
    enemyVel.y *= -1;
    enemyAccel.y *= -1;
  }
  if(enemyPos.y > height - enemySize)
  {
    enemyPos.y = height - enemySize;
    enemyVel.y *= -1;
    enemyAccel.y *= -1;
  }
  
//DRAW
  background(220);
  noStroke();
  
  //enemy
  fill(200,0,0);
  rect(enemyPos.x,enemyPos.y,enemySize,enemySize);
  
  //player
  fill(0,0,200,255);
  rect(player.pos.x,player.pos.y,playerSize,playerSize);
}
