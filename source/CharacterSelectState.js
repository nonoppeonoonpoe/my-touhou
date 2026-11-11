function CharacterSelectState( game ) {
  this.parent = GameState ;
  this.parent.call( this, game ) ;
  this.elements = [ ] ;
  this.index = 0 ;
  this.count = 0 ;
}
__inherit( CharacterSelectState, GameState ) ;


CharacterSelectState._APPEAR_SPAN = 10 ;
CharacterSelectState._SLIDE_SPAN = 28 ;
CharacterSelectState._CONFIRM_SPAN = 24 ;

CharacterSelectState.prototype.init = function( ) {
  this.count = 0 ;
  // TODO: magic number
  for( var i = 0; i < 2; i++ ) {
    this.elements[ i ] = { } ;
    this.elements[ i ].width = 400 ;
    this.elements[ i ].height = 600 ;
  }
  this.index = 0 ;
  this.focus = [ 1, 0 ] ;
  this.infoCount = 0 ;
  this.confirmCount = 0 ;
} ;


CharacterSelectState.prototype.runStep = function( ) {
  this.count++ ;
  this.infoCount++ ;
  for( var i = 0; i < 2; i++ ) {
    var targetFocus = i == this.index ? 1 : 0 ;
    this.focus[ i ] += ( targetFocus - this.focus[ i ] ) * 0.2 ;
  }
  // after picking, wait for the flash before the stage starts
  if( this.confirmCount > 0 ) {
    this.confirmCount++ ;
    if( this.confirmCount > CharacterSelectState._CONFIRM_SPAN ) {
      this.confirmCount = 0 ;
      this.game.notifyCharacterSelectConclusion( this.index ) ;
    }
  }
} ;


CharacterSelectState.prototype.updateDisplay = function( surface ) {
  this.game.clear( surface ) ;
  this._displayBG( surface ) ;
  this._displayMessage( surface ) ;
  this._displayCharacters( surface ) ;
  this._displayFlash( surface ) ;
  this._displayCoop( surface ) ;
} ;


// who the co-op partner is, and that the game waits for their pick
CharacterSelectState.prototype._displayCoop = function( surface ) {
  if( ! this.game.isMultiPlay( ) )
    return ;
  surface.save( ) ;
  surface.textAlign = 'center' ;
  surface.font = '16px Arial' ;
  var coopText = 'Co-op with ' + this.game.getPartnerName( ) + '.  Z picks, X leaves' ;
  if( this.game.isWaitingOther( ) )
    coopText = 'Waiting for ' + this.game.getPartnerName( ) + ' to pick...  X leaves' ;
  surface.textBaseline = 'middle' ;
  surface.globalAlpha = 0.7 ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  surface.fillRect( 0, this.getHeight( ) - 40, this.getWidth( ), 30 ) ;
  surface.globalAlpha = 1 ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.fillText( coopText, this.getWidth( ) / 2, this.getHeight( ) - 25 ) ;
  surface.restore( ) ;
} ;


CharacterSelectState.prototype._displayFlash = function( surface ) {
  if( this.confirmCount <= 0 )
    return ;
  surface.save( ) ;
  surface.globalAlpha = 0.8 * ( 1 - __easeOut( this.confirmCount / 12 ) ) ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.fillRect( 0, 0, this.getWidth( ), this.getHeight( ) ) ;
  surface.globalAlpha = __easeInOut( __animTime( this.confirmCount, 10, CharacterSelectState._CONFIRM_SPAN - 10 ) ) ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  surface.fillRect( 0, 0, this.getWidth( ), this.getHeight( ) ) ;
  surface.restore( ) ;
} ;


/**
 * TODO: temporal
 */
CharacterSelectState.prototype._displayBG = function( surface ) {
  surface.save( ) ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  surface.fillRect( 0, 0, this.getWidth( ), this.getHeight( ) ) ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.fillRect( 0, 50, this.getWidth( ), this.getHeight( ) - 100 ) ;

  surface.globalAlpha = 0.05 ;
  surface.drawImage( this.game.getImage( Game._IMG_TITLE_BG ),
                     0,                 
                     0,
                     TitleState._WIDTH,
                     TitleState._HEIGHT,
                     0,
                     0,
                     this.getWidth( ),
                     this.getHeight( ) ) ;

  surface.restore( ) ;
} ;


CharacterSelectState.prototype._displayMessage = function( surface ) {
  surface.save( ) ;
  surface.font = "30px 'Comic Sans MS'" ;
  surface.textAlign = 'center' ;
  surface.textBaseAlign = 'middle' ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  var titleTime = __easeOut( __animTime( this.count, 0, 20 ) ) ;
  surface.globalAlpha = titleTime ;
  surface.fillText( 'Character Select', this.getWidth( ) / 2, 35 - 20 * ( 1 - titleTime ) ) ;
  surface.restore( ) ;
} ;


// what each girl's shots and bomb do, shown under the portraits
CharacterSelectState._MOVE_LINES = [
  [ 'Hakurei Reimu',
    'Shot: ofuda and homing amulets',
    'Focus: persuasion needles',
    'Bomb: Spirit Sign "Fantasy Seal"',
    'Slower, but her amulets find the enemy' ],
  [ 'Kirisame Marisa',
    'Shot: stars and magic missiles',
    'Focus: Illusion Laser',
    'Bomb: Love Sign "Master Spark"',
    'Faster, and pulls in items from further away' ]
] ;


