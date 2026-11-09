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
  this.showPractice = false ;
  this.practiceIndex = 0 ;
}
__inherit( TitleState, OpeningAbstractState ) ;

TitleState._MENU = [ 'Start', 'Practice', 'Replay', 'Options', 'Controls' ] ;

// key in game.options, label, lowest, highest
TitleState._OPTIONS = [
  [ 'music', 'Music volume', 0, 10 ],
  [ 'sound', 'Sound volume', 0, 10 ],
  [ 'lives', 'Starting lives', 0, 8 ],
  [ 'bombs', 'Starting bombs', 0, 8 ],
  [ 'shake', 'Screen shake', 0, 1 ],
  [ 'quality', 'Quality', 0, 1 ]
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

TitleState._MENU_TOP = 270 ;
TitleState._MENU_GAP = 36 ;
TitleState._PANEL_SPAN = 14 ;

TitleState._STATE_DISPLAYING = 0x0 ;
TitleState._STATE_DISPLAYED  = 0x1 ;


TitleState.prototype.init = function( ) {
  this.count = 0 ;
  this.index = 0 ;
  this.showControls = false ;
  this.showOptions = false ;
  this.optionIndex = 0 ;
  this.showPractice = false ;
  this.practiceIndex = 0 ;
  this.state = TitleState._STATE_DISPLAYING ;
  this.barY = TitleState._MENU_TOP ;
  this.itemShifts = [ ] ;
  for( var i = 0; i < TitleState._MENU.length; i++ )
    this.itemShifts[ i ] = 0 ;
  this.sparkles = [ ] ;
  this.panelCount = 0 ;
  this.panelRowY = 0 ;
  this.soundBGM( Game._BGM_TITLE ) ;
} ;


TitleState.prototype.runStep = function( ) {
  if( this.state == TitleState._STATE_DISPLAYING &&
      this.count >= TitleState._GLOBALALPHA_SPAN * 2 )
    this.state = TitleState._STATE_DISPLAYED ;

  this.count++ ;
  this.panelCount++ ;
  this._moveMenuBar( ) ;
  this._moveSparkles( ) ;
} ;


// the highlight bar and the picked item glide instead of jumping
TitleState.prototype._moveMenuBar = function( ) {
  var targetY = TitleState._MENU_TOP + this.index * TitleState._MENU_GAP ;
  this.barY += ( targetY - this.barY ) * 0.25 ;
  for( var i = 0; i < TitleState._MENU.length; i++ ) {
    var targetShift = i == this.index ? 12 : 0 ;
    this.itemShifts[ i ] += ( targetShift - this.itemShifts[ i ] ) * 0.25 ;
  }
  var panelTargetY = this._getPanelRowY( ) ;
  this.panelRowY += ( panelTargetY - this.panelRowY ) * 0.3 ;
} ;


TitleState.prototype._moveSparkles = function( ) {
  if( this.count > TitleState._GLOBALALPHA_SPAN && Math.random( ) < 0.15 ) {
    this.sparkles.push( { 'x': Math.random( ) * this.opening.getWidth( ),
                          'y': this.opening.getHeight( ) - 50,
                          'speed': 0.4 + Math.random( ) * 0.8,
                          'size': 1 + Math.random( ) * 2,
                          'phase': Math.random( ) * Math.PI * 2,
                          'life': 0 } ) ;
  }
  for( var i = this.sparkles.length - 1; i >= 0; i-- ) {
    var sparkle = this.sparkles[ i ] ;
    sparkle.life++ ;
    sparkle.y -= sparkle.speed ;
    sparkle.x += Math.sin( sparkle.phase + sparkle.life / 30 ) * 0.3 ;
    if( sparkle.y < 50 )
      this.sparkles.splice( i, 1 ) ;
  }
} ;


TitleState.prototype.updateDisplay = function( surface ) {
  this._displayBG( surface ) ;
  this._displayImage( surface ) ;
  this._displaySparkles( surface ) ;
  this._displayMessage( surface ) ;
  this._displayPressKey( surface ) ;
  this._displayControls( surface ) ;
  this._displayOptions( surface ) ;
  this._displayPractice( surface ) ;
} ;


// the dark panel behind practice/options/controls, it pops open
TitleState.prototype._openPanel = function( surface ) {
  var width = this.opening.getWidth( ) ;
  var height = this.opening.getHeight( ) ;
  var openTime = __animTime( this.panelCount, 0, TitleState._PANEL_SPAN ) ;
  this.panelAlpha = __easeOut( openTime ) ;
  surface.globalAlpha = 0.85 * this.panelAlpha ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  surface.fillRect( 0, 0, width, height ) ;
  var panelScale = 0.9 + 0.1 * __easeBack( openTime ) ;
  surface.translate( width / 2, height / 2 ) ;
  surface.scale( panelScale, panelScale ) ;
  surface.translate( -width / 2, -height / 2 ) ;
  surface.globalAlpha = this.panelAlpha ;
} ;


TitleState.prototype._showPanel = function( ) {
  this.panelCount = 0 ;
  this.panelRowY = this._getPanelRowY( ) ;
} ;


TitleState.prototype._getPanelRowY = function( ) {
  if( this.showOptions )
    return 180 + this.optionIndex * 36 ;
  if( this.showPractice ) {
    var listSize = this._getPracticeList( ).length ;
    var firstRow = Math.max( 0, Math.min( this.practiceIndex - 4, listSize - 9 ) ) ;
    return 150 + ( this.practiceIndex - firstRow ) * 30 ;
  }
  return 0 ;
} ;


// a soft bar behind the picked row of a panel
TitleState.prototype._drawPanelBar = function( surface, barWidth, barHeight ) {
  var width = this.opening.getWidth( ) ;
  var barGradient = surface.createLinearGradient( width / 2 - barWidth / 2, 0, width / 2 + barWidth / 2, 0 ) ;
  barGradient.addColorStop( 0, 'rgba( 220, 60, 80, 0 )' ) ;
  barGradient.addColorStop( 0.5, 'rgba( 220, 60, 80, 0.45 )' ) ;
  barGradient.addColorStop( 1, 'rgba( 220, 60, 80, 0 )' ) ;
  surface.save( ) ;
  surface.fillStyle = barGradient ;
  surface.fillRect( width / 2 - barWidth / 2, this.panelRowY - barHeight / 2, barWidth, barHeight ) ;
  surface.restore( ) ;
} ;


// every stage, then every spell card of every boss
TitleState.prototype._getPracticeList = function( ) {
  var practiceList = [ ] ;
  for( var stageNum = 0; stageNum < __bossesParams.length; stageNum++ ) {
    practiceList.push( { 'label': 'Stage ' + ( stageNum + 1 ),
                         'stage': stageNum, 'boss': 0, 'phase': 0 } ) ;
  }
  for( var spellStage = 0; spellStage < __bossesParams.length; spellStage++ ) {
    var bosses = __bossesParams[ spellStage ] ;
    for( var bossNum = 0; bossNum < bosses.length; bossNum++ ) {
      var phases = bosses[ bossNum ].params ;
      for( var phaseNum = 0; phaseNum < phases.length; phaseNum++ ) {
        if( ! phases[ phaseNum ].spellCard )
          continue ;
        practiceList.push( { 'label': 'Stage ' + ( spellStage + 1 ) + ': ' + phases[ phaseNum ].spellCard,
                             'stage': spellStage, 'boss': bossNum + 1, 'phase': phaseNum, 'spell': true } ) ;
      }
    }
  }
  return practiceList ;
} ;


TitleState.prototype._displayPractice = function( surface ) {
  if( ! this.showPractice )
    return ;

  var width = this.opening.getWidth( ) ;
  var height = this.opening.getHeight( ) ;
  var practiceList = this._getPracticeList( ) ;
  surface.save( ) ;
  this._openPanel( surface ) ;
  this._drawPanelBar( surface, 520, 28 ) ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.textBaseline = 'middle' ;

  surface.font = "28px 'Comic Sans MS'" ;
  surface.textAlign = 'center' ;
  surface.fillText( 'Practice', width / 2, 90 ) ;
  surface.fillRect( width / 2 - 160, 115, 320, 1 ) ;

  // only part of the list fits, so it scrolls with the cursor
  var shownRows = 9 ;
  var firstRow = Math.max( 0, Math.min( this.practiceIndex - 4, practiceList.length - shownRows ) ) ;
  surface.font = "18px 'Comic Sans MS'" ;
  for( var i = firstRow; i < practiceList.length && i < firstRow + shownRows; i++ ) {
    surface.globalAlpha = ( ( i == this.practiceIndex ) ? 1.0 : 0.4 ) * this.panelAlpha ;
    surface.fillText( practiceList[ i ].label, width / 2, 150 + ( i - firstRow ) * 30 ) ;
  }
  surface.globalAlpha = 0.6 * this.panelAlpha ;
  if( firstRow > 0 )
    surface.fillText( '...', width / 2, 128 ) ;
  if( firstRow + shownRows < practiceList.length )
    surface.fillText( '...', width / 2, 150 + shownRows * 30 - 8 ) ;

  surface.font = "16px 'Comic Sans MS'" ;
  surface.globalAlpha = 0.6 * this.panelAlpha ;
  surface.fillText( 'Z to play, X to go back', width / 2, height - 45 ) ;
  surface.restore( ) ;
} ;


TitleState.prototype._handlePracticeKey = function( e ) {
  var practiceList = this._getPracticeList( ) ;
  switch( e.keyCode ) {
    case 38: // up
      this.practiceIndex = ( this.practiceIndex + practiceList.length - 1 ) % practiceList.length ;
      this.soundEffect( Game._SE_SELECT ) ;
      break ;
    case 40: // down
      this.practiceIndex = ( this.practiceIndex + 1 ) % practiceList.length ;
      this.soundEffect( Game._SE_SELECT ) ;
      break ;
    case 88: // x
      this.soundEffect( Game._SE_CANCEL ) ;
      this.showPractice = false ;
      break ;
    case 90: // z
      this.soundEffect( Game._SE_OK ) ;
      this.showPractice = false ;
      this.opening.game.pendingPractice = practiceList[ this.practiceIndex ] ;
      this.opening.notifyTitleConclusion( ) ;
      break ;
  }
} ;


TitleState.prototype._displayOptions = function( surface ) {
  if( ! this.showOptions )
    return ;

  var width = this.opening.getWidth( ) ;
  var height = this.opening.getHeight( ) ;
  var options = this.opening.game.options ;
  surface.save( ) ;
  this._openPanel( surface ) ;
  this._drawPanelBar( surface, 460, 34 ) ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.textBaseline = 'middle' ;

  surface.font = "28px 'Comic Sans MS'" ;
  surface.textAlign = 'center' ;
  surface.fillText( 'Options', width / 2, 110 ) ;
  surface.fillRect( width / 2 - 160, 135, 320, 1 ) ;

  surface.font = "20px 'Comic Sans MS'" ;
  for( var i = 0; i <= TitleState._OPTIONS.length; i++ ) {
    var lineY = 180 + i * 36 ;
    surface.globalAlpha = ( ( i == this.optionIndex ) ? 1.0 : 0.4 ) * this.panelAlpha ;
    if( i == TitleState._OPTIONS.length ) {
      surface.textAlign = 'center' ;
      surface.fillText( 'Back', width / 2, lineY ) ;
      continue ;
    }
    var row = TitleState._OPTIONS[ i ] ;
    surface.textAlign = 'right' ;
    surface.fillText( row[ 1 ], width / 2 + 20, lineY ) ;
    surface.textAlign = 'left' ;
    var valueText = options[ row[ 0 ] ] ;
    if( row[ 0 ] == 'shake' )
      valueText = options.shake ? 'On' : 'Off' ;
    else if( row[ 0 ] == 'quality' )
      valueText = options.quality ? 'High' : 'Low' ;
    surface.fillText( '<  ' + valueText + '  >', width / 2 + 50, lineY ) ;
  }

  surface.font = "16px 'Comic Sans MS'" ;
  surface.textAlign = 'center' ;
  surface.globalAlpha = 0.6 * this.panelAlpha ;
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
      game.applyQuality( ) ;
      this.soundEffect( Game._SE_SELECT ) ;
      break ;
    case 88: // x
      this.soundEffect( Game._SE_CANCEL ) ;
      this.showOptions = false ;
      break ;
    case 90: // z
      if( this.optionIndex >= TitleState._OPTIONS.length ) {
        this.soundEffect( Game._SE_OK ) ;
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
  this._openPanel( surface ) ;
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
  surface.globalAlpha = 0.6 * this.panelAlpha ;
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
  var width = this.opening.getWidth( ) ;
  var height = this.opening.getHeight( ) ;
  surface.save( ) ;
  surface.globalAlpha = __easeInOut( this.count / TitleState._GLOBALALPHA_SPAN ) ;

  // the picture slowly drifts and breathes
  var zoom = 1.04 + 0.02 * Math.sin( this.count / 240 ) ;
  var driftX = 6 * Math.sin( this.count / 400 ) ;
  var driftY = 3 * Math.sin( this.count / 330 ) ;
  surface.translate( width / 2 + driftX, height / 2 + driftY ) ;
  surface.scale( zoom, zoom ) ;
  surface.drawImage( this.getImage( Game._IMG_TITLE_BG ),
                     0,
                     0,
                     TitleState._WIDTH,
                     TitleState._HEIGHT,
                     -width / 2,
                     -height / 2,
                     width,
                     height ) ;
  surface.restore( ) ;
} ;


TitleState.prototype._displaySparkles = function( surface ) {
  surface.save( ) ;
  surface.fillStyle = 'rgb( 230, 90, 120 )' ;
  for( var i = 0; i < this.sparkles.length; i++ ) {
    var sparkle = this.sparkles[ i ] ;
    var fadeIn = __clamp01( sparkle.life / 30 ) ;
    var fadeOut = __clamp01( ( sparkle.y - 50 ) / 80 ) ;
    var twinkle = 0.6 + 0.4 * Math.sin( sparkle.phase + sparkle.life / 8 ) ;
    surface.globalAlpha = 0.5 * fadeIn * fadeOut * twinkle ;
    surface.beginPath( ) ;
    surface.arc( sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2 ) ;
    surface.fill( ) ;
  }
  surface.restore( ) ;
} ;


// the name drops in from above with a little bounce
TitleState.prototype._displayMessage = function( surface ) {
  var dropTime = __animTime( this.count, TitleState._GLOBALALPHA_SPAN, 36 ) ;
  if( dropTime <= 0 )
    return ;

  surface.save( ) ;
  surface.font = "bold 34px 'Comic Sans MS'" ;
  surface.textAlign = 'center' ;
  surface.textBaseline = 'middle' ;
  surface.globalAlpha = __easeOut( dropTime ) ;
  var logoY = 192 - 50 * ( 1 - __easeBack( dropTime ) ) ;
  surface.fillStyle = 'rgba( 200, 30, 40, 0.35 )' ;
  surface.fillText( 'JSTouhou', 122, logoY + 2 ) ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  surface.fillText( 'JSTouhou', 120, logoY ) ;

  var lineTime = __easeOut( __animTime( this.count, TitleState._GLOBALALPHA_SPAN + 24, 30 ) ) ;
  surface.fillStyle = 'rgb( 200, 30, 40 )' ;
  surface.fillRect( 120 - 70 * lineTime, logoY + 24, 140 * lineTime, 2 ) ;
  surface.restore( ) ;
} ;


// menu items slide in one at a time, a bar glides to the picked one
TitleState.prototype._displayPressKey = function( surface ) {
  var menuStart = TitleState._GLOBALALPHA_SPAN + 40 ;
  if( this.count < menuStart )
    return ;

  surface.save( ) ;
  // a yin-yang orb glides to the picked item, spinning
  var orbAlpha = __easeOut( __animTime( this.count, menuStart + 40, 16 ) ) ;
  if( orbAlpha > 0 )
    __drawYinYang( surface, 50, this.barY - 8, 10, this.count * 0.08, orbAlpha ) ;

  surface.font = "24px 'Comic Sans MS'" ;
  surface.textAlign = 'center' ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  for( var i = 0; i < TitleState._MENU.length; i++ ) {
    var slideTime = __animTime( this.count, menuStart + i * 8, 22 ) ;
    if( slideTime <= 0 )
      continue ;
    var slideX = -70 * ( 1 - __easeOut( slideTime ) ) ;
    surface.globalAlpha = ( this.index == i ? 1.0 : 0.25 ) * __easeOut( slideTime ) ;
    surface.fillText( TitleState._MENU[ i ], 120 + slideX + this.itemShifts[ i ],
                      TitleState._MENU_TOP + i * TitleState._MENU_GAP ) ;
  }

  surface.restore( ) ;
} ;


TitleState.prototype.handleKeyDown = function( e ) {
  if( this.showOptions ) {
    this._handleOptionsKey( e ) ;
    return ;
  }

  if( this.showPractice ) {
    this._handlePracticeKey( e ) ;
    return ;
  }

  if( this.showControls ) {
    if( e.keyCode == 90 || e.keyCode == 88 ) { // z, x
      this.soundEffect( Game._SE_CANCEL ) ;
      this.showControls = false ;
    }
    return ;
  }

  switch( e.keyCode ) {
    case 90: // z
      this.soundEffect( Game._SE_OK ) ;
      if( this.state == TitleState._STATE_DISPLAYED ) {
        if( this.index == 0 ) {
          this.opening.game.pendingPractice = null ;
          this.opening.notifyTitleConclusion( ) ;
        } else if( this.index == 1 ) {
          this.showPractice = true ;
          this.practiceIndex = 0 ;
          this._showPanel( ) ;
        } else if( this.index == 2 )
          this.opening.notifyReplaySelectBegin( ) ;
        else if( this.index == 3 ) {
          this.showOptions = true ;
          this.optionIndex = 0 ;
          this._showPanel( ) ;
        } else {
          this.showControls = true ;
          this._showPanel( ) ;
        }
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


