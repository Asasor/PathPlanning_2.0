//  use alert to debug

var canvas = document.getElementById('mainCanvas'),
context = canvas.getContext('2d');

var imageLoader = document.getElementById('backgroundImage');
imageLoader.addEventListener('change', makeBase, false);

var movePointCond = false;
var reverseCond = false;
var pointInfo = [];


//---------------------- canvas interaction ----------------------
canvas.addEventListener('click', function(evt)  // left click listener
    {
        var mousePos = getMousePos(canvas, evt);

        pointInfo.push(new Array());
        pointInfo[pointInfo.length - 1] = [mousePos.x, mousePos.y, reverseCond];

        drawPoints(context);
        // alert("working");
    }, false
);

//---------------------- buttons ----------------------

// taken from http://jsfiddle.net/influenztial/qy7h5/
function makeBase(e){
  var reader = new FileReader();
  reader.onload = function(event){
      var img = new Image();
      img.onload = function(){
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img,0,0);
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
  if (movePointCond)
    { Btn.style.backgroundColor="lightgreen"; }
  else
    { Btn.style.backgroundColor='#FA8072'; }
}


function Ruler() {

}


function mirrorMode() {

}


function mirrorPath() {
  
}


function GetPathInfo() {
  
}


function setSegment() {

}


function reverseMode(Btn) {
  reverseCond ^= 1; // flip bool
  if (reverseCond)
    { Btn.style.backgroundColor="lightgreen"; }
  else
    { Btn.style.backgroundColor='#FA8072'; }
}


function clearCanvas() {
  pointInfo = [];

  context.fillStyle = "white"; // change later to background image from makebase instead of white
  context.fillRect(0, 0, canvas.width, canvas.height);
}

//---------------------- miscellaneous ----------------------

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}


function drawPoints(context) {
    var start = true;
    var lastPoint = pointInfo[0]; // save the last point at any given time for the arrow's orientation

    context.beginPath();
    pointInfo.forEach((element) => {
        if (!start)
        {
        if (!element[2]) // check if reverse mode is toggled
          { arrowTo(context,lastPoint[0],lastPoint[1],element[0],element[1]); }
        else
          { arrowToReverse(context,lastPoint[0],lastPoint[1],element[0],element[1]); }
        lastPoint = element;
        }
        start = false;
    })
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