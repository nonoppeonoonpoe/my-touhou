/**
 * care for two players in the future.
 */
function FighterManager(gameState) {
  this.parent = ElementManager;
  this.parent.call(this, gameState);
  this.id = 0;
  this._init();
};
__inherit(FighterManager, ElementManager);

FighterManager.prototype._MAX_NUM = 2;

FighterManager.prototype.Randomizer = __randomizer;
FighterManager.prototype.Math = Math;


FighterManager.prototype._initMaxNum = function() {
  return this._MAX_NUM;
};


/**
 * Note: not return the resouces to freelist.
 */
FighterManager.prototype.reset = function() {
  for(var i = 0; i < this.elements.length; i++) {
    this.elements[i].reset();
    this.elements[i].beDefaultPosition();
  }
  this.count = 0;
};


FighterManager.prototype.recoverWhenContinue = function() {
  for(var i = 0; i < this.elements.length; i++) {
    this.elements[i].recoverWhenContinue();
  }
};


FighterManager.prototype.beNeutral = function() {
  for(var i = 0; i < this.elements.length; i++) {
    this.elements[i].beNeutral();
  }
};


FighterManager.prototype.getFighter = function() {
  return this.get(0);
};


FighterManager.prototype.getRandom = function() {
  return this.get((this.Randomizer.random() * this.elements.length) | 0);
};


FighterManager.prototype.getMe = function(isMaster) {
  return this.get(isMaster ? 0 : 1);
};


FighterManager.prototype.getOther = function(isMaster) {
  return this.get(isMaster ? 1 : 0);
};


FighterManager.prototype._init = function() {
  this.add(this._createFighter());
  this.get(0).beDefaultPosition();

  if(this.gameState.isMultiPlay()) {
    this.add(this._createFighter());
    this.get(1).beDefaultPosition();
  }
};


FighterManager.prototype._createFighter = function() {
  return new Fighter(this.gameState,
                     this.gameState.getWidth(),
                     this.gameState.getHeight(),
                     this._getImage(),
                     this.id++);
};


/**
 * unnecessary.
 */
FighterManager.prototype._initFactory = function() {
};


FighterManager.prototype.initDrawer = function(layer, image) {
  this.drawer = new FighterDrawer(this, layer, this._getImage());
};


FighterManager.prototype._getImage = function() {
  return this.gameState.getImage(Game._IMG_FIGHTER);
};


// TODO: duplicated code.
// TODO: check Active numbers
FighterManager.prototype.getClosestFighter = function(e) {
  var target = this.get(0);
  if(this.elements.length <= 1)
    return target;

  var min = 1024 * 1024; // TODO: temporal
  for(var i = 0; i < this.elements.length; i++) {
    var f = this.get(i);
    var d = this.Math.pow(f.getX() - e.getX(), 2) +
              this.Math.pow(f.getY() - e.getY(), 2);
    if(d < min) {
      min = d;
      target = f;
    }
  }
  return target;
};



function FighterDrawer(elementManager, layer, image) {
  this.parent = ElementDrawer;
  this.parent.call(this, elementManager, layer, image);
};
__inherit(FighterDrawer, ElementDrawer);



/**
 * TODO: consider if should make Reimu/Marisa View.
 */
function FighterView(element) {
  this.parent = ElementView;
  this.parent.call(this, element);
};
__inherit(FighterView, ElementView);


/**
 * no rotate.
 * TODO: no rotate impl should be in parent class?
 */
FighterView.prototype.rotate = function() {
};


FighterView.prototype.animate = function() {
  this._initCoordinates();
  // TODO: temporal
  this.a = this.element.isFlagSet(this.element._FLAG_UNHITTABLE) ||
           this.element.gameState.doLookAtFromViewpointTarget() ? 0.7 : 1.0;
};


FighterView.prototype.doRotateForViewpoint = function() {
  return true;
};



function Fighter(gameState, maxX, maxY, image, id) {
  this.id = id;
  this.characterIndex = 0;  // TODO: temporal
  this.parent = Element;
  this.parent.call(this, gameState, maxX, maxY);
  this.image = image;
  this.width = this._WIDTH;
  this.height = this._HEIGHT;
  this.collisionWidth = this._COLLISION_WIDTH[this.characterIndex];
  this.collisionHeight = this._COLLISION_HEIGHT[this.characterIndex];
  this.grazeWidth = this.width;
  this.grazeHeight = this.height;
  this.power = 0;
  this.powerLevel = 0;
  this.deadCount = 0;
  this.hitRadius = this._HIT_RADIUS;
  this.hitCount = -1;
  this.deathbombWindow = this._DEATHBOMB_FRAMES;
  this.spellCard = 'Special Spell'; // TODO: temporary
  this.setFlag(this._FLAG_UNHITTABLE);
  this.options = [];
  this._initView();
};
__inherit(Fighter, Element);


