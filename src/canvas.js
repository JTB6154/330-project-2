/*
	The purpose of this file is to take in the analyser node and a <canvas> element: 
	  - the module will create a drawing context that points at the <canvas> 
	  - it will store the reference to the analyser node
	  - in draw(), it will loop through the data in the analyser node
	  - and then draw something representative on the canvas
	  - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';

let ctx,canvasWidth,canvasHeight,gradient,analyserNode,audioData;

const pyreInfo = 
{
    spacing : 4,
    margin : 5,
    startpos: 244,
    endpos: 795,
    width : 0,
    barWidth : 0,
    barHeight :300,
    topSpacing: 440,
    travelDistance: 100,
    fillStyle : 'rgba(202,23,62,1)',
    strokeStyle: 'rgba(0,0,0,0.50)',
    backgroundColor: 'rgb(9,13,33)',
    // starX:          600,
    // starY:          200,
    // starDotRadius: 12,
    // starPointWidth: 10,
    // starCircle: 5,
    // starColor: 'rgb(233,220,220)',
    // strokeWidth: 1,
    sinusoidFrequency1: 5,
    sinusoidFrequency2: 26,
    sinusoidFrequency3: 35,
    sinusoid1Width: 45,
    sinusoid2Width: 27,
    sinusoid3Width: 10,
    sinusoid1Stroke: 'rgba(0,138,239,1)',
    sinusoid2Stroke: 'rgba(167,64,191,1)',
    sinusoid3Stroke: 'rgba(185,185,185,1)',
    sinusoidY:500,
    sinusoidMaxDistance: 75
};

const ror2Info = 
{
    spacing : 2,
    centerX: 500,
    centerY: 450,
    innerRadius: 150,
    outerRadius: 600,
    minTheta: 0,
    maxTheta: Math.PI,
    width : 0,
    barWidth : 0,
    fillStyle : 'rgb(72,33,73)',
    strokeStyle: 'rgba(0,0,0,0.50)',
    backgroundColor: 'rgb(72,33,73)',
};

const hkInfo = 
{
    startpos: 0,
    margin : 5,
    endpos: 551,
    spacing : 2,
    barY: 0,
    maxYDistance: 100,
    width : 0,
    barWidth : 0,
    barHeight: 400,
    fillStyle : 'rgb(72,33,73)',
    strokeStyle: 'rgba(0,0,0,0.50)',
    backgroundColor: 'rgb(0,0,0)',
    gradients: [[{color: 'rgb(255,100,110)',percent: 0},{color: 'rgb(118,26,53)', percent: 1}],[{color: 'rgb(100,255,110)',percent: 0},{color: 'rgb(26,118,53)', percent: 1}],[{color: 'rgb(255,255,255)',percent: 0},{color: 'rgb(118,118,118)', percent: 1}]],
    gradient,
    gradientIndex :0
}

function setupCanvas(canvasElement,analyserNodeRef){
	// create drawing context
	ctx = canvasElement.getContext("2d");
	canvasWidth = canvasElement.width;
	canvasHeight = canvasElement.height;
	// create a gradient that runs top to bottom
	gradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0,color:"#e26d5c"},{percent:.5,color:"#F7F7FF"},{percent:1,color:"#279AF1"}]);
	// keep a reference to the analyser node
	analyserNode = analyserNodeRef;
	// this is the array where the analyser data will be stored
    audioData = new Uint8Array(analyserNode.fftSize/2);

    pyreInfo.width = (pyreInfo.endpos - pyreInfo.startpos) - (audioData.length * pyreInfo.spacing) - pyreInfo.margin * 2;
    pyreInfo.barWidth = pyreInfo.width / audioData.length;

    ror2Info.width = (ror2Info.outerRadius - ror2Info.innerRadius) - (audioData.length * ror2Info.spacing);
    ror2Info.barWidth = ror2Info.width / audioData.length;

    hkInfo.width = (hkInfo.endpos - hkInfo.startpos) - (audioData.length * hkInfo.spacing) - hkInfo.margin * 2;
    hkInfo.barWidth = hkInfo.width / audioData.length;
    updateHKGradient();
}


function draw(params={},imageArray){
  // 1 - populate the audioData array with the frequency data from the analyserNode
	// notice these arrays are passed "by reference" 
	analyserNode.getByteFrequencyData(audioData);
	// OR
	//analyserNode.getByteTimeDomainData(audioData); // waveform data
    if(params.drawType == 'pyre')
    {
        drawPyre(imageArray);
    }

    if(params.drawType == 'ror2')
    {
        drawROR2(imageArray);
    }

    if(params.drawType == 'hk')
    {
        drawHK(imageArray,params);
    }
	
    


    // 6 - bitmap manipulation
	// TODO: right now. we are looping though every pixel of the canvas (320,000 of them!), 
	// regardless of whether or not we are applying a pixel effect
	// At some point, refactor this code so that we are looping though the image data only if
	// it is necessary

	// A) grab all of the pixels on the canvas and put them in the `data` array
	// `imageData.data` is a `Uint8ClampedArray()` typed array that has 1.28 million elements!
    // the variable `data` below is a reference to that array 
    let imageData = ctx.getImageData(0,0,canvasWidth,canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width
    
	// B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
    for(let i=0 ; i<length; i+=4){ 
        let red = data[i], green = data[i+1], blue = data[i+2]
        let avg = (data[i] + data[i+1] + data[i+2])/3       
        if(params.showInvert){
            data[i] = 255-red;
            data[i+1] = 255-green;
            data[i+2] = 255-blue;
        }//end if

        if(params.showGrayScale)
        {
            utils.setToValue(data,avg,i,3);
        }

        if(params.redFilter)
        { //if the red filter is enabled
            if(red < params.colorThreshold || blue >= red || green >= red ) utils.setToValue(data,avg,i,3);//set image to grayscale
            else{
                //or remove blue and green
                data[i+1] = avg;
                data[i+2] =avg;
            }
        }
        if(params.greenFilter )
        {
            if( green < params.colorThreshold || blue >= green || red >= green ) utils.setToValue(data,avg,i,3);
            else{ 
                data[i] = avg;
                data[i+2] = avg;
            }
        }
        if(params.blueFilter)
        {
            if (blue < params.colorThreshold || red >= blue || green >= blue )utils.setToValue(data,avg,i,3);
            else{
                data[i] = avg;
                data[i+1] = avg;
            }
        }
    }// end for

    if(params.showEmboss)
    {
        for(let i=0; i<length;i++)
        {
            if(i%4 == 3) continue;
            data[i] = 127 + 2*data[i] - data[i+4] - data[i + width*4];
        }
    }
	
	// D) copy image data back to canvas
	ctx.putImageData(imageData,0,0);
}

function drawPyre(imageArray)
{
    //draw background
    cls(pyreInfo.backgroundColor);


    // draw circles
    let maxRadius = canvasHeight/3;
    ctx.save();
    ctx.globalAlpha = 0.5;
    for(let i=0; i<audioData.length; i++)
    {
        let percent = audioData[i] / 255;
        let circleRadius = percent * maxRadius;
        //blue circles
        ctx.beginPath();
        ctx.fillStyle = utils.makeColor(10,138,239,.25 - percent /3.0);
        ctx.arc(125,500, circleRadius * 1.5 ,0,2*Math.PI,false);
        ctx.fill();
        ctx.closePath();
    }
    ctx.restore()

    //draw logo cutout
    ctx.save();
    ctx.drawImage(imageArray[0],0,0,canvasWidth,canvasHeight);
    ctx.restore();

    //draw bars
    drawHorizontalBars(audioData,pyreInfo.fillStyle,pyreInfo.strokeStyle,pyreInfo.startpos,pyreInfo.margin,pyreInfo.barWidth,pyreInfo.barHeight,pyreInfo.spacing,pyreInfo.topSpacing,pyreInfo.travelDistance)

    //draw sinusoids

    let percent = utils.getFrequencyPercent(audioData[pyreInfo.sinusoidFrequency1]);
    let yDistance = percent * pyreInfo.sinusoidMaxDistance;
    drawSinusoid(pyreInfo.startpos,pyreInfo.endpos,pyreInfo.sinusoidY,yDistance,pyreInfo.sinusoid1Width,pyreInfo.sinusoid1Stroke,2);

    percent = utils.getFrequencyPercent(audioData[pyreInfo.sinusoidFrequency2]);
    yDistance = percent*pyreInfo.sinusoidMaxDistance;
    drawSinusoid(pyreInfo.startpos,pyreInfo.endpos,pyreInfo.sinusoidY,-yDistance,pyreInfo.sinusoid2Width,pyreInfo.sinusoid2Stroke,3);

    percent = utils.getFrequencyPercent(audioData[pyreInfo.sinusoidFrequency3]);
    yDistance = percent * pyreInfo.sinusoidMaxDistance;
    drawSinusoid(pyreInfo.startpos,pyreInfo.endpos,pyreInfo.sinusoidY,yDistance,pyreInfo.sinusoid3Width,pyreInfo.sinusoid3Stroke,5);
    

    //draw top layer
    ctx.save();
    ctx.drawImage(imageArray[1],0,0,canvasWidth,canvasHeight);
    ctx.restore();

    //draw star - currently dropped, may return for final product
    // ctx.save();
    // ctx.fillStyle = drawPyre.fillStyle;
    // ctx.strokeStyle = drawPyre.starColor;
    // ctx.strokeWidth = drawPyre.strokeWidth;

    // //ctx.translate(-pyreInfo.starX,-pyreInfo.starY);

    // ctx.beginPath();
    // ctx.arc(0,0,pyreInfo.starDotRadius, 0, 2* Math.PI,false);
    // ctx.fill();
    // ctx.closePath();
    // ctx.restore();



}

function drawROR2(imageArray)
{
    //draw the background color
    cls(ror2Info.backgroundColor)
    ctx.drawImage(imageArray[3],0,0,canvasWidth,canvasHeight);
    ctx.save();
    ctx.fillStyle = ror2Info.fillStyle;

    for(let i=0; i <audioData.length; i++)
    {
        //draw outer circle
        let percent = audioData[i]/256;
        //ctx.arc(x,y,radius,start angle,end angle , false = ccw);
        let outerRadius = ror2Info.innerRadius + i * (ror2Info.barWidth + ror2Info.spacing);
        let innerRadius = outerRadius - ror2Info.barWidth;
        let angle = percent * ror2Info.maxTheta + ror2Info.minTheta;
        ctx.beginPath();
        ctx.arc(ror2Info.centerX,ror2Info.centerY,innerRadius, Math.PI,angle + Math.PI,false);
        ctx.arc(ror2Info.centerX,ror2Info.centerY,outerRadius, angle + Math.PI, Math.PI,true);
        ctx.fill();
        ctx.closePath();
        //clip with inner circle
    }
    ctx.restore();
    ctx.drawImage(imageArray[2],0,0,canvasWidth,canvasHeight);
}

function drawHK(imageArray,drawParams)
{

    //update gradient if need be
    if(drawParams.hkIndex != hkInfo.gradientIndex)
    {
        hkInfo.gradientIndex = drawParams.hkIndex;
        updateHKGradient();
    }
    //draw background image
    ctx.drawImage(imageArray[4],0,0,canvasWidth,canvasHeight);

    ctx.save();

    //move and rotate canvas
    ctx.rotate(-2 * Math.PI / 9);
    ctx.translate(350,650);
    //draw bars
    drawHorizontalBars(audioData,hkInfo.gradient,'black',-hkInfo.endpos/2,hkInfo.margin,hkInfo.barWidth,hkInfo.barHeight,hkInfo.spacing,hkInfo.barY,hkInfo.maxYDistance,128);
    //undo move and rotate
    ctx.restore();

    //draw image overtop
    ctx.drawImage(imageArray[5],0,0,canvasWidth,canvasHeight);
}

function drawHorizontalBars(audioData,fillStyle,strokeStyle,startpos,margin,barWidth,barHeight,spacing,topSpacing,travelDistance,audioDataPercentOf = 256)
{
    for(let i=0; i < audioData.length; i++)
    {
        ctx.save();
        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;

        ctx.beginPath()
        ctx.rect(startpos + margin + i * (barWidth + spacing), topSpacing + travelDistance * (audioDataPercentOf-audioData[i])/audioDataPercentOf,barWidth,barHeight)
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        ctx.restore();
    }
}

function drawSinusoid(startX,endX,y,amplitude,frequency,strokeStyle,strokeWidth)
{
    ctx.save();
    let currentX = 0;
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.strokeWidth = strokeWidth;
    ctx.moveTo(startX,y);
    while(currentX + startX < endX)
    {
        ctx.quadraticCurveTo(startX + currentX + frequency/2, amplitude + y,startX + currentX + frequency,y);
        currentX += frequency;
        ctx.quadraticCurveTo(startX + currentX + frequency/2, -amplitude + y,startX + currentX + frequency,y);
        currentX +=frequency;
    }
    ctx.stroke();
    ctx.closePath();

    ctx.restore();

}

function updateHKGradient()
{
    hkInfo.gradient = utils.getLinearGradient(ctx,hkInfo.startpos,hkInfo.barY,hkInfo.startpos,hkInfo.barY + hkInfo.maxYDistance,hkInfo.gradients[hkInfo.gradientIndex]);
}

function cls(backgroundColor = 'black')
{    //draw background
    ctx.save();
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    ctx.restore();
}

export {setupCanvas,draw};