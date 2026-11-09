/*
 * small effects drawn with the 2d canvas on top of the play field:
 * bursts, sparks, the death circle, score popups and the screen flash.
 * they're only for looks and never change the game.
 */
function StageFx( stage ) {
  this.stage = stage ;
  this.parts = [ ] ;
  this.flashAlpha = 0 ;
  this.darkRadius = 0 ;
  this.darkX = 0 ;
  this.darkY = 0 ;
  this.darkCount = 0 ;
  this.shakeTime = 0 ;
  this.shakeSpan = 1 ;
  this.shakePower = 0 ;
  this.shakeX = 0 ;
  this.shakeY = 0 ;
  this.bgDark = 1.0 ;
  this.barFill = 0 ;
  this.barLag = 0 ;
  this.circleAlpha = 0 ;
  this.circleSpin = 0 ;
  this.circleX = 0 ;
  this.circleY = 0 ;
  this.circleSpell = 0 ;
  this.focusAlpha = 0 ;
}

StageFx.prototype._MAX_PARTS = 400 ;


StageFx.prototype.reset = function( ) {
  this.parts.length = 0 ;
  this.flashAlpha = 0 ;
  this.darkRadius = 0 ;
  this.shakeTime = 0 ;
  this.shakeX = 0 ;
  this.shakeY = 0 ;
  this.bgDark = 1.0 ;
  this.barFill = 0 ;
  this.barLag = 0 ;
  this.circleAlpha = 0 ;
  this.focusAlpha = 0 ;
} ;


// the screen shake can be turned off in options
StageFx.prototype.shake = function( power, frames ) {
  var options = this.stage.game.options ;
  if( options && options.shake === 0 )
    return ;
  if( power < this.shakePower * this.shakeTime / this.shakeSpan )
    return ;
  this.shakePower = power ;
  this.shakeTime = frames ;
  this.shakeSpan = frames ;
} ;


// a boss going down: rings one after another and lots of sparks
StageFx.prototype.bossBurst = function( x, y ) {
  this._add( { 'kind': 'ring', 'x': x, 'y': y, 'from': 4, 'to': 140, 'life': 50, 'color': 'rgb(255, 255, 255)', 'width': 6 } ) ;
  this._add( { 'kind': 'ring', 'x': x, 'y': y, 'from': 4, 'to': 100, 'life': 40, 'color': 'rgb(255, 150, 170)', 'width': 4, 'delay': 6 } ) ;
  this._add( { 'kind': 'ring', 'x': x, 'y': y, 'from': 4, 'to': 70, 'life': 34, 'color': 'rgb(255, 230, 140)', 'width': 3, 'delay': 12 } ) ;
  this._addSparks( x, y, 40, 7, 55, 'rgb(255, 255, 230)', 3 ) ;
  this._addSparks( x, y, 20, 4, 45, 'rgb(255, 160, 190)', 2 ) ;
} ;


// bouncy words over the player, like power up
StageFx.prototype.popWords = function( x, y, text, color ) {
  this._add( { 'kind': 'pop', 'x': x, 'y': y - 30, 'text': text, 'life': 60, 'color': color } ) ;
} ;


// past the limit new parts are just skipped, moving the whole list was slow
StageFx.prototype._add = function( part ) {
  if( this.parts.length >= this._MAX_PARTS )
    return ;
  part.age = 0 ;
  this.parts.push( part ) ;
} ;


StageFx.prototype._addSparks = function( x, y, sparkNum, speed, life, color, size ) {
  for( var i = 0; i < sparkNum; i++ ) {
    var angle = Math.random( ) * Math.PI * 2 ;
    var sparkSpeed = speed * ( 0.5 + Math.random( ) * 0.7 ) ;
    this._add( { 'kind': 'spark', 'x': x, 'y': y,
                 'vx': Math.cos( angle ) * sparkSpeed, 'vy': Math.sin( angle ) * sparkSpeed,
                 'life': life, 'color': color, 'size': size } ) ;
  }
} ;