CharacterSelectState.prototype._displayMoves = function( surface ) {
  if( this.count < CharacterSelectState._APPEAR_SPAN )
    return ;
  var moveLines = CharacterSelectState._MOVE_LINES[ this.index ] ;
  var boxWidth = 300 ;
  var boxLeft = this.index == 0 ? this.getWidth( ) - boxWidth - 20 : 20 ;
  // the box slides up again every time the pick changes
  var boxTime = __easeOut( __animTime( this.infoCount, 0, 16 ) ) ;
  var boxTop = this.getHeight( ) - 180 + 40 * ( 1 - boxTime ) ;
  surface.save( ) ;
  surface.globalAlpha = 0.7 * boxTime ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  surface.fillRect( boxLeft, boxTop, boxWidth, 130 ) ;
  surface.globalAlpha = boxTime ;
  surface.textAlign = 'left' ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.font = 'bold 18px Arial' ;
  surface.fillText( moveLines[ 0 ], boxLeft + 12, boxTop + 26 ) ;
  surface.font = '14px Arial' ;
  for( var i = 1; i < moveLines.length; i++ ) {
    surface.fillStyle = i == moveLines.length - 1 ? 'rgb( 255, 220, 140 )' : 'rgb( 230, 230, 230 )' ;
    surface.fillText( moveLines[ i ], boxLeft + 12, boxTop + 30 + i * 22 ) ;
  }
  surface.restore( ) ;
} ;


CharacterSelectState.prototype._displayCharacters = function( surface ) {
  // the one not picked goes behind
  if( this.index == 0 ) {
    this._displayStand( surface, 1 ) ;
    this._displayStand( surface, 0 ) ;
  } else {
    this._displayStand( surface, 0 ) ;
    this._displayStand( surface, 1 ) ;
  }
  this._displayMoves( surface ) ;
} ;


// reimu comes from the right, marisa from the left. the picked one
// steps toward the middle and lights up, the other dims
CharacterSelectState.prototype._displayStand = function( surface, charaNum ) {
  var standWidth = this.elements[ charaNum ].width ;
  var standHeight = this.elements[ charaNum ].height ;
  var restX = charaNum == 0 ? 0 : this.getWidth( ) - standWidth ;
  var fromX = charaNum == 0 ? this.getWidth( ) : -standWidth ;
  var slideTime = __easeOut( __animTime( this.count, charaNum * 4, CharacterSelectState._SLIDE_SPAN ) ) ;
  var focus = this.focus[ charaNum ] ;
  var stepX = ( charaNum == 0 ? 1 : -1 ) * 16 * focus ;
  var standX = fromX + ( restX - fromX ) * slideTime + stepX ;
  var standScale = 0.96 + 0.04 * focus ;
  if( this.confirmCount > 0 && charaNum == this.index )
    standScale += 0.05 * __easeOut( this.confirmCount / 14 ) ;

  surface.save( ) ;
  surface.globalAlpha = slideTime * ( 0.45 + 0.55 * focus ) ;
  surface.translate( standX + standWidth / 2, standHeight ) ;
  surface.scale( standScale, standScale ) ;
  surface.drawImage( this.game.getImage( charaNum == 0 ? Game._IMG_STAND_REIMU : Game._IMG_STAND_MARISA ),
                     -standWidth / 2,
                     -standHeight ) ;
  surface.restore( ) ;
} ;


CharacterSelectState.prototype.handleKeyDown = function( e ) {
  // TODO: temporal
  if( this.count < CharacterSelectState._APPEAR_SPAN || this.confirmCount > 0 )
    return ;

  // in co-op x leaves the partner, and a pick can't be changed
  if( this.game.isMultiPlay( ) ) {
    if( e.keyCode == 88 ) {
      this._soundEffect( Game._SE_CANCEL ) ;
      this.game.leaveCoop( 'You left the co-op game.' ) ;
      return ;
    }
    if( this.game.isWaitingOther( ) )
      return ;
  }

  switch( e.keyCode ) {
    case 37: // left
      this.index++ ;
      if( this.index > 1 )
        this.index = 0 ;
      this._soundEffect( Game._SE_SELECT ) ;
      this.infoCount = 0 ;
      break ;
    case 39: // right
      this.index-- ;
      if( this.index < 0 )
        this.index = 1 ;
      this._soundEffect( Game._SE_SELECT ) ;
      this.infoCount = 0 ;
      break ;
    case 88: // x
      this._soundEffect( Game._SE_CANCEL ) ;
      this.game.notifyLoadingConclusion( this.index ) ; // TODO: temporal
      break ;
    case 90: // z
      this._soundEffect( Game._SE_OK ) ;
      if( this.game.isMultiPlay( ) )
        this.game.notifyCharacterSelectConclusion( this.index ) ;
      else
        this.confirmCount = 1 ;
      break ;
  } ;
} ;


CharacterSelectState.prototype.handleKeyUp = function( e ) {

} ;
