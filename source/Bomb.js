function BombManager( gameState ) {
  this.parent = ElementManager ;
  this.parent.call( this, gameState ) ;
}
__inherit( BombManager, ElementManager ) ;

BombManager.prototype._MAX_NUM = 40;


BombManager.prototype._initMaxNum = function() {
  return this._MAX_NUM;
};


BombManager.prototype._initFactory = function( ) {
  this.factory = new BombFactory( this.gameState, this.gameState.getWidth( ), this.gameState.getHeight( ) ) ;
} ;


BombManager.prototype.initDrawer = function(layer, image) {
  this.drawer = new BombDrawer(this, layer,
                               this.gameState.getImage(Game._IMG_BOMB));
};


// TODO: temporal
BombManager.prototype.create = function( fighter ) {
  var bombs = this.factory.create( fighter ) ;
  for( var i = 0; i < bombs.length; i++ )
    this.addElement( bombs[ i ] ) ;
} ;



function BombFactory( gameState, maxX, maxY ) {
  this.parent = ElementFactory ;
  this.parent.call( this, gameState, maxX, maxY ) ;
  this.params = [ ] ;
  this._initBomb( ) ;
  this.image = null; // TODO: temporal
}
__inherit( BombFactory, ElementFactory ) ;

BombFactory.prototype._NUM = 20 ;
BombFactory.prototype._BULLET_NUM = 10 ;


BombFactory.prototype._initFreelist = function() {
  this.freelist = new BombFreeList(this._NUM, this.gameState); 
};


BombFactory.prototype._initBomb = function() {
  var num = this._BULLET_NUM;
  for(var i = 0; i < num; i++) {
    this.params.push( {
      'x': 0,
      'y': 0,
      'v': { 'r': 0, 'theta': ((360 / num) | 0) * i, 'w': 1, 'ra': 0.2 }
    } ) ;
  }
} ;


BombFactory.prototype.create = function( fighter ) {
  if( fighter.canonMoves )
    return this._createCanon( fighter ) ;
  var bombs = [ ] ;
  for( var i = 0; i < this.params.length; i++ ) {
    this.params[ i ].x = fighter.getX( ) ;
    this.params[ i ].y = fighter.getY( ) ;
    var bomb = this.freelist.get( ) ;
    bomb.init( this.params[ i ], this._getImage( this.params[ i ] ), fighter ) ;
    bombs.push( bomb ) ;
  }
  return bombs ;
} ;


// reimu: seven fantasy seal orbs. marisa: one master spark
BombFactory.prototype._SEAL_ORBS = 7 ;

BombFactory.prototype._createCanon = function( fighter ) {
  var canonBombs = [ ] ;
  if( fighter.characterIndex == fighter._MARISA ) {
    var spark = this.freelist.get( ) ;
    spark.init( { 'x': 0, 'y': 0, 'v': { 'r': 0, 'theta': 270 } }, this._getImage( null ), fighter ) ;
    spark.beSpark( ) ;
    canonBombs.push( spark ) ;
    return canonBombs ;
  }
  for( var i = 0; i < this._SEAL_ORBS; i++ ) {
    var orb = this.freelist.get( ) ;
    orb.init( { 'x': 0, 'y': 0, 'v': { 'r': 0, 'theta': 270 } }, this._getImage( null ), fighter ) ;
    orb.beSealOrb( i, this._SEAL_ORBS ) ;
    canonBombs.push( orb ) ;
  }
  return canonBombs ;
} ;


/**
 * TODO: temporal
 */
BombFactory.prototype._getImage = function(params) {
  if(this.image === null)
    this.image = this.gameState.getImage(Game._IMG_BOMB);
  return this.image;
};



function BombFreeList( num, gameState ) {
  this.parent = ElementFreeList ;
  this.parent.call( this, num, gameState ) ;
}
__inherit( BombFreeList, ElementFreeList ) ;


BombFreeList.prototype._generateElement = function( ) {
  return new Bomb( this.gameState, this.gameState.getWidth( ), this.gameState.getHeight( ) ) ;
} ;



function BombDrawer(elementManager, layer, image) {
  this.parent = ElementDrawer;
  this.parent.call(this, elementManager, layer, image);
};
__inherit(BombDrawer, ElementDrawer);

BombDrawer.prototype.Layer = Layer;

BombDrawer.prototype._getBlend = function() {
  return this.Layer._BLEND_ADD_ALPHA;
};



function BombView(element) {
  this.parent = ElementView;
  this.parent.call(this, element);
  this.a = 0.4;
};
__inherit(BombView, ElementView);



/**
 * Currently Bomb represents just a big bullet.
 */
