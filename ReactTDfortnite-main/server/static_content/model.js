function randint(n){ return Math.round(Math.random()*n); }
function rand(n){ return Math.random()*n; }
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}


class Stage {
	constructor(){	
		this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
		this.players={};
		this.worldState = {"enemy":{number:0, signature: Enemy}, "building":{number:0, signature: Obstacle}};
		this.worldConsumable = {"health":{number:0, signature: HealthKit}, "ammo":{number:0, signature: AmmoKit}, "mystery":{number:0, signature: MysteryBox}}
		this.width=4000;
		this.height=4000;
		this.modifiers = 1;

		//this.generateWorld()
	}

	/**
	 * Add this player object to the world
	 * @param {} player 
	 */
	addPlayer(player){
		this.addActor(player);
		this.players[player.entityID] = player;
	}

	/**
	 * Remove the player from the world
	 * @param {} player 
	 */
	removePlayer(player){
		this.removeActor(player);
		if (this.players.hasOwnProperty(player.entityID)){
			delete this.players[player.entityID];
		}
	}

	/**
	 * Add Object to the world
	 * @param {*} actor 
	 */
	addActor(actor){
		this.actors.push(actor);
	}

	/**
	 * Remove the object from the world
	 * @param {} actor 
	 */
	removeActor(actor){
		var index=this.actors.indexOf(actor);
		if(index!=-1){
			this.actors.splice(index,1);
		}
	}

	/**
	 * Check if there is any collision with the object. 
	 * Used to generate the game world.
	 * @param {*} object 
	 * @returns 
	 */
	isAnyCollision(object){
		for(var j=0;j<this.actors.length;j++){
			if (this.actors[j].isCollision(object.position.x, object.position.y, object.length, object.height)){
				return true;
			}
		}
		return false;
	}


	/**
	 * Generate the game world objects
	 */
	generateWorld(){
		/**
		 * All generation are calcuated like so
		 * value = base * modifier'
		 */
		var numOfTerran = 10 * this.modifiers;
		this.generateObstacles(this.worldState.building.number);
		this.generateEnemy(this.worldState.enemy.number);
		for (var consumable in this.worldConsumable){
			this.generateConsumable(this.worldConsumable[consumable].signature, this.worldConsumable[consumable].number, consumable);
		}

		for (var i = 0; i < numOfTerran;){
			var mud = new Mud(this, new Pair(randint(this.width),randint(this.height)), randint(300), randint(300));
			if (this.isAnyCollision(mud) == false){
				this.addActor(mud)
				i += 1;
			}
		}

	}



	// Take one step in the animation of the game.  Do this by asking each of the actors to take a single step. 
	// NOTE: Careful if an actor died, this may break!
	step(){
		for (var consumable in this.worldConsumable){
			this.generateConsumable(this.worldConsumable[consumable].signature, this.worldConsumable[consumable].number, consumable);
		}
		this.generateObstacles(this.worldState.building.number);
		this.generateEnemy(this.worldState.enemy.number);
		for(var i=0;i<this.actors.length;i++){
			this.actors[i].step(this.actors);
		}
	}

	/**
	 * Generate and place consumable in the world 
	 * @param {The class signature of the consumable} arg 
	 * @param {Current number consumable} currentNumber 
	 * @param {The name of the consumable in the tracker} name 
	 */
	generateConsumable(arg, currentNumber, name){
		for (var i = 0; i < 20-currentNumber;){
			var con = new arg(this, new Pair(randint(this.width),randint(this.height)), 1)
			if (this.isAnyCollision(con) == false){
				this.addActor(con)
				i += 1;
				this.worldConsumable[name].number += 1;
			}
		}
	  }

	/**
	 * Generate and place enemy in the world 
	 * @param {*} current 
	 */
	generateEnemy(current){
		var enemyHealth = 100 * this.modifiers;
		for (var i = 0; i < 20 - current;){
			var red=randint(255), green=randint(255), blue=randint(255);
			var colour= 'rgba('+red+','+green+','+blue+','+1+')';
			var enemy = new Enemy(this, new Pair(randint(this.width),randint(this.height)), new Pair(0,0), colour, 20, 20, 0, 'pistol', enemyHealth);
			if (this.isAnyCollision(enemy) == false){
				this.addActor(enemy)
				i += 1;
				this.worldState.enemy.number +=1
			} else {
				this.removeActor(enemy.weapon);
			}
		}
	}

