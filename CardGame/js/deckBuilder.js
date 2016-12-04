"use strict"

var app = app || {};


app.deckBuilder = {
		availableCards : [],
		availableCardIndex : 0,
		playerDeck : [],
		deckIndex: 0,

		
		init : function(){console.log("deckbuilder init");},
		update : function(){
			this.availableCards = app.main.allCards;
			this.drawDeckBuilder();
		},
		
		drawDeckBuilder : function(){
			var ctx = app.main.ctx;
			this.clearCanvas();
			this.drawCards(this.availableCards);
			this.drawCards(this.playerDeck);
			this.drawButton("Save and Quit", 990, 50, 170, 50);
			this.drawButton("^Deck", 870, 50, 50, 50);
			this.drawButton("vDeck", 870, 550, 50, 50);
			this.drawButton("^availableCards", 30, 50, 50, 50);
			this.drawButton("vavailableCards", 30, 550, 50, 50);
			
			ctx.save();
			ctx.fillStyle = "black";
			ctx.font = "28px Arial";
			ctx.textAlign = "center";
			ctx.fillText("available Cards", 250, 30);
			ctx.fillText("player Deck", 650, 30);
			ctx.restore();
			
		},
		
		clearCanvas : function(){
			app.main.ctx.fillStyle = "grey";
			app.main.ctx.fillRect(0,0, app.main.WIDTH, app.main.HEIGHT);
		},
		
		drawCards : function(array){
			var row
			var column;
			var offsetX = 100;
			var offsetY = 100;
			var index = this.availableCardIndex;
			var length = this.availableCards.length;
			if (array == this.playerDeck){offsetX = 500; index = this.deckIndex; length = this.playerDeck.length}
			if (length >= index + 20){length = index + 20}
			
			for (var i = index; i < length; i++){
				row = Math.floor((i-index)/5);
				column = (i - index) - row * 5;
				
				this.drawCard(array[i], column * app.main.cardWidth/2 + offsetX, row * app.main.cardHeight/2 + offsetY, array, "medium")
			}
		},
		
		drawCard : function(card, x, y, array, size){
			var ctx = app.main.ctx;
			var halfWidth = app.main.cardWidth/2;
			var halfHeight = app.main.cardHeight/2;
			var arryNm = card.name.split(" ");//array for the name if its on more than one line
			var lCornerString = ""; //string for important stuff in left corner
			
			ctx.save();
			
			ctx.setTransform(1,0,0,1, x, y);
			if (size == "medium"){ctx.transform(.5,0,0,.5,0,0);}
			
			ctx.fillStyle = "white";
			ctx.fillRect(-1 * halfWidth, -1 * halfHeight, app.main.cardWidth, app.main.cardHeight );
			ctx.fillStyle = "black";
			ctx.strokeRect(-1 * halfWidth, -1 * halfHeight, app.main.cardWidth, app.main.cardHeight);
			
			//drawing text
			ctx.font = "28px Arial";
			ctx.textAlign = "center";
			for (var i = 0; i < arryNm.length; i++){	
				ctx.fillText(arryNm[i], 0, (-0.4 * halfHeight) + halfHeight * .2 * i);
			}
			ctx.textAlign = "left";
			
			if (card.type == "melee"){lCornerString += "M";}
			if (card.type == "defense"){lCornerString += "D"}
			
			lCornerString += card.pwr;
			
			if (card.play == "set"){lCornerString += "S"}
			
			ctx.fillText(lCornerString, -halfWidth * .9, -halfHeight * .75);
			ctx.textAlign = "right";
			if (card.ap >= 0){ctx.fillText("ap:" + card.ap, halfWidth * .95, -halfHeight * .75)};
			
			//level
			//ctx.textAlign = "center";
			//ctx.fillText("level: " + card.lvl, 0, .1 * halfHeight);
			
			//description
			//var descpArray = card.description.match(/.{1,19}/g);
			var descpArray = card.description.split('/');
			ctx.textAlign = "left";
			ctx.font = "15px Arial";
			for (var i = 0; i < descpArray.length; i++){
				ctx.fillText(descpArray[i], -halfWidth * .9, (.6 * halfHeight) + halfHeight * .2 * i );
			}
			
			ctx.restore();
			
			if (app.main.mouseY >= y - halfHeight/2 && app.main.mouseY <= y + halfHeight/2){
				if (app.main.mouseX >= x - halfWidth/2 && app.main.mouseX <= x + halfWidth/2){
					this.getCardHover(card, array);
				}
			}
		},
		
		getCardHover (card, array){
			this.drawCard(card, 1000, 500, array, "large");
			
			if (app.main.isLMouseDown == true){
				this.getCardSelect(card, array);
			}
		},
		
		getCardSelect (card, array){
			var targetArray; //target to add the card to
			if (array == this.availableCards){targetArray = this.playerDeck; this.addCard(card, targetArray);}
			if (array == this.playerDeck){this.removeCard(card, array)}
			
		},
		
		addCard (card, array){
			if(card.ap != -1)(array.push(card));
		},
		
		removeCard (card, array){
			var index = this.playerDeck.indexOf(card);
			array.splice(index, 1);
		},
		
		drawButton : function(bttnStr, x, y, width, height){
			var ctx = app.main.ctx;
			ctx.save();
			app.main.ctx.setTransform(1,0,0,1, x, y);
			ctx.strokeStyle = "black";
			ctx.fillStyle = "white";
			ctx.fillRect(-width/2,-height/2,width,height);
			ctx.strokeRect(-width/2,-height/2,width,height);
			ctx.transform(1,0,0,1,0,10);
			ctx.fillStyle = "black";
			ctx.font = "25px Arial";
			ctx.textAlign = "center";
			if (bttnStr == "^Deck"){ctx.fillText("^", 0, 0);}
			else if (bttnStr == "vDeck"){ctx.fillText("v", 0, 0);}
			else if (bttnStr == "^availableCards"){ctx.fillText("^", 0, 0);}
			else if (bttnStr == "vavailableCards"){ctx.fillText("v", 0, 0);}
			else {ctx.fillText(bttnStr, 0, 0);}
			
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
			if (bttnStr == "Save and Quit"){this.saveDeck();}
			else if (bttnStr == "^Deck"){if(this.deckIndex > 0){this.deckIndex -= 5;}}
			else if (bttnStr == "vDeck"){this.deckIndex += 5;}
			else if (bttnStr == "^availableCards"){if(this.availableCardIndex > 0){this.availableCardIndex -= 5;}}
			else if (bttnStr == "vavailableCards"){this.availableCardIndex += 5;}
		},
		
		saveDeck(){
			var exportArray = [];
			for (var i = 0; i < this.playerDeck.length; i++){
				exportArray.push(this.playerDeck[i].id);
			}
			console.log(exportArray);
			app.main.player.strDeck = exportArray;
			
			app.main.GAMEMODE = "OVERWORLD";
		}
		
};


