function ReplaySelectState( game ) {
  this.parent = GameState ;
  this.parent.call( this, game ) ;
  this.count = 0 ;
  this.index = 0 ;
  this.list = [ ] ;
}
__inherit( ReplaySelectState, GameState ) ;

ReplaySelectState._STATE_PREPARE              = 0x0 ;
ReplaySelectState._STATE_LIST_LOADING         = 0x1 ;
ReplaySelectState._STATE_LIST_LOADING_ERROR   = 0x2 ;
ReplaySelectState._STATE_SELECT               = 0x3 ;
ReplaySelectState._STATE_REPLAY_LOADING       = 0x4 ;
ReplaySelectState._STATE_REPLAY_LOADING_ERROR = 0x5 ;



ReplaySelectState.prototype.init = function( ) {
  this.count = 0 ;
  this.index = 0 ;
  this.list = [ ] ;
  this.state = ReplaySelectState._STATE_PREPARE ;
} ;


// only the replays saved in this browser, the ones that came with the game are gone
ReplaySelectState.prototype.loadReplayList = function( ) {
  this.list = this.game.loadSavedReplays( ).filter( function( replay ) {
    return replay && replay.eosd ;
  } ) ;
  this.state = ReplaySelectState._STATE_SELECT ;
} ;


ReplaySelectState.prototype.loadReplay = function( ) {
  if( this.state != ReplaySelectState._STATE_SELECT || this.list.length == 0 )
    return ;
  this.game.notifyReplaySelectConclusion( this.list[ this.index ] ) ;
} ;


ReplaySelectState.prototype.runStep = function( ) {
  if( this.state == ReplaySelectState._STATE_PREPARE ) {
    this.loadReplayList( ) ;
  }
  this.count++ ;
  if( this.state == ReplaySelectState._STATE_SELECT )
    this.selectCount = ( this.selectCount || 0 ) + 1 ;
  else
    this.selectCount = 0 ;
  var barTarget = 100 + 20 * this.index ;
  this.barY = this.selectCount <= 1 ? barTarget : this.barY + ( barTarget - this.barY ) * 0.3 ;
} ;


ReplaySelectState.prototype.updateDisplay = function( surface ) {
  this.game.clear( surface ) ;
  this._displayBG( surface ) ;
  this._displayMessage( surface ) ;

  switch( this.state ) {
    case ReplaySelectState._STATE_PREPARE:
      break ;
    case ReplaySelectState._STATE_LIST_LOADING:
      break ;
    case ReplaySelectState._STATE_LIST_LOADING_ERROR:
      break ;
    case ReplaySelectState._STATE_SELECT:
      if( this.list.length == 0 )
        this._displayEmpty( surface ) ;
      else
        this._displayList( surface ) ;
      break ;
    case ReplaySelectState._STATE_REPLAY_LOADING:
      break ;
    case ReplaySelectState._STATE_REPLAY_LOADING_ERROR:
      break ;
  }

} ;


/**
 * TODO: temporal
 */
ReplaySelectState.prototype._displayBG = function( surface ) {
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

  surface.globalAlpha = 0.5 ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  surface.fillRect( 0, 0, this.getWidth( ), this.getHeight( ) ) ;

  surface.restore( ) ;
} ;


ReplaySelectState.prototype._displayMessage = function( surface ) {
  surface.save( ) ;
  surface.font = "30px 'Comic Sans MS'" ;
  surface.textAlign = 'center' ;
  surface.textBaseAlign = 'middle' ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.fillText( 'Replay Select', this.getWidth( ) / 2, 35 ) ;

  // TODO: temporal
  if( this.state == ReplaySelectState._STATE_LIST_LOADING ||
      this.state == ReplaySelectState._STATE_REPLAY_LOADING ) {
    surface.fillText( 'Loading...', this.getWidth( ) / 2, this.getHeight( ) / 2 ) ;
  }
  if( this.state == ReplaySelectState._STATE_LIST_LOADING_ERROR ||
      this.state == ReplaySelectState._STATE_REPLAY_LOADING_ERROR ) {
    surface.fillText( 'Could not load the replay', this.getWidth( ) / 2, this.getHeight( ) / 2 ) ;
  }

  surface.restore( ) ;

} ;


