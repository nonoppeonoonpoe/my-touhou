/*
 * stage 3: the human village at night.
 * mid-boss kogasa, boss keine.
 * loaded after the other data files, it adds its own bullets, enemies, bosses and talks.
 */

var __stage3Types = { } ;
var __stage3Bullets = { } ;

( function( ) {

  function addType( name, indexX, indexY, small ) {
    __stage3Types[ name ] = __enemyBulletTypes.length ;
    __enemyBulletTypes.push( {
      'indexX': indexX,
      'indexY': indexY,
      'width': 16,
      'height': 16,
      'collisionWidth': small ? 5 : 10,
      'collisionHeight': small ? 5 : 10,
      'rotate': small ? true : false
    } ) ;
  }

  function addBullet( name, bulletList ) {
    __stage3Bullets[ name ] = __enemyBulletsParams.length ;
    __enemyBulletsParams.push( bulletList ) ;
  }

  // n bullets in a circle
  function ring( bulletNum, speed, startTheta ) {
    var ringList = [ ] ;
    for( var i = 0; i < bulletNum; i++ )
      ringList.push( { 'v': { 'r': speed, 'theta': startTheta + i * 360 / bulletNum } } ) ;
    return ringList ;
  }

  // n bullets spread around the line to the player
  function aimedFan( bulletNum, spread, speed ) {
    var fanList = [ ] ;
    for( var i = 0; i < bulletNum; i++ ) {
      var offset = bulletNum == 1 ? 0 : -spread / 2 + spread * i / ( bulletNum - 1 ) ;
      fanList.push( { 'v': { 'aimed': true, 'r': speed, 'theta': offset } } ) ;
    }
    return fanList ;
  }

  // arms that spin while shooting, one bullet per arm every few frames
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

  addType( 'purpleOrb', 4, 3, false ) ;
  addType( 'blueOrb',   6, 3, false ) ;
  addType( 'redOrb',    2, 3, false ) ;
  addType( 'purpleRice', 4, 4, true ) ;
  addType( 'blueRice',   5, 4, true ) ;
  addType( 'redRice',    1, 4, true ) ;
  addType( 'blueKunai',  5, 5, true ) ;
  addType( 'cyanOrb',    8, 3, false ) ;

  // fairies
  addBullet( 'aimOne',   aimedFan( 1, 0, 3 ) ) ;
  addBullet( 'aimThree', aimedFan( 3, 24, 3 ) ) ;
  addBullet( 'ringTwelve', ring( 12, 2.2, 0 ) ) ;
  addBullet( 'ringTwelveOff', ring( 12, 2.2, 15 ) ) ;

  // kogasa
  addBullet( 'umbrellaSpin', spiral( 3, 30, 11, 2.6, 2 ) ) ;
  addBullet( 'umbrellaSpinBack', spiral( 3, 30, -11, 2.6, 2 ) ) ;
  addBullet( 'aimFive', aimedFan( 5, 40, 3.2 ) ) ;
  addBullet( 'rainDrop', [
    { 'v': { 'r': 4, 'theta': 270, 'rrandom': { 'min': 3, 'max': 6 }, 'trandom': { 'min': 215, 'max': 325 },
             'g': { 'r': 0, 'theta': 90, 'ra': 0.06, 'rrange': { 'max': 4 } } } },
    { 'v': { 'r': 4, 'theta': 270, 'rrandom': { 'min': 3, 'max': 6 }, 'trandom': { 'min': 215, 'max': 325 },
             'g': { 'r': 0, 'theta': 90, 'ra': 0.06, 'rrange': { 'max': 4 } } } }
  ] ) ;
  addBullet( 'ringSixteenSlow', ring( 16, 1.6, 0 ) ) ;

  // keine
  addBullet( 'kunaiFan', aimedFan( 5, 36, 4 ) ) ;
  addBullet( 'ringTwenty', ring( 20, 2.4, 0 ) ) ;
  addBullet( 'ringTwentyOff', ring( 20, 2.4, 9 ) ) ;

  // ledger pages: a row of bullets across the field with a gap the player has to find
  var gapSpots = [ -150, 40, -60, 140, -10, -180 ] ;
  for( var page = 0; page < gapSpots.length; page++ ) {
    var pageRow = [ ] ;
    for( var rowX = -240; rowX <= 240; rowX += 20 ) {
      if( Math.abs( rowX - gapSpots[ page ] ) < 36 )
        continue ;
      pageRow.push( { 'x': rowX, 'v': { 'r': 1.7, 'theta': 90 } } ) ;
    }
    addBullet( 'ledgerPage' + page, pageRow ) ;
  }

  addBullet( 'historySpiral', spiral( 4, 40, 7, 2.4, 3 ) ) ;
  addBullet( 'historySpiralBack', spiral( 4, 40, -7, 2.0, 3 ) ) ;

  // the village that was never there: a ring stops, waits, then every bullet heads for the player
  var hiddenRing = [ ] ;
  for( var hiddenNum = 0; hiddenNum < 24; hiddenNum++ ) {
    hiddenRing.push( { 'v': [
      { 'count': 0,  'v': { 'r': 3.5, 'theta': hiddenNum * 15, 'ra': -0.09, 'rrange': { 'min': 0 } } },
      { 'count': 70, 'v': { 'aimed': true, 'r': 0.5, 'theta': 0, 'ra': 0.05, 'rrange': { 'max': 2.6 } } }
    ] } ) ;
  }
  addBullet( 'hiddenVillage', hiddenRing ) ;

  addBullet( 'headbuttRing', ring( 32, 2.6, 0 ) ) ;
  addBullet( 'headbuttRingOff', ring( 32, 2.0, 5.625 ) ) ;
  addBullet( 'kunaiThree', aimedFan( 3, 16, 4.5 ) ) ;

  addType( 'lantern',    14, 2, false ) ;
  addType( 'yellowRice', 12, 4, true ) ;
  addType( 'yellowDot',  12, 6, true ) ;
  addType( 'yellowOrb',  13, 3, false ) ;
  addType( 'greenRice',  10, 4, true ) ;
  addType( 'greenOrb',   10, 3, false ) ;
  addType( 'whiteRice',  15, 4, true ) ;
  addType( 'orangeRice', 14, 4, true ) ;
  addType( 'grayOrb',     0, 3, false ) ;

  // lantern: one paper lantern drifts down, stops, then bursts into rice (4 corners and one at the player)
  var lanternBurst = [ ] ;
  var burstAngles = [ 45, 135, 225, 315, 0 ] ;
  for( var burstNum = 0; burstNum < burstAngles.length; burstNum++ ) {
    var aimedPart = burstNum == 4 ;
    lanternBurst.push( { 'v': [
      { 'count': 0,  'v': { 'r': 2.4, 'theta': 90, 'ra': -0.04, 'rrange': { 'min': 0 } } },
      { 'count': 70, 'turnInto': __stage3Types.yellowRice,
        'v': { 'aimed': aimedPart ? true : void 0, 'r': 0.6, 'theta': burstAngles[ burstNum ], 'ra': 0.06, 'rrange': { 'max': aimedPart ? 3 : 2.4 } } }
    ] } ) ;
  }
  addBullet( 'lanternBurst', lanternBurst ) ;

  // firefly: floats up, hangs there, then darts at the player
  addBullet( 'firefly', [ { 'v': [
    { 'count': 0,  'v': { 'r': 1.4, 'theta': 270, 'ra': -0.025, 'rrange': { 'min': 0 } } },
    { 'count': 70, 'v': { 'aimed': true, 'r': 0.4, 'theta': 0, 'ra': 0.09, 'rrange': { 'max': 3.6 } } }
  ] } ] ) ;

  // wind chime: a fan straight down, the fans of a row of fairies overlap into a wall
  addBullet( 'chimeFan', [
    { 'v': { 'r': 1.8, 'theta': 72 } }, { 'v': { 'r': 1.8, 'theta': 81 } }, { 'v': { 'r': 1.8, 'theta': 90 } },
    { 'v': { 'r': 1.8, 'theta': 99 } }, { 'v': { 'r': 1.8, 'theta': 108 } }
  ] ) ;

  // thrown stones: fly up and fall back down
  var stoneList = [ ] ;
  var stoneAngles = [ 245, 260, 275, 290 ] ;
  for( var stoneNum = 0; stoneNum < stoneAngles.length; stoneNum++ ) {
    stoneList.push( { 'v': { 'r': 3.6, 'theta': stoneAngles[ stoneNum ],
                             'g': { 'r': 0, 'theta': 90, 'ra': 0.055, 'rrange': { 'max': 3.2 } } } } ) ;
  }
  addBullet( 'stones', stoneList ) ;

  // night blossom: five petals that curl as they open, one way then the other
  function blossom( curl, turn ) {
    var petalList = [ ] ;
    for( var petal = 0; petal < 5; petal++ ) {
      for( var seed = 0; seed < 5; seed++ ) {
        petalList.push( { 'v': { 'r': 1.4 + seed * 0.3, 'theta': turn + petal * 72, 'w': curl, 'wa': -curl / 90, 'wrange': curl > 0 ? { 'min': 0 } : { 'max': 0 } } } ) ;
      }
    }
    return petalList ;
  }
  addBullet( 'blossomLeft', blossom( 1.2, 0 ) ) ;
  addBullet( 'blossomRight', blossom( -1.2, 36 ) ) ;
  addBullet( 'blossomRing', ring( 15, 1.5, 12 ) ) ;

  // scissor blades: a stream whose angle sweeps inward, so the two sides close like scissors
  function blade( fromLeft ) {
    var bladeList = [ ] ;
    for( var cut = 0; cut < 22; cut++ ) {
      bladeList.push( { 'count': cut * 3, 'v': { 'r': 3.2, 'theta': fromLeft ? 100 - cut * 3.5 : 80 + cut * 3.5 } } ) ;
    }
    return bladeList ;
  }
  addBullet( 'bladeLeft', blade( true ) ) ;
  addBullet( 'bladeRight', blade( false ) ) ;

  // will-o'-wisps: spread out, stop, then turn toward the player once and speed up
  var wispList = [ ] ;
  var wispAngles = [ 30, 90, 150 ] ;
  for( var wispNum = 0; wispNum < wispAngles.length; wispNum++ ) {
    wispList.push( { 'v': [
      { 'count': 0,  'v': { 'r': 2.6, 'theta': wispAngles[ wispNum ], 'ra': -0.06, 'rrange': { 'min': 0.3 } } },
      { 'count': 45, 'v': { 'aimed': true, 'r': 0.3, 'theta': 0, 'ra': 0.08, 'rrange': { 'max': 3.8 } } }
    ] } ) ;
  }
  addBullet( 'wisps', wispList ) ;

  // ricochet charms: thrown toward the walls, bounce off once and come back across
  var charmList = [ ] ;
  var charmAngles = [ 25, 45, 135, 155 ] ;
  for( var charmNum = 0; charmNum < charmAngles.length; charmNum++ ) {
    charmList.push( { 'v': { 'r': 2.4, 'theta': charmAngles[ charmNum ], 'reflectX': true, 'reflectCount': 1 } } ) ;
  }
  addBullet( 'charms', charmList ) ;

} ) ( ) ;