StageFx.prototype.enemyBurst = function( x, y, big ) {
  this._add( { 'kind': 'ring', 'x': x, 'y': y, 'from': 4, 'to': big ? 90 : 36,
               'life': big ? 40 : 20, 'color': 'rgb(255, 255, 255)', 'width': big ? 4 : 2 } ) ;
  this._addSparks( x, y, big ? 24 : 8, big ? 5 : 3, big ? 40 : 22, 'rgb(255, 255, 230)', 2 ) ;
} ;


StageFx.prototype.hitSpark = function( x, y ) {
  this._addSparks( x, y - 8, 1, 2, 8, 'rgb(255, 255, 255)', 1.5 ) ;
} ;


StageFx.prototype.grazeSpark = function( x, y ) {
  this._addSparks( x, y, 3, 2.5, 14, 'rgb(230, 230, 255)', 1.5 ) ;
} ;


StageFx.prototype.playerDeath = function( x, y ) {
  this._add( { 'kind': 'death', 'x': x, 'y': y, 'life': 50 } ) ;
  this._addSparks( x, y, 30, 6, 45, 'rgb(255, 200, 220)', 2.5 ) ;
} ;


StageFx.prototype.scorePopup = function( x, y, value, isMax ) {
  this._add( { 'kind': 'text', 'x': x, 'y': y, 'text': String( value ), 'life': 40,
               'color': isMax ? 'rgb(255, 240, 80)' : 'rgb(255, 255, 255)' } ) ;
} ;


// colors of the fantasy seal orbs, same order as the bomb image
StageFx.prototype._SEAL_COLORS = [ 'rgb(255, 255, 255)', 'rgb(255, 120, 120)', 'rgb(255, 130, 230)', 'rgb(180, 140, 255)',
                                   'rgb(130, 230, 255)', 'rgb(140, 255, 150)', 'rgb(255, 250, 130)', 'rgb(255, 180, 110)' ] ;

StageFx.prototype.sealBurst = function( x, y, colorNum ) {
  var sealColor = this._SEAL_COLORS[ colorNum % this._SEAL_COLORS.length ] ;
  this._add( { 'kind': 'ring', 'x': x, 'y': y, 'from': 10, 'to': 80, 'life': 30, 'color': sealColor, 'width': 6 } ) ;
  this._addSparks( x, y, 16, 5, 30, sealColor, 3 ) ;
  this.flash( 0.15 ) ;
} ;


StageFx.prototype.flash = function( strength ) {
  this.flashAlpha = Math.max( this.flashAlpha, strength ) ;
} ;


StageFx.prototype.runStep = function( ) {
  this._updateDarkness( ) ;
  this._updateShake( ) ;
  this._updateBoss( ) ;
  this._updateFocus( ) ;
  var darkTarget = ( this.stage.isFlagSet( this.stage._FLAG_BOMB ) || this.stage.spellCard ) ? 0.4 : 1.0 ;
  this.bgDark += ( darkTarget - this.bgDark ) * 0.08 ;
  if( Math.abs( darkTarget - this.bgDark ) < 0.01 )
    this.bgDark = darkTarget ;
  var aliveParts = 0 ;
  for( var i = 0; i < this.parts.length; i++ ) {
    var part = this.parts[ i ] ;
    part.age++ ;
    if( part.kind == 'spark' ) {
      part.x += part.vx ;
      part.y += part.vy ;
      part.vx *= 0.92 ;
      part.vy *= 0.92 ;
    } else if( part.kind == 'text' ) {
      part.y -= 0.6 ;
    } else if( part.kind == 'pop' ) {
      part.y -= 0.3 ;
    }
    if( part.age < part.life )
      this.parts[ aliveParts++ ] = part ;
  }
  this.parts.length = aliveParts ;
  this.flashAlpha *= 0.88 ;
  if( this.flashAlpha < 0.01 )
    this.flashAlpha = 0 ;
} ;


