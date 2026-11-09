function OpeningState( game ) {
  this.parent = GameState ;
  this.parent.call( this, game ) ;

  this.initialized = false ;

  this.state = OpeningState._STATE_LOGO ;
  this.states = [ ] ;
  this.states[ OpeningState._STATE_LOGO ]  = new LogoState( this ) ;
  this.states[ OpeningState._STATE_TITLE ] = new TitleState( this ) ;
}
__inherit( OpeningState, GameState ) ;

OpeningState._STATE_LOGO  = 0x0 ;
OpeningState._STATE_TITLE = 0x1 ;


OpeningState.prototype.init = function( ) {
  if( this.initialized )
    this.notifyLogoConclusion( ) ;
  this.initialized = true ;
} ;


OpeningState.prototype.runStep = function( ) {
  this.states[ this.state ].runStep( ) ;
} ;


OpeningState.prototype.updateDisplay = function( surface ) {
  this.game.clear( surface ) ;
  this.states[ this.state ].updateDisplay( surface ) ;
} ;


OpeningState.prototype.handleKeyDown = function( e ) {
  this.states[ this.state ].handleKeyDown( e ) ;
} ;


OpeningState.prototype.handleKeyUp = function( e ) {
} ;


OpeningState.prototype.notifyLogoConclusion = function( ) {
  this.state = OpeningState._STATE_TITLE ;
  this.states[ this.state ].init( ) ;
} ;


OpeningState.prototype.notifyTitleConclusion = function() {
  if(! this.isMultiPlay() || this.isConnected()) {
    this.game.notifyOpeningConclusion();
  } else {
    // TODO: temporal
    window.alert('connect to begin the game.');
  }
};


OpeningState.prototype.notifyReplaySelectBegin = function() {
  if(this.isMultiPlay()) {
    // TODO: temporal
    window.alert('cannot choose replay for multi play.');
  } else {
    this.game.notifyReplaySelectBegin();
  }
};


OpeningState.prototype.getImage = function( key ) {
  return this.game.getImage( key ) ;
} ;


OpeningState.prototype.soundEffect = function( key ) {
  this.game.soundEffect( key ) ;
} ;


OpeningState.prototype.soundBGM = function( key ) {
  this.game.soundBGM( key ) ;
} ;



OpeningAbstractState = function( opening ) {
  this.opening = opening ;
}


OpeningAbstractState.prototype.init = function( ) {
} ;


OpeningAbstractState.prototype.runStep = function( ) {
} ;


OpeningAbstractState.prototype.handleKeyDown = function( e ) {
} ;


OpeningAbstractState.prototype.updateDisplay = function( surface ) {
} ;


OpeningAbstractState.prototype.getImage = function( key ) {
  return this.opening.getImage( key ) ;
} ;


OpeningAbstractState.prototype.soundEffect = function( key ) {
  this.opening.soundEffect( key ) ;
} ;


OpeningAbstractState.prototype.soundBGM = function( key ) {
  this.opening.soundBGM( key ) ;
} ;



LogoState = function( opening ) {
  this.parent = OpeningAbstractState ;
  this.parent.call( this, opening ) ;
  this.count = 0 ;
}
__inherit( LogoState, OpeningAbstractState ) ;

LogoState._GLOBALALPHA_SPAN = 100 ;
LogoState._DISPLAY_SPAN = 300 ;


LogoState.prototype.init = function( ) {
  this.count = 0 ;
} ;


LogoState.prototype.runStep = function( ) {
  this.count++ ;
  if( this.count > LogoState._DISPLAY_SPAN )
    this.opening.notifyLogoConclusion( ) ;
} ;


LogoState.prototype.handleKeyDown = function( e ) {
  switch( e.keyCode ) {
    case 90: // z
      this.opening.notifyLogoConclusion( ) ;
      break ;
  } ;
} ;


LogoState.prototype.updateDisplay = function( surface ) {
  this._displayBG( surface ) ;
  this._displayMessage( surface ) ;
} ;