ReplaySelectState.prototype._displayList = function( surface ) {
  var h = 100 ;
  var w = 50 ;
  surface.save( ) ;
  surface.font = "16px 'Comic Sans MS'" ;
  surface.textAlign = 'left' ;
  surface.textBaseAlign = 'middle' ;
  // rows slide in one after another, a bar glides to the picked one
  var barGradient = surface.createLinearGradient( w - 20, 0, w + 560, 0 ) ;
  barGradient.addColorStop( 0, 'rgba( 220, 60, 80, 0.5 )' ) ;
  barGradient.addColorStop( 1, 'rgba( 220, 60, 80, 0 )' ) ;
  surface.globalAlpha = __easeOut( this.selectCount / 15 ) ;
  surface.fillStyle = barGradient ;
  surface.fillRect( w - 20, this.barY - 15, 580, 20 ) ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  for( var i = 0; i < this.list.length; i++ ) {
    var rowTime = __easeOut( __animTime( this.selectCount, i * 3, 16 ) ) ;
    surface.globalAlpha = ( i == this.index ? 1.0 : 0.4 ) * rowTime ;
    this._drawRow( surface, this.list[ i ], w - 40 * ( 1 - rowTime ) + ( i == this.index ? 6 : 0 ), h + 20 * i ) ;
  }
  surface.restore( ) ;
} ;


ReplaySelectState.prototype._displayEmpty = function( surface ) {
  surface.save( ) ;
  surface.font = "18px 'Comic Sans MS'" ;
  surface.textAlign = 'center' ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.globalAlpha = 0.7 ;
  surface.fillText( 'No saved replays yet.', this.getWidth( ) / 2, this.getHeight( ) / 2 - 15 ) ;
  surface.fillText( 'Finish a run or a practice to save one. X goes back.', this.getWidth( ) / 2, this.getHeight( ) / 2 + 15 ) ;
  surface.restore( ) ;
} ;


// what was played, the score, who, and when, each in its own column
ReplaySelectState.prototype._drawRow = function( surface, params, rowX, rowY ) {
  var whatText = params.practice ? 'Practice ' + params.practice.label : 'Full game' ;
  surface.textAlign = 'left' ;
  surface.fillText( this._fitText( surface, whatText, 250 ), rowX, rowY ) ;
  surface.textAlign = 'right' ;
  surface.fillText( params.score, rowX + 360, rowY ) ;
  surface.textAlign = 'left' ;
  surface.fillText( params.characterIndex == 0 ? 'Reimu' : 'Marisa', rowX + 375, rowY ) ;
  surface.fillText( this._toStringsFromDate( params.datetime ), rowX + 440, rowY ) ;
} ;


ReplaySelectState.prototype._fitText = function( surface, text, maxWidth ) {
  if( surface.measureText( text ).width <= maxWidth )
    return text ;
  while( text.length > 1 && surface.measureText( text + '...' ).width > maxWidth )
    text = text.slice( 0, -1 ) ;
  return text + '...' ;
} ;


ReplaySelectState.prototype._toStringsFromDate = function( s ) {
  var date = new Date( s ) ;
  var minutes = date.getMinutes( ) ;
  return ( date.getMonth( ) + 1 ) + '/' + date.getDate( ) + ' ' +
         date.getHours( ) + ':' + ( minutes < 10 ? '0' : '' ) + minutes ;
} ;


ReplaySelectState.prototype.handleKeyDown = function( e ) {
  switch( e.keyCode ) {
    case 38: // up
      this.index-- ;
      if( this.index < 0 )
        this.index = 0 ;
      this._soundEffect( Game._SE_SELECT ) ;
      break ;
    case 40: // down
      this.index++ ;
      if( this.index >= this.list.length )
        this.index = Math.max( 0, this.list.length - 1 ) ;
      this._soundEffect( Game._SE_SELECT ) ;
      break ;
    case 88: // x
      this._soundEffect( Game._SE_CANCEL ) ;
      this.game.notifyLoadingConclusion( ) ; // TODO: temporal
      break ;
    case 90: // z
      if( this.state != ReplaySelectState._STATE_SELECT )
        break ;
      this.loadReplay( ) ;
      this._soundEffect( Game._SE_OK ) ;
      break ;
  } ;
} ;


ReplaySelectState.prototype.handleKeyUp = function( e ) {

} ;
