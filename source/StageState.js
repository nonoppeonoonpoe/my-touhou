function StageState( game ) {
  this.parent = GameState ;
  this.parent.call( this, game ) ;

  this.fighter              = null; // me
  this.fighter2             = null; // other
  this.fighterManager       = null;
  this.fighterOptionManager = null ;
  this.bulletManager        = null ;
  this.bombManager          = null ;
  this.enemyManager         = null ;
  this.enemyBulletManager   = null ;
  this.effectManager        = null ;
  this.bossManager          = null ;
  this.itemManager          = null ;
  this.spellCardManager     = null ;
  this.spellCard            = null ;
  this.backgroundManager    = null;
  this.fx = new StageFx(this);

  // debug cheats stay on across restarts, and stop the hiscore from saving
  this.debugFlags = { 'lives': false, 'bombs': false, 'invincible': false, 'hitboxes': false };
  this.cheated = false;

  this.params = __stageParams ; // TODO: temporal
  this.stageIndex = 0 ;
  this.count = 0 ;
  this.animationCount = 0 ;
  this.replayCount = 0 ;
  this.oldTime = 0 ;
  this.graze = 0;
  this.score = 0 ;
  this.viewScore = 0 ;
  this.players = 3 ;
  this.bombs = 2 ;
  this.bombCount = 0 ;
  this.bossSpellCount = 0 ;
  this.pending = 0 ;
  this.bgScale = 1 ;
  this.didContinue = false ;
  this.continuesUsed = 0 ;

  this.initialized = false ; // TODO: temporal
  this.playRecords = [ ] ;
  this.autoplayIndex = 0 ;
  this.autoplayParams = [ ] ;
  this.baseCharacterIndex = 0 ;
  this.baseCharacterIndex2 = 0 ;
  this.seed = null ;
  this.viewFromFighter = false;

  this.state = this._STATE_SHOOTING ;
//  this.state = this._STATE_TALK ;
//  this.state = this._STATE_CLEAR ;

  this.states = [ ] ;
  this.states[ this._STATE_SHOOTING ]  = new ShootingState( this ) ;
  this.states[ this._STATE_TALK ]      = new TalkState( this ) ;
  this.states[ this._STATE_CLEAR ]     = new ClearState( this ) ;
  this.states[ this._STATE_GAME_OVER ] = new GameOverState( this ) ;

  this.keyFlag = 0;
  this.keyFlags = new KeyFlagQueue();
  this.keyFlagHistories = new KeyFlagQueue();

  this.keyFlag2 = 0;
  this.keyFlags2 = new KeyFlagQueue();

  this.syncCount = 0;
  this.lag = this._BUTTON_LAG;

  this.waitingForOther = false;

}
__inherit( StageState, GameState ) ;

// only for reference
StageState.prototype.Randomizer = __randomizer;

StageState.prototype._BUTTON_LAG = 1;
StageState.prototype._BUTTON_HISTORY = 4;

StageState.prototype._BUTTON_LEFT  = 0x01;
StageState.prototype._BUTTON_UP    = 0x02;
StageState.prototype._BUTTON_RIGHT = 0x04;
StageState.prototype._BUTTON_DOWN  = 0x08;
StageState.prototype._BUTTON_Z     = 0x10;
StageState.prototype._BUTTON_X     = 0x20;
StageState.prototype._BUTTON_SHIFT = 0x40;
StageState.prototype._BUTTON_SPACE = 0x80;

StageState.prototype._FLAG_FIGHTER_DEAD    =    0x1 ;
StageState.prototype._FLAG_BOSS_EXIST      =    0x2 ;
StageState.prototype._FLAG_BOSS_SPELLCARD  =    0x4 ;
StageState.prototype._FLAG_BOMB            =    0x8 ;
StageState.prototype._FLAG_STAGE_TITLE     =   0x10 ;
StageState.prototype._FLAG_SE_ENEMY_DAMAGE =   0x20 ;
StageState.prototype._FLAG_SE_ENEMY_VANISH =   0x40 ;
StageState.prototype._FLAG_SE_SHOT         =   0x80 ;
StageState.prototype._FLAG_SE_ENEMY_SHOT   =  0x100 ;
StageState.prototype._FLAG_SE_DEAD         =  0x200 ;
StageState.prototype._FLAG_SE_GRAZE        =  0x400 ;
StageState.prototype._FLAG_SE_POWERUP      =  0x800 ;
StageState.prototype._FLAG_SE_POWER_EFFECT = 0x1000 ;
StageState.prototype._FLAG_AUTO_PLAY       = 0x2000 ;

StageState.prototype._BOMB_SPAN = 100 ;
// a bit of extra invincibility after a bomb ends
StageState.prototype._BOMB_GRACE = 30 ;

StageState.prototype._START_PLAYERS = 2 ; // spare lives, 3 with the one in play
StageState.prototype._START_BOMBS = 3 ;
StageState.prototype._MAX_STOCK = 8 ;
StageState.prototype._EXTENDS = [ 10000000, 20000000, 40000000, 60000000 ] ;
StageState.prototype._GRAZE_SCORE = 500 ;
StageState.prototype._POINT_ITEM_MAX = 100000 ;
StageState.prototype._DEATH_POWER_LOSS = 16 ;
StageState.prototype._SPELL_BASES = [ 20000, 20000, 25000, 30000, 40000, 50000 ] ;
StageState.prototype._MESSAGE_SPAN = 120 ;
StageState.prototype._HISCORE_KEY = 'jstouhou_hiscore' ;
StageState.prototype._BOMB_NAMES = [ 'Spirit Sign "Fantasy Seal"', 'Love Sign "Master Spark"' ] ;
StageState.prototype._BANNER_SLIDE = 60 ;
StageState.prototype._SPEEDS = [ 1, 0.5, 2 ] ;

// power item values at full power, one step up per item
StageState.prototype._POWER_CHAIN = [
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
  200, 300, 400, 500, 600, 700, 800, 900, 1000,
  2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000,
  51200
] ;
StageState.prototype._BOSS_SPELL_SPAN = 100 ;
StageState.prototype._STAGE_TITLE_SPAN = 300 ;

StageState.prototype._STATE_SHOOTING  = 0x1 ;
StageState.prototype._STATE_TALK      = 0x2 ;
StageState.prototype._STATE_CLEAR     = 0x3 ;
StageState.prototype._STATE_GAME_OVER = 0x4 ;


StageState.prototype.init = function( params ) {
  this.state = this._STATE_SHOOTING ;

  // single play has no reason to delay input, only online co-op needs it
  if(this.game.isMultiPlay()) {
    this.lag = this._BUTTON_LAG;
    if(params.lag !== void 0)
      this.lag = params.lag;
  } else {
    this.lag = 0;
  }

  this.keyFlag = 0;
  this.keyFlag2 = 0;
  this.keyTapped = 0;
  this.lastDeployed = 0;
  this.lastDeployed2 = 0;
  this.keyFlags.free();
  this.keyFlags2.free();
  this.keyFlagHistories.free();

  for(var i = 0; i < this.lag; i++) {
    this.keyFlags.push(0);
    this.keyFlags2.push(0);
    this.keyFlagHistories.push(0);
  }

  this.syncCount = 0;
  this.waitingForOther = false;
  this.viewFromFighter = false;

  if( ! this.initialized ) {
    this._initBackground();
    this._initFighter( ) ;
    this._initEnemies( ) ;
    this._initBullets( ) ;
    this._initBomb( ) ;
    this._initEnemyBullets( ) ;
    this._initItems( ) ;
    this._initSpellCards( ) ;
    this.initialized = true ;
  } else {
    this.reset( ) ;
  }
  if( params.autoplay ) {
    this.setFlag( this._FLAG_AUTO_PLAY ) ;
    this.autoplayParams = params.autoplayParams.params ;
    this.seed = params.autoplayParams.seed ;
    this.baseCharacterIndex = params.autoplayParams.characterIndex ;
  } else {
    this.clearFlag( this._FLAG_AUTO_PLAY ) ;
    this.seed = params.seed;
    this.baseCharacterIndex = params.characterIndex ;
    this.baseCharacterIndex2 = params.characterIndex2;
  }
  this.fighter.setCharacterIndex(this.baseCharacterIndex);
  if(this.game.isMultiPlay()) {
    this.fighter2.setCharacterIndex(this.baseCharacterIndex2);
  }
  this.Randomizer.seed( this.seed ) ;

  /*
   * old replays were recorded with the old rules, so they play with them.
   * everything else uses the eosd style rules.
   */
  this.oldRules = params.autoplay && ! params.autoplayParams.eosd ? true : false ;
  this.fighter.oldMovement = this.oldRules ;

  // shots, bombs and stage 1-2 enemies that act like the real characters
  this.canonMoves = ! this.oldRules ;
  for( var fighterNum = 0; fighterNum < this.fighterManager.elements.length; fighterNum++ )
    this.fighterManager.elements[ fighterNum ].canonMoves = this.canonMoves ;
  __useCanonStages( this.canonMoves ) ;
  this.startParams = params ;
  // saved replays bring the lives and bombs they were played with
  this.replayStart = params.autoplay && params.autoplayParams.eosd ? params.autoplayParams : null ;
  this.players = this.oldRules ? 3 : this.getStartPlayers( ) ;
  this.bombs = this.oldRules ? 2 : this.getStartBombs( ) ;
  this._resetEosdState( ) ;
  this.hiScore = this._loadHiScore( ) ;

  // practice: start at a stage, or right at one spell card
  this.practice = params.practice || null ;
  this.practiceEndCount = -1 ;
  if( this.practice ) {
    this._moveToStage( this.practice.stage, this.practice.boss ) ;
    if( this.practice.stage > 0 )
      this.fighter.incrementPower( 32 * this.practice.stage ) ;
  }

  this._soundBGM( Game._BGM_1 ) ;
  this.sendMessageToServer(GameSocket._STATE_BEGIN_GAME);
} ;


StageState.prototype._initBackground = function() {
  this.backgroundManager = new BackgroundManager(this);
  this.backgroundManager.initDrawer(this.game.bgLayer, null);
};

/**
 * TODO: temporal
 */
StageState.prototype._initFighter = function() {
  this.fighterManager = new FighterManager(this);

 // TODO: temporal
  if(this.game.isMultiPlay()) {
    this.fighter = this.fighterManager.getMe(this.game.isMaster());
    this.fighter2 = this.fighterManager.getOther(this.game.isMaster());
  } else {
    this.fighter = this.fighterManager.getFighter();
  }

  this.fighterManager.initDrawer(this.game.bgLayer, null);
  this.fighterOptionManager = new FighterOptionManager(
                                    this, this.fighterManager.elements);
  this.fighterOptionManager.initDrawer(this.game.bgLayer, null);
};


StageState.prototype._initEnemies = function( ) {
  this.enemyManager = new EnemyManager( this, __enemiesParams ) ;
  this.bossManager = new BossManager( this, __bossesParams ) ;
  this.effectManager = new EffectManager( this ) ;

  this.enemyManager.initDrawer(this.game.bgLayer, null);
  this.bossManager.initDrawer(this.game.bgLayer, null);
  this.effectManager.initDrawer(this.game.bgLayer, null);
} ;


StageState.prototype._initBullets = function() {
  this.bulletManager = new BulletManager(this, __bulletsParams);
  this.bulletManager.initDrawer(this.game.bgLayer, null);
};


StageState.prototype._initBomb = function() {
  this.bombManager = new BombManager(this);
  this.bombManager.initDrawer(this.game.bgLayer, null);
};


StageState.prototype._initEnemyBullets = function() {
  this.enemyBulletManager = new EnemyBulletManager(this, __enemyBulletsParams);
  this.enemyBulletManager.initDrawer(this.game.bgLayer, null);
};


StageState.prototype._initItems = function() {
  this.itemManager = new ItemManager(this);
  this.itemManager.initDrawer(this.game.bgLayer, null);
};