LogoState.prototype._displayBG = function( surface ) {
  surface.save( ) ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  surface.fillRect( 0, 0, this.opening.getWidth( ), this.opening.getHeight( ) ) ;
  surface.restore( ) ;
} ;


LogoState.prototype._displayMessage = function( surface ) {
  surface.save( ) ;

  if( this.count < LogoState._GLOBALALPHA_SPAN )
    surface.globalAlpha = this.count / LogoState._GLOBALALPHA_SPAN ;
  else if( this.count > LogoState._DISPLAY_SPAN - LogoState._GLOBALALPHA_SPAN )
    surface.globalAlpha = ( LogoState._DISPLAY_SPAN - this.count ) / LogoState._GLOBALALPHA_SPAN ;
  else
    surface.globalAlpha = 1.0 ;

  surface.font = "30px 'Comic Sans MS'" ;
  surface.textAlign = 'center' ;
  surface.textBaseAlign = 'middle' ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.fillText( 'This is a fan STG of Toho-Project', this.opening.getWidth( ) / 2, 200 ) ;
  surface.fillText( 'Presented by @superhoge', this.opening.getWidth( ) / 2, 300 ) ;

  surface.restore( ) ;
} ;



TitleState = function( opening ) {
  this.parent = OpeningAbstractState ;
  this.parent.call( this, opening ) ;
  this.count = 0 ;
  this.state = 0 ;
  this.index = 0 ;
  this.showControls = false ;
  this.showOptions = false ;
  this.optionIndex = 0 ;
}
__inherit( TitleState, OpeningAbstractState ) ;

TitleState._MENU = [ 'Start', 'Replay', 'Options', 'Controls' ] ;

// key in game.options, label, lowest, highest
TitleState._OPTIONS = [
  [ 'music', 'Music volume', 0, 10 ],
  [ 'sound', 'Sound volume', 0, 10 ],
  [ 'lives', 'Starting lives', 0, 8 ],
  [ 'bombs', 'Starting bombs', 0, 8 ]
] ;

TitleState._CONTROLS = [
  [ 'Cursor key', 'move / character select' ],
  [ 'Z', 'shot / ok' ],
  [ 'X', 'bomb / cancel' ],
  [ 'Shift', 'slow' ],
  [ 'Space', 'character change (for debug)' ],
  [ 'Y', 'viewpoint change' ]
] ;

TitleState._WIDTH = 1280 ;
TitleState._HEIGHT = 960 ;

TitleState._GLOBALALPHA_SPAN = 100 ;

TitleState._STATE_DISPLAYING = 0x0 ;
TitleState._STATE_DISPLAYED  = 0x1 ;


TitleState.prototype.init = function( ) {
  this.count = 0 ;
  this.index = 0 ;
  this.showControls = false ;
  this.showOptions = false ;
  this.optionIndex = 0 ;
  this.state = TitleState._STATE_DISPLAYING ;
  this.soundBGM( Game._BGM_TITLE ) ;
} ;


TitleState.prototype.runStep = function( ) {
  if( this.state == TitleState._STATE_DISPLAYING &&
      this.count >= TitleState._GLOBALALPHA_SPAN * 2 )
    this.state = TitleState._STATE_DISPLAYED ;

  this.count++ ;
} ;


TitleState.prototype.updateDisplay = function( surface ) {
  this._displayBG( surface ) ;
  this._displayImage( surface ) ;
  this._displayMessage( surface ) ;
  this._displayPressKey( surface ) ;
  this._displayControls( surface ) ;
  this._displayOptions( surface ) ;
} ;


