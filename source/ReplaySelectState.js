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

// the old replay server is gone, the replays that came with the game are in replay/
ReplaySelectState._DIR = 'replay/' ;


ReplaySelectState.prototype.init = function( ) {
  this.count = 0 ;
  this.index = 0 ;
  this.list = [ ] ;
  this.state = ReplaySelectState._STATE_PREPARE ;
} ;


// the replay files are plain js objects (no quotes on keys), not json
ReplaySelectState.prototype._readText = function( text ) {
  return ( new Function( 'return (' + text + ') ;' ) )( ) ;
} ;


ReplaySelectState.prototype._loadFile = function( path, onLoad, errorState ) {
  var xhr = new XMLHttpRequest( ) ;
  xhr.open( 'GET', ReplaySelectState._DIR + path, true ) ;
  var self = this ;
  xhr.onload = function( ) {
    var data = null ;
    try {
      if( xhr.status == 200 || xhr.status == 0 )
        data = self._readText( xhr.responseText ) ;
    } catch( err ) {
      data = null ;
    }
    if( data )
      onLoad( data ) ;
    else
      self.state = errorState ;
  } ;
  xhr.onerror = function( ) {
    self.state = errorState ;
  } ;
  xhr.send( null ) ;
} ;


ReplaySelectState.prototype.loadReplayList = function( ) {
  var self = this ;
  // replays saved in this browser come first, then the ones that came with the game
  var savedReplays = this.game.loadSavedReplays( ) ;
  this._loadFile( 'replay_list.txt', function( list ) {
    self.list = savedReplays.concat( list ) ;
    self.state = ReplaySelectState._STATE_SELECT ;
  }, ReplaySelectState._STATE_LIST_LOADING_ERROR ) ;
  this.state = ReplaySelectState._STATE_LIST_LOADING ;
} ;


ReplaySelectState.prototype.loadReplay = function( ) {
  if( this.state != ReplaySelectState._STATE_SELECT || this.list.length == 0 )
    return ;
  var self = this ;
  if( this.list[ this.index ].eosd ) {
    this.game.notifyReplaySelectConclusion( this.list[ this.index ] ) ;
    return ;
  }
  this._loadFile( 'replay' + this.list[ this.index ].id + '.txt', function( params ) {
    self.game.notifyReplaySelectConclusion( params ) ;
  }, ReplaySelectState._STATE_REPLAY_LOADING_ERROR ) ;
  this.state = ReplaySelectState._STATE_REPLAY_LOADING ;
} ;


ReplaySelectState.prototype.runStep = function( ) {
  if( this.state == ReplaySelectState._STATE_PREPARE ) {
    this.loadReplayList( ) ;
  }
  this.count++ ;
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
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  for( var i = 0; i < this.list.length; i++ ) {
    if( i == this.index )
      surface.globalAlpha = 1.0 ;
    else
      surface.globalAlpha = 0.4 ;
    surface.fillText( this._buildReplayStrings( this.list[ i ] ), w, h + 20 * i ) ;
  }
  surface.restore( ) ;
} ;


ReplaySelectState.prototype._buildReplayStrings = function( params ) {
  var buffer = '' ;
  if( params.eosd )
    buffer += 'Saved: ' + params.score + ' ' ;
  else
    buffer += params.id + ': ' + params.user + ' ' ;
  if( params.characterIndex == 0 ) {
    buffer += 'Reimu' ;
  } else {
    buffer += 'Marisa' ;
  }
  buffer += ' ' + this._toStringsFromDate( params.datetime ) ;
  return buffer ;
} ;


ReplaySelectState.prototype._toStringsFromDate = function( s ) {
  var date = new Date( s ) ;
  return [
           date.getMonth( ) + 1,
           date.getDate( ),
           date.getFullYear( ),
         ].join( '/' ) + ' ' +
         [
           date.getHours( ),
           date.getMinutes( ),
           date.getSeconds( ),
         ].join( ':' ) ;
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
        this.index = this.list.length - 1 ;
      this._soundEffect( Game._SE_SELECT ) ;
      break ;
    case 88: // x
      this.game.notifyLoadingConclusion( ) ; // TODO: temporal
      break ;
    case 90: // z
      if( this.state != ReplaySelectState._STATE_SELECT )
        break ;
      this.loadReplay( ) ;
      this._soundEffect( Game._SE_SELECT ) ;
      break ;
  } ;
} ;


ReplaySelectState.prototype.handleKeyUp = function( e ) {

} ;