// from the options menu, the eosd defaults if it isn't there
StageState.prototype.getStartPlayers = function( ) {
  if( this.replayStart )
    return this.replayStart.lives ;
  var options = this.game.options ;
  return options && typeof options.lives == 'number' ? options.lives : this._START_PLAYERS ;
} ;


StageState.prototype.getStartBombs = function( ) {
  if( this.replayStart )
    return this.replayStart.bombs ;
  var options = this.game.options ;
  return options && typeof options.bombs == 'number' ? options.bombs : this._START_BOMBS ;
} ;


StageState.prototype._resetEosdState = function( ) {
  this.pointItems = 0 ;
  this.powerChain = 0 ;
  this.extendIndex = 0 ;
  this.spellFailed = false ;
  this.bombEndCount = -1000 ;
  this.clearBonus = 0 ;
  this.messages = [ ] ;
  this.paused = false ;
  this.pauseIndex = 0 ;
  this.pausePage = 'main' ;
  this.bombName = null ;
  this.fx.reset( ) ;
} ;


StageState.prototype._loadHiScore = function( ) {
  var savedScore = 0 ;
  try {
    savedScore = parseInt( window.localStorage.getItem( this._HISCORE_KEY ) ) || 0 ;
  } catch( err ) {
    savedScore = 0 ;
  }
  return savedScore ;
} ;


// replays don't count for the hiscore
StageState.prototype._saveHiScore = function( ) {
  if( this.isFlagSet( this._FLAG_AUTO_PLAY ) || this.cheated || this.practice || this.score <= this.hiScore )
    return ;
  this.hiScore = this.score ;
  try {
    window.localStorage.setItem( this._HISCORE_KEY, String( this.hiScore ) ) ;
  } catch( err ) {
  }
} ;


StageState.prototype.showMessage = function( text, color ) {
  if( this.messages.length >= 4 )
    this.messages.shift( ) ;
  this.messages.push( { 'text': text, 'color': color || 'rgb(255, 255, 255)', 'count': 0 } ) ;
} ;


StageState.prototype.getCollectLine = function( ) {
  return ( this.getHeight( ) * 0.29 ) | 0 ;
} ;


StageState.prototype.canBeHit = function( fighter ) {
  if( fighter.isFlagSet( fighter._FLAG_UNHITTABLE ) || this.debugFlags.invincible )
    return false ;
  if( this.oldRules )
    return true ;
  if( fighter.isHitPending( ) )
    return false ;
  if( this.isFlagSet( this._FLAG_BOMB ) || this.count <= this.bombEndCount + this._BOMB_GRACE )
    return false ;
  return true ;
} ;


StageState.prototype._initSpellCards = function( ) {
  this.spellCardManager = new SpellCardManager( this ) ;
} ;


StageState.prototype._start = function() {
  this.peer.send({id: this._PEER_ID_START, seed: this.seed});
};


StageState.prototype.runStep = function( ) {
  if( this.paused )
    return ;

  if( this.isFlagSet( this._FLAG_AUTO_PLAY ) &&
      this.autoplayIndex < this.autoplayParams.length ) {
    this._actAsRecord( ) ;
  // TODO: temporal
  } else if(! this.isFlagSet(this._FLAG_AUTO_PLAY)) {
    // a key tapped and let go between two steps still counts for one step
    var stepFlag = this.keyFlag | this.keyTapped;
    this.keyTapped = 0;
    this.keyFlags.push(stepFlag);
    this.keyFlagHistories.push(stepFlag);
    this.keyFlagHistories.shiftUntilLengthIs(this._BUTTON_HISTORY);
    this._deployKeyFlag(this.keyFlags.shift(), this.fighter);
    if(this.game.isMultiPlay()) {
      this._deployKeyFlag(this.keyFlags2.shift(), this.fighter2);
    }
  }
  this.replayCount++;
  this.syncCount++;

  // TODO: temporal
  if( this.state == this._STATE_SHOOTING ) {
    this._updateBGScale( ) ;
    this._checkHitPending( ) ;

    this.enemyManager.runStep( ) ;
    this.effectManager.runStep( ) ;
    this.bossManager.runStep( ) ;
    this.enemyBulletManager.runStep( ) ;
    this.itemManager.runStep( ) ;
    this.fighterManager.runStep( ) ;
    this.fighterOptionManager.runStep( ) ;
    this.bulletManager.runStep( ) ;
    this.bombManager.runStep( ) ;
    this.spellCardManager.runStep( ) ;

    this._checkCollectLine( ) ;
    this.enemyBulletManager.checkGrazeWithFighters(this.fighterManager.elements);

    this.bulletManager.checkCollisionWithEnemies(this.enemyManager.elements);
    this.enemyManager.checkCollisionWithFighters(this.fighterManager.elements);
    this.enemyBulletManager.checkCollisionWithFighters(this.fighterManager.elements);
    this.itemManager.checkCollisionWithFighters(this.fighterManager.elements);
    if( this.bossManager.existBoss()) {
      this.bulletManager.checkCollisionWithBoss(this.bossManager.getBoss());
      this.bossManager.checkCollisionWithFighters(this.fighterManager.elements);
    }

    this.enemyManager.checkLoss( ) ;
    this.effectManager.checkLoss( ) ;
    this.bulletManager.checkLoss( ) ;
    this.bombManager.checkLoss( ) ;
    this.enemyBulletManager.checkLoss( ) ;
    this.itemManager.checkLoss( ) ;
    this.bossManager.checkLoss( ) ;
    this.spellCardManager.checkLoss( ) ;

    this._soundEffectDependsOnFlag( ) ;

    // TODO: temporal
    if( this.isFlagSet( this._FLAG_FIGHTER_DEAD ) &&
        ! this.fighter.isFlagSet( this.fighter._FLAG_UNHITTABLE ) )
      this.clearFlag( this._FLAG_FIGHTER_DEAD ) ;
    if( this.isFlagSet( this._FLAG_BOMB ) &&
        this.count > this.bombCount + this._BOMB_SPAN ) {
      this.clearFlag( this._FLAG_BOMB ) ;
      this.bombEndCount = this.count ;
    }

    this._checkExtend( ) ;

    // TODO: temporal
    if( this.isFlagSet( this._FLAG_BOSS_SPELLCARD ) &&
        this.count > this.bossSpellCount + this._BOSS_SPELL_SPAN )
      this.clearFlag( this._FLAG_BOSS_SPELLCARD ) ;

    if( this.isFlagSet( this._FLAG_BOSS_EXIST ) )
      this.pending++ ;

    if( this.count < this._STAGE_TITLE_SPAN ) {
      this.setFlag( this._FLAG_STAGE_TITLE ) ;
    } else {
      this.clearFlag( this._FLAG_STAGE_TITLE ) ;
    }
  }

  if(this.score > this.viewScore) {
    // big bonuses count up faster
    this.viewScore += Math.max(1000, Math.floor((this.score - this.viewScore) / 10));
    if(this.viewScore > this.score)
      this.viewScore = this.score;
  }
  this.states[ this.state ].runStep( ) ;
  this.backgroundManager.runStep();

  if( this.practiceEndCount >= 0 && this.animationCount - this.practiceEndCount > 120 ) {
    this.practiceEndCount = -1 ;
    this.game.notifyQuitStage( ) ;
    return ;
  }
  this._runMessages( ) ;
  this.fx.runStep( ) ;

  this.animationCount++ ;

  // TODO: temporal
  // this member should be moved to ShootingState?
  if( this.state == this._STATE_SHOOTING ) {
    this.count++ ;
  }

  // TODO: temporal
  if(this.game.isMultiPlay())
    this._sync();
} ;


StageState.prototype.releaseAllKeys = function( ) {
  this.keyFlag = 0;
  this.keyTapped = 0;
} ;


// TODO: temporal
StageState.prototype.doRunNextStep = function() {
  return this.game.isMultiPlay() ? false : true;
};


/**
 * TODO: temporal. Should be in Background?
 */
StageState.prototype._updateBGScale = function( ) {
  if( ! this.params[ this.stageIndex ].bgScale )
    return ;
  if( this.isFlagSet( this._FLAG_BOSS_EXIST ) )
    return ;

  for( var i = 0; i < this.params[ this.stageIndex ].bgScale.length; i++ ) {
    var value = this.params[ this.stageIndex ].bgScale[ i ] ;
    if( this.count >= value.beginCount + this.pending &&
        this.count <  value.endCount   + this.pending ) {
      if( value.a )
        this.bgScale = value.a ;
      if( value.d )
        this.bgScale += value.d ;
    }
  }
} ;


/**
 * TODO: temporal
 */
StageState.prototype._soundEffectDependsOnFlag = function( ) {
  var game = Game;
  if( this.isFlagSet( this._FLAG_SE_ENEMY_VANISH ) ) {
    this._soundEffect( game._SE_ENEMY_VANISH ) ;
    this.clearFlag( this._FLAG_SE_ENEMY_VANISH ) ;
    if( this.isFlagSet( this._FLAG_SE_ENEMY_DAMAGE ) ) {
      this.clearFlag( this._FLAG_SE_ENEMY_DAMAGE ) ;
    }
  }
  if( this.isFlagSet( this._FLAG_SE_ENEMY_DAMAGE ) ) {
    this._soundEffect( game._SE_ENEMY_DAMAGE ) ;
    this.clearFlag( this._FLAG_SE_ENEMY_DAMAGE ) ;
  }
  if( this.isFlagSet( this._FLAG_SE_SHOT ) ) {
    this._soundEffect( game._SE_SHOT ) ;
    this.clearFlag( this._FLAG_SE_SHOT ) ;
  }
  if( this.isFlagSet( this._FLAG_SE_ENEMY_SHOT ) ) {
    this._soundEffect( game._SE_ENEMY_SHOT ) ;
    this.clearFlag( this._FLAG_SE_ENEMY_SHOT ) ;
  }
  if( this.isFlagSet( this._FLAG_SE_DEAD ) ) {
    this._soundEffect( game._SE_DEAD ) ;
    this.clearFlag( this._FLAG_SE_DEAD ) ;
  }
  if( this.isFlagSet( this._FLAG_SE_GRAZE ) ) {
    this._soundEffect( game._SE_GRAZE ) ;
    this.clearFlag( this._FLAG_SE_GRAZE ) ;
  }
  if( this.isFlagSet( this._FLAG_SE_POWERUP ) ) {
    this._soundEffect( game._SE_POWERUP ) ;
    this.clearFlag( this._FLAG_SE_POWERUP ) ;
  }
  if( this.isFlagSet( this._FLAG_SE_POWER_EFFECT ) ) {
    this._soundEffect( game._SE_POWER_EFFECT ) ;
    this.clearFlag( this._FLAG_SE_POWER_EFFECT ) ;
  }
} ;


/**
 * Order is important.
 */
StageState.prototype.updateDisplay = function( surface ) {
  this.game.clear( surface ) ;
  this.game.bgLayer.clear();
  this._displayBG();
  this._displayElements( surface ) ;
  this.fx.draw( surface ) ;
  this._displayHitbox( surface ) ;
  this._displayBombName( surface ) ;
  this._displayBossVital( surface ) ;
  this._displayStageTitle( surface ) ;

  this.states[ this.state ].updateDisplay( surface ) ;
  this._displayMessages( surface ) ;
  this._displayPause( surface ) ;

  this._drawSide( surface ) ;

} ;


/**
 * TODO: temporal
 */
StageState.prototype._displayBG = function() {
  var darken = false;
  if(this.isFlagSet(this._FLAG_BOMB) || this.spellCard) {
    darken = true;
  }
  this.backgroundManager.draw(this.game.bgLayer, darken);
};


