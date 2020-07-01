//  use alert to debug

var canvas = document.getElementById('mainCanvas'),
context = canvas.getContext('2d');
var pointInfo = [];


//---------------------- canvas interaction ----------------------
canvas.addEventListener('click', function(evt)  // left click listener
    {
        var mousePos = getMousePos(canvas, evt);

        pointInfo.push(new Array());
        pointInfo[pointInfo.length - 1] = [mousePos.x, mousePos.y];

        drawPoints(context);
        // alert("working");
    }, false
);

//---------------------- buttons ----------------------

function makeBase()
{
  base_image = new Image();
  base_image.src = 'img/base.png';
  base_image.onload = function(){
    context.drawImage(base_image, 0, 0);
  }
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
        arrowTo(context,lastPoint[0],lastPoint[1],element[0],element[1]);
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