StageFx.prototype.draw = function( surface ) {
  var fieldWidth = this.stage.getWidth( ) ;
  var fieldHeight = this.stage.getHeight( ) ;
  surface.save( ) ;
  surface.beginPath( ) ;
  surface.rect( 0, 0, fieldWidth, fieldHeight ) ;
  surface.clip( ) ;

  // positions only line up with the normal top down view
  if( ! this.stage.viewFromFighter ) {
    this._drawBossCircle( surface ) ;
    this._drawDarkness( surface ) ;
    this._drawSparks( surface ) ;
    for( var i = 0; i < this.parts.length; i++ )
      this._drawPart( surface, this.parts[ i ] ) ;
  }

  if( this.flashAlpha > 0 ) {
    surface.globalAlpha = this.flashAlpha ;
    surface.fillStyle = 'rgb(255, 255, 255)' ;
    surface.fillRect( 0, 0, fieldWidth, fieldHeight ) ;
  }
  surface.restore( ) ;
} ;


StageFx.prototype._drawPart = function( surface, part ) {
  if( part.delay && part.age < part.delay )
    return ;
  var done = part.delay ? ( part.age - part.delay ) / ( part.life - part.delay ) : part.age / part.life ;
  if( part.kind == 'spark' ) {
    surface.globalAlpha = 1 - done ;
    surface.fillStyle = part.color ;
    surface.fillRect( part.x - part.size / 2, part.y - part.size / 2, part.size, part.size ) ;
  } else if( part.kind == 'ring' ) {
    var ringRadius = part.from + ( part.to - part.from ) * Math.sqrt( done ) ;
    surface.globalAlpha = 1 - done ;
    surface.strokeStyle = part.color ;
    surface.lineWidth = part.width * ( 1 - done ) + 0.5 ;
    surface.beginPath( ) ;
    surface.arc( part.x, part.y, ringRadius, 0, Math.PI * 2 ) ;
    surface.stroke( ) ;
  } else if( part.kind == 'death' ) {
    // a big circle that looks like it flips the colors under it
    var deathRadius = 10 + 220 * Math.sqrt( done ) ;
    surface.globalAlpha = 0.55 * ( 1 - done ) ;
    surface.fillStyle = 'rgb(20, 0, 40)' ;
    surface.beginPath( ) ;
    surface.arc( part.x, part.y, deathRadius, 0, Math.PI * 2 ) ;
    surface.fill( ) ;
    surface.globalAlpha = 0.9 * ( 1 - done ) ;
    surface.strokeStyle = 'rgb(255, 255, 255)' ;
    surface.lineWidth = 6 * ( 1 - done ) + 1 ;
    surface.stroke( ) ;
  } else if( part.kind == 'text' ) {
    surface.globalAlpha = done > 0.6 ? ( 1 - done ) / 0.4 : 1 ;
    surface.font = 'bold 11px Arial' ;
    surface.textAlign = 'center' ;
    surface.fillStyle = 'rgb(0, 0, 0)' ;
    surface.fillText( part.text, part.x + 1, part.y + 1 ) ;
    surface.fillStyle = part.color ;
    surface.fillText( part.text, part.x, part.y ) ;
  } else if( part.kind == 'pop' ) {
    var popScale = 0.3 + 0.7 * __easeBack( part.age / 14 ) ;
    surface.save( ) ;
    surface.globalAlpha = done > 0.7 ? ( 1 - done ) / 0.3 : 1 ;
    surface.translate( part.x, part.y ) ;
    surface.scale( popScale, popScale ) ;
    surface.font = 'italic bold 15px Georgia, serif' ;
    surface.textAlign = 'center' ;
    surface.lineJoin = 'round' ;
    surface.lineWidth = 4 ;
    surface.strokeStyle = 'rgba(0, 0, 0, 0.8)' ;
    surface.strokeText( part.text, 0, 0 ) ;
    surface.fillStyle = part.color ;
    surface.fillText( part.text, 0, 0 ) ;
    surface.restore( ) ;
  }
} ;


