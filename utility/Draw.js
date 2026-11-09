/**
 *
 */
function __drawComplexRect( surface, image, p, width, height,
                            ax, ay, awidth, aheight ) {

  if( ! width )
    width = image.width ;
  if( ! height )
    height = image.height ;
  if( ! ax )
    ax = 0 ;
  if( ! ay )
    ay = 0 ;
  if( ! awidth )
    awidth = width ;
  if( ! aheight )
    aheight = height ;

  surface.save( ) ;
  surface.beginPath( ) ;
  surface.moveTo( p[0].x, p[0].y ) ;
  surface.lineTo( p[1].x, p[1].y ) ;
  surface.lineTo( p[3].x, p[3].y ) ;
  surface.lineTo( p[2].x, p[2].y ) ;
  surface.closePath( ) ;
  surface.clip( ) ;

  var t1 = ( p[1].x - p[0].x ) / width ;
  var t2 = ( p[1].y - p[0].y ) / width ;
  var t3 = ( p[2].x - p[0].x ) / height ;
  var t4 = ( p[2].y - p[0].y ) / height ;
  var t5 = p[0].x ;
  var t6 = p[0].y ;
		
  var ts = surface._scale || 1 ;
  surface.setTransform( t1 * ts, t2 * ts, t3 * ts, t4 * ts, t5 * ts, t6 * ts ) 
  surface.drawImage( image, ax, ay, awidth, aheight, 0, 0, width, height ) ;
  surface.restore( ) ;

  surface.save( ) ;
  surface.beginPath( ) ;
  surface.moveTo( p[1].x, p[1].y ) ;
  surface.lineTo( p[2].x, p[2].y ) ;
  surface.lineTo( p[3].x, p[3].y ) ;
  surface.closePath( ) ;
  surface.clip( ) ;

  var t1 = ( p[3].x - p[2].x ) / width ;
  var t2 = ( p[3].y - p[2].y ) / width ;
  var t3 = ( p[3].x - p[1].x ) / height ;
  var t4 = ( p[3].y - p[1].y ) / height ;
  var t5 = p[2].x ;
  var t6 = p[2].y ;
		
  surface.setTransform( t1 * ts, t2 * ts, t3 * ts, t4 * ts, t5 * ts, t6 * ts ) 
  surface.drawImage( image, ax, ay, awidth, aheight, 0, 0, width, -height ) ;
  surface.restore( ) ;
}


function __toBase64Pdf( image ) {
  var canvas = document.createElement( 'canvas' ) ;
  var context = canvas.getContext( '2d' ) ;
  context.drawImage( image, 0, 0 ) ;
  return canvas.toDataURL( 'image/png' ) ;
}


/*
 * small helpers for menu and effect animations.
 * t goes 0 to 1, anything outside gets clamped.
 */
function __clamp01( t ) {
  return t < 0 ? 0 : ( t > 1 ? 1 : t ) ;
}

function __easeOut( t ) {
  t = __clamp01( t ) ;
  return 1 - ( 1 - t ) * ( 1 - t ) * ( 1 - t ) ;
}

function __easeInOut( t ) {
  t = __clamp01( t ) ;
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow( -2 * t + 2, 3 ) / 2 ;
}

// goes a little past 1 then settles back, for things that pop in
function __easeBack( t ) {
  t = __clamp01( t ) ;
  var c1 = 1.70158 ;
  var c3 = c1 + 1 ;
  return 1 + c3 * Math.pow( t - 1, 3 ) + c1 * Math.pow( t - 1, 2 ) ;
}

// how far along an animation is, from its start frame over span frames
function __animTime( count, start, span ) {
  return __clamp01( ( count - start ) / span ) ;
}

// a yin-yang, used for the loading spinner and boss circles
function __drawYinYang( surface, x, y, radius, angle, alpha ) {
  surface.save( ) ;
  surface.globalAlpha = alpha === undefined ? 1.0 : alpha ;
  surface.translate( x, y ) ;
  surface.rotate( angle ) ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.beginPath( ) ;
  surface.arc( 0, 0, radius, 0, Math.PI * 2 ) ;
  surface.fill( ) ;
  surface.fillStyle = 'rgb( 200, 30, 40 )' ;
  surface.beginPath( ) ;
  surface.arc( 0, 0, radius, Math.PI / 2, Math.PI * 3 / 2 ) ;
  surface.arc( 0, -radius / 2, radius / 2, Math.PI * 3 / 2, Math.PI / 2 ) ;
  surface.arc( 0, radius / 2, radius / 2, Math.PI * 3 / 2, Math.PI / 2, true ) ;
  surface.fill( ) ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.beginPath( ) ;
  surface.arc( 0, -radius / 2, radius / 7, 0, Math.PI * 2 ) ;
  surface.fill( ) ;
  surface.fillStyle = 'rgb( 200, 30, 40 )' ;
  surface.beginPath( ) ;
  surface.arc( 0, radius / 2, radius / 7, 0, Math.PI * 2 ) ;
  surface.fill( ) ;
  surface.strokeStyle = 'rgb( 60, 20, 20 )' ;
  surface.lineWidth = 1.5 ;
  surface.beginPath( ) ;
  surface.arc( 0, 0, radius, 0, Math.PI * 2 ) ;
  surface.stroke( ) ;
  surface.restore( ) ;
}
