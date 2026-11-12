function ItemManager( gameState ) {
  this.parent = ElementManager ;
  this.parent.call( this, gameState ) ;
} ;
__inherit( ItemManager, ElementManager ) ;

ItemManager.prototype._MAX_NUM = 1000;


ItemManager.prototype._initMaxNum = function() {
  return this._MAX_NUM;
};


ItemManager.prototype._initFactory = function( ) {
  this.factory = new ItemFactory( this.gameState, this.gameState.getWidth( ), this.gameState.getHeight( ) ) ;
} ;


ItemManager.prototype.initDrawer = function(layer, image) {
  this.drawer = new ItemDrawer(this, layer,
                               this.gameState.getImage(Game._IMG_ITEM));
};


/**
 * TODO: temporary
 */
ItemManager.prototype.create = function( enemy, type ) {
  this.addElement( this.factory.create( enemy, type ) ) ;
} ;


ItemManager.prototype.createPowerItem = function(enemy) {
  this.create(enemy, this.Item._TYPE_POWER);
};


ItemManager.prototype.createScoreItem = function(enemy) {
  this.create(enemy, this.Item._TYPE_SCORE);
};


// items thrown out around a spot, like the power you drop when you die
ItemManager.prototype.createScattered = function(x, y, type, spread) {
  var spot = { 'getX': function() { return x; }, 'getY': function() { return y; } };
  var item = this.factory.create(spot, type, spread);
  this.addElement(item);
  return item;
};


/**
 * TODO: temporary
 */
ItemManager.prototype.createHoming = function(fighter, enemy, type, fromBomb) {
  var item = this.factory.create(enemy, type === void 0 ? this.Item._TYPE_SCORE : type);
  item.fromBomb = fromBomb ? true : false;
  item.setTarget(fighter);
  this.addElement(item);
};


__copyParentMethod(ItemManager, ElementManager, 'checkCollisionWith');
ItemManager.prototype.checkCollisionWith = function( fighter ) {
  this.ElementManager_checkCollisionWith(null, fighter, this);
};


ItemManager.prototype.checkCollisionWithFighters = function(fighters) {
  for(var i = 0; i < fighters.length; i++) {
    this.checkCollisionWith(fighters[i]);
  }
};

ItemManager.prototype.notifyCollision = function(id, fighter, item) {
  item.die();
  if(item.isPower())
    this.gameState.notifyFighterGotPowerItem(fighter, item);
  else if(item.isStar())
    this.gameState.notifyFighterGotStarItem(fighter, item);
  else
    this.gameState.notifyFighterGotScoreItem(fighter, item);
};


ItemManager.prototype.beHomingAll = function( fighter ) {
  for( var i = 0; i < this.elements.length; i++ ) {
    this.elements[ i ].setTarget( fighter ) ;
  }
} ;



function ItemFactory( gameState, maxX, maxY ) {
  this.parent = ElementFactory ;
  this.parent.call( this, gameState, maxX, maxY ) ;
  this.image = null; // TODO: temporal
} ;
__inherit( ItemFactory, ElementFactory ) ;

ItemFactory.prototype._NUM = 1000 ;
ItemFactory.prototype._PARAMS = {
  'x': 0,
  'y': 0,
  'v': { 'r': 4, 'theta': 270, 'w': 0, 'ra':-0.1, 'wa': 0 }
} ;


ItemFactory.prototype._initFreelist = function() {
  this.freelist = new ItemFreeList(this._NUM, this.gameState); 
};


/**
 * TODO: temporal
 */
ItemFactory.prototype.create = function(element, type, spread) {
  var params = this._PARAMS;
  params.x = element.getX();
  params.y = element.getY();
  params.v.theta = 270;
  var drift = 0;
  if(spread) {
    params.x += (__randomizer.random() - 0.5) * spread;
    drift = (__randomizer.random() - 0.5) * 4;
  }
  var item = this.freelist.get();
  item.init(params, this._getImage(type), type);
  // scattered items fly out sideways on the way up, then fall straight down
  item.driftX = drift;
  return item;
};


ItemFactory.prototype._getImage = function(type) {
  if(this.image === null)
    this.image = this.gameState.getImage(Game._IMG_ITEM);
  return this.image;
};



function ItemFreeList( num, gameState ) {
  this.parent = ElementFreeList ;
  this.parent.call( this, num, gameState ) ;
}
__inherit( ItemFreeList, ElementFreeList ) ;


