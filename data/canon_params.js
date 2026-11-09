/*
 * reimu and marisa's shots, and stages 1 and 2 redone so everyone fights like their real selves.
 * reimu: ofuda and homing amulets, focused persuasion needles, fantasy seal bomb.
 * marisa: stars and magic missiles, focused illusion laser, master spark bomb.
 * rumia hides in darkness, daiyousei teleports, cirno freezes things.
 * loaded after the other data files. the old stage 1 and 2 stay for the old bundled replays.
 */

var __canonShotTypes = { } ;
var __canonShotParams = [ ] ;

( function( ) {

  function addShotType( name, indexX, indexY, shotWidth, shotHeight, hitWidth, hitHeight ) {
    __canonShotTypes[ name ] = __bulletTypes.length ;
    __bulletTypes.push( {
      'image': 0,
      'indexX': indexX,
      'indexY': indexY,
      'width': shotWidth,
      'height': shotHeight,
      'collisionWidth': hitWidth,
      'collisionHeight': hitHeight,
      'rotate': true
    } ) ;
  }

  addShotType( 'needle',  1,  3, 16, 32, 10, 32 ) ;
  addShotType( 'amulet',  0, 15, 16, 16, 16, 16 ) ;
  // the star sits half a cell off the grid
  addShotType( 'star',  6.5, 12.5, 16, 16, 16, 16 ) ;
  addShotType( 'missile', 1,  2, 16, 32, 14, 28 ) ;

  var OFUDA = 0 ;
  var BOLT = 1 ;
  var NEEDLE = __canonShotTypes.needle ;
  var AMULET = __canonShotTypes.amulet ;
  var STAR = __canonShotTypes.star ;
  var MISSILE = __canonShotTypes.missile ;

  function straight( shotType, power, offsetX, angle, speed ) {
    return { 'type': shotType, 'power': power, 'x': offsetX, 'y': -20,
             'v': { 'r': speed, 'theta': angle } } ;
  }

  function fromOrb( shotType, power, orbNum, offsetX, angle, speed ) {
    return { 'type': shotType, 'power': power, 'fromOption': orbNum, 'x': offsetX, 'y': -6,
             'v': { 'r': speed, 'theta': angle } } ;
  }

  // homing amulets come out of the yin-yang orbs and chase the closest enemy
  function homingAmulet( power, orbNum, angle ) {
    return { 'type': AMULET, 'power': power, 'option': orbNum, 'homing': true, 'nextCount': 10,
             'v': { 'r': 9, 'theta': angle } } ;
  }

  // magic missiles start slow and speed up
  function magicMissile( power, orbNum, offsetX ) {
    return { 'type': MISSILE, 'power': power, 'fromOption': orbNum, 'x': offsetX, 'y': -8, 'nextCount': 10,
             'v': { 'r': 2, 'theta': 270, 'ra': 0.5, 'rrange': { 'max': 13 } } } ;
  }

  // illusion laser: a thin beam straight up from each orb, it goes through everything
  function illusionLaser( power, orbNum ) {
    return { 'power': power, 'laser': true, 'steady': true, 'option': orbNum,
             'keep': 20, 'waitCount': 0, 'nextCount': 20,
             'v': { 'r': 0, 'theta': 270 } } ;
  }

  var reimuWide = [
    [ straight( OFUDA, 0.5, -6, 270, 14 ), straight( OFUDA, 0.5, 6, 270, 14 ) ],
    [ straight( OFUDA, 0.45, -6, 268, 14 ), straight( OFUDA, 0.45, 6, 272, 14 ),
      homingAmulet( 0.4, 0, 240 ), homingAmulet( 0.4, 1, 300 ) ],
    [ straight( OFUDA, 0.35, -8, 264, 14 ), straight( OFUDA, 0.35, 0, 270, 14 ), straight( OFUDA, 0.35, 8, 276, 14 ),
      homingAmulet( 0.45, 0, 240 ), homingAmulet( 0.45, 1, 300 ) ],
    [ straight( OFUDA, 0.4, -8, 264, 14 ), straight( OFUDA, 0.4, 0, 270, 14 ), straight( OFUDA, 0.4, 8, 276, 14 ),
      homingAmulet( 0.35, 0, 230 ), homingAmulet( 0.35, 0, 250 ),
      homingAmulet( 0.35, 1, 290 ), homingAmulet( 0.35, 1, 310 ) ]
  ] ;

  var reimuFocused = [
    [ straight( NEEDLE, 0.6, -4, 270, 16 ), straight( NEEDLE, 0.6, 4, 270, 16 ) ],
    [ straight( NEEDLE, 0.55, -4, 270, 16 ), straight( NEEDLE, 0.55, 4, 270, 16 ),
      fromOrb( NEEDLE, 0.4, 0, 0, 270, 16 ), fromOrb( NEEDLE, 0.4, 1, 0, 270, 16 ) ],
    [ straight( NEEDLE, 0.45, -6, 270, 16 ), straight( NEEDLE, 0.45, 0, 270, 16 ), straight( NEEDLE, 0.45, 6, 270, 16 ),
      fromOrb( NEEDLE, 0.5, 0, 0, 270, 16 ), fromOrb( NEEDLE, 0.5, 1, 0, 270, 16 ) ],
    [ straight( NEEDLE, 0.5, -6, 270, 16 ), straight( NEEDLE, 0.5, 0, 270, 16 ), straight( NEEDLE, 0.5, 6, 270, 16 ),
      fromOrb( NEEDLE, 0.35, 0, -3, 270, 16 ), fromOrb( NEEDLE, 0.35, 0, 3, 270, 16 ),
      fromOrb( NEEDLE, 0.35, 1, -3, 270, 16 ), fromOrb( NEEDLE, 0.35, 1, 3, 270, 16 ) ]
  ] ;

  var marisaWide = [
    [ straight( STAR, 0.4, -4, 262, 12 ), straight( STAR, 0.4, 0, 270, 12 ), straight( STAR, 0.4, 4, 278, 12 ) ],
    [ straight( STAR, 0.45, -4, 266, 12 ), straight( STAR, 0.45, 4, 274, 12 ),
      magicMissile( 1.0, 0, 0 ), magicMissile( 1.0, 1, 0 ) ],
    [ straight( STAR, 0.4, -6, 262, 12 ), straight( STAR, 0.4, 0, 270, 12 ), straight( STAR, 0.4, 6, 278, 12 ),
      magicMissile( 1.2, 0, 0 ), magicMissile( 1.2, 1, 0 ) ],
    [ straight( STAR, 0.35, -8, 258, 12 ), straight( STAR, 0.35, -3, 266, 12 ),
      straight( STAR, 0.35, 3, 274, 12 ), straight( STAR, 0.35, 8, 282, 12 ),
      magicMissile( 0.75, 0, -4 ), magicMissile( 0.75, 0, 4 ),
      magicMissile( 0.75, 1, -4 ), magicMissile( 0.75, 1, 4 ) ]
  ] ;

  var marisaFocused = [
    [ straight( BOLT, 0.6, -4, 270, 14 ), straight( BOLT, 0.6, 4, 270, 14 ) ],
    [ straight( BOLT, 0.5, -4, 270, 14 ), straight( BOLT, 0.5, 4, 270, 14 ),
      illusionLaser( 0.5, 0 ), illusionLaser( 0.5, 1 ) ],
    [ straight( BOLT, 0.4, -6, 270, 14 ), straight( BOLT, 0.4, 0, 270, 14 ), straight( BOLT, 0.4, 6, 270, 14 ),
      illusionLaser( 0.55, 0 ), illusionLaser( 0.55, 1 ) ],
    [ straight( BOLT, 0.45, -6, 270, 14 ), straight( BOLT, 0.45, 0, 270, 14 ), straight( BOLT, 0.45, 6, 270, 14 ),
      illusionLaser( 0.6, 0 ), illusionLaser( 0.6, 1 ) ]
  ] ;

  __canonShotParams.push( [ reimuWide, reimuFocused ] ) ;
  __canonShotParams.push( [ marisaWide, marisaFocused ] ) ;

} ) ( ) ;


