
// use alert() and console.log() to debug

var canvas = document.getElementById('mainCanvas'),
    context = canvas.getContext('2d');

var imageLoader = document.getElementById('backgroundImage');
imageLoader.addEventListener('change', makeBase, false);

// mode indicators
var movePointCond = false;
var reverseCond = false;
var rulerCoords = [false];  // initiate array to store the coordinates and state of the ruler
var mirrorModeState = 0;  // 0 -> none; 1 -> horizontal; 2 -> vertical
var realWidth = 7.5;  // the real width (in meters) of the field which is represented by the canvas
var realHeight = 4.0;  // the real height (in meters) of the field which is represented by the canvas
var img;

var pointInfo = [];


//---------------------- canvas interaction ----------------------
canvas.addEventListener('click', function (evt) { // left click listener
      
    var mousePos = getMousePos(canvas, evt);  // get the coordinates of the mouse

    if (rulerCoords[0] === false) { // check whether a regular point or a ruler should be drawn
        // add a regular point
        pointInfo.push([]);
        pointInfo[pointInfo.length - 1] = [mousePos.x, mousePos.y, reverseCond];
    } else if (rulerCoords.length < 3) { // check if the ruler is active and there are a at most two points  
        rulerCoords.push([mousePos.x, mousePos.y]);
        refresh(context);
          drawPoints(context);
          drawRuler(context, rulerCoords[1][0], rulerCoords[1][1], rulerCoords[2][0], rulerCoords[2][1]);
          rulerCoords = [true];
        }

>>>>>>> parent of f16d110... added functionality to the mirrorPath button.
        drawPoints(context);
        drawRuler(context, rulerCoords[1][0], rulerCoords[1][1], rulerCoords[2][0], rulerCoords[2][1]);
        rulerCoords = [true]; 
    }

    drawPoints(context);
    alert("working");
}, false
);

//---------------------- buttons ----------------------

// taken from http://jsfiddle.net/influenztial/qy7h5/
function makeBase(e){ 
    var reader = new FileReader();
    reader.onload = function(event){
        img = new Image();
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
      }
      img.src = event.target.result;
      }
    reader.readAsDataURL(e.target.files[0]);
    clearCanvas();
}



function deletePoint() {
    pointInfo.pop();

    context.fillStyle = "white"; // change later to background image from makebase instead of white
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawPoints(context);
}


function movePoint(Btn) { // not finished; need to implement moving point
  movePointCond ^= 1; // flip bool
  if (movePointCond) { Btn.style.backgroundColor = 'gray'; } else { Btn.style.backgroundColor = ''; } // reset to default colour
}

function rulerMode(Btn) {
  if (rulerCoords[0] === false) {
        Btn.style.backgroundColor = 'lightgray';
        rulerCoords[0] = true;
    } else {
        Btn.style.backgroundColor = '';
        rulerCoords[0] = false;
    }
}

function mirrorMode(Btn) {
    mirrorModeState = (mirrorModeState + 1) % 3; // advance mirror mode to next state
    if (mirrorModeState === 1) { Btn.style.backgroundColor = 'lightgray'; } // horizontal mirror mode
  else if (mirrorModeState === 2)
    { Btn.style.backgroundColor = 'gray'; } // vertical mirror mode
        else {Btn.style.backgroundColor = ''; } // reset to default colour

  drawPoints(context);
}


function mirrorPath() {
<<<<<<< HEAD
  var mirrorPointInfo = JSON.parse(JSON.stringify(pointInfo));  // clone the point locations into a new reversed array
  mirrorPointInfo.reverse();

  if (mirrorModeState === 1) {
  for (i = 0; i < mirrorPointInfo.length; i++)  // mirror points vertically
    {mirrorPointInfo[i][1] += 2 * (parseInt(canvas.height / 2) - mirrorPointInfo[i][1]);}
  } 
      
  else if (mirrorModeState == 2)
  {
  for (i = 0; i < mirrorPointInfo.length; i++)  // mirror points horizontally
    {mirrorPointInfo[i][0] += 2 * (parseInt(canvas.width / 2) - mirrorPointInfo[i][0]);}
  }
  
  else
    {mirrorPointInfo = [];}
  
  
  pointInfo = pointInfo.concat(mirrorPointInfo);  // add the mirrored points to the end of the pointInfo array
  drawPoints(context);
=======

>>>>>>> parent of f16d110... added functionality to the mirrorPath button.
}


