/*
To do:
Modularize all inputs and add sliders for some
Add paper plane or birds?
Add ability for user to select from a palette or choose custom
Correct the dimensions for responsiveness and add more global variables that get used by many functions
Add checks and rules to make buildings not overlap
Remove irrelevant GUI inputs
How to add event listener to the GUI
Add popup at startup explaining how it works / shortcuts / refresh?
Add video recording functionality
Add shortcut key presses
*/

var canvas = document.getElementById("animation");
canvas.addEventListener("click",refresh);
var ctx = canvas.getContext("2d");

var canvasWidthInput = document.getElementById("canvasWidthInput");
canvasWidthInput.addEventListener("change",refresh);
var canvasWidth;

var canvasHeightInput = document.getElementById("canvasHeightInput");
canvasHeightInput.addEventListener("change",refresh);
var canvasHeight;

var animationfps=45;
var animationInterval;
var playAnimationToggle = false;

var backgroundColorInput = document.getElementById("backgroundColorInput");
backgroundColorInput.addEventListener("change",refresh);
var backgroundColor;

var backgroundColorInput2 = document.getElementById("backgroundColorInput2");
backgroundColorInput2.addEventListener("change",refresh);
var backgroundColor2;

var buildingWidthArray;
var buildingHeightArray;
var buildingLeftPositionArray;

var building1PixelData;
var building2PixelData;
var building3PixelData;

var sunCenterX;
var sunCenterY;
var sunRadius;
var sunColor;

var sunPositionY = 0.47;
var sunPositionX = 0.33;
var waterPosition = 0.55;
var cityPosition = 0.8;

var waterColor;
var cityColor;
var lightColor2;
var lightColor3;

//detect user browser
var ua = navigator.userAgent;
var isSafari = false;
var isFirefox = false;
var isIOS = false;
var isAndroid = false;
if(ua.includes("Safari")){
    isSafari = true;
}
if(ua.includes("Firefox")){
    isFirefox = true;
}
if(ua.includes("iPhone") || ua.includes("iPad") || ua.includes("iPod")){
    isIOS = true;
}
if(ua.includes("Android")){
    isAndroid = true;
}
console.log("isSafari: "+isSafari+", isFirefox: "+isFirefox+", isIOS: "+isIOS+", isAndroid: "+isAndroid);

//save image button
var saveImageButton = document.getElementById("saveImageButton");
saveImageButton.addEventListener('click', saveImage);

//video recording function
var recordBtn = document.getElementById("recordVideoButton");
var recording = false;
var mediaRecorder;
var recordedChunks;
recordBtn.addEventListener('click', chooseRecordingFunction);
var finishedBlob;
var recordingMessageDiv = document.getElementById("videoRecordingMessageDiv");
var recordVideoState = false;
var videoRecordInterval;
var videoEncoder;
var muxer;
var mobileRecorder;
var videofps = 15;

//MAIN METHOD
canvasWidthInput.value = Math.floor(window.innerWidth);
canvasHeightInput.value = Math.floor(window.innerHeight);
playAnimationToggle = true;
setTimeout(getUserInputs,200);
setTimeout(drawBackground,700); //wait for [x]

//add gui
var obj = {
    maxSize: 6.0,
    speed: 5,
    height: 10,
    type: 'three',
    backgroundColor1: "#0F1E66", //top bg
    backgroundColor2: "#EB3D88", // bottom bg
    color3: "#f3d84b", //sun windows lights
    color4: "#244ca4", // water
    color5: "#15140f", // black city background
    color6: "#ffffff", // lights
    color7: "#C2392C", // lights
};

var gui = new dat.gui.GUI( { autoPlace: false } );
gui.close();
//gui.remember(obj);

// Choose from accepted values
gui.add(obj, 'type', [ 'one', 'two', 'three' ] );

var f1 = gui.addFolder('Colors');
f1.addColor(obj, 'backgroundColor1');
f1.addColor(obj, 'backgroundColor2');
f1.addColor(obj, 'color3');
f1.addColor(obj, 'color4');
f1.addColor(obj, 'color5');
f1.addColor(obj, 'color6');
f1.addColor(obj, 'color7');
f1.open();

gui.add(obj, 'maxSize').min(-10).max(10).step(0.25);
gui.add(obj, 'height').step(5); // Increment amount

