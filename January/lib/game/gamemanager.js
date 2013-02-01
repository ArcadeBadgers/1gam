ig.module(
	'game.gamemanager'
)
.requires(
	'impact.font'
,	'impact.timer'
,	'impact.image'
,	'impact.sound'
,	'game.entities.germ'
)
	
.defines(function () {
	GameManager = ig.Class.extend({
		infectionTimer: new ig.Timer()
	,	score: 0
	,	highscore: 0
	,	font: new ig.Font( 'media/04b03.font.png' )
	,	statusFont: new ig.Font( 'media/status.font.png' )
	,	buttonFont: new ig.Font( 'media/button.font.png' )
	,	infectionSound: new ig.Sound( 'media/infection.*' )
	,	splatSound: new ig.Sound( 'media/squish.*' )
	,	gameOverSound: new ig.Sound( 'media/gameover.*' )
	,	level: 1
	,	nextInfectionLevel: 10
	,	nextInfectionTime: 10
	,	isGameRunning: false
	,	selectedImage: new ig.Image( 'media/selected.png' )
	,	selectedSpace: { x: -1, y: -1 }

	,	grid: []
	,	PLAYAREA_WIDTH: 8
	,	PLAYAREA_HEIGHT: 6
	,	PLAYAREA_LEFT: 1
	,	PLAYAREA_RIGHT: 6
	,	WAIT_AREA_LEFT: 0
	,	WAIT_AREA_RIGHT: 7
	,	GERM_SIZE: 32
	,	GRID_OFFSET: { x: 32, y:64 }
	
	,	isGameOver: false
	,	isPaused: false
	,	currentStatus: ""
	,	statusTimer: new ig.Timer()
		
	,	start:function(game) {
			this.GRID_EXTENTS = {  x: this.GRID_OFFSET.x + (this.PLAYAREA_WIDTH * this.GERM_SIZE), y: this.GRID_OFFSET.y + (this.PLAYAREA_HEIGHT * this.GERM_SIZE) };
			
			this.game = game;
			this.isGameRunning = true;
			this.grid = [];
			this.score = 0;
			
			// Create BackgroundMap
			var data = [
				[0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0],
				[0,1,2,2,2,2,2,2,1],
				[0,1,2,2,2,2,2,2,1],
				[0,1,2,2,2,2,2,2,1],
				[0,1,2,2,2,2,2,2,1],
				[0,1,2,2,2,2,2,2,1],
				[0,1,2,2,2,2,2,2,1]
			];
			var bg = new ig.BackgroundMap( 32, data, 'media/tiles.png' );
			game.backgroundMaps.push( bg );
			
			for (var y = 0; y < this.PLAYAREA_HEIGHT; ++y) {
				this.grid[y] = [];
				for (var x = 0; x < this.PLAYAREA_WIDTH; ++x) {
					this.grid[y][x] = 0;
				}
			}
			
			for (var y = 1; y < this.PLAYAREA_HEIGHT - 1; ++y) {
				for (var x = this.PLAYAREA_LEFT + 1; x < this.PLAYAREA_RIGHT; ++x) {
					this.grid[y][x] = this.newGerm(x, y);
				}
			}
			
			var timer = 5 + (this.nextInfectionTime - (this.level - 1));
			if (timer < 10)
				timer = 10;
			this.infectionTimer.set(timer);
			this.isGameOver = false;
			this.isPaused = false;
			this.statusTimer.reset();
			this.nextInfectionLevel = 5;
			this.level = 1;
		}
		
	,	update:function() {
			if ((true == this.isGameRunning) && (false == this.isGameOver)) {
				if (0 < this.infectionTimer.delta()) {
					this.infectionTimer.set(10 + (this.nextInfectionTime * (1 / this.level) ) );
					this.addInfection();
					this.addInfection();
					this.addInfection();
					this.changeStatus("Infected!");
				}
				
				this.checkMouse();
			}
			
			if (0 < this.statusTimer.delta())
				this.currentStatus = "";
			
			this.checkButtons();
		}
		
	,	changeStatus: function(status) {
			this.statusTimer.set(5);
			this.currentStatus = status;
			for (var i = 0; i < 50; i++)
				ig.game.spawnEntity(EntitySplat, this.GRID_EXTENTS.x + 8 + (Math.random() * 100), 128 + (Math.random() * 32), {vel: {x:  (Math.random() * 2 - 1) * 75, y:  (Math.random() * 2 - 1) * 75} });
		}
		
	,	quit: function() {
			if (this.score > this.highscore)
				this.highscore = this.score;
		
			this.score = 0;
			this.level = 1;
			this.nextInfectionLevel = 10;
			this.infectionTimer.reset();
			this.isGameRunning = false;
		}
		
	,	gameOver: function() {
			this.isGameRunning = false;
			this.isGameOver = true;
			if (this.score > this.highscore)
				this.highscore = this.score;
			this.gameOverSound.play();
		}
		
	,	draw:function() {
			this.font.draw("Score:", 320, 303);
			this.font.draw(this.score, 320, 310);
			
			this.font.draw("Level: " + this.level, 50, 303);
			
			this.statusFont.draw(this.currentStatus, this.GRID_EXTENTS.x + 8, 128);
			
			if (this.isGameOver == true)
				this.buttonFont.draw("GAME OVER", 64, 128);
			if (this.isPaused == true)
				this.buttonFont.draw("GAME PAUSED", 64, 128);
			
			this.buttonFont.draw("Pause", this.GRID_EXTENTS.x + 8 + 32, 64);
			this.buttonFont.draw("Quit Game", this.GRID_EXTENTS.x + 8, 224);
		}
		
	,	newGerm:function(x, y) {
			var settings = { shape: Math.floor(Math.random()*6), grid: { x: x, y: y } };
			return this.game.spawnEntity( EntityGerm, (x * this.GERM_SIZE) + this.GRID_OFFSET.x, (y * this.GERM_SIZE) + this.GRID_OFFSET.y, settings );
		}
		
	,	addInfection: function() {
			var side = this.WAIT_AREA_LEFT;
			var leftOrRight = Math.random();
			if (leftOrRight > 0.5)
				side = this.WAIT_AREA_RIGHT;
			
			var isSpace = false;
			for (var space = 0; space < this.PLAYAREA_HEIGHT; ++space) {
				if (0 == this.grid[space][side]) {
					this.grid[space][side] = this.newGerm(side, space)
					isSpace = true;
					break;
				}
			}
			
			if (false == isSpace) { // try other side...
				if (side == this.WAIT_AREA_LEFT)
					side = this.WAIT_AREA_RIGHT;
				else
					side = this.WAIT_AREA_LEFT;
				
				for (var space = 0; space < this.PLAYAREA_HEIGHT; ++space) {
					if (0 == this.grid[space][side]) {
						this.grid[space][side] = this.newGerm(side, space)
						isSpace = true;
						break;
					}
				}
				
				if (false == isSpace) {
					this.gameOver();
					return;
				}
			}
			
			this.checkGrid();
			this.infectionSound.play();
		}
		
	,	checkMouse: function() {
			if (ig.input.pressed('mouseClick')) {
				if ((ig.input.mouse.x > this.GRID_OFFSET.x) && (ig.input.mouse.x < this.GRID_EXTENTS.x)
				&& (ig.input.mouse.y > this.GRID_OFFSET.y) && (ig.input.mouse.y < this.GRID_EXTENTS.y)) {
					var gridPosition = { x: Math.floor((ig.input.mouse.x - this.GRID_OFFSET.x) / this.GERM_SIZE), y: Math.floor((ig.input.mouse.y - this.GRID_OFFSET.y) / this.GERM_SIZE) };
					this.selectSpace(gridPosition.x, gridPosition.y);
				}
			}
		}
		
	,	selectSpace:function(x, y) {
			if (this.selectedSpace.x == -1) { // new selection
				if (0 != this.grid[y][x]) {
					var selectedGerm = this.grid[y][x];
					selectedGerm.isSelected = true;
					this.selectedSpace.x = x; this.selectedSpace.y = y;
				}
			}
			else { // ok, can we move here?
				var delta = { x: x - this.selectedSpace.x, y: y - this.selectedSpace.y };
				if (delta.x < 0)
					delta.x *= -1;
				if (delta.y < 0)
					delta.y *= -1;
				
				if (delta.x + delta.y == 1) { // swap spaces
					var germ = this.grid[this.selectedSpace.y][this.selectedSpace.x];
					var target = this.grid[y][x];
					if (0 != germ) {
						this.grid[y][x] = this.grid[this.selectedSpace.y][this.selectedSpace.x];
						this.grid[this.selectedSpace.y][this.selectedSpace.x] = target;
						germ.pos.x = (x * this.GERM_SIZE) + this.GRID_OFFSET.x;
						germ.pos.y = (y * this.GERM_SIZE) + this.GRID_OFFSET.y;
						germ.grid.x = x;
						germ.grid.y = y;
						germ.isSelected = false;
					}
					if (0 != target) {
						target.pos.x = (this.selectedSpace.x * this.GERM_SIZE) + this.GRID_OFFSET.x;
						target.pos.y = (this.selectedSpace.y * this.GERM_SIZE) + this.GRID_OFFSET.y;
						target.grid.x = this.selectedSpace.x;
						target.grid.y = this.selectedSpace.y;
					}
					this.selectedSpace.x = -1;
					this.selectedSpace.y = -1;
					this.checkGrid();
				}
				else {
					var germ = this.grid[this.selectedSpace.y][this.selectedSpace.x];
					this.selectedSpace.x = -1;
					this.selectedSpace.y = -1;
					germ.isSelected = false;
				}
			}
		}
		
	,	checkGrid: function() {
			for (var y = 0; y < this.PLAYAREA_HEIGHT; ++y) {
				for (var x = 0; x < this.PLAYAREA_WIDTH; ++x) {
					if (0 != this.grid[y][x]) {
						this.squaredGerms(x, y);
					}
				}
			}
		}

	,	squaredGerms: function(x, y) {
			var matched = 0;
			var thisGerm = this.grid[y][x];
			if (thisGerm.health == 1) // diseased
				return;
			
			var matchedGerms = [];
			var shape = thisGerm.shape;
			// check up, upleft, left
			if (y > 0) {
				if (0 != this.grid[y-1][x])
					if (this.grid[y-1][x].shape == shape) {
						matchedGerms[matched] = this.grid[y-1][x];
						matched++;
					}
				if (x > this.PLAYAREA_LEFT) {
					if (0 != this.grid[y-1][x-1])
						if (this.grid[y-1][x-1].shape == shape) {
							matchedGerms[matched] = this.grid[y-1][x-1];
							matched++;
						}
				}
			}
			if (x > this.PLAYAREA_LEFT) {
				if (0 != this.grid[y][x-1])
					if (this.grid[y][x-1].shape == shape) {
						matchedGerms[matched] = this.grid[y][x-1];
						matched++;
					}
			}
			if (matched != 3)
				matched = 0;

			// check up, upright, right
			if (matched == 0) {
				if (y > 0) {
					if (0 != this.grid[y-1][x])
						if (this.grid[y-1][x].shape == shape) {
							matchedGerms[matched] = this.grid[y-1][x];
							matched++;
						}
					if (x < this.PLAYAREA_RIGHT) {
						if (0 != this.grid[y-1][x+1])
							if (this.grid[y-1][x+1].shape == shape) {
								matchedGerms[matched] = this.grid[y-1][x+1];
								matched++;
							}
					}
				}
				if (x < this.PLAYAREA_RIGHT) {
					if (0 != this.grid[y][x+1])
						if (this.grid[y][x+1].shape == shape) {
							matchedGerms[matched] = this.grid[y][x+1];
							matched++;
						}
				}
				if (matched != 3)
					matched = 0;
			}

			// check down, downleft, left
			if (matched == 0) {
				if (y < this.PLAYAREA_HEIGHT - 1) {
					if (0 != this.grid[y+1][x])
						if (this.grid[y+1][x].shape == shape) {
							matchedGerms[matched] = this.grid[y+1][x];
							matched++;
						}
					if (x > this.PLAYAREA_LEFT) {
						if (0 != this.grid[y+1][x-1])
							if (this.grid[y+1][x-1].shape == shape) {
								matchedGerms[matched] = this.grid[y+1][x-1];
								matched++;
							}
					}
				}
				if (x > this.PLAYAREA_LEFT) {
					if (0 != this.grid[y][x-1])
						if (this.grid[y][x-1].shape == shape) {
							matchedGerms[matched] = this.grid[y][x-1];
							matched++;
						}
				}
				if (matched != 3)
					matched = 0;
			}

			// check down, downright, right
			if (matched == 0) {
				if (y < this.PLAYAREA_HEIGHT - 1) {
					if (0 != this.grid[y+1][x])
						if (this.grid[y+1][x].shape == shape) {
							matchedGerms[matched] = this.grid[y+1][x];
							matched++;
						}
					if (x <this.PLAYAREA_RIGHT) {
						if (0 != this.grid[y+1][x+1])
							if (this.grid[y+1][x+1].shape == shape) {
								matchedGerms[matched] = this.grid[y+1][x+1];
								matched++;
							}
					}
				}
				if (x < this.PLAYAREA_RIGHT) {
					if (0 != this.grid[y][x+1])
						if (this.grid[y][x+1].shape == shape) {
							matchedGerms[matched] = this.grid[y][x+1];
							matched++;
						}
				}
				if (matched != 3)
					matched = 0;
			}

			if (matched == 3) {
				var score = 0;
				for (var index = 0; index < 3; ++index)
					score += this.deleteGerm(matchedGerms[index]);

				score += this.deleteGerm(thisGerm);
				score += shape * 10;
				this.score += score;
				this.changeStatus(" Score!\n  " + score);
				this.splatSound.play();
				
				--this.nextInfectionLevel;
				if (this.nextInfectionLevel == 0) {
					++this.level;
					this.nextInfectionLevel = 5 + this.level;
					this.changeStatus("Level UP");
				}
			}
		}
		
	,	deleteGerm: function(germ) {
			var score = (101 - germ.health) * this.level;
			this.grid[germ.grid.y][germ.grid.x] = 0;
			germ.kill();
			return score;
		}

	,	spreadDisease: function(x, y) {
			if (y > 0) {
				if (0 != this.grid[y-1][x])
					if (this.grid[y-1][x].health > 1)
						this.grid[y-1][x].receiveDamage(1);
			}
			if (x > this.PLAYAREA_LEFT) {
				if (0 != this.grid[y][x-1])
					if (this.grid[y][x-1].health > 1)
						this.grid[y][x-1].receiveDamage(1);
			}
			if (x < this.PLAYAREA_RIGHT) {
				if (0 != this.grid[y][x+1])
					if (this.grid[y][x+1].health > 1)
						this.grid[y][x+1].receiveDamage(1);
			}
			if (y < this.PLAYAREA_HEIGHT - 1) {
				if (0 != this.grid[y+1][x])
					if (this.grid[y+1][x].health > 1)
						this.grid[y+1][x].receiveDamage(1);
			}
		}
		
	,	checkButtons:function() {
			if (true == this.checkQuitPressed()) {
				this.gameOver();
				ig.system.setGame(StartScreen);
			}
			
			if (true == this.checkPausePressed()) {
				if (this.isPaused == true)
					this.unpause();
				else
					this.pause();
			}
		}
		
	,	checkPausePressed: function() {
			if (ig.input.pressed('mouseClick')) {
				var mouse = ig.input.mouse;
				if ((mouse.x > this.GRID_EXTENTS.x + 8 + 32) && (mouse.x < this.GRID_EXTENTS.x + 8 + 32 + 160)
				&& (mouse.y > 64) && (mouse.y < 64 + 32))
					return true;
			}
			else
				return false;
		}
		
	,	checkQuitPressed: function() {
			if (ig.input.pressed('mouseClick')) {
				var mouse = ig.input.mouse;
				if ((mouse.x > this.GRID_EXTENTS.x + 8) && (mouse.x < this.GRID_EXTENTS.x + 8 + 288)
				&& (mouse.y > 224) && (mouse.y < 224 + 32))
					return true;
			}
			else
				return false;
	}
		
	,	pause: function() {
			var germs = this.game.getEntitiesByType( EntityGerm );
			for (var i = 0; i < germs.length; ++i)
				germs[i].infectionTimer.pause();
				
			this.isGameRunning = false;
			this.infectionTimer.pause();
			this.isPaused = true;
		}
		
	,	unpause: function() {
			var germs = this.game.getEntitiesByType( EntityGerm );
			for (var i = 0; i < germs.length; ++i)
				germs[i].infectionTimer.unpause();
				
			this.isGameRunning = true;
			this.infectionTimer.unpause();
			this.isPaused = false;
		}
	})
	
	MainGameManager = new GameManager();
	
});