	/**
	 * Generate a new player
	 * @param {*} id 
	 * @returns 
	 */
	generatePlayer(id){
		var player = new Player(this, new Pair(randint(this.width),randint(this.height)), new Pair(0,0), "rgba(100,100,100,1)", 20, 20, id);
		while(!this.isAnyCollision(player)){
			this.removeActor(player.weapon);
			var player = new Player(this, new Pair(randint(this.width),randint(this.height)), new Pair(0,0), "rgba(100,100,100,1)", 20, 20, id);
		}
		return player;
	}

	/**
	 * Generate and place building in the world 
	 * @param {*} current 
	 */
	generateObstacles(current){
		var buildingHealth = 150 * this.modifiers;
		for (var i = 0; i < 20 - current;){
			var red=randint(255), green=randint(255), blue=randint(255);
			var colour= 'rgba('+red+','+green+','+blue+','+1+')';
			var obstacle = new Obstacle(this, new Pair(randint(this.width),randint(this.height)), colour, getRandomInt(200, 300), getRandomInt(200, 300), 2, buildingHealth);
			if (this.isAnyCollision(obstacle) == false){
				this.addActor(obstacle)
				i += 1;
				this.worldState.building.number +=1
			}
		}
	}


	// return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(x, y){
		for(var i=0;i<this.actors.length;i++){
			if(this.actors[i].x==x && this.actors[i].y==y){
				return this.actors[i];
			}
		}
		return null;
	}
} // End Class Stage

/**
 * Class to represent points on the map
 */
class Pair {
	constructor(x,y){
		this.x=x; this.y=y;
	}

	toString(){
		return "("+this.x+","+this.y+")";
	}

	normalize(){
		var magnitude=Math.sqrt(this.x*this.x+this.y*this.y);
		if (magnitude == 0){
			this.x = 0;
			this.y = 0;
		} else {
			this.x=this.x/magnitude;
			this.y=this.y/magnitude;
		}
	}

	distanceTo(position){
		var x=(position.x-this.x);
		var y=(position.y-this.y);
		
		return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	}
}
/**
 * length: distance across the x axis.
 * height: distance across the y axis.
 */
class GameObject{
	constructor(stage, position, velocity, colour, length, height, entityID){
		this.stage = stage;
		this.position=position;
		this.intPosition(); // this.x, this.y are int version of this.position
		this.velocity=velocity;
		this.colour = colour;
		this.length = length;
		this.height = height;
		this.entityID = entityID;
	}

	toJSON(){
		return {position: this.position,
				length: this.length,
				height: this.height,
				colour: this.colour}
	}

	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}
	
	/**
	 * Check for collision
	 * @param {*} x - x coordinate of object
	 * @param {*} y - y coordinate of object
	 * @param {*} height 
	 * @param {*} length 
	 * @returns 
	 */
	isCollision(x, y, height, length){
		return x + length > this.position.x &&
		y + height > this.position.y &&
		this.position.x + this.length > x &&
		this.position.y + this.height > y;
	}
	
	/**
	 * Default colliding effect of the game objects, objects by default
	 * cannot exist on top of eachother, recalculate the position for 
	 * the interacting object to be at the border of this object.
	 * @param {} object 
	 */
	collide(object){
		if ((object.position.y + object.height > this.y) && (object.position.y < this.y)){
			object.position.y = this.y - object.height;
		} else if (object.position.y < this.y + this.height && object.position.y + object.height >  this.y + this.height)  {
			object.position.y = this.y + this.height;
		} else if ((object.position.x + object.length > this.x) && (object.position.x < this.x)){
			object.position.x = this.x - object.length;
		} else {
			object.position.x = this.x + this.length;
		}
	}

	toString(){
		return this.position.toString() + " " + this.velocity.toString();
	}
}

class Terran extends GameObject {
	constructor(stage, position, velocity, colour, length, height){
		super(stage, position, velocity, colour, length, height);
	}

	step(){
		this.intPosition();		
	}
}

class PassThroughEntities extends Terran {
}


class Mud extends PassThroughEntities {
	constructor(stage, position, length, height){
		super(stage, position, new Pair(0,0), "./assets/mud.png", length, height);
	}
	/**
	 * Colliding objects are slowed if they are not a bullet
	 * @param {*} object 
	 */
	collide(object){
		object.position.x = object.position.x - object.velocity.x*object.baseSpeed/2;
		object.position.y = object.position.y - object.velocity.y*object.baseSpeed/2;
		object.intPosition();
	}
}



class HealthKit extends Terran {
	constructor(stage, position, multiplier){
		super(stage, position, new Pair(0,0), "./assets/health.png", 40, 40);
		this.healAmount = 25 * multiplier;
	}
	/**
	 * Colliding objects recieve health
	 * @param {} object 
	 */
	collide(object){
		if (object.health != undefined) {
			object.heal(this.healAmount);
			this.stage.removeActor(this);
			this.stage.worldConsumable.health.number -= 1;
			this.delete;
		}
	}
}