var __stage3EnemiesParams = [ ] ;

( function( ) {
  var B = __stage3Bullets ;
  var T = __stage3Types ;
  var list = __stage3EnemiesParams ;

  // opening: lantern fairies weave in from both sides and drop paper lanterns
  for( var i = 0; i < 12; i++ ) {
    var fromLeft = i % 2 == 0 ;
    list.push( {
      'count': 60 + i * 38,
      'x': fromLeft ? 70 + ( i % 4 ) * 20 : 410 - ( i % 4 ) * 20,
      'look': 'paleyellow',
      'vital': 4,
      'powerItem': i % 3 == 0 ? 1 : 0,
      'scoreItem': i % 3 != 0 ? 1 : 0,
      's': { 'bullet': B.lanternBurst, 'type': T.lantern, 'shotCount': [ 40, 100 ] },
      'v': [
        { 'count': 0,   'v': { 'r': 2, 'theta': fromLeft ? 70 : 110, 'w': 0, 'wa': fromLeft ? 0.025 : -0.025, 'wrange': fromLeft ? { 'max': 1 } : { 'min': -1 } } },
        { 'count': 60,  'v': { 'r': 2, 'w': 0, 'wa': fromLeft ? -0.03 : 0.03, 'wrange': fromLeft ? { 'min': -1.2 } : { 'max': 1.2 } } },
        { 'count': 130, 'v': { 'r': 2.2, 'theta': fromLeft ? 20 : 160 } }
      ]
    } ) ;
  }

  // fireflies: two v shapes crossing the field, each fairy leaves a firefly behind
  for( var flock = 0; flock < 2; flock++ ) {
    for( var bird = 0; bird < 7; bird++ ) {
      var wing = Math.abs( bird - 3 ) ;
      list.push( {
        'count': 640 + flock * 130 + wing * 8,
        'x': flock == 0 ? 2 : 478,
        'y': 70 + ( bird - 3 ) * 18,
        'vital': 2,
        'powerItem': bird == 3 ? 1 : 0,
        'scoreItem': bird != 3 ? 1 : 0,
        's': { 'bullet': B.firefly, 'type': T.yellowDot, 'shotCount': [ 30, 60, 90 ] },
        'v': { 'r': 2.4, 'theta': flock == 0 ? 25 : 155 }
      } ) ;
    }
  }

  // fairies that stop, fire rings and leave
  var stopSpots = [ 120, 360, 240, 80, 400 ] ;
  for( var j = 0; j < stopSpots.length; j++ ) {
    list.push( {
      'count': 960 + j * 60,
      'x': stopSpots[ j ],
      'vital': 8,
      'powerItem': 1,
      'scoreItem': 2,
      's': [
        { 'bullet': B.ringTwelve,    'type': T.purpleOrb, 'shotCount': [ 60 ] },
        { 'bullet': B.ringTwelveOff, 'type': T.purpleOrb, 'shotCount': [ 90 ] },
        { 'bullet': B.ringTwelve,    'type': T.purpleOrb, 'shotCount': [ 120 ] }
      ],
      'v': [
        { 'count': 0,   'v': { 'r': 3, 'theta': 90, 'ra': -0.06, 'rrange': { 'min': 0 } } },
        { 'count': 160, 'v': { 'r': 0, 'theta': 270, 'ra': 0.05 } }
      ]
    } ) ;
  }

  // two lines from the sides crossing the field with 3 way shots
  for( var k = 0; k < 10; k++ ) {
    list.push( {
      'count': 1300 + k * 22,
      'x': 0,
      'y': 60 + ( k % 2 ) * 40,
      'vital': 3,
      'powerItem': k % 3 == 0 ? 1 : 0,
      'scoreItem': k % 3 != 0 ? 1 : 0,
      's': { 'bullet': B.aimThree, 'type': T.blueRice, 'shotCount': [ 40 ] },
      'v': { 'r': 2.2, 'theta': 15 }
    } ) ;
    list.push( {
      'count': 1311 + k * 22,
      'x': 480,
      'y': 80 + ( k % 2 ) * 40,
      'vital': 3,
      'powerItem': k % 3 == 1 ? 1 : 0,
      'scoreItem': k % 3 != 1 ? 1 : 0,
      's': { 'bullet': B.aimThree, 'type': T.blueRice, 'shotCount': [ 40 ] },
      'v': { 'r': 2.2, 'theta': 165 }
    } ) ;
  }

  // wind chimes: a row of fairies rains narrow fans, one of them goes quiet and the gap sweeps side to side
  var chimeOrder = [ 0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0 ] ;
  for( var chime = 0; chime < 6; chime++ ) {
    var chimeShots = [ ] ;
    for( var gapTurn = 0; gapTurn < chimeOrder.length; gapTurn++ ) {
      if( chimeOrder[ gapTurn ] == chime )
        continue ;
      chimeShots.push( 50 + gapTurn * 30 ) ;
    }
    list.push( {
      'count': 1640 + chime * 6,
      'x': 60 + chime * 72,
      'look': 'blue',
      'vital': 10,
      'powerItem': chime % 2 == 0 ? 1 : 0,
      'scoreItem': 2,
      's': { 'bullet': B.chimeFan, 'type': T.greenRice, 'shotCount': chimeShots },
      'v': [
        { 'count': 0,   'v': { 'r': 2.2, 'theta': 90, 'ra': -0.05, 'rrange': { 'min': 0 } } },
        { 'count': 400, 'v': { 'r': 0, 'theta': 270, 'ra': 0.05 } }
      ]
    } ) ;
  }

  // back-alley ambush: fairies come up from the bottom corners and throw stones that fall back down
  for( var sneak = 0; sneak < 10; sneak++ ) {
    var leftSide = sneak % 2 == 0 ;
    list.push( {
      'count': 2120 + sneak * 26,
      'x': leftSide ? 8 : 472,
      'y': 470,
      'look': 'paleblue',
      'vital': 4,
      'powerItem': sneak % 3 == 0 ? 1 : 0,
      'scoreItem': sneak % 3 != 0 ? 1 : 0,
      's': { 'bullet': B.stones, 'type': T.grayOrb, 'shotCount': [ 50, 95 ] },
      'v': { 'r': 2, 'theta': leftSide ? 295 : 245 }
    } ) ;
  }

  // after kogasa: a slow wall of ring fairies
  for( var m = 0; m < 6; m++ ) {
    list.push( {
      'count': 2700 + m * 70,
      'x': m % 2 == 0 ? 140 : 340,
      'vital': 10,
      'powerItem': 1,
      'scoreItem': 2,
      's': [
        { 'bullet': B.ringSixteenSlow, 'type': T.cyanOrb, 'shotCount': [ 50, 100, 150 ] },
        { 'bullet': B.aimThree,        'type': T.blueRice, 'shotCount': [ 75, 125 ] }
      ],
      'v': [
        { 'count': 0,   'v': { 'r': 2.5, 'theta': 90, 'ra': -0.05, 'rrange': { 'min': 0 } } },
        { 'count': 180, 'v': { 'r': 0, 'theta': m % 2 == 0 ? 200 : 340, 'ra': 0.05 } }
      ]
    } ) ;
  }

  // night blossom: big sunflower fairies open curling flowers
  var blossomSpots = [ 160, 320, 240 ] ;
  for( var flower = 0; flower < blossomSpots.length; flower++ ) {
    list.push( {
      'count': 3220 + flower * 110,
      'x': blossomSpots[ flower ],
      'look': 'sunflower',
      'vital': 30,
      'powerItem': 2,
      'scoreItem': 3,
      's': [
        { 'bullet': B.blossomLeft,  'type': T.yellowOrb, 'shotCount': [ 60, 180 ] },
        { 'bullet': B.blossomRight, 'type': T.greenRice, 'shotCount': [ 120, 240 ] },
        { 'bullet': B.blossomRing,  'type': T.greenOrb,  'shotCount': [ 90, 210 ] }
      ],
      'v': [
        { 'count': 0,   'v': { 'r': 2.2, 'theta': 90, 'ra': -0.04, 'rrange': { 'min': 0 } } },
        { 'count': 290, 'v': { 'r': 0, 'theta': 270, 'ra': 0.04 } }
      ]
    } ) ;
  }

  // scissor fairies: pairs at the edges sweep blades inward
  for( var pair = 0; pair < 2; pair++ ) {
    for( var side = 0; side < 2; side++ ) {
      list.push( {
        'count': 3700 + pair * 150 + side,
        'x': side == 0 ? 50 : 430,
        'look': 'bigwhite',
        'vital': 16,
        'powerItem': 1,
        'scoreItem': 2,
        's': { 'bullet': side == 0 ? B.bladeLeft : B.bladeRight, 'type': T.whiteRice, 'shotCount': [ 50, 130 ] },
        'v': [
          { 'count': 0,   'v': { 'r': 2, 'theta': 90, 'ra': -0.035, 'rrange': { 'min': 0 } } },
          { 'count': 220, 'v': { 'r': 0, 'theta': side == 0 ? 220 : 320, 'ra': 0.04 } }
        ]
      } ) ;
    }
  }

  // the two big ring fairies
  for( var q = 0; q < 2; q++ ) {
    list.push( {
      'count': 4100 + q * 60,
      'x': q == 0 ? 100 : 380,
      'vital': 25,
      'powerItem': 2,
      'scoreItem': 4,
      's': [
        { 'bullet': B.ringTwenty,    'type': T.blueOrb, 'shotCount': [ 60, 140, 220 ] },
        { 'bullet': B.ringTwentyOff, 'type': T.redOrb,  'shotCount': [ 100, 180, 260 ] }
      ],
      'v': [
        { 'count': 0,   'v': { 'r': 2, 'theta': 90, 'ra': -0.03, 'rrange': { 'min': 0 } } },
        { 'count': 300, 'v': { 'r': 0, 'theta': 270, 'ra': 0.04 } }
      ]
    } ) ;
  }

  // will-o'-wisps: fairies dive in and leave wisps that hunt the player
  for( var n = 0; n < 10; n++ ) {
    list.push( {
      'count': 4480 + n * 24,
      'x': 60 + ( n * 157 ) % 360,
      'vital': 3,
      'powerItem': n % 3 == 0 ? 1 : 0,
      'scoreItem': n % 3 != 0 ? 1 : 0,
      's': { 'bullet': B.wisps, 'type': T.cyanOrb, 'shotCount': [ 35 ] },
      'v': [
        { 'count': 0,  'v': { 'r': 3, 'theta': 90, 'ra': -0.05, 'rrange': { 'min': 0.5 } } },
        { 'count': 60, 'v': { 'r': 0.5, 'theta': n % 2 == 0 ? 330 : 210, 'ra': 0.05 } }
      ]
    } ) ;
  }

  // last before keine: charm throwers, their charms bounce off the walls once
  var charmSpots = [ 100, 380, 180, 300, 240, 60, 420 ] ;
  for( var thrower = 0; thrower < charmSpots.length; thrower++ ) {
    list.push( {
      'count': 4820 + thrower * 45,
      'x': charmSpots[ thrower ],
      'look': 'yellow',
      'vital': 8,
      'powerItem': thrower % 2 == 0 ? 1 : 0,
      'scoreItem': 2,
      's': { 'bullet': B.charms, 'type': T.orangeRice, 'shotCount': [ 45, 85, 125 ] },
      'v': [
        { 'count': 0,   'v': { 'r': 2.6, 'theta': 90, 'ra': -0.05, 'rrange': { 'min': 0 } } },
        { 'count': 160, 'v': { 'r': 0, 'theta': 270, 'ra': 0.05 } }
      ]
    } ) ;
  }

  // enemies come out in list order, so keep the list sorted by time
  list.sort( function( a, b ) { return a.count - b.count ; } ) ;
} ) ( ) ;

