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

} ) ( ) ;


var __stage3EnemiesParams = [ ] ;

( function( ) {
  var B = __stage3Bullets ;
  var T = __stage3Types ;

  // a stream from the top left, then from the top right
  for( var i = 0; i < 8; i++ ) {
    __stage3EnemiesParams.push( {
      'count': 100 + i * 14,
      'x': 60 + i * 12,
      'vital': 2,
      'powerItem': i % 2 == 0 ? 1 : 0,
      'scoreItem': i % 2 == 1 ? 1 : 0,
      's': { 'bullet': B.aimOne, 'type': T.blueOrb, 'shotCount': [ 50 ] },
      'v': [
        { 'count': 0,  'v': { 'r': 2.5, 'theta': 90 } },
        { 'count': 60, 'v': { 'r': 2.5, 'w': 0, 'wa': -0.04, 'wrange': { 'min': -1.6 }, 'trange': { 'min': -15 } } }
      ]
    } ) ;
    __stage3EnemiesParams.push( {
      'count': 320 + i * 14,
      'x': 420 - i * 12,
      'vital': 2,
      'powerItem': i % 2 == 0 ? 1 : 0,
      'scoreItem': i % 2 == 1 ? 1 : 0,
      's': { 'bullet': B.aimOne, 'type': T.blueOrb, 'shotCount': [ 50 ] },
      'v': [
        { 'count': 0,  'v': { 'r': 2.5, 'theta': 90 } },
        { 'count': 60, 'v': { 'r': 2.5, 'w': 0, 'wa': 0.04, 'wrange': { 'max': 1.6 }, 'trange': { 'max': 195 } } }
      ]
    } ) ;
  }

  // fairies that stop, fire rings and leave
  var stopSpots = [ 120, 360, 240, 80, 400 ] ;
  for( var j = 0; j < stopSpots.length; j++ ) {
    __stage3EnemiesParams.push( {
      'count': 600 + j * 70,
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
    __stage3EnemiesParams.push( {
      'count': 1050 + k * 22,
      'x': 0,
      'y': 60 + ( k % 2 ) * 40,
      'vital': 3,
      'powerItem': k % 3 == 0 ? 1 : 0,
      'scoreItem': k % 3 != 0 ? 1 : 0,
      's': { 'bullet': B.aimThree, 'type': T.blueRice, 'shotCount': [ 40 ] },
      'v': { 'r': 2.2, 'theta': 15 }
    } ) ;
    __stage3EnemiesParams.push( {
      'count': 1061 + k * 22,
      'x': 480,
      'y': 80 + ( k % 2 ) * 40,
      'vital': 3,
      'powerItem': k % 3 == 1 ? 1 : 0,
      'scoreItem': k % 3 != 1 ? 1 : 0,
      's': { 'bullet': B.aimThree, 'type': T.blueRice, 'shotCount': [ 40 ] },
      'v': { 'r': 2.2, 'theta': 165 }
    } ) ;
  }

  // after kogasa: a slow wall of ring fairies
  for( var m = 0; m < 6; m++ ) {
    __stage3EnemiesParams.push( {
      'count': 1950 + m * 90,
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

  // a fast swarm from the top while big fairies hang back
  for( var n = 0; n < 16; n++ ) {
    __stage3EnemiesParams.push( {
      'count': 2550 + n * 12,
      'x': 40 + ( n * 53 ) % 400,
      'vital': 2,
      'powerItem': n % 4 == 0 ? 1 : 0,
      'scoreItem': n % 4 != 0 ? 1 : 0,
      's': { 'bullet': B.aimOne, 'type': T.redOrb, 'shotCount': [ 30 ] },
      'v': [
        { 'count': 0,  'v': { 'r': 3.5, 'theta': 90 } },
        { 'count': 40, 'v': { 'r': 3.5, 'theta': n % 2 == 0 ? 120 : 60 } }
      ]
    } ) ;
  }
  for( var q = 0; q < 2; q++ ) {
    __stage3EnemiesParams.push( {
      'count': 2800 + q * 60,
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
} ) ( ) ;

__enemiesParams.push( __stage3EnemiesParams ) ;


var __stage3BossParams = [ ] ;

( function( ) {
  var B = __stage3Bullets ;
  var T = __stage3Types ;

  __stage3BossParams.push( {
    'count': 1700,
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
          { 'count': 100, 'v': { 'target': { 'x': { 'min': 140, 'max': 340 }, 'y': { 'min': 70, 'max': 110 }, 'count': 80 } } },
          { 'count': 180, 'v': { 'r': 0, 'theta': 90 } },
          { 'count': 260, 'v': 1 }
        ]
      }
    ]
  } ) ;

  __stage3BossParams.push( {
    'count': 3500,
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