StageFx.prototype._updateShake = function( ) {
  if( this.shakeTime <= 0 ) {
    this.shakeX = 0 ;
    this.shakeY = 0 ;
    return ;
  }
  var shakeLeft = this.shakeTime / this.shakeSpan ;
  this.shakeX = ( Math.random( ) * 2 - 1 ) * this.shakePower * shakeLeft ;
  this.shakeY = ( Math.random( ) * 2 - 1 ) * this.shakePower * shakeLeft ;
  this.shakeTime-- ;
} ;


/*
 * the boss hp bar fills up at the start of each attack, and a pink bar
 * trails behind when it drops. the magic circle follows the boss
 */
StageFx.prototype._updateBoss = function( ) {
  var stage = this.stage ;
  var bossManager = stage.bossManager ;
  var boss = bossManager && stage.isFlagSet( stage._FLAG_BOSS_EXIST ) ? bossManager.getBoss( ) : null ;
  var circleTarget = 0 ;
  if( boss && boss.maxVital ) {
    var vitalPart = Math.max( 0, boss.vital ) / boss.maxVital ;
    if( vitalPart > this.barFill )
      this.barFill = Math.min( vitalPart, this.barFill + 0.025 ) ;
    else
      this.barFill = vitalPart ;
    if( this.barLag < this.barFill )
      this.barLag = this.barFill ;
    else
      this.barLag -= Math.max( 0.002, ( this.barLag - this.barFill ) * 0.06 ) ;
    if( ! boss.isVanishingOrEscaping( ) )
      circleTarget = 1 ;
  } else {
    this.barFill = 0 ;
    this.barLag = 0 ;
  }
  if( bossManager && bossManager.existBoss( ) ) {
    var circleBoss = bossManager.getBoss( ) ;
    this.circleX = circleBoss.getX( ) ;
    this.circleY = circleBoss.getY( ) ;
  }
  this.circleAlpha += ( circleTarget - this.circleAlpha ) * 0.06 ;
  if( circleTarget == 0 && this.circleAlpha < 0.02 )
    this.circleAlpha = 0 ;
  this.circleSpell += ( ( stage.spellCard ? 1 : 0 ) - this.circleSpell ) * 0.06 ;
  this.circleSpin += 0.02 + 0.02 * this.circleSpell ;
} ;


StageFx.prototype._drawBossCircle = function( surface ) {
  if( this.circleAlpha <= 0 )
    return ;
  var circleRadius = ( 46 + 6 * Math.sin( this.circleSpin * 1.7 ) ) * ( 0.6 + 0.4 * this.circleAlpha ) ;
  surface.save( ) ;
  surface.translate( this.circleX, this.circleY ) ;
  surface.globalAlpha = this.circleAlpha * ( 0.5 + 0.2 * this.circleSpell ) ;
  surface.strokeStyle = this.circleSpell > 0.5 ? 'rgb(255, 120, 150)' : 'rgb(200, 225, 255)' ;

  surface.lineWidth = 1.5 ;
  surface.beginPath( ) ;
  surface.arc( 0, 0, circleRadius, 0, Math.PI * 2 ) ;
  surface.stroke( ) ;
  surface.lineWidth = 1 ;
  surface.beginPath( ) ;
  surface.arc( 0, 0, circleRadius * 0.82, 0, Math.PI * 2 ) ;
  surface.stroke( ) ;

  // a star inside, turning one way
  surface.rotate( this.circleSpin ) ;
  surface.beginPath( ) ;
  for( var i = 0; i <= 5; i++ ) {
    var starAngle = i * Math.PI * 4 / 5 ;
    var starX = Math.cos( starAngle ) * circleRadius * 0.82 ;
    var starY = Math.sin( starAngle ) * circleRadius * 0.82 ;
    if( i == 0 )
      surface.moveTo( starX, starY ) ;
    else
      surface.lineTo( starX, starY ) ;
  }
  surface.stroke( ) ;

  // little marks on the outer ring, turning the other way
  surface.rotate( -this.circleSpin * 2 ) ;
  surface.fillStyle = surface.strokeStyle ;
  for( var j = 0; j < 12; j++ ) {
    var markAngle = j * Math.PI / 6 ;
    surface.fillRect( Math.cos( markAngle ) * circleRadius * 0.91 - 1.5,
                      Math.sin( markAngle ) * circleRadius * 0.91 - 1.5, 3, 3 ) ;
  }
  surface.restore( ) ;
} ;


