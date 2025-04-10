// I tried my best to make sure i comment and explain everything so that people understand it better
// This canvas is used for the main render
const drawCanvas = document.getElementById("drawObj");
const ctx = drawCanvas.getContext("2d");
// Set up the canvas width to fill the window screen
drawCanvas.width = window.innerWidth;
drawCanvas.height = window.innerHeight;
// This canvas is specifically used for grabbing the image pixel data.
const dataCanvas = document.getElementById("pixelInfo");
const idx = dataCanvas.getContext("2d");
// Create an object with all of the games assets. This way i can still keep other object names the same as asset names.
let objects = {
  hand: new Image(),
  player: new Image(),
  enviroment: new Image(),
};
// Create the data that will be used to store pixel data, distance data, direction data, and load count data
let data = {
  distance: 0,
  direction: 0,
  assets: 0,
  ensure: 0,
  player: 0,
  hand: 0,
  enviroment: 0,
}
// Loop until all assets load
function loadAssets() {
  if (data.assets >= 3) {
    player.x = 0;
    player.y = -800;
    player.sx = 0;
    player.sy = -15;
    scroll.x = player.x;
    scroll.y = player.y;
    // prevent spawning in level
    hand.x = player.x;
    hand.y = player.y;
    requestAnimationFrame(gameLoop);
    return;
  } else {
    initObjects();
    requestAnimationFrame(loadAssets);
  }
}
// call
requestAnimationFrame(loadAssets);
// Function to load in assets
function initObjects() {
  if (!(objects.player.src === "./assets/Player Hitbox.png")) {
    objects.player.src = "./assets/Player Hitbox.png";
    objects.hand.src = "./assets/Hand Hitbox.png";
    objects.enviroment.src = "./assets/Basic Level.png";
  }
  objects.player.onload = function() {
    data.assets += 1;
    let dataW = Math.max(objects.player.width, objects.enviroment.width);
    let dataH = Math.max(objects.player.height, objects.enviroment.height);
    if (dataCanvas.width !== dataW || dataCanvas.height !== dataH) {
      dataCanvas.width = dataW;
      dataCanvas.height = dataH;
    }
    idx.clearRect(0, 0, dataW, dataH);
    idx.drawImage(objects.player, 0, 0);
    data.player = idx.getImageData(0, 0, objects.player.width, objects.player.height).data;
  }
  objects.hand.onload = function() {
    data.assets += 1;
    let dataW = Math.max(objects.hand.width, objects.enviroment.width);
    let dataH = Math.max(objects.hand.height, objects.enviroment.height);
    if (dataCanvas.width !== dataW || dataCanvas.height !== dataH) {
      dataCanvas.width = dataW;
      dataCanvas.height = dataH;
    }
    idx.clearRect(0, 0, dataW, dataH);
    idx.drawImage(objects.hand, 0, 0);
    data.hand = idx.getImageData(0, 0, objects.hand.width, objects.hand.height).data;
  }
  objects.enviroment.onload = function() {
    data.assets += 1;
    let dataW = Math.max(objects.enviroment.width, objects.enviroment.width);
    let dataH = Math.max(objects.enviroment.height, objects.enviroment.height);
    if (dataCanvas.width !== dataW || dataCanvas.height !== dataH) {
      dataCanvas.width = dataW;
      dataCanvas.height = dataH;
    }
    idx.clearRect(0, 0, dataW, dataH)
    idx.drawImage(objects.enviroment, 0, 0)
    data.enviroment = idx.getImageData(0, 0, objects.enviroment.width, objects.enviroment.height).data
  }
}
// Create variable objects
let center = {
  x: drawCanvas.width / 2,
  y: drawCanvas.height / 2,
};
let scroll = {
  x: 0,
  y: 0,
  speed: 2,
};
let hand = {
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
};
let player = {
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
  sx: 0,
  sy: 0,
  armLen: 125,
};
let control = {
  trueX: 0,
  trueY: 0,
  mouseX: 0,
  mouseY: 0,
};
// Control
function setPointer(mx, my) {
  // subtract width so theres no offset
  control.trueX = mx - objects.hand.width / 2;
  control.trueY = my - objects.hand.height / 2;
}
// Grab mouse position on desktop and mobile
function getPointer(i) {
  if (i.type === "mousemove") {
    setPointer(i.clientX, i.clientY);
  } else if (i.type === "touchmove") {
    setPointer(i.touches[0].clientX, i.touches[0].clientY);
    i.preventDefault();
  }
}
// Turning off passive helps for mobile i think
document.addEventListener("mousemove", getPointer);
document.addEventListener("touchmove", getPointer, { passive: false });
// Calculating angles in javascript is easy ngl
function pointTo(x1, y1, x2, y2) {
  let xx = x1 - x2;
  let yy = y1 - y2;
  data.direction = Math.atan2(yy, xx);
}
// simple geometry
function getDistance(x1, y1, x2, y2) {
  let xx = Math.pow(x1 - x2, 2);
  let yy = Math.pow(y1 - y2, 2);
  data.distance = Math.sqrt(xx + yy);
}
// Pixel perfect detection that took too long to make
// hand and player are seperated because i dont feel like making tons of if else statements
// is hand touching the enviroment?
function senseHandTouch(obj, x, y) {
  // Gather object border data
  let objLeft = Math.floor(x - obj.width / 2);
  let objTop = Math.floor(y - obj.height / 2);
  let objRight = objLeft + obj.width;
  let objBottom = objTop + obj.height;
  let envLeft = Math.floor(-scroll.x + center.x - objects.enviroment.width / 2);
  let envTop = Math.floor(-scroll.y + center.y - objects.enviroment.height / 2);
  let envRight = envLeft + objects.enviroment.width;
  let envBottom = envTop + objects.enviroment.height;
  let overlapLeft = Math.max(objLeft, envLeft);
  let overlapTop = Math.max(objTop, envTop);
  let overlapRight = Math.min(objRight, envRight);
  let overlapBottom = Math.min(objBottom, envBottom);
  // check if the hand is within the border of the enviroment
  if (overlapLeft >= overlapRight || overlapTop >= overlapBottom) {
    return false; // if not, theres no collision
  }
  let dataW = Math.max(obj.width, objects.enviroment.width);
  let dataH = Math.max(obj.height, objects.enviroment.height);
  if (dataCanvas.width !== dataW || dataCanvas.height !== dataH) {
    dataCanvas.width = dataW;
    dataCanvas.height = dataH;
  }
  // search surrounding pixels
  for (let y1 = overlapTop; y1 < overlapBottom; y1 += 1) {
    for (let x1 = overlapLeft; x1 < overlapRight; x1 += 1) {
      let ox = x1 - objLeft;
      let oy = y1 - objTop;
      let ex = x1 - envLeft;
      let ey = y1 - envTop;
      // see if the pixels overlap
      if (ox <= 1 || ox >= obj.width - 2 || oy <= 1 || oy >= obj.height - 2) {
        let i1 = (oy * obj.width + ox) * 4;
        let i2 = (ey * objects.enviroment.width + ex) * 4;
        if (data.hand[i1 + 3] > 0 && data.enviroment[i2 + 3] > 0) {
          return true;
        }
      }
    }
  }
  return false;
}
// is player touching the enviroment?
function sensePlayerTouch(obj, x, y) {
  // Gather object border data
  let objLeft = Math.floor(x - obj.width / 2);
  let objTop = Math.floor(y - obj.height / 2);
  let objRight = objLeft + obj.width;
  let objBottom = objTop + obj.height;
  let envLeft = Math.floor(-scroll.x + center.x - objects.enviroment.width / 2);
  let envTop = Math.floor(-scroll.y + center.y - objects.enviroment.height / 2);
  let envRight = envLeft + objects.enviroment.width;
  let envBottom = envTop + objects.enviroment.height;
  let overlapLeft = Math.max(objLeft, envLeft);
  let overlapTop = Math.max(objTop, envTop);
  let overlapRight = Math.min(objRight, envRight);
  let overlapBottom = Math.min(objBottom, envBottom);
  // check if the hand is within the border of the enviroment
  if (overlapLeft >= overlapRight || overlapTop >= overlapBottom) {
    return false; // if not, theres no collision
  }
  let dataW = Math.max(obj.width, objects.enviroment.width);
  let dataH = Math.max(obj.height, objects.enviroment.height);
  if (dataCanvas.width !== dataW || dataCanvas.height !== dataH) {
    dataCanvas.width = dataW;
    dataCanvas.height = dataH;
  }
  // search surrounding pixels
  for (let y1 = overlapTop; y1 < overlapBottom; y1 += 1) {
    for (let x1 = overlapLeft; x1 < overlapRight; x1 += 1) {
      let ox = x1 - objLeft;
      let oy = y1 - objTop;
      let ex = x1 - envLeft;
      let ey = y1 - envTop;
      // see if the pixels overlap
      if (ox <= 1 || ox >= obj.width - 2 || oy <= 1 || oy >= obj.height - 2) {
        let i1 = (oy * obj.width + ox) * 4;
        let i2 = (ey * objects.enviroment.width + ex) * 4;
        if (data.player[i1 + 3] > 0 && data.enviroment[i2 + 3] > 0) {
          return true;
        }
      }
    }
  }
  return false;
}
// call functions that move the objects
// Move player to target, if it collides with the enviroment, it moves backwards
function movePlayer() {
  // Point to the target
  pointTo(player.tx, player.ty, player.x, player.y);
  // get the distance
  getDistance(player.tx, player.ty, player.x, player.y);
  // repeat distance
  for (let i = 0; i < Math.floor(data.distance); i ++) {
    // move x
    player.x += Math.cos(data.direction);
    let isCollide = sensePlayerTouch(objects.player, player.x - scroll.x + center.x, player.y - scroll.y + center.y);
    if (isCollide === true) {
      // if it touches, move back
      player.x -= Math.cos(data.direction);
    }
    // move y
    player.y += Math.sin(data.direction);
    isCollide = sensePlayerTouch(objects.player, player.x - scroll.x + center.x, player.y - scroll.y + center.y);
    if (isCollide === true) {
      // if it touches, move back
      player.y -= 1 * Math.sin(data.direction);
      // prevent gravity from acting upon the player
      player.sy = 0;
    }
  }
}
// Move hand to target, if it collides with the enviroment, it moves backwards
function moveHand(force) {
  // Point to the target
  pointTo(hand.tx, hand.ty, hand.x, hand.y);
  // get the distance
  getDistance(hand.tx, hand.ty, hand.x, hand.y);
  // repeat distance
  for (let i = 0; i < Math.floor(data.distance); i ++) {
    // move x and y together, idk why but if you move them one at a time the hand doesnt stick
    hand.x += Math.cos(data.direction);
    hand.y += Math.sin(data.direction);
    let isCollide = senseHandTouch(objects.hand, hand.x - scroll.x + center.x, hand.y - scroll.y + center.y);
    if (isCollide === true) {
      // if it touches, move back
      hand.x -= Math.cos(data.direction);
      // push player target back and player sx back
      player.tx -= Math.cos(data.direction);
      player.sx -= force * Math.cos(data.direction);
    }
    // check if its still in the level, if so, move out
    isCollide = senseHandTouch(objects.hand, hand.x - scroll.x + center.x, hand.y - scroll.y + center.y);
    if (isCollide === true) {
      // if it touches, move back
      hand.y -= 1 * Math.sin(data.direction);
      // push player target back and player sy back
      player.ty -= Math.sin(data.direction);
      player.sy -= force * Math.sin(data.direction);
    }
  }
}
function draw(img, x, y) {
  ctx.drawImage(img, x - img.width / 2 - scroll.x + center.x, y - img.height / 2 - scroll.y + center.y);
}
function gameLoop() {
  ctx.clearRect(0, 0, center.x * 2, center.y * 2);
  player.sx *= 0.95;
  player.sy += 1.1;
  if (player.sy < -24) {
    player.sy = -24;
  } else if (player.sy > 24) {
    player.sy = 24;
  }
  // apply force
  player.tx += player.sx;
  player.ty += player.sy;
  // first collision
  movePlayer();
  // set again
  player.tx = player.x;
  player.ty = player.y;
  // control hand stuff
  control.mouseX = control.trueX - center.x + player.x;
  control.mouseY = control.trueY - center.y + player.y;
  pointTo(player.x, player.y, control.mouseX, control.mouseY);
  getDistance(control.mouseX, control.mouseY, player.x, player.y);
  // if hand is too far from the player, move back
  if (player.armLen < data.distance) {
    var step = data.distance - player.armLen;
    control.mouseX += step * Math.cos(data.direction);
    control.mouseY += step * Math.sin(data.direction);
  }

  hand.tx = control.mouseX;
  hand.ty = control.mouseY;
  moveHand(0.4);
  movePlayer();
  // update tx for next frame
  player.tx = player.x;
  player.ty = player.y;
  // follow the player
  scroll.x += (player.x - scroll.x) / scroll.speed;
  scroll.y += (player.y - scroll.y) / scroll.speed;
  // render in this order for the correct layering
  draw(objects.enviroment, 0, 0);
  draw(objects.player, player.x, player.y);
  draw(objects.hand, hand.x, hand.y);
  // loop
  requestAnimationFrame(gameLoop);
}
