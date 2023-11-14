// Classifier Variable
let classifier;
// Model URL
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/sxAFIZvBT/';

// Video
let video;
let flippedVideo;
// To store the classification
let label = "";

let bird;
let obstacles = [];
let spacing = 150;
let gameOver = false;

function preload() {
  classifier = ml5.imageClassifier(imageModelURL + 'model.json');
}

function setup() {
  createCanvas(640, 480);
  bird = new Bird();

  // 创建视频捕获
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // 开始分类视频
  classifyVideo();
}

function draw() {
  background(0);

  // 绘制视频作为背景
  image(video, 0, 0);

  if (!gameOver) {
    // 仅当识别到“Up”标签时上升
    if (label === 'Up') {
      bird.up();
    }else if (label === 'Down') {
      // 当识别到“Down”标签时，可以让小鸟下降
      bird.down();
    }

    bird.update();
    bird.show();

    if (frameCount % spacing == 0) {
      obstacles.push(new Obstacle());
    }

    // 更新障碍物并检查碰撞
    for (let obs of obstacles) {
      obs.update();
      obs.show();

      if (bird.hits(obs)) {
        console.log("Game Over");
        gameOver = true;
        noLoop();
      }
    }
  }

  // 显示分类标签
  fill(255);
  textSize(32);
  textAlign(CENTER);
  text(label, width / 2, height - 16);
}

function classifyVideo() {
  flippedVideo = ml5.flipImage(video);
  classifier.classify(flippedVideo, gotResults);
  flippedVideo.remove();
}

function gotResults(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  label = results[0].label;
  classifyVideo();
}

class Bird {
  constructor() {
    this.y = height / 2;
    this.x = 150; // 小鸟的初始位置向左移动
    this.gravity = 0.3; // 调整重力值以改变下降速度
    this.lift = -5; // 调整上升速度
    this.velocity = 0;
  }

  up() {
    this.velocity += this.lift / 3;
  }
  down() {
    this.velocity -= this.lift; // 下降速度可以比上升速度慢一些
  }
  update() {
    this.velocity += this.gravity;
    this.velocity *= 0.9; // 添加一些阻尼效果
    this.y += this.velocity;
    this.y = constrain(this.y, 0, height);
  }

  show() {
    fill(255);
    ellipse(this.x, this.y, 32, 32);
  }

  hits(obstacle) {
    return (this.y < obstacle.top || this.y > height - obstacle.bottom) &&
           (this.x > obstacle.x && this.x < obstacle.x + obstacle.w);
  }
}

class Obstacle {
  constructor() {
    this.top = random(height / 6, 3 / 4 * height);
    this.bottom = height - (this.top + spacing);
    this.x = width;
    this.w = 40;
    this.speed = 3;
  }

  update() {
    this.x -= this.speed;
  }

  show() {
    fill(255);
    rect(this.x, 0, this.w, this.top);
    rect(this.x, height - this.bottom, this.w, this.bottom);
  }
}
