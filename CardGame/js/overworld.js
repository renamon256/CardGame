"use strict"

var app = app || {};


app.overworld = {
		init : function(){console.log("overworld init");},
		update : function(){
			this.drawOverworld();
		},
		
		drawOverworld : function(){
			app.main.ctx.save();
			this.clearCanvas();
			

			this.drawButton("Battle", app.main.WIDTH/3, app.main.HEIGHT/2, 200, 50);
			this.drawButton("Deck Builder", app.main.WIDTH - app.main.WIDTH/3, app.main.HEIGHT/2, 200, 50);
			
			
			
			app.main.ctx.restore();
		},
		
		clearCanvas : function(){
			app.main.ctx.fillStyle = "white";
			app.main.ctx.fillRect(0,0, app.main.WIDTH, app.main.HEIGHT);
		},
		
		drawButton : function(bttnStr, x, y, width, height){
			var ctx = app.main.ctx;
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
			
		},
		
		getButtonPressed(bttnStr){
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