// the focus hitbox fades in and out instead of popping
StageFx.prototype._updateFocus = function( ) {
  var fighter = this.stage.fighter ;
  var focusTarget = fighter && fighter.isFlagSet( fighter._FLAG_SLOW ) ? 1 : 0 ;
  this.focusAlpha += ( focusTarget - this.focusAlpha ) * 0.25 ;
  if( focusTarget == 0 && this.focusAlpha < 0.03 )
    this.focusAlpha = 0 ;
} ;


// the field canvas moves with the shake, the overlay is moved by the stage
StageFx.prototype.applyShake = function( ) {
  if( ! this.bgCanvas )
    this.bgCanvas = document.getElementById( 'bgCanvas' ) || { 'style': { } } ;
  var shakeText = this.shakeX || this.shakeY ?
                  'translate(' + this.shakeX.toFixed( 1 ) + 'px, ' + this.shakeY.toFixed( 1 ) + 'px)' : '' ;
  if( this.bgCanvas.style.transform != shakeText )
    this.bgCanvas.style.transform = shakeText ;
} ;


// rumia's darkness grows in when a spell card starts and shrinks away when it ends
StageFx.prototype._updateDarkness = function( ) {
  var darkTarget = 0 ;
  var bossManager = this.stage.bossManager ;
  if( bossManager && bossManager.existBoss( ) ) {
    var darkBoss = bossManager.getBoss( ) ;
    if( darkBoss.effects && darkBoss.effects.darkness && ! darkBoss.isVanishingOrEscaping( ) )
      darkTarget = darkBoss.effects.darkness ;
    this.darkX = darkBoss.getX( ) ;
    this.darkY = darkBoss.getY( ) ;
    this.darkCount = darkBoss.count ;
  }
  this.darkRadius += ( darkTarget - this.darkRadius ) * 0.05 ;
  if( darkTarget == 0 && this.darkRadius < 2 )
    this.darkRadius = 0 ;
} ;


// the darkness ball is drawn once into its own canvas and then just stretched
StageFx.prototype._getDarkImage = function( ) {
  if( this.darkImage )
    return this.darkImage ;
  var darkCanvas = document.createElement( 'canvas' ) ;
  darkCanvas.width = 256 ;
  darkCanvas.height = 256 ;
  var darkCtx = darkCanvas.getContext( '2d' ) ;
  var darkGlow = darkCtx.createRadialGradient( 128, 128, 128 * 0.15, 128, 128, 128 ) ;
  darkGlow.addColorStop( 0, 'rgba(0, 0, 0, 0.55)' ) ;
  darkGlow.addColorStop( 0.6, 'rgba(0, 0, 0, 0.9)' ) ;
  darkGlow.addColorStop( 1, 'rgba(0, 0, 0, 0)' ) ;
  darkCtx.fillStyle = darkGlow ;
  darkCtx.fillRect( 0, 0, 256, 256 ) ;
  this.darkImage = darkCanvas ;
  return darkCanvas ;
} ;


StageFx.prototype._drawDarkness = function( surface ) {
  if( this.darkRadius <= 0 )
    return ;
  // it wobbles a little so it looks alive
  var darkSize = this.darkRadius + Math.sin( this.darkCount / 9 ) * this.darkRadius * 0.06 ;
  surface.globalAlpha = 1 ;
  surface.drawImage( this._getDarkImage( ), this.darkX - darkSize, this.darkY - darkSize, darkSize * 2, darkSize * 2 ) ;
} ;