// Choose from named values
gui.add(obj, 'speed', { Stopped: 0, Slow: 0.1, Fast: 5 } );

obj['SaveImage'] = function () {
  saveImage();
};
gui.add(obj, 'SaveImage');

obj['Refresh'] = function () {
    refresh();
};
gui.add(obj, 'Refresh');

customContainer = document.getElementById( 'gui' );
customContainer.appendChild(gui.domElement);


function getUserInputs(){
    canvasWidth = Number(canvasWidthInput.value);
    canvasHeight = Number(canvasHeightInput.value);
    console.log("Canvas width / height: "+canvasWidth+", "+canvasHeight);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    backgroundColor = obj.backgroundColor1;
    backgroundColor2 = obj.backgroundColor2;
    sunColor = obj.color3;
    waterColor = obj.color4;
    cityColor = obj.color5;
    lightColor2 = obj.color6;
    lightColor3 = obj.color7;

    buildingWidthArray = [canvasWidth*randomValueBetween(0.1,0.2),canvasWidth*randomValueBetween(0.1,0.2),canvasWidth*randomValueBetween(0.1,0.2)];
    buildingHeightArray = [canvasHeight*randomValueBetween(0.26,0.33),canvasHeight*randomValueBetween(0.26,0.33),canvasHeight*randomValueBetween(0.26,0.33)];
    buildingLeftPositionArray = [canvasWidth*randomValueBetween(0,0.33),canvasWidth*randomValueBetween(0.33,0.67),canvasWidth*randomValueBetween(0.67,0.95)];

    sunCenterX = canvasWidth*sunPositionX;
    sunCenterY = canvasHeight*sunPositionY;
    sunRadius = Math.min(canvasHeight,canvasWidth)*0.2;
}

function randomValueBetween(min,max){
    var randomValue = min + (max-min)*Math.random();
    return randomValue;
}

function refresh(){
    console.log("refresh");
    playAnimationToggle = false;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight); //clear entire canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);  
    ctx.rotate(0);

    getUserInputs();
    //setTimeout(drawBackground,500);
    drawBackground();
}

function drawBackground(){
    var power = 2;
    for(var y=0; y<canvasHeight*waterPosition; y++){
        for(var x=0; x<canvasWidth; x++){
            var xDistance = Math.pow(x-sunCenterX,power);
            var yDistance = Math.pow(y-sunCenterY,power);
            var maxDistance = Math.pow((canvasWidth + canvasHeight*waterPosition)/randomValueBetween(3,6),power);
            //var heightRatio = y/(canvasHeight*waterPosition);
            var colorRatio = (xDistance+yDistance)/(maxDistance); 
            var currentColor;
            var rand=Math.random();
            if(rand < colorRatio){
                if(Math.random()>0.02){
                    currentColor = backgroundColor;
                } else {
                    currentColor = backgroundColor2;
                }
            } else {
                currentColor = backgroundColor2;
            }
            ctx.fillStyle = currentColor;
            ctx.fillRect(x,y,1,1);
        }
    }
    //should add a third color and do color blending between the colors as it descends

    drawSun();
}

function drawSun(){
    ctx.beginPath();
    ctx.fillStyle = sunColor;
    ctx.arc(sunCenterX,sunCenterY,sunRadius,0,Math.PI*2);

    //create gradient
    var gradient = ctx.createLinearGradient(sunCenterX,sunCenterY-sunRadius,sunCenterX,sunCenterY+sunRadius);

    //add color stops
    gradient.addColorStop(0,sunColor);
    gradient.addColorStop(0.55,sunColor);
    gradient.addColorStop(0.75,"#B40F00");
    ctx.fillStyle = gradient;

    ctx.fill();
    //should add some color gradient at the bottom for streaks of orange / red

    drawWater();
}

function drawWater(){
    ctx.fillStyle = waterColor;
    ctx.fillRect(0,canvasHeight*waterPosition,canvasWidth,canvasHeight*(1-waterPosition));

    drawCity();
}

function drawCity(){
    ctx.fillStyle = cityColor;
    ctx.fillRect(0,canvasHeight*cityPosition,canvasWidth,canvasHeight*(1-cityPosition));

    drawBuildings();
}