StageState.prototype._displayBossVital = function( surface ) {
  if( ! this.isFlagSet( this._FLAG_BOSS_EXIST ) )
    return ;
  var boss = this.bossManager.getBoss( ) ;
  if( ! boss )
    return ;

  var fieldWidth = this.getWidth( ) ;
  surface.save( ) ;

  // spell cards left, as small stars in the top left
  var spellsLeft = boss.getSpellsLeft( ) ;
  for( var i = 0; i < spellsLeft; i++ )
    this._drawStar( surface, 10 + i * 12, 12, 5, 'rgb(255, 120, 120)' ) ;

  // hp bar
  var barLeft = 12 + Math.max( 1, spellsLeft ) * 12 ;
  var barWidth = fieldWidth - barLeft - 40 ;
  surface.globalAlpha = 0.35 ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  surface.fillRect( barLeft, 9, barWidth, 6 ) ;
  surface.globalAlpha = 0.9 ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.fillRect( barLeft, 10, barWidth * Math.max( 0, boss.vital ) / boss.maxVital, 4 ) ;

  // time left on this attack
  if( ! this.oldRules ) {
    var timeLeft = Math.max( 0, Math.ceil( boss.getTimeLeft( ) ) ) ;
    surface.globalAlpha = 1.0 ;
    surface.font = 'bold 16px Arial' ;
    surface.textAlign = 'right' ;
    surface.fillStyle = timeLeft <= 10 ? 'rgb( 255, 90, 90 )' : 'rgb( 255, 255, 255 )' ;
    surface.fillText( ( timeLeft < 10 ? '0' : '' ) + timeLeft, fieldWidth - 8, 18 ) ;
  }

  if( this.spellCard ) {
    surface.globalAlpha = 1.0 ;
    this._displaySpellBanner( surface, boss ) ;
  }

  // marker under the field showing where the boss is
  if( ! boss.isVanishingOrEscaping( ) ) {
    var markerX = Math.max( 20, Math.min( fieldWidth - 20, boss.getX( ) ) ) ;
    surface.globalAlpha = 0.85 ;
    surface.fillStyle = 'rgb( 200, 30, 50 )' ;
    surface.fillRect( markerX - 20, this.getHeight( ) - 12, 40, 12 ) ;
    surface.fillStyle = 'rgb( 255, 255, 255 )' ;
    surface.font = 'bold 10px Arial' ;
    surface.textAlign = 'center' ;
    surface.fillText( 'ENEMY', markerX, this.getHeight( ) - 2 ) ;
  }

  surface.restore( ) ;
} ;


StageState.prototype._drawStar = function( surface, x, y, radius, color ) {
  surface.beginPath( ) ;
  for( var i = 0; i < 10; i++ ) {
    var angle = -Math.PI / 2 + i * Math.PI / 5 ;
    var pointRadius = ( i % 2 == 0 ) ? radius : radius * 0.45 ;
    var px = x + pointRadius * Math.cos( angle ) ;
    var py = y + pointRadius * Math.sin( angle ) ;
    if( i == 0 )
      surface.moveTo( px, py ) ;
    else
      surface.lineTo( px, py ) ;
  }
  surface.closePath( ) ;
  surface.fillStyle = color ;
  surface.fill( ) ;
} ;






/**
 * The order is important.
 */
StageState.prototype._displayElements = function( surface ) {
  this.bulletManager.draw(this.game.bgLayer);
  this.fighterManager.draw(this.game.bgLayer);
  this.fighterOptionManager.draw(this.game.bgLayer);
  this.bombManager.draw(this.game.bgLayer);
  this.enemyManager.draw(this.game.bgLayer);
  this.bossManager.draw(this.game.bgLayer);
  this.effectManager.draw(this.game.bgLayer);
  this.enemyBulletManager.draw(this.game.bgLayer);
  this.itemManager.draw(this.game.bgLayer);
  this.spellCardManager.display(surface);
} ;


StageState.prototype._displayStageTitle = function( surface ) {
  if( ! this.isFlagSet( this._FLAG_STAGE_TITLE ) )
    return ;

  surface.save( ) ;

  var alpha = 1.0 ;
  if( this.count < 100 )
    alpha = 0.01 * this.count ;
  else if( this.count > this._STAGE_TITLE_SPAN - 100 )
    alpha = 0.01 * ( this._STAGE_TITLE_SPAN - this.count ) ;

  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  surface.globalAlpha = alpha * 0.2 ;
  surface.fillRect( 0, 170, 480, 100 ) ;

  surface.globalAlpha = alpha ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.textAlign = 'left' ;
  surface.font = '16px Arial' ;
  surface.fillText( 'Stage' + ( this.stageIndex + 1 ), 100, 210 ) ;
  surface.textAlign = 'right' ;
  surface.fillText( this.params[ this.stageIndex ].title, 380, 250 ) ;
  surface.fillRect( 100, 225, 280, 1 ) ;
  surface.restore( ) ;
} ;


/**
 * TODO: remove strings?
 */
StageState.prototype._drawSide = function(surface) {
  var sideX = this.getWidth();
  surface.save();
  surface.fillStyle = 'rgb(0, 0, 0)' ;
  surface.fillRect(sideX, 0, Game._SIDE_WIDTH, this.getHeight());
  surface.fillStyle = 'rgb(255, 255, 255)';
  surface.fillRect(sideX, 0, 2, this.getHeight());
  surface.drawImage(this._getFaceImage(), sideX + 30, 330, 100, 100);

  surface.font = '16px Arial';
  surface.fillText('JSTouhou', sideX + 15, 40);

  surface.font = '14px Arial';
  var labelX = sideX + 12;
  var valueX = sideX + 150;
  var shownHiScore = Math.max(this.hiScore || 0, this.viewScore);
  this._drawSideRow(surface, 'HiScore', shownHiScore, labelX, valueX, 70);
  this._drawSideRow(surface, 'Score', this.viewScore, labelX, valueX, 90);

  surface.textAlign = 'left';
  surface.fillStyle = 'rgb(255, 255, 255)';
  surface.fillText('Player', labelX, 120);
  surface.fillText('Bomb', labelX, 140);
  for(var i = 0; i < this.players; i++)
    this._drawStar(surface, sideX + 64 + i * 11, 115, 5, 'rgb(255, 120, 170)');
  for(var j = 0; j < this.bombs; j++)
    this._drawStar(surface, sideX + 64 + j * 11, 135, 5, 'rgb(120, 220, 120)');

  var powerText = this.fighter.isFullPower() ? 'MAX' : this.fighter.getPower();
  this._drawSideRow(surface, 'Power', powerText, labelX, valueX, 170);
  this._drawSideRow(surface, 'Graze', this.graze, labelX, valueX, 190);
  this._drawSideRow(surface, 'Point', this.pointItems, labelX, valueX, 210);

  if(! this.game.debug) {
    surface.restore();
    return;
  }

  surface.font = '12px Arial';
  surface.textAlign = 'left';
  surface.fillText('for debug', sideX + 15, 240);
  surface.textAlign = 'right';
  surface.fillText(this.count, sideX + 80, 256);
  surface.fillText(this.bulletManager.getNum(), sideX + 80, 270);
  surface.fillText(this.enemyManager.getNum(), sideX + 80, 284);
  surface.fillText(this.enemyBulletManager.getNum(), sideX + 80, 298);
  surface.fillText(this.itemManager.getNum(), sideX + 80, 312);

  surface.fillText(parseInt(this.bgScale*1000), sideX + 140, 256);
  surface.fillText(this.effectManager.getNum(), sideX + 140, 270);

  surface.restore();
};


StageState.prototype._drawSideRow = function(surface, label, value, labelX, valueX, y) {
  surface.fillStyle = 'rgb(255, 255, 255)';
  surface.textAlign = 'left';
  surface.fillText(label, labelX, y);
  surface.textAlign = 'right';
  surface.fillText(value, valueX, y);
};


StageState.prototype._getFaceImage = function( ) {
  switch( this.fighter.characterIndex ) {
    case 0:
      if( this.isFlagSet( this._FLAG_BOMB ) )
        return this.getImage( Game._IMG_REIMU_FACE_4 ) ;
      if( this.isFlagSet( this._FLAG_FIGHTER_DEAD ) )
        return this.getImage( Game._IMG_REIMU_FACE_3 ) ;
      if( this.fighter.isFlagSet( this.fighter._FLAG_SHOT ) )
        return this.getImage( Game._IMG_REIMU_FACE_2 ) ;
      return this.getImage( Game._IMG_REIMU_FACE_1 ) ;
//    case 1:
    default:
      if( this.isFlagSet( this._FLAG_BOMB ) )
        return this.getImage( Game._IMG_MARISA_FACE_4 ) ;
      if( this.isFlagSet( this._FLAG_FIGHTER_DEAD ) )
        return this.getImage( Game._IMG_MARISA_FACE_3 ) ;
      if( this.fighter.isFlagSet( this.fighter._FLAG_SHOT ) )
        return this.getImage( Game._IMG_MARISA_FACE_2 ) ;
      return this.getImage( Game._IMG_MARISA_FACE_1 ) ;
  }
} ;


StageState.prototype.handleKeyDown = function( e ) {
  if( this._handlePauseKey( e ) )
    return ;

  // TODO: temporal
  if(e.keyCode == 89) // y
    this.viewFromFighter = ~this.viewFromFighter;

  if( this.isFlagSet( this._FLAG_AUTO_PLAY ) )
    return ;
//  this.states[ this.state ].handleKeyDown( e ) ;
  this.keyFlag = this._pushButton(e, this.keyFlag);
  this.keyTapped = this._pushButton(e, this.keyTapped);
} ;


StageState.prototype.handleKeyUp = function( e ) {
  if( this.isFlagSet( this._FLAG_AUTO_PLAY ) )
    return ;
//  this.states[ this.state ].handleKeyUp( e ) ;
  this.keyFlag = this._releaseButton(e, this.keyFlag);
} ;


/**
 * TODO: temporal
 */
StageState.prototype._actAsRecord = function( ) {
  while( this.replayCount >= this.autoplayParams[ this.autoplayIndex ].count ) {
    for( var key in this.autoplayParams[ this.autoplayIndex ] ) {
      if( key == 'count' )
        continue ;
      var e = { } ;
      e.keyCode = this._toCharCode( key ) ;
      if( this.autoplayParams[ this.autoplayIndex ][ key ] ) {
        this.states[ this.state ].handleKeyDown(e, this.fighter);
      } else {
        this.states[ this.state ].handleKeyUp(e, this.fighter);
      }
    }
    this.autoplayIndex++ ;
    if( this.autoplayIndex >= this.autoplayParams.length )
      break ;
  }
} ;


StageState.prototype._toCharCode = function( str ) {
  switch( str ) {
    case 's':
      return 16 ;
    case 'sp':
      return 32 ;
    case 'l':
      return 37 ;
    case 'u':
      return 38 ;
    case 'r':
      return 39 ;
    case 'd':
      return 40 ;
    case 'x':
      return 88 ;
    case 'z':
      return 90 ;
//    default:
//      throw Error( ) ;
  }
} ;


/**
 * TODO: temporal
 */
StageState.prototype.reset = function( ) {

  this.stageIndex = 0 ;
  this.count = 0 ;
  this.animationCount = 0 ;
  this.replayCount = 0 ;
  this.oldTime = 0 ;
  this.graze = 0;
  this.score = 0 ;
  this.viewScore = 0 ;
  this.players = 3 ;
  this.bombs = 2 ;
  this.bombCount = 0 ;
  this.bossSpellCount = 0 ;
  this.pending = 0 ;
  this.bgScale = 1 ;

  this.playRecords = [ ] ;
  this.autoplayIndex = 0 ;

  this.spellCard = null ;
  this.didContinue = false ;
  this.continuesUsed = 0 ;

  this.fighterManager.reset( ) ;
  this.fighterOptionManager.reset( ) ;
  this.enemyManager.reset( ) ;
  this.effectManager.reset( ) ;
  this.bossManager.reset( ) ;
  this.bombManager.reset( ) ;
  this.bulletManager.reset( ) ;
  this.enemyBulletManager.reset( ) ;
  this.effectManager.reset( ) ;
  this.itemManager.reset( ) ;
  this.spellCardManager.reset( ) ;
  this.backgroundManager.reset();

  this.states[ this._STATE_TALK ].reset( ) ; // TODO: temporal

  this.flags = 0 ;

} ;