class MysteryBox extends Terran{
	constructor(stage, position){
		super(stage, position, new Pair(0,0), "./assets/mystery.png", 40, 40);
		this.typeID = getRandomInt(0, 3);
		this.weapon = null;
	}
	
	/**
	 * Colliding objects recieve a random new weapon
	 * @param {} object 
	 */
	collide(object){
		if (object.weapon != undefined) {
			
			if(this.typeID == 0){
				this.weapon = new Weapon(this.stage, object.weapon.position, null, "./assets/pistol.png", null, null, object.weapon.entityID, object.weapon.owner);
			}
			else if(this.typeID == 1){
				this.weapon = new Sniper(this.stage, object.weapon.position, null, null, null, null, object.weapon.entityID, object.weapon.owner);
			}
			else if(this.typeID == 2){
				this.weapon = new Shotgun(this.stage, object.weapon.position, null, null, null, null, object.weapon.entityID, object.weapon.owner);
			}
			
			//clean up previous weapon
			this.stage.removeActor(object.weapon);
			object.weapon.delete;
			
			//new swap in new weapon
			this.stage.addActor(this.weapon);
			object.weapon = this.weapon;
			this.stage.removeActor(this);
			this.delete;
			this.stage.worldConsumable.mystery.number -= 1;
		}
	}
	
}

class AmmoKit extends Terran {
	constructor(stage, position, multiplier){
		super(stage, position, new Pair(0,0), "./assets/ammo.png", 30, 30);
		this.ammo = 25 * multiplier;
	}

	/**
	 * Colliding objects recieves ammo
	 * @param {} object 
	 */
	collide(object){
		if(object instanceof Enemy){
			this.stage.removeActor(this);
			this.delete;
		}
		else if (object.ammo != undefined) {
			object.totalAmmo += this.ammo;
			this.stage.removeActor(this);
			this.delete;
		}
		this.stage.worldConsumable.ammo.number -= 1;
	}


}
class KillableEntities extends GameObject {
	constructor(stage, position, velocity, colour, length, height, healthCapacity, entityID){
		super(stage, position, velocity, colour, length, height, entityID);
		this.health = healthCapacity;
		this.healthCapacity = healthCapacity;
	}
	
	headTo(position){
		this.velocity.x=(position.x-this.position.x);
		this.velocity.y=(position.y-this.position.y);
		this.velocity.normalize();
	}

	heal(amount){
		this.health = Math.min(this.healthCapacity, this.health + amount);
	}

	setVelocity(accleration){
		this.headTo(new Pair(this.position.x + accleration.x, this.position.y + accleration.y))
	}

	step(actors){
		this.position.x = this.position.x+this.velocity.x*10;
		this.position.y = this.position.y+this.velocity.y*10;


		// stage end
		if(this.position.x<0){
			this.position.x=0;
		}
		if(this.position.x>this.stage.width){
			this.position.x=this.stage.width;
		}
		if(this.position.y<0){
			this.position.y=0;
		}
		if(this.position.y>this.stage.height){
			this.position.y=this.stage.height;
		}

		//collision with other objects
		for(var i=0;i<actors.length;i++){
			if (actors[i] != this) {
				if (actors[i].isCollision(this.position.x, this.position.y, this.length, this.height) && (actors[i].entityID != this.entityID)){
					actors[i].collide(this);
				}
			}
		}

		this.intPosition();
	}
}

class Obstacle extends KillableEntities{
	
	constructor(stage, position, colour, length, height, entityID, health){
		super(stage, position, new Pair(0,0), colour, length, height, health, entityID);
	}

	step(){
		if (this.health <= 0){
			this.stage.removeActor(this);
			this.stage.worldState.building.number -= 1;
			this.delete;
		}
	}
}


class Weapon extends GameObject{
	//super(stage, position, velocity, colour, length, height);
	constructor(stage, position, velocity, colour, length, height, entityID, owner){
		super(stage, position, velocity, colour, 32, 16, entityID);
		this.owner = owner;
		this.entityID = entityID;
		this.direction = owner.direction;
		this.capacity = 20;
		this.ammo = 10;
		this.pointDirection = new Pair(0,0);
	}

	toJSON() {
		return {
			position: this.position,
			length: this.length,
			height: this.height,
			colour: this.colour,
			pointDirection: this.pointDirection
		};
	}