var __canonTypes = { } ;
var __canonBullets = { } ;

( function( ) {

  function addType( name, indexX, indexY, bulletSize, hitSize, rotate ) {
    __canonTypes[ name ] = __enemyBulletTypes.length ;
    __enemyBulletTypes.push( {
      'indexX': indexX,
      'indexY': indexY,
      'width': bulletSize,
      'height': bulletSize,
      'collisionWidth': hitSize,
      'collisionHeight': hitSize,
      'rotate': rotate
    } ) ;
  }

  function addBullet( name, bulletList ) {
    __canonBullets[ name ] = __enemyBulletsParams.length ;
    __enemyBulletsParams.push( bulletList ) ;
  }

  function ring( bulletNum, speed, startTheta ) {
    var ringList = [ ] ;
    for( var i = 0; i < bulletNum; i++ )
      ringList.push( { 'v': { 'r': speed, 'theta': startTheta + i * 360 / bulletNum } } ) ;
    return ringList ;
  }

  function aimedFan( bulletNum, spread, speed ) {
    var fanList = [ ] ;
    for( var i = 0; i < bulletNum; i++ ) {
      var offset = bulletNum == 1 ? 0 : -spread / 2 + spread * i / ( bulletNum - 1 ) ;
      fanList.push( { 'v': { 'aimed': true, 'r': speed, 'theta': offset } } ) ;
    }
    return fanList ;
  }

  function spiral( armNum, shotNum, turnStep, speed, frameGap ) {
    var spiralList = [ ] ;
    for( var i = 0; i < shotNum; i++ ) {
      for( var arm = 0; arm < armNum; arm++ ) {
        spiralList.push( { 'count': i * frameGap,
                           'v': { 'r': speed, 'theta': arm * 360 / armNum + i * turnStep } } ) ;
      }
    }
    return spiralList ;
  }

  // 16 pixel bullets: column is the color, row is the shape
  addType( 'darkOrb',    5,  3, 16, 10, false ) ;
  addType( 'greyOrb',    0,  2, 16, 10, false ) ;
  addType( 'redOrb',     2,  3, 16, 10, false ) ;
  addType( 'darkRice',   5,  4, 16,  5, true ) ;
  addType( 'redRice',    1,  4, 16,  5, true ) ;
  addType( 'greenOrb',  10,  3, 16, 10, false ) ;
  addType( 'greenRice', 10,  4, 16,  5, true ) ;
  addType( 'greenArrow', 10, 1, 16,  5, true ) ;
  addType( 'iceRice',    8,  4, 16,  5, true ) ;
  addType( 'icicle',     8,  6, 16,  5, true ) ;
  addType( 'iceKunai',   7,  5, 16,  5, true ) ;
  addType( 'blueOrb',    6,  3, 16, 10, false ) ;
  addType( 'frozen',    15,  2, 16,  9, false ) ;
  // 8 pixel pellets
  addType( 'redPellet',  1, 24,  8,  4, false ) ;
  addType( 'snow',       7, 25,  8,  4, false ) ;
  // 32 pixel glowing balls, they sit half a row down
  addType( 'bigIce',     4, 6.5, 32, 14, false ) ;
  addType( 'bigDark',    5, 6.5, 32, 14, false ) ;

  // fairies
  addBullet( 'aimOne', aimedFan( 1, 0, 2.5 ) ) ;
  addBullet( 'aimThree', aimedFan( 3, 24, 2.6 ) ) ;
  addBullet( 'ringTwelve', ring( 10, 1.8, 0 ) ) ;
  addBullet( 'ringTwelveOff', ring( 10, 1.8, 18 ) ) ;
  addBullet( 'ringSixteen', ring( 12, 1.6, 0 ) ) ;
  addBullet( 'fairySpiral', spiral( 2, 10, 17, 2.1, 4 ) ) ;
  addBullet( 'fairySpiralBack', spiral( 2, 10, -17, 2.1, 4 ) ) ;

  // snow drifting down and to one side
  var snowSpray = [ ] ;
  for( var flake = 0; flake < 4; flake++ ) {
    snowSpray.push( { 'v': { 'r': 2, 'theta': 90, 'rrandom': { 'min': 1, 'max': 4 }, 'trandom': { 'min': 40, 'max': 140 } } } ) ;
  }
  addBullet( 'snowSpray', snowSpray ) ;

  // rumia: rings that crawl out of her darkness slowly, then speed up once they're out
  function darkRing( bulletNum, startTheta ) {
    var darkList = [ ] ;
    for( var i = 0; i < bulletNum; i++ ) {
      darkList.push( { 'v': [
        { 'count': 0,  'v': { 'r': 0.6, 'theta': startTheta + i * 360 / bulletNum } },
        { 'count': 70, 'v': { 'r': 0.6, 'ra': 0.03, 'rrange': { 'max': 2.1 } } }
      ] } ) ;
    }
    return darkList ;
  }
  addBullet( 'darkRing', darkRing( 14, 0 ) ) ;
  addBullet( 'darkRingOff', darkRing( 14, 13 ) ) ;
  addBullet( 'aimFive', aimedFan( 5, 44, 2.6 ) ) ;
  addBullet( 'aimSevenFast', aimedFan( 5, 50, 3.2 ) ) ;

  // rumia with her arms out: a cross that turns while it shoots
  addBullet( 'crossSpin', spiral( 4, 30, 6, 2.2, 3 ) ) ;
  addBullet( 'crossSpinBack', spiral( 4, 30, -6, 1.8, 3 ) ) ;

  // daiyousei
  addBullet( 'fairyRingArrow', ring( 16, 2.2, 0 ) ) ;
  addBullet( 'fairyRingSlow', ring( 12, 1.3, 15 ) ) ;
  addBullet( 'greenSpiral', spiral( 3, 14, 13, 2.0, 4 ) ) ;

  // cirno
  addBullet( 'icicleFan', aimedFan( 5, 56, 3 ) ) ;
  addBullet( 'snowRing', ring( 16, 1.5, 0 ) ) ;
  addBullet( 'snowRingOff', ring( 16, 1.5, 11.25 ) ) ;
  addBullet( 'icicleSpiral', spiral( 3, 20, 14, 2.3, 3 ) ) ;
  addBullet( 'icicleSpiralBack', spiral( 3, 20, -14, 2.3, 3 ) ) ;
  addBullet( 'bigIceAimed', aimedFan( 3, 36, 1.9 ) ) ;

  /*
   * cold snap: a burst of bullets sprays out, then they all freeze at the same moment,
   * turn white, and after a while drift off in random directions.
   */
  var coldSnap = [ ] ;
  for( var sprayNum = 0; sprayNum < 48; sprayNum++ ) {
    var fireFrame = ( sprayNum / 2 ) | 0 ;
    coldSnap.push( { 'count': fireFrame, 'v': [
      { 'count': 0, 'v': { 'r': 3, 'theta': 0, 'rrandom': { 'min': 2, 'max': 5 }, 'trandom': { 'min': 0, 'max': 360 } } },
      { 'count': 90 - fireFrame, 'turnInto': __canonTypes.frozen, 'v': { 'r': 0, 'theta': 90 } },
      { 'count': 150 - fireFrame, 'v': { 'r': 0, 'theta': 0, 'trandom': { 'min': 0, 'max': 360 }, 'ra': 0.02, 'rrange': { 'max': 1.5 } } }
    ] } ) ;
  }
  addBullet( 'coldSnap', coldSnap ) ;

  // icicle rain: icicles drop from the top of the screen in rows with a few gaps
  var rainGaps = [ 70, 300, 180, 410, 30, 250, 130, 360 ] ;
  for( var rainRow = 0; rainRow < rainGaps.length; rainRow++ ) {
    var rainList = [ ] ;
    for( var dropX = 12; dropX < 480; dropX += 34 ) {
      if( Math.abs( dropX - rainGaps[ rainRow ] ) < 60 )
        continue ;
      rainList.push( { 'x': dropX - 240, 'y': -100,
                       'v': { 'r': 0.5, 'theta': 90 + ( ( dropX * 7 ) % 9 ) - 4, 'ra': 0.04, 'rrange': { 'max': 3.2 } } } ) ;
    }
    addBullet( 'icicleRain' + rainRow, rainList ) ;
  }

  // blizzard: snow blown hard by the wind, one way and then the other
  function blizzard( windTheta ) {
    var blizzardList = [ ] ;
    for( var gust = 0; gust < 20; gust++ ) {
      blizzardList.push( { 'count': gust * 3,
                           'v': { 'r': 2, 'theta': 90, 'rrandom': { 'min': 1, 'max': 4 }, 'trandom': { 'min': 20, 'max': 160 },
                                  'g': { 'r': 0, 'theta': windTheta, 'ra': 0.02, 'rrange': { 'max': 1.6 } } } } ) ;
    }
    return blizzardList ;
  }
  addBullet( 'blizzardRight', blizzard( 0 ) ) ;
  addBullet( 'blizzardLeft', blizzard( 180 ) ) ;
  addBullet( 'bigIceRing', ring( 6, 1.2, 30 ) ) ;

} ) ( ) ;