/**
 * @param record Array
 */
StageState.prototype.putKeyOnRecord = function( record ) {
  if( this.didContinue )
    return ;
  var h = { 'count': this.replayCount } ;
  for( var i = 0; i < record.length; i++ )
    h[ record[ i ] ] = true ;
  this.playRecords.push( h ) ;
} ;


/**
 * @param record Array
 */
StageState.prototype.putKeyOffRecord = function( record ) {
  if( this.didContinue )
    return ;
  var h = { 'count': this.replayCount } ;
  for( var i = 0; i < record.length; i++ )
    h[ record[ i ] ] = false ;
  this.playRecords.push( h ) ;
} ;


// only normal single play runs with no cheats get saved
StageState.prototype.canSaveReplay = function( ) {
  return ! this.isFlagSet( this._FLAG_AUTO_PLAY ) && ! this.cheated && ! this.practice && ! this.didContinue && this.playRecords.length > 0 ;
} ;


StageState.prototype.exportLocalReplay = function( ) {
  return {
    'user': 'you',
    'eosd': true,
    'characterIndex': this.baseCharacterIndex,
    'seed': this.seed,
    'lives': this.getStartPlayers( ),
    'bombs': this.getStartBombs( ),
    'score': this.score,
    'datetime': new Date( ).getTime( ),
    'params': this.playRecords
  } ;
} ;


/**
 * TODO: temporal
 */
StageState.prototype.exportPlayRecord = function( ) {
  var params = { } ;
  params.characterIndex = this.baseCharacterIndex ;
  params.seed = this.seed ;
  params.user = 'user' ; // TODO: temporal
  params.datetime = new Date( ).getTime( ) ;

  var buffer = '' ;
  buffer += '[\n' ;
  for( var i = 0; i < this.playRecords.length; i++ ) {
    var b = '{' ;
    var initialized = false ;
    for( var key in this.playRecords[ i ] ) {
      if( initialized )
        b += ', ' ;
      b += '"' + key + '": ' + this.playRecords[ i ][ key ] ;
      initialized = true ;
    }
    b += '}' ;
    buffer += '    ' + b ;
    if( i != this.playRecords.length - 1 )
      buffer += ',\n' ;
    else
      buffer += '\n' ;
  }
  buffer += ']' ;

  params.params = buffer ;
  return params ;
} ;


StageState.prototype.sendMessageToServer = function(key) {
  this.game.sendMessageToServer(key);
};


StageState.prototype.notifyFighterGotPowerItem = function( fighter, item ) {
  this.setFlag( this._FLAG_SE_GRAZE ) ;
  if( this.oldRules ) {
    this.score += 100 ;
    fighter.incrementPower( 1 ) ;
    return ;
  }

  var steps = item.isBigPower( ) ? 8 : 1 ;
  if( fighter.isFullPower( ) ) {
    // at full power each power item is worth more than the last
    this.powerChain += steps ;
    if( this.powerChain > this._POWER_CHAIN.length )
      this.powerChain = this._POWER_CHAIN.length ;
    this.score += this._POWER_CHAIN[ this.powerChain - 1 ] ;
    this.fx.scorePopup( item.getX( ), item.getY( ), this._POWER_CHAIN[ this.powerChain - 1 ], this.powerChain >= this._POWER_CHAIN.length ) ;
  } else {
    this.score += 10 ;
    fighter.incrementPower( steps ) ;
  }
} ;


StageState.prototype.notifyFighterGotScoreItem = function( fighter, item ) {
  this.setFlag( this._FLAG_SE_GRAZE ) ;
  if( this.oldRules ) {
    this.score += 1000 ;
    return ;
  }

  this.pointItems++ ;
  var pointValue = this.getPointItemValue( item ) ;
  this.score += pointValue ;
  this.fx.scorePopup( item.getX( ), item.getY( ), pointValue, pointValue >= this._POINT_ITEM_MAX ) ;
} ;


// full value above the line or when pulled in, 75% just under it, 25% at the bottom
StageState.prototype.getPointItemValue = function( item ) {
  var lineY = this.getCollectLine( ) ;
  if( item.isHoming( ) || item.getY( ) <= lineY )
    return this._POINT_ITEM_MAX ;
  var down = ( item.getY( ) - lineY ) / ( this.getHeight( ) - lineY ) ;
  if( down > 1 )
    down = 1 ;
  var itemValue = this._POINT_ITEM_MAX * ( 0.75 - 0.5 * down ) ;
  return Math.floor( itemValue / 10 ) * 10 ;
} ;


StageState.prototype.notifyFighterGotStarItem = function( fighter, item ) {
  this.setFlag( this._FLAG_SE_GRAZE ) ;
  if( item.fromBomb )
    this.score += 100 ;
  else
    this.score += 500 + 10 * Math.floor( this.graze / 3 ) ;
} ;


StageState.prototype.notifyFighterFullPower = function( fighter ) {
  if( this.oldRules )
    return ;
  this.enemyBulletManager.cancelIntoStars( fighter ) ;
  this.showMessage( 'Full Power Mode!!', 'rgb(255, 220, 120)' ) ;
} ;


// at full power, going above the line pulls in every item
StageState.prototype._checkCollectLine = function( ) {
  if( this.oldRules )
    return ;
  if( this.canonMoves )
    this._pullItemsToMarisa( ) ;
  for( var i = 0; i < this.fighterManager.elements.length; i++ ) {
    var lineFighter = this.fighterManager.elements[ i ] ;
    if( lineFighter.isFullPower( ) && ! lineFighter.isHitPending( ) &&
        lineFighter.getY( ) < this.getCollectLine( ) ) {
      this.itemManager.beHomingAll( lineFighter ) ;
      return ;
    }
  }
} ;


StageState.prototype._checkExtend = function( ) {
  if( this.oldRules )
    return ;
  while( this.extendIndex < this._EXTENDS.length &&
         this.score >= this._EXTENDS[ this.extendIndex ] ) {
    this.extendIndex++ ;
    if( this.players < this._MAX_STOCK )
      this.players++ ;
    this.setFlag( this._FLAG_SE_POWERUP ) ;
    this.showMessage( 'Extend!!', 'rgb(255, 160, 200)' ) ;
  }
} ;


StageState.prototype._runMessages = function( ) {
  for( var i = 0; i < this.messages.length; i++ )
    this.messages[ i ].count++ ;
  while( this.messages.length > 0 && this.messages[ 0 ].count > this._MESSAGE_SPAN )
    this.messages.shift( ) ;
} ;


StageState.prototype.notifyFighterPowerUp = function( ) {
  this.setFlag( this._FLAG_SE_POWERUP ) ;
} ;


StageState.prototype.notifyFighterDoShot = function( fighter ) {
  if( this.count % 5 != 0 )
    return ;

  this.bulletManager.create( fighter ) ;
  this.setFlag( this._FLAG_SE_SHOT ) ;
} ;


StageState.prototype.notifyEnemyDoShot = function( enemy, shot ) {
  this.enemyBulletManager.create( enemy, shot ) ;
} ;


StageState.prototype.notifyEnemyDidShot = function( enemy, shot ) {
  if( ! this.isFlagSet( this._FLAG_BOMB ) &&
      ! this.isFlagSet( this._FLAG_BOSS_SPELLCARD ) )
    this.setFlag( this._FLAG_SE_ENEMY_SHOT ) ;
} ;


StageState.prototype.notifyBulletHit = function( bullet, enemy ) {
  this.effectManager.createDamageEffect( enemy ) ;
  this.fx.hitSpark( bullet.getX( ), bullet.getY( ) ) ;
  this.setFlag( this._FLAG_SE_ENEMY_DAMAGE ) ;
  this.score += 10 ;
} ;


StageState.prototype.notifyGraze = function(fighter, bullet) {
  this.setFlag(this._FLAG_SE_GRAZE);
  this.graze += 1;
  bullet.graze -= 1; // TODO: should be in EnemyBullet?
  this.score += this.oldRules ? 100 : this._GRAZE_SCORE;
  this.effectManager.createGraze(fighter, bullet);
  this.fx.grazeSpark(fighter.getX(), fighter.getY());
};


/**
 * TODO: temporal
 */
StageState.prototype.notifyFighterDoBomb = function( fighter ) {
  if( this.bombs <= 0 && ! this.debugFlags.bombs )
    return ;
  if( this.isFlagSet( this._FLAG_BOMB ) )
    return ;
  // deathbomb: the window gets shorter by how long it took to press
  if( fighter.isHitPending( ) ) {
    var tookFrames = this.count - fighter.hitCount ;
    fighter.deathbombWindow = Math.max( 1, fighter.deathbombWindow - tookFrames ) ;
    fighter.hitCount = -1 ;
  }
  this.spellFailed = true ;
  if( ! this.debugFlags.bombs )
    this.bombs-- ;
  this.bombCount = this.count ;
  this.bombName = this._BOMB_NAMES[ fighter.characterIndex ] || this._BOMB_NAMES[ 0 ] ;
  this.fx.flash( 0.8 ) ;
  this.setFlag( this._FLAG_BOMB ) ;
  if( ! this.canonMoves )
    this.enemyManager.bomb( fighter ) ;
  this.enemyBulletManager.bomb( fighter ) ;
  this.itemManager.beHomingAll( fighter ) ;
  this.spellCardManager.create( fighter ) ;
  this.bombManager.create( fighter ) ;
  this.setFlag( this._FLAG_SE_POWER_EFFECT ) ;
} ;


StageState.prototype.notifyEnemyVanished = function( bullet, enemy ) {
  this.setFlag( this._FLAG_SE_ENEMY_VANISH ) ;
  // TODO: temporal
  if( enemy.powerItem )
    this.itemManager.createPowerItem(enemy);
  else if( enemy.scoreItem )
    this.itemManager.createScoreItem(enemy);
  this.effectManager.createExplosion(enemy);
  this.fx.enemyBurst(enemy.getX(), enemy.getY(), false);
  this.notifyDoEffect( enemy, 'shockwave', null ) ;
  this.score += 100 ;
} ;


// bullet bonus and spell bonus when a boss attack ends
StageState.prototype._endBossPhase = function( boss ) {
  if( this.oldRules )
    return ;
  if( boss.timedOut ) {
    if( this.spellCard )
      this.showMessage( 'Bonus Failed', 'rgb(200, 200, 200)' ) ;
    return ;
  }

  var bulletNum = this.enemyBulletManager.countAlive( ) ;
  if( bulletNum > 0 )
    this.score += bulletNum * ( 1995 + 5 * bulletNum ) ;

  if( ! this.spellCard )
    return ;
  if( this.spellFailed ) {
    this.showMessage( 'Bonus Failed', 'rgb(200, 200, 200)' ) ;
    return ;
  }
  var spellBase = this._SPELL_BASES[ Math.min( this.stageIndex, this._SPELL_BASES.length - 1 ) ] ;
  var spellBonus = spellBase * ( Math.max( 0, Math.floor( boss.getTimeLeft( ) ) ) + 10 ) ;
  this.score += spellBonus ;
  this.showMessage( 'Get Spell Card Bonus!!', 'rgb(255, 230, 120)' ) ;
  this.showMessage( String( spellBonus ), 'rgb(255, 230, 120)' ) ;
} ;


