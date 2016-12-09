"use strict"

var app = app || {};


app.overworld = {
		objects : [],
		playerAvatar : {
			id : "player",
			x: 500,
			y: 300,
			z: 0,
			width: 50,
			hieght: 100,
			speed: 6,
			target : {x: 500, y: 300, z:0}
		},
		perspectiveDistance : 500,
		
		init : function(){
			console.log("overworld init");
			this.objects.push(this.playerAvatar);
		},
		update : function(){
			this.drawOverworld();
			if (app.main.isLMouseDown){
				this.playerAvatar.target.x = app.main.mouseX;
				this.playerAvatar.target.y = app.main.mouseY
			}
			var moveX = this.playerAvatar.target.x - this.playerAvatar.x;
			var moveY = this.playerAvatar.target.y - this.playerAvatar.y;
			if (Math.abs(moveX) + Math.abs(moveY) > 5){
				var array = normalize(moveX, moveY, 0);
				this.move(this.playerAvatar, array);
			}
			
		},
		
		
		drawOverworld : function(){
			app.main.ctx.save();
			this.clearCanvas();
			

			this.drawButton("Battle", app.main.WIDTH/3, app.main.HEIGHT/2, 200, 50);
			this.drawButton("Deck Builder", app.main.WIDTH - app.main.WIDTH/3, app.main.HEIGHT/2, 200, 50);
			this.renderObjects();
			
			
			app.main.ctx.restore();
		},
		
		move(object, array){
			
			object.x += array.x * object.speed;
			object.y += array.y * object.speed * object.y/this.perspectiveDistance; 
			object.z += array.z * object.speed;	
			
		},
		
		renderObjects(){
			for (var i = 0; i < this.objects.length; i++){
				var object = this.objects[i];
				this.renderObject(object);
			}
		},
		
		renderObject(object){
			var ctx = app.main.ctx;
			var x = object.x;
			var y = object.y;
			var z = object.z;
			var scale = y/this.perspectiveDistance;
			ctx.save();
			ctx.fillStyle = "black";
			ctx.transform(scale, 0, 0, scale, x, y + z);
			ctx.fillRect(-object.width/2, -object.hieght, object.width, object.hieght);
			ctx.restore();
		},
		
		clearCanvas : function(){
			app.main.ctx.fillStyle = "white";
			app.main.ctx.fillRect(0,0, app.main.WIDTH, app.main.HEIGHT);
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
		
};

function normalize(ix,iy,iz){
	var c = Math.sqrt((ix * ix) + (iy * iy) + (iz * iz))
	var array = {x: ix/c, y : iy/c, z : iz/c}
	return array;
}