var __canonStage1Enemies = [ ] ;
var __canonStage2Enemies = [ ] ;

( function( ) {
  var B = __canonBullets ;
  var T = __canonTypes ;

  function stream( list, startCount, fromLeft, look, bullet, bulletType, shotFrame ) {
    for( var i = 0; i < 8; i++ ) {
      list.push( {
        'count': startCount + i * 14,
        'x': fromLeft ? 60 + i * 12 : 420 - i * 12,
        'vital': 2,
        'look': look,
        'powerItem': i % 2 == 0 ? 1 : 0,
        'scoreItem': i % 2 == 1 ? 1 : 0,
        's': { 'bullet': bullet, 'type': bulletType, 'shotCount': [ shotFrame ] },
        'v': [
          { 'count': 0,  'v': { 'r': 2.5, 'theta': 90 } },
          { 'count': 60, 'v': fromLeft
              ? { 'r': 2.5, 'w': 0, 'wa': -0.04, 'wrange': { 'min': -1.6 }, 'trange': { 'min': -15 } }
              : { 'r': 2.5, 'w': 0, 'wa': 0.04, 'wrange': { 'max': 1.6 }, 'trange': { 'max': 195 } } }
        ]
      } ) ;
    }
  }

  function ringStopper( list, startCount, spotX, look, vital, firstBullet, secondBullet, bulletType ) {
    list.push( {
      'count': startCount,
      'x': spotX,
      'vital': vital,
      'look': look,
      'powerItem': 1,
      'scoreItem': 2,
      's': [
        { 'bullet': firstBullet,  'type': bulletType, 'shotCount': [ 60, 120 ] },
        { 'bullet': secondBullet, 'type': bulletType, 'shotCount': [ 90 ] }
      ],
      'v': [
        { 'count': 0,   'v': { 'r': 3, 'theta': 90, 'ra': -0.06, 'rrange': { 'min': 0 } } },
        { 'count': 160, 'v': { 'r': 0, 'theta': 270, 'ra': 0.05 } }
      ]
    } ) ;
  }

  function crossingLines( list, startCount, look, bullet, bulletType ) {
    for( var k = 0; k < 10; k++ ) {
      list.push( {
        'count': startCount + k * 22,
        'x': 0,
        'y': 60 + ( k % 2 ) * 40,
        'vital': 3,
        'look': look,
        'powerItem': k % 3 == 0 ? 1 : 0,
        'scoreItem': k % 3 != 0 ? 1 : 0,
        's': { 'bullet': bullet, 'type': bulletType, 'shotCount': [ 40 ] },
        'v': { 'r': 2.2, 'theta': 15 }
      } ) ;
      list.push( {
        'count': startCount + 11 + k * 22,
        'x': 480,
        'y': 80 + ( k % 2 ) * 40,
        'vital': 3,
        'look': look,
        'powerItem': k % 3 == 1 ? 1 : 0,
        'scoreItem': k % 3 != 1 ? 1 : 0,
        's': { 'bullet': bullet, 'type': bulletType, 'shotCount': [ 40 ] },
        'v': { 'r': 2.2, 'theta': 165 }
      } ) ;
    }
  }

  function swarm( list, startCount, look, bullet, bulletType ) {
    for( var n = 0; n < 16; n++ ) {
      list.push( {
        'count': startCount + n * 12,
        'x': 40 + ( n * 53 ) % 400,
        'vital': 2,
        'look': look,
        'powerItem': n % 4 == 0 ? 1 : 0,
        'scoreItem': n % 4 != 0 ? 1 : 0,
        's': { 'bullet': bullet, 'type': bulletType, 'shotCount': [ 30 ] },
        'v': [
          { 'count': 0,  'v': { 'r': 3.5, 'theta': 90 } },
          { 'count': 40, 'v': { 'r': 3.5, 'theta': n % 2 == 0 ? 120 : 60 } }
        ]
      } ) ;
    }
  }

  function bigFairy( list, startCount, spotX, look, shots ) {
    list.push( {
      'count': startCount,
      'x': spotX,
      'vital': 22,
      'look': look,
      'powerItem': 2,
      'scoreItem': 4,
      's': shots,
      'v': [
        { 'count': 0,   'v': { 'r': 2, 'theta': 90, 'ra': -0.03, 'rrange': { 'min': 0 } } },
        { 'count': 300, 'v': { 'r': 0, 'theta': 270, 'ra': 0.04 } }
      ]
    } ) ;
  }

  // stage 1, a dark road at night
  var s1 = __canonStage1Enemies ;
  stream( s1, 100, true, null, B.aimOne, T.darkOrb, 50 ) ;
  stream( s1, 300, false, null, B.aimOne, T.darkOrb, 50 ) ;
  var stopSpots = [ 120, 360, 240, 80, 400 ] ;
  for( var j = 0; j < stopSpots.length; j++ )
    ringStopper( s1, 500 + j * 70, stopSpots[ j ], 'blue', 8, B.ringTwelve, B.ringTwelveOff, T.darkOrb ) ;
  crossingLines( s1, 950, null, B.aimThree, T.redRice ) ;
  swarm( s1, 1450, null, B.aimOne, T.redOrb ) ;
  bigFairy( s1, 1650, 120, 'yellow', [
    { 'bullet': B.ringSixteen, 'type': T.darkOrb, 'shotCount': [ 60, 140, 220 ] },
    { 'bullet': B.aimThree,    'type': T.redRice, 'shotCount': [ 100, 180, 260 ] }
  ] ) ;
  bigFairy( s1, 1700, 360, 'yellow', [
    { 'bullet': B.ringSixteen, 'type': T.darkOrb, 'shotCount': [ 80, 160, 240 ] },
    { 'bullet': B.aimThree,    'type': T.redRice, 'shotCount': [ 120, 200, 280 ] }
  ] ) ;
  // after the mid-boss
  for( var m = 0; m < 6; m++ ) {
    s1.push( {
      'count': 2250 + m * 70,
      'x': m % 2 == 0 ? 140 : 340,
      'vital': 10,
      'look': 'blue',
      'powerItem': 1,
      'scoreItem': 2,
      's': { 'bullet': m % 2 == 0 ? B.fairySpiral : B.fairySpiralBack, 'type': T.darkRice, 'shotCount': [ 50, 110 ] },
      'v': [
        { 'count': 0,   'v': { 'r': 2.5, 'theta': 90, 'ra': -0.05, 'rrange': { 'min': 0 } } },
        { 'count': 180, 'v': { 'r': 0, 'theta': m % 2 == 0 ? 200 : 340, 'ra': 0.05 } }
      ]
    } ) ;
  }
  swarm( s1, 2750, null, B.aimOne, T.darkOrb ) ;

  // stage 2, the misty lake. the fairies here are blue and cold
  var s2 = __canonStage2Enemies ;
  stream( s2, 100, true, 'blue', B.aimOne, T.iceRice, 50 ) ;
  stream( s2, 300, false, 'blue', B.aimOne, T.iceRice, 50 ) ;
  var snowSpots = [ 100, 380, 240, 160, 320 ] ;
  for( var p = 0; p < snowSpots.length; p++ )
    ringStopper( s2, 500 + p * 70, snowSpots[ p ], 'paleblue', 8, B.ringSixteen, B.aimThree, T.icicle ) ;
  crossingLines( s2, 950, 'blue', B.aimThree, T.iceKunai ) ;
  for( var q = 0; q < 10; q++ ) {
    s2.push( {
      'count': 1450 + q * 30,
      'x': 50 + ( q * 97 ) % 380,
      'vital': 4,
      'look': 'paleblue',
      'powerItem': q % 3 == 0 ? 1 : 0,
      'scoreItem': q % 3 != 0 ? 1 : 0,
      's': { 'bullet': B.snowSpray, 'type': T.snow, 'shotCount': [ 30, 45, 60 ] },
      'v': [
        { 'count': 0,  'v': { 'r': 3, 'theta': 90, 'ra': -0.05, 'rrange': { 'min': 0.5 } } },
        { 'count': 90, 'v': { 'r': 0.5, 'theta': 270, 'ra': 0.05 } }
      ]
    } ) ;
  }
  bigFairy( s2, 1700, 240, 'yellow', [
    { 'bullet': B.fairySpiral,     'type': T.iceRice, 'shotCount': [ 60, 180 ] },
    { 'bullet': B.fairySpiralBack, 'type': T.iceRice, 'shotCount': [ 120, 240 ] }
  ] ) ;
  // after daiyousei
  stream( s2, 2250, true, 'blue', B.aimThree, T.icicle, 45 ) ;
  stream( s2, 2400, false, 'blue', B.aimThree, T.icicle, 45 ) ;
  swarm( s2, 2650, 'blue', B.aimOne, T.iceKunai ) ;
  bigFairy( s2, 2800, 100, 'yellow', [
    { 'bullet': B.ringSixteen, 'type': T.blueOrb, 'shotCount': [ 60, 140, 220 ] },
    { 'bullet': B.snowSpray,   'type': T.snow,    'shotCount': [ 100, 110, 180, 190 ] }
  ] ) ;
  bigFairy( s2, 2850, 380, 'yellow', [
    { 'bullet': B.ringSixteen, 'type': T.blueOrb, 'shotCount': [ 80, 160, 240 ] },
    { 'bullet': B.snowSpray,   'type': T.snow,    'shotCount': [ 120, 130, 200, 210 ] }
  ] ) ;
} ) ( ) ;