StageState.prototype.notifyBossVanished = function( boss ) {
  this._endBossPhase( boss ) ;
  this._endPractice( ) ;
  this.fx.enemyBurst( boss.getX( ), boss.getY( ), true ) ;
  this.fx.flash( 0.6 ) ;
  this.enemyBulletManager.beItem(this.fighterManager.getClosestFighter(boss)); // TODO: temporal
  this.setFlag( this._FLAG_SE_ENEMY_VANISH ) ;
  this.spellCard = null ;

  this.clearFlag( this._FLAG_BOSS_EXIST ) ;
  this.score += boss.score ;

  // TODO: temporal
  if(this.stageIndex == 0 && this.bossManager.index == 1)
    this.sendMessageToServer(GameSocket._STATE_DESTROY_STAGE1_MID_BOSS);
  else if(this.stageIndex == 0 && this.bossManager.index == 2)
    this.sendMessageToServer(GameSocket._STATE_DESTROY_STAGE1_BIG_BOSS);
  else if(this.stageIndex == 1 && this.bossManager.index == 1)
    this.sendMessageToServer(GameSocket._STATE_DESTROY_STAGE2_MID_BOSS);
  else if(this.stageIndex == 1 && this.bossManager.index == 2)
    this.sendMessageToServer(GameSocket._STATE_DESTROY_STAGE2_BIG_BOSS);
} ;


StageState.prototype.notifyBossVanishEnd = function( boss ) {
  if( boss.vanishedTalk ) {
    this.state = this._STATE_TALK ;
    this.fighterManager.beNeutral( ) ;
    // TODO: temporal. consider if desync can occur.
    for(var i = 0; i < this.lag; i++) {
      this.keyFlags.set(i, this.states[this.state].resetButton(this.keyFlags.get(i)));
    }
    for(var i = 0; i < this._BUTTON_HISTORY; i++) {
      this.keyFlags2.set(i, this.states[this.state].resetButton(this.keyFlags2.get(i)));
      this.keyFlagHistories.set(i, this.states[this.state].resetButton(this.keyFlagHistories.get(i)));
    }
  }
//  this.state = this._STATE_CLEAR ;
} ;


/**
 * TODO: temporal. especially name is temporal.
 */
StageState.prototype.notifyBeginTalk = function() {
  this.state = this._STATE_TALK;
  this.fighterManager.beNeutral();
  // TODO: temporal. consider if desync can occur.
  for(var i = 0; i < this.lag; i++) {
    this.keyFlags.set(i, this.states[this.state].resetButton(this.keyFlags.get(i)));
  }
  for(var i = 0; i < this._BUTTON_HISTORY; i++) {
    this.keyFlags2.set(i, this.states[this.state].resetButton(this.keyFlags2.get(i)));
    this.keyFlagHistories.set(i, this.states[this.state].resetButton(this.keyFlagHistories.get(i)));
  }
};


StageState.prototype.notifyFighterHit = function( fighter, element ) {
  if( this.oldRules ) {
    fighter.die( ) ;
    this.notifyFighterDead( fighter, element ) ;
    return ;
  }
  if( fighter.isHitPending( ) )
    return ;
  fighter.hitCount = this.count ;
  this.spellFailed = true ;
} ;


// no bomb in time after a hit, so the hit counts
StageState.prototype._checkHitPending = function( ) {
  for( var i = 0; i < this.fighterManager.elements.length; i++ ) {
    var hitFighter = this.fighterManager.elements[ i ] ;
    if( hitFighter.isHitPending( ) &&
        this.count - hitFighter.hitCount >= hitFighter.deathbombWindow ) {
      hitFighter.hitCount = -1 ;
      hitFighter.die( ) ;
      this.notifyFighterDead( hitFighter, null ) ;
    }
  }
} ;


StageState.prototype._dropPower = function( fighter ) {
  var lostPower = Math.min( this._DEATH_POWER_LOSS, fighter.getPower( ) ) ;
  fighter.decrementPower( this._DEATH_POWER_LOSS ) ;
  this.powerChain = 0 ;
  fighter.deathbombWindow = fighter._DEATHBOMB_FRAMES ;
  var x = fighter.getX( ) ;
  var y = fighter.getY( ) ;
  if( lostPower >= 8 ) {
    this.itemManager.createScattered( x, y, this.itemManager.Item._TYPE_BIG_POWER, 40 ) ;
    lostPower -= 8 ;
  }
  for( var i = 0; i < Math.min( 4, lostPower ); i++ )
    this.itemManager.createScattered( x, y, this.itemManager.Item._TYPE_POWER, 80 ) ;
} ;


/**
 * TODO: temporal
 */
StageState.prototype.notifyFighterDead = function( fighter, element ) {

  this.setFlag( this._FLAG_FIGHTER_DEAD ) ;
  this.setFlag( this._FLAG_SE_DEAD ) ;
  this.effectManager.createExplosion(fighter);
  this.fx.playerDeath(fighter.getX(), fighter.getY());
  this.fx.flash(0.4);
  this.notifyDoEffect(fighter, 'shockwave', null);
  fighter.setFlag( fighter._FLAG_UNHITTABLE ) ;
  fighter.deadCount = fighter.count ;

  if( ! this.oldRules )
    this._dropPower( fighter ) ;
  this._endPractice( ) ;

  if( this.players <= 0 && ! this.debugFlags.lives ) {
    this._saveHiScore( ) ;
    this.sendMessageToServer(GameSocket._STATE_GAME_OVER);
    // TODO: temporal
    if( this.isFlagSet( this._FLAG_AUTO_PLAY ) ) {
      this.game.notifyQuitStage( ) ;
      return ;
    }
    this.state = this._STATE_GAME_OVER ;
    this.states[ this.state ].init( ) ;
    fighter.beNeutral( ) ;
    // TODO: temporal. consider if desync can occur.
    for(var i = 0; i < this.lag; i++) {
      this.keyFlags.set(i, this.states[this.state].resetButton(this.keyFlags.get(i)));
    }
    for(var i = 0; i < this._BUTTON_HISTORY; i++) {
      this.keyFlags2.set(i, this.states[this.state].resetButton(this.keyFlags2.get(i)));
      this.keyFlagHistories.set(i, this.states[this.state].resetButton(this.keyFlagHistories.get(i)));
    }
    return ;
  }

  this.bombs = this.oldRules ? 2 : this.getStartBombs( ) ;
  if( ! this.debugFlags.lives )
    this.players-- ;
  fighter.state = fighter._STATE_ALIVE ;
  fighter.beDefaultPosition( ) ;
  fighter.deadCount = fighter.count ;

  this.sendMessageToServer(GameSocket._STATE_DEAD);

} ;


/**
 * TODO: temporal
 */
StageState.prototype.notifyDoEffect = function( element, type, params ) {
  if(type == 'shockwave' && params)
    this.effectManager.createBigShockWave( element, type, params ) ;
  else
    this.effectManager.create( element, type, params ) ;
} ;


StageState.prototype.notifyBossAppeared = function( boss ) {
  // spell practice skips the boss straight to the picked spell card
  var practice = this.practice ;
  if( practice && practice.phase > 0 && this.stageIndex == practice.stage &&
      this.bossManager.index == practice.boss - 1 ) {
    boss.index = practice.phase ;
    boss._initState( ) ;
  }
} ;


StageState.prototype._endPractice = function( ) {
  if( this.practice && this.practice.spell && this.practiceEndCount < 0 )
    this.practiceEndCount = this.animationCount ;
} ;


StageState.prototype.notifyBossStageChanged = function( boss ) {
//  this.enemyBulletManager.removeBulletsOfEnemy( boss ) ;
  this.enemyBulletManager.beItem(this.fighterManager.getClosestFighter(boss)); // TODO: temporal
} ;


// marisa grabs items from further away than reimu
StageState.prototype._MARISA_PULL_RANGE = 56 ;

StageState.prototype._pullItemsToMarisa = function( ) {
  for( var i = 0; i < this.fighterManager.elements.length; i++ ) {
    var pullFighter = this.fighterManager.elements[ i ] ;
    if( pullFighter.characterIndex != pullFighter._MARISA || pullFighter.isHitPending( ) )
      continue ;
    var items = this.itemManager.elements ;
    for( var j = 0; j < items.length; j++ ) {
      var pullItem = items[ j ] ;
      if( pullItem.isDead( ) || pullItem.isHoming( ) )
        continue ;
      var pullDx = pullItem.getX( ) - pullFighter.getX( ) ;
      var pullDy = pullItem.getY( ) - pullFighter.getY( ) ;
      if( pullDx * pullDx + pullDy * pullDy < this._MARISA_PULL_RANGE * this._MARISA_PULL_RANGE )
        pullItem.setTarget( pullFighter ) ;
    }
  }
} ;


// a bomb hitting an enemy or the boss, same as a shot but with no bullet
StageState.prototype.bombDamage = function( target, damage, isBoss ) {
  if( isBoss ) {
    if( target.isFlagSet( target._FLAG_UNHITTABLE ) || target.isVanishingOrEscaping( ) )
      return ;
    target.vital -= damage ;
  } else {
    if( target.isDead( ) )
      return ;
    target.vital -= damage ;
    if( target.vital <= 0 ) {
      this.notifyEnemyVanished( null, target ) ;
      target.die( ) ;
    }
  }
  this.effectManager.createDamageEffect( target ) ;
  this.setFlag( this._FLAG_SE_ENEMY_DAMAGE ) ;
  this.score += 10 ;
} ;


/**
 * TODO: temporal
 */
StageState.prototype.notifyBeScoreItem = function(fighter, element, fromBomb) {
  if(this.oldRules) {
    this.itemManager.createHoming(fighter, element);
    return;
  }
  this.itemManager.createHoming(fighter, element, this.itemManager.Item._TYPE_STAR, fromBomb);
};


StageState.prototype.notifyBossBecameActive = function( boss ) {
  this.state = this._STATE_SHOOTING ;
  this.spellFailed = false ;
  if( boss.spellCard ) {
    this.spellCardManager.create( boss ) ;
    this.setFlag( this._FLAG_SE_POWER_EFFECT ) ;
    this.spellCard = boss.spellCard ;
    this.bossSpellCount = this.count ;
    this.fx.flash( 0.35 ) ;
    this.setFlag( this._FLAG_BOSS_SPELLCARD ) ;
  }
  this.setFlag( this._FLAG_BOSS_EXIST ) ;
} ;


StageState.prototype.notifyBossBeginTalk = function( boss ) {
  // TODO: temporal
  if( boss.appearedTalk ) {
    this.state = this._STATE_TALK ;
    this.fighterManager.beNeutral( ) ;
    // TODO: temporal. consider if desync can occur.
    for(var i = 0; i < this.lag; i++) {
      this.keyFlags.set(i, this.states[this.state].resetButton(this.keyFlags.get(i)));
    }
    for(var i = 0; i < this._BUTTON_HISTORY; i++) {
      this.keyFlags2.set(i, this.states[this.state].resetButton(this.keyFlags2.get(i)));
      this.keyFlagHistories.set(i, this.states[this.state].resetButton(this.keyFlagHistories.get(i)));
    }
  } else {
    this.notifyBossBecameActive( boss ) ;
  }
} ;


StageState.prototype.notifyBossMovedNextStage = function( boss ) {
  this._endBossPhase( boss ) ;
  this._endPractice( ) ;
  this.fx.enemyBurst( boss.getX( ), boss.getY( ), true ) ;
  this.clearFlag( this._FLAG_BOSS_SPELLCARD ) ; // Just in case.
  this.setFlag( this._FLAG_SE_ENEMY_VANISH ) ;
  this.spellCard = null ;
  this.notifyDoEffect( boss, 'shockwave', {
    'w': 5,
    'g': 5,
    'a': 0.1,
    'b': 20,
    'endCount': 50
  } ) ;
} ;


StageState.prototype._MAX_CONTINUES = 3 ;


StageState.prototype.getContinuesLeft = function( ) {
  if( this.oldRules )
    return 1 ;
  if( this.practice )
    return 0 ;
  return Math.max( 0, this._MAX_CONTINUES - this.continuesUsed ) ;
} ;


StageState.prototype.notifyContinue = function( ) {
  if( this.getContinuesLeft( ) <= 0 )
    return ;
  this.didContinue = true ;
  // like eosd the score starts over and its last digit counts the continues
  if( ! this.oldRules ) {
    this.continuesUsed++ ;
    this.score = this.continuesUsed ;
    this.viewScore = this.score ;
  }
  this.bombs = this.oldRules ? 2 : this.getStartBombs( ) ;
  this.players = this.oldRules ? 3 : this.getStartPlayers( ) ;
  this.fighterManager.recoverWhenContinue();
  this.state = this._STATE_SHOOTING ;
} ;


