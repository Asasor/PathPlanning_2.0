// use alert() and console.log() to debug

var canvas = document.getElementById('mainCanvas'),
    context = canvas.getContext('2d');

var imageLoader = document.getElementById('backgroundImage');
imageLoader.addEventListener('change', makeBase, false);

var infoConsole = document.getElementById("console");

var pressTimer; // use a timer to track the length of long clicks

// mode indicators
var movePointCond = false;  // check if movePointCond is true (use to toggle between drawing and moving points)
var bezierMode = false; // mode that switches between drawing regular and bezier lines
var reverseCond = false;  // save the current reverse state; it is either on (true) or off (false)
var rulerCoords = [false];  // initiate array to store the coordinates and state of the ruler
var mirrorModeState = 0;  // 0 -> none; 1 -> horizontal; 2 -> vertical
var realWidth = 7.5;  // the real width (in meters) of the field which is represented by the canvas
var realHeight = 4.0;  // the real height (in meters) of the field which is represented by the canvas
var canvasSizeRatio = canvas.width / canvas.height;
var img;
var tempBezierPoints = [];  // array to store temporary bezier point information

var pointInfo = [];  // array which contains all the regular points' coordinates
var bezierInfo = [];  // array which contains all of the bezier information

refresh(); // start off by initializing various screen elements such as the grid using the refresh function


//---------------------- canvas interaction ----------------------
canvas.addEventListener('click', function (evt) {  // click listener (used to draw regular points)
  let mousePos = getMousePos(canvas, evt);  // get the coordinates of the mouse
    if (bezierMode) 
      { bezierMode = false; }
    else {
      if (rulerCoords[0] === false) { // check whether a regular point or a ruler should be drawn
          // add a regular point
          pointInfo.push([]);
          pointInfo[pointInfo.length - 1] = [mousePos.x, mousePos.y, reverseCond, false];
      } else if (rulerCoords.length < 3) { // check if the ruler is active and there are a at most two points  
          rulerCoords.push([mousePos.x, mousePos.y]);
          drawRuler(context, rulerCoords[1][0], rulerCoords[1][1], rulerCoords[2][0], rulerCoords[2][1]);
          rulerCoords = [true]; 
      }
    }

  drawPoints(context);
}, false
);


canvas.addEventListener('mousedown', function (evt) {  // long mouse press listener (used to draw curves)
  pressTimer = window.setTimeout(function() { // var to change the points' state (regular and curve)
  let mousePos = getMousePos(canvas, evt);  // get the coordinates of the mouse

  // on the first bezier mouse press you only change the mode to be bezierMode and add an 
  // empty dictionary to store the bezier's information
  if (true) {  
    bezierInfo.push([
      pointInfo.length - 1,  // save the position of the bezier curve in the path
      [[pointInfo[pointInfo.length - 1]], []]  // for every bezier curve, there are two types of points: control points and path points 
    ]);

    refresh();
    cP = findClosestPoint(pointInfo.slice(1, -1), [mousePos.x, mousePos.y]);  // cP --> closest Point (not start point or end point)
    cP[0] += 1; // move position 1 forward to deal with place distortion
    bezierMode = true;
    pointInfo[cP[0]][3]  ^= 1; // flip bcp (Bezier Control Point) state of point
  }

  drawPoints(context);
  }, 200  // time (in ms) to wait until function is triggered
  );
}, false
);


canvas.addEventListener('mouseup', function (evt) {  // stop mousedown alert if the mouse is lifted
  clearTimeout(pressTimer);  // clear long press timer
}, false
);


//---------------------- buttons ----------------------