__enemiesParams.push( __stage3EnemiesParams ) ;


var __stage3BossParams = [ ] ;

( function( ) {
  var B = __stage3Bullets ;
  var T = __stage3Types ;

  __stage3BossParams.push( {
    'count': 2420,
    'character': 'kogasa',
    'width': 128,
    'height': 128,
    'collisionWidth': 50,
    'collisionHeight': 50,
    'appearedTalk': false,
    'vanishedTalk': false,
    'dead': 'escape',
    'x': 240,
    'y': 0,
    'animation': 3,
    'powerItem': 1,
    'score': 1000,
    'params': [
      {
        'spellCard': false,
        'x': 240,
        'y': 120,
        'vital': 260,
        's': [
          { 'bullet': B.umbrellaSpin,     'type': T.purpleRice, 'shotCount': [ 0 ],       'baseCount': 160 },
          { 'bullet': B.umbrellaSpinBack, 'type': T.purpleRice, 'shotCount': [ 80 ],      'baseCount': 160 },
          { 'bullet': B.aimFive,          'type': T.blueOrb,    'shotCount': [ 40, 120 ], 'baseCount': 160 }
        ],
        'v': [
          { 'count': 0,   'v': { 'r': 0, 'theta': 90 } },
          { 'count': 60,  'v': { 'target': { 'x': { 'min': 120, 'max': 200 }, 'y': { 'min': 90, 'max': 140 }, 'count': 60 } } },
          { 'count': 120, 'v': { 'r': 0, 'theta': 90 } },
          { 'count': 160, 'v': { 'target': { 'x': { 'min': 280, 'max': 360 }, 'y': { 'min': 90, 'max': 140 }, 'count': 60 } } },
          { 'count': 220, 'v': { 'r': 0, 'theta': 90 } },
          { 'count': 260, 'v': 1 }
        ]
      },
      {
        'spellCard': 'Surprise Sign "Sudden Evening Shower"',
        'x': 240,
        'y': 90,
        'vital': 300,
        's': [
          { 'bullet': B.rainDrop,        'type': T.blueRice, 'shotCount': [ 0, 6, 12, 18, 24, 30, 36, 42, 48, 54 ], 'baseCount': 60 },
          { 'bullet': B.ringSixteenSlow, 'type': T.purpleOrb, 'shotCount': [ 30 ], 'baseCount': 120 }
        ],
        'v': [
          { 'count': 0,   'v': { 'r': 0, 'theta': 90 } },
          { 'count': 240, 'v': { 'target': { 'x': { 'min': 210, 'max': 270 }, 'y': { 'min': 80, 'max': 100 }, 'count': 90 } } },
          { 'count': 330, 'v': { 'r': 0, 'theta': 90 } },
          { 'count': 480, 'v': 1 }
        ]
      }
    ]
  } ) ;

  __stage3BossParams.push( {
    'count': 5300,
    'character': 'keine',
    'width': 128,
    'height': 128,
    'collisionWidth': 50,
    'collisionHeight': 50,
    'appearedTalk': true,
    'vanishedTalk': true,
    'x': 240,
    'y': 0,
    'animation': 3,
    'powerItem': 1,
    'score': 5000,
    'params': [
      {
        'spellCard': false,
        'x': 240,
        'y': 120,
        'vital': 320,
        's': [
          { 'bullet': B.kunaiFan,      'type': T.blueKunai, 'shotCount': [ 20, 28, 36 ], 'baseCount': 120 },
          { 'bullet': B.ringTwenty,    'type': T.redOrb,    'shotCount': [ 70 ],         'baseCount': 120 },
          { 'bullet': B.ringTwentyOff, 'type': T.redOrb,    'shotCount': [ 90 ],         'baseCount': 120 }
        ],
        'v': [
          { 'count': 0,   'v': { 'r': 0, 'theta': 90 } },
          { 'count': 100, 'v': { 'target': { 'x': { 'min': 140, 'max': 340 }, 'y': { 'min': 90, 'max': 150 }, 'count': 40 } } },
          { 'count': 140, 'v': { 'r': 0, 'theta': 90 } },
          { 'count': 240, 'v': 1 }
        ]
      },
      {
        'spellCard': 'History Sign "Ledger of Hidden Pages"',
        'x': 240,
        'y': 60,
        'vital': 360,
        's': [
          { 'bullet': B.ledgerPage0, 'type': T.blueOrb, 'shotCount': [ 0 ],   'baseCount': 360 },
          { 'bullet': B.ledgerPage1, 'type': T.blueOrb, 'shotCount': [ 60 ],  'baseCount': 360 },
          { 'bullet': B.ledgerPage2, 'type': T.blueOrb, 'shotCount': [ 120 ], 'baseCount': 360 },
          { 'bullet': B.ledgerPage3, 'type': T.blueOrb, 'shotCount': [ 180 ], 'baseCount': 360 },
          { 'bullet': B.ledgerPage4, 'type': T.blueOrb, 'shotCount': [ 240 ], 'baseCount': 360 },
          { 'bullet': B.ledgerPage5, 'type': T.blueOrb, 'shotCount': [ 300 ], 'baseCount': 360 },
          { 'bullet': B.aimOne,      'type': T.redOrb,  'shotCount': [ 30, 90, 150, 210, 270, 330 ], 'baseCount': 360 }
        ],
        'v': [
          { 'count': 0, 'v': { 'r': 0, 'theta': 90 } }
        ]
      },
      {
        'spellCard': false,
        'x': 240,
        'y': 120,
        'vital': 320,
        's': [
          { 'bullet': B.historySpiral,     'type': T.redRice,  'shotCount': [ 0 ],  'baseCount': 200 },
          { 'bullet': B.historySpiralBack, 'type': T.blueRice, 'shotCount': [ 60 ], 'baseCount': 200 }
        ],
        'v': [
          { 'count': 0,   'v': { 'r': 0, 'theta': 90 } },
          { 'count': 160, 'v': { 'target': { 'x': { 'min': 180, 'max': 300 }, 'y': { 'min': 100, 'max': 140 }, 'count': 40 } } },
          { 'count': 200, 'v': { 'r': 0, 'theta': 90 } },
          { 'count': 360, 'v': 1 }
        ]
      },
      {
        'spellCard': 'Veil Sign "The Village That Was Never There"',
        'x': 240,
        'y': 110,
        'vital': 360,
        's': [
          { 'bullet': B.hiddenVillage, 'type': T.cyanOrb,   'shotCount': [ 10, 60 ], 'baseCount': 120 },
          { 'bullet': B.kunaiThree,    'type': T.blueKunai, 'shotCount': [ 100 ],    'baseCount': 120 }
        ],
        'v': [
          { 'count': 0,   'v': { 'r': 0, 'theta': 90 } },
          { 'count': 110, 'v': { 'target': { 'x': { 'min': 120, 'max': 360 }, 'y': { 'min': 80, 'max': 160 }, 'count': 30 } } },
          { 'count': 140, 'v': { 'r': 0, 'theta': 90 } },
          { 'count': 230, 'v': 1 }
        ]
      },
      {
        'spellCard': 'Lesson Sign "Headbutt for Slow Learners"',
        'x': 240,
        'y': 100,
        'vital': 380,
        's': [
          { 'bullet': B.headbuttRing,    'type': T.redOrb,    'shotCount': [ 25 ],     'baseCount': 70 },
          { 'bullet': B.headbuttRingOff, 'type': T.blueOrb,   'shotCount': [ 35 ],     'baseCount': 70 },
          { 'bullet': B.kunaiThree,      'type': T.blueKunai, 'shotCount': [ 45, 55 ], 'baseCount': 70 }
        ],
        'v': [
          { 'count': 0,   'v': { 'r': 0, 'theta': 90 } },
          { 'count': 50,  'v': { 'target': { 'x': { 'min': 80, 'max': 400 }, 'y': { 'min': 60, 'max': 200 }, 'count': 15 } } },
          { 'count': 65,  'v': { 'r': 0, 'theta': 90 } },
          { 'count': 120, 'v': 1 }
        ]
      }
    ]
  } ) ;
} ) ( ) ;

