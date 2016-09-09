window.onload = function(){

var simpleLevelPlan = [
"                      ",
"                      ",
"  X              = X  ",
"  X          o o   X  ",
"  X @       XXXXX  X  ",
"  XXXXX            X  ",
"      X!!!!!!!!!!!!X  ",
"      XXXXXXXXXXXXXX  ",
"                      "
];


// @ where player starts 
// = block of lava that moves bakc and forth orizontally
// | moving blob of lava 
// V for dripping lava 
// X is wall 

// build a basic level 

function Level(plan){

	this.width = plan[0].length; 
	this.height = plan.length; 
	this.grid = []; 
	this.actors = []; 

	for(var y = 0; y<this.height; y++){
		var line = plan[y],
			gridLine = []; 
		for(var x = 0; x<this.width; x++){
			var ch = line[x], 
				fieldType = null; 
			var Actor = actorChars[ch]; 
			if(Actor){
				this.actors.push(new Actor(new Vector(x,y),ch)); 
			}else if( ch === 'X'){
				fieldType = 'wall';
			}else if(ch === '!'){
				fieldType = 'lava';
			}
			gridLine.push(fieldType); 
		}
		this.grid.push(gridLine); 
	}
	this.player = this.actors.filter(function(actor){
		return actor.type === 'player';
	})[0];
	this.status = this.finishDelay = null; 
}
// check to see if the level is finished 

Level.prototype.isFinished = function(){
	return this.status !== null && this.finishDelay < 0; 
}; 

// coding Actors (dynamic players)

function Vector(x,y){
	this.x = x; 
	this.y = y; 
}

Vector.prototype.plus = function(other){
	return new Vector(this.x + other.x, this.y + other.y);
}

Vector.prototype.times = function(factor){
	return new Vector(this.x * factor, this.y * factor);
}

var actorChars = {
	"@" : Player, 
	"o" : Coin, 
	"=" : Lava, 
	"|" : Lava,
	"v" : Lava
}

// Player constructor 
function Player(pos){
	this.pos = pos.plus(new Vector(0,-0.5));
	this.size = new Vector(0.8, 1.5);
	this.speed = new Vector(0,0);
}

Player.prototype.type = "player"; 

// Lava constructor 

function Lava(pos, ch){
	this.pos = pos; 
	this.size = new Vector(1,1);
	if(ch === "="){
		this.speed = new Vector(2,0);
	}else if(ch === "|"){
		this.speed = new Vector(0,2);
	}else if(ch === "v"){
		this.speed = new Vector(0,3);
		this.repeatPos = pos; 
	}
}
Lava.prototype.type = "lava"; 

// coin constructor 

function Coin(pos){
	this.basePos = this.pos = pos.plus(new Vector(0.2,0.1));
	this.size = new Vector(0.6,0.6);
	this.wobble = Math.random()*Math.PI*2; 
}
Coin.prototype.type = 'coin'; 

var simpleLevel = new Level(simpleLevelPlan); 
console.log(simpleLevel.width, ' by ', simpleLevel.height); 

// helper function to create elements 
function elt(name, className){
	var elt = document.createElement(name); 
	if(className){
		elt.className = className;
	}
	return elt; 
}

// create a display 
function DOMDisplay(parent, level){
	this.wrap = parent.appendChild(elt('div', 'game'));
	this.level = level; 

	this.wrap.appendChild(this.drawBackground());
	this.actorLayer = null; 
	this.drawFrame(); 
}

// scale of pixels up from 1 (game units to pixels)
var scale = 20; 

DOMDisplay.prototype.drawBackground = function(){
	var table = elt("table", "background");
	table.style.width = this.level.width * scale + 'px'; 
	this.level.grid.forEach(function(row){
		var rowElt = table.appendChild(elt("tr"));
		rowElt.style.height = scale + 'px'; 
		row.forEach(function(type){
			rowElt.appendChild(elt('td',type));
		});
	});
	return table; 
}

DOMDisplay.prototype.drawActors = function(){
	var wrap = elt('div'); 

	this.level.actors.forEach(function(actor){
		var rect = wrap.appendChild(elt("div", "actor " + actor.type)); 
		rect.style.width = actor.size.x * scale + 'px';
		rect.style.height = actor.size.y * scale + 'px';
		rect.style.left = actor.size.x * scale + 'px';
		rect.style.top = actor.size.y * scale + 'px';
	});
	return wrap; 
}

// remove old position of player and re-draw at new location 
DOMDisplay.prototype.drawFrame = function(){
	if(this.actorLayer){
		this.wrap.removeChild(this.actorLayer);
	}
	this.actorLayer = this.wrap.appendChild(this.drawActors());
	this.wrap.className = "game " + (this.level.status || "");
	this.scrollPlayerIntoView();
}

// find player position and update wrapping element 

DOMDisplay.prototype.scrollPlayerIntoView = function(){
	var width = this.wrap.clientWidth,
		height = this.wrap.clientHeight, 
		margin = width/3,
		left = this.wrap.scrollLeft, // viewport stuff 
		right = left + width,
		player = this.level.player, 
		top = this.wrap.scrollTop,
		bottom = top + height,
		center = player.pos.plus(player.size.times(0.5)).times(scale);

	if(center.x < left + margin){
		this.wrap.scrollLeft = center.x - margin; 
	}else if(center.x > right - margin){
		this.wrap.scrollLeft = center.x + margin - width; 
	}

	if(center.y < top + margin){
		this.wrap.scrollTop = center.y - margin; 
	}else if(center.y > bottom - margin){
		this.wrap.scrollTop = center.y + margin - height; 
	}
}

DOMDisplay.prototype.clear = function(){
	this.wrap.parentNode.removeChild(this.wrap); 
}

	var simpleLevel = new Level(simpleLevelPlan);
	var display = new DOMDisplay(document.body, simpleLevel);

}

