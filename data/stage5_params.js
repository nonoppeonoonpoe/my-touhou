/*
 * stage 5: through the lost bamboo forest and into eientei.
 * mid-boss tewi, boss reisen.
 * loaded after stage 4, it borrows the older bullet looks and adds its own.
 */

var __stage5Types = { } ;
var __stage5Bullets = { } ;

( function( ) {
  // the 32 pixel rows on the bottom half of the bullet sheet: gun bullets, big orbs, eggs, knives
  var colorSlots = { 'white': 0, 'red': 1, 'yellow': 2, 'green': 3, 'cyan': 4, 'blue': 5, 'purple': 6, 'pink': 7 } ;
  var bigLooks = [
    { 'shape': 'Bullet', 'firstX': 0, 'rowY': 8, 'hit': 6,  'rotate': true },
    { 'shape': 'Orb',    'firstX': 8, 'rowY': 8, 'hit': 14, 'rotate': false },
    { 'shape': 'Egg',    'firstX': 0, 'rowY': 9, 'hit': 8,  'rotate': true },
    { 'shape': 'Knife',  'firstX': 8, 'rowY': 9, 'hit': 6,  'rotate': true }
  ] ;
  for( var lookNum = 0; lookNum < bigLooks.length; lookNum++ ) {
    var bigLook = bigLooks[ lookNum ] ;
    for( var colorName in colorSlots ) {
      __stage5Types[ colorName + bigLook.shape ] = __enemyBulletTypes.length ;
      __enemyBulletTypes.push( {
        'indexX': bigLook.firstX + colorSlots[ colorName ],
        'indexY': bigLook.rowY,
        'width': 32,
        'height': 32,
        'collisionWidth': bigLook.hit,
        'collisionHeight': bigLook.hit,
        'rotate': bigLook.rotate
      } ) ;
    }
  }

  __stage5Types.carrot = __enemyBulletTypes.length ;
  __enemyBulletTypes.push( {
    'indexX': 0,
    'indexY': 10,
    'width': 32,
    'height': 32,
    'collisionWidth': 6,
    'collisionHeight': 6,
    'rotate': true
  } ) ;

  function addBullet( name, bulletList ) {
    __stage5Bullets[ name ] = __enemyBulletsParams.length ;
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

  // tossed up in a fan, they arc over and fall back down
  function toss( tossNum, firstTheta, stepTheta, speed ) {
    var tossList = [ ] ;
    for( var i = 0; i < tossNum; i++ ) {
      tossList.push( { 'v': { 'r': speed, 'theta': firstTheta + i * stepTheta,
                              'g': { 'r': 0, 'theta': 90, 'ra': 0.045, 'rrange': { 'max': 2.6 } } } } ) ;
    }
    return tossList ;
  }

  // fairies
  addBullet( 'burrowRing', ring( 10, 1.6, 0 ) ) ;
  addBullet( 'burrowRingOff', ring( 10, 1.6, 18 ) ) ;
  addBullet( 'aimThree', aimedFan( 3, 18, 3.4 ) ) ;
  addBullet( 'darts', aimedFan( 2, 6, 4.6 ) ) ;
  addBullet( 'moonRing', ring( 20, 2.2, 0 ) ) ;
  addBullet( 'moonRingOff', ring( 20, 2.2, 9 ) ) ;
  addBullet( 'eggSpiral', spiral( 4, 22, 10, 2.2, 3 ) ) ;
  addBullet( 'eggSpiralBack', spiral( 4, 22, -10, 2.2, 3 ) ) ;
  addBullet( 'shoots', toss( 5, 245, 12.5, 3.4 ) ) ;
  addBullet( 'aimOne', aimedFan( 1, 0, 3.6 ) ) ;

  // a short burst that follows the player, every bullet aims when it comes out
  var burstList = [ ] ;
  for( var shot = 0; shot < 6; shot++ )
    burstList.push( { 'count': shot * 5, 'v': { 'aimed': true, 'r': 4, 'theta': 0 } } ) ;
  addBullet( 'burst', burstList ) ;

  // stop and aim: a ring opens, freezes, then every bullet turns at the player
  function stopAndAim( bulletNum, startTheta ) {
    var aimList = [ ] ;
    for( var i = 0; i < bulletNum; i++ ) {
      aimList.push( { 'v': [
        { 'count': 0,  'v': { 'r': 2.6, 'theta': startTheta + i * 360 / bulletNum, 'ra': -0.06, 'rrange': { 'min': 0 } } },
        { 'count': 60, 'v': { 'aimed': true, 'r': 0.4, 'theta': 0, 'ra': 0.06, 'rrange': { 'max': 3.2 } } }
      ] } ) ;
    }
    return aimList ;
  }
  addBullet( 'stopAim', stopAndAim( 12, 0 ) ) ;
  addBullet( 'stopAimOff', stopAndAim( 12, 15 ) ) ;

  // bounces off the side walls once
  var bounceList = [ ] ;
  for( var shard = 0; shard < 14; shard++ )
    bounceList.push( { 'v': { 'r': 2.2, 'theta': 12 + shard * 360 / 14, 'reflectX': true, 'reflectCount': 1 } } ) ;
  addBullet( 'bounceRing', bounceList ) ;

  addBullet( 'twinSpiral', spiral( 2, 30, 13, 2.4, 3 ) ) ;
  addBullet( 'twinSpiralBack', spiral( 2, 30, -13, 2.4, 3 ) ) ;
  addBullet( 'ringSixteen', ring( 16, 1.8, 0 ) ) ;

  // tewi
  addBullet( 'carrotFan', aimedFan( 5, 40, 3.4 ) ) ;
  addBullet( 'luckRing', ring( 16, 2, 0 ) ) ;
  addBullet( 'luckRingOff', ring( 16, 2, 11.25 ) ) ;
  addBullet( 'carrotToss', toss( 11, 210, 12, 3.6 ) ) ;
  addBullet( 'carrotTossOff', toss( 10, 216, 12, 3.2 ) ) ;

  // pitfall: a ring spreads out, stops, then drops straight down like the floor gave way
  function pitfall( startTheta ) {
    var pitList = [ ] ;
    for( var i = 0; i < 20; i++ ) {
      pitList.push( { 'v': [
        { 'count': 0,  'v': { 'r': 2.8, 'theta': startTheta + i * 18, 'ra': -0.06, 'rrange': { 'min': 0 } } },
        { 'count': 50, 'v': { 'r': 0, 'theta': 90, 'ra': 0.05, 'rrange': { 'max': 2.6 } } }
      ] } ) ;
    }
    return pitList ;
  }
  addBullet( 'pitfall', pitfall( 0 ) ) ;
  addBullet( 'pitfallOff', pitfall( 9 ) ) ;

  // reisen
  // a quick volley, three fans in a row
  var volleyList = [ ] ;
  for( var round = 0; round < 3; round++ ) {
    for( var barrel = 0; barrel < 5; barrel++ )
      volleyList.push( { 'count': round * 8, 'v': { 'aimed': true, 'r': 4.4, 'theta': -24 + barrel * 12 } } ) ;
  }
  addBullet( 'gunVolley', volleyList ) ;
  addBullet( 'ringTwentyFour', ring( 24, 2.2, 0 ) ) ;
  addBullet( 'ringTwentyFourOff', ring( 24, 2.2, 7.5 ) ) ;

  // ripple: a ring slows down, changes color, then curls off to one side
  function ripple( curl, startTheta ) {
    var rippleList = [ ] ;
    for( var i = 0; i < 24; i++ ) {
      rippleList.push( { 'v': [
        { 'count': 0,  'v': { 'r': 3, 'theta': startTheta + i * 15, 'ra': -0.05, 'rrange': { 'min': 0.6 } } },
        { 'count': 50, 'turnInto': __stage5Types.redBullet, 'v': { 'r': 0.6, 'w': curl, 'wa': -curl / 60, 'wrange': curl > 0 ? { 'min': 0 } : { 'max': 0 }, 'ra': 0.04, 'rrange': { 'max': 2.6 } } }
      ] } ) ;
    }
    return rippleList ;
  }
  addBullet( 'rippleLeft', ripple( 2.2, 0 ) ) ;
  addBullet( 'rippleRight', ripple( -2.2, 7.5 ) ) ;

  // mind shaker: bullets fly out, stop dead, then come back as knives at the player
  function shaker( startTheta ) {
    var shakeList = [ ] ;
    for( var i = 0; i < 18; i++ ) {
      shakeList.push( { 'v': [
        { 'count': 0,  'v': { 'r': 4, 'theta': startTheta + i * 20, 'ra': -0.08, 'rrange': { 'min': 0 } } },
        { 'count': 70, 'turnInto': __stage5Types.purpleKnife, 'v': { 'aimed': true, 'r': 0.5, 'theta': 0, 'ra': 0.08, 'rrange': { 'max': 3.6 } } }
      ] } ) ;
    }
    return shakeList ;
  }
  addBullet( 'shakerA', shaker( 0 ) ) ;
  addBullet( 'shakerB', shaker( 10 ) ) ;

  // lunatic gaze: rings that bounce off the side walls, twice
  function gaze( startTheta ) {
    var gazeList = [ ] ;
    for( var i = 0; i < 20; i++ )
      gazeList.push( { 'v': { 'r': 2.4, 'theta': startTheta + i * 18, 'reflectX': true, 'reflectCount': 2 } } ) ;
    return gazeList ;
  }
  addBullet( 'gazeRing', gaze( 4.5 ) ) ;
  addBullet( 'gazeRingOff', gaze( 13.5 ) ) ;
} ) ( ) ;


var __stage5EnemiesParams = [ ] ;

( function( ) {
  var B = __stage5Bullets ;
  var T = __stage3Types ;
  var T4 = __stage4Types ;
  var T5 = __stage5Types ;
  var list = __stage5EnemiesParams ;

  // into the bamboo: rabbit fairies drop in, hop to the side and leave
  for( var hop = 0; hop < 14; hop++ ) {
    var hopLeft = hop % 2 == 0 ;
    list.push( {
      'count': 60 + hop * 28,
      'x': hopLeft ? 80 + ( hop % 4 ) * 30 : 400 - ( hop % 4 ) * 30,
      'look': 'paleblue',
      'vital': 4,
      'powerItem': hop % 3 == 0 ? 1 : 0,
      'scoreItem': hop % 3 != 0 ? 1 : 0,
      's': [
        { 'bullet': B.burrowRing, 'type': T5.pinkEgg,     'shotCount': [ 40 ] },
        { 'bullet': B.aimThree,   'type': T5.whiteBullet, 'shotCount': [ 70 ] }
      ],
      'v': [
        { 'count': 0,   'v': { 'r': 3, 'theta': 90, 'ra': -0.05, 'rrange': { 'min': 0.4 } } },
        { 'count': 80,  'v': { 'r': 0.4, 'theta': hopLeft ? 200 : 340, 'ra': 0.05, 'rrange': { 'max': 3 } } }
      ]
    } ) ;
  }

  // bamboo lanes: fairies come down both edges firing quick darts
  for( var lane = 0; lane < 16; lane++ ) {
    var leftLane = lane % 2 == 0 ;
    list.push( {
      'count': 480 + lane * 20,
      'x': leftLane ? 30 : 450,
      'look': 'blue',
      'vital': 3,
      'powerItem': lane % 4 == 0 ? 1 : 0,
      'scoreItem': 1,
      's': { 'bullet': B.darts, 'type': T5.redBullet, 'shotCount': [ 35, 85 ] },
      'v': { 'r': 2.2, 'theta': leftLane ? 80 : 100 }
    } ) ;
  }

  // moonlight fairies: two big ones stop and fire rings of orbs and egg spirals
  for( var moon = 0; moon < 2; moon++ ) {
    list.push( {
      'count': 900 + moon * 110,
      'x': moon == 0 ? 140 : 340,
      'look': 'bigwhite',
      'vital': 26,
      'powerItem': 2,
      'scoreItem': 3,
      's': [
        { 'bullet': B.moonRing,    'type': T5.blueOrb,   'shotCount': [ 50, 170 ] },
        { 'bullet': B.moonRingOff, 'type': T5.blueOrb,   'shotCount': [ 110, 230 ] },
        { 'bullet': moon == 0 ? B.eggSpiral : B.eggSpiralBack, 'type': T5.purpleEgg, 'shotCount': [ 80 ] }
      ],
      'v': [
        { 'count': 0,   'v': { 'r': 2.2, 'theta': 90, 'ra': -0.04, 'rrange': { 'min': 0 } } },
        { 'count': 290, 'v': { 'r': 0, 'theta': 270, 'ra': 0.04 } }
      ]
    } ) ;
  }

  // bamboo shoots: fairies spring up from below and toss carrots that fall back
  for( var shoot = 0; shoot < 10; shoot++ ) {
    var leftShoot = shoot % 2 == 0 ;
    list.push( {
      'count': 1360 + shoot * 22,
      'x': leftShoot ? 10 : 470,
      'y': 470,
      'look': 'yellow',
      'vital': 4,
      'powerItem': shoot % 3 == 0 ? 1 : 0,
      'scoreItem': shoot % 3 != 0 ? 1 : 0,
      's': { 'bullet': B.shoots, 'type': T5.carrot, 'shotCount': [ 30, 70 ] },
      'v': { 'r': 3.2, 'theta': leftShoot ? 300 : 240 }
    } ) ;
  }

  // circling fairies throw knives at the player
  for( var circler = 0; circler < 12; circler++ ) {
    var leftCircler = circler % 2 == 0 ;
    list.push( {
      'count': 1760 + circler * 26,
      'x': leftCircler ? 110 : 370,
      'look': 'paleyellow',
      'vital': 4,
      'powerItem': circler % 3 == 0 ? 1 : 0,
      'scoreItem': 1,
      's': { 'bullet': B.aimOne, 'type': T5.cyanKnife, 'shotCount': [ 40, 90, 140 ] },
      'v': [
        { 'count': 0,   'v': { 'r': 2.2, 'theta': 90, 'w': leftCircler ? -1.3 : 1.3 } },
        { 'count': 200, 'v': { 'r': 2.8, 'w': 0 } }
      ]
    } ) ;
  }

  // two sunflower fairies hold the clearing with crossed rings of eggs
  for( var guard = 0; guard < 2; guard++ ) {
    list.push( {
      'count': 2260 + guard * 60,
      'x': guard == 0 ? 120 : 360,
      'look': 'sunflower',
      'vital': 30,
      'powerItem': 2,
      'scoreItem': 4,
      's': [
        { 'bullet': B.burrowRing,    'type': T5.pinkEgg,   'shotCount': [ 50, 110, 170 ] },
        { 'bullet': B.burrowRingOff, 'type': T5.yellowEgg, 'shotCount': [ 80, 140, 200 ] },
        { 'bullet': B.aimThree,      'type': T5.redBullet, 'shotCount': [ 65, 125, 185 ] }
      ],
      'v': [
        { 'count': 0,   'v': { 'r': 2, 'theta': 90, 'ra': -0.03, 'rrange': { 'min': 0 } } },
        { 'count': 240, 'v': { 'r': 0, 'theta': 270, 'ra': 0.05 } }
      ]
    } ) ;
  }

  // a last rush of rabbits before tewi shows up
  for( var rush = 0; rush < 10; rush++ ) {
    list.push( {
      'count': 2620 + rush * 18,
      'x': 50 + ( rush * 167 ) % 380,
      'look': 'paleblue',
      'vital': 3,
      'powerItem': rush % 2 == 0 ? 1 : 0,
      'scoreItem': 1,
      's': { 'bullet': B.aimOne, 'type': T5.pinkBullet, 'shotCount': [ 30 ] },
      'v': [
        { 'count': 0,  'v': { 'r': 3.4, 'theta': 90, 'ra': -0.06, 'rrange': { 'min': 0.6 } } },
        { 'count': 50, 'v': { 'r': 0.6, 'theta': rush % 2 == 0 ? 330 : 210, 'ra': 0.06 } }
      ]
    } ) ;
  }

  // eientei: door guards march down the walls and fire bursts at the player
  for( var door = 0; door < 12; door++ ) {
    var leftDoor = door % 2 == 0 ;
    list.push( {
      'count': 3050 + door * 34,
      'x': leftDoor ? 60 : 420,
      'look': 'blue',
      'vital': 6,
      'powerItem': door % 3 == 0 ? 1 : 0,
      'scoreItem': 2,
      's': { 'bullet': B.burst, 'type': T5.redBullet, 'shotCount': [ 40, 110 ] },
      'v': [
        { 'count': 0,   'v': { 'r': 1.8, 'theta': 90 } },
        { 'count': 150, 'v': { 'r': 2.4, 'theta': leftDoor ? 60 : 120 } }
      ]
    } ) ;
  }

  // moon rings: fairies stop in a row across the hall and fire offset rings
  var ringSpots = [ 100, 380, 180, 300, 240 ] ;
  for( var ringer = 0; ringer < ringSpots.length; ringer++ ) {
    list.push( {
      'count': 3560 + ringer * 60,
      'x': ringSpots[ ringer ],
      'look': 'yellow',
      'vital': 10,
      'powerItem': 1,
      'scoreItem': 2,
      's': [
        { 'bullet': B.moonRing,    'type': T5.purpleBullet, 'shotCount': [ 50 ] },
        { 'bullet': B.moonRingOff, 'type': T5.blueBullet,   'shotCount': [ 100 ] },
        { 'bullet': B.aimThree,    'type': T.redRice,       'shotCount': [ 140 ] }
      ],
      'v': [
        { 'count': 0,   'v': { 'r': 3, 'theta': 90, 'ra': -0.06, 'rrange': { 'min': 0 } } },
        { 'count': 170, 'v': { 'r': 0, 'theta': 270, 'ra': 0.05 } }
      ]
    } ) ;
  }

  // stop and aim: big fairies whose rings freeze and then turn on the player
  for( var stopper = 0; stopper < 2; stopper++ ) {
    list.push( {
      'count': 4080 + stopper * 100,
      'x': stopper == 0 ? 150 : 330,
      'look': 'bigwhite',
      'vital': 24,
      'powerItem': 2,
      'scoreItem': 3,
      's': [
        { 'bullet': B.stopAim,    'type': T5.greenEgg, 'shotCount': [ 50, 170 ] },
        { 'bullet': B.stopAimOff, 'type': T5.cyanEgg,  'shotCount': [ 110, 230 ] }
      ],
      'v': [
        { 'count': 0,   'v': { 'r': 2.2, 'theta': 90, 'ra': -0.045, 'rrange': { 'min': 0 } } },
        { 'count': 280, 'v': { 'r': 0, 'theta': 270, 'ra': 0.04 } }
      ]
    } ) ;
  }

  // two streams cross the hall from the sides
  for( var cross = 0; cross < 12; cross++ ) {
    list.push( {
      'count': 4600 + cross * 20,
      'x': 0,
      'y': 50 + ( cross % 3 ) * 30,
      'vital': 3,
      'powerItem': cross % 3 == 0 ? 1 : 0,
      'scoreItem': cross % 3 != 0 ? 1 : 0,
      's': { 'bullet': B.aimThree, 'type': T5.purpleBullet, 'shotCount': [ 30, 60 ] },
      'v': { 'r': 2.4, 'theta': 12 }
    } ) ;
    list.push( {
      'count': 4610 + cross * 20,
      'x': 480,
      'y': 65 + ( cross % 3 ) * 30,
      'vital': 3,
      'powerItem': cross % 3 == 1 ? 1 : 0,
      'scoreItem': cross % 3 != 1 ? 1 : 0,
      's': { 'bullet': B.aimThree, 'type': T5.purpleBullet, 'shotCount': [ 30, 60 ] },
      'v': { 'r': 2.4, 'theta': 168 }
    } ) ;
  }

  // mirror rabbits: their knife rings bounce off the walls of the hall
  for( var mirror = 0; mirror < 4; mirror++ ) {
    list.push( {
      'count': 5160 + mirror * 70,
      'x': [ 100, 380, 170, 310 ][ mirror ],
      'look': 'paleyellow',
      'vital': 12,
      'powerItem': 1,
      'scoreItem': 2,
      's': [
        { 'bullet': B.bounceRing, 'type': T5.purpleKnife, 'shotCount': [ 50, 140 ] },
        { 'bullet': B.aimOne,     'type': T5.redBullet,   'shotCount': [ 95 ] }
      ],
      'v': [
        { 'count': 0,   'v': { 'r': 2.6, 'theta': 90, 'ra': -0.05, 'rrange': { 'min': 0 } } },
        { 'count': 190, 'v': { 'r': 0, 'theta': 270, 'ra': 0.05 } }
      ]
    } ) ;
  }

  // two sunflower fairies spin twin spirals both ways
  for( var spinner = 0; spinner < 2; spinner++ ) {
    list.push( {
      'count': 5620 + spinner * 50,
      'x': spinner == 0 ? 140 : 340,
      'look': 'sunflower',
      'vital': 30,
      'powerItem': 2,
      'scoreItem': 4,
      's': [
        { 'bullet': spinner == 0 ? B.twinSpiral : B.twinSpiralBack, 'type': T5.cyanBullet, 'shotCount': [ 50 ] },
        { 'bullet': spinner == 0 ? B.twinSpiralBack : B.twinSpiral, 'type': T5.redBullet,  'shotCount': [ 150 ] },
        { 'bullet': B.ringSixteen, 'type': T5.whiteOrb, 'shotCount': [ 120, 220 ] }
      ],
      'v': [
        { 'count': 0,   'v': { 'r': 2.2, 'theta': 90, 'ra': -0.045, 'rrange': { 'min': 0 } } },
        { 'count': 270, 'v': { 'r': 0, 'theta': 270, 'ra': 0.04 } }
      ]
    } ) ;
  }

  // rabbit parade: a long line hops across the hall in a wave until reisen arrives
  for( var marcher = 0; marcher < 20; marcher++ ) {
    var leftMarch = marcher < 10 ;
    var marchSteps = [ { 'count': 0, 'v': { 'r': 2.2, 'theta': leftMarch ? -20 : 200, 'w': leftMarch ? 1 : -1 } } ] ;
    for( var swing = 1; swing < 7; swing++ )
      marchSteps.push( { 'count': swing * 40, 'v': { 'r': 2.2, 'w': ( swing % 2 == 0 ? 1 : -1 ) * ( leftMarch ? 1 : -1 ) } } ) ;
    marchSteps.push( { 'count': 280, 'v': { 'r': 2.2, 'w': 0 } } ) ;
    list.push( {
      'count': 6060 + marcher * 26,
      'x': leftMarch ? 0 : 480,
      'y': leftMarch ? 90 : 150,
      'look': marcher % 2 == 0 ? 'blue' : 'paleblue',
      'vital': 3,
      'powerItem': marcher % 4 == 0 ? 1 : 0,
      'scoreItem': 1,
      's': { 'bullet': B.aimOne, 'type': T5.pinkEgg, 'shotCount': [ 60 ] },
      'v': marchSteps
    } ) ;
  }

  list.sort( function( a, b ) { return a.count - b.count ; } ) ;
} ) ( ) ;

__enemiesParams.push( __stage5EnemiesParams ) ;


var __stage5BossParams = [ ] ;

( function( ) {
  var B = __stage5Bullets ;
  var T = __stage3Types ;
  var T5 = __stage5Types ;

  __stage5BossParams.push( {
    'count': 3000,
    'character': 'tewi',
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
    'score': 1800,
    'params': [
      {
        'spellCard': false,
        'x': 240,
        'y': 120,
        'vital': 300,
        's': [
          { 'bullet': B.luckRing,    'type': T5.pinkEgg, 'shotCount': [ 0 ],       'baseCount': 120 },
          { 'bullet': B.luckRingOff, 'type': T5.whiteEgg, 'shotCount': [ 60 ],     'baseCount': 120 },
          { 'bullet': B.carrotFan,   'type': T5.carrot,  'shotCount': [ 30, 90 ],  'baseCount': 120 }
        ],
        'v': [
          { 'count': 0,   'v': { 'r': 0, 'theta': 90 } },
          { 'count': 240, 'v': { 'target': { 'x': { 'min': 150, 'max': 330 }, 'y': { 'min': 100, 'max': 140 }, 'count': 50 } } },
          { 'count': 290, 'v': { 'r': 0, 'theta': 90 } },
          { 'count': 480, 'v': 1 }
        ]
      },
      {
        'spellCard': 'Rabbit Sign "Lucky Pitfall"',
        'x': 240,
        'y': 90,
        'vital': 340,
        's': [
          { 'bullet': B.carrotToss,    'type': T5.carrot,   'shotCount': [ 0 ],   'baseCount': 160 },
          { 'bullet': B.carrotTossOff, 'type': T5.carrot,   'shotCount': [ 80 ],  'baseCount': 160 },
          { 'bullet': B.pitfall,       'type': T5.pinkOrb,  'shotCount': [ 40 ],  'baseCount': 160 },
          { 'bullet': B.pitfallOff,    'type': T5.whiteOrb, 'shotCount': [ 120 ], 'baseCount': 160 }
        ],
        'v': [
          { 'count': 0,   'v': { 'r': 0, 'theta': 90 } },
          { 'count': 160, 'v': { 'target': { 'x': { 'min': 140, 'max': 340 }, 'y': { 'min': 70, 'max': 110 }, 'count': 40 } } },
          { 'count': 200, 'v': { 'r': 0, 'theta': 90 } },
          { 'count': 320, 'v': 1 }
        ]
      }
    ]
  } ) ;

  __stage5BossParams.push( {
    'count': 6950,
    'character': 'reisen',
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
    'score': 7000,
    'params': [
      {
        'spellCard': false,
        'x': 240,
        'y': 110,
        'vital': 360,
        's': [
          { 'bullet': B.gunVolley,         'type': T5.redBullet,  'shotCount': [ 20, 80 ], 'baseCount': 160 },
          { 'bullet': B.ringTwentyFour,    'type': T5.blueBullet, 'shotCount': [ 50 ],     'baseCount': 160 },
          { 'bullet': B.ringTwentyFourOff, 'type': T5.blueBullet, 'shotCount': [ 110 ],    'baseCount': 160 }
        ],
        'v': [
          { 'count': 0,   'v': { 'r': 0, 'theta': 90 } },
          { 'count': 160, 'v': { 'target': { 'x': { 'min': 150, 'max': 330 }, 'y': { 'min': 90, 'max': 130 }, 'count': 50 } } },
          { 'count': 210, 'v': { 'r': 0, 'theta': 90 } },
          { 'count': 320, 'v': 1 }
        ]
      },
      {
        'spellCard': 'Wave Sign "Red Eye Ripple"',
        'x': 240,
        'y': 110,
        'vital': 400,
        's': [
          { 'bullet': B.rippleLeft,  'type': T5.purpleBullet, 'shotCount': [ 0 ],      'baseCount': 140 },
          { 'bullet': B.rippleRight, 'type': T5.blueBullet,   'shotCount': [ 70 ],     'baseCount': 140 },
          { 'bullet': B.aimOne,      'type': T5.redOrb,       'shotCount': [ 35, 105 ], 'baseCount': 140 }
        ],
        'v': [
          { 'count': 0, 'v': { 'r': 0, 'theta': 90 } }
        ]
      },
      {
        'spellCard': false,
        'x': 240,
        'y': 120,
        'vital': 360,
        's': [
          { 'bullet': B.twinSpiral,     'type': T5.redBullet,  'shotCount': [ 0 ],   'baseCount': 180 },
          { 'bullet': B.twinSpiralBack, 'type': T5.blueBullet, 'shotCount': [ 60 ],  'baseCount': 180 },
          { 'bullet': B.moonRing,       'type': T5.purpleEgg,  'shotCount': [ 120 ], 'baseCount': 180 },
          { 'bullet': B.moonRingOff,    'type': T5.purpleEgg,  'shotCount': [ 150 ], 'baseCount': 180 }
        ],
        'v': [
          { 'count': 0,   'v': { 'r': 0, 'theta': 90 } },
          { 'count': 180, 'v': { 'target': { 'x': { 'min': 170, 'max': 310 }, 'y': { 'min': 100, 'max': 140 }, 'count': 40 } } },
          { 'count': 220, 'v': { 'r': 0, 'theta': 90 } },
          { 'count': 360, 'v': 1 }
        ]
      },
      {
        'spellCard': 'Mad Sign "Mind Shaker"',
        'x': 240,
        'y': 90,
        'vital': 400,
        's': [
          { 'bullet': B.shakerA,   'type': T5.redBullet,   'shotCount': [ 0 ],       'baseCount': 150 },
          { 'bullet': B.shakerB,   'type': T5.pinkBullet,  'shotCount': [ 75 ],      'baseCount': 150 },
          { 'bullet': B.gunVolley, 'type': T5.whiteBullet, 'shotCount': [ 40, 115 ], 'baseCount': 150 }
        ],
        'v': [
          { 'count': 0,   'v': { 'r': 0, 'theta': 90 } },
          { 'count': 150, 'v': { 'target': { 'x': { 'min': 180, 'max': 300 }, 'y': { 'min': 80, 'max': 100 }, 'count': 40 } } },
          { 'count': 190, 'v': { 'r': 0, 'theta': 90 } },
          { 'count': 300, 'v': 1 }
        ]
      },
      {
        'spellCard': 'Lunatic Sign "Gaze of the Full Moon"',
        'x': 240,
        'y': 110,
        'vital': 440,
        's': [
          { 'bullet': B.gazeRing,    'type': T5.redOrb,      'shotCount': [ 0 ],       'baseCount': 160 },
          { 'bullet': B.gazeRingOff, 'type': T5.purpleOrb,   'shotCount': [ 80 ],      'baseCount': 160 },
          { 'bullet': B.burst,       'type': T5.cyanBullet,  'shotCount': [ 40, 120 ], 'baseCount': 160 }
        ],
        'v': [
          { 'count': 0,   'v': { 'r': 0, 'theta': 90 } },
          { 'count': 160, 'v': { 'target': { 'x': { 'min': 140, 'max': 340 }, 'y': { 'min': 90, 'max': 130 }, 'count': 40 } } },
          { 'count': 200, 'v': { 'r': 0, 'theta': 90 } },
          { 'count': 320, 'v': 1 }
        ]
      }
    ]
  } ) ;
} ) ( ) ;

__bossesParams.push( __stage5BossParams ) ;


__stageParams.push( {
  'title': 'Lost Rabbits of the Bamboo Night',
  'bgScale': [
    { 'beginCount':    0, 'endCount':    1, 'a': 0.8 },
    { 'beginCount':  500, 'endCount': 1500, 'd': 0.0002 },
    { 'beginCount': 2600, 'endCount': 3300, 'd': -0.0003 }
  ]
} ) ;