function makeBuilding(width,height,leftPosition,windowRows,windowCols,windowPadding,lightProbability){

    var buildingTopY = canvasHeight - height;

    ctx.fillStyle = cityColor;
    ctx.fillRect(leftPosition,buildingTopY,width,height);

    var windowWidth = (width-(windowPadding*(windowCols+1))) / windowCols;
    var windowHeight = (height-(windowPadding*(windowRows+1))) / windowRows;

    for(var y=0; y<windowRows; y++){
        for(var x=0; x<windowCols; x++){
            
            var rand = Math.random();
            if(rand < lightProbability){
                ctx.fillStyle = sunColor;
            } else {
                ctx.fillStyle = cityColor;
            }
            ctx.fillRect(leftPosition+(windowPadding*(x+1))+x*windowWidth, buildingTopY+y*windowHeight+(windowPadding*(y+1)),windowWidth,windowHeight);

        }
    }

}

function drawBuildings(){
    var padding = 4;
    makeBuilding(buildingWidthArray[0],buildingHeightArray[0],buildingLeftPositionArray[0],Math.floor(randomValueBetween(8,14)),Math.floor(randomValueBetween(4,8)),padding,randomValueBetween(0.4,1));
    makeBuilding(buildingWidthArray[1],buildingHeightArray[1],buildingLeftPositionArray[1],Math.floor(randomValueBetween(8,14)),Math.floor(randomValueBetween(4,8)),padding,randomValueBetween(0.4,1));
    makeBuilding(buildingWidthArray[2],buildingHeightArray[2],buildingLeftPositionArray[2],Math.floor(randomValueBetween(8,14)),Math.floor(randomValueBetween(4,8)),padding,randomValueBetween(0.4,1));

    //save building image data
    building1PixelData = ctx.getImageData(buildingLeftPositionArray[0], canvasHeight-buildingHeightArray[0], buildingWidthArray[0], buildingHeightArray[0]+5);
    building2PixelData = ctx.getImageData(buildingLeftPositionArray[1], canvasHeight-buildingHeightArray[1], buildingWidthArray[1], buildingHeightArray[1]+5);
    building3PixelData = ctx.getImageData(buildingLeftPositionArray[2], canvasHeight-buildingHeightArray[2], buildingWidthArray[2], buildingHeightArray[2]+5);

    animateLightAndWaves();

}