	aim(direction){
		this.pointDirection = direction;
	}

	step(actors){
		if (this.owner.health <= 0){
			this.stage.removeActor(this);
			this.delete;
		}
		return;
	}
	
	isCollision(){
		return false;
	}
		
	shoot(velocity){
		var initial_position = new Pair(this.position.x, this.position.y);
		var colour= 'rgba(0,0,0,255)';
		
		velocity.normalize();
		velocity.x = velocity.x * 10;
		velocity.y = velocity.y * 10;
		
		var r = new Bullet(this.stage, initial_position, velocity, colour, 5, 5, this.owner.entityID);
		
		this.stage.addActor(r);
	}
	
}

class Sniper extends Weapon{
	constructor(stage, position, velocity, colour, length, height, entityID, owner){
		super(stage, position, velocity, "./assets/sniper.png", 32, 16, entityID, owner);
		this.capacity = 10;
		this.ammo = 5;
	}

	shoot(velocity){
		var initial_position = new Pair(this.position.x, this.position.y);
		var colour= 'rgba(0,0,0,255)';
		
		velocity.normalize();
		velocity.x = velocity.x * 30;
		velocity.y = velocity.y * 30;
		
		var r = new Bullet(this.stage, initial_position, velocity, colour, 5, 5, this.owner.entityID);
		
		this.stage.addActor(r);
	}
}

class Shotgun extends Weapon{
	constructor(stage, position, velocity, colour, length, height, entityID, owner){
		super(stage, position, velocity, "./assets/shotgun.png", 32, 16, entityID, owner);
		this.capacity = 6;
		this.ammo = 5;
	}

	shoot(velocity){
		var initial_position = new Pair(this.position.x, this.position.y);
		var colour= 'rgba(0,0,0,255)';
		var velocities = [];
		var bullets = [];
		
		var x = velocity.x;
		var y = velocity.y;

		
		for(var i=0;i<5;i++){
			velocities[i] = new Pair(x + getRandomInt(-4, 4)*x/6, y + getRandomInt(-4, 4)*y/6);
			velocities[i].normalize();
			velocities[i].x = velocities[i].x*5;
			velocities[i].y = velocities[i].y*5;
			bullets[i] = new Bullet(this.stage, new Pair(this.position.x, this.position.y), velocities[i], colour, 5, 5, this.owner.entityID)
			this.stage.addActor(bullets[i]);
		}
	}
}

class Player extends KillableEntities {
	constructor(stage, position, velocity, colour, length, height, entityID){
		super(stage, position, velocity, colour, length, height, 100, entityID);
		this.baseSpeed = 10;
		this.ammo = 6;
		this.totalAmmo = 100;
		this.direction = new Pair(1,0);
		this.weapon = new Shotgun(stage, position, null, null, null, null, entityID, this);
		this.stage.addActor(this.weapon);
		this.score = 0;
	}

	toJSON(){
		return {
				score: this.score,
				ammo: this.ammo,
				totalAmmo: this.totalAmmo,
				weapon: this.weapon,
				position: this.position,
				length: this.length,
				height: this.height,
				colour: this.colour,
				health: this.health
			}
	}

	setDirection(direction){
		this.direction = direction;
	}
	hasAmmo(){
		return (this.ammo > 0);
	}
	
	reload(){
		var loaded = this.weapon.capacity - this.ammo;
		if (this.totalAmmo >= loaded){
			this.totalAmmo = this.totalAmmo - loaded;
			this.ammo = this.weapon.capacity;
		}
		else{
			this.ammo = this.ammo + this.totalAmmo;
			this.totalAmmo = 0;
		}
	}

	step(actors){
		if(this.health <= 0){
			this.stage.removePlayer(this);
		}
		this.position.x = this.position.x+this.velocity.x*10;
		this.position.y = this.position.y+this.velocity.y*10;


		// stage end
		if(this.position.x<0){
			this.position.x=0;
		}
		if(this.position.x>this.stage.width){
			this.position.x=this.stage.width;
		}
		if(this.position.y<0){
			this.position.y=0;
		}
		if(this.position.y>this.stage.height){
			this.position.y=this.stage.height;
		}

		//collision with other objects
		for(var i=0;i<actors.length;i++){
			if (actors[i] != this) {
				if (actors[i].isCollision(this.position.x, this.position.y, this.length, this.height) && (actors[i].entityID != this.entityID)){
					actors[i].collide(this);
				}				
			}
		}

		this.intPosition();
	}
	
	shoot(velocity){
		if(this.hasAmmo() == false){
			return;
		}
		
		this.stage.players[this.entityID].ammo--;
		this.weapon.shoot(velocity);
	}
}