function GetPathInfo() {
  
}


function setSegment() {

}


function reverseMode(Btn) {
  reverseCond ^= 1; // flip bool
  if (reverseCond)
    { Btn.style.backgroundColor="gray"; }
  else
    { Btn.style.backgroundColor=''; } // reset to default colour
}


function clearCanvas() {
  pointInfo = [];
  alert(typeof(img.src)); // debugging; remove later.
  if (typeof(img.src) == string) // if the image is active
  {
    canvas.width = img.width;
    canvas.height = img.height;
     context.drawImage(img,0,0);
  }
  
  else // otherwise (if the image is not active) 
  {
    context.fillStyle = "white"; // change later to background image from makebase instead of white
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  drawPoints(context);
}

//---------------------- miscellaneous ----------------------

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function refresh(context) { // a bit like clear canvas but retains information that clear canvas erases
  alert(typeof(img.src)); // debugging; remove later.
  if (typeof(img.src) == string) // if the image is active
  {
    canvas.width = img.width;
    canvas.height = img.height;
     context.drawImage(img,0,0);
  }
      
  else // otherwise (if the image is not active) 
  {
    context.fillStyle = "white"; // change later to background image from makebase instead of white
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawPoints(context) {
    //alert("working");
    refresh(context);
    var start = true;
    var lastPoint = pointInfo[0]; // save the last point at any given time for the arrow's orientation
    context.beginPath();
    
 /*   pointInfo.forEach((element) => {
        if (!start)
        {
        if (!element[2]) // check if reverse mode is toggled
          { arrowTo(context,lastPoint[0],lastPoint[1],element[0],element[1]); }
        else
          { arrowToReverse(context,lastPoint[0],lastPoint[1],element[0],element[1]); }
        lastPoint = element;
        }
        start = false;
    })  not working fix later */ 
    
    context.stroke();

    drawMirror(context, canvas.width, canvas.height);  // draw mirror
}

function drawMirror(context, width, height) {

    context.beginPath();
    if (mirrorModeState == 1)
      {
        context.moveTo(0,height/2);
        context.lineTo(width,height/2);
      }
    else if (mirrorModeState == 2)
      {
        context.moveTo(width/2,0);
        context.lineTo(width/2,height);
      }
    context.stroke();
}

//  taken from https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag
function arrowTo(context, fromx, fromy, tox, toy) {
  var headlen = 15; // length of head in pixels
  var dx = tox - fromx;
  var dy = toy - fromy;
  var angle = Math.atan2(dy, dx);
  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);
  context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  context.moveTo(tox, toy);
  context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}

function arrowToReverse(context, fromx, fromy, tox, toy) {
  var headlen = 15; // length of head in pixels
  var dx = fromx - tox;
  var dy = fromy - toy;
  var angle = Math.atan2(dy, dx);
  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);
  context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  context.moveTo(tox, toy);
  context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}

function drawRuler(context, fromx, fromy, tox, toy) {
  context.beginPath();

  var headlen = 15; // length of head in pixels
  var dx = fromx - tox;
  var dy = fromy - toy;
  var angle = Math.atan2(dy, dx);
  context.moveTo(fromx, fromy);
  context.lineTo(fromx - headlen * Math.cos(angle - Math.PI / 2), fromy - headlen * Math.sin(angle - Math.PI / 2));
  context.moveTo(fromx, fromy);
  context.lineTo(fromx - headlen * Math.cos(angle + Math.PI / 2), fromy - headlen * Math.sin(angle + Math.PI / 2));
  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);
  context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 2), toy - headlen * Math.sin(angle - Math.PI / 2));
  context.moveTo(tox, toy);
  context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 2), toy - headlen * Math.sin(angle + Math.PI / 2));
  context.lineTo(fromx - headlen * Math.cos(angle + Math.PI / 2), fromy - headlen * Math.sin(angle + Math.PI / 2));
  context.moveTo(tox - headlen * Math.cos(angle - Math.PI / 2), toy - headlen * Math.sin(angle - Math.PI / 2));
  context.lineTo(fromx - headlen * Math.cos(angle - Math.PI / 2), fromy - headlen * Math.sin(angle - Math.PI / 2));

  context.stroke();
}