var __canonStage1Bosses = [ ] ;
var __canonStage2Bosses = [ ] ;

( function( ) {
  var B = __canonBullets ;
  var T = __canonTypes ;

  function bossBase( startCount, character, isMid, phases ) {
    var boss = {
      'count': startCount,
      'character': character,
      'width': 128,
      'height': 128,
      'collisionWidth': 50,
      'collisionHeight': 50,
      'appearedTalk': ! isMid,
      'vanishedTalk': ! isMid,
      'x': 240,
      'y': 0,
      'animation': 3,
      'powerItem': 1,
      'score': isMid ? 1000 : 5000,
      'params': phases
    } ;
    if( isMid )
      boss.dead = 'escape' ;
    return boss ;
  }

  function wander( xMin, xMax, yMin, yMax, waitFrames, moveFrames ) {
    return [
      { 'count': 0, 'v': { 'r': 0, 'theta': 90 } },
      { 'count': waitFrames, 'v': { 'target': { 'x': { 'min': xMin, 'max': xMax }, 'y': { 'min': yMin, 'max': yMax }, 'count': moveFrames } } },
      { 'count': waitFrames + moveFrames, 'v': { 'r': 0, 'theta': 90 } },
      { 'count': waitFrames * 2 + moveFrames, 'v': 1 }
    ] ;
  }

  // rumia
  __canonStage1Bosses.push( bossBase( 2100, 'rumia', true, [
    {
      'spellCard': false,
      'x': 240,
      'y': 130,
      'vital': 200,
      's': [
        { 'bullet': B.darkRing, 'type': T.darkOrb, 'shotCount': [ 0 ],      'baseCount': 140 },
        { 'bullet': B.aimFive,  'type': T.redRice, 'shotCount': [ 50, 90 ], 'baseCount': 140 }
      ],
      'v': wander( 140, 340, 100, 160, 70, 50 )
    }
  ] ) ) ;

  __canonStage1Bosses.push( bossBase( 3200, 'rumia', false, [
    {
      'spellCard': false,
      'x': 240,
      'y': 130,
      'vital': 220,
      's': [
        { 'bullet': B.darkRing,    'type': T.darkOrb, 'shotCount': [ 0 ],          'baseCount': 160 },
        { 'bullet': B.darkRingOff, 'type': T.darkOrb, 'shotCount': [ 80 ],         'baseCount': 160 },
        { 'bullet': B.aimFive,     'type': T.redRice, 'shotCount': [ 40, 50, 60 ], 'baseCount': 160 }
      ],
      'v': wander( 140, 340, 100, 160, 80, 50 )
    },
    {
      // her darkness gets huge and the bullets only show up once they crawl out of it
      'spellCard': 'Darkness Sign "Lights Out"',
      'x': 240,
      'y': 140,
      'vital': 250,
      's': [
        { 'bullet': B.darkRing,     'type': T.greyOrb,   'shotCount': [ 0, 60 ],       'baseCount': 120 },
        { 'bullet': B.darkRingOff,  'type': T.greyOrb,   'shotCount': [ 30, 90 ],      'baseCount': 120 },
        { 'bullet': B.aimSevenFast, 'type': T.redPellet, 'shotCount': [ 45, 105 ],     'baseCount': 120 }
      ],
      'v': wander( 180, 300, 120, 170, 120, 60 ),
      'e': { 'darkness': 150 }
    },
    {
      'spellCard': false,
      'x': 240,
      'y': 120,
      'vital': 220,
      's': [
        { 'bullet': B.ringTwelve,    'type': T.bigDark, 'shotCount': [ 0, 60 ],  'baseCount': 120 },
        { 'bullet': B.ringTwelveOff, 'type': T.bigDark, 'shotCount': [ 30, 90 ], 'baseCount': 120 },
        { 'bullet': B.aimThree,      'type': T.redRice, 'shotCount': [ 15, 75 ], 'baseCount': 120 }
      ],
      'v': wander( 120, 360, 90, 150, 60, 40 )
    },
    {
      // rumia spreads her arms like a cross and spins the cross around
      'spellCard': 'Night Sign "Arms Spread Wide"',
      'x': 240,
      'y': 130,
      'vital': 260,
      's': [
        { 'bullet': B.crossSpin,     'type': T.darkRice,  'shotCount': [ 0 ],      'baseCount': 180 },
        { 'bullet': B.crossSpinBack, 'type': T.redRice,   'shotCount': [ 90 ],     'baseCount': 180 },
        { 'bullet': B.aimOne,        'type': T.bigDark,   'shotCount': [ 60, 150 ], 'baseCount': 180 }
      ],
      'v': [ { 'count': 0, 'v': { 'r': 0, 'theta': 90 } } ],
      'e': { 'darkness': 90 }
    }
  ] ) ) ;

  // daiyousei, the great fairy of the lake. she blinks out and comes back somewhere else
  __canonStage2Bosses.push( bossBase( 2100, 'daiyousei', true, [
    {
      'spellCard': false,
      'x': 240,
      'y': 150,
      'vital': 250,
      's': [
        { 'bullet': B.fairyRingArrow, 'type': T.greenArrow, 'shotCount': [ 10, 160 ],      'baseCount': 300 },
        { 'bullet': B.fairyRingSlow,  'type': T.greenOrb,   'shotCount': [ 25, 175 ],      'baseCount': 300 },
        { 'bullet': B.aimFive,        'type': T.greenRice,  'shotCount': [ 60, 210 ],      'baseCount': 300 },
        { 'bullet': B.greenSpiral,    'type': T.greenRice,  'shotCount': [ 100, 250 ],     'baseCount': 300 }
      ],
      'v': [
        { 'count': 0, 'v': { 'r': 0, 'theta': 90 } },
        { 'count': 149, 'v': { 'target': { 'x': { 'min': 60, 'max': 240 }, 'y': { 'min': 100, 'max': 200 }, 'count': 1 } } },
        { 'count': 150, 'v': { 'r': 0, 'theta': 90 } },
        { 'count': 299, 'v': { 'target': { 'x': { 'min': 240, 'max': 420 }, 'y': { 'min': 100, 'max': 200 }, 'count': 1 } } },
        { 'count': 300, 'v': 1 }
      ],
      'e': {
        'vanish': { 'count': 100, 'length': 50, 'baseCount': 150 }
      }
    }
  ] ) ) ;

  // cirno, the ice fairy
  __canonStage2Bosses.push( bossBase( 3200, 'chilno', false, [
    {
      'spellCard': false,
      'x': 240,
      'y': 120,
      'vital': 240,
      's': [
        { 'bullet': B.icicleFan,   'type': T.iceKunai, 'shotCount': [ 20, 30, 40 ], 'baseCount': 140 },
        { 'bullet': B.snowRing,    'type': T.snow,     'shotCount': [ 80 ],         'baseCount': 140 },
        { 'bullet': B.snowRingOff, 'type': T.snow,     'shotCount': [ 100 ],        'baseCount': 140 }
      ],
      'v': wander( 140, 340, 90, 150, 100, 40 )
    },
    {
      'spellCard': 'Freeze Sign "Cold Snap"',
      'x': 240,
      'y': 130,
      'vital': 260,
      's': [
        { 'bullet': B.coldSnap,  'type': T.blueOrb,  'shotCount': [ 0 ],             'baseCount': 260 },
        { 'bullet': B.icicleFan, 'type': T.iceKunai, 'shotCount': [ 100, 115, 130 ], 'baseCount': 260 }
      ],
      'v': wander( 180, 300, 110, 150, 200, 60 ),
      'e': {
        'shockwave': [
          { 'count': 90, 'baseCount': 260, 'params': { 'w': 10, 'g': 5, 'b': 7, 'a': 0.5, 'endCount': 100 } }
        ]
      }
    },
    {
      'spellCard': false,
      'x': 240,
      'y': 110,
      'vital': 240,
      's': [
        { 'bullet': B.icicleSpiral,     'type': T.icicle, 'shotCount': [ 0 ],       'baseCount': 160 },
        { 'bullet': B.icicleSpiralBack, 'type': T.icicle, 'shotCount': [ 80 ],      'baseCount': 160 },
        { 'bullet': B.bigIceAimed,      'type': T.bigIce, 'shotCount': [ 60, 140 ], 'baseCount': 160 }
      ],
      'v': wander( 160, 320, 90, 140, 80, 40 )
    },
    {
      'spellCard': 'Ice Sign "Icicle Rain"',
      'x': 240,
      'y': 100,
      'vital': 270,
      's': [
        { 'bullet': B.icicleRain0, 'type': T.icicle, 'shotCount': [ 0 ],   'baseCount': 320 },
        { 'bullet': B.icicleRain1, 'type': T.icicle, 'shotCount': [ 40 ],  'baseCount': 320 },
        { 'bullet': B.icicleRain2, 'type': T.icicle, 'shotCount': [ 80 ],  'baseCount': 320 },
        { 'bullet': B.icicleRain3, 'type': T.icicle, 'shotCount': [ 120 ], 'baseCount': 320 },
        { 'bullet': B.icicleRain4, 'type': T.icicle, 'shotCount': [ 160 ], 'baseCount': 320 },
        { 'bullet': B.icicleRain5, 'type': T.icicle, 'shotCount': [ 200 ], 'baseCount': 320 },
        { 'bullet': B.icicleRain6, 'type': T.icicle, 'shotCount': [ 240 ], 'baseCount': 320 },
        { 'bullet': B.icicleRain7, 'type': T.icicle, 'shotCount': [ 280 ], 'baseCount': 320 },
        { 'bullet': B.bigIceAimed, 'type': T.bigIce, 'shotCount': [ 60, 220 ], 'baseCount': 320 }
      ],
      // she stays put so the icicles always start at the top of the screen
      'v': [ { 'count': 0, 'v': { 'r': 0, 'theta': 90 } } ]
    },
    {
      'spellCard': 'Snow Sign "Strongest Blizzard"',
      'x': 240,
      'y': 110,
      'vital': 280,
      's': [
        { 'bullet': B.blizzardRight, 'type': T.snow,   'shotCount': [ 0 ],        'baseCount': 240 },
        { 'bullet': B.blizzardLeft,  'type': T.snow,   'shotCount': [ 120 ],      'baseCount': 240 },
        { 'bullet': B.bigIceRing,    'type': T.bigIce, 'shotCount': [ 60, 180 ],  'baseCount': 240 },
        { 'bullet': B.aimThree,      'type': T.iceRice, 'shotCount': [ 90, 210 ], 'baseCount': 240 }
      ],
      'v': wander( 160, 320, 90, 130, 100, 20 )
    }
  ] ) ) ;
} ) ( ) ;


var __oldStage1Enemies = __enemiesParams[ 0 ] ;
var __oldStage2Enemies = __enemiesParams[ 1 ] ;
var __oldStage1Bosses = __bossesParams[ 0 ] ;
var __oldStage2Bosses = __bossesParams[ 1 ] ;

// picks which stage 1 and 2 the game runs, the old ones are only for the old bundled replays
function __useCanonStages( useCanon ) {
  __enemiesParams[ 0 ] = useCanon ? __canonStage1Enemies : __oldStage1Enemies ;
  __enemiesParams[ 1 ] = useCanon ? __canonStage2Enemies : __oldStage2Enemies ;
  __bossesParams[ 0 ] = useCanon ? __canonStage1Bosses : __oldStage1Bosses ;
  __bossesParams[ 1 ] = useCanon ? __canonStage2Bosses : __oldStage2Bosses ;
}

__useCanonStages( true ) ;