// the master spark beam, drawn here because it's way too big for the bullet images
StageFx.prototype._drawSparks = function( surface ) {
  var bombManager = this.stage.bombManager ;
  if( ! bombManager )
    return ;
  for( var i = 0; i < bombManager.elements.length; i++ ) {
    var spark = bombManager.elements[ i ] ;
    if( spark.kind != 'spark' || spark.isDead( ) )
      continue ;
    var sparkAge = spark.count ;
    var grow = Math.min( 1, sparkAge / 10 ) ;
    var fadeOut = Math.min( 1, ( spark._LIFE - sparkAge ) / 15 ) ;
    var fieldWidth = this.stage.getWidth( ) ;
    var wobble = 0.92 + Math.sin( sparkAge * 0.9 ) * 0.08 ;
    var halfWidth = ( spark._SPARK_HALF_WIDTH + 6 ) * grow * wobble ;
    var beamBottom = spark.getY( ) - 14 ;
    var beamX = spark.getX( ) ;

    // it leaves the mini-hakkero narrow and opens up to the whole screen
    var leftEdge = beamX - ( beamX + 20 ) * grow ;
    var rightEdge = beamX + ( fieldWidth - beamX + 20 ) * grow ;
    var spreadTop = beamBottom - 110 ;
    var beamColors = surface.createLinearGradient( leftEdge, 0, rightEdge, 0 ) ;
    var hueShift = ( sparkAge * 7 ) % 360 ;
    var corePart = ( beamX - leftEdge ) / Math.max( 1, rightEdge - leftEdge ) ;
    beamColors.addColorStop( 0, 'hsla(' + hueShift + ', 100%, 60%, 0.75)' ) ;
    beamColors.addColorStop( Math.max( 0, corePart - 0.3 ), 'hsla(' + ( ( hueShift + 60 ) % 360 ) + ', 100%, 65%, 0.85)' ) ;
    beamColors.addColorStop( Math.max( 0, corePart - 0.12 ), 'rgba(255, 255, 255, 0.95)' ) ;
    beamColors.addColorStop( Math.min( 1, corePart + 0.12 ), 'rgba(255, 255, 255, 0.95)' ) ;
    beamColors.addColorStop( Math.min( 1, corePart + 0.3 ), 'hsla(' + ( ( hueShift + 180 ) % 360 ) + ', 100%, 65%, 0.85)' ) ;
    beamColors.addColorStop( 1, 'hsla(' + ( ( hueShift + 240 ) % 360 ) + ', 100%, 60%, 0.75)' ) ;

    surface.globalAlpha = fadeOut ;
    surface.fillStyle = beamColors ;
    surface.beginPath( ) ;
    surface.moveTo( beamX - halfWidth * 0.6, beamBottom ) ;
    surface.lineTo( leftEdge, spreadTop ) ;
    surface.lineTo( leftEdge, 0 ) ;
    surface.lineTo( rightEdge, 0 ) ;
    surface.lineTo( rightEdge, spreadTop ) ;
    surface.lineTo( beamX + halfWidth * 0.6, beamBottom ) ;
    surface.closePath( ) ;
    surface.fill( ) ;

    // the glowing ball at the mini-hakkero
    var hakkeroGlow = surface.createRadialGradient( beamX, beamBottom, 2, beamX, beamBottom, halfWidth * 0.9 ) ;
    hakkeroGlow.addColorStop( 0, 'rgba(255, 255, 255, 1)' ) ;
    hakkeroGlow.addColorStop( 1, 'rgba(255, 255, 255, 0)' ) ;
    surface.fillStyle = hakkeroGlow ;
    surface.beginPath( ) ;
    surface.arc( beamX, beamBottom, halfWidth * 0.9, 0, Math.PI * 2 ) ;
    surface.fill( ) ;

    if( sparkAge % 3 == 0 )
      this._addSparks( leftEdge + Math.random( ) * ( rightEdge - leftEdge ), Math.random( ) * spreadTop, 3, 4, 18, 'rgb(255, 255, 210)', 2 ) ;
  }
  surface.globalAlpha = 1 ;
} ;
