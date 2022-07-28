const modelURL = 'https://teachablemachine.withgoogle.com/models/yVFRmlMpf/';

const checkpointURL = modelURL + "model.json";

const metadataURL = modelURL + "metadata.json";


const flip = true; 

let h1 = document.getElementsByTagName('h1')[0];
let start = document.getElementById('strt');
let stop = document.getElementById('stp');
let reset = document.getElementById('rst');
let sec = 0;
let mine = 0;
let hrs = 0;
let t;
let model;
let totalClasses;  
let myCanvas;
let classification = 'wait...'
let probability = "100";
let poser;
let video;
let song;
let poseNet;
let poses = [];


function tick(){
    sec++;
    if (sec >= 60) {
        sec = 0;
        mine++;
        if (mine >= 60) {
            mine = 0;
            hrs++;
        }
    }
}

function add() {
    tick();
    h1.textContent = (hrs > 9 ? hrs : "0" + hrs)
        	 + ":" + (mine > 9 ? mine : "0" + mine)
       		 + ":" + (sec > 9 ? sec : "0" + sec);
    timer();
}

function timer() {
    t = setTimeout(add, 1000);
}

timer();
start.onclick = timer;
stop.onclick = function() {
    clearTimeout(t);
}
reset.onclick = function() {
    h1.textContent = "00:00:00";
    sec = 0; min = 0; hrs = 0;
}

function preload(){
  song = loadSound("morning_call.mp3");
}

function song1(){
  if(classification == "sleep!"){
    song.play();
  }
  else if(classification == "sleep!!"){
    song.play();
  }
  else if(classification == "none")
    song.stop();
}



async function load() {
  model = await tmPose.load(checkpointURL, metadataURL);
  totalClasses = model.getTotalClasses();
}

async function setup() {
  myCanvas = createCanvas(480, 400);
  videoCanvas = createCanvas(480, 400)
  await load();
  video = createCapture(video, videoReady);
  video.size(480, 400);
  video.hide();
  
  poseNet = ml5.poseNet(video, videoReady);

  poseNet.on('pose', function(results) {
    poses = results;
  });
}
function draw() {
  song1();
  background(255);
  if(video) image(video,0,0);
  fill(0,0,255)
  textSize(20);
  text("situation:" + classification, 0, 15);
  drawKeypoints();
  drawSkeleton();
  
}
  
  if (poser) { 
    
    for (var i = 0; i < poser.length; i++) {
      let x = poser[i].position.x;
      let y = poser[i].position.y;
      ellipse(x, y, 5, 5);
      text(poser[i].part, x + 4, y);
      
    }
  
}

function videoReady() {
  console.log("Video Ready");
  predict();
  select('#status');
  
}

async function predict() {
 
  const flipHorizontal = false;
  const {
    pose,
    posenetOutput
  } = await model.estimatePose(
    video.elt, 
    flipHorizontal
  );
 
  const prediction = await model.predict(
    posenetOutput,
    flipHorizontal,
    totalClasses
  );

  const sortedPrediction = prediction.sort((a, b) => -a.probability + b.probability);

  classification = sortedPrediction[0].className;
  probability = sortedPrediction[0].probability.toFixed(2);
  if (pose) poser = pose.keypoints; 
  predict();
  
}

function drawKeypoints()  {
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
     
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}


function drawSkeleton() {
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
  
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}