var lightColorArray = [];
function animateLightAndWaves(){

    //WAVES
    var leftPosition = sunCenterX - sunRadius;
    var rightPosition = sunCenterX + sunRadius;
    var lineLength = Math.floor(rightPosition - leftPosition);

    var leftPosition2 = sunCenterX - sunRadius*0.8;
    var rightPosition2 = sunCenterX + sunRadius*0.8;
    var lineLength2 = Math.floor(rightPosition2 - leftPosition2);

    var leftPosition3 = sunCenterX - sunRadius*0.6;
    var rightPosition3 = sunCenterX + sunRadius*0.6;
    var lineLength3 = Math.floor(rightPosition3 - leftPosition3);

    var maxWaveMovement = canvasHeight*0.01;
    var animationSpeed = 70; //larger number gives slower animation
    var loopCounter = 0;


    //LIGHTS
    var initialYOffset = cityPosition * canvasHeight;
    var maxYOffset = (1-cityPosition) * canvasHeight;

    //draw diagonal lights
    var diagonalLines = 10;
    var numLightsPerLine = 25;
    var bottomY = canvasHeight;
    var topY = initialYOffset;
    var yDistance = bottomY - topY;
    var sunDistanceY = bottomY - sunCenterY;
    var dotRadius = Math.min(canvasHeight,canvasWidth)/250;


    for(i=0; i<diagonalLines; i++){
        var startingX = (i+1)/(diagonalLines+1) * canvasWidth;
        var endingX = startingX + (sunCenterX - startingX) * 0.4;
        var sunDistanceX = sunCenterX - startingX;
        var xDistance = endingX - startingX;
        var slope = yDistance/xDistance;

        for(j=0; j<numLightsPerLine; j++){
            
            var y = bottomY - yDistance*(j/(numLightsPerLine-1));
            var x = startingX + (yDistance*(j/(numLightsPerLine-1)))/slope;
            ctx.beginPath();
            ctx.fillStyle = sunColor;
            ctx.arc(x,y,dotRadius,0,Math.PI*2);
            ctx.fill();

        }
    }

    //draw horizontal lights
    var lightRows = 8;
    var numLightsPerRow = Math.floor(canvasWidth/16);
    var dotRadius = Math.min(canvasHeight,canvasWidth)/120;
    var currentColor;

    var loopCounter = 0;
    var lightColorArray = [];
    var lightRadiusArray = [];

    function loop(){

        if(playAnimationToggle == false){
            playAnimationToggle = true;
            console.log("clear animation interval");
            cancelAnimationFrame(animationID); //stop animation
            return;
        }

        //re-draw water;
        ctx.fillStyle = waterColor;
        ctx.fillRect(0,canvasHeight*waterPosition,canvasWidth,canvasHeight*0.13);

        ctx.fillStyle = sunColor;

        //wave 1
        for(var i=0; i<lineLength; i++){
            
            var radius = 2;

            var sineShift = Math.sin((i/lineLength)*Math.PI*4+loopCounter/animationSpeed) * maxWaveMovement;
            var y = canvasHeight * 0.58+sineShift;
            ctx.beginPath();
            ctx.arc(leftPosition+i,y,radius,0,Math.PI*2);
            ctx.fill();
        }

        //wave 2
        for(var i=0; i<lineLength2; i++){

            var radius = 2;

            var sineShift = Math.sin((i/lineLength2)*Math.PI*4+loopCounter/animationSpeed) * maxWaveMovement;
            var y = canvasHeight * 0.61+sineShift;
            ctx.beginPath();
            ctx.arc(leftPosition2+i,y,radius,0,Math.PI*2);
            ctx.fill();
        }

        //wave 3
        for(var i=0; i<lineLength3; i++){

            var radius = 2;

            var sineShift = Math.sin((i/lineLength3)*Math.PI*4+loopCounter/animationSpeed) * maxWaveMovement;
            var y = canvasHeight * 0.64+sineShift;
            ctx.beginPath();
            ctx.arc(leftPosition3+i,y,radius,0,Math.PI*2);
            ctx.fill();
        }

        var animationID;

        for(var i=0; i<lightRows; i++){
            var y = initialYOffset + (i/(lightRows-1))*(maxYOffset);
    
            for(var j=0; j<numLightsPerRow; j++){
                var x = (j/(numLightsPerRow-1)) * canvasWidth;
                
                if(loopCounter==0){
                    var rand = Math.random();
                    if(rand < 0.6){
                        currentColor = sunColor;
                    } else if(rand <0.8){
                        currentColor = lightColor2;
                    } else if(rand<0.9){
                        currentColor = lightColor3;
                    } else {
                        currentColor = cityColor;
                    }
                    lightColorArray.push(currentColor); //save colors on first run

                    var currentRadius = randomValueBetween(dotRadius*0.4,dotRadius);
                    lightRadiusArray.push(currentRadius); //save dot radius on first run

                } else {
                    var rand = Math.random();
                    if(rand < 0.9993){
                        currentColor = lightColorArray[j+i*numLightsPerRow]; //use initial color most of the time
                    } else {
                        var rand2 = Math.random(); //allow some lights to change color
                        if(rand2 < 0.6){
                            currentColor = sunColor;
                        } else if(rand2 <0.8){
                            currentColor = lightColor2;
                        } else if(rand2<0.90){
                            currentColor = lightColor3;
                        } else {
                            currentColor = cityColor;
                        }
                        lightColorArray[j+i*numLightsPerRow] = currentColor; //update master color array
                    }
                }

                ctx.beginPath();
                ctx.fillStyle = currentColor;
                ctx.arc(x,y,lightRadiusArray[j+i*numLightsPerRow],0,Math.PI*2);
                ctx.fill();
            }
        }

        //re-draw buildings on top of the lights -- simple copy/paste of canvas area
        ctx.putImageData(building1PixelData, buildingLeftPositionArray[0], canvasHeight - buildingHeightArray[0]);
        ctx.putImageData(building2PixelData, buildingLeftPositionArray[1], canvasHeight - buildingHeightArray[1]);
        ctx.putImageData(building3PixelData, buildingLeftPositionArray[2], canvasHeight - buildingHeightArray[2]);
        
        loopCounter++;
        animationID = window.requestAnimationFrame(loop);
    }
    animationID = window.requestAnimationFrame(loop);

    //improve dot spacing and add randomness / potential skips 
    //drawWaveLines();

}

