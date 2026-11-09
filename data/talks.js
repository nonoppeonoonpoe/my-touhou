/*
 * named talks, one per boss before or after her fight.
 * each talk is [ reimu's lines, marisa's lines ].
 * loaded after the stage data, it hooks the talks onto the bosses at the bottom.
 */

var __talkScenes = { } ;

( function( ) {

  // one line of a talk. who is 'me' (the player) or the other girl's name
  function say( player, other, who, text ) {
    var line = { 'serif': text, 'left': { 'character': player, 'active': who == 'me' } } ;
    if( other )
      line.right = { 'character': other, 'active': who != 'me' } ;
    return line ;
  }

  function talk( player, other, lineList ) {
    var lines = [ ] ;
    for( var i = 0; i < lineList.length; i++ )
      lines.push( say( player, other, lineList[ i ][ 0 ], lineList[ i ][ 1 ] ) ) ;
    return lines ;
  }

  // stage 1, rumia
  __talkScenes.rumiaBefore = [
    talk( 'reimu', 'rumia', [
      [ 'me',    'It\'s way past midnight.\nWhy is the sky still this dark?' ],
      [ 'rumia', 'Dark is nice...\nOw! Who put a shrine maiden here?' ],
      [ 'me',    'You flew right into me.\nYou can\'t see out of that ball, can you?' ],
      [ 'rumia', 'Nope~. Hey, are you something I can eat?' ],
      [ 'me',    'I fix incidents. I\'m not a midnight snack.' ],
      [ 'rumia', 'Is that so~? Then I\'ll just have to check.' ]
    ] ),
    talk( 'marisa', 'rumia', [
      [ 'me',    'Whoa, a floating blob of darkness.\nAnyone in there?' ],
      [ 'rumia', 'Me~. I heard a broom. Brooms aren\'t tasty.' ],
      [ 'me',    'Lucky for me, I\'m the one riding it.' ],
      [ 'rumia', 'Is that so~? Then you\'re the tasty part.' ],
      [ 'me',    'Nope. I\'m the part that shoots lasers.' ]
    ] )
  ] ;

  __talkScenes.rumiaAfter = [
    talk( 'reimu', 'rumia', [
      [ 'rumia', 'Owie... The moon looks weird tonight anyway.\nKind of... wrong.' ],
      [ 'me',    'Wrong how? ...And she fell asleep.' ]
    ] ),
    talk( 'marisa', 'rumia', [
      [ 'rumia', 'You\'re not food...\nThe moon\'s acting funny tonight, you know~' ],
      [ 'me',    'A funny moon, huh? Guess I\'m flying further.' ]
    ] )
  ] ;

  // stage 2, daiyousei then cirno
  __talkScenes.daiyouseiBefore = [
    talk( 'reimu', 'daiyousei', [
      [ 'daiyousei', 'Please turn back!\nCirno is in a really bad mood tonight...' ],
      [ 'me',        'Then she can be in a bad mood out of my way.' ]
    ] ),
    talk( 'marisa', 'daiyousei', [
      [ 'daiyousei', 'Please turn back!\nCirno is in a really bad mood tonight...' ],
      [ 'me',        'A bad mood? Perfect, I\'m in a great one.' ]
    ] )
  ] ;

  __talkScenes.cirnoBefore = [
    talk( 'reimu', 'chilno', [
      [ 'chilno', 'Stop right there!\nThis lake belongs to the strongest!' ],
      [ 'me',     'The strongest what? Fairy?\nThat\'s not a high bar.' ],
      [ 'chilno', 'I froze forty frogs today! Forty!\nYou\'re next!' ],
      [ 'me',     'I\'m here about the long night,\nnot your frogs. Move.' ],
      [ 'chilno', 'Long night? Who cares!\nNights are cold, and cold is great!' ]
    ] ),
    talk( 'marisa', 'chilno', [
      [ 'chilno', 'Hey, witch! You\'re flying over MY lake!' ],
      [ 'me',     'Your lake? I thought it belonged to the frogs.' ],
      [ 'chilno', 'Not anymore! I froze them all.\nI\'m the strongest!' ],
      [ 'me',     'Strongest at freezing frogs, sure.' ],
      [ 'chilno', 'Strongest at EVERYTHING!\nYou\'ll be an ice statue!' ]
    ] )
  ] ;

  __talkScenes.cirnoAfter = [
    talk( 'reimu', 'chilno', [
      [ 'chilno', 'That doesn\'t count! The lake was too warm!' ],
      [ 'me',     'The lake is frozen solid.' ],
      [ 'chilno', '...That doesn\'t count either!' ],
      [ 'me',     'Moving on. The village should be close.' ]
    ] ),
    talk( 'marisa', 'chilno', [
      [ 'chilno', 'No fair! I\'d have won if it was colder!' ],
      [ 'me',     'It\'s freezing!\nI\'m leaving before my broom ices up.' ]
    ] )
  ] ;

  // stage 3, kogasa then keine
  __talkScenes.kogasaBefore = [
    talk( 'reimu', 'kogasa', [
      [ 'kogasa', 'Boo!! ...Hey! Why aren\'t you surprised?' ],
      [ 'me',     'You\'ve been hiding behind the same tree\nsince I got here.' ],
      [ 'kogasa', 'It was a very good tree!\nFine, I\'ll scare you the hard way!' ]
    ] ),
    talk( 'marisa', 'kogasa', [
      [ 'kogasa', 'Surpriiise! ...Aw, come on, flinch a little!' ],
      [ 'me',     'Your umbrella\'s sticking its tongue out.\nI saw you a mile off.' ],
      [ 'kogasa', 'That\'s its charm! Okay, plan B: bullets!' ]
    ] )
  ] ;

  __talkScenes.kogasaEscape = [
    talk( 'reimu', 'kogasa', [
      [ 'kogasa', 'You win this time! Next time I\'ll be so scary\nyou\'ll drop your gohei!' ]
    ] ),
    talk( 'marisa', 'kogasa', [
      [ 'kogasa', 'You win this time! Next time I\'ll be so scary\nyou\'ll drop your broom!' ]
    ] )
  ] ;

  __talkScenes.keineBefore = [ __reimuBossTalk3Params, __marisaBossTalk3Params ] ;

  var keineGivesUp = 'Fine, the village comes back.\nBut whoever stole the real moon is past the forest.' ;
  __talkScenes.keineAfter = [
    talk( 'reimu', 'keine', [ [ 'keine', keineGivesUp ] ] ).concat( __reimuClearTalk3Params ),
    talk( 'marisa', 'keine', [ [ 'keine', keineGivesUp ] ] ).concat( __marisaClearTalk3Params )
  ] ;

} ) ( ) ;


( function( ) {
  function hookTalks( boss, beforeName, afterName ) {
    boss.talkBefore = beforeName ;
    boss.talkAfter = afterName ;
  }
  hookTalks( __canonStage1Bosses[ 1 ], 'rumiaBefore', 'rumiaAfter' ) ;
  hookTalks( __canonStage2Bosses[ 0 ], 'daiyouseiBefore', null ) ;
  hookTalks( __canonStage2Bosses[ 1 ], 'cirnoBefore', 'cirnoAfter' ) ;
  hookTalks( __stage3BossParams[ 0 ], 'kogasaBefore', 'kogasaEscape' ) ;
  hookTalks( __stage3BossParams[ 1 ], 'keineBefore', 'keineAfter' ) ;
} ) ( ) ;
