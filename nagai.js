/*
To do:
Add paper plane or birds?
Add checks and rules to make buildings not overlap
Add popup at startup explaining how it works / shortcuts / refresh?
Check firefox and mobile compatibility
Consider adding more GUI options and sliders for user control
*/

var canvas = document.getElementById("animation");
canvas.addEventListener("click",refresh);
var ctx = canvas.getContext("2d");

var canvasWidth;
var canvasHeight;

var animationInterval;
var playAnimationToggle = false;

var backgroundColor;
var backgroundColor2;
var waterColor;
var cityColor;
var lightColor2;
var lightColor3;

var buildingWidthArray = [];
var buildingHeightArray = [];
var buildingLeftPositionArray = [];

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

//video recording function
var recording = false;
var mediaRecorder;
var recordedChunks;
var finishedBlob;
var recordingMessageDiv = document.getElementById("videoRecordingMessageDiv");
var recordVideoState = false;
var videoRecordInterval;
var videoEncoder;
var muxer;
var mobileRecorder;
var videofps = 30;
var videoDuration = 20;

//color palettes
var colorPaletteArray = [
    ["#0f1e66","#eb3d88","#f3d84b","#244ca4","#15140f","#ffffff","#c2392c"],
    ["#541136","#E600A3","#FFA710","#5987ff","#3c0e11","#10e2ff","#FFA710"],
    ["#091833","#711c91","#ea00d9","#133e7c","#000000","#0adbc6","#04b054"],
    ["#05B6C5","#ff89B4","#FFA710","#244ca4","#F43086","#ffffff","#0FEBE3"]
]

//MAIN METHOD
playAnimationToggle = true;
setTimeout(getUserInputs,200);
setTimeout(drawBackground,700);

//add gui
var obj = {
    Palette: 'Shikoku',
    color0: colorPaletteArray[0][0], //top bg
    color1: colorPaletteArray[0][1], // bottom bg
    color2: colorPaletteArray[0][2], //sun windows lights
    color3: colorPaletteArray[0][3], // water
    color4: colorPaletteArray[0][4], // black city background
    color5: colorPaletteArray[0][5], // lights
    color6: colorPaletteArray[0][6], // lights
};
var paletteChoice = obj.Palette;

var gui = new dat.gui.GUI( { autoPlace: false } );
gui.close();
var guiOpenToggle = false;
//gui.remember(obj);

// Choose from accepted values
gui.add(obj, 'Palette', [ 'Shikoku', 'Kyushu', 'Hokkaido', 'Okinawa' ] ).listen().onChange(changePalette);

var f1 = gui.addFolder('CustomColors');
f1.addColor(obj, 'color0').listen();
f1.addColor(obj, 'color1').listen();
f1.addColor(obj, 'color2').listen();
f1.addColor(obj, 'color3').listen();
f1.addColor(obj, 'color4').listen();
f1.addColor(obj, 'color5').listen();
f1.addColor(obj, 'color6').listen();
f1.close();

obj['SaveImage'] = function () {
  saveImage();
};
gui.add(obj, 'SaveImage');

obj['SaveVideo'] = function () {
    chooseRecordingFunction();
  };
gui.add(obj, 'SaveVideo');

obj['Refresh'] = function () {
    refresh();
};
gui.add(obj, 'Refresh');

customContainer = document.getElementById( 'gui' );
customContainer.appendChild(gui.domElement);

function getUserInputs(){
    canvasWidth = Math.floor(window.innerWidth);
    canvasHeight = Math.floor(window.innerHeight);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    console.log("Canvas width / height: "+canvasWidth+", "+canvasHeight);

    backgroundColor = obj.color0;
    backgroundColor2 = obj.color1;
    sunColor = obj.color2;
    waterColor = obj.color3;
    cityColor = obj.color4;
    lightColor2 = obj.color5;
    lightColor3 = obj.color6;

    buildingWidthArray = [canvasWidth*randomValueBetween(0.1,0.2),canvasWidth*randomValueBetween(0.1,0.2),canvasWidth*randomValueBetween(0.1,0.2)];
    buildingHeightArray = [canvasHeight*randomValueBetween(0.22,0.33),canvasHeight*randomValueBetween(0.22,0.33),canvasHeight*randomValueBetween(0.22,0.33)];
    buildingLeftPositionArray = [canvasWidth*randomValueBetween(0,0.33),canvasWidth*randomValueBetween(0.33,0.67),canvasWidth*randomValueBetween(0.67,0.95)];

    sunPositionX = randomValueBetween(0.30,0.70);
    sunRadius = Math.min(canvasHeight,canvasWidth)*randomValueBetween(0.2,0.29);
    sunCenterX = canvasWidth*sunPositionX;
    sunCenterY = canvasHeight*sunPositionY;
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
    gradient.addColorStop(0.52,sunColor);
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

    ctx.fillStyle = "black";
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
    var waveRadius = canvasHeight / 500;
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
            
            var sineShift = Math.sin((i/lineLength)*Math.PI*4+loopCounter/animationSpeed) * maxWaveMovement;
            var y = canvasHeight * 0.58+sineShift;
            ctx.beginPath();
            ctx.arc(leftPosition+i,y,waveRadius,0,Math.PI*2);
            ctx.fill();
        }

        //wave 2
        for(var i=0; i<lineLength2; i++){

            var sineShift = Math.sin((i/lineLength2)*Math.PI*4+loopCounter/animationSpeed) * maxWaveMovement;
            var y = canvasHeight * 0.61+sineShift;
            ctx.beginPath();
            ctx.arc(leftPosition2+i,y,waveRadius,0,Math.PI*2);
            ctx.fill();
        }

        //wave 3
        for(var i=0; i<lineLength3; i++){

            var sineShift = Math.sin((i/lineLength3)*Math.PI*4+loopCounter/animationSpeed) * maxWaveMovement;
            var y = canvasHeight * 0.64+sineShift;
            ctx.beginPath();
            ctx.arc(leftPosition3+i,y,waveRadius,0,Math.PI*2);
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

}