StageState.prototype.notifyQuit = function( ) {
  this._saveHiScore( ) ;
  this.game.notifyQuitStage( true ) ;
} ;


StageState.prototype.notifyGoNextStage = function( ) {
  this.state = this._STATE_SHOOTING ;
  this.count = 0 ;
  this.animationCount = 0 ;
  this.pending = 0 ;
  this.graze = 0 ;
  this.pointItems = 0 ;
  this.clearBonus = 0 ;
  this.enemyManager.goNextStage( ) ;
  this.bossManager.goNextStage( ) ;
  this.backgroundManager.goNextStage();
} ;


StageState.prototype.notifyGameClear = function( ) {
  this._saveHiScore( ) ;
  // TODO: temporal
  if( this.isFlagSet( this._FLAG_AUTO_PLAY ) ) {
    this.game.notifyQuitStage( ) ;
  } else {
    this.game.notifyGameClear( ) ;
  }
} ;


StageState.prototype.notifyStageClear = function( ) {
  this.clearFlag( this._FLAG_BOSS_SPELLCARD ) ; // Just in case.
  this.state = this._STATE_CLEAR ;
  this.states[ this.state ].init( ) ; // TODO: temporal
  this.messages = [ ] ;
  if( ! this.oldRules ) {
    this.clearBonus = this._getClearBonus( ) ;
    this.score += this.clearBonus ;
    this._saveHiScore( ) ;
  }
  this.viewScore = this.score ;
} ;


StageState.prototype._getClearBonus = function( ) {
  var clearBonus = ( ( this.stageIndex + 1 ) * 1000 + this.fighter.getPower( ) * 100 + this.graze * 10 ) * this.pointItems ;
  if( this.stageIndex >= this.params.length - 1 )
    clearBonus += this.players * 3000000 + this.bombs * 1000000 ;
  return Math.floor( clearBonus / 10 ) * 10 ;
} ;


/**
 * TODO: rename
 */
StageState.prototype.isBossExist = function() {
  return this.isFlagSet(this._FLAG_BOSS_EXIST);
};


/**
 * TODO: rename
 */
StageState.prototype.isBombExist = function() {
  return this.isFlagSet(this._FLAG_BOMB);
};


// esc or p pauses, returns true when the key was used by the pause menu


StageState.prototype._displayMessages = function( surface ) {
  if( ! this.messages || this.messages.length == 0 )
    return ;
  surface.save( ) ;
  surface.textAlign = 'center' ;
  surface.lineJoin = 'round' ;
  for( var i = 0; i < this.messages.length; i++ ) {
    var message = this.messages[ i ] ;
    var fade = this._MESSAGE_SPAN - message.count ;
    // pops in a bit big then settles
    var popSize = message.count < 8 ? 26 - message.count : 18 ;
    surface.font = 'italic bold ' + popSize + 'px Georgia, serif' ;
    surface.globalAlpha = fade < 30 ? Math.max( 0, fade / 30 ) : 1.0 ;
    surface.lineWidth = 4 ;
    surface.strokeStyle = 'rgba( 0, 0, 0, 0.8 )' ;
    surface.strokeText( message.text, this.getWidth( ) / 2, 100 + i * 26 ) ;
    surface.fillStyle = message.color ;
    surface.fillText( message.text, this.getWidth( ) / 2, 100 + i * 26 ) ;
  }
  surface.restore( ) ;
} ;


// the hitbox shows while focused: a white dot in a slowly spinning ring
StageState.prototype._displayHitbox = function( surface ) {
  if( this.viewFromFighter )
    return ;
  surface.save( ) ;
  for( var i = 0; i < this.fighterManager.elements.length; i++ ) {
    var hitFighter = this.fighterManager.elements[ i ] ;
    if( hitFighter.isDead( ) )
      continue ;
    var showDot = hitFighter.isFlagSet( hitFighter._FLAG_SLOW ) || this.debugFlags.hitboxes ;
    if( ! showDot )
      continue ;
    var x = hitFighter.getX( ) ;
    var y = hitFighter.getY( ) ;
    var spin = this.animationCount * 0.05 ;
    surface.globalAlpha = 0.85 ;
    for( var arc = 0; arc < 4; arc++ ) {
      var arcStart = spin + arc * Math.PI / 2 ;
      surface.beginPath( ) ;
      surface.arc( x, y, 14, arcStart, arcStart + 1.0 ) ;
      surface.strokeStyle = 'rgba( 40, 0, 30, 0.7 )' ;
      surface.lineWidth = 3.5 ;
      surface.stroke( ) ;
      surface.strokeStyle = 'rgb( 255, 255, 255 )' ;
      surface.lineWidth = 1.5 ;
      surface.stroke( ) ;
    }
    surface.globalAlpha = 1.0 ;
    surface.fillStyle = 'rgb( 255, 255, 255 )' ;
    surface.beginPath( ) ;
    surface.arc( x, y, hitFighter.hitRadius + 1, 0, Math.PI * 2 ) ;
    surface.fill( ) ;
    surface.strokeStyle = 'rgb( 220, 30, 60 )' ;
    surface.lineWidth = 1 ;
    surface.stroke( ) ;
  }

  // debug: every bullet's hit circle
  if( this.debugFlags.hitboxes ) {
    surface.strokeStyle = 'rgb( 80, 255, 80 )' ;
    surface.lineWidth = 1 ;
    surface.globalAlpha = 0.9 ;
    var bullets = this.enemyBulletManager.elements ;
    for( var j = 0; j < bullets.length; j++ ) {
      if( bullets[ j ].isDead( ) || ! bullets[ j ].collisionWidth )
        continue ;
      surface.beginPath( ) ;
      surface.arc( bullets[ j ].getX( ), bullets[ j ].getY( ),
                   Math.min( bullets[ j ].collisionWidth, bullets[ j ].collisionHeight ) / 2, 0, Math.PI * 2 ) ;
      surface.stroke( ) ;
    }
  }
  surface.restore( ) ;
} ;


StageState.prototype._displayBombName = function( surface ) {
  if( ! this.bombName || ! this.isFlagSet( this._FLAG_BOMB ) )
    return ;
  var bombAge = this.count - this.bombCount ;
  var slide = Math.min( 1, bombAge / 15 ) ;
  var fade = Math.min( 1, ( this._BOMB_SPAN - bombAge ) / 20 ) ;
  surface.save( ) ;
  surface.globalAlpha = Math.max( 0, fade ) ;
  var bannerX = -260 + 270 * slide ;
  surface.fillStyle = 'rgba( 0, 0, 0, 0.5 )' ;
  surface.fillRect( bannerX - 10, this.getHeight( ) - 58, 280, 24 ) ;
  surface.font = 'italic bold 15px Georgia, serif' ;
  surface.textAlign = 'left' ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.fillText( this.bombName, bannerX, this.getHeight( ) - 41 ) ;
  surface.restore( ) ;
} ;


// spell name slides up from the bottom to under the hp bar, with the bonus under it
StageState.prototype._displaySpellBanner = function( surface, boss ) {
  var spellAge = this.count - this.bossSpellCount ;
  var slide = Math.min( 1, spellAge / this._BANNER_SLIDE ) ;
  slide = 1 - ( 1 - slide ) * ( 1 - slide ) ;
  var bannerY = ( this.getHeight( ) - 80 ) + ( 34 - ( this.getHeight( ) - 80 ) ) * slide ;
  var rightX = this.getWidth( ) - 8 ;

  surface.save( ) ;
  surface.font = 'italic bold 15px Georgia, serif' ;
  surface.textAlign = 'right' ;
  var nameWidth = surface.measureText( this.spellCard ).width ;
  var shade = surface.createLinearGradient( rightX - nameWidth - 40, 0, rightX, 0 ) ;
  shade.addColorStop( 0, 'rgba( 0, 0, 0, 0 )' ) ;
  shade.addColorStop( 0.3, 'rgba( 0, 0, 0, 0.55 )' ) ;
  shade.addColorStop( 1, 'rgba( 0, 0, 0, 0.55 )' ) ;
  surface.fillStyle = shade ;
  surface.fillRect( rightX - nameWidth - 40, bannerY - 15, nameWidth + 48, 20 ) ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.fillText( this.spellCard, rightX, bannerY ) ;

  if( ! this.oldRules && slide >= 1 ) {
    surface.font = 'bold 11px Arial' ;
    if( this.spellFailed ) {
      surface.fillStyle = 'rgb( 200, 200, 200 )' ;
      surface.fillText( 'Bonus Failed', rightX, bannerY + 16 ) ;
    } else {
      var spellBase = this._SPELL_BASES[ Math.min( this.stageIndex, this._SPELL_BASES.length - 1 ) ] ;
      var bonusNow = spellBase * ( Math.max( 0, Math.floor( boss.getTimeLeft( ) ) ) + 10 ) ;
      surface.fillStyle = 'rgb( 255, 230, 120 )' ;
      surface.fillText( 'Bonus ' + bonusNow, rightX, bannerY + 16 ) ;
    }
  }
  surface.restore( ) ;
} ;


// esc or p pauses, returns true when the key was used by the pause menu
StageState.prototype._handlePauseKey = function( e ) {
  var isPauseKey = e.keyCode == 27 || e.keyCode == 80 ;
  if( ! this.paused ) {
    if( ! isPauseKey || e.repeat || this.game.isMultiPlay( ) )
      return false ;
    if( this.state != this._STATE_SHOOTING && this.state != this._STATE_TALK )
      return false ;
    this.paused = true ;
    this.pauseIndex = 0 ;
    this.pausePage = 'main' ;
    this.game.pauseBGM( true ) ;
    this._soundEffect( Game._SE_SELECT ) ;
    return true ;
  }

  if( e.repeat && e.keyCode != 38 && e.keyCode != 40 )
    return true ;
  var pauseItems = this._getPauseItems( ) ;
  switch( e.keyCode ) {
    case 38: // up
      this.pauseIndex = ( this.pauseIndex + pauseItems.length - 1 ) % pauseItems.length ;
      this._soundEffect( Game._SE_SELECT ) ;
      break ;
    case 40: // down
      this.pauseIndex = ( this.pauseIndex + 1 ) % pauseItems.length ;
      this._soundEffect( Game._SE_SELECT ) ;
      break ;
    case 27: // esc
    case 80: // p
      this._resume( ) ;
      break ;
    case 88: // x
      if( this.pausePage == 'debug' ) {
        this.pausePage = 'main' ;
        this.pauseIndex = 0 ;
      } else {
        this._resume( ) ;
      }
      break ;
    case 90: // z
      this._soundEffect( Game._SE_SELECT ) ;
      pauseItems[ this.pauseIndex ].act.call( this ) ;
      break ;
  }
  return true ;
} ;


StageState.prototype._getPauseItems = function( ) {
  if( this.pausePage == 'debug' )
    return this._getDebugItems( ) ;
  var pauseItems = [
    { 'label': 'Resume', 'act': function( ) { this._resume( ) ; } },
    { 'label': 'Restart', 'act': function( ) { this._restart( ) ; } }
  ] ;
  if( this.game.debug ) {
    pauseItems.push( { 'label': 'Debug', 'act': function( ) {
      this.pausePage = 'debug' ;
      this.pauseIndex = 0 ;
    } } ) ;
  }
  pauseItems.push( { 'label': 'Quit to Title', 'act': function( ) {
    this.paused = false ;
    this.game.speed = 1 ;
    this._saveHiScore( ) ;
    this.game.notifyQuitStage( ) ;
  } } ) ;
  return pauseItems ;
} ;


