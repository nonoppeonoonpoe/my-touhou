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

  // stage 4, medicine then alice
  __talkScenes.medicineBefore = [
    talk( 'reimu', 'medicine', [
      [ 'medicine', 'Su-san, look. A human walked right into our field.' ],
      [ 'me',       'Who are you talking to? That\'s a doll.' ],
      [ 'medicine', 'Dolls hear everything. And the lilies are\nso sweet tonight... breathe in deep, okay?' ],
      [ 'me',       'This whole hill smells like poison.' ]
    ] ),
    talk( 'marisa', 'medicine', [
      [ 'medicine', 'Su-san, a human is stepping on our lilies.' ],
      [ 'me',       'Whoa, a walking doll. And she\'s mad about flowers.' ],
      [ 'medicine', 'A doll is a person too!\nYou\'ll learn that once the poison kicks in.' ],
      [ 'me',       'I\'ll hold my breath and shoot fast, then.' ]
    ] )
  ] ;

  __talkScenes.medicineEscape = [
    talk( 'reimu', 'medicine', [
      [ 'medicine', 'The poison didn\'t work at all...\nSu-san, we\'re leaving!' ]
    ] ),
    talk( 'marisa', 'medicine', [
      [ 'medicine', 'Too much wind from that broom...\nSu-san, we\'re leaving!' ]
    ] )
  ] ;

  __talkScenes.aliceBefore = [
    talk( 'reimu', 'alice', [
      [ 'alice', 'A shrine maiden in the forest of magic?\nThe night must really be wrong.' ],
      [ 'me',    'It is. Someone swapped the moon out.\nDo you know who?' ],
      [ 'alice', 'Maybe I do. But my dolls get restless\nwhen guests barge in without knocking.' ],
      [ 'me',    'Then I\'ll knock them over instead.' ]
    ] ),
    talk( 'marisa', 'alice', [
      [ 'alice', 'Marisa. You\'re loud even when you\'re flying.' ],
      [ 'me',    'Hey, neighbor! The moon\'s fake tonight.\nYou noticed, right?' ],
      [ 'alice', 'Of course I noticed. I was going to fix it\nquietly, without you breaking my windows.' ],
      [ 'me',    'Race you there, then.\nWinner gets to borrow your books.' ],
      [ 'alice', 'You never return them. Shanghai, Hourai, go.' ]
    ] )
  ] ;

  var aliceGivesUp = 'Fine. The moon is a fake.\nThe real one is hidden in the bamboo forest.' ;
  __talkScenes.aliceAfter = [
    talk( 'reimu', 'alice', [
      [ 'alice', aliceGivesUp ],
      [ 'me',    'The bamboo forest. Then that\'s where I\'m going.' ]
    ] ),
    talk( 'marisa', 'alice', [
      [ 'alice', aliceGivesUp ],
      [ 'me',    'Bamboo, huh? See ya. I\'ll bring back the moon\nand maybe a book or two.' ]
    ] )
  ] ;

  // stage 5, tewi then reisen
  __talkScenes.tewiBefore = [
    talk( 'reimu', 'tewi', [
      [ 'tewi', 'Lost in the bamboo? I can show you the way out...\nfor a small fee.' ],
      [ 'me',   'I\'m not going out. I\'m going in.' ],
      [ 'tewi', 'In? Then you\'ll need a lot more luck than that!' ]
    ] ),
    talk( 'marisa', 'tewi', [
      [ 'tewi', 'A witch in the bamboo forest? How lucky.\nFor me, I mean.' ],
      [ 'me',   'Hey, rabbit. Where\'s the house everyone\nkeeps hiding out here?' ],
      [ 'tewi', 'House? What house? Catch me first!' ]
    ] )
  ] ;

  __talkScenes.tewiEscape = [
    talk( 'reimu', 'tewi', [
      [ 'tewi', 'Ow ow ow! Fine, keep going straight.\nI\'m out of here!' ]
    ] ),
    talk( 'marisa', 'tewi', [
      [ 'tewi', 'That broom is cheating!\nI\'m telling Reisen on you!' ]
    ] )
  ] ;

  __talkScenes.reisenBefore = [
    talk( 'reimu', 'reisen', [
      [ 'reisen', 'You got through the bamboo.\nYou\'re the shrine maiden, aren\'t you?' ],
      [ 'me',     'And you\'re the one hiding the moon.' ],
      [ 'reisen', 'Look into my eyes for a while.\nYou\'ll forget why you came.' ],
      [ 'me',     'I\'ll look at your back while you run, then.' ]
    ] ),
    talk( 'marisa', 'reisen', [
      [ 'reisen', 'A human on a broom made it all the way to Eientei?' ],
      [ 'me',     'It smells like the moon in here.\nYou stole it, didn\'t you?' ],
      [ 'reisen', 'We sealed it away to protect ourselves.\nYou wouldn\'t understand.' ],
      [ 'me',     'Then explain it while I shoot.' ]
    ] )
  ] ;

  var reisenGivesUp = 'My eyes don\'t work on you at all...\nFine. My master is waiting further in.' ;
  __talkScenes.reisenAfter = [
    talk( 'reimu', 'reisen', [
      [ 'reisen', reisenGivesUp ],
      [ 'me',     'Then I\'ll go say hello to your master.' ]
    ] ),
    talk( 'marisa', 'reisen', [
      [ 'reisen', reisenGivesUp ],
      [ 'me',     'Your master, huh? I bet she\'s got good books.' ]
    ] )
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
  hookTalks( __stage4BossParams[ 0 ], 'medicineBefore', 'medicineEscape' ) ;
  hookTalks( __stage4BossParams[ 1 ], 'aliceBefore', 'aliceAfter' ) ;
  hookTalks( __stage5BossParams[ 0 ], 'tewiBefore', 'tewiEscape' ) ;
  hookTalks( __stage5BossParams[ 1 ], 'reisenBefore', 'reisenAfter' ) ;

  // the old talk list goes by stage number, so stages 4 and 5 need an entry too
  __talkParams.push( [ __talkScenes.aliceBefore, __talkScenes.aliceAfter ] ) ;
  __talkParams.push( [ __talkScenes.reisenBefore, __talkScenes.reisenAfter ] ) ;
} ) ( ) ;