//HELPER FUNCTIONS BELOW

function randomValueBetween(min,max){
    var randomValue = min + (max-min)*Math.random();
    return randomValue;
}

function saveImage(){
    const link = document.createElement('a');
    link.href = canvas.toDataURL();

    const date = new Date();
    const filename = `nagai_${date.toLocaleDateString()}_${date.toLocaleTimeString()}.png`;
    link.download = filename;
    link.click();
}

function changePalette(){
    paletteChoice = obj.Palette;

    console.log("change palette");
    var paletteIndex;
    
    if(paletteChoice == "Shikoku"){
        paletteIndex = 0;
    } else if(paletteChoice == "Kyushu"){
        paletteIndex = 1;
    } else if(paletteChoice == "Hokkaido") {
        paletteIndex = 2;
    } else if(paletteChoice == "Okinawa"){
        paletteIndex = 3;
    }

    //update GUI values with new palette
    obj.color0 = colorPaletteArray[paletteIndex][0];
    obj.color1 = colorPaletteArray[paletteIndex][1];
    obj.color2 = colorPaletteArray[paletteIndex][2];
    obj.color3 = colorPaletteArray[paletteIndex][3];
    obj.color4 = colorPaletteArray[paletteIndex][4];
    obj.color5 = colorPaletteArray[paletteIndex][5];
    obj.color6 = colorPaletteArray[paletteIndex][6];

    refresh();

}

function cyclePalette(){
    if(paletteChoice == "Shikoku"){
        paletteChoice = "Kyushu";
        obj.Palette = paletteChoice;
    } else if(paletteChoice == "Kyushu"){
        paletteChoice = "Hokkaido";
        obj.Palette = paletteChoice;
    } else if(paletteChoice == "Hokkaido"){
        paletteChoice = "Okinawa";
        obj.Palette = paletteChoice;
    }  else if(paletteChoice == "Okinawa"){
        paletteChoice = "Shikoku";
        obj.Palette = paletteChoice;
    }
    changePalette();
}

function toggleGUI(){
    if(guiOpenToggle == false){
        gui.open();
        guiOpenToggle = true;
    } else {
        gui.close();
        guiOpenToggle = false;
    }
}

//shortcut hotkey presses
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        refresh();
    } else if (event.key === 'i') {
        saveImage();
    } else if (event.key === 'v') {
        chooseRecordingFunction();
    } else if (event.key === 'c') {
        cyclePalette();
    } else if (event.key === 'o') {
        toggleGUI();
    } 
});

function chooseRecordingFunction(){
    if(isIOS || isAndroid || isFirefox){
        startMobileRecording();
    }else {
        recordVideoMuxer();
    }
}

function chooseEndRecordingFunction(){
    if(isIOS || isAndroid || isFirefox){
        mobileRecorder.stop();
    }else {
        finalizeVideo();
    }  
}

