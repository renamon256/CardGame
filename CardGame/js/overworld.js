"use strict"

var app = app || {};


app.overworld = {
		objects : [],
		playerAvatar : {
			id : "player",
			x: 500,
			y: 300,
			z: 0,
			width: 100,//x
			depth: 50, //y
			hieght: 200, //z
			speed: 6,
			target : {x: 500, y: 300, z:0},
			isColliding : false,
			scale : 0,
		},
		currentCellId : "testCell",
		perspectiveScale : 1,
		world : null,
		perspectiveDistance : 500,
		copyObject : null,
		boundingBoxVisible : true,
		
		
		init : function(){
			console.log("overworld init");
			this.copyObject = function(objPrefab, objWorld){
				this.imgref = objPrefab.id; //common name that multiple of the same object use, used for images
				this.id = objPrefab.id + app.main.idNum;
				console.log(this.id);
				this.x = objWorld.x ;
				this.y = objWorld.y;
				this.z = 0;
				this.speed = 0;
				this.width = objPrefab.width;
				this.depth = objPrefab.depth;
				this.hieght = objPrefab.hieght;
				this.isColliding = false;
				this.imageDir = objPrefab.imageDir;
				this.type = objPrefab.type;
				if (objWorld.scale == null){this.scale = 1}else{this.scale = objWorld.scale;}
				if (this.type == "enemy"){this.enemies = objPrefab.enemies}
				app.main.idNum++;
			}
			this.getWorld();
			this.getCell();
			
			
			this.objects.push(this.playerAvatar);
		},
		update : function(){
			this.drawOverworld();
			if (app.main.isLMouseDown){
				this.playerAvatar.target.x = app.main.mouseX;
				this.playerAvatar.target.y = app.main.mouseY;
			}
			console.log(app.main.keyDown);
			//keyboardMovement
			if (app.main.keyDown == 'w' || app.main.keyDown == 'ArrowUp'){this.playerAvatar.target.y = this.playerAvatar.y - 20;}
			if (app.main.keyDown == 's' || app.main.keyDown == 'ArrowDown'){this.playerAvatar.target.y = this.playerAvatar.y + 20;}
			if (app.main.keyDown == 'd' || app.main.keydown == 'ArrowRight'){this.playerAvatar.target.x = this.playerAvatar.x + 20;}
			if (app.main.keyDown == 'a' || app.main.keydown == 'ArrowLeft'){this.playerAvatar.target.x = this.playerAvatar.x - 20;}
			
			if (app.main.keyDown != ""){app.main.keyDown = ""}
			
			var moveX = this.playerAvatar.target.x - this.playerAvatar.x;
			var moveY = this.playerAvatar.target.y - this.playerAvatar.y;
			if (Math.abs(moveX) + Math.abs(moveY) > 5){
				var vector = normalize(moveX, moveY, 0);
				vector = multiplyVector (vector, this.playerAvatar.speed)
				this.move(this.playerAvatar, vector);
			}
			
			
			this.collisionDetection();
			
		},
		
		
		drawOverworld : function(){
			app.main.ctx.save();
			//organize based on y
			this.objects.sort(function(a, b){
				return a.y - b.y;
			});
			
			this.organizeObjects
			this.clearCanvas();
			
			//this.drawButton("Battle", app.main.WIDTH/3, app.main.HIEGHT/2, 200, 50);
			//this.drawButton("Deck Builder", app.main.WIDTH - app.main.WIDTH/3, app.main.HIEGHT/2, 200, 50);
			this.renderObjects();
			
			drawFPS();
			app.main.ctx.restore();
		},
		
		move(object, array){
			
			object.x += array.x;
			object.y += array.y * object.y/this.perspectiveDistance; 
			object.z += array.z;
			
		},
		
		renderObjects(){
			for (var i = 0; i < this.objects.length; i++){
				var object = this.objects[i];
				this.renderObject(object);
			}
		},
		
		renderObject(object){
			//console.log(object.id + " " + object.y);
			var ctx = app.main.ctx;
			var x = object.x;
			var y = object.y;
			var z = object.z;
			var scale = y/this.perspectiveDistance;
			//object.scale = scale;
			ctx.save();
			if (object.isColliding){ctx.fillStyle = "red";}
			else{ctx.fillStyle = "black";}
			ctx.transform(scale * object.scale, 0, 0, scale * object.scale, x, y + z);
			if (document.getElementById(object.imgref) != null){
				var img = document.getElementById(object.imgref);
				ctx.drawImage(img, -object.width/2, -object.hieght);
			}
			else {ctx.fillRect(-object.width/2, -object.hieght, object.width, object.hieght);}
			ctx.restore();
			
			if (this.boundingBoxVisible){this.renderBoundingBox(object)}
		},
		
		clearCanvas : function(){
			app.main.ctx.fillStyle = "white";
			app.main.ctx.fillRect(0,0, app.main.WIDTH, app.main.HIEGHT);
		},
		
		drawButton : function(bttnStr, x, y, width, height){
			var ctx = app.main.ctx;
			ctx.save();
			app.main.ctx.setTransform(1,0,0,1, x, y);
			ctx.strokeStyle = "black";
			ctx.fillStyle = "white";
			ctx.fillRect(-width/2,-height/2,width,height);
			ctx.strokeRect(-width/2,-height/2,width,height);
			ctx.fillStyle = "black";
			ctx.font = "28px Arial";
			ctx.textAlign = "center";
			ctx.fillText(bttnStr, 0, 0);
			if (app.main.mouseY >= y - height/2 && app.main.mouseY <= y + height/2){
				if(app.main.mouseX >= x - width/2 && app.main.mouseX <= x + width/2){
					if(app.main.isLMouseDown == true){
						this.getButtonPressed(bttnStr);
					}
				}
			}
			ctx.restore();
			
		},
		
		getButtonPressed(bttnStr){
			app.main.isLMouseDown = false;
			if (bttnStr == "Battle"){
				console.log("chose battle");
				var numEnemies = (Math.random() * (4.49) + 1);
				numEnemies = Math.round(numEnemies);
				//numEnemies = 1;
				var enemies = [];
				for (var i = 0; i < numEnemies; i++){
					var randNum = Math.round(Math.random() * 3.49);
					if (randNum == 0){enemies.push("bug");}
					else if (randNum == 1){enemies.push("Rock");}
					else {enemies.push("Mushroom");}
				}
				app.main.gameStart(enemies);
			}
			else if (bttnStr == "Deck Builder"){
				console.log("chose deck builder");
				app.main.GAMEMODE = "DECKBUILDER";
			}
		},
		
		collisionDetection(){
			for (var i = 0; i < this.objects.length; i++){
				this.objects[i].isColliding = false;
			}
			
			for (var i = 0; i < this.objects.length - 1; i++){
					for (var j = i + 1; j < this.objects.length; j++){
						if (this.objects[i].type != "dec" &&  this.objects[j].type != "dec"){
							this.checkCollisionBetweenObjects(this.objects[i], this.objects[j]);
						}
					}
			}
		},
		
		checkCollisionBetweenObjects(obj1, obj2){
			if (obj1.x + obj1.width/2 * obj1.scale > obj2.x - obj2.width/2 * obj2.scale){
				if (obj1.x - obj1.width/2 * obj1.scale < obj2.x + obj2.width/2 * obj2.scale){
					if (obj1.y + obj1.depth/2 * obj1.scale > obj2.y - obj2.depth/2 * obj2.scale){
						if (obj1.y - obj1.depth/2 * obj1.scale < obj2.y + obj2.depth/2 * obj2.scale){
							obj1.isColliding = true;
							obj2.isColliding = true;
							this.resolveCollision(obj1, obj2);
						}
						else{return;}
					}
					else{return;}
				}
				else{return;}
			}
		},
		
		renderBoundingBox(obj){
			
			var ctx = app.main.ctx;
			var x = obj.x;
			var y = obj.y;
			var z = obj.z;
			var width = obj.width;
			var depth = obj.depth;
			var hieght = obj.hieght;
			var scale = y/this.perspectiveDistance;
			var scaleBack = y/this.perspectiveDistance;
			var scaleFront = (y + depth)/this.perspectiveDistance;
			ctx.save();
			ctx.transform(1, 0, 0, 1, x, y + z);
			ctx.strokeStyle = "green"
			ctx.lineWidth = 3;
			if (obj.isColliding){ctx.strokeStyle = "red"}
			ctx.beginPath();
			//back
			ctx.moveTo((-width/2) * scaleBack, 0);
			ctx.lineTo((width/2) * scaleBack, 0);
			ctx.lineTo((width/2) * scaleBack, -hieght * scaleBack);
			ctx.lineTo((-width/2) * scaleBack, -hieght * scaleBack);
			ctx.lineTo((-width/2) * scaleBack, 0);
			//front
			ctx.moveTo((-width/2) * scaleFront, 0);
			ctx.lineTo((width/2) * scaleFront, 0);
			ctx.lineTo((width/2) * scaleFront, -hieght * scaleFront);
			ctx.lineTo((-width/2) * scaleFront, -hieght * scaleFront);
			ctx.lineTo((-width/2) * scaleFront, 0);
			//side
			ctx.moveTo((-width/2) * scaleBack, 0);
			ctx.lineTo((-width/2) * scaleFront, 0);
			ctx.moveTo((width/2) * scaleBack, 0);
			ctx.lineTo((width/2) * scaleFront, 0);
			ctx.moveTo((width/2) * scaleBack, -hieght * scaleBack);
			ctx.lineTo((width/2) * scaleFront, -hieght * scaleFront);
			ctx.moveTo((-width/2) * scaleBack, -hieght * scaleBack);
			ctx.lineTo((-width/2) * scaleFront, -hieght * scaleFront);
			
			ctx.stroke();
			ctx.restore();
		},
		
		resolveCollision(obj1, obj2){
			if (obj1.type == "enemy" && obj2.id == "player"){app.main.gameStart(obj1.enemies, obj1.id)}
			if (obj2.type == "enemy" && obj1.id == "player"){app.main.gameStart(obj2.enemies, obj2.id)}
			
			var vector = normalize(obj1.x - obj2.x, obj1.y - obj2.y,obj1.z - obj2.z)
			var obj1vector = multiplyVector(vector, obj1.speed * 2);
			this.move(obj1, obj1vector);
			
			var obj2vector = multiplyVector(vector, obj2.speed * 2);
			obj2vector = multiplyVector(vector, -1);
			this.move(obj2, obj2vector);
			//console.log(obj1.id + "x: " + obj1.x + "y:" + obj1.y + "z:" + obj1.z)
			
		},
		
		loadCell(){
			var xhrDeck = new XMLHttpRequest();
			
			xhrDeck.onload = function(){
				
			}
			
			xhrDeck.open('GET',"js/world.json",true);
			xhrDeck.send();
		},
		
		getWorld(){
			console.log("loading world");
			if (!this.world){
			var xhrDeck = new XMLHttpRequest();
			xhrDeck.onload = function(){
					var myJSON = eval('(' + xhrDeck.responseText + ')');
					app.overworld.world = myJSON;
				}
				xhrDeck.open('GET',"js/world.json",false);
				xhrDeck.send();
			}
		},
		
		getCell(){
			var xhrDeck = new XMLHttpRequest();
			console.log("loading cell");
			xhrDeck.onload = function(){
					var myJSON = eval('(' + xhrDeck.responseText + ')');
					var pObjects = myJSON.objects; //object that comes from objects
					app.overworld.objects = [];
					for (var i = 0; i < app.overworld.world.cells.length; i++){
						if (app.overworld.world.cells[i].id == app.overworld.currentCellId){
							for (var j = 0; j < app.overworld.world.cells[i].objects.length; j++){
								var wObj =  app.overworld.world.cells[i].objects[j]; //object that comes from world
								for (var k = 0; k < pObjects.length; k++){
									if (pObjects[k].id == wObj.id){
										var pObject = pObjects[k];
										var tempObj = new app.overworld.copyObject(pObject, wObj);
										app.overworld.objects.push(tempObj);
										addImage(tempObj.imageDir, tempObj.imgref);
									}
								}
							}
						}
					}
				}
			xhrDeck.open('GET',"js/objects.json",false);
			xhrDeck.send();
		},
		
		removeObj(id){
			for (var i = 0; i < this.objects.length; i++){
				if (this.objects[i].id == id){
					this.objects.splice(i,1);
				}
			}
		}
		
};

function addImage(imagePath, imgref){
	
	if (imagePath != null && imagePath != undefined){
	if (document.getElementById(imgref) == null){
		var newImg = document.createElement("img");
		//newImg.src = "images/npc/rock/rock01.png";
		newImg.src = imagePath;
		newImg.id = imgref;
		
		document.getElementById("images").append(newImg);
	}
	}
}

function normalize(ix,iy,iz){
	var c = Math.sqrt((ix * ix) + (iy * iy) + (iz * iz))
	var array = {x: ix/c, y : iy/c, z : iz/c}
	return array;
}

function multiplyVector(vector, i){
	vector.x = vector.x * i;
	vector.y = vector.y * i;
	vector.z = vector.z * i;
	return vector;
}



function drawFPS(){
	var ctx = app.main.ctx;
	var fps = Math.round(app.main.fps);
	
	ctx.save();
	ctx.font = "50px Arial";
	ctx.fillStyle = "black";
	ctx.textAlign = "left";
	ctx.fillText(fps, 30, 50);
	ctx.restore();
}