// modified from http://jsfiddle.net/influenztial/qy7h5/
function makeBase(e){ 
    var reader = new FileReader();
    reader.onload = function(event){
        img = new Image();
        img.onload = function() {
          var heightRatio = Math.round(canvasWidth / img.width);
          canvas.height = img.height * heightRatio;
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      img.src = event.target.result;
      }
    reader.readAsDataURL(e.target.files[0]);
    clearCanvas();
    
    if (img.width > img.height) {  // optimize (for smaller code) later
      realWidth = parseFloat(prompt("please enter the length of the longest side of the field in meters\nthe default is 7.5", "7.5"));
      realHeight = realWidth * img.width / img.height;
    } else {
      realHeight = parseFloat(prompt("please enter the length of the longest side of the field in meters\nthe default is 7.5", "7.5"));
    }

    if (!img)
      {alert("image wasn't uploaded properly; try again.");}
}



function deletePoint() {
    pointInfo.pop();
    drawPoints(context);
}


function movePoint(Btn) {  // not finished; need to implement moving point
  movePointCond ^= 1;  // flip bool
  if (movePointCond) { Btn.style.backgroundColor = 'gray'; } else { Btn.style.backgroundColor = ''; }  // reset to default colour
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
    mirrorModeState = (mirrorModeState + 1) % 3;  // advance mirror mode to next state
    if (mirrorModeState === 1) { Btn.style.backgroundColor = 'lightgray'; } // horizontal mirror mode
  else if (mirrorModeState === 2)
    { Btn.style.backgroundColor = 'gray'; }  // vertical mirror mode
        else {Btn.style.backgroundColor = ''; }  // reset to default colour

  drawPoints(context);
}


function mirrorPath() {
  var mirrorPointInfo = JSON.parse(JSON.stringify(pointInfo));  // clone the point locations into a new reversed array
  mirrorPointInfo.reverse();

  if (mirrorModeState === 1) {
  for (let i = 0; i < mirrorPointInfo.length; i++)  // mirror points vertically
    {mirrorPointInfo[i][1] += 2 * (parseInt(canvas.height / 2) - mirrorPointInfo[i][1]);}
  } 
      
  else if (mirrorModeState == 2)
  {
  for (let i = 0; i < mirrorPointInfo.length; i++)  // mirror points horizontally
    {mirrorPointInfo[i][0] += 2 * (parseInt(canvas.width / 2) - mirrorPointInfo[i][0]);}
  }
  
  else
    {mirrorPointInfo = [];}
  
  
  pointInfo = pointInfo.concat(mirrorPointInfo);  // add the mirrored points to the end of the pointInfo array
  drawPoints(context);
}


function getPathInfo() {
  infoConsole.value = "";  // empty textbox
  let pathPrintInfo = pathMath(pointInfo,[canvas.width / realWidth, canvas.height / realHeight], 3);

  for (let i = 0; i < pathPrintInfo[0].length - 1; i++)
  {
    infoConsole.value += "new double[]{" + pathPrintInfo[0][i].toString() + ", " + pathPrintInfo[1][i].toString() + ", " + pathPrintInfo[2][i].toString() + pathPrintInfo[3][i] ? "10" : "5" + ", 0.3, 0.7}\n";
  }

  //alert("working");
}


function setSegment() {

}


function reverseMode(Btn) {
  reverseCond ^= 1;  // flip bool
  if (reverseCond)
    { Btn.style.backgroundColor="gray"; }
  else
    { Btn.style.backgroundColor=''; }  // reset to default colour
}


function clearCanvas() {  // reset all of the point information and refresh
  bezierInfo = [];
  pointInfo = [];
  refresh();
}

//---------------------- miscellaneous ----------------------


function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}


function refresh() {  // a bit like clear canvas but retains information that clear canvas erases
  //console.log("refresh");
  if (img)  // check if an image was uploaded
  {
    if (typeof(img.src) === "string") // if the image is active
    { context.drawImage(img, 0, 0, canvas.width, canvas.height); }
  }
        
    else  // if the image is not active
    {
      context.fillStyle = "white";  // change later to background image from makebase instead of white
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    drawMirror(context, canvas.width, canvas.height);  // draw mirror
    drawGrid(0.5,0.5); // units in m (proportional to realWidth and realHeight)
}


function drawPoints(context) {
    refresh();
    drawPointCircles(context, pointInfo, 8, "green", "red");
    drawArrows(context, pointInfo);
    drawMirror(context, canvas.width, canvas.height);  // draw mirror

    var bezierArrs = makeBezierArrays(pointInfo);
    var bezierInfo = [];
    for (var i = 0; i < bezierArrs.length; i++) {
      bezierInfo = UniformBezierDistributionMath(1000, bezierArrs[i], 100);
      simplifiedDrawPointCircles(context, bezierInfo, 8, "blue");
    }
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


//  modified from https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag
function arrowTo(context, fromx, fromy, tox, toy, color) {
  var headlen = 15;  // length of head in pixels
  var dx = tox - fromx;
  var dy = toy - fromy;
  var angle = Math.atan2(dy, dx);
  context.lineWidth = 2;
  context.strokeStyle = color;
  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);
  context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  context.moveTo(tox, toy);
  context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}


function arrowToReverse(context, fromx, fromy, tox, toy, color) {
  var headlen = 15;  // length of head in pixels
  var dx = fromx - tox;
  var dy = fromy - toy;
  var angle = Math.atan2(dy, dx);
  context.linewidth = 2;
  context.strokeStyle = color;
  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);
  context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  context.moveTo(tox, toy);
  context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}