__bossesParams.push( __stage3BossParams ) ;


var __reimuBossTalk3Params = [
  { 'serif': 'Stop right there. Nobody walks this road tonight.',
    'left':  { 'character': 'reimu' },
    'right': { 'character': 'keine', 'active': true } },
  { 'serif': 'This road goes to the village, doesn\'t it?\nAll I see is an empty field.',
    'left':  { 'character': 'reimu', 'active': true },
    'right': { 'character': 'keine' } },
  { 'serif': 'Exactly. I took it out of history for one night.\nGo home, shrine maiden.',
    'left':  { 'character': 'reimu' },
    'right': { 'character': 'keine', 'active': true } },
  { 'serif': 'Hiding a whole village sounds like an incident to me.',
    'left':  { 'character': 'reimu', 'active': true },
    'right': { 'character': 'keine' } }
] ;

var __marisaBossTalk3Params = [
  { 'serif': 'Stop. Nobody passes here tonight.',
    'left':  { 'character': 'marisa' },
    'right': { 'character': 'keine', 'active': true } },
  { 'serif': 'Huh? Wasn\'t there a village here yesterday?',
    'left':  { 'character': 'marisa', 'active': true },
    'right': { 'character': 'keine' } },
  { 'serif': 'Not tonight there wasn\'t. Go home, magician.',
    'left':  { 'character': 'marisa' },
    'right': { 'character': 'keine', 'active': true } },
  { 'serif': 'A missing village? Now I really want a look.',
    'left':  { 'character': 'marisa', 'active': true },
    'right': { 'character': 'keine' } }
] ;

var __reimuClearTalk3Params = [
  { 'serif': 'The village is back. So where is this night coming from?',
    'left':  { 'character': 'reimu', 'active': true } }
] ;

var __marisaClearTalk3Params = [
  { 'serif': 'Village is back. The real culprit must be further in.',
    'left':  { 'character': 'marisa', 'active': true } }
] ;

__talkParams.push( [
  [ __reimuBossTalk3Params, __marisaBossTalk3Params ],
  [ __reimuClearTalk3Params, __marisaClearTalk3Params ]
] ) ;


__stageParams.push( {
  'title': 'Night of the Vanished Village',
  'bgScale': [
    { 'beginCount':    0, 'endCount':    1, 'a': 0.8 },
    { 'beginCount':  500, 'endCount': 1500, 'd': 0.0002 },
    { 'beginCount': 2500, 'endCount': 3200, 'd': -0.0003 }
  ]
} ) ;