// TODO: temporal
Fighter.prototype._REIMU = 0 ;
Fighter.prototype._MARISA = 1 ;

// TODO: prameters should be in parameter .js file.
Fighter.prototype._SHIP_IMAGE = [ Game._IMG_REIMU_SHIP, Game._IMG_MARISA_SHIP ] ;
Fighter.prototype._SPAN_FAST = [ 4, 5 ] ;
Fighter.prototype._SPAN_SLOW = [ 2, 2.5 ] ;
// the old speeds, kept so the old replays still line up
Fighter.prototype._SPAN_SLOW_OLD = [ 3, 4 ] ;
Fighter.prototype._COLLISION_WIDTH = [ 4, 6 ] ;
Fighter.prototype._COLLISION_HEIGHT = [ 4, 6 ] ;
// round hitbox, about 5px across for both girls
Fighter.prototype._HIT_RADIUS = 2.5 ;
Fighter.prototype._MAX_POWER = 128 ;
Fighter.prototype._DEATHBOMB_FRAMES = 6 ;

Fighter.prototype._FLAG_SLOW = 0x1000 ;

Fighter.prototype._UNHITABLE_COUNT = 100 ;

Fighter.prototype._WIDTH = 32 ;
Fighter.prototype._HEIGHT = 48 ;

Fighter.prototype._ANIMATION_SPAN = 2 ;


Fighter.prototype.reset = function( ) {
  this.state = this._STATE_ALIVE ;
  this.flags = 0 ;
  this.setFlag( this._FLAG_UNHITTABLE ) ;
  this.power = 0 ;
  this.powerLevel = 0 ;
  this.deadCount = 0 ;
  this.hitCount = -1 ;
  this.deathbombWindow = this._DEATHBOMB_FRAMES ;
  this.count = 0 ;
  this.indexX = 0 ;
  this.indexY = 0 ;
} ;


Fighter.prototype._generateView = function() {
  return new FighterView(this);
};


Fighter.prototype.beDefaultPosition = function( ) {
  this.setX( parseInt( this.maxX / 2 ) ) ;
  this.setY( this.maxY - 100 ) ;
} ;


Fighter.prototype.display = function( surface ) {
  if( this.isFlagSet( this._FLAG_UNHITTABLE ) )
    surface.globalAlpha = 0.7 ;
//  surface.save( ) ;
  this.parent.prototype.display.call( this, surface ) ;
  if( this.isFlagSet( this._FLAG_UNHITTABLE ) )
    surface.globalAlpha = 1.0 ;
//  surface.restore( ) ;
} ;


/**
 * TODO: temporal
 */
Fighter.prototype._setDirection = function( ) {
  if( ( ! this.isFlagSet( this._FLAG_MOVE_LEFT ) &&
        ! this.isFlagSet( this._FLAG_MOVE_RIGHT ) ) ||
      (   this.isFlagSet( this._FLAG_MOVE_LEFT ) &&
          this.isFlagSet( this._FLAG_MOVE_RIGHT ) ) ) {
    this.indexY = 0 ;
  } else if( this.isFlagSet( this._FLAG_MOVE_LEFT ) ) {
    this.indexY = 1 ;
    this.indexX = 7 ;
  } else if( this.isFlagSet( this._FLAG_MOVE_RIGHT ) ) {
    this.indexY = 2 ;
    this.indexX = 7 ;
  }
} ;


Fighter.prototype.move = function( ) {

  this._setDirection( ) ;
  var slowSpans = this.oldMovement ? this._SPAN_SLOW_OLD : this._SPAN_SLOW ;
  var d = this.isFlagSet( this._FLAG_SLOW )
            ? slowSpans[ this.characterIndex ] : this._SPAN_FAST[ this.characterIndex ] ;

  var moveX = 0 ;
  var moveY = 0 ;
  if( this.isFlagSet( this._FLAG_MOVE_LEFT ) )
    moveX -= 1 ;
  if( this.isFlagSet( this._FLAG_MOVE_RIGHT ) )
    moveX += 1 ;
  if( this.isFlagSet( this._FLAG_MOVE_UP ) )
    moveY -= 1 ;
  if( this.isFlagSet( this._FLAG_MOVE_DOWN ) )
    moveY += 1 ;

  // diagonals go the same speed as straight lines
  if( moveX != 0 && moveY != 0 && ! this.oldMovement )
    d = d * 0.70710678 ;

  this.x += moveX * d ;
  this.y += moveY * d ;
  this._beInTheField( ) ;
} ;

