ig.module(
	'game.entities.germ'
)
.requires(
	'impact.entity'
,	'impact.timer'
,	'game.entities.splat'
)
.defines(function() {
	
EntityGerm = ig.Entity.extend({
	size: {x: 32, y: 32}
,	health: 101
,	animSheet: new ig.AnimationSheet( 'media/germies.png', 32, 32 )
,	selectedImage: new ig.Image( 'media/selected.png' )

,	CIRCLE: 1
,	TRIANGLE: 2
,	SQUARE: 3
,	RHOMBUS: 4
,	PENTAGON: 5
,	HEXAGON: 6
,	DISEASED: -1

,	shape: 0
,	shapeOffset: 8
,	infectionRate: 1.5
	
,	init: function( x, y, settings ) {
		this.parent(x, y, settings);
		
		this.addAnim( 'at100', 1, [0 + (this.shape * this.shapeOffset)] );
		this.addAnim( 'at75', 1, [1 + (this.shape * this.shapeOffset)] );
		this.addAnim( 'at50', 1, [2 + (this.shape * this.shapeOffset)] );
		this.addAnim( 'at25', 1, [3 + (this.shape * this.shapeOffset)] );
		this.addAnim( 'at0', 1, [4 + (this.shape * this.shapeOffset)] );
		
		this.infectionTimer = new ig.Timer();
		this.infectionTimer.set(this.infectionRate);
		this.isSelected = false;
	}
	
,	update: function() {
		this.parent();
		
		if (this.infectionTimer.delta() >= 0) {
			this.infectionTimer.set(this.infectionRate);
			if (this.health > 1)
				this.receiveDamage(1);
			else
				this.shape = this.DISEASED;
			
			if (this.shape == this.DISEASED) {
				MainGameManager.spreadDisease(this.grid.x, this.grid.y);
				this.infectionTimer.set(0.5);
			}
		}
			
		if (this.health > 75)
			this.currentAnim = this.anims.at100;
		else if (this.health > 50)
			this.currentAnim = this.anims.at75;
		else if (this.health > 25)
			this.currentAnim = this.anims.at50;
		else if (this.health > 1)
			this.currentAnim = this.anims.at25;
		else
			this.currentAnim = this.anims.at0;
	}
	
,	draw: function() {
		this.parent();
		
		if (this.isSelected)
			this.selectedImage.draw(this.pos.x + 8, this.pos.y + 8);
}
	
,	kill: function() {
		for (var i = 0; i < 50; i++)
			ig.game.spawnEntity(EntitySplat, this.pos.x + (this.size.x / 2), this.pos.y + (this.size.y / 2), {vel: {x:  (Math.random() * 2 - 1) * 75, y:  (Math.random() * 2 - 1) * 75} });
		MainGameManager.grid[this.grid.y][this.grid.x] = 0;
		this.parent();
	}
});

});
