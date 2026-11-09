function LoadingState( game ) {
  this.parent = GameState ;
  this.parent.call( this, game ) ;
  this.loadImageNum = 0 ;
  this.loadSoundNum = 0 ;
  this.loadBgmNum = 0 ;
}
__inherit( LoadingState, GameState ) ;


LoadingState.prototype.init = function( params ) {
  this._loadImages( ) ;
  this._loadSEs( ) ;
  this._loadBGMs( ) ;
} ;


LoadingState.prototype.runStep = function( ) {
  this._checkLoadCompletion( ) ;
} ;


LoadingState.prototype._checkLoadCompletion = function( ) {

  if( this.loadImageNum < this.game.images.length )
    return ;
  if( this.loadSoundNum < this.game.sounds.length )
    return ;
  if( this.loadBgmNum < this.game.bgms.length )
    return ;

  this.game.notifyLoadingConclusion( ) ;

} ;


LoadingState.prototype._loadImages = function( ) {
  var self = this ;
  for( var key in Game._IMGS ) {
    this.game.images[ key ] = new Image( ) ;
    this.game.images[ key ].src = Game._IMGS[ key ] ;
    this.game.images[ key ].onload = function( ) {
      self.loadImageNum++ ;
    } ;
  }
} ;


LoadingState.prototype._loadSEs = function( ) {
  var self = this ;
  for( var key in Game._SES ) {
    this.game.sounds[ key ] = new Audio( Game._SES[ key ] ) ;
    this.game.sounds[ key ].addEventListener( 'canplay', function( e ) {
      self.loadSoundNum++ ;
    } ) ;
    this.game.sounds[ key ].load( ) ;
  }
} ;


LoadingState.prototype._loadBGMs = function( ) {
  var self = this ;
  for( var key in Game._BGMS ) {
    this.game.bgms[ key ] = new Audio( Game._BGMS[ key ] ) ;
    this.game.bgms[ key ].addEventListener( 'loadstart', function( e ) {
      self.loadBgmNum++ ;
    } ) ;
    this.game.bgms[ key ].load( ) ;
  }
} ;



LoadingState.prototype.updateDisplay = function( surface ) {
  var width = this.game.getWidth( ) ;
  var height = this.game.getHeight( ) ;
  var loadedNum = this.loadImageNum + this.loadSoundNum + this.loadBgmNum ;
  var totalNum = this.game.images.length + this.game.sounds.length + this.game.bgms.length ;
  var loadedPart = totalNum > 0 ? loadedNum / totalNum : 0 ;
  this.shownPart = ( this.shownPart || 0 ) + ( loadedPart - ( this.shownPart || 0 ) ) * 0.2 ;
  var spinAngle = ( window.performance ? window.performance.now( ) : Date.now( ) ) / 300 ;

  surface.save( ) ;
  this.game.clear( surface ) ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  surface.fillRect( 0, 0, width, height ) ;

  __drawYinYang( surface, width / 2, height / 2 - 30, 26, spinAngle ) ;

  var barWidth = 260 ;
  var barLeft = width / 2 - barWidth / 2 ;
  var barTop = height / 2 + 24 ;
  surface.fillStyle = 'rgb( 60, 60, 60 )' ;
  surface.fillRect( barLeft, barTop, barWidth, 6 ) ;
  surface.fillStyle = 'rgb( 220, 60, 70 )' ;
  surface.fillRect( barLeft, barTop, barWidth * this.shownPart, 6 ) ;

  surface.font = "16px 'Comic Sans MS'" ;
  surface.textAlign = 'center' ;
  surface.fillStyle = 'rgb( 200, 200, 200 )' ;
  surface.fillText( 'Loading... ' + loadedNum + ' / ' + totalNum, width / 2, barTop + 32 ) ;
  surface.restore( ) ;
} ;
