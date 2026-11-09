function CharacterSelectState( game ) {
  this.parent = GameState ;
  this.parent.call( this, game ) ;
  this.elements = [ ] ;
  this.index = 0 ;
  this.count = 0 ;
}
__inherit( CharacterSelectState, GameState ) ;


CharacterSelectState._APPEAR_SPAN = 10 ;

CharacterSelectState.prototype.init = function( ) {
  this.count = 0 ;
  // TODO: magic number
  for( var i = 0; i < 2; i++ ) {
    this.elements[ i ] = { } ;
    this.elements[ i ].width = 400 ;
    this.elements[ i ].height = 600 ;
  }
  this.index = 0 ;
} ;


CharacterSelectState.prototype.runStep = function( ) {
  this.count++ ;
} ;


CharacterSelectState.prototype.updateDisplay = function( surface ) {
  this.game.clear( surface ) ;
  this._displayBG( surface ) ;
  this._displayMessage( surface ) ;
  this._displayCharacters( surface ) ;
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
  surface.fillText( 'Character Select', this.getWidth( ) / 2, 35 ) ;
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
  var boxTop = this.getHeight( ) - 180 ;
  surface.save( ) ;
  surface.globalAlpha = 0.7 ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  surface.fillRect( boxLeft, boxTop, boxWidth, 130 ) ;
  surface.globalAlpha = 1.0 ;
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
  surface.save( ) ;
  if( this.index == 0 ) {
    surface.globalAlpha = 0.6 ;
    this._displayMarisa( surface ) ;
    surface.globalAlpha = 1.0 ;
    this._displayReimu( surface ) ;
  } else {
    surface.globalAlpha = 0.6 ;
    this._displayReimu( surface ) ;
    surface.globalAlpha = 1.0 ;
    this._displayMarisa( surface ) ;
  }
  surface.restore( ) ;
  this._displayMoves( surface ) ;
} ;


CharacterSelectState.prototype._displayReimu = function( surface ) {
  surface.save( ) ;
  var target = 0 ;
  var from = this.getWidth( ) ;
  var w = from - ( from - target ) * this.count / CharacterSelectState._APPEAR_SPAN ;
  if( w < target )
    w = target ;
  surface.drawImage( this.game.getImage( Game._IMG_STAND_REIMU ),
                     w,
                     0 ) ;
  surface.restore( ) ;
} ;


CharacterSelectState.prototype._displayMarisa = function( surface ) {
  surface.save( ) ;
  var target = this.getWidth( ) - this.elements[ 1 ].width ;
  var from = -this.elements[ 1 ].width ;
  var w = from - ( from - target ) * this.count / CharacterSelectState._APPEAR_SPAN ;
  if( w > target )
    w = target ;
  surface.drawImage( this.game.getImage( Game._IMG_STAND_MARISA ),
                     w,
                     0 ) ;
  surface.restore( ) ;
} ;


CharacterSelectState.prototype.handleKeyDown = function( e ) {
  // TODO: temporal
  if( this.count < CharacterSelectState._APPEAR_SPAN )
    return ;

  switch( e.keyCode ) {
    case 37: // left
      this.index++ ;
      if( this.index > 1 )
        this.index = 0 ;
      this._soundEffect( Game._SE_SELECT ) ;
      break ;
    case 39: // right
      this.index-- ;
      if( this.index < 0 )
        this.index = 1 ;
      this._soundEffect( Game._SE_SELECT ) ;
      break ;
    case 88: // x
      this.game.notifyLoadingConclusion( this.index ) ; // TODO: temporal
      break ;
    case 90: // z
      this.game.notifyCharacterSelectConclusion( this.index ) ;
      break ;
  } ;
} ;


CharacterSelectState.prototype.handleKeyUp = function( e ) {

} ;