function drawWaveLines(){

    
    
    function loop(){

        if(playAnimationToggle == false){
            playAnimationToggle = true;
            console.log("clear animation interval");
            cancelAnimationFrame(); //stop animation
            return;
        }

    }
    window.requestAnimationFrame(loop);

}

function chooseRecordingFunction(){

}

function chooseEndRecordingFunction(){

}

function saveImage(){
    const link = document.createElement('a');
    link.href = canvas.toDataURL();

    const date = new Date();
    const filename = `nagai_${date.toLocaleDateString()}_${date.toLocaleTimeString()}.png`;
    link.download = filename;
    link.click();
}


/* ORIGINAL DRAW BUILDINGS FUNCTION

function drawBuildings(){

    //draw leftmost building
    var height = canvasHeight*0.28;
    var buildingTopY = canvasHeight - height;
    var leftPosition = 0.05 * canvasWidth;
    var buildingWidth = canvasWidth * 0.15;
    var rightPosition = leftPosition + buildingWidth;

    ctx.fillStyle = "#15140f";
    ctx.fillRect(leftPosition,canvasHeight-height,rightPosition-leftPosition,height);

    var windowRows = 10;
    var windowCols = 5;
    var numWindows = windowRows * windowCols;
    var padding = 3;
    var windowWidth = Math.floor(buildingWidth / windowCols)-padding;
    var windowHeight = Math.floor(height / windowRows)-padding;


    for(var y=0; y<windowRows; y++){
        for(var x=0; x<windowCols; x++){
            
            var rand = Math.random();

            if(rand < 0.67){
                ctx.fillStyle = "#e4c850"; //yellow
            } else {
                ctx.fillStyle = "black";
            }
            ctx.fillRect(leftPosition+(padding*(x+1))+x*windowWidth, buildingTopY+(y)*windowHeight+(padding*(y+1)),windowWidth,windowHeight);

        }
    }

    //draw middle building
    var height = canvasHeight*0.26;
    var buildingTopY = canvasHeight - height;
    var leftPosition = 0.55 * canvasWidth;
    var buildingWidth = canvasWidth * 0.12;
    var rightPosition = leftPosition + buildingWidth;

    ctx.fillStyle = "#15140f";
    ctx.fillRect(leftPosition,canvasHeight-height,rightPosition-leftPosition,height);

    var windowRows = 9;
    var windowCols = 6;
    var numWindows = windowRows * windowCols;
    var padding = 3;
    var windowWidth = Math.floor(buildingWidth / windowCols)-padding;
    var windowHeight = Math.floor(height / windowRows)-padding;


    for(var y=0; y<windowRows; y++){
        for(var x=0; x<windowCols; x++){
            
            var rand = Math.random();

            if(rand < 0.5){
                ctx.fillStyle = "#e4c850"; //yellow
            } else {
                ctx.fillStyle = "black";
            }
            ctx.fillRect(leftPosition+(padding*(x+1))+x*windowWidth, buildingTopY+(y)*windowHeight+(padding*(y+1)),windowWidth,windowHeight);

        }
    }

    //draw right building
    var height = canvasHeight*0.3;
    var buildingTopY = canvasHeight - height;
    var leftPosition = 0.75 * canvasWidth;
    var buildingWidth = canvasWidth * 0.16;
    var rightPosition = leftPosition + buildingWidth;

    ctx.fillStyle = "#15140f";
    ctx.fillRect(leftPosition,canvasHeight-height,rightPosition-leftPosition,height);

    var windowRows = 12;
    var windowCols = 4;
    var numWindows = windowRows * windowCols;
    var padding = 3;
    var windowWidth = Math.floor(buildingWidth / windowCols)-padding;
    var windowHeight = Math.floor(height / windowRows)-padding;


    for(var y=0; y<windowRows; y++){
        for(var x=0; x<windowCols; x++){
            
            var rand = Math.random();

            if(rand < 0.85){
                ctx.fillStyle = "#e4c850"; //yellow
            } else {
                ctx.fillStyle = "black";
            }
            ctx.fillRect(leftPosition+(padding*(x+1))+x*windowWidth, buildingTopY+(y)*windowHeight+(padding*(y+1)),windowWidth,windowHeight);

        }
    }

    drawWaveLines();

}

*/