//record html canvas element and export as mp4 video
//source: https://devtails.xyz/adam/how-to-save-html-canvas-to-mp4-using-web-codecs-api
async function recordVideoMuxer() {
    console.log("start muxer video recording");
    var videoWidth = Math.floor(canvas.width/2)*2;
    var videoHeight = Math.floor(canvas.height/8)*8; //force a number which is divisible by 8
    console.log("Video dimensions: "+videoWidth+", "+videoHeight);

    //display user message
    recordingMessageCountdown(videoDuration);
    recordingMessageDiv.classList.remove("hidden");

    recordVideoState = true;
    const ctx = animation.getContext("2d", {
      // This forces the use of a software (instead of hardware accelerated) 2D canvas
      // This isn't necessary, but produces quicker results
      willReadFrequently: true,
      // Desynchronizes the canvas paint cycle from the event loop
      // Should be less necessary with OffscreenCanvas, but with a real canvas you will want this
      desynchronized: true,
    });
  
    muxer = new Mp4Muxer.Muxer({
      target: new Mp4Muxer.ArrayBufferTarget(),
    //let muxer = new Muxer({
        //target: new ArrayBufferTarget(),
        video: {
            // If you change this, make sure to change the VideoEncoder codec as well
            codec: "avc",
            width: videoWidth,
            height: videoHeight,
        },
  
      // mp4-muxer docs claim you should always use this with ArrayBufferTarget
      fastStart: "in-memory",
    });
  
    videoEncoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => console.error(e),
    });
  
    // This codec should work in most browsers
    // See https://dmnsgn.github.io/media-codecs for list of codecs and see if your browser supports
    videoEncoder.configure({
      codec: "avc1.42003e",
      width: videoWidth,
      height: videoHeight,
      bitrate: 10_000_000,
      bitrateMode: "constant",
    });
    //NEW codec: "avc1.42003e",
    //ORIGINAL codec: "avc1.42001f",

    recordVideoState = true;
    var frameNumber = 0;
    setTimeout(finalizeVideo,1000*videoDuration+200); //finish and export video after x seconds
    
    //take a snapshot of the canvas every x miliseconds and encode to video
    videoRecordInterval = setInterval(
        function(){
            if(recordVideoState == true){
                renderCanvasToVideoFrameAndEncode({
                    animation,
                    videoEncoder,
                    frameNumber,
                    videofps
                })
                frameNumber++;
            }else{
            }
        } , 1000/videofps);

}

//finish and export video
async function finalizeVideo(){
    console.log("finalize muxer video");
    recordVideoState = false;
    clearInterval(videoRecordInterval);
    // Forces all pending encodes to complete
    await videoEncoder.flush();
    muxer.finalize();
    let buffer = muxer.target.buffer;
    finishedBlob = new Blob([buffer]); 
    downloadBlob(new Blob([buffer]));

    //hide user message
    recordingMessageDiv.classList.add("hidden");
    
}
  
async function renderCanvasToVideoFrameAndEncode({
    canvas,
    videoEncoder,
    frameNumber,
    videofps,
}) {
    let frame = new VideoFrame(animation, {
        // Equally spaces frames out depending on frames per second
        timestamp: (frameNumber * 1e6) / videofps,
    });

    // The encode() method of the VideoEncoder interface asynchronously encodes a VideoFrame
    videoEncoder.encode(frame);

    // The close() method of the VideoFrame interface clears all states and releases the reference to the media resource.
    frame.close();
}

function downloadBlob() {
    console.log("download video");
    let url = window.URL.createObjectURL(finishedBlob);
    let a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    const date = new Date();
    const filename = `nagai_${date.toLocaleDateString()}_${date.toLocaleTimeString()}.mp4`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
}

//record and download videos on mobile devices
function startMobileRecording(){
    var stream = animation.captureStream(videofps);
    mobileRecorder = new MediaRecorder(stream, { 'type': 'video/mp4' });
    mobileRecorder.addEventListener('dataavailable', finalizeMobileVideo);

    console.log("start simple video recording");
    console.log("Video dimensions: "+animation.width+", "+animation.height);

    //display user message
    recordingMessageCountdown(videoDuration);
    recordingMessageDiv.classList.remove("hidden");
    
    recordVideoState = true;
    refresh(); //start animation
    mobileRecorder.start(); //start mobile video recording

    setTimeout(function() {
        mobileRecorder.stop();
    }, 1000*videoDuration+200);
    
}

function finalizeMobileVideo(e) {
    setTimeout(function(){
        console.log("finish simple video recording");
        recordVideoState = false;
        /*
        mobileRecorder.stop();*/
        var videoData = [ e.data ];
        finishedBlob = new Blob(videoData, { 'type': 'video/mp4' });
        downloadBlob(finishedBlob);
        
        //hide user message
        recordingMessageDiv.classList.add("hidden");

    },500);

}

function recordingMessageCountdown(duration){

    var secondsLeft = Math.ceil(duration);

    var countdownInterval = setInterval(function(){
        secondsLeft--;
        recordingMessageDiv.innerHTML = 
        "Video recording underway. The video will be saved to your downloads folder in <span id=\"secondsLeft\">"+secondsLeft+"</span> seconds.<br><br>This feature can be a bit buggy on Mobile -- if it doesn't work, please try on Desktop instead.";  
        
        if(secondsLeft <= 0){
            console.log("clear countdown interval");
            clearInterval(countdownInterval);
        }
    },1000);
    
}
