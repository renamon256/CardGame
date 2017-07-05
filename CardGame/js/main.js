//only force the player to reload of they have no cards in their hands
//change turn order so it can be recalculated every update
"use strict"

var app = app || {};


app.main = {
		currCell : "testCell",
		overworldEnemy : null, //enemy to remove when the game ends
		player : {
			id : "player",
			name : "player",
			//cards in current deck
			strDeck : ["pierce", "atck5+1", "atck5+2", "atck5", "def", "def", "atck5", "atck5", "atck5", "def", "def", "mob+2", "mob+1", "HCB", "HCB", "psnSpore", "psnSpore+2", "psnSpore", "cleansingWound",],
			//all cards owned by player
			cards : {atck5 : 6, def : 4},
			deck : [],
			hand : [],
			ap : 1,
			apRegen : 1,
			armor : 1,
			durability : 5,
			attributes:{
				health : 50,
				maxHealth: 50,
				attack : 5, //effects damage done
				defense : 5, //effects damage absorbed
				speed : 5, //effects turn speed
				intellegence : 5, //effects amount of cards in hand
				adaptability : 5, //effects amount of AP
				luck : 5
			},
			trash: [],
			//cards placed on the field
			attackCards:[],
			defendCards: [],
			//turn timer
			timerGoal: 0,
			
			xp: 0,
			gp: 0,
			items: [],
			
		},
		
		oldPlayerAttributes : null, //create an old player to reset the stats
		
		actions : [], //keeps track of moves
		//used for animations
		time : 0,
		//speed of animations in miliseconds 
		speedMult : 1,
		speedDraw : 500,
		speedSet : 500,
		speedBuffer : 1000,
		bufferGoal : 0,
		isBuffering : false, //make sure enemy turns dont happen all at once
		
		//stuff for determining turn order
		turnOrder : [],
		turnOrderIndex : 0,
		turnTimer : 0,
		
		//add to the end of card ID to keep them separate
		idNum : 0,

		allCards : [],
		enemies : [],
		
		//used to make new card objects instead of references
		copyCard : null,
		copyEnemy : null,
		
		//mouse coordinates
		mouseX : 0,
		mouseY : 0,
		isLMouseDown : false,
		isRMouseDown : false,
		isFocused : false, //check to see if mouse in on the canvas so coordinates are accurate
		
		//what key is being pressed
		keyDown : "",
		
		//canvas stuff
		canvas: undefined,
		ctx : undefined,
		WIDTH : 1080,
		HIEGHT : 640,
		animationID: 0,
		
		selectedCard: null,
		selectedIndex: 0,
		selectedEnemy: null,
		
		isShowingCards: false, //card overlay
		overlayedCards: [], //what cards are being overlayed
		
		cardHeight: 250,
		cardWidth: 180,
		
		PHASE: null,
		GAMEMODE: "OVERWORLD",
		
		droppedCards : [],
		droppedItems : [],
		gainedXp : 0,
		gainedGp : 0,
		
		//for showing damage values
		damages : [],
		copyDamage : null,
		
		//fps tracker
		lastCalledTime : null,
		lastFrameUpdate : null,
		fps : 0,
		delta : 0,
		timesCalled : 0,
		
		//timer
		time : 0,
		
		init : function(){
			
			Object.seal(this.player);
			
			
			this.time = Date.now();
			
			//constructor for new card
			this.copyCard = function(card){
				//console.log(card.id);
				this.id = card.id + app.main.idNum;
				this.name = card.name;
				this.type = card.type;
				this.oldPwr = parseInt(card.pwr);//used for scaling 
				this.pwr = this.oldPwr;
				this.effect = card.effect;
				this.lvl = 0;
				this.play = card.play;
				this.rot = ((Math.random() * 15) - 7.5) * Math.PI;
				this.remove = card.remove;
				//used for animating
				this.oldX = 0;
				this.oldY = 0;
				this.scale = 1;
				//the goal of the timer for animations, as long as the global timer is less than goal then its animating
				this.animTimer = 0;
				this.ap = card.ap;
				this.scaling = card.scaling;
				this.target = null; //for card effects
				this.owner = null; //for card effects
				this.description = card.description;
				app.main.idNum++;
			};
			//constructor for new enemy
			this.copyEnemy = function(enemy){
				this.id = enemy.name + app.main.idNum;
				this.name = enemy.name;
				this.strdeck = enemy.strdeck;
				this.deck = enemy.deck;
				this.hand = enemy.hand;
				this.attributes = new app.main.copyAttributes(enemy)
				this.timerGoal = 100/enemy.attributes.speed
				this.personality = enemy.personality;
				this.trash = [];
				this.attackCards = [];
				this.defendCards = [];
				this.ap = parseInt(enemy.ap);
				this.apRegen = parseInt(enemy.apRegen);
				this.xp = enemy.xp;
				this.gp = enemy.gp;
				this.droppedItems = enemy.droppedItems;
				this.droppedCards = enemy.droppedCards;
			};
			//constructor for damage HUD element
			this.copyDamage = function(iTarget, iType, iDmg){
				this.target = iTarget;
				this.type = iType;
				this.dmg = iDmg;
				
				if (this.target.id == "player"){this.y = 600; this.x = app.main.WIDTH/2;}
				else{ 
					this.y = 100;
					for(var i = 0; i<app.main.enemies.length; i++){
						if (app.main.enemies[i] == this.target){
							this.x = (800/app.main.enemies.length) * i + 200;
						}
					}
				}
				
				this.x += (35 * app.main.damages.length);
				this.endTime = app.main.time + 1000;
			}
			
			
			this.copyAttributes = function(obj){
				this.health = obj.attributes.health,
				this.maxHealth = obj.attributes.maxHealth,
				this.attack = obj.attributes.attack,
				this.defense = obj.attributes.defense,
				this.speed = obj.attributes.speed,
				this.intellegence = obj.attributes.intellegence,
				this.adaptability = obj.attributes.adaptability,
				this.luck = obj.attributes.luck
			}
			
			this.getAllCards();
			this.canvasInit();
			
			this.date = new Date();
			
		},
		
		resetStats : function(){
			this.enemies = [];
			
			this.player.hand = [];
			this.player.deck = [];
			this.player.trash = [];
			this.player.attackCards = [];
			this.player.defendCards = [];
			this.player.attributes.health = this.player.attributes.maxHealth;
			
			this.turnOrder = [];
			this.turnOrderIndex = 0;
			this.turnTimer = 0;
			
			this.actions = [];
			
			this.droppedCards = [];
			this.droppedItems = [];
			this.gainedXp = 0;
			this.gainedGp = 0;
			
		},
		
		//game loop
		update : function (){
			this.animationID = requestAnimationFrame(this.update.bind(this));
			//console.log(this.keydown);
			
			this.time = Date.now();
			
			if (!this.lastCalledTime){
				this.lastCalledTime = Date.now();
				this.lastFrameUpdate = Date.now();
				return;
			}
			
			this.delta += (Date.now() - this.lastCalledTime)/1000;
			this.timesCalled++;
			
			this.lastCalledTime = Date.now();
			if (Date.now() >= this.lastFrameUpdate + 1000){
				this.fps = 1/(this.delta/this.timesCalled);
				this.lastFrameUpdate = Date.now();
				this.delta = 0;
				this.timesCalled = 0;
			}
			
			
			//console.log(this.GAMEMODE);
			if (this.GAMEMODE == "CARDGAME"){
				this.PHASE = "update"
				this.time = Date.now();
				this.clearCanvas();
				
				this.getScaling(this.player);
				this.renderCards(this.player);
				for (var i = 0; i < this.enemies.length; i++){
						this.getScaling(this.enemies[i])
						this.renderCards(this.enemies[i]);
				}
				
				this.buffer(false);
				if (this.isBuffering == false){
					if (this.turnOrder[this.turnOrderIndex] != "player"){
						this.enemyTurn(this.turnOrder[this.turnOrderIndex]);
					}
					else{
						if (this.player.deck.length == 0 ){
							
							this.reloadDeck(this.player);
							this.shuffleDeck(this.player)//if the player has no cards in the deck then reload and end turn
							this.endTurn();
						}
					}
				}
				
				this.updateHUD();
				
				this.renderDamages();
				
				if (this.isShowingCards){
					this.showCards();
				}
			}
			if (this.GAMEMODE == "ENDCARDGAME"){this.renderResults();}
			if (this.GAMEMODE == "OVERWORLD"){app.overworld.update();}
			if (this.GAMEMODE == "DECKBUILDER"){app.deckBuilder.update();}
			if (this.GAMEMODE != "OVERWORLD"){
				this.isLMouseDown = false;
				this.isRMouseDown = false;
			}
		},

		
		updateHUD : function(){
			this.ctx.save();
			//drawing player hud
			var playerHud = [
				this.player.id,
				this.player.attributes.health + " / " + this.player.attributes.maxHealth,
				"ap: " + this.player.ap,
				//"deck: " + this.player.deck.length,
				//"hand: " + this.player.hand.length,
				//"trash: " + this.player.trash.length
			]

			this.ctx.fillStyle = "red";
			this.ctx.setTransform(this.player.attributes.health/this.player.attributes.maxHealth, 0 , 0 , 1, 10, 40);
			this.ctx.fillRect(0, 5, 100, 30);
			
			this.ctx.setTransform(1,0,0,1,60,40);
			this.ctx.strokeRect (-50, 5, 100, 30);
			
			this.ctx.font = "28px Arial";
			this.ctx.textAlign = "center";
			this.ctx.fillStyle = "black";
			for (var i = 0; i < playerHud.length; i ++){
				this.ctx.fillText(playerHud[i], 0, 0 + (i * 30));
				
			}
			this.ctx.restore();
			
			this.drawButton("End Turn", 65, 500, 120, 50);
			
			//drawing enemy hud
			for (var i = 0; i < this.enemies.length; i++){
				this.ctx.save();
				var enemy = this.enemies[i];
				var enemyHud = [
					enemy.name,
					enemy.attributes.health + " / " + enemy.attributes.maxHealth,
					"ap: " + enemy.ap
				]
				this.ctx.fillStyle = "red";
				this.ctx.setTransform(enemy.attributes.health/enemy.attributes.maxHealth, 0 , 0 , 1, this.WIDTH - 105, 40 + i * 50);
				this.ctx.transform(.5,0,0,.5,0,0);
				this.ctx.fillRect(0, 5, 100, 30);
					
				this.ctx.setTransform(1,0,0,1, this.WIDTH - 80, 40 + i * 50);
				this.ctx.transform(.5,0,0,.5,0,0);
				this.ctx.strokeRect (-50, 5, 100, 30);
					
				this.ctx.font = "28px Arial";
				if(enemy == this.selectedEnemy){this.ctx.font = "bold 28px Arial";}
				this.ctx.textAlign = "center";
				this.ctx.fillStyle = "black";
				for (var j = 0; j < enemyHud.length; j++){
						this.ctx.fillText(enemyHud[j], 0, j * 30);
				}
				
				this.ctx.restore();
			}
			
			
			//printing turn order
			this.ctx.save();
			
			this.ctx.font = "20px Arial";
			this.ctx.textAlign = "center";
			this.ctx.fillStyle = "black";
			for (var i = this.turnOrderIndex; i < this.turnOrder.length; i++ ){
				var j = i - this.turnOrderIndex
				this.ctx.fillText(this.turnOrder[i], 60, 230 + j * 30);
			}
			
			//print the actions
			this.ctx.font = "12px Arial";
			this.ctx.textAlign = "right";
			for (var i = 0; i < this.actions.length; i++){
				this.ctx.fillText(this.actions[i], this.WIDTH - 10, (this.HIEGHT * .4) + (i * 20) )
			}
			
			this.ctx.restore();
			//document.querySelector('#turnOrder').innerHTML = html;
		},
		
		renderCards : function (name){
			var count = name.hand.length + name.defendCards.length + name.attackCards.length + name.trash.length;
			var halfCount;
			var center = this.WIDTH / 2;
			var displayWidth;
			var spacing = displayWidth / count;
			var halfHeight = this.cardHeight / 2;
			var halfWidth = this.cardWidth / 2;
			var enemyIndex;
			var enemySpacing;
			var deckCenter;
			var owner = "player" //card owner is player my default
			//linear interpolation value for animation
			var lerp
			
		
			
			for (var i = 0; i < count; i++){
				
				//loop through attack cards, defense cards, then cards in hand
				var cardNum = name.attackCards.length; //number of cards in hand
				var card = name.attackCards[i];
				var j = i; //index for defend and hand cards
				var placement = "attack"; // keep track of the card in the hand or on the field
				//defend cards
				if (i >= name.attackCards.length && name.defendCards.length > 0){
					j = i - name.attackCards.length;
					cardNum = name.defendCards.length;
					card = name.defendCards[j]; 
					placement = "defend";
				}
				//hand cards
				if (i >= name.attackCards.length + name.defendCards.length && name.hand.length > 0){
					j = i - name.attackCards.length - name.defendCards.length;
					cardNum = name.hand.length;
					card = name.hand[j];
					placement = "hand";
				}
				//trash cards
				if (i >= name.attackCards.length + name.defendCards.length + name.hand.length && name.trash.length > 0){
					j = i - name.attackCards.length - name.defendCards.length - name.hand.length;
					card = name.trash[j];
					placement = "trash";
				}
				
				
				var halfCount = cardNum/2;
				this.ctx.save();
				
				if (card != undefined && card != null){
					displayWidth = 800;
					
					card.x = center;
					
					//enemy hands
					if (name != this.player){
						owner = "enemy";
						enemySpacing = displayWidth / this.enemies.length;
						var enemyIndex = this.enemies.indexOf(name);
						displayWidth = displayWidth/this.enemies.length;
						deckCenter = center + (enemySpacing * (enemyIndex - (this.enemies.length/2 - .5)));
						card.x = deckCenter;
						card.y = halfHeight/2;
						this.ctx.transform(.5, 0, 0, .5, card.x/2, 0);
						if (name == this.selectedEnemy){this.ctx.transform(1.5, 0, 0, 1.5, -1 * card.x/2,halfHeight/2)};
					}
					
					
					spacing = displayWidth / cardNum;
					
					//don't move cards if they arent covering eachother
					
					if (spacing < halfWidth && name == this.player){
						if (i > this.selectedIndex){card.x += halfWidth;}
						if (i < this.selectedIndex){card.x -= halfWidth;}
					}
					
					card.x += (spacing * (j - halfCount)) + spacing/2;
					
					//cards on the field
					if (name == this.player){
						card.y = this.HIEGHT;
						if (placement == "defend"){card.y -= this.cardHeight * .7; this.ctx.transform(.5,0,0,.5,card.x/2,card.y/2);}
						if (placement == "attack"){card.y -= this.cardHeight; this.ctx.transform(.5,0,0,.5,card.x/2,card.y/2);}
						if (placement == "trash"){card.x = this.cardWidth/2; card.y -=this.cardHeight/3; this.ctx.transform(.5,0,0,.5,card.x/2,card.y/2);}
					}
					else if (name != this.player){
						var enemyIndex = this.enemies.indexOf(name)
						if (placement == "defend"){card.y += this.cardHeight * .7; this.ctx.transform(.5,0,0,.5,card.x/2,card.y/2);}
						if (placement == "attack"){card.y += this.cardHeight; this.ctx.transform(.5,0,0,.5,card.x/2,card.y/2);}
						if (placement == "trash"){card.x = this.WIDTH - this.cardWidth/2; card.y = this.cardHeight/5 * enemyIndex + this.cardHeight/5;this.ctx.setTransform(.3,0,0,.3,card.x/1.4,card.y/1.4);}
					}
					
					
					
					//card is not animating
					if (card.animTimer <= this.time){
						this.ctx.transform(1, 0, 0, 1, card.x, card.y);
						//set the old coordinates
						card.oldX = card.x;
						card.oldY = card.y;
						
						if (this.selectedCard !== card){
							
							this.ctx.rotate(card.rot/180);
							this.renderCard(card, owner, "medium");//drawing card
							
							//changing selected card
							if (this.mouseY > this.HIEGHT - halfHeight && name == this.player && placement == "hand"){
								if (i == this.selectedIndex + 1 || i == this.selectedIndex - 1){
									if (this.mouseX > card.x - halfWidth && this.mouseX < card.x + halfWidth){
										this.selectedCard = card;
										this.selectedIndex = j;
									}
								}
								else if (this.mouseX > card.x - halfWidth && this.mouseX < card.x + spacing - halfWidth){
									this.selectedCard = card;
									this.selectedIndex = j;
								}
							}
						}
						else{
							if (this.mouseY > this.HIEGHT - this.cardHeight && name == this.player && placement == "hand"){
								//selecting current card
								if (this.mouseX > card.x - halfWidth && this.mouseX < card.x + spacing - halfWidth){
									if (this.turnOrder[this.turnOrderIndex] == "player" && this.isLMouseDown){
										app.cards.play(this.player, card, this.selectedEnemy);
									}
								}
							}
						}
						//choose Target Enemy
						if (name != this.player && this.mouseY < halfHeight){
							if (this.mouseX > deckCenter - displayWidth/2 && this.mouseX < deckCenter + displayWidth/2){
								this.selectedEnemy = this.enemies[enemyIndex];
								if (this.isRMouseDown){this.isShowingCards = true; this.overlayedCards = this.selectedEnemy.hand; this.isRMouseDown = false;}
							}
						}
					}
					
					//card is animating
					if (card.animTimer > this.time){
						lerp = (card.animTimer - this.time)/(this.speedDraw/this.speedMult);
						card.x = card.x - (card.x - card.oldX) * lerp;
						card.y = card.y - (card.y - card.oldY) * lerp;
						this.ctx.transform(1, 0, 0, 1, card.x, card.y);
						this.ctx.rotate((card.rot/180) + 360 * lerp);
						this.renderCard(card);
					}
					
					
				}
				this.ctx.restore();
			}

			this.ctx.save();
			if (this.selectedCard != null){
				this.ctx.setTransform(1, 0, 0, 1, this.selectedCard.x, this.selectedCard.y - halfHeight);
				this.renderCard(this.selectedCard);
				this.ctx.restore();
				
			}
			
		},
		
		renderCard : function(card, owner, size){
			//don't save/restore might need transform
			//enemy cards are translated differently so its visible when upside down
			var halfWidth = this.cardWidth/2;
			var halfHeight = this.cardHeight/2;
			var horMult = 1// horizontal multiplier, enemy cards should be rendered lower
			//var arryNm = card.id.split(" ");//array for the name if its on more than one line
			var arryNm = card.name.split(" ");
			var lCornerString = ""; //string for important stuff in left corner
			
			if (owner == "enemy"){horMult = -1;}
			this.ctx.fillStyle = "white";
			this.ctx.fillRect(-1 * halfWidth, -1 * halfHeight, this.cardWidth, this.cardHeight );
			this.ctx.fillStyle = "black";
			this.ctx.strokeRect(-1 * halfWidth, -1 * halfHeight,this.cardWidth, this.cardHeight);
			
			//drawing text
			this.ctx.font = "28px Arial";
			this.ctx.textAlign = "center";
			for (var i = 0; i < arryNm.length; i++){	
				this.ctx.fillText(arryNm[i], 0, ((-0.4 * halfHeight) + halfHeight * .2 * i) * horMult );
			}
			this.ctx.textAlign = "left";
			
			if (card.type == "melee"){lCornerString += "M";}
			if (card.type == "defense"){lCornerString += "D"}
			
			lCornerString += card.pwr;
			
			if (card.play == "set"){lCornerString += "S"}
			
			this.ctx.fillText(lCornerString, -halfWidth * .9, -halfHeight * .75 * horMult);
			this.ctx.textAlign = "right";
			if (card.ap >= 0){this.ctx.fillText("ap:" + card.ap, halfWidth * .95, -halfHeight * .75 * horMult)};
			
			//level
			this.ctx.textAlign = "center";
			if (card.lvl > 0){this.ctx.fillText("level: " + card.lvl, 0, .1 * halfHeight * horMult);}
			
			//description
			//var descpArray = card.description.match(/.{1,19}/g);
			var descpArray = card.description.split('/');
			this.ctx.textAlign = "left";
			this.ctx.font = "15px Arial";
			for (var i = 0; i < descpArray.length; i++){
				this.ctx.fillText(descpArray[i], -halfWidth * .9, ((.6 * halfHeight) + halfHeight * .2 * i )* horMult);
			}
			
		},
		
		showCards(){
			//render selected cards on overlay to see more clearly
			var card;
			this.ctx.fillStyle = "rgba(0,0,0,.2)"
			this.ctx.fillRect(0,0,this.WIDTH, this.HIEGHT);
			for (var i = 0; i < this.overlayedCards.length; i++){
				this.ctx.save();
				card = this.overlayedCards[i];
				card.y = this.HIEGHT/2;
				card.x = (this.WIDTH/this.overlayedCards.length) * i + this.cardWidth * 1.2;
				this.ctx.transform(1,0,0,1, card.x, card.y);
				this.renderCard(this.overlayedCards[i], "none", "large")
				this.ctx.restore();
			}
			if(this.isRMouseDown == true){this.isShowingCards = false;}
			
		},
		
		drawCards : function (name, count){
			var deckLength;
			var card;
			var enemyIndex;
			if (name == this.player){deckLength = this.player.deck.length;}
			else{deckLength = name.deck.length; enemyIndex = this.enemies.indexOf(name);}
			
			while (count > 0){
				if (count > deckLength){
					break;
				}
				
				if (name == this.player){
					card = this.player.deck[deckLength - 1];
					card.animTimer = this.time + (this.speedDraw / this.speedMult);
					this.selectedIndex = this.player.hand.length - 1;
					this.player.hand.push(card);
					count--;
					this.player.deck.splice(deckLength - 1, 1);
					deckLength = this.player.deck.length;
				}
				else{
					card = name.deck[deckLength - 1];
					card.animTimer = this.time + this.speedDraw / this.speedMult;
					count--;
					name.deck.splice(deckLength - 1, 1);
					name.hand.push(card);
					deckLength = name.deck.length;
				}
			}
		},
		
		getDeck : function(name){
			//gets the cards in the deck for target
			var xhrDeck = new XMLHttpRequest();
			
			
			if (name == "player"){
				
				if (localStorage.getItem("player") === null){
					var tempDeck = this.player.strDeck;
					for (var j=0; j < tempDeck.length; j++){
						for (var i=0; i< this.allCards.length; i++){
							var crdLvl = tempDeck[j].split('+')//holds both the name of the card and the level
							if (crdLvl[0] == this.allCards[i].id){
								var card = new this.copyCard(this.allCards[i]);//create new cards so all of them are separate
								if (crdLvl.length > 1){card.lvl = crdLvl[1];}
								this.player.deck.push(card);
							}
						}
					}
				}
				else{this.player = localStorage.getItem("player");	console.log("loaded player");}
				
				
				

			}
			else{
				var startTime = Date.now();
				xhrDeck.onload = function(){
					var myJSON = eval('(' + xhrDeck.responseText + ')');
					//find the enemy type
					var enemyArray = myJSON.enemies;
					var enemy = null;
					var enemyIndex = -1;
					
					for (var i=0; i<enemyArray.length; i++){
						if (enemyArray[i].name == name){enemy = new app.main.copyEnemy(enemyArray[i]);}
					}
					app.main.enemies.push(enemy);
					enemyIndex = app.main.enemies.length - 1;
					if (enemy != null){
						var tempDeck = enemy.strdeck;
						//swapping string deck for object deck
						for (var j=0; j < tempDeck.length; j++){
							for (var i=0; i< app.main.allCards.length; i++){
								var crdLvl = tempDeck[j].split('+')//holds both the name of the card and the level
								if (crdLvl[0] == app.main.allCards[i].id){
									var card = new app.main.copyCard(app.main.allCards[i]);
									if (crdLvl.length > 1){card.lvl = crdLvl[1];}
									app.main.enemies[enemyIndex].deck.push(card);

								}
							}
						}
					}
				}
				xhrDeck.open('GET',"js/enemies.json",false);
				xhrDeck.send();
			}
			
		},
		
		getScaling : function(user){
			//doesn't work in cards.js so putting it here
			var count = user.deck.length + user.hand.length  + user.attackCards.length + user.defendCards.length + user.trash.length
			//deck, hand, atck, def, trash
			var card
			var sAtt // attribute that it scales with
			var nPwr;
			
			for (var i = 0; i < count; i++){
				var j = i;
				if (i < user.deck.length){card = user.deck[i]}
				else if (i >= user.deck.length + user.hand.length + user.attackCards.length + user.defendCards.length && user.trash.length > 0){j = i - user.deck.length - user.hand.length - user.attackCards.length - user.defendCards.length; card = user.trash[j];}
				else if (i >= user.deck.length + user.hand.length + user.attackCards.length && user.defendCards.length > 0){j = i - user.deck.length - user.hand.length - user.attackCards.length; card = user.defendCards[j];}
				else if (i >= user.deck.length + user.hand.length && user.attackCards.length > 0){j = i - user.deck.length - user.hand.length ; card = user.attackCards[j];}
				else if (i >= user.deck.length && user.hand.length > 0){j = i - user.deck.length; card = user.hand[j];}
				nPwr = card.oldPwr;
				
				if (card.scaling != null || card.scaling != undefined){
					if (card.scaling[0] = "str"){sAtt = user.attributes.attack;}
					if (card.scaling[0] = "lvl"){sAtt = card.lvl;}
					
					if (card.scaling[1] = "A"){nPwr += sAtt * 6;}
					if (card.scaling[1] = "B"){nPwr += sAtt * 3;}
				}
			}
			card.pwr = nPwr;
		},
		
		getAllCards : function(){
			//gets all cards to compare with deck
			var xhrCards = new XMLHttpRequest();
			
			xhrCards.onload = function(){
				var myJSON = eval('(' + xhrCards.responseText + ')');
				app.main.allCards = myJSON.cards;
			}
			
			xhrCards.open('GET',"js/cards.json",false);
			xhrCards.send();
		},
		
		saveGame : function(){
			localStorage.setItem("player", this.player);
		},
		deleteGame : function(){localStorage.removeItem("player");},
		
		canvasInit : function(){
			this.canvas = document.getElementById("canvas");
			this.canvas.width = this.WIDTH;
			this.canvas.height = this.HIEGHT;
			this.ctx = this.canvas.getContext('2d');
			var game = document.getElementById("game");
			game.addEventListener("mousemove", 
				function(e){app.main.getMousePos(e)}, false);
			game.addEventListener("mousedown", 
				function(e){
					if (e.button == 0){app.main.isLMouseDown = true;} //left click
					if (e.button == 2){app.main.isRMouseDown = true;} //right click
			}, false);
			game.addEventListener("mouseup", 
				function(e){
					if (e.button == 0){app.main.isLMouseDown = false;} //left click
					if (e.button == 2){app.main.isRMouseDown = false;} //right click
			}, false);
			window.addEventListener("keydown", 
				function(e){
					app.main.keyDown = e.key;
			}, false);
			/*
			window.addEventListener("keyup", 
				function(e){
					app.main.keyDown = '';
			}, false);*/
			game.onfocus = function(){console.log("focus")};
			game.onblur = function(){console.log("blur")};
			this.update();
		},
		
		gameStart : function(enemiesStr, enemId){
			this.overworldEnemy = enemId;
			for (var i = 0; i < enemiesStr.length; i++){
				console.log(enemiesStr[i])
				this.getDeck(enemiesStr[i]);
			}
			this.oldPlayerAttributes = new this.copyAttributes(this.player);
			
			this.player.timerGoal = 100/this.player.attributes.speed;

			app.main.getDeck("player");
			app.main.player.deck = app.main.shuffleDeck(app.main.player.deck);
			app.main.drawCards(app.main.player, 5);
			for (var i = 0; i <app.main.enemies.length; i++){
				app.main.enemies[i].deck = app.main.shuffleDeck(app.main.enemies[i].deck);
				app.main.drawCards(app.main.enemies[i], 3);
			}
			app.main.selectedEnemy = app.main.enemies[0];
			//app.main.saveGame();
			app.main.deleteGame();
			console.log("starting fight");
			app.main.GAMEMODE = "CARDGAME";
			app.main.getTurnOrder();
		},
		
		clearCanvas : function(){
			this.ctx.fillStyle = "#b35900";
			this.ctx.fillRect(0,0, this.WIDTH, this.HIEGHT);
			
		},
		
		shuffleDeck : function(deck){
			var cardIndex;
			var tempCard;
			for (var i = 0; i < deck.length; i++){
				cardIndex = Math.round(Math.random() * (deck.length - .5));
				if (i != cardIndex){
					tempCard = deck[cardIndex];
					deck[cardIndex] = deck[i]; 
					deck[i] = tempCard;
				}
			}
			return deck
		},
		
		getMousePos : function(e){
			this.mouseX = e.offsetX;
			this.mouseY = e.offsetY;
		},
		
		getTurnOrder : function(){
			console.log("getting turn order");
			for (var i = this.turnOrderIndex; i < this.turnOrderIndex + 10; i++){
				if (this.turnOrder.length < i){
					var enemyMetGoal = false //variable to break the loop if the enemy get it
					
					while (this.turnTimer < this.player.timerGoal && enemyMetGoal == false){
						this.turnTimer++
						
						for (var j = 0; j < this.enemies.length; j++){
							if (this.turnTimer > this.enemies[j].timerGoal){
								this.enemies[j].timerGoal += 100/this.enemies[j].attributes.speed;
								this.turnOrder.push(this.enemies[j].id);
								enemyMetGoal = true;
								break;
							}
						}
					}
					if (this.turnTimer >= this.player.timerGoal){
						this.player.timerGoal += 100/this.player.attributes.speed;
						this.turnOrder.push("player");
					}
					
				}
			}
			
		},
		
		enemyTurn : function(id){
			//determines what card enemies will play based on their personality
			var enemy = this.getEnemyById(id);
			var card = null;
			var cardIndex;
			
			if (enemy.deck.length == 0 && enemy.trash.length > 0){
				this.reloadDeck(enemy);
				this.endTurn();
				return;
			}
			if (enemy.hand.length == 0){
				console.log("no cards in hand")
				this.endTurn();
				return;
			}
			
			for (var i = 0; i < enemy.hand.length; i++){
				card = enemy.hand[i];
				if (enemy.personality == "agressive"){
					if (card.type == "melee"){app.cards.play(enemy, card, this.player); return;}
				}
				else if (enemy.personality == "defensive"){
					if (card.type == "defense"){app.cards.play(enemy, card, this.player); return;}
				}
				else if (enemy.personality == "poison"){
					if (card.effect == "psnTrgt"){app.cards.play(enemy, card, this.player); return;}
				}
			}
			
			cardIndex = Math.round(Math.random() * (enemy.hand.length - .5));
			card = enemy.hand[cardIndex];
			app.cards.play(enemy, card, this.player)
			return;
			
		},
		
		endTurn : function(){
			this.PHASE = "EndTurn";
			
			app.main.checkDead();
			//go to the next on the turn order and draw the card
			this.getTurnOrder();
			var user
			//restore AP
			var userId = this.turnOrder[this.turnOrderIndex];
			if (userId == "player"){user = this.player;}
			else (user = this.getEnemyById(userId));
			user.ap += user.apRegen;
			//mobs attack
			if (user == this.player){app.cards.resolveAttackCards(this.player, this.selectedEnemy);}
			else{app.cards.resolveAttackCards(user, this.player);}
			app.cards.resolveEffects();
			
			this.PHASE = "BeginTurn";
			//draw card
			this.turnOrderIndex++;
			userId = this.turnOrder[this.turnOrderIndex];
			if (userId == "player"){user = this.player;}
			else (user = this.getEnemyById(userId));
			this.drawCards(user, 1);
			//set the buffer so everything doesn't go off at once
			app.cards.resolveEffects();
			app.main.checkDead();
			this.buffer(true);
			
			
		},
		
		getEnemyById : function (id){
			for (var i = 0; i <this.enemies.length; i++){
				if(this.enemies[i].id == id){return this.enemies[i];}
			}
		},
		
		checkDead : function (){

			if (this.player.attributes.health <= 0) {console.log ("lose condition")}
			else{
				for (var i = 0; i < this.enemies.length; i++){
					enemy = this.enemies[i];
					if (enemy.attributes.health <= 0){
						this.enemies.splice(i, 1);

						
						//remove from turn order
						for (var j = this.turnOrder.length - 1; j >= this.turnOrderIndex ; j--){
							if (enemy.id == this.turnOrder[j]){this.turnOrder.splice(j,1);}
						}
						this.getTurnOrder();
						this.addAction(enemy.name + " died")
						this.getLoot(enemy);
						
						if (this.enemies.length == 0 ){this.endGame();}
						else {this.selectedEnemy = this.enemies[0];}
					}
				}
			}
		},
		
		getLoot : function (enemy){
			//see what the enemy drops
			for (var i = 0; i < enemy.droppedItems.length; i++){
				var randNum  = Math.random();
				var item = enemy.droppedItems[i][0];
				if (randNum <= enemy.droppedItems[i][1]){this.droppedItems.push(item);}
			}
			for (var i = 0; i < enemy.droppedCards.length; i++){
				var randNum  = Math.random();
				var droppedCard = enemy.droppedCards[i][0];
				if (randNum <= enemy.droppedCards[i][1]){this.droppedCards.push(droppedCard);}
			}
				
			this.gainedXp += enemy.xp;
			this.gainedGp += enemy.gp;
		},
		
		reloadDeck : function (user){
			user.deck  = user.trash;
			user.trash = [];
			this.shuffleDeck(user.deck);
			this.action.add(user.name + " reloaded");
		},
		
		buffer : function(set){
			if (set == true){
				this.isBuffering = true;
				this.bufferGoal = this.time + this.speedBuffer / this.speedMult;
			}
			if (this.bufferGoal <= this.time){
				this.isBuffering = false;
			}
			
		},
		
		endGame : function(){
			this.GAMEMODE = "ENDCARDGAME";
			app.overworld.removeObj(this.overworldEnemy);
		},
		
		renderResults : function(){
			this.clearCanvas();
			
			this.ctx.font = "50px Arial";
			this.ctx.textAlign = "center";
			this.ctx.fillStyle = "black";
			this.ctx.fillText ("xp gained: " + this.gainedXp, 200, 200);
			this.ctx.fillText ("gp gained: " + this.gainedGp, 200, 250);
			
			this.ctx.font = "30px Arial";
			this.ctx.fillText ("cards dropped", 500, 50)
			for (var i = 0; i < this.droppedCards.length; i++){
				this.ctx.fillText(this.droppedCards[i], 500, 150 + 30 * i);
			}
			
			this.ctx.fillText ("Items dropped", 800, 50)
			for (var i = 0; i < this.droppedItems.length; i++){
				this.ctx.fillText(this.droppedItems[i], 800, 150 + 30 * i);
			}
			
			this.drawButton("return", 950, 600, 200, 50);
			
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
			if (bttnStr == "return"){this.GAMEMODE = "OVERWORLD"; this.resetStats();}
			if (bttnStr == "End Turn"){if (this.turnOrder[this.turnOrderIndex] == "player"){this.endTurn();}}
		},
		
		addAction(action){
			app.main.actions.push(action);
			if (app.main.actions.length > 10){app.main.actions.splice(0,1);};
		},
		
		renderDamages(){
			for (var i = this.damages.length - 1; i >= 0; i--){
				var damage = this.damages[i];
				if (this.time >= damage.endTime){this.damages.splice(i,1)}
				else{
					damage.y--;
					this.ctx.save();
					if (damage.type == "shield"){this.ctx.fillStyle="Blue";}
					else if (damage.type == "poison"){this.ctx.fillStyle="Green";}
					else if (damage.type == "mob"){this.ctx.fillStyle="Orange";}
					else {this.ctx.fillStyle="Red";}
					this.ctx.font = "bold 50px Arial";
					this.ctx.fillText(damage.dmg, damage.x, damage.y);
					this.ctx.restore();
				}
			}
		}
		
		
};


window.onload = function(){
	console.log("window on load called");
	app.main.init();
	app.cards.init();
	app.overworld.init();
	app.deckBuilder.init();
};