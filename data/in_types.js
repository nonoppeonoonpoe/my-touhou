/*
 * the 32 pixel bullets on the bottom half of the bullet sheet, shared by every stage:
 * gun bullets, big orbs, eggs, knives and tewi's carrot.
 */

var __inTypes = { } ;

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
      __inTypes[ colorName + bigLook.shape ] = __enemyBulletTypes.length ;
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

  __inTypes.carrot = __enemyBulletTypes.length ;
  __enemyBulletTypes.push( {
    'indexX': 0,
    'indexY': 10,
    'width': 32,
    'height': 32,
    'collisionWidth': 6,
    'collisionHeight': 6,
    'rotate': true
  } ) ;
} ) ( ) ;