function Bomb( gameState, maxX, maxY ) {
  this.parent = Element ;
  this.parent.call( this, gameState, maxX, maxY ) ;
}
__inherit( Bomb, Element ) ;

Bomb.prototype._WIDTH  = 128 ;

Bomb.prototype.Math = Math ;

Bomb.prototype._LIFE = 100 ;
Bomb.prototype._SEAL_DAMAGE = 9 ;
Bomb.prototype._SEAL_SPLASH = 6 ;
Bomb.prototype._SEAL_SPLASH_RANGE = 70 ;
Bomb.prototype._SEAL_SPEED = 7 ;
Bomb.prototype._SPARK_DAMAGE = 2.6 ;
Bomb.prototype._SPARK_HALF_WIDTH = 44 ;
Bomb.prototype._HEIGHT = 128 ;

Bomb.prototype._OUT_RANGE = 200 ;


Bomb.prototype.Element_init = Element.prototype.init;
Bomb.prototype.init = function( params, image, fighter ) {
  this.Element_init(params, image);

  this.setX( fighter.getX( ) ) ;
  this.setY( fighter.getY( ) ) ;

  this.width = this._WIDTH ;
  this.height = this._HEIGHT ;
  this.collisionWidth = this.width ;
  this.collisionHeight = this.height ;
  this.indexX = 0 ;
  this.indexY = 3 ;
  this.kind = null ;
  this.fighter = fighter ;
  this.sealTarget = null ;
  this.sealTargetIsBoss = false ;
  this._initView();
} ;


Bomb.prototype.beSealOrb = function( orbNum, orbTotal ) {
  this.kind = 'seal' ;
  this.orbAngle = orbNum * 360 / orbTotal ;
  // the colored orbs in the second row of the bomb image
  this.width = 64 ;
  this.height = 64 ;
  this.collisionWidth = 40 ;
  this.collisionHeight = 40 ;
  this.indexX = 1 + orbNum % 7 ;
  this.indexY = 1 ;
  this._initView( ) ;
} ;


Bomb.prototype.beSpark = function( ) {
  this.kind = 'spark' ;
  // drawn by the stage effects, so nothing to draw here
  this.width = 0 ;
  this.height = 0 ;
  this._initView( ) ;
} ;


Bomb.prototype.Element_runStep = Element.prototype.runStep ;
Bomb.prototype.runStep = function( ) {
  if( this.kind == 'seal' )
    this._sealStep( ) ;
  else if( this.kind == 'spark' )
    this._sparkStep( ) ;
  this.Element_runStep( ) ;
} ;


/*
 * the orbs spin out around the player for a moment,
 * then each one flies at the closest enemy and bursts on it.
 */
Bomb.prototype._sealStep = function( ) {
  if( this.isDead( ) )
    return ;
  if( this.count < 24 ) {
    var spinRadius = this.count * 2.4 ;
    var spinAngle = ( this.orbAngle + this.count * 6 ) * this.Math.PI / 180 ;
    this.setX( this.fighter.getX( ) + spinRadius * this.Math.cos( spinAngle ) ) ;
    this.setY( this.fighter.getY( ) + spinRadius * this.Math.sin( spinAngle ) ) ;
    return ;
  }
  if( this.count % 4 == 0 || ! this._targetStillGood( ) )
    this._findSealTarget( ) ;

  var moveX = 0 ;
  var moveY = -this._SEAL_SPEED ;
  if( this.sealTarget ) {
    var toX = this.sealTarget.getX( ) - this.getX( ) ;
    var toY = this.sealTarget.getY( ) - this.getY( ) ;
    var toLength = this.Math.sqrt( toX * toX + toY * toY ) ;
    if( toLength < 30 ) {
      this._sealBurst( ) ;
      return ;
    }
    moveX = toX / toLength * this._SEAL_SPEED ;
    moveY = toY / toLength * this._SEAL_SPEED ;
  }
  this.setX( this.getX( ) + moveX ) ;
  this.setY( this.getY( ) + moveY ) ;

  if( this.count >= this._LIFE - 1 || this.getY( ) < -20 )
    this._sealBurst( ) ;
} ;


Bomb.prototype._targetStillGood = function( ) {
  if( ! this.sealTarget )
    return false ;
  if( this.sealTargetIsBoss )
    return ! this.sealTarget.isFlagSet( this.sealTarget._FLAG_UNHITTABLE ) && ! this.sealTarget.isVanishingOrEscaping( ) ;
  return ! this.sealTarget.isDead( ) ;
} ;