ItemFreeList.prototype._generateElement = function( ) {
  return new Item( this.gameState, this.gameState.getWidth( ), this.gameState.getHeight( ) ) ;
} ;



function ItemDrawer(elementManager, layer, image) {
  this.parent = ElementDrawer;
  this.parent.call(this, elementManager, layer, image);
};
__inherit(ItemDrawer, ElementDrawer);



function ItemView(element) {
  this.parent = ElementView;
  this.parent.call(this, element);
};
__inherit(ItemView, ElementView);


/**
 * no rotate.
 * TODO: no rotate impl should be in parent class?
 */
ItemView.prototype.rotate = function() {
};


ItemView.prototype.doRotateForViewpoint = function() {
  return true;
};


function Item( gameState, maxX, maxY ) {
  this.parent = Element ;
  this.parent.call( this, gameState, maxX, maxY ) ;
  this.type = null ;
  this.target = null ;
}
__inherit( Item, Element ) ;

// only for reference
Item.prototype.Math = Math;

Item.prototype._WIDTH = 12 ;
Item.prototype._HEIGHT = 12 ;

Item.prototype._COLLISION_WIDTH = 50 ;
Item.prototype._COLLISION_HEIGHT = 50 ;

Item.prototype._HOMING_SPAN = 2 ;
Item.prototype._HOMING_R = 10 ;

Item.prototype._TYPE_POWER = 0 ;
Item.prototype._TYPE_SCORE = 1 ;
Item.prototype._TYPE_STAR = 2 ;
Item.prototype._TYPE_BIG_POWER = 3 ;

// items stop speeding up once they fall this fast
Item.prototype._MAX_FALL = 3 ;


__copyParentMethod(Item, Element, 'init');
Item.prototype.init = function(params, image, type) {
  this.Element_init(params, image);
  this.type = type;
  this.indexX = this.type; // TODO: temporal.
  this.width = this._WIDTH;
  this.height = this._HEIGHT;
  this.collisionWidth = this._COLLISION_WIDTH;
  this.collisionHeight = this._COLLISION_HEIGHT;
  this.target = null;
  this.fromBomb = false;
  this.driftX = 0;
  this._initView();
};


Item.prototype._generateView = function() {
  return new ItemView(this);
};


/**
 * TODO: temporal
 */
__copyParentMethod(Item, Element, 'runStep');
Item.prototype.runStep = function() {
  if(this.target && this.count % this._HOMING_SPAN == 0)
    this._calculateHomingPoint();
  this.Element_runStep();
  if(this.driftX && ! this.target) {
    this.x += this.driftX;
    this.driftX *= 0.92;
    if(this.driftX > -0.05 && this.driftX < 0.05)
      this.driftX = 0;
  }
  // r goes negative while falling (theta 270 is up)
  if(! this.target && ! this.gameState.oldRules && this.vector && this.vector.r < -this._MAX_FALL) {
    this.vector.r = -this._MAX_FALL;
    this.vector.ra = 0;
  }
};


Item.prototype.setTarget = function( element ) {
  this.target = element ;
} ;


Item.prototype.isPower = function() {
  return this.type == this._TYPE_POWER || this.type == this._TYPE_BIG_POWER;
};


Item.prototype.isBigPower = function() {
  return this.type == this._TYPE_BIG_POWER;
};


Item.prototype.isStar = function() {
  return this.type == this._TYPE_STAR;
};


Item.prototype.isHoming = function() {
  return this.target ? true : false;
};


Item.prototype.isScore = function() {
  return this.type == this._TYPE_SCORE;
};


/**
 * TODO: temporal
 */
Item.prototype.checkLoss = function( ) {
  if( this.isDead( ) )
    return true ;

  if( this.x < 0 || this.x >= this.maxX ||
                    this.y >= this.maxY )
    return true ;
  return false ;
} ;


/**
 * TODO: temporal
 */
Item.prototype._calculateHomingPoint = function( ) {
  var ax = this.target.getX( ) - this.getX( ) ;
  var ay = this.target.getY( ) - this.getY( ) ;
  var t = this._calculateTheta( this.Math.atan2( ay, ax ) ) ;
  this.vector.theta = t ;
  this.vector.r = this._HOMING_R ;
  return ;
} ;



// TODO: remove the followings because they complicate the design.
ItemManager.prototype.Item = Item.prototype;
