ig.module(
	'game.main'
)
.requires(
	'impact.game'

,	'game.gamemanager'
,	'plugins.impact-splash-loader.impact-splash-loader'
)
.defines(function () {

MainGame = ig.Game.extend( {
	init: function() {
		MainGameManager.start(this);
		this.clearColor = "#efe4b0";
		
		// Create BackgroundMap
		var data = [
			[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
		];
		this.backgroundMaps.push( new ig.BackgroundMap(32, data, 'media/tiles.png' ) );
	}
	
,	update: function() {
		this.parent();
		MainGameManager.update();
	}
	
,	draw: function() {
		this.parent();
		MainGameManager.draw();
	}
});

HelpScreen = ig.Game.extend( {
	background:new ig.Image('media/helpscreen.png')
,	backgroundPos: { x: 0, y: 0 }
,	font: new ig.Font( 'media/04b03.font.png' )

,	init: function() {
		ig.input.bind( ig.KEY.MOUSE1, 'mouseClick' );
		ig.input.bind( ig.KEY.MOUSE2, 'mouseClick' );
		ig.input.bindTouch( '#canvas', 'mouseClick' );
		
		this.backgroundPos.x = (ig.system.width / 2) - (this.background.width / 2);
		this.backgroundPos.y = (ig.system.height / 2) - (this.background.height/ 2);
	}
	
,	update: function() {
		this.parent();
		if (ig.input.pressed('mouseClick'))
			ig.system.setGame(StartScreen);
	}
	
,	draw: function() {
		this.parent();
		this.background.draw(0, this.backgroundPos.y);
		this.font.draw("Press to go back to Start Screen", 150, 300);
	}
});

CreditsScreen = ig.Game.extend( {
	background:new ig.Image('media/creditscreen.png')
,	backgroundPos: { x: 0, y: 0 }
,	font: new ig.Font( 'media/04b03.font.png' )

,	init: function() {
		ig.input.bind( ig.KEY.MOUSE1, 'mouseClick' );
		ig.input.bind( ig.KEY.MOUSE2, 'mouseClick' );
		ig.input.bindTouch( '#canvas', 'mouseClick' );
		
		this.backgroundPos.x = 0;
		this.backgroundPos.y = (ig.system.height / 2) - (this.background.height/ 2);
	}
	
,	update: function() {
		this.parent();
		if (ig.input.pressed('mouseClick'))
			ig.system.setGame(StartScreen);
	}
	
,	draw: function() {
		this.parent();
		this.background.draw(this.backgroundPos.x, this.backgroundPos.y);
		this.font.draw("Press to go back to Start Screen", 150, 300);
	}
});

StartScreen = ig.Game.extend({
	background:new ig.Image('media/titlescreen.png')
,	font: new ig.Font( 'media/04b03.font.png' )
,	backgroundPos: { x: 0, y: 0 }
,	offset: { x: 0, y: 0 }
	
,	init: function() {
		ig.input.bind( ig.KEY.MOUSE1, 'mouseClick' );
		ig.input.bind( ig.KEY.MOUSE2, 'mouseClick' );
		ig.input.bindTouch( '#canvas', 'mouseClick' );
		
		this.offset.x = (ig.system.width - this.background.width) / 2;
		this.offset.y = (ig.system.height - this.background.height) / 2;
		this.backgroundPos.x = (ig.system.width / 2) - (this.background.width / 2);
		this.backgroundPos.y = (ig.system.height / 2) - (this.background.height/ 2);
	}
	
,	update: function() {
		if (true == this.checkCreditsPressed())
			ig.system.setGame(CreditsScreen);
		
		if (true == this.checkHelpPressed())
			ig.system.setGame(HelpScreen);
		
		if (true == this.checkStartPressed())
			this.startGame();
		
		this.parent();
	}
	
,	checkCreditsPressed: function() {
		if (ig.input.pressed('mouseClick')) {
			var mouse = ig.input.mouse;
			if ((mouse.x > 428 + this.offset.x) && (mouse.x < 482 + this.offset.x)
			&& (mouse.y > 3 + this.offset.y) && (mouse.y < 72 + this.offset.y))
				return true;
		}
		else
			return false;
	}
	
,	checkHelpPressed: function() {
		if (ig.input.pressed('mouseClick')) {
			var mouse = ig.input.mouse;
			if ((mouse.x > 30 + this.offset.x) && (mouse.x < 82 + this.offset.x)
			&& (mouse.y > 15 + this.offset.y) && (mouse.y < 34 + this.offset.y))
				return true;
		}
		else
			return false;
	}
	
,	checkStartPressed: function() {
		if (ig.input.pressed('mouseClick')) {
			var mouse = ig.input.mouse;
			if ((mouse.x > 199 + this.offset.x) && (mouse.x < 260 + this.offset.x)
			&& (mouse.y > 234 + this.offset.y) && (mouse.y < 255 + this.offset.y))
				return true;
		}
		else
			return false;
}
	
,	startGame: function() {
		ig.system.setGame(MainGame);
	}
	
,	draw: function() {
		this.parent();
		this.background.draw(this.backgroundPos.x, this.backgroundPos.y);
		this.font.draw("High Score: " + MainGameManager.highscore, 50, 300);
	}
});

if (ig.ua == ig.ua.mobile)
	ig.main( '#canvas', StartScreen, 60, 480, 320, 1, ig.ImpactSplashLoader );
else
	ig.main( '#canvas', StartScreen, 60, 480, 320, 2, ig.ImpactSplashLoader );

});