Bomb.prototype._findSealTarget = function( ) {
  var closestDistance = 1000 * 1000 ;
  this.sealTarget = null ;
  this.sealTargetIsBoss = false ;
  var enemies = this.gameState.enemyManager.elements ;
  for( var i = 0; i < enemies.length; i++ ) {
    if( enemies[ i ].isDead( ) || enemies[ i ].getY( ) < 0 )
      continue ;
    var enemyDx = enemies[ i ].getX( ) - this.getX( ) ;
    var enemyDy = enemies[ i ].getY( ) - this.getY( ) ;
    var enemyDistance = enemyDx * enemyDx + enemyDy * enemyDy ;
    if( enemyDistance < closestDistance ) {
      closestDistance = enemyDistance ;
      this.sealTarget = enemies[ i ] ;
    }
  }
  if( this.gameState.bossManager.existBoss( ) ) {
    var boss = this.gameState.bossManager.getBoss( ) ;
    if( ! boss.isFlagSet( boss._FLAG_UNHITTABLE ) && ! boss.isVanishingOrEscaping( ) ) {
      var bossDx = boss.getX( ) - this.getX( ) ;
      var bossDy = boss.getY( ) - this.getY( ) ;
      if( bossDx * bossDx + bossDy * bossDy < closestDistance ) {
        this.sealTarget = boss ;
        this.sealTargetIsBoss = true ;
      }
    }
  }
} ;


Bomb.prototype._sealBurst = function( ) {
  var stage = this.gameState ;
  if( this.sealTarget && this._targetStillGood( ) )
    stage.bombDamage( this.sealTarget, this._SEAL_DAMAGE, this.sealTargetIsBoss ) ;

  var enemies = stage.enemyManager.elements ;
  for( var i = 0; i < enemies.length; i++ ) {
    if( enemies[ i ] == this.sealTarget )
      continue ;
    var splashDx = enemies[ i ].getX( ) - this.getX( ) ;
    var splashDy = enemies[ i ].getY( ) - this.getY( ) ;
    if( splashDx * splashDx + splashDy * splashDy < this._SEAL_SPLASH_RANGE * this._SEAL_SPLASH_RANGE )
      stage.bombDamage( enemies[ i ], this._SEAL_SPLASH, false ) ;
  }
  stage.fx.sealBurst( this.getX( ), this.getY( ), this.indexX ) ;
  this.die( ) ;
} ;


/*
 * a huge beam straight up from marisa. it follows her,
 * hurts everything inside it and wipes out the bullets it touches.
 */
Bomb.prototype._sparkStep = function( ) {
  if( this.isDead( ) )
    return ;
  this.setX( this.fighter.getX( ) ) ;
  this.setY( this.fighter.getY( ) ) ;
  if( this.count >= this._LIFE ) {
    this.die( ) ;
    return ;
  }
  if( this.count < 10 || this.count % 4 != 0 )
    return ;

  var stage = this.gameState ;
  var enemies = stage.enemyManager.elements ;
  for( var i = 0; i < enemies.length; i++ ) {
    if( this._inSpark( enemies[ i ], 16 ) )
      stage.bombDamage( enemies[ i ], this._SPARK_DAMAGE, false ) ;
  }
  if( stage.bossManager.existBoss( ) ) {
    var boss = stage.bossManager.getBoss( ) ;
    if( this._inSpark( boss, 25 ) )
      stage.bombDamage( boss, this._SPARK_DAMAGE, true ) ;
  }
  var enemyBullets = stage.enemyBulletManager.elements ;
  for( var j = 0; j < enemyBullets.length; j++ ) {
    if( ! enemyBullets[ j ].isDead( ) && this._inSpark( enemyBullets[ j ], 4 ) ) {
      enemyBullets[ j ].die( ) ;
      stage.notifyBeScoreItem( this.fighter, enemyBullets[ j ], true ) ;
    }
  }
} ;


// the spark covers the whole screen above marisa
Bomb.prototype._inSpark = function( target, targetHalfWidth ) {
  return target.getY( ) <= this.getY( ) + targetHalfWidth ;
} ;


Bomb.prototype._generateView = function() {
  return new BombView(this);
};


Bomb.prototype.display = function( surface ) {
//  surface.save( ) ;
  surface.globalAlpha = 0.6 ;
  this.parent.prototype.display.call( this, surface ) ;
  surface.globalAlpha = 1.0 ;
//  surface.restore( ) ;
} ;


Bomb.prototype._outOfTheField = function( ) {
  if( this.kind == 'spark' )
    return false ;
  if( this.getX( ) < -this._OUT_RANGE || this.getX( ) > this.maxX + this._OUT_RANGE ||
      this.getY( ) < -this._OUT_RANGE || this.getY( ) > this.maxY + this._OUT_RANGE )
    return true ;
  return false ;
} ;
