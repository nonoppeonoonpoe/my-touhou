function PostReplayState( game ) {
  this.parent = GameState ;
  this.parent.call( this, game ) ;
  this.count = 0 ;
  this.index = 0 ;
}
__inherit( PostReplayState, GameState ) ;

PostReplayState._STATE_SELECT               = 0x0 ;
PostReplayState._STATE_REPLAY_POSTING       = 0x1 ;
PostReplayState._STATE_REPLAY_POSTING_ERROR = 0x2 ;

PostReplayState._DIR = 'http://gachapin.jp/stg/' ;


PostReplayState.prototype.init = function( ) {
  this.count = 0 ;
  this.index = 0 ;
  this.state = PostReplayState._STATE_SELECT ;
} ;


// the old replay server is gone, replays are kept in the browser now
PostReplayState.prototype._postReplay = function( ) {
  var stage = this.game.states[ Game._STATE_IN_STAGE ] ;
  this.saved = this.game.saveReplay( stage.exportLocalReplay( ) ) ;
  this.state = this.saved ? PostReplayState._STATE_REPLAY_POSTING : PostReplayState._STATE_REPLAY_POSTING_ERROR ;
  this.doneCount = this.count ;
} ;


PostReplayState.prototype._encode = function( data ) {
  var params = [];

  for( var name in data ) {
    var value = data[ name ];
    var param = encodeURIComponent( name ).replace( /%20/g, '+' )
        + '=' + encodeURIComponent( value ).replace( /%20/g, '+' );

    params.push( param );
  }

  return params.join( '&' );
} ;


PostReplayState.prototype.runStep = function( ) {
  this.count++ ;
  var barTarget = this.index == 0 ? 200 : 250 ;
  this.barY = this.count <= 1 ? barTarget : this.barY + ( barTarget - this.barY ) * 0.3 ;
  // show saved (or the error) for a moment, then back to the title
  if( this.state != PostReplayState._STATE_SELECT && this.count - this.doneCount > 60 )
    this.game.notifyQuitStage( ) ;
} ;


PostReplayState.prototype.updateDisplay = function( surface ) {
  this.game.clear( surface ) ;
  this._displayBG( surface ) ;
  this._displayMessage( surface ) ;
  if( this.state == PostReplayState._STATE_SELECT )
    this._displayQuestion( surface ) ;
} ;


/**
 * TODO: temporal
 */
PostReplayState.prototype._displayBG = function( surface ) {
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


PostReplayState.prototype._displayMessage = function( surface ) {
  surface.save( ) ;
  surface.font = "30px 'Comic Sans MS'" ;
  surface.textAlign = 'center' ;
  surface.textBaseAlign = 'middle' ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.fillText( 'Replay', this.getWidth( ) / 2, 35 ) ;

  // the answer pops in
  if( this.state != PostReplayState._STATE_SELECT ) {
    var popScale = 0.3 + 0.7 * __easeBack( ( this.count - this.doneCount ) / 14 ) ;
    surface.translate( this.getWidth( ) / 2, this.getHeight( ) / 2 ) ;
    surface.scale( popScale, popScale ) ;
    surface.fillText( this.state == PostReplayState._STATE_REPLAY_POSTING ? 'Saved' : 'Could not save it', 0, 0 ) ;
  }

  surface.restore( ) ;

} ;


PostReplayState.prototype._displayQuestion = function( surface ) {
  surface.save( ) ;
  surface.font = "30px 'Comic Sans MS'" ;
  surface.textAlign = 'center' ;
  surface.textBaseAlign = 'middle' ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  var askTime = __easeOut( __animTime( this.count, 0, 18 ) ) ;
  surface.globalAlpha = askTime ;
  surface.fillText( 'Will you save your replay?', this.getWidth( ) / 2, 100 - 20 * ( 1 - askTime ) ) ;

  var barGradient = surface.createLinearGradient( this.getWidth( ) / 2 - 120, 0, this.getWidth( ) / 2 + 120, 0 ) ;
  barGradient.addColorStop( 0, 'rgba( 220, 60, 80, 0 )' ) ;
  barGradient.addColorStop( 0.5, 'rgba( 220, 60, 80, 0.5 )' ) ;
  barGradient.addColorStop( 1, 'rgba( 220, 60, 80, 0 )' ) ;
  surface.globalAlpha = __easeOut( __animTime( this.count, 10, 14 ) ) ;
  surface.fillStyle = barGradient ;
  surface.fillRect( this.getWidth( ) / 2 - 120, this.barY - 30, 240, 40 ) ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;

  var answers = [ 'Yes', 'No' ] ;
  for( var i = 0; i < answers.length; i++ ) {
    var answerTime = __easeOut( __animTime( this.count, 8 + i * 5, 16 ) ) ;
    surface.globalAlpha = ( this.index == i ? 1.0 : 0.4 ) * answerTime ;
    surface.fillText( answers[ i ], this.getWidth( ) / 2 - 40 * ( 1 - answerTime ), 200 + i * 50 ) ;
  }

  surface.restore( ) ;
} ;


PostReplayState.prototype.handleKeyDown = function( e ) {
  // a shot key still held from the run shouldn't pick for you
  if( e.repeat || this.count < 30 || this.state != PostReplayState._STATE_SELECT )
    return ;
  switch( e.keyCode ) {
    case 38: // up
    case 40: // down
      this._soundEffect( Game._SE_SELECT ) ;
      if( this.index == 0 )
        this.index = 1 ;
      else
        this.index = 0 ;
      break ;
    case 90: // z
      this._soundEffect( Game._SE_OK ) ;
      if( this.index == 0 )
        this._postReplay( ) ;
      else
        this.game.notifyQuitStage( ) ; // TODO: temporal
      break ;
  } ;
} ;


PostReplayState.prototype.handleKeyUp = function( e ) {

} ;