class Enemy extends KillableEntities {
	constructor(stage, position, velocity, colour, length, height, entityID, weapon, health){
		super(stage, position, velocity, colour, length, height, health, entityID);
		this.timer = 0;
		this.baseSpeed = 5;
		if(weapon == 'pistol'){
			this.weapon = new Weapon(stage, position, velocity, "./assets/pistol.png", null, null, 1, this);
		}
		else if(weapon == 'sniper'){
			this.weapon = new Sniper(stage, position, velocity, null, null, null, 1, this);
		}
		
		this.stage.addActor(this.weapon);
	}
	
	step(actors){
		var shortestDist = 10000;
		var playerID = null;
		var playerDistance = null;
		
		if(this.health <= 0){
			this.stage.numOfEnemy -= 1;
			this.stage.removeActor(this);
			this.delete;
		}
		
		//find closest player
		for (var i=0;i<actors.length;i++){
			if (actors[i] instanceof Player){
				playerDistance = this.distanceTo(actors[i].position);
				if (playerDistance <= shortestDist){
					shortestDist = playerDistance;
					playerID = actors[i].entityID;
				}
			}
		}
		
		if(playerID != null){
			this.headTo(this.stage.players[playerID].position);
			this.weapon.aim(this.stage.players[playerID].position);
			var target = new Pair(this.velocity.x * 10, this.velocity.y * 10);
			if(this.timer % 120 == 0 && playerDistance < 600){
				this.shoot(target);
			}
				
			this.timer++;
			//only move if the player is on screen.
			if (playerDistance > 300 && playerDistance < 800){
				this.position.x = this.position.x+this.velocity.x*this.baseSpeed;
				this.position.y = this.position.y+this.velocity.y*this.baseSpeed;
			} else {
				this.velocity.x = 0;
				this.velocity.y = 0;
			}
		}

		// stage end
		if(this.position.x < 0){
			this.position.x=0;
		}
		if(this.position.x>this.stage.width){
			this.position.x=this.stage.width;
		}
		if(this.position.y<0){
			this.position.y=0;
		}
		if(this.position.y>this.stage.height){
			this.position.y=this.stage.height;
		}

		//collision with other objects
		for(var i=0;i<actors.length;i++){
			if (actors[i] != this) {
				if (actors[i].isCollision(this.position.x, this.position.y, this.length, this.height) && (actors[i].entityID != this.entityID)){
					var id = actors[i].entityID;
					actors[i].collide(this);
				}
			}
		}
		this.intPosition();
	}
	
	shoot(velocity){
		this.weapon.shoot(velocity);
	}
	
	distanceTo(position){
		var x=(position.x-this.position.x);
		var y=(position.y-this.position.y);
		
		return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	}
	
}

class Bullet extends GameObject {
	constructor(stage, position, velocity, colour, length, height, entityID){
		super(stage, new Pair(position.x + 10, position.y + 10), velocity, colour, length, height, entityID)
	}

	/**
	 * Collision deduct health from the object
	 * @param {} object 
	 */
	collide(object){
		if (object.health != undefined) {
			object.health -= 20;
			if(object instanceof Enemy && object.health <=0 && this.entityID != 0){
				if (this.stage.players.hasOwnProperty(this.entityID)){	
					this.stage.players[this.entityID].score += 10;
				}
			} else if (object instanceof Player && object.health <=0 && this.entityID != 0){
				if (this.stage.players.hasOwnProperty(this.entityID)){
					this.stage.players[this.entityID].score += 25;
				}
			}
			this.stage.removeActor(this);
			this.delete;
		}
	}

	step(actors){
		this.position.x = this.position.x+this.velocity.x;
		this.position.y = this.position.y+this.velocity.y;

		// stage end
		if(this.position.x<0){
			this.stage.removeActor(this);
			this.delete;
		}
		if(this.position.x>this.stage.width){
			this.stage.removeActor(this);
			this.delete;
		}
		if(this.position.y<0){
			this.stage.removeActor(this);
			this.delete;
		}
		if(this.position.y>this.stage.height){
			this.stage.removeActor(this);
			this.delete;
		}

		//collision with other objects
		for(var i=0;i<actors.length;i++){
			if (actors[i] != this) {
				if (actors[i].isCollision(this.position.x, this.position.y, this.length, this.height) && (actors[i].entityID != this.entityID)){
					//prevent bullets from colliding
					this.collide(actors[i])
				}
			}
		}
		this.intPosition();
	}
}

module.exports = {Stage: Stage,
				  Player: Player,
				  Pair: Pair}