StageState.prototype._getDebugItems = function( ) {
  var self = this ;
  var onOff = function( flagOn ) { return flagOn ? 'ON' : 'off' ; } ;
  var toggle = function( key ) {
    return function( ) {
      self.debugFlags[ key ] = ! self.debugFlags[ key ] ;
      if( self.debugFlags[ key ] )
        self.cheated = true ;
    } ;
  } ;
  var debugItems = [
    { 'label': 'Infinite lives: ' + onOff( this.debugFlags.lives ), 'act': toggle( 'lives' ) },
    { 'label': 'Infinite bombs: ' + onOff( this.debugFlags.bombs ), 'act': toggle( 'bombs' ) },
    { 'label': 'Invincible: ' + onOff( this.debugFlags.invincible ), 'act': toggle( 'invincible' ) },
    { 'label': 'Show hitboxes: ' + onOff( this.debugFlags.hitboxes ), 'act': toggle( 'hitboxes' ) },
    { 'label': 'Speed: ' + ( this.game.speed || 1 ) + 'x', 'act': function( ) {
      var speedIndex = self._SPEEDS.indexOf( self.game.speed || 1 ) ;
      self.game.speed = self._SPEEDS[ ( speedIndex + 1 ) % self._SPEEDS.length ] ;
      if( self.game.speed != 1 )
        self.cheated = true ;
    } },
    { 'label': 'Max power', 'act': function( ) {
      self.cheated = true ;
      self.fighter.incrementPower( 128 ) ;
    } }
  ] ;

  // skipping around would break a replay, so only in normal play
  if( ! this.isFlagSet( this._FLAG_AUTO_PLAY ) ) {
    for( var stageNum = 0; stageNum < this.params.length; stageNum++ ) {
      debugItems.push( this._makeJumpItem( stageNum, 0, 'Go to Stage ' + ( stageNum + 1 ) ) ) ;
      var bosses = this.bossManager.params[ stageNum ] ;
      for( var bossNum = 0; bossNum < bosses.length; bossNum++ ) {
        var bossLabel = bossNum < bosses.length - 1 ? ' mid-boss' : ' boss' ;
        debugItems.push( this._makeJumpItem( stageNum, bossNum + 1, 'Go to Stage ' + ( stageNum + 1 ) + bossLabel ) ) ;
      }
    }
  }
  debugItems.push( { 'label': 'Back', 'act': function( ) {
    self.pausePage = 'main' ;
    self.pauseIndex = 0 ;
  } } ) ;
  return debugItems ;
} ;


StageState.prototype._makeJumpItem = function( stageNum, bossNum, label ) {
  return { 'label': label, 'act': function( ) { this._debugJump( stageNum, bossNum ) ; } } ;
} ;


/*
 * restarts the run, then moves it to a stage, and to right before
 * one of its bosses when bossNum > 0 (1 is the first boss)
 */
StageState.prototype._debugJump = function( stageNum, bossNum ) {
  this.cheated = true ;
  this._restart( ) ;
  this._moveToStage( stageNum, bossNum ) ;
} ;


StageState.prototype._moveToStage = function( stageNum, bossNum ) {
  for( var i = 0; i < stageNum; i++ ) {
    this.stageIndex++ ;
    this.enemyManager.goNextStage( ) ;
    this.bossManager.goNextStage( ) ;
    this.backgroundManager.goNextStage( ) ;
  }
  this.states[ this._STATE_TALK ].stageIndex = stageNum ;
  if( bossNum <= 0 )
    return ;

  var bossParams = this.bossManager.params[ stageNum ][ bossNum - 1 ] ;
  this.count = Math.max( 0, bossParams.count - 30 ) ;
  this.bossManager.index = bossNum - 1 ;
  var enemyList = this.enemyManager.params[ stageNum ] ;
  var skipIndex = 0 ;
  while( skipIndex < enemyList.length && enemyList[ skipIndex ].count < this.count )
    skipIndex++ ;
  this.enemyManager.index = skipIndex ;
} ;


StageState.prototype._restart = function( ) {
  this.paused = false ;
  this._saveHiScore( ) ;
  this.game._changeState( Game._STATE_IN_STAGE, this.startParams ) ;
} ;


StageState.prototype._displayPause = function( surface ) {
  if( ! this.paused )
    return ;
  var pauseItems = this._getPauseItems( ) ;
  var isDebug = this.pausePage == 'debug' ;
  surface.save( ) ;
  surface.globalAlpha = 0.6 ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  surface.fillRect( 0, 0, this.getWidth( ), this.getHeight( ) ) ;
  surface.globalAlpha = 1.0 ;
  surface.textAlign = 'center' ;
  surface.font = 'bold 24px Arial' ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.fillText( isDebug ? 'Debug' : 'Paused', this.getWidth( ) / 2, isDebug ? 50 : 170 ) ;
  surface.font = isDebug ? '15px Arial' : '18px Arial' ;
  var rowGap = isDebug ? Math.min( 22, Math.floor( 360 / pauseItems.length ) ) : 32 ;
  var firstRow = isDebug ? 85 : 220 ;
  for( var i = 0; i < pauseItems.length; i++ ) {
    surface.globalAlpha = ( i == this.pauseIndex ) ? 1.0 : 0.4 ;
    surface.fillText( pauseItems[ i ].label, this.getWidth( ) / 2, firstRow + i * rowGap ) ;
  }
  if( isDebug && this.cheated ) {
    surface.globalAlpha = 0.7 ;
    surface.font = '12px Arial' ;
    surface.fillText( 'cheats used, the hiscore won\'t save this run', this.getWidth( ) / 2, this.getHeight( ) - 20 ) ;
  }
  surface.restore( ) ;
} ;


StageState.prototype._resume = function( ) {
  this.paused = false ;
  this.game.pauseBGM( false ) ;
} ;


/**
 * TODO: temporal
 */
StageState.prototype.getWidth = function( ) {
  return this.game.width - Game._SIDE_WIDTH ;
} ;


StageState.prototype._pushButton = function(e, flag) {
  switch(e.keyCode) {
    case 16: // shift
      flag |= this._BUTTON_SHIFT;
      break;
    case 32: // space
      flag |= this._BUTTON_SPACE;
      break;
    case 37: // left
      flag |= this._BUTTON_LEFT;
      break;
    case 38: // up
      flag |= this._BUTTON_UP;
      break;
    case 39: // right
      flag |= this._BUTTON_RIGHT;
      break;
    case 40: // down
      flag |= this._BUTTON_DOWN;
      break;
    // TODO: temporal
    case 88: // x
      flag |= this._BUTTON_X;
      break;
    case 90: // z
      flag |= this._BUTTON_Z;
      break;
  };
  return flag;
};


StageState.prototype._releaseButton = function(e, flag) {
  switch(e.keyCode) {
    case 16: // shift
      flag &= ~this._BUTTON_SHIFT;
      break;
    case 32: // space
      flag &= ~this._BUTTON_SPACE;
      break;
    case 37: // left
      flag &= ~this._BUTTON_LEFT;
      break;
    case 38: // up
      flag &= ~this._BUTTON_UP;
      break;
    case 39: // right
      flag &= ~this._BUTTON_RIGHT;
      break;
    case 40: // down
      flag &= ~this._BUTTON_DOWN;
      break;
    case 88: // x
      flag &= ~this._BUTTON_X;
      break;
    case 90: // z
      flag &= ~this._BUTTON_Z;
      break;
  };
  return flag;
};


StageState.prototype._DEPLOY_KEYS = [
  [16, 'SHIFT'], [32, 'SPACE'], [37, 'LEFT'], [38, 'UP'],
  [39, 'RIGHT'], [40, 'DOWN'], [88, 'X'], [90, 'Z']
];

/*
 * movement, shift and z are held keys while shooting.
 * space and x, and every key outside of shooting (talk, clear, game over),
 * only fire once when the key goes down.
 */
StageState.prototype._deployKeyFlag = function(flag, fighter) {
  var lastFlag = this.lastDeployed;
  if(fighter === this.fighter2)
    lastFlag = this.lastDeployed2;
  var pressedFlag = flag & ~lastFlag;

  if(fighter === this.fighter2)
    this.lastDeployed2 = flag;
  else
    this.lastDeployed = flag;

  var e = {};
  for(var i = 0; i < this._DEPLOY_KEYS.length; i++) {
    var keyCode = this._DEPLOY_KEYS[i][0];
    var keyBit = this['_BUTTON_' + this._DEPLOY_KEYS[i][1]];
    var heldKey = this.state == this._STATE_SHOOTING && keyCode != 32 && keyCode != 88;
    e.keyCode = keyCode;
    if(heldKey ? (flag & keyBit) : (pressedFlag & keyBit)) {
      this.states[this.state].handleKeyDown(e, fighter);
    } else {
      this.states[this.state].handleKeyUp(e, fighter);
    }
  }
};


StageState.prototype._SYNC_CONTAINER = {m: null, a: null};
StageState.prototype._sync = function() {
  var c = this._SYNC_CONTAINER;
  c.m = this.keyFlagHistories.min;
  c.a = this.keyFlagHistories.getValues();
  this.game.sync(c);
  this._runNextStepIfPossible();
};


StageState.prototype.receiveFromPeer = function(data) {
  this.keyFlags2.insertValues(data.m, data.a);
  if(this.waitingForOther)
    this._runNextStepIfPossible();
};


StageState.prototype._runNextStepIfPossible = function() {
  if(this.keyFlags2.hasValueOfCount(this.syncCount)) {
    this.waitingForOther = false;
    this.game.runNextStep();
  } else {
    this.waitingForOther = true;
  }
};


StageState.prototype.doLookAtFromViewpointTarget = function() {
  return this.viewFromFighter;
};


StageState.prototype.getViewpointTarget = function() {
  return this.fighter;
};



/**
 * TODO: optimize and rename
 */
function KeyFlagQueue() {
  this.min = 0;
  this.max = -1;
  this.values = [];
}

KeyFlagQueue.prototype._NONE = -1;


KeyFlagQueue.prototype.free = function() {
  this.min = 0;
  this.max = -1;
  this.values.length = 0;
};


KeyFlagQueue.prototype.getLength = function() {
  return this.values.length;
};


KeyFlagQueue.prototype.get = function(index) {
  return this.values[index];
};


KeyFlagQueue.prototype.set = function(index, flag) {
  if(index < this.values.length)
    this.values[index] = flag;
};


KeyFlagQueue.prototype.push = function(value) {
  this.values[this.values.length] = value;
  this.max++;
};


KeyFlagQueue.prototype.shift = function() {
  var value = this.values[0];
  for(var i = 0; i < this.values.length-1; i++) {
    this.values[i] = this.values[i+1];
  }
  this.values.length--;
  this.min++;
  return value;
};


KeyFlagQueue.prototype.hasValueOfCount = function(count) {
  while(true) {
    if(this.getLength() == 0)
      return false;
    if(this.min == count)
      return (this.values[0] != this._NONE) ? true : false;
    if(this.min > count)
      return false;
    this.shift();
  }
};


/**
 * TODO: optimize and check the logic
 */
KeyFlagQueue.prototype.insertValues = function(min, values) {
  for(var i = this.getLength(); this.max < min - 1; i++) {
    this.values[i] = this._NONE;
    this.max++;
  }

  var n = this.min - min >= 0 ? this.min - min : 0;
  for(var i = n, len = values.length; i < len; i++) {
    this.values[min - this.min + i] = values[i];
    if(min + i > this.max)
      this.max++;
  }
};


KeyFlagQueue.prototype.shiftUntilLengthIs = function(count) {
  while(this.getLength() > count) {
    this.shift();
  }
};


KeyFlagQueue.prototype.getValues = function() {
  return this.values;
};



function StageAbstractState( stage ) {
  this.stage = stage ;
}


StageAbstractState.prototype.runStep = function( ) {

} ;


StageAbstractState.prototype.handleKeyDown = function( e ) {
} ;


StageAbstractState.prototype.handleKeyUp = function( e ) {
} ;


StageAbstractState.prototype.updateDisplay = function( surface ) {
} ;