function drawRuler(context, fromx, fromy, tox, toy) {
  context.beginPath();

  var headlen = 15;  // length of head in pixels
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


function pathMath(canvasPointArr, sizeRatios, decimalPlaces) {  // move to pathPlanning_infoFunctions.js later
  let totalInfo = []; //  used for debugging
  let printInfo = [];
  let realPointArr = [];
  let printDistTol = [0];
  let distanceArr = [0];
  let angleArr = [0];
  let angTolArr = [];
  let distSum = 0;
  let distance = 0;
  let angle = 0;

  for (let i = 0; i < canvasPointArr.length; i++) {  // setup real point positions
    realPointArr.push([canvasPointArr[i][0] / sizeRatios[0], canvasPointArr[i][1] / sizeRatios[1], canvasPointArr[i][2]]);
  }

  for (let i = 1; i < canvasPointArr.length; i++) {
    angle = Math.atan2(realPointArr[i][1] - realPointArr[i - 1][1], realPointArr[i][0] - realPointArr[i - 1][0]) * 180 / Math.PI;
    console.log(Math.atan2(1,1));
    if (!realPointArr[i][2]) { // check if reversed 
      angle -= 180;
      if (Math.abs(angle) > 180)
        {angle %= 180;}
    }
    angleArr.push(Math.round((angle + Number.EPSILON) * Math.pow(10,decimalPlaces)) / Math.pow(10,decimalPlaces));  // add the current angle to the angle array
  }

  for (let i = 1; i < canvasPointArr.length; i++) {
    distance = Math.pow(Math.abs(Math.pow(realPointArr[i][0] - realPointArr[i - 1][0], 2) + Math.pow(realPointArr[i][1] - realPointArr[i - 1][1], 2)), 0.5);  // distance between current and last points
    if (realPointArr[i][2])
      { distance *= -1; }
    distSum += distance;  // the sum of all distances up to the current point (- distance traveled in reverse)
    distanceArr.push(Math.round((distSum + Number.EPSILON) * Math.pow(10,decimalPlaces)) / Math.pow(10,decimalPlaces));  // add the distSum (explained above) to the distance array
    //the line above was modified from https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
  }

  

  for (let i = 0; i < canvasPointArr.length; i++)
    {printDistTol.push(0.3);}

  for (let i = 0; i < canvasPointArr.length; i++)
  {
    if (!canvasPointArr[i][2])
      {angTolArr.push(5);}
    else
      {angTolArr.push(10);}
  }

  totalInfo.push(realPointArr);
  totalInfo.push(distanceArr);
  totalInfo.push(angleArr);

  printInfo.push(distanceArr);
  printInfo.push(angleArr);
  printInfo.push(printDistTol);
  printInfo.push(angTolArr);
  return printInfo;
}


function drawGrid(realCellWidth, realCellHeight) {
  let cellWidth = Math.round(realCellWidth * canvas.width / realWidth);
  let cellHeight = Math.round(realCellHeight * canvas.height / realHeight);

  context.beginPath();
  context.lineWidth = 1;
  context.strokeStyle = "black";
  
  for (let y = 0;  y <= canvas.width; y += cellHeight) {  // draw all horizontal lines
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
  }

  for (let x = 0; x <= canvas.width; x += cellWidth) {  // draw all vertical lines
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
  }

  context.stroke();
}


function drawPointCircles(context, pList, rad, nColor, bColor) {  // nColor -> normal color; bColor -> bezier color
  for (let i = 0; i < pList.length; i++) {
    context.fillStyle = pList[i][3] ? nColor : bColor; // change the color based on whether the point is a curve point
    context.beginPath();
    context.arc(pList[i][0], pList[i][1], rad, 0, 2 * Math.PI, false);
    context.fill();
    context.stroke();
  }
}


function simplifiedDrawPointCircles(context, pList, rad, color) {  // only 1 color
  for (let i = 0; i < pList.length; i++) {
    context.fillStyle = color; // change the color based on whether the point is a curve point
    context.beginPath();
    context.arc(pList[i][0], pList[i][1], rad, 0, 2 * Math.PI, false);
    context.fill();
    context.stroke();
  }
}


// modified from https://stackoverflow.com/questions/31167663/how-to-code-an-nth-order-bezier-curve
function bezier(t, plist) {
  var order = plist.length - 1;

  var y = 0;
  var x = 0;

  for (i = 0; i <= order; i++) {
      x = x + (binom(order, i) * Math.pow((1 - t), (order - i)) * Math.pow(t, i) * (plist[i][0]));
      y = y + (binom(order, i) * Math.pow((1 - t), (order - i)) * Math.pow(t, i) * (plist[i][1]));
  }

  return {x: x, y: y};
}


// taken from my research project -> https://github.com/Asasor/javascriptUniformSegmentLengthBezier
function UniformBezierDistributionMath(acc, pList, segLen) {
  let pDist = 0;
  let diff = 0;
  let pL = 0;
  let lpL = bezier(0, pList);  // lpL --> last point Location
  let outList = []

  for (let i = 1 / acc; i <= 1 + 1 / acc; i += 1 / acc) {  // acc --> accuracy
      pL = bezier(i, pList);
      pDist = dist(lpL.x, lpL.y, pL.x, pL.y);
      diff = Math.abs(pDist - segLen);
      if (diff % segLen < 50) {
          outList.push([pL.x, pL.y]);

          pDist = 0;
          lpL = pL;
      }
  }

  return outList;
}


// taken from http://rosettacode.org/wiki/Evaluate_binomial_coefficients#JavaScript
function binom(n, k) {
  var coeff = 1;
  for (var i = n - k + 1; i <= n; i++) coeff *= i;
  for (var i = 1; i <= k; i++) coeff /= i;
  return coeff;
}


function dist(x1, y1, x2, y2) {
  return Math.pow(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2), 0.5);
}


