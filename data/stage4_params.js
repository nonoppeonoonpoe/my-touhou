/*
 * stage 4: over the hill of lilies and into the forest of magic.
 * mid-boss medicine, boss alice.
 * loaded after stage 3, it borrows stage 3's bullet looks and adds its own.
 */

var __stage4Bullets = { } ;

( function( ) {
  var T = __stage3Types ;

  function addBullet( name, bulletList ) {
    __stage4Bullets[ name ] = __enemyBulletsParams.length ;
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

  // pollen: small slow rings from the lily fairies
  addBullet( 'pollen', ring( 8, 1.5, 0 ) ) ;
  addBullet( 'pollenOff', ring( 8, 1.5, 22.5 ) ) ;

  // miasma: a ring spreads out, stops, then sinks down like heavy air
  function miasma( startTheta ) {
    var miasmaList = [ ] ;
    for( var i = 0; i < 16; i++ ) {
      miasmaList.push( { 'v': [
        { 'count': 0,  'v': { 'r': 2.6, 'theta': startTheta + i * 22.5, 'ra': -0.05, 'rrange': { 'min': 0.1 } } },
        { 'count': 60, 'v': { 'r': 0.1, 'theta': 90, 'ra': 0.02, 'rrange': { 'max': 1.5 } } }
      ] } ) ;
    }
    return miasmaList ;
  }
  addBullet( 'miasma', miasma( 0 ) ) ;
  addBullet( 'miasmaOff', miasma( 11.25 ) ) ;

  addBullet( 'aimThree', aimedFan( 3, 20, 3.2 ) ) ;
  addBullet( 'bellSpiral', spiral( 5, 24, 9, 2.2, 3 ) ) ;
  addBullet( 'bellSpiralBack', spiral( 5, 24, -9, 2.2, 3 ) ) ;

  // thread: a short stream that follows the player, every bullet aims when it comes out
  var threadList = [ ] ;
  for( var stitch = 0; stitch < 8; stitch++ )
    threadList.push( { 'count': stitch * 4, 'v': { 'aimed': true, 'r': 3.4, 'theta': 0 } } ) ;
  addBullet( 'thread', threadList ) ;

  // spores: thrown up from below, they arc over and fall
  var sporeList = [ ] ;
  var sporeAngles = [ 240, 255, 270, 285, 300 ] ;
  for( var spore = 0; spore < sporeAngles.length; spore++ ) {
    sporeList.push( { 'v': { 'r': 3.4, 'theta': sporeAngles[ spore ],
                             'g': { 'r': 0, 'theta': 90, 'ra': 0.05, 'rrange': { 'max': 3 } } } } ) ;
  }
  addBullet( 'spores', sporeList ) ;

  addBullet( 'ringEighteen', ring( 18, 2.2, 0 ) ) ;
  addBullet( 'ringEighteenOff', ring( 18, 2.2, 10 ) ) ;

  // medicine
  addBullet( 'poisonRing', ring( 18, 2, 0 ) ) ;
  addBullet( 'poisonRingOff', ring( 18, 2, 10 ) ) ;
  addBullet( 'aimFive', aimedFan( 5, 44, 3.2 ) ) ;

  // sweet bell mist: a ring opens, hangs still, then drifts down every which way and turns poison green
  var mistList = [ ] ;
  for( var mist = 0; mist < 24; mist++ ) {
    mistList.push( { 'v': [
      { 'count': 0,  'v': { 'r': 3, 'theta': mist * 15, 'ra': -0.06, 'rrange': { 'min': 0 } } },
      { 'count': 60, 'turnInto': T.greenRice, 'v': { 'r': 0.2, 'theta': 90, 'trandom': { 'min': 60, 'max': 121 }, 'ra': 0.025, 'rrange': { 'max': 1.8 } } }
    ] } ) ;
  }
  addBullet( 'bellMist', mistList ) ;
  addBullet( 'aimOne', aimedFan( 1, 0, 3.4 ) ) ;

  // alice
  // a line of dolls in front of her, each one fires a small aimed fan from its own spot
  var dollSpots = [ -96, -48, 48, 96 ] ;
  var dollVolley = [ ] ;
  for( var doll = 0; doll < dollSpots.length; doll++ ) {
    for( var aimNum = 0; aimNum < 3; aimNum++ ) {
      dollVolley.push( { 'x': dollSpots[ doll ], 'y': 24 - Math.abs( dollSpots[ doll ] ) / 4,
                         'v': { 'aimed': true, 'r': 3, 'theta': -10 + aimNum * 10 } } ) ;
    }
  }
  addBullet( 'dollVolley', dollVolley ) ;
  addBullet( 'dollSpiral', spiral( 3, 26, 12, 2.4, 3 ) ) ;
  addBullet( 'dollSpiralBack', spiral( 3, 26, -12, 2.4, 3 ) ) ;

  // curtain of threads: columns fall one after another across the field, leaving one gap to slip through
  function curtain( fromLeft, gapX ) {
    var curtainList = [ ] ;
    var column = 0 ;
    for( var columnX = -230; columnX <= 230; columnX += 23 ) {
      var sweepX = fromLeft ? columnX : -columnX ;
      if( Math.abs( sweepX - gapX ) < 30 ) {
        column++ ;
        continue ;
      }
      for( var drop = 0; drop < 3; drop++ )
        curtainList.push( { 'count': column * 3 + drop * 8, 'x': sweepX, 'v': { 'r': 2.2, 'theta': 90 } } ) ;
      column++ ;
    }
    return curtainList ;
  }
  addBullet( 'curtainA', curtain( true, -120 ) ) ;
  addBullet( 'curtainB', curtain( false, 60 ) ) ;
  addBullet( 'curtainC', curtain( true, 150 ) ) ;
  addBullet( 'curtainD', curtain( false, -40 ) ) ;

  addBullet( 'ringTwentyFour', ring( 24, 2.3, 0 ) ) ;
  addBullet( 'ringTwentyFourOff', ring( 24, 2.3, 7.5 ) ) ;

  // picket line: a row of dolls stands still, then every one of them charges at the player
  function picket( shift ) {
    var picketList = [ ] ;
    for( var post = -200; post <= 200; post += 50 ) {
      picketList.push( { 'x': post + shift, 'y': 50, 'v': [
        { 'count': 0,  'v': { 'r': 0, 'theta': 90 } },
        { 'count': 45, 'v': { 'aimed': true, 'r': 0.5, 'theta': 0, 'ra': 0.07, 'rrange': { 'max': 3.4 } } }
      ] } ) ;
    }
    return picketList ;
  }
  addBullet( 'picketA', picket( 0 ) ) ;
  addBullet( 'picketB', picket( 25 ) ) ;
  addBullet( 'kunaiFive', aimedFan( 5, 30, 4 ) ) ;

  // clockwork grimoire: gears of bullets that curl one way, then the other
  function gear( curl, turn ) {
    var gearList = [ ] ;
    for( var tooth = 0; tooth < 6; tooth++ ) {
      for( var step = 0; step < 4; step++ ) {
        gearList.push( { 'v': { 'r': 1.5 + step * 0.35, 'theta': turn + tooth * 60, 'w': curl, 'wa': -curl / 100, 'wrange': curl > 0 ? { 'min': 0 } : { 'max': 0 } } } ) ;
      }
    }
    return gearList ;
  }
  addBullet( 'gearLeft', gear( 1.4, 0 ) ) ;
  addBullet( 'gearRight', gear( -1.4, 30 ) ) ;

} ) ( ) ;


var __stage4EnemiesParams = [ ] ;

( function( ) {
  var B = __stage4Bullets ;
  var B3 = __stage3Bullets ;
  var T = __stage3Types ;
  var list = __stage4EnemiesParams ;

  // the hill of lilies: pale fairies drift down in a zigzag and shed pollen
  for( var i = 0; i < 14; i++ ) {
    var fromLeft = i % 2 == 0 ;
    list.push( {
      'count': 60 + i * 32,
      'x': fromLeft ? 60 + ( i % 5 ) * 30 : 420 - ( i % 5 ) * 30,
      'look': 'paleyellow',
      'vital': 4,
      'powerItem': i % 3 == 0 ? 1 : 0,
      'scoreItem': i % 3 != 0 ? 1 : 0,
      's': [
        { 'bullet': B.pollen,    'type': T.yellowDot, 'shotCount': [ 30, 90 ] },
        { 'bullet': B.pollenOff, 'type': T.yellowDot, 'shotCount': [ 60 ] }
      ],
      'v': [
        { 'count': 0,   'v': { 'r': 1.8, 'theta': fromLeft ? 60 : 120 } },
        { 'count': 60,  'v': { 'r': 1.8, 'theta': fromLeft ? 120 : 60 } },
        { 'count': 120, 'v': { 'r': 2.2, 'theta': fromLeft ? 50 : 130 } }
      ]
    } ) ;
  }

  // poison clouds: fairies stop, breathe out miasma that sinks, then leave
  var cloudSpots = [ 100, 380, 180, 300, 240 ] ;
  for( var cloud = 0; cloud < cloudSpots.length; cloud++ ) {
    list.push( {
      'count': 600 + cloud * 70,
      'x': cloudSpots[ cloud ],
      'look': 'blue',
      'vital': 10,
      'powerItem': 1,
      'scoreItem': 2,
      's': [
        { 'bullet': B.miasma,    'type': T.purpleOrb, 'shotCount': [ 50 ] },
        { 'bullet': B.miasmaOff, 'type': T.purpleOrb, 'shotCount': [ 110 ] },
        { 'bullet': B.aimThree,  'type': T.redRice,   'shotCount': [ 80, 140 ] }
      ],
      'v': [
        { 'count': 0,   'v': { 'r': 3, 'theta': 90, 'ra': -0.06, 'rrange': { 'min': 0 } } },
        { 'count': 180, 'v': { 'r': 0, 'theta': 270, 'ra': 0.05 } }
      ]
    } ) ;
  }

  // two streams cross the hill from the sides
  for( var k = 0; k < 12; k++ ) {
    list.push( {
      'count': 1050 + k * 20,
      'x': 0,
      'y': 50 + ( k % 3 ) * 30,
      'vital': 3,
      'powerItem': k % 3 == 0 ? 1 : 0,
      'scoreItem': k % 3 != 0 ? 1 : 0,
      's': { 'bullet': B.aimThree, 'type': T.purpleRice, 'shotCount': [ 30, 60 ] },
      'v': { 'r': 2.4, 'theta': 12 }
    } ) ;
    list.push( {
      'count': 1060 + k * 20,
      'x': 480,
      'y': 65 + ( k % 3 ) * 30,
      'vital': 3,
      'powerItem': k % 3 == 1 ? 1 : 0,
      'scoreItem': k % 3 != 1 ? 1 : 0,
      's': { 'bullet': B.aimThree, 'type': T.purpleRice, 'shotCount': [ 30, 60 ] },
      'v': { 'r': 2.4, 'theta': 168 }
    } ) ;
  }

  // bell fairies: big white fairies ring out spirals in both directions
  var bellSpots = [ 140, 340 ] ;
  for( var bell = 0; bell < bellSpots.length; bell++ ) {
    list.push( {
      'count': 1500 + bell * 120,
      'x': bellSpots[ bell ],
      'look': 'bigwhite',
      'vital': 28,
      'powerItem': 2,
      'scoreItem': 3,
      's': [
        { 'bullet': B.bellSpiral,     'type': T.purpleRice, 'shotCount': [ 50, 230 ] },
        { 'bullet': B.bellSpiralBack, 'type': T.greenRice,  'shotCount': [ 140 ] }
      ],
      'v': [
        { 'count': 0,   'v': { 'r': 2.2, 'theta': 90, 'ra': -0.04, 'rrange': { 'min': 0 } } },
        { 'count': 330, 'v': { 'r': 0, 'theta': 270, 'ra': 0.04 } }
      ]
    } ) ;
  }

  // a last flutter of lily fairies before medicine wakes up
  for( var flutter = 0; flutter < 10; flutter++ ) {
    list.push( {
      'count': 1980 + flutter * 26,
      'x': 50 + ( flutter * 173 ) % 380,
      'look': 'paleyellow',
      'vital': 4,
      'powerItem': flutter % 2 == 0 ? 1 : 0,
      'scoreItem': 1,
      's': { 'bullet': B.pollen, 'type': T.yellowDot, 'shotCount': [ 40 ] },
      'v': [
        { 'count': 0,  'v': { 'r': 3, 'theta': 90, 'ra': -0.05, 'rrange': { 'min': 0.6 } } },
        { 'count': 70, 'v': { 'r': 0.6, 'theta': flutter % 2 == 0 ? 330 : 210, 'ra': 0.05 } }
      ]
    } ) ;
  }

  // into the forest: fairies weave between the trees and pull threads after the player
  for( var weave = 0; weave < 10; weave++ ) {
    var weaveLeft = weave % 2 == 0 ;
    list.push( {
      'count': 2800 + weave * 34,
      'x': weaveLeft ? 40 : 440,
      'y': 30 + ( weave % 3 ) * 20,
      'look': 'blue',
      'vital': 6,
      'powerItem': weave % 3 == 0 ? 1 : 0,
      'scoreItem': 2,
      's': { 'bullet': B.thread, 'type': T.blueRice, 'shotCount': [ 40, 110 ] },
      'v': [
        { 'count': 0,   'v': { 'r': 2, 'theta': weaveLeft ? 30 : 150, 'w': 0, 'wa': weaveLeft ? 0.02 : -0.02, 'wrange': weaveLeft ? { 'max': 0.8 } : { 'min': -0.8 } } },
        { 'count': 150, 'v': { 'r': 2.4, 'theta': weaveLeft ? 120 : 60 } }
      ]
    } ) ;
  }

  // mushroom fairies come up from the undergrowth and throw spores
  for( var sneak = 0; sneak < 10; sneak++ ) {
    var leftSide = sneak % 2 == 0 ;
    list.push( {
      'count': 3300 + sneak * 20,
      'x': leftSide ? 8 : 472,
      'y': 470,
      'look': 'paleblue',
      'vital': 4,
      'powerItem': sneak % 3 == 0 ? 1 : 0,
      'scoreItem': sneak % 3 != 0 ? 1 : 0,
      's': { 'bullet': B.spores, 'type': T.greenOrb, 'shotCount': [ 30, 70 ] },
      'v': { 'r': 3.2, 'theta': leftSide ? 300 : 240 }
    } ) ;
  }

  // grimoire pages: charm throwers whose charms bounce off the walls
  var charmSpots = [ 80, 400, 160, 320, 240 ] ;
  for( var thrower = 0; thrower < charmSpots.length; thrower++ ) {
    list.push( {
      'count': 3700 + thrower * 50,
      'x': charmSpots[ thrower ],
      'look': 'yellow',
      'vital': 9,
      'powerItem': thrower % 2 == 0 ? 1 : 0,
      'scoreItem': 2,
      's': [
        { 'bullet': B3.charms,  'type': T.orangeRice, 'shotCount': [ 45, 95, 145 ] },
        { 'bullet': B.thread,   'type': T.blueRice,   'shotCount': [ 70 ] }
      ],
      'v': [
        { 'count': 0,   'v': { 'r': 2.6, 'theta': 90, 'ra': -0.05, 'rrange': { 'min': 0 } } },
        { 'count': 180, 'v': { 'r': 0, 'theta': 270, 'ra': 0.05 } }
      ]
    } ) ;
  }

  // two sunflower fairies hold the middle of the forest with crossed rings
  for( var guard = 0; guard < 2; guard++ ) {
    list.push( {
      'count': 4250 + guard * 70,
      'x': guard == 0 ? 120 : 360,
      'look': 'sunflower',
      'vital': 30,
      'powerItem': 2,
      'scoreItem': 4,
      's': [
        { 'bullet': B.ringEighteen,    'type': T.blueOrb,  'shotCount': [ 60, 140, 220 ] },
        { 'bullet': B.ringEighteenOff, 'type': T.greenOrb, 'shotCount': [ 100, 180, 260 ] }
      ],
      'v': [
        { 'count': 0,   'v': { 'r': 2, 'theta': 90, 'ra': -0.03, 'rrange': { 'min': 0 } } },
        { 'count': 300, 'v': { 'r': 0, 'theta': 270, 'ra': 0.04 } }
      ]
    } ) ;
  }

  // last before alice: fairies dive in and leave threads behind
  for( var dive = 0; dive < 12; dive++ ) {
    list.push( {
      'count': 4720 + dive * 22,
      'x': 50 + ( dive * 157 ) % 380,
      'vital': 3,
      'powerItem': dive % 3 == 0 ? 1 : 0,
      'scoreItem': dive % 3 != 0 ? 1 : 0,
      's': { 'bullet': B.thread, 'type': T.cyanOrb, 'shotCount': [ 30 ] },
      'v': [
        { 'count': 0,  'v': { 'r': 3, 'theta': 90, 'ra': -0.05, 'rrange': { 'min': 0.5 } } },
        { 'count': 60, 'v': { 'r': 0.5, 'theta': dive % 2 == 0 ? 330 : 210, 'ra': 0.05 } }
      ]
    } ) ;
  }

  list.sort( function( a, b ) { return a.count - b.count ; } ) ;
} ) ( ) ;

__enemiesParams.push( __stage4EnemiesParams ) ;


var __stage4BossParams = [ ] ;

( function( ) {
  var B = __stage4Bullets ;
  var T = __stage3Types ;

  __stage4BossParams.push( {
    'count': 2360,
    'character': 'medicine',
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
    'score': 1500,
    'params': [
      {
        'spellCard': false,
        'x': 240,
        'y': 120,
        'vital': 280,
        's': [
          { 'bullet': B.poisonRing,    'type': T.purpleOrb, 'shotCount': [ 0 ],       'baseCount': 120 },
          { 'bullet': B.poisonRingOff, 'type': T.purpleOrb, 'shotCount': [ 60 ],      'baseCount': 120 },
          { 'bullet': B.aimFive,       'type': T.greenRice, 'shotCount': [ 30, 90 ],  'baseCount': 120 }
        ],
        'v': [
          { 'count': 0,   'v': { 'r': 0, 'theta': 90 } },
          { 'count': 240, 'v': { 'target': { 'x': { 'min': 150, 'max': 330 }, 'y': { 'min': 100, 'max': 140 }, 'count': 60 } } },
          { 'count': 300, 'v': { 'r': 0, 'theta': 90 } },
          { 'count': 480, 'v': 1 }
        ]
      },
      {
        'spellCard': 'Toxin Sign "Sweet Bell Mist"',
        'x': 240,
        'y': 100,
        'vital': 320,
        's': [
          { 'bullet': B.bellMist, 'type': T.purpleRice, 'shotCount': [ 0, 70 ],      'baseCount': 140 },
          { 'bullet': B.aimOne,   'type': T.redOrb,     'shotCount': [ 35, 105 ],    'baseCount': 140 }
        ],
        'v': [
          { 'count': 0,   'v': { 'r': 0, 'theta': 90 } },
          { 'count': 140, 'v': { 'target': { 'x': { 'min': 150, 'max': 330 }, 'y': { 'min': 80, 'max': 120 }, 'count': 60 } } },
          { 'count': 200, 'v': { 'r': 0, 'theta': 90 } },
          { 'count': 280, 'v': 1 }
        ]
      }
    ]
  } ) ;

  __stage4BossParams.push( {
    'count': 5400,
    'character': 'alice',
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
    'score': 6000,
    'params': [
      {
        'spellCard': false,
        'x': 240,
        'y': 110,
        'vital': 340,
        's': [
          { 'bullet': B.dollVolley,     'type': T.blueRice, 'shotCount': [ 20, 60 ], 'baseCount': 160 },
          { 'bullet': B.dollSpiral,     'type': T.redRice,  'shotCount': [ 80 ],     'baseCount': 160 }
        ],
        'v': [
          { 'count': 0,   'v': { 'r': 0, 'theta': 90 } },
          { 'count': 160, 'v': { 'target': { 'x': { 'min': 150, 'max': 330 }, 'y': { 'min': 90, 'max': 130 }, 'count': 50 } } },
          { 'count': 210, 'v': { 'r': 0, 'theta': 90 } },
          { 'count': 320, 'v': 1 }
        ]
      },
      {
        'spellCard': 'Puppet Sign "Curtain of Threads"',
        'x': 240,
        'y': 50,
        'vital': 380,
        's': [
          { 'bullet': B.curtainA, 'type': T.blueRice, 'shotCount': [ 0 ],   'baseCount': 400 },
          { 'bullet': B.curtainB, 'type': T.blueRice, 'shotCount': [ 100 ], 'baseCount': 400 },
          { 'bullet': B.curtainC, 'type': T.blueRice, 'shotCount': [ 200 ], 'baseCount': 400 },
          { 'bullet': B.curtainD, 'type': T.blueRice, 'shotCount': [ 300 ], 'baseCount': 400 },
          { 'bullet': B.aimOne,   'type': T.redOrb,   'shotCount': [ 50, 150, 250, 350 ], 'baseCount': 400 }
        ],
        'v': [
          { 'count': 0, 'v': { 'r': 0, 'theta': 90 } }
        ]
      },
      {
        'spellCard': false,
        'x': 240,
        'y': 120,
        'vital': 340,
        's': [
          { 'bullet': B.dollSpiral,         'type': T.blueRice,  'shotCount': [ 0 ],   'baseCount': 180 },
          { 'bullet': B.dollSpiralBack,     'type': T.redRice,   'shotCount': [ 60 ],  'baseCount': 180 },
          { 'bullet': B.ringTwentyFour,     'type': T.cyanOrb,   'shotCount': [ 120 ], 'baseCount': 180 },
          { 'bullet': B.ringTwentyFourOff,  'type': T.cyanOrb,   'shotCount': [ 150 ], 'baseCount': 180 }
        ],
        'v': [
          { 'count': 0,   'v': { 'r': 0, 'theta': 90 } },
          { 'count': 180, 'v': { 'target': { 'x': { 'min': 170, 'max': 310 }, 'y': { 'min': 100, 'max': 140 }, 'count': 40 } } },
          { 'count': 220, 'v': { 'r': 0, 'theta': 90 } },
          { 'count': 360, 'v': 1 }
        ]
      },
      {
        'spellCard': 'Doll Sign "Shanghai Picket Line"',
        'x': 240,
        'y': 70,
        'vital': 380,
        's': [
          { 'bullet': B.picketA,   'type': T.blueOrb,   'shotCount': [ 0 ],      'baseCount': 140 },
          { 'bullet': B.picketB,   'type': T.redOrb,    'shotCount': [ 70 ],     'baseCount': 140 },
          { 'bullet': B.kunaiFive, 'type': T.blueKunai, 'shotCount': [ 40, 110 ], 'baseCount': 140 }
        ],
        'v': [
          { 'count': 0,   'v': { 'r': 0, 'theta': 90 } },
          { 'count': 140, 'v': { 'target': { 'x': { 'min': 200, 'max': 280 }, 'y': { 'min': 60, 'max': 80 }, 'count': 40 } } },
          { 'count': 180, 'v': { 'r': 0, 'theta': 90 } },
          { 'count': 280, 'v': 1 }
        ]
      },
      {
        'spellCard': 'Craft Sign "Clockwork Grimoire"',
        'x': 240,
        'y': 110,
        'vital': 400,
        's': [
          { 'bullet': B.gearLeft,  'type': T.yellowOrb,  'shotCount': [ 0, 40 ],  'baseCount': 160 },
          { 'bullet': B.gearRight, 'type': T.purpleRice, 'shotCount': [ 80, 120 ], 'baseCount': 160 },
          { 'bullet': B.thread,    'type': T.blueRice,   'shotCount': [ 60, 140 ], 'baseCount': 160 }
        ],
        'v': [
          { 'count': 0,   'v': { 'r': 0, 'theta': 90 } },
          { 'count': 160, 'v': { 'target': { 'x': { 'min': 140, 'max': 340 }, 'y': { 'min': 90, 'max': 140 }, 'count': 40 } } },
          { 'count': 200, 'v': { 'r': 0, 'theta': 90 } },
          { 'count': 320, 'v': 1 }
        ]
      }
    ]
  } ) ;
} ) ( ) ;

__bossesParams.push( __stage4BossParams ) ;


__stageParams.push( {
  'title': 'Poison Bells and Puppet Strings',
  'bgScale': [
    { 'beginCount':    0, 'endCount':    1, 'a': 0.8 },
    { 'beginCount':  500, 'endCount': 1500, 'd': 0.0002 },
    { 'beginCount': 2600, 'endCount': 3300, 'd': -0.0003 }
  ]
} ) ;