StageAbstractState.prototype._soundEffect = function( key ) {
  this.stage._soundEffect( key ) ;
} ;


StageAbstractState.prototype.getImage = function( key ) {
  return this.stage.getImage( key ) ;
} ;


// keys are only wiped on purpose now, presses are found in _deployKeyFlag
StageAbstractState.prototype.resetButton = function(flag) {
  return flag;
};


/**
 * @param record Array
 */
StageAbstractState.prototype._putKeyOnRecord = function( record ) {
  if( record.length > 0 )
    this.stage.putKeyOnRecord( record ) ;
} ;


/**
 * @param record Array
 */
StageAbstractState.prototype._putKeyOffRecord = function( record ) {
  if( record.length > 0 )
    this.stage.putKeyOffRecord( record ) ;
} ;



function ShootingState(stage) {
  this.parent = StageAbstractState;
  this.parent.call(this, stage);
}
__inherit(ShootingState, StageAbstractState);



ShootingState.prototype.handleKeyDown = function(e, fighter) {
  var p = [];
  switch(e.keyCode) {
    case 16: // shift
      if(fighter.setFlag(fighter._FLAG_SLOW))
        p.push('s');
      break;
    case 32: // space
      fighter.changeCharacter();
      p.push('sp');
      break;
    case 37: // left
      if(fighter.setFlag(fighter._FLAG_MOVE_LEFT))
        p.push('l') ;
      break;
    case 38: // up
      if(fighter.setFlag(fighter._FLAG_MOVE_UP))
        p.push('u');
      break;
    case 39: // right
      if(fighter.setFlag(fighter._FLAG_MOVE_RIGHT))
        p.push('r');
      break;
    case 40: // down
      if(fighter.setFlag(fighter._FLAG_MOVE_DOWN))
        p.push('d');
      break;
    // TODO: temporal
    case 88: // x
      this.stage.notifyFighterDoBomb(fighter);
      p.push('x');
      break;
    case 90: // z
      if(fighter.setFlag(fighter._FLAG_SHOT))
        p.push('z');
      break;
  };
  this._putKeyOnRecord(p);
};


ShootingState.prototype.handleKeyUp = function(e, fighter) {
  var p = [];
  switch(e.keyCode) {
    case 16: // shift
      if(fighter.clearFlag(fighter._FLAG_SLOW))
        p.push('s');
      break;
    case 37: // left
      if(fighter.clearFlag(fighter._FLAG_MOVE_LEFT))
        p.push('l');
      break;
    case 38: // up
      if(fighter.clearFlag(fighter._FLAG_MOVE_UP))
        p.push('u');
      break;
    case 39: // right
      if(fighter.clearFlag(fighter._FLAG_MOVE_RIGHT))
        p.push('r');
      break;
    case 40: // down
      if(fighter.clearFlag(fighter._FLAG_MOVE_DOWN))
        p.push('d');
      break;
    case 90: // z
      if(fighter.clearFlag(fighter._FLAG_SHOT))
        p.push('z');
      break;
  } ;
  this._putKeyOffRecord(p);
};


ShootingState.prototype.updateDisplay = function( surface ) {
} ;


function TalkState( stage ) {
  this.parent = StageAbstractState ;
  this.parent.call( this, stage ) ;
  this.stageIndex = 0 ;
  this.sceneIndex = 0 ;
  this.index = 0 ;
  this.params = __talkParams ;
}
__inherit( TalkState, StageAbstractState ) ;


TalkState.prototype.reset = function( ) {
  this.stageIndex = 0 ;
  this.sceneIndex = 0 ;
  this.index = 0 ;
} ;


TalkState.prototype.handleKeyDown = function( e ) {
  var p = [ ] ;
  switch( e.keyCode ) {
    case 32: // space
      p.push( 'sp' ) ;
      this.stage.fighter.changeCharacter( ) ;
      break ;
    case 90: // z
      p.push( 'z' ) ;
      this.index++ ;
      // TODO: temporal
      if( this.index >= this.params[ this.stageIndex ][ this.sceneIndex ][ this.stage.fighter.characterIndex ].length ) {
        this.sceneIndex++ ;
        this.index = 0 ;
        if( this.sceneIndex >= this.params[ this.stageIndex ].length ) {
          this.stage.notifyStageClear( ) ;
          this.stageIndex++ ;
          this.sceneIndex = 0 ;
        } else {
          this.stage.notifyBossBecameActive( this.stage.bossManager.getBoss( ) ) ;
        }
      }
      break ;
  } ;
  this._putKeyOnRecord( p ) ;
} ;


TalkState.prototype.handleKeyUp = function( e ) {
} ;


TalkState.prototype.updateDisplay = function( surface ) {
  this._displayStandUp( surface, this.params[ this.stageIndex ][ this.sceneIndex ][ this.stage.fighter.characterIndex ][ this.index ].left,  120,  0 ) ;
  this._displayStandUp( surface, this.params[ this.stageIndex ][ this.sceneIndex ][ this.stage.fighter.characterIndex ][ this.index ].right, 360,  0 ) ;
  this._displaySerifWindow( surface ) ;
  this._displaySerif( surface ) ;
} ;


/**
 * TODO: temporal
 */
TalkState.prototype._displayStandUp = function( surface, params, w, dw ) {
  if( ! params )
    return ;

  surface.save( ) ;
  if( params.active ) {
    surface.globalAlpha = 1.0 ;
    w += dw ;
  } else {
    surface.globalAlpha = 0.5 ;
  }
  var p = this._getStandUp( params.character ) ;
  if( ! p.image ) {
    surface.restore( ) ;
    return ;
  }
  surface.drawImage( p.image,
                     w - p.width * 0.75 / 2,
                     50,
                     p.width  * 0.75,
                     p.height * 0.75 ) ;
  surface.restore( ) ;
} ;


TalkState.prototype._getStandUp = function( key ) {
  var character = Game._CHARACTERS[ key ] ;
  if( ! character || character.stand === null )
    return { 'image': undefined, 'width': undefined, 'height': undefined } ;
  return { 'image': this.stage.getImage( character.stand ), 'width': character.standWidth, 'height': 600 } ;
} ;


TalkState.prototype._displaySerifWindow = function( surface ) {
  surface.save( ) ;
  surface.fillStyle = 'rgb( 50, 50, 50 )' ;
  surface.globalAlpha = 0.7 ;
  surface.fillRect( 50, 350, 380, 100 ) ;
  surface.restore( ) ;
} ;


TalkState.prototype._displaySerif = function( surface ) {
  surface.save( ) ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.textAlign = 'left' ;
  surface.font = '16px Arial' ;
  var array = this.params[ this.stageIndex ][ this.sceneIndex ][ this.stage.fighter.characterIndex ][ this.index ].serif.split( '\n' ) ;
  for( var i = 0; i < array.length; i++ ) {
    surface.fillText( array[ i ], 60, 380 + i * 20) ;
  }
  surface.restore( ) ;
} ;


/**
 * TODO: temporal
 */
function ClearState( stage ) {
  this.parent = StageAbstractState ;
  this.parent.call( this, stage ) ;
  this.count = 0 ;
}
__inherit( ClearState, StageAbstractState ) ;

ClearState._MOVE_SPEED = 20 ;


/**
 * TODO: temporal
 */
ClearState.prototype.init = function( ) {
  this.count = 0 ;
} ;


/**
 * TODO: temporal
 */
ClearState.prototype.runStep = function( ) {
  this.count++ ;
} ;


ClearState.prototype.handleKeyDown = function( e ) {
  var p = [ ] ;
  switch( e.keyCode ) {
    case 32: // space
      p.push( 'sp' ) ;
      this.stage.fighter.changeCharacter( ) ;
      break ;
    case 90: // z
      p.push( 'z' ) ;
      // TODO: temporal
      if( this.count < this.stage.getHeight( ) / ClearState._MOVE_SPEED )
        return ;
      this._toNextStage(  )
      break ;
  } ;
  this._putKeyOnRecord( p ) ;
} ;


ClearState.prototype.handleKeyUp = function( e ) {
} ;


ClearState.prototype.updateDisplay = function( surface ) {

  var base = this.stage.getHeight( ) - this.count * ClearState._MOVE_SPEED ;;
  if( base < 0 )
    base = 0 ;

  surface.save( ) ;
  var pattern = surface.createPattern( this.getImage( Game._IMG_SCORE_BACK ), '' ) ;
  surface.fillStyle = pattern ;
  surface.fillRect( 0, base, this.stage.getWidth( ), this.stage.getHeight( ) ) ;

  surface.fillStyle = 'rgb( 30, 30, 30 )' ;
  surface.globalAlpha = 0.8 ;
  surface.fillRect( 50, base + 50, 380, 380 ) ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.textAlign = 'left' ;
  surface.font = '16px Arial' ;
  surface.fillText( 'Stage' + ( this.stage.stageIndex + 1 ) + ' Clear',
                    100, base + 100 ) ;
  if( ! this.stage.oldRules ) {
    surface.fillText( 'Point items  ' + this.stage.pointItems, 100, base + 150 ) ;
    surface.fillText( 'Graze  ' + this.stage.graze, 100, base + 175 ) ;
    surface.fillText( 'Clear bonus  ' + this.stage.clearBonus, 100, base + 210 ) ;
  }
  surface.restore( ) ;

} ;


/**
 * TODO: temporal
 */
ClearState.prototype._toNextStage = function( ) {
  // stage practice ends with the stage
  if( this.stage.practice ) {
    this.stage.game.notifyQuitStage( ) ;
    return ;
  }
  this.stage.stageIndex++ ;
  if( this.stage.stageIndex >= __enemiesParams.length ) {
    this.stage.notifyGameClear( ) ;
  } else {
    this.stage.notifyGoNextStage( ) ;
  }
} ;


/**
 * TODO: temporal
 */
function GameOverState( stage ) {
  this.parent = StageAbstractState ;
  this.parent.call( this, stage ) ;
  this.index = 0 ;
}
__inherit( GameOverState, StageAbstractState ) ;


GameOverState.prototype.init = function( ) {
  this.index = this.stage.getContinuesLeft( ) > 0 ? 0 : 1 ;
} ;


/**
 * TODO: temporal
 */
GameOverState.prototype.runStep = function( ) {
} ;


GameOverState.prototype.handleKeyDown = function( e ) {
  switch( e.keyCode ) {
    case 38: // up
    case 40: // down
      if( this.stage.getContinuesLeft( ) <= 0 )
        break ;
      this._soundEffect( Game._SE_SELECT ) ;
      this.index = ( this.index == 0 ) ? 1 : 0 ;
      break ;
    case 90: // z
      this._soundEffect( Game._SE_SELECT ) ;
      if( this.index == 0 )
        this.stage.notifyContinue( ) ;
      else
        this.stage.notifyQuit( ) ;
      break ;
  } ;
} ;


GameOverState.prototype.handleKeyUp = function( e ) {
} ;


GameOverState.prototype.updateDisplay = function( surface ) {
  surface.save( ) ;

  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  surface.globalAlpha = 0.5 ;
  surface.fillRect( 0, 170, 480, 100 ) ;

  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.textAlign = 'center' ;
  surface.textBaseAlign = 'middle' ;
  surface.font = '16px Arial' ;
  if( this.index == 0 ) {
    surface.globalAlpha = 1.0 ;
  } else {
    surface.globalAlpha = 0.2 ;
  }
  var continuesLeft = this.stage.getContinuesLeft( ) ;
  if( continuesLeft <= 0 )
    surface.globalAlpha = 0.1 ;
  var continueText = 'Continue' ;
  if( ! this.stage.oldRules )
    continueText += ' (' + continuesLeft + ' left)' ;
  surface.fillText( continueText, 240, 200 ) ;
  if( this.index == 0 ) {
    surface.globalAlpha = 0.2 ;
  } else {
    surface.globalAlpha = 1.0 ;
  }
  surface.fillText( 'Quit',     240, 240 ) ;
  surface.restore( ) ;
} ;


