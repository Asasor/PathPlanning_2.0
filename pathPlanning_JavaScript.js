var canvas = document.getElementById('mainCanvas'),
context = canvas.getContext('2d');
var pointInfo = [];


//---------------------- canvas interaction ----------------------
canvas.addEventListener('click', function(evt)  // left click listener
    {
        var mousePos = getMousePos(canvas, evt);

        pointInfo.push(new Array());
        pointInfo[pointInfo.length] = [mousePos.x, mousePos.y];

         // need to figure out how to add array (point) to json
        // context.fillRect(mousePos.x, mousePos.y, 10, 10);
        drawPoints(canvas);
        // alert("working");
    }, false
);

//---------------------- buttons ----------------------


function make_base()
{
  base_image = new Image();
  base_image.src = 'img/base.png';
  base_image.onload = function(){
    context.drawImage(base_image, 0, 0);
  }
}

//---------------------- miscellaneous ----------------------

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function drawPoints(canvas) {
    var start=true;

    context = this.canvas.getContext('2d');
    context.beginPath();
    context.moveTo(pointInfo[0][0], pointInfo[0][1]);
    pointInfo.forEach((element) => {
        if (!start)
        { context.lineTo(element[0],element[1]); }
        start = false;
    })
    context.stroke();
}