TitleState.prototype._displayOptions = function( surface ) {
  if( ! this.showOptions )
    return ;

  var width = this.opening.getWidth( ) ;
  var height = this.opening.getHeight( ) ;
  var options = this.opening.game.options ;
  surface.save( ) ;
  surface.globalAlpha = 0.85 ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  surface.fillRect( 0, 0, width, height ) ;
  surface.globalAlpha = 1.0 ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.textBaseline = 'middle' ;

  surface.font = "28px 'Comic Sans MS'" ;
  surface.textAlign = 'center' ;
  surface.fillText( 'Options', width / 2, 110 ) ;
  surface.fillRect( width / 2 - 160, 135, 320, 1 ) ;

  surface.font = "20px 'Comic Sans MS'" ;
  for( var i = 0; i <= TitleState._OPTIONS.length; i++ ) {
    var lineY = 190 + i * 44 ;
    surface.globalAlpha = ( i == this.optionIndex ) ? 1.0 : 0.4 ;
    if( i == TitleState._OPTIONS.length ) {
      surface.textAlign = 'center' ;
      surface.fillText( 'Back', width / 2, lineY ) ;
      continue ;
    }
    var row = TitleState._OPTIONS[ i ] ;
    surface.textAlign = 'right' ;
    surface.fillText( row[ 1 ], width / 2 + 20, lineY ) ;
    surface.textAlign = 'left' ;
    surface.fillText( '<  ' + options[ row[ 0 ] ] + '  >', width / 2 + 50, lineY ) ;
  }

  surface.font = "16px 'Comic Sans MS'" ;
  surface.textAlign = 'center' ;
  surface.globalAlpha = 0.6 ;
  surface.fillText( 'Left and right change a setting, X goes back', width / 2, height - 45 ) ;
  surface.restore( ) ;
} ;


TitleState.prototype._handleOptionsKey = function( e ) {
  var game = this.opening.game ;
  var rowNum = TitleState._OPTIONS.length + 1 ;
  switch( e.keyCode ) {
    case 38: // up
      this.optionIndex = ( this.optionIndex + rowNum - 1 ) % rowNum ;
      this.soundEffect( Game._SE_SELECT ) ;
      break ;
    case 40: // down
      this.optionIndex = ( this.optionIndex + 1 ) % rowNum ;
      this.soundEffect( Game._SE_SELECT ) ;
      break ;
    case 37: // left
    case 39: // right
      if( this.optionIndex >= TitleState._OPTIONS.length )
        break ;
      var row = TitleState._OPTIONS[ this.optionIndex ] ;
      var newValue = game.options[ row[ 0 ] ] + ( e.keyCode == 39 ? 1 : -1 ) ;
      game.options[ row[ 0 ] ] = Math.max( row[ 2 ], Math.min( row[ 3 ], newValue ) ) ;
      game.saveOptions( ) ;
      game.applyMusicVolume( ) ;
      this.soundEffect( Game._SE_SELECT ) ;
      break ;
    case 88: // x
      this.soundEffect( Game._SE_SELECT ) ;
      this.showOptions = false ;
      break ;
    case 90: // z
      if( this.optionIndex >= TitleState._OPTIONS.length ) {
        this.soundEffect( Game._SE_SELECT ) ;
        this.showOptions = false ;
      }
      break ;
  }
} ;


TitleState.prototype._displayControls = function( surface ) {
  if( ! this.showControls )
    return ;

  var width = this.opening.getWidth( ) ;
  var height = this.opening.getHeight( ) ;
  surface.save( ) ;
  surface.globalAlpha = 0.85 ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  surface.fillRect( 0, 0, width, height ) ;
  surface.globalAlpha = 1.0 ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.textBaseline = 'middle' ;

  surface.font = "28px 'Comic Sans MS'" ;
  surface.textAlign = 'center' ;
  surface.fillText( 'Controls', width / 2, 110 ) ;
  surface.fillRect( width / 2 - 160, 135, 320, 1 ) ;

  surface.font = "20px 'Comic Sans MS'" ;
  for( var i = 0; i < TitleState._CONTROLS.length; i++ ) {
    var lineY = 180 + i * 38 ;
    surface.textAlign = 'right' ;
    surface.fillText( TitleState._CONTROLS[ i ][ 0 ], width / 2 - 30, lineY ) ;
    surface.textAlign = 'left' ;
    surface.fillText( TitleState._CONTROLS[ i ][ 1 ], width / 2 - 10, lineY ) ;
  }

  surface.font = "16px 'Comic Sans MS'" ;
  surface.textAlign = 'center' ;
  surface.globalAlpha = 0.6 ;
  surface.fillText( 'Press Z or X to go back', width / 2, height - 80 ) ;
  surface.restore( ) ;
} ;


TitleState.prototype._displayBG = function( surface ) {
  surface.save( ) ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  surface.fillRect( 0, 0, this.opening.getWidth( ), this.opening.getHeight( ) ) ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.fillRect( 0, 50, this.opening.getWidth( ), this.opening.getHeight( ) - 100 ) ;
  surface.restore( ) ;
} ;


TitleState.prototype._displayImage = function( surface ) {
  surface.save( ) ;

  if( this.count < TitleState._GLOBALALPHA_SPAN )
    surface.globalAlpha = this.count / TitleState._GLOBALALPHA_SPAN ;
  else
    surface.globalAlpha = 1.0 ;

  surface.drawImage( this.getImage( Game._IMG_TITLE_BG ),
                     0,                 
                     0,
                     TitleState._WIDTH,
                     TitleState._HEIGHT,
                     0,
                     0,
                     this.opening.getWidth( ),
                     this.opening.getHeight( ) ) ;
  surface.restore( ) ;
} ;


TitleState.prototype._displayMessage = function( surface ) {
  if( this.count < TitleState._GLOBALALPHA_SPAN )
    return ;

  surface.save( ) ;
  surface.font = "24px 'Comic Sans MS'" ;
  surface.textAlign = 'center' ;
  surface.textBaseAlign = 'middle' ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;

  if( this.count - TitleState._GLOBALALPHA_SPAN < TitleState._GLOBALALPHA_SPAN )
    surface.globalAlpha = ( this.count - TitleState._GLOBALALPHA_SPAN ) / TitleState._GLOBALALPHA_SPAN ;
  else
    surface.globalAlpha = 1.0 ;

  surface.fillText( 'JSTouhou', 120, 200 ) ;
  surface.restore( ) ;
} ;


TitleState.prototype._displayPressKey = function( surface ) {
  if( this.count < TitleState._GLOBALALPHA_SPAN * 2 )
    return ;

  surface.save( ) ;
  surface.font = "24px 'Comic Sans MS'" ;
  surface.textAlign = 'center' ;
  surface.textBaseAlign = 'middle' ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;

  for( var i = 0; i < TitleState._MENU.length; i++ ) {
    if( this.index == i )
      surface.globalAlpha = 1.0 ;
    else
      surface.globalAlpha = 0.2 ;
    surface.fillText( TitleState._MENU[ i ], 120, 300 + i * 40 ) ;
  }

  surface.restore( ) ;
} ;


TitleState.prototype.handleKeyDown = function( e ) {
  if( this.showOptions ) {
    this._handleOptionsKey( e ) ;
    return ;
  }

  if( this.showControls ) {
    if( e.keyCode == 90 || e.keyCode == 88 ) { // z, x
      this.soundEffect( Game._SE_SELECT ) ;
      this.showControls = false ;
    }
    return ;
  }

  switch( e.keyCode ) {
    case 90: // z
      this.soundEffect( Game._SE_SELECT ) ;
      if( this.state == TitleState._STATE_DISPLAYED ) {
        if( this.index == 0 )
          this.opening.notifyTitleConclusion( ) ;
        else if( this.index == 1 )
          this.opening.notifyReplaySelectBegin( ) ;
        else if( this.index == 2 ) {
          this.showOptions = true ;
          this.optionIndex = 0 ;
        } else
          this.showControls = true ;
      } else {
        this.state = TitleState._STATE_DISPLAYED ;
        this.count = TitleState._GLOBALALPHA_SPAN * 2 ; // TODO: temporal
      }
      break ;
    case 38: // up
      if( this.state == TitleState._STATE_DISPLAYED ) {
        this.soundEffect( Game._SE_SELECT ) ;
        this.index = ( this.index + TitleState._MENU.length - 1 ) % TitleState._MENU.length ;
      }
      break ;
    case 40: // down
      if( this.state == TitleState._STATE_DISPLAYED ) {
        this.soundEffect( Game._SE_SELECT ) ;
        this.index = ( this.index + 1 ) % TitleState._MENU.length ;
      }
      break ;
    case 32: // space
      break ;
  } ;
} ;


