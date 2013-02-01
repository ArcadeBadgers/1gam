ig.module(
	'game.entities.splat'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntitySplat = ig.Entity.extend({
	size: {x: 8, y: 8}
,	maxVel: {x: 160, y: 160}
	
,	lifetime: 2
,	fadetime: 1
,	bounciness: 0.6
,	friction: {x:20, y: 0}
	
,	animSheet: new ig.AnimationSheet( 'media/splatparticle.png', 8, 8 )
	
,	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.addAnim( 'idle', 0.125, [0, 1, 2, 3, 4, 5], true);
		this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
		this.vel.y = (Math.random() * 2 - 1) * this.vel.y;
		
		this.currentAnim.flip.x = (Math.random() > 0.5);
		this.currentAnim.flip.y = (Math.random() > 0.5);
		this.currentAnim.gotoRandomFrame();
		this.idleTimer = new ig.Timer();
	}
	
,	update: function() {
		if( this.idleTimer.delta() > this.lifetime ) {
			this.kill();
			return;
		}
		this.currentAnim.alpha = this.idleTimer.delta().map(
			this.lifetime - this.fadetime, this.lifetime,
			1, 0
		);
		this.parent();
	}
});

});