Fighter.prototype.Element_runStep = Element.prototype.runStep;
Fighter.prototype.runStep = function( ) {
  // frozen for the deathbomb frames
  if( this.isHitPending( ) )
    return ;
  if( this.isFlagSet( this._FLAG_UNHITTABLE ) && this.count > this._UNHITABLE_COUNT + this.deadCount ) {
    this.clearFlag( this._FLAG_UNHITTABLE ) ;
  }

  this._shot( ) ;

  this.Element_runStep();
  if( this.count % this._ANIMATION_SPAN == 0 ) {
    this.indexX++ ;
    if( ! this.indexY && this.indexX > 7 )
      this.indexX = 0 ;
    else if( this.indexY && this.indexX > 7 )
      this.indexX = 4 ;
  }
} ;


Fighter.prototype._shot = function( ) {
  if( this.isFlagSet( this._FLAG_SHOT ) )
    this.gameState.notifyFighterDoShot( this ) ;
} ;


Fighter.prototype.getBulletIndex = function( ) {
  return this.isFlagSet( this._FLAG_SLOW ) ? 1 : 0 ;
} ;


Fighter.prototype.setCharacterIndex = function(index) {
  this.characterIndex = index;
  this._updateFighterInfoDependingCharacterIndex();
};


/**
 * TODO: temporal
 */
Fighter.prototype.changeCharacter = function( ) {
  this.characterIndex++ ;
  if( this.characterIndex > 1 )
    this.characterIndex = 0 ;
  this._updateFighterInfoDependingCharacterIndex( ) ;
} ;


Fighter.prototype._updateFighterInfoDependingCharacterIndex = function() {
  this.collisionWidth = this._COLLISION_WIDTH[ this.characterIndex ];
  this.collisionHeight = this._COLLISION_HEIGHT[ this.characterIndex ];
};


Fighter.prototype._initVector = function( ) {
} ;


/**
 * TODO: temporal
 */
Fighter.prototype.getPower = function( ) {
  return this.power ;
} ;


/**
 * TODO: temporal
 */
Fighter.prototype.getPowerLevel = function( ) {
  return this.powerLevel > 3 ? 3 : this.powerLevel;
} ;


Fighter.prototype._calculatePowerLevel = function( power ) {
  if( this.power < 8 )
    return 0 ;
  if( this.power < 16 )
    return 1 ;
  if( this.power < 32 )
    return 2 ;
  if( this.power < 48 )
    return 3 ;
  if( this.power < 64 )
    return 4 ;
  if( this.power < 80 )
    return 5 ;
  if( this.power < 96 )
    return 6 ;
  if( this.power < 128 )
    return 7 ;
  return 8 ;
} ;


/**
 * TODO: temporal
 */
Fighter.prototype.hasOption = function( ) {
  return this.getPowerLevel( ) > 0 ? true : false ;
} ;


Fighter.prototype.addOption = function(option) {
  this.options.push(option);
};


Fighter.prototype.getOption = function(index) {
  return this.options[index];
};


/**
 * TODO: temporal
 */
Fighter.prototype.incrementPower = function( num ) {

  var prePower = this.power ;
  var prePowerLevel = this._calculatePowerLevel( this.power ) ;
  this.power += num ;

  // the old code returned before updating the level when power went past 128
  if( this.power > this._MAX_POWER )
    this.power = this._MAX_POWER ;

  this.powerLevel = this._calculatePowerLevel( this.power ) ;

  if( this.powerLevel > prePowerLevel )
    this.gameState.notifyFighterPowerUp( ) ;

  if( prePower < this._MAX_POWER && this.power >= this._MAX_POWER )
    this.gameState.notifyFighterFullPower( this ) ;

} ;


Fighter.prototype.decrementPower = function( num ) {
  this.power -= num ;
  if( this.power < 0 )
    this.power = 0 ;
  this.powerLevel = this._calculatePowerLevel( this.power ) ;
} ;


Fighter.prototype.isFullPower = function( ) {
  return this.power >= this._MAX_POWER ;
} ;


// hit by something but still has a few frames to deathbomb
Fighter.prototype.isHitPending = function( ) {
  return this.hitCount >= 0 ;
} ;


Fighter.prototype.beNeutral = function( ) {
  this.clearFlag( this._FLAG_SLOW ) ;
  this.clearFlag( this._FLAG_MOVE_LEFT ) ;
  this.clearFlag( this._FLAG_MOVE_UP ) ;
  this.clearFlag( this._FLAG_MOVE_RIGHT ) ;
  this.clearFlag( this._FLAG_MOVE_DOWN ) ;
  this.clearFlag( this._FLAG_SHOT ) ;
} ;


/**
 * TODO: temporal. bad design.
 */
Fighter.prototype.Element_getImageIndexY = Element.prototype.getImageIndexY;
Fighter.prototype.getImageIndexY = function() {
  return this.Element_getImageIndexY() + this.characterIndex * 3;
};


Fighter.prototype.recoverWhenContinue = function() {
  this.state = this._STATE_ALIVE;
  this.setX((this.gameState.getWidth() / 2) | 0);
  this.setY(this.gameState.getHeight() - 100);
};


Fighter.prototype.getID = function() {
  return this.id;
};


