/*
 * small effects drawn with the 2d canvas on top of the play field:
 * bursts, sparks, the death circle, score popups and the screen flash.
 * they're only for looks and never change the game.
 */
function StageFx( stage ) {
  this.stage = stage ;
  this.parts = [ ] ;
  this.flashAlpha = 0 ;
}

StageFx.prototype._MAX_PARTS = 400 ;


StageFx.prototype.reset = function( ) {
  this.parts.length = 0 ;
  this.flashAlpha = 0 ;
} ;


StageFx.prototype._add = function( part ) {
  if( this.parts.length >= this._MAX_PARTS )
    this.parts.shift( ) ;
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
  var done = part.age / part.life ;
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
  }
} ;


// rumia hides inside a ball of darkness, bigger during some of her attacks
StageFx.prototype._drawDarkness = function( surface ) {
  var bossManager = this.stage.bossManager ;
  if( ! bossManager || ! bossManager.existBoss( ) )
    return ;
  var darkBoss = bossManager.getBoss( ) ;
  if( ! darkBoss.effects || ! darkBoss.effects.darkness || darkBoss.isVanishingOrEscaping( ) )
    return ;
  var darkRadius = darkBoss.effects.darkness ;
  // it wobbles a little so it looks alive
  darkRadius = darkRadius + Math.sin( darkBoss.count / 9 ) * darkRadius * 0.06 ;
  var darkGlow = surface.createRadialGradient( darkBoss.getX( ), darkBoss.getY( ), darkRadius * 0.15,
                                               darkBoss.getX( ), darkBoss.getY( ), darkRadius ) ;
  darkGlow.addColorStop( 0, 'rgba(0, 0, 0, 0.55)' ) ;
  darkGlow.addColorStop( 0.6, 'rgba(0, 0, 0, 0.9)' ) ;
  darkGlow.addColorStop( 1, 'rgba(0, 0, 0, 0)' ) ;
  surface.globalAlpha = 1 ;
  surface.fillStyle = darkGlow ;
  surface.beginPath( ) ;
  surface.arc( darkBoss.getX( ), darkBoss.getY( ), darkRadius, 0, Math.PI * 2 ) ;
  surface.fill( ) ;
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
    var halfWidth = ( spark._SPARK_HALF_WIDTH + 6 ) * grow * ( 0.92 + Math.sin( sparkAge * 0.9 ) * 0.08 ) ;
    var beamBottom = spark.getY( ) - 14 ;
    var beamX = spark.getX( ) ;

    var beamColors = surface.createLinearGradient( beamX - halfWidth, 0, beamX + halfWidth, 0 ) ;
    var hueShift = ( sparkAge * 7 ) % 360 ;
    beamColors.addColorStop( 0, 'hsla(' + hueShift + ', 100%, 60%, 0)' ) ;
    beamColors.addColorStop( 0.18, 'hsla(' + ( ( hueShift + 60 ) % 360 ) + ', 100%, 65%, 0.7)' ) ;
    beamColors.addColorStop( 0.38, 'rgba(255, 255, 255, 0.95)' ) ;
    beamColors.addColorStop( 0.62, 'rgba(255, 255, 255, 0.95)' ) ;
    beamColors.addColorStop( 0.82, 'hsla(' + ( ( hueShift + 180 ) % 360 ) + ', 100%, 65%, 0.7)' ) ;
    beamColors.addColorStop( 1, 'hsla(' + ( ( hueShift + 240 ) % 360 ) + ', 100%, 60%, 0)' ) ;

    surface.globalAlpha = fadeOut ;
    surface.fillStyle = beamColors ;
    surface.fillRect( beamX - halfWidth, 0, halfWidth * 2, beamBottom ) ;

    // the glowing ball at the mini-hakkero
    var hakkeroGlow = surface.createRadialGradient( beamX, beamBottom, 2, beamX, beamBottom, halfWidth * 0.9 ) ;
    hakkeroGlow.addColorStop( 0, 'rgba(255, 255, 255, 1)' ) ;
    hakkeroGlow.addColorStop( 1, 'rgba(255, 255, 255, 0)' ) ;
    surface.fillStyle = hakkeroGlow ;
    surface.beginPath( ) ;
    surface.arc( beamX, beamBottom, halfWidth * 0.9, 0, Math.PI * 2 ) ;
    surface.fill( ) ;

    if( sparkAge % 3 == 0 )
      this._addSparks( beamX, beamBottom - Math.random( ) * beamBottom, 2, 4, 18, 'rgb(255, 255, 210)', 2 ) ;
  }
  surface.globalAlpha = 1 ;
} ;