// taken from https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(ms) {  // not currently used; will be used later to make application look nicer
  return new Promise(resolve => setTimeout(resolve, ms));
}


function findClosestPoint(pList, pCompare) {  // find the closest point to pCompare from pList and return its' index and distance from pCompare
  let compareDist = dist(pList[0][0], pList[0][1], pCompare[0], pCompare[1]);
  let minP_Info = [0, compareDist];
  for (let i = 1; i < pList.length; i++) {  // start at 1 because 0 is the initial state
    compareDist = dist(pList[i][0], pList[i][1], pCompare[0], pCompare[1]);
    if (minP_Info[1] >= compareDist)
      { minP_Info = [i, compareDist]; }
  }

  return minP_Info;
}


function drawArrows(context, pArr) {
  var color = "green";
  var start = true;
  var lastPoint = pointInfo[0];  // save the last point at any given time for the arrow's orientation
    
  pArr.forEach(function iterate(element, index) {
      if (!start) {
        context.beginPath();
        if (element[3] || pArr[index - 1][3])  // check if either the current point or the next point are bezier points
          { color = "green"; } else { color = "red"; } // doesnt work; fix later

        if (!element[2])  // check if reverse mode is toggled
        { arrowTo(context,lastPoint[0],lastPoint[1],element[0],element[1], color); } 
        else
        { arrowToReverse(context,lastPoint[0],lastPoint[1],element[0],element[1], color); }
        context.stroke();
      }
      lastPoint = element;
      start = false;
  })
}


function makeBezierArrays(pList) {  // first and last points can't be control points
  var arrOfArrs = [];
  for (var i = 0; i < pList.length; i++) {
    if (pList[i][3])
      {arrOfArrs[arrOfArrs.length - 1].push(pList[i]);}
    
    if (i > 0) {
      if (pList[i - 1][3] && !pList[i][3])
        {arrOfArrs[arrOfArrs.length - 1].push(pList[i]);}
    }
    
    if (i < pList.length - 1) {
      if (pList[i + 1][3] && !pList[i][3])
        {arrOfArrs.push([pList[i]]);}
    }
  }
  return arrOfArrs;
}