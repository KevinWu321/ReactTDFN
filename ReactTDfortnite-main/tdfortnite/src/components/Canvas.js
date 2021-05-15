import React, { useRef, useEffect } from 'react'

var canvas = null;
var data = null;
var totalMovement = {};

class Pair {
	constructor(x,y){
		this.x=x; this.y=y;
	}

	toString(){
		return "("+this.x+","+this.y+")";
	}

	normalize(){
		var magnitude=Math.sqrt(this.x*this.x+this.y*this.y);
		if (magnitude === 0){
			this.x = 0;
			this.y = 0;
		} else {
			this.x=this.x/magnitude;
			this.y=this.y/magnitude;
		}
	}
}

function isInFrame(context, object, data){
		var frameReference = new Pair(data.gameData.player.position.x - context.canvas.width/2, data.gameData.player.position.y - context.canvas.height/2)
		var renderX;
		var renderY;
		var renderLength;
		var renderheight;


		//Check if in frame and create desired dimension
		//of parts within the frame
		if (object.position.x - frameReference.x > 0 && object.position.x - frameReference.x < context.canvas.width){
			renderX = object.position.x - frameReference.x;
			renderLength = object.length;
		} else if (object.length + object.position.x - frameReference.x > 0 && object.length + object.position.x - frameReference.x < context.canvas.width){
			renderX = 0;
			renderLength = object.length + object.position.x - frameReference.x;
		} else {
			return -1;
		}

		if (object.position.y - frameReference.y > 0 && object.position.y - frameReference.y < context.canvas.height){
			renderY = object.position.y - frameReference.y;
			renderheight = object.height;
		} else if (object.height + object.position.y - frameReference.y > 0 && object.height + object.position.y - frameReference.y <  context.canvas.height){
			renderY = 0;
			renderheight = object.height + object.position.y - frameReference.y;
		}else {
			return -1;
		}
		return [new Pair(renderX, renderY), new Pair(renderLength, renderheight)]
	}


function drawBorder(context, data){
    context.fillStyle = 'white'
	context.strokeStyle = 'black';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)
	context.strokeRect(0, 0, context.canvas.width, context.canvas.height);
}

function drawPlayer(context, data){
		//health information
		context.fillStyle = 'rgba('+46+','+49+','+49+','+1+')';
		context.fillRect(25, canvas.height - 25, 200*(canvas.width/800), 20);

		context.fillStyle = 'rgba('+255+','+0+','+0+','+1+')';
		context.fillRect(25, canvas.height - 25, Math.max(200*(canvas.width/800)*data.gameData.player.health/100,0), 20);

		
		//ammo information
		context.fillStyle = 'rgba('+0+','+0+','+0+','+1+')';
		context.font = "30px Arial";
		context.fillText(data.gameData.player.ammo + " | " + data.gameData.player.totalAmmo, canvas.width - 120, canvas.height - 10); 
		context.fillText(data.gameData.player.score, 20, 40); 
		
		//draw player weapon
		/*
		context.save();
		var weapon = new Image();
		weapon.src = String(data.gameData.player.weapon.colour);
		context.translate(data.gameData.player.position.x + 10,data.gameData.player.position.y + 10);
		context.drawImage(weapon, -2, -2,  32, 16);
		context.restore();
		*/
	
	}
	
function drawObjects(context, data){
	for(var i = 0; i < data.gameData.objects.length; i++){
		var renderInfo = isInFrame(context, data.gameData.objects[i], data);
		if (renderInfo === -1){
			//console.log("not in render range");
		}
		
		/*
		else if ((data.gameData.objects[i].position.x == data.gameData.player.position.x) && (data.gameData.objects[i].position.y == data.gameData.player.position.y)){
			console.log("this is the players stuff");
			console.log(data.gameData.objects[i]);
		}
		*/
		
		else if (String(data.gameData.objects[i].colour).includes('rgba')){
			//console.log("printing RGB object");
			context.fillStyle = data.gameData.objects[i].colour;
			context.fillRect(renderInfo[0].x, renderInfo[0].y, renderInfo[1].x, renderInfo[1].y);
		}
		
		else {
			//console.log("printing Image object");
			
			if(String(data.gameData.objects[i].colour).includes('pistol') || String(data.gameData.objects[i].colour).includes('shotgun') || String(data.gameData.objects[i].colour).includes('sniper')){
				
				context.save();
				var weapon = new Image();
				weapon.src = String(data.gameData.objects[i].colour);
				//console.log(String(data.gameData.objects[i].colour));
				context.translate(renderInfo[0].x + 10,renderInfo[0].y + 10);
				var frameReference = new Pair(data.gameData.player.position.x - context.canvas.width/2, data.gameData.player.position.y - context.canvas.height/2);
				context.rotate(-1*(Math.atan2(data.gameData.objects[i].pointDirection.x - renderInfo[0].x - frameReference.x, data.gameData.objects[i].pointDirection.y - renderInfo[0].y - frameReference.y)-Math.PI/2));
				context.drawImage(weapon, -2, -2,  32, 16);
				context.restore();

			}
			
			else{
				var image = new Image();
				image.src = String(data.gameData.objects[i].colour);
				//console.log(String(data.gameData.objects[i].colour));
				var srcx;
				var srcy;
				renderInfo[0].x === 0 ? srcx = data.gameData.objects[i].length - renderInfo[1].x : srcx = 0;
				renderInfo[0].y === 0 ? srcy = data.gameData.objects[i].height - renderInfo[1].y : srcy = 0;
				context.drawImage(image, srcx, srcy, renderInfo[1].x, renderInfo[1].y, renderInfo[0].x, renderInfo[0].y, renderInfo[1].x, renderInfo[1].y,);
			}
			
		}
		
	}
	
}

function drawBoundry(context, data){
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	context.fillStyle = 'rgba(0,255,0,1)';
	context.fillRect(Math.min(0, data.gameData.player.position.x - context.canvas.width/2)*-1, 
							Math.min(0, data.gameData.player.position.y - context.canvas.height/2)*-1,
							Math.min(context.canvas.width, (4000 - (data.gameData.player.position.x - context.canvas.width/2 - 20))),
							Math.min(context.canvas.height, (4000 - (data.gameData.player.position.y - context.canvas.height/2 - 20))));
}

function shoot(event){
	//find where the mouse was clicked
	var rect = canvas.getBoundingClientRect();
	var x = event.pageX - rect.left;
	var y = event.pageY - rect.top;
	var obj = null;
	
	console.log(x)
	console.log(canvas.width)
	console.log(canvas.height)
	console.log(y)
	
	if((x > canvas.width - 120) && (y > canvas.height - 50) && (canvas.width !== 800)){
		obj = {type: "reload"};
		data.socket(obj);
		console.log(obj);
	}
	
	else{
		var velocity = new Pair(x - canvas.width/2, y - canvas.height/2);
		obj = {type: "shoot", velocity: velocity}
		data.socket(obj)
		//console.log(obj);
	}

}

function aim(event){
	var rect = canvas.getBoundingClientRect();
	var x = event.pageX - rect.left;
	var y = event.pageY - rect.top;
	var velocity = new Pair (data.gameData.player.position.x + x - canvas.width/2,data.gameData.player.position.y + y - canvas.height/2);
	var obj = {type: "point", velocity: velocity}
	data.socket(obj)
}

function reload(event){
	var key = event.key;
	console.log(key);
	if(key === 'r'){
		var obj = {type: "reload"};
		data.socket(obj);
		console.log(obj);
	}
}

function moveByKey(event){
	var key = event.key;
	var moveMap = {
		'a': new Pair(-20,0),
		's': new Pair(0,20),
		'd': new Pair(20,0),
		'w': new Pair(0,-20)
	};
	if(key in moveMap){
                totalMovement[key] = event.type === 'keydown';
	}

        var x = 0;
        var y = 0;

        for (key in totalMovement) {
                if (totalMovement[key]){
                        x += moveMap[key].x;
                        y += moveMap[key].y;
                }
        }
		var obj = {type: "move", velocity: new Pair(x,y)}
		data.socket(obj);
}

function move(event){
	if (event.type === 'touchmove'){
		var left = canvas.getBoundingClientRect().left;
		var top = canvas.getBoundingClientRect().top;
		var obj = {type: "move", velocity:new Pair(event.touches[0].pageX-left-canvas.width/2,event.touches[0].pageY-top-canvas.height/2)}
		data.socket(obj);
	} else {
		var obj = {type: "move", velocity:new Pair(0,0)}
		data.socket(obj);
	}
}

const Canvas = props => {
	const canvasRef = useRef(null)
	canvas = canvasRef.current;
	data = props;
	var width = props.width;
	var height = props.height;
	
	useEffect(() => {
		const canvas = canvasRef.current
		const context = canvas.getContext('2d')
		context.canvas.width = width
		context.canvas.height = height
		canvas.width = width
		canvas.height = height
		
		canvas.addEventListener('click', shoot);
		canvas.addEventListener('keydown', reload);
		canvas.addEventListener('keydown', moveByKey);
		canvas.addEventListener('keyup', moveByKey);
		canvas.addEventListener("mousemove", aim);
		canvas.addEventListener("touchmove", move)
		canvas.addEventListener("touchend", move)
		canvas.addEventListener("touchcancel", move)


		drawBorder(context, data)
		if (data.gameData != null){
			drawBoundry(context, data)
			drawObjects(context, data)
			drawPlayer(context, data)
		}
	})

	return (
	<div>
		<canvas tabIndex="0" ref={canvasRef}/>
	</div>
	);
}

export default Canvas