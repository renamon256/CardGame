"use strict"

var app = app || {};


app.cards = {
	init : function(){console.log("cards init");},
	
	play : function (user, card, target){
			if(user.ap < card.ap){return;}
			card.owner = user;
			card.target = target;
			var action = user.name + " used " + card.name;
			console.log(user.id + " used " + card.id + " on " + target.id);
			app.main.selectedCard = null;
			this.remove(card, user) //gets the card out of the hand
			user.ap -= card.ap;
			
			if (card.play == "burn"){
				if (card.type == "melee"){
					this.attack(user, card, target);
				}
				if (card.type == "defense"){user.attributes.defense += card.pwr;}
				if (card.type == "effect"){
					this.resolveEffect(card);
				}
				//throws the card away
				this.destroy(card, user);
				action += " on " + target.id
			}
			if (card.play == "set"){
				card.animTimer = app.main.time + app.main.speedSet/app.main.speedMult; 
				if (card.type == "melee"){user.attackCards.push(card);}
				if (card.type == "defense"){user.defendCards.push(card);}
			}
			app.main.addAction(action);
			app.main.checkDead(); //find out if something died
			if (user.ap <= 0 ){app.main.endTurn();}
	},
	
	
	
	attack : function (user, card, target){
		var dmg = card.pwr;
		var olddmg = dmg;
		var shield;
		//check shields
					
		for (var i = 0; i < target.defendCards.length; i++){
			shield = null
			if (target.defendCards[i].type != "passive"){
				shield = target.defendCards[i];
			}
			if (card.effect != "pierce" && shield != null){
				dmg -= shield.pwr;
				if (shield.pwr <= olddmg){
					this.remove(shield,target);
					this.destroy(shield,target);
					console.log("shield broken");
				}
				else if (olddmg >= 0){
					shield.pwr -= olddmg;
				}
							
				olddmg = dmg;
				}
			}
						
			if (dmg >= 0){
				target.attributes.health -= dmg;
				if (card.effect != "none"){
					this.addEffect(user, card, target);
				}
		}
	},
	
	remove : function (card, owner){
		//finds where the card is and gets rid of it
		var cardIndex = -1;
		if ((cardIndex = owner.defendCards.indexOf(card)) != -1){
			owner.defendCards.splice(cardIndex, 1);
		}
		if ((cardIndex = owner.attackCards.indexOf(card)) != -1){
			owner.attackCards.splice(cardIndex, 1);
		}
		if ((cardIndex = owner.hand.indexOf(card)) != -1){
			owner.hand.splice(cardIndex, 1);
		}
	},
	
	destroy : function (card, owner){
		//card is finished, put it wherever it goes
		if (card.remove == "trash"){
			owner.trash.push(card);
		}
		if (card.remove == "destroy"){
			return //destroyed cards go nowhere
		}
		card.animTimer = app.main.time + (app.main.speedDraw / app.main.speedMult);
		app.main.buffer(true);
	},
	
	resolveAttackCards : function (user, target){
		var card
		for (var i = 0; i < user.attackCards.length; i++){
			card = user.attackCards[i];
			this.attack(user, card, target);
		}
	},
	
	addEffect : function (user, card, target){
		if (card.effect == "psnTrgt"){
			var tempCard;
			for (var i = 0; i < app.main.allCards.length; i++){
				if (app.main.allCards[i].id == "poison"){tempCard = app.main.allCards[i];}
			}
			var psnCard = new app.main.copyCard(tempCard);
			psnCard.target = target;
			psnCard.owner = user;
			target.defendCards.push(psnCard);
		}
	},
	
	resolveEffects : function(){
		var card
		var enemy
		for (var i = 0; i < app.main.player.defendCards.length; i++){
			card = app.main.player.defendCards[i];
			this.resolveEffect(card);
		}
		for (var i = 0; i < app.main.player.attackCards.length; i++){
			card = app.main.player.attackCards[i];
			this.resolveEffect(card);
		}
		
		for (var i = 0; i < app.main.enemies.length; i++){
			enemy = app.main.enemies[i];
			for (var j = 0; j < enemy.defendCards.length; j++){
				card = enemy.defendCards[j];
				this.resolveEffect(card);
			}
			for (var j = 0; j < enemy.attackCards.length; j++){
				card = enemy.attackCards[j];
				this.resolveEffect(card);
			}
			
		}
	},
	
	resolveEffect : function(card){
		var target;

		var effect;

		
		for (var i = 0; i < card.effect.length; i++){
			effect = card.effect[i];
			if (card.play == "endTurnTarget" && app.main.PHASE == "EndTurn" && app.main.turnOrder[app.main.turnOrderIndex] == card.target.id){
				if (effect == "poison"){
					card.target.attributes.health -= card.pwr;
					app.main.checkDead;
				}
			}
			if (card.play == "burn"){
				if (effect == "rmvPsnSelf"){
					//have to go from end to beginning because of splicing
					for (var j = card.owner.defendCards.length - 1; j >= 0 ; j--){
						if (card.owner.defendCards[j].effect == "poison"){
							var psnCard = card.owner.defendCards[j];
							console.log(psnCard.id + " removed");
							this.destroy(psnCard, psnCard.target);
							this.remove(psnCard, psnCard.target);
						}
					}
				}
				if (effect == "dmgSelf"){
					card.owner.attributes.health -= card.pwr;
				}
			}
			
	}	}
	
	
};
