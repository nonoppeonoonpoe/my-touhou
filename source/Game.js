function Game(mainCanvas, bgCanvas) {
  // the old online counter's server is gone, so nothing connects to it anymore
  this.gs = new GameSocket(this);

  // the canvases can be bigger than the game; everything is drawn at 640x480 and scaled up
  this.scale = Number(mainCanvas.getAttribute('width')) / Game._BASE_WIDTH;
  this.surface = mainCanvas.getContext('2d');
  this.surface._scale = this.scale;
  this.surface.scale(this.scale, this.scale);
  this.surface.fillStyle = 'white';

  this.bgLayer = Canvas2DLayer.pickLayer(bgCanvas);
  this.bgLayer.scale = this.scale;

  this.width = Game._BASE_WIDTH;
  this.height = Game._BASE_HEIGHT;
  this.sounds = [ ] ;
  this.soundBuffers = [ ] ;
  this.playingSources = [ ] ;
  this.audioContext = null ;
  try {
    var AudioContextType = window.AudioContext || window.webkitAudioContext ;
    if( AudioContextType )
      this.audioContext = new AudioContextType( ) ;
  } catch( err ) {
    this.audioContext = null ;
  }
  this.bgms = [ ] ;
  this.options = this._loadOptions( ) ;
  this.images = [ ] ;
  this.mainCanvas = mainCanvas ;
  this.bgCanvas = bgCanvas ;
  this.highScale = this.scale ;
  this.applyQuality( ) ;

  this.interval = null ;
  this.oldTIme = null ;
  this.fps = null ;
  this.count = 0 ;

  this.someoneState = -1;
  this.onlineActiveNum = 0;
  this.messegeReceiveCount = 0;

  this.state = 0 ;
  this.flags = 0 ;

  this.states = [ ] ; // TODO: temporal
  this.states[ Game._STATE_LOAD ]        = new LoadingState( this ) ;
  this.states[ Game._STATE_OPENING ]     = new OpeningState( this ) ;
  this.states[ Game._STATE_CHARA_SEL ]   = new CharacterSelectState( this ) ;
  this.states[ Game._STATE_REPLAY_SEL ]  = new ReplaySelectState( this ) ;
  this.states[ Game._STATE_IN_STAGE ]    = new StageState( this ) ;
  this.states[ Game._STATE_ENDING ]      = new EndingState( this ) ;
  this.states[ Game._STATE_STAFF_ROLL ]  = new StaffRollState( this ) ;
  this.states[ Game._STATE_POST_REPLAY ] = new PostReplayState( this ) ;

  this._changeState( Game._STATE_LOAD, { } ) ;

  var self = this;
  this.runFunc = function() { self._runStep(); };

  this.lag = null;
  this.coopLink = null;
  this.coopRun = 0;
  this.partnerName = '';
  this.notice = null;
  this.noticeTime = 0;
  this.master = false;
  this.multiPlay = false;
  this.waitingOther = false;
  this.receivedOther = false;
  this.otherParams = null;
  this.meParams = null;
}

Game._BASE_WIDTH = 640;
Game._BASE_HEIGHT = 480;

Game.prototype.Randomizer = __randomizer;

Game.prototype._PEER_ID_START = 0;
Game.prototype._PEER_ID_SYNC = 1;

Game._SIDE_WIDTH = 160 ;
Game._FPS = 60 ;
Game._FPS_SPAN = 60 ;

Game._SOMEONE_STATE_DISPLAY_COUNT = 60*5;

Game._STATE_LOAD        = 0x0 ;
Game._STATE_OPENING     = 0x1 ;
Game._STATE_CHARA_SEL   = 0x2 ;
Game._STATE_REPLAY_SEL  = 0x3 ;
Game._STATE_IN_STAGE    = 0x4 ;
Game._STATE_STAGE_CLEAR = 0x5 ;
Game._STATE_ENDING      = 0x6 ;
Game._STATE_STAFF_ROLL  = 0x7 ;
Game._STATE_POST_REPLAY = 0x8 ;

Game._SE_SELECT       = 0 ;
Game._SE_DEAD         = 1 ;
Game._SE_SHOT         = 2 ;
Game._SE_ENEMY_SHOT   = 3 ;
Game._SE_ENEMY_VANISH = 4 ;
Game._SE_ENEMY_DAMAGE = 5 ;
Game._SE_GRAZE        = 6 ;
Game._SE_POWERUP      = 7 ;
Game._SE_POWER_EFFECT = 8 ;
Game._SE_OK           = 9 ;
Game._SE_CANCEL       = 10 ;
Game._SE_PAUSE        = 11 ;
Game._SE_BOSS_DAMAGE  = 12 ;
Game._SE_BOSS_VANISH  = 13 ;
Game._SE_EXTEND       = 14 ;
Game._SE_ITEM         = 15 ;
Game._SE_POWER_ITEM   = 16 ;
Game._SE_FULL_POWER   = 17 ;
Game._SE_KIRA         = 18 ;
Game._SE_CARD_GET     = 19 ;
Game._SE_TIMEOUT      = 20 ;
Game._SE_BONUS        = 21 ;
Game._SE_LASER        = 22 ;
Game._SE_SPARK        = 23 ;
Game._SE_SLASH        = 24 ;

Game._IMG_FIGHTER         =  0;
Game._IMG_REIMU_SHIP      =  1;
Game._IMG_MARISA_SHIP     =  2;
Game._IMG_FIGHTER_OPTION  =  3;
Game._IMG_REIMU_OPTION    =  4;
Game._IMG_MARISA_OPTION   =  5;
Game._IMG_SHOT            =  6;
Game._IMG_BOMB            =  7;
Game._IMG_ENEMY_SHOT      =  8;
Game._IMG_LASER           =  9;
Game._IMG_BEAM            = 10;
Game._IMG_ENEMY           = 11;
Game._IMG_DAMAGE          = 12;
Game._IMG_VANISHED        = 13;
Game._IMG_SHOCK_WAVE      = 14;
Game._IMG_REIMU_FACE_1    = 15;
Game._IMG_REIMU_FACE_2    = 16;
Game._IMG_REIMU_FACE_3    = 17;
Game._IMG_REIMU_FACE_4    = 18;
Game._IMG_MARISA_FACE_1   = 19;
Game._IMG_MARISA_FACE_2   = 20;
Game._IMG_MARISA_FACE_3   = 21;
Game._IMG_MARISA_FACE_4   = 22;
Game._IMG_ENEMY_MOKOU     = 23;
Game._IMG_ENEMY_RUMIA     = 24;
Game._IMG_ENEMY_DAIYOUSEI = 25;
Game._IMG_ENEMY_CHILNO    = 26;
Game._IMG_ITEM            = 27;
Game._IMG_POWER_ITEM      = 28;
Game._IMG_SCORE_ITEM      = 29;
Game._IMG_BG1             = 30;
Game._IMG_BG2             = 31;
Game._IMG_SCORE_BACK      = 32;
Game._IMG_STAND_REIMU     = 33;
Game._IMG_STAND_MARISA    = 34;
Game._IMG_STAND_MOKOU     = 35;
Game._IMG_STAND_RUMIA     = 36;
Game._IMG_STAND_CHILNO    = 37;
Game._IMG_TITLE_BG        = 38;
Game._IMG_ENEMY_KOGASA    = 39;
Game._IMG_ENEMY_KEINE     = 40;
Game._IMG_STAND_KOGASA    = 41;
Game._IMG_STAND_KEINE     = 42;
Game._IMG_BG3             = 43;
Game._IMG_ENEMY_MEDICINE  = 44;
Game._IMG_ENEMY_ALICE     = 45;
Game._IMG_STAND_MEDICINE  = 46;
Game._IMG_STAND_ALICE     = 47;
Game._IMG_BG4             = 48;
Game._IMG_SPELL_RUMIA     = 49;
Game._IMG_SPELL_CHILNO    = 50;
Game._IMG_SPELL_KOGASA    = 51;
Game._IMG_SPELL_KEINE     = 52;
Game._IMG_SPELL_MEDICINE  = 53;
Game._IMG_SPELL_ALICE     = 54;
Game._IMG_STAND_DAIYOUSEI = 55;

Game._IMGS = { } ;
Game._IMGS[Game._IMG_FIGHTER]            = 'image/fighter.png';
Game._IMGS[ Game._IMG_REIMU_SHIP ]       = 'image/reimu.png' ;
Game._IMGS[ Game._IMG_MARISA_SHIP ]      = 'image/marisa.png' ;
Game._IMGS[ Game._IMG_REIMU_OPTION ]     = 'image/reimu_option.png' ;
Game._IMGS[ Game._IMG_MARISA_OPTION ]    = 'image/marisa_option.png' ;
Game._IMGS[Game._IMG_FIGHTER_OPTION]     = 'image/fighter_option.png';
Game._IMGS[ Game._IMG_SHOT ]             = 'image/pl_shot.png' ;
Game._IMGS[ Game._IMG_BOMB ]             = 'image/th128_Bullet2HD.png' ;
Game._IMGS[ Game._IMG_ENEMY_SHOT ]       = 'image/bullet.png' ;
Game._IMGS[ Game._IMG_LASER ]            = 'image/pl_shot.png' ;
Game._IMGS[ Game._IMG_BEAM ]             = 'image/beam.png' ;
Game._IMGS[ Game._IMG_ENEMY ]            = 'image/enemy.png' ;
Game._IMGS[ Game._IMG_ENEMY_MOKOU ]      = 'image/mokou.png' ;
Game._IMGS[ Game._IMG_ENEMY_RUMIA ]      = 'image/rumia.png' ;
Game._IMGS[ Game._IMG_ENEMY_DAIYOUSEI ]  = 'image/daiyousei.png' ;
Game._IMGS[ Game._IMG_ENEMY_CHILNO ]     = 'image/chilno.png' ;
Game._IMGS[ Game._IMG_DAMAGE ]           = 'image/th128_BulletHD.png' ;
Game._IMGS[ Game._IMG_VANISHED ]         = 'image/th128_Bullet2.png' ;
Game._IMGS[ Game._IMG_SHOCK_WAVE ]       = 'image/shockwave.png' ;
Game._IMGS[ Game._IMG_REIMU_FACE_1 ]     = 'image/reimu_1.png' ;
Game._IMGS[ Game._IMG_REIMU_FACE_2 ]     = 'image/reimu_2.png' ;
Game._IMGS[ Game._IMG_REIMU_FACE_3 ]     = 'image/reimu_3.png' ;
Game._IMGS[ Game._IMG_REIMU_FACE_4 ]     = 'image/reimu_4.png' ;
Game._IMGS[ Game._IMG_MARISA_FACE_1 ]    = 'image/marisa_1.png' ;
Game._IMGS[ Game._IMG_MARISA_FACE_2 ]    = 'image/marisa_2.png' ;
Game._IMGS[ Game._IMG_MARISA_FACE_3 ]    = 'image/marisa_3.png' ;
Game._IMGS[ Game._IMG_MARISA_FACE_4 ]    = 'image/marisa_4.png' ;
Game._IMGS[ Game._IMG_ITEM ]             = 'image/item.png' ;
Game._IMGS[ Game._IMG_POWER_ITEM ]       = 'image/power_item.png' ;
Game._IMGS[ Game._IMG_SCORE_ITEM ]       = 'image/score_item.png' ;
Game._IMGS[ Game._IMG_BG1 ]              = 'image/bg1.png' ;
Game._IMGS[ Game._IMG_BG2 ]              = 'image/bg2.png' ;
Game._IMGS[ Game._IMG_SCORE_BACK ]       = 'image/scoreback.png' ;
Game._IMGS[ Game._IMG_STAND_REIMU ]      = 'image/reimu_stand.png' ;
Game._IMGS[ Game._IMG_STAND_MARISA ]     = 'image/marisa_stand.png' ;
Game._IMGS[ Game._IMG_STAND_MOKOU ]      = 'image/mokou_stand.png' ;
Game._IMGS[ Game._IMG_STAND_RUMIA ]      = 'image/rumia_stand.png' ;
Game._IMGS[ Game._IMG_STAND_CHILNO ]     = 'image/chilno_stand.png' ;
Game._IMGS[ Game._IMG_TITLE_BG ]         = 'image/title_bg.png' ;
Game._IMGS[ Game._IMG_ENEMY_KOGASA ]     = 'image/kogasa.png' ;
Game._IMGS[ Game._IMG_ENEMY_KEINE ]      = 'image/keine.png' ;
Game._IMGS[ Game._IMG_STAND_KOGASA ]     = 'image/kogasa_stand.png' ;
Game._IMGS[ Game._IMG_STAND_KEINE ]      = 'image/keine_stand.png' ;
Game._IMGS[ Game._IMG_BG3 ]              = 'image/bg3.png' ;
Game._IMGS[ Game._IMG_ENEMY_MEDICINE ]   = 'image/medicine.png' ;
Game._IMGS[ Game._IMG_ENEMY_ALICE ]      = 'image/alice.png' ;
Game._IMGS[ Game._IMG_STAND_MEDICINE ]   = 'image/medicine_stand.png' ;
Game._IMGS[ Game._IMG_STAND_ALICE ]      = 'image/alice_stand.png' ;
Game._IMGS[ Game._IMG_BG4 ]              = 'image/bg4.png' ;
Game._IMGS[ Game._IMG_SPELL_RUMIA ]      = 'image/spell_rumia.png' ;
Game._IMGS[ Game._IMG_SPELL_CHILNO ]     = 'image/spell_chilno.png' ;
Game._IMGS[ Game._IMG_SPELL_KOGASA ]     = 'image/spell_kogasa.png' ;
Game._IMGS[ Game._IMG_SPELL_KEINE ]      = 'image/spell_keine.png' ;
Game._IMGS[ Game._IMG_SPELL_MEDICINE ]   = 'image/spell_medicine.png' ;
Game._IMGS[ Game._IMG_SPELL_ALICE ]      = 'image/spell_alice.png' ;
Game._IMGS[ Game._IMG_STAND_DAIYOUSEI ]  = 'image/daiyousei_stand.png' ;

// boss sprite sheet, portrait and spell card background for each character, portraits are drawn at standWidth x 600
Game._CHARACTERS = {
  'reimu':     { 'sheet': null,                      'stand': Game._IMG_STAND_REIMU,    'standWidth': 400, 'spellBg': null },
  'marisa':    { 'sheet': null,                      'stand': Game._IMG_STAND_MARISA,   'standWidth': 400, 'spellBg': null },
  'mokou':     { 'sheet': Game._IMG_ENEMY_MOKOU,     'stand': Game._IMG_STAND_MOKOU,    'standWidth': 512, 'spellBg': null },
  'rumia':     { 'sheet': Game._IMG_ENEMY_RUMIA,     'stand': Game._IMG_STAND_RUMIA,    'standWidth': 600, 'spellBg': Game._IMG_SPELL_RUMIA },
  'daiyousei': { 'sheet': Game._IMG_ENEMY_DAIYOUSEI, 'stand': Game._IMG_STAND_DAIYOUSEI, 'standWidth': 600, 'spellBg': null },
  'chilno':    { 'sheet': Game._IMG_ENEMY_CHILNO,    'stand': Game._IMG_STAND_CHILNO,   'standWidth': 550, 'spellBg': Game._IMG_SPELL_CHILNO },
  'kogasa':    { 'sheet': Game._IMG_ENEMY_KOGASA,    'stand': Game._IMG_STAND_KOGASA,   'standWidth': 600, 'spellBg': Game._IMG_SPELL_KOGASA },
  'keine':     { 'sheet': Game._IMG_ENEMY_KEINE,     'stand': Game._IMG_STAND_KEINE,    'standWidth': 600, 'spellBg': Game._IMG_SPELL_KEINE },
  'medicine':  { 'sheet': Game._IMG_ENEMY_MEDICINE,  'stand': Game._IMG_STAND_MEDICINE, 'standWidth': 600, 'spellBg': Game._IMG_SPELL_MEDICINE },
  'alice':     { 'sheet': Game._IMG_ENEMY_ALICE,     'stand': Game._IMG_STAND_ALICE,    'standWidth': 600, 'spellBg': Game._IMG_SPELL_ALICE }
} ;

// one background per stage, in order
Game._STAGE_BGS = [ Game._IMG_BG1, Game._IMG_BG2, Game._IMG_BG3, Game._IMG_BG4 ] ;

Game._BGM_TITLE  = 0 ;
Game._BGM_1      = 1 ;
Game._BGM_ENDING = 2 ;

Game._BGMS = { } ;
Game._BGMS[ Game._BGM_TITLE ]  = 'BGM/title.mp3' ;
Game._BGMS[ Game._BGM_1 ]      = 'BGM/bgm.mp3' ;
Game._BGMS[ Game._BGM_ENDING ] = 'BGM/ending.mp3' ;

Game._SES = { } ;
Game._SES[ Game._SE_SELECT ]        = 'SE/se_select00.wav' ;
Game._SES[ Game._SE_DEAD ]          = 'SE/se_pldead00.wav' ;
Game._SES[ Game._SE_SHOT ]          = 'SE/se_plst00.wav' ;
Game._SES[ Game._SE_ENEMY_SHOT ]    = 'SE/se_tan00.wav' ;
Game._SES[ Game._SE_ENEMY_VANISH ]  = 'SE/se_enep00.wav' ;
Game._SES[ Game._SE_ENEMY_DAMAGE ]  = 'SE/se_damage00.wav' ;
Game._SES[ Game._SE_GRAZE ]         = 'SE/se_graze.wav' ;
Game._SES[ Game._SE_POWERUP ]       = 'SE/se_powerup.wav' ;
Game._SES[ Game._SE_POWER_EFFECT ]  = 'SE/se_cat00.wav' ;
Game._SES[ Game._SE_OK ]            = 'SE/se_ok00.wav' ;
Game._SES[ Game._SE_CANCEL ]        = 'SE/se_cancel00.wav' ;
Game._SES[ Game._SE_PAUSE ]         = 'SE/se_pause.wav' ;
Game._SES[ Game._SE_BOSS_DAMAGE ]   = 'SE/se_damage01.wav' ;
Game._SES[ Game._SE_BOSS_VANISH ]   = 'SE/se_enep01.wav' ;
Game._SES[ Game._SE_EXTEND ]        = 'SE/se_extend.wav' ;
Game._SES[ Game._SE_ITEM ]          = 'SE/se_item00.wav' ;
Game._SES[ Game._SE_POWER_ITEM ]    = 'SE/se_power1.wav' ;
Game._SES[ Game._SE_FULL_POWER ]    = 'SE/se_power0.wav' ;
Game._SES[ Game._SE_KIRA ]          = 'SE/se_kira00.wav' ;
Game._SES[ Game._SE_CARD_GET ]      = 'SE/se_cardget.wav' ;
Game._SES[ Game._SE_TIMEOUT ]       = 'SE/se_timeout.wav' ;
Game._SES[ Game._SE_BONUS ]         = 'SE/se_bonus.wav' ;
Game._SES[ Game._SE_LASER ]         = 'SE/se_lazer00.wav' ;
Game._SES[ Game._SE_SPARK ]         = 'SE/se_nep00.wav' ;
Game._SES[ Game._SE_SLASH ]         = 'SE/se_slash.wav' ;


Game._SOMEONE_MESSAGES = [];
Game._SOMEONE_MESSAGES[GameSocket._STATE_OPEN]
  = 'opened';
Game._SOMEONE_MESSAGES[GameSocket._STATE_CLOSE]
  = 'closed';
Game._SOMEONE_MESSAGES[GameSocket._STATE_BEGIN_GAME]
  = 'began the game';
Game._SOMEONE_MESSAGES[GameSocket._STATE_DEAD]
  = 'dead';
Game._SOMEONE_MESSAGES[GameSocket._STATE_DESTROY_STAGE1_MID_BOSS]
  = 'destroyed Rumia';
Game._SOMEONE_MESSAGES[GameSocket._STATE_DESTROY_STAGE1_BIG_BOSS]
  = 'destroyed Rumia';
Game._SOMEONE_MESSAGES[GameSocket._STATE_DESTROY_STAGE2_MID_BOSS]
  = 'destroyed Dai Yousei';
Game._SOMEONE_MESSAGES[GameSocket._STATE_DESTROY_STAGE2_BIG_BOSS]
  = 'destroyed Chirno';
Game._SOMEONE_MESSAGES[GameSocket._STATE_GAME_CLEAR]
  = 'completed the game';
Game._SOMEONE_MESSAGES[GameSocket._STATE_GAME_OVER]
  = 'game over';


Game.prototype.getImage = function( key ) {
  return this.images[ key ] ;
} ;


// base volume for each sound, then scaled by the sound option
Game._SE_VOLUMES = { } ;
Game._SE_VOLUMES[ Game._SE_SELECT ]        = 0.015 ;
Game._SE_VOLUMES[ Game._SE_DEAD ]          = 0.03 ;
Game._SE_VOLUMES[ Game._SE_SHOT ]          = 0.01 ;
Game._SE_VOLUMES[ Game._SE_ENEMY_SHOT ]    = 0.006 ;
Game._SE_VOLUMES[ Game._SE_ENEMY_VANISH ]  = 0.012 ;
Game._SE_VOLUMES[ Game._SE_ENEMY_DAMAGE ]  = 0.016 ;
Game._SE_VOLUMES[ Game._SE_GRAZE ]         = 0.022 ;
Game._SE_VOLUMES[ Game._SE_POWERUP ]       = 0.02 ;
Game._SE_VOLUMES[ Game._SE_POWER_EFFECT ]  = 0.1 ;
Game._SE_VOLUMES[ Game._SE_OK ]            = 0.04 ;
Game._SE_VOLUMES[ Game._SE_CANCEL ]        = 0.02 ;
Game._SE_VOLUMES[ Game._SE_PAUSE ]         = 0.04 ;
Game._SE_VOLUMES[ Game._SE_BOSS_DAMAGE ]   = 0.03 ;
Game._SE_VOLUMES[ Game._SE_BOSS_VANISH ]   = 0.02 ;
Game._SE_VOLUMES[ Game._SE_EXTEND ]        = 0.04 ;
Game._SE_VOLUMES[ Game._SE_ITEM ]          = 0.02 ;
Game._SE_VOLUMES[ Game._SE_POWER_ITEM ]    = 0.012 ;
Game._SE_VOLUMES[ Game._SE_FULL_POWER ]    = 0.03 ;
Game._SE_VOLUMES[ Game._SE_KIRA ]          = 0.03 ;
Game._SE_VOLUMES[ Game._SE_CARD_GET ]      = 0.05 ;
Game._SE_VOLUMES[ Game._SE_TIMEOUT ]       = 0.04 ;
Game._SE_VOLUMES[ Game._SE_BONUS ]         = 0.04 ;
Game._SE_VOLUMES[ Game._SE_LASER ]         = 0.012 ;
Game._SE_VOLUMES[ Game._SE_SPARK ]         = 0.05 ;
Game._SE_VOLUMES[ Game._SE_SLASH ]         = 0.03 ;


Game.prototype.soundEffect = function(key) {
  if( ! this.sounds[ key ] )
    return ;
  var baseVolume = Game._SE_VOLUMES[ key ] ;
  this.sounds[ key ].volume = baseVolume === void 0 ? 0.1 : baseVolume ;
  this.sounds[ key ].volume = Math.min( 1, this.sounds[ key ].volume * this.options.sound / 5 ) ;
  if( this.soundBuffers[ key ] ) {
    this._playBuffer( key, this.sounds[ key ].volume ) ;
    return ;
  }
  this.sounds[ key ].pause();
  this.sounds[ key ].currentTime = 0;
  this.sounds[ key ].play();
//  this.sounds[ key ] = new Audio( this.sounds[ key ].src ) ;
} ;


// web audio plays a decoded copy instead of restarting an audio element, which is a lot cheaper
Game.prototype._playBuffer = function( key, volume ) {
  var audioContext = this.audioContext ;
  if( audioContext.state == 'suspended' )
    audioContext.resume( ) ;
  if( this.playingSources[ key ] ) {
    try {
      this.playingSources[ key ].stop( ) ;
    } catch( err ) {
    }
  }
  var source = audioContext.createBufferSource( ) ;
  source.buffer = this.soundBuffers[ key ] ;
  var gain = audioContext.createGain( ) ;
  gain.gain.value = volume ;
  source.connect( gain ) ;
  gain.connect( audioContext.destination ) ;
  source.start( 0 ) ;
  this.playingSources[ key ] = source ;
} ;


Game.prototype.soundBGM = function( key ) {

  for( var i = 0; i < this.bgms.length; i++ ) {
    this.bgms[ i ].pause( ) ;
    this.bgms[ i ].currentTime = 0 ;
  }

  this.currentBGM = key ;
  this.bgms[ key ].loop = true ;
  this.applyMusicVolume( ) ;
  this.bgms[ key ].play( ) ;
} ;


Game.prototype.applyMusicVolume = function( ) {
  if( this.currentBGM === void 0 )
    return ;
  // TODO: temporal
  var baseVolume = this.currentBGM == Game._BGM_TITLE ? 0.08 : 0.2 ;
  this.bgms[ this.currentBGM ].volume = Math.min( 1, baseVolume * this.options.music / 5 ) ;
} ;


/*
 * options are saved in the browser. volumes go 0-10 (5 is the old volume),
 * lives are the spare lives you start with and bombs refill to that on respawn.
 */
Game._OPTIONS_KEY = 'jstouhou_options' ;
Game._DEFAULT_OPTIONS = { 'music': 5, 'sound': 5, 'lives': 2, 'bombs': 3, 'shake': 1, 'quality': 1, 'fps': 0 } ;

// inside the loading screen (?embed) the game starts on low quality and keeps its own quality setting
Game._EMBED = /[?&]embed\b/.test( window.location.search ) ;

Game.prototype._loadOptions = function( ) {
  var options = { } ;
  for( var key in Game._DEFAULT_OPTIONS )
    options[ key ] = Game._DEFAULT_OPTIONS[ key ] ;
  try {
    var saved = JSON.parse( window.localStorage.getItem( Game._OPTIONS_KEY ) || '{}' ) ;
    for( var savedKey in options ) {
      if( typeof saved[ savedKey ] == 'number' )
        options[ savedKey ] = saved[ savedKey ] ;
    }
    if( Game._EMBED )
      options.quality = typeof saved.embedQuality == 'number' ? saved.embedQuality : 0 ;
  } catch( err ) {
  }
  return options ;
} ;


Game._REPLAYS_KEY = 'jstouhou_replays' ;
Game._MAX_REPLAYS = 10 ;

Game.prototype.loadSavedReplays = function( ) {
  var savedReplays = [ ] ;
  try {
    savedReplays = JSON.parse( window.localStorage.getItem( Game._REPLAYS_KEY ) || '[]' ) ;
  } catch( err ) {
    savedReplays = [ ] ;
  }
  return savedReplays instanceof Array ? savedReplays : [ ] ;
} ;


// newest first, the oldest one drops off past the limit
Game.prototype.saveReplay = function( replay ) {
  var savedReplays = this.loadSavedReplays( ) ;
  savedReplays.unshift( replay ) ;
  savedReplays.length = Math.min( savedReplays.length, Game._MAX_REPLAYS ) ;
  try {
    window.localStorage.setItem( Game._REPLAYS_KEY, JSON.stringify( savedReplays ) ) ;
    return true ;
  } catch( err ) {
    return false ;
  }
} ;


/*
 * high quality draws at the page's full canvas size, low quality draws at
 * plain 640x480 and lets the browser stretch it, which is far less work
 */
Game.prototype.applyQuality = function( ) {
  var newScale = this.options.quality === 0 ? 1 : this.highScale ;
  if( newScale == this.scale && this.mainCanvas.width == Game._BASE_WIDTH * newScale )
    return ;
  this.scale = newScale ;
  this.mainCanvas.width = Game._BASE_WIDTH * newScale ;
  this.mainCanvas.height = Game._BASE_HEIGHT * newScale ;
  this.surface.setTransform( newScale, 0, 0, newScale, 0, 0 ) ;
  this.surface._scale = newScale ;
  var fieldSize = this.bgCanvas.width / this.bgLayer.scale ;
  this.bgCanvas.width = fieldSize * newScale ;
  this.bgCanvas.height = fieldSize * newScale ;
  this.bgLayer.scale = newScale ;
  this.bgLayer.resize( ) ;
} ;


Game.prototype.saveOptions = function( ) {
  try {
    var toSave = { } ;
    for( var key in this.options )
      toSave[ key ] = this.options[ key ] ;
    if( Game._EMBED ) {
      var oldSaved = JSON.parse( window.localStorage.getItem( Game._OPTIONS_KEY ) || '{}' ) ;
      toSave.embedQuality = this.options.quality ;
      toSave.quality = typeof oldSaved.quality == 'number' ? oldSaved.quality : Game._DEFAULT_OPTIONS.quality ;
    }
    window.localStorage.setItem( Game._OPTIONS_KEY, JSON.stringify( toSave ) ) ;
  } catch( err ) {
  }
} ;


Game.prototype.pauseBGM = function( paused ) {
  if( this.currentBGM === void 0 )
    return ;
  if( paused )
    this.bgms[ this.currentBGM ].pause( ) ;
  else
    this.bgms[ this.currentBGM ].play( ) ;
} ;


Game.prototype.run = function( ) {
//  this.states[ this.state ].init( ) ;
//  this.interval = setInterval( this._runStep.bind( this ), 1000 / Game._FPS ) ;
  this._runStep( ) ;
} ;


Game.prototype.clear = function( surface ) {
  surface.clearRect( 0, 0, this.width, this.height ) ;
} ;


Game._DEBUG_WORD = 'DEBUG' ;


Game.prototype.handleKeyDown = function( e ) {
  this._checkDebugWord( e ) ;
  if( this.audioContext && this.audioContext.state == 'suspended' )
    this.audioContext.resume( ) ;
  this._syncShift( e ) ;

  this.states[ this.state ].handleKeyDown( e ) ;
  e.preventDefault( ) ;
} ;


// typing DEBUG at any time turns the debug info on, typing it again turns it off
Game.prototype._checkDebugWord = function( e ) {
  if( e.keyCode < 65 || e.keyCode > 90 ) {
    this.typedWord = '' ;
    return ;
  }
  this.typedWord = ( ( this.typedWord || '' ) + String.fromCharCode( e.keyCode ) ).slice( -Game._DEBUG_WORD.length ) ;
  if( this.typedWord == Game._DEBUG_WORD ) {
    this.debug = ! this.debug ;
    this.typedWord = '' ;
  }
} ;


// let go of every key when the window loses focus, so nothing stays stuck down
Game.prototype.handleBlur = function( ) {
  this.shiftHeld = false ;
  if( this.states[ this.state ].releaseAllKeys )
    this.states[ this.state ].releaseAllKeys( ) ;
} ;


/*
 * some browsers (gmod's) never send a key event for shift on its own,
 * so the shift flag on other keys is turned into a shift press or release
 */
Game.prototype._syncShift = function( e ) {
  if( e.keyCode == 16 ) {
    this.shiftHeld = e.type == 'keydown' ;
    return ;
  }
  if( e.shiftKey === undefined || !! e.shiftKey == !! this.shiftHeld )
    return ;
  this.shiftHeld = !! e.shiftKey ;
  var shiftEvent = { keyCode: 16, shiftKey: this.shiftHeld, type: this.shiftHeld ? 'keydown' : 'keyup', preventDefault: function( ) { } } ;
  if( this.shiftHeld )
    this.handleKeyDown( shiftEvent ) ;
  else
    this.handleKeyUp( shiftEvent ) ;
} ;


Game.prototype.handleKeyUp = function( e ) {
  this._syncShift( e ) ;
  this.states[ this.state ].handleKeyUp( e ) ;
  e.preventDefault( ) ;
} ;


/**
 * TODO: temporal
 */
Game.prototype._runStep = function( ) {
  /*
   * the game runs a fixed 60 steps per second, so high refresh rate
   * monitors (120Hz, 144Hz...) don't speed it up.
   * in co-op a step also waits until the partner's keys for it are here
   */
  {
    // debug speed: 0.5 is slow motion, 2 is fast forward
    var gameSpeed = this.isMultiPlay( ) ? 1 : ( this.speed || 1 ) ;
    var stepMs = 1000 / ( Game._FPS * gameSpeed ) ;
    var nowTime = window.performance ? window.performance.now( ) : Date.now( ) ;
    if( this.lastStepTime === undefined || nowTime - this.lastStepTime > 250 )
      this.lastStepTime = nowTime - stepMs ;

    // on a 60hz screen the frames jitter a bit around 16.7ms, which made
    // the loop do 0 or 2 steps some frames. near 60hz just do one step a frame
    var frameMs = this.lastFrameTime === undefined ? 0 : nowTime - this.lastFrameTime ;
    this.lastFrameTime = nowTime ;
    var stepsDone = 0 ;
    var stalled = false ;
    if( gameSpeed == 1 && Math.abs( frameMs - stepMs ) < 2.5 ) {
      if( this._canRunStep( ) ) {
        this._runOneStep( ) ;
        stepsDone = 1 ;
      } else {
        stalled = true ;
      }
      this.lastStepTime = nowTime ;
    }
    // a slow frame only catches up a little, so one late frame doesn't make the next one late too
    var maxSteps = gameSpeed > 1 ? 5 : 2 ;
    while( ! stalled && nowTime - this.lastStepTime >= stepMs && stepsDone < maxSteps ) {
      if( ! this._canRunStep( ) ) {
        stalled = true ;
        break ;
      }
      this._runOneStep( ) ;
      this.lastStepTime += stepMs ;
      stepsDone++ ;
    }
    if( stalled || stepsDone >= maxSteps )
      this.lastStepTime = nowTime ;
    // a co-op game that fell behind its partner runs one more step to catch up
    if( ! stalled && stepsDone > 0 && stepsDone < 3 && this._isBehindPartner( ) && this._canRunStep( ) ) {
      this._runOneStep( ) ;
      stepsDone++ ;
    }
    this._checkCoopStall( stalled, nowTime ) ;
    if( stepsDone > 0 || stalled )
      this._drawStep( ) ;
  }

  this.runNextStep();
} ;


Game._STALL_NOTICE_MS = 1000 ;
Game._STALL_DROP_MS = 15000 ;

Game.prototype._canRunStep = function( ) {
  if( ! this.isMultiPlay( ) || this.state != Game._STATE_IN_STAGE )
    return true ;
  return this.states[ this.state ].hasPartnerKeys( ) ;
} ;


Game.prototype._isBehindPartner = function( ) {
  if( ! this.isMultiPlay( ) || this.state != Game._STATE_IN_STAGE )
    return false ;
  return this.states[ this.state ].isBehindPartner( ) ;
} ;


// a partner that stops answering for a long time counts as gone
Game.prototype._checkCoopStall = function( stalled, nowTime ) {
  if( ! stalled ) {
    this.stallStart = null ;
    return ;
  }
  if( this.stallStart === null || this.stallStart === undefined )
    this.stallStart = nowTime ;
  if( nowTime - this.stallStart > Game._STALL_DROP_MS )
    this.leaveCoop( 'Lost the connection to ' + this.partnerName + '.' ) ;
} ;


Game.prototype.isCoopStalled = function( ) {
  if( this.stallStart === null || this.stallStart === undefined )
    return false ;
  var nowTime = window.performance ? window.performance.now( ) : Date.now( ) ;
  return nowTime - this.stallStart > Game._STALL_NOTICE_MS ;
} ;


Game.prototype._runOneStep = function( ) {
  if( this.fadeCount > 0 )
    this.fadeCount-- ;
  this.states[ this.state ].runStep( ) ;
  this._calculateFps( ) ;

  if(this.someoneState >= 0 &&
     this.count > this.messageReceiveCount +
                  Game._SOMEONE_STATE_DISPLAY_COUNT)
    this.someoneState = -1;

  this.count++ ;
} ;


Game.prototype._drawStep = function( ) {
  var drawStart = window.performance ? window.performance.now( ) : Date.now( ) ;
  this.states[ this.state ].updateDisplay( this.surface ) ;
  this._displayFade( this.surface ) ;
  this._displayFps( this.surface ) ;
  this._countFrame( drawStart ) ;
  this._displayNotice( this.surface ) ;
} ;


// a line at the bottom for a few seconds, like "your partner left"
Game.prototype.showNotice = function( text ) {
  this.notice = text ;
  this.noticeTime = window.performance ? window.performance.now( ) : Date.now( ) ;
} ;


Game._NOTICE_MS = 6000 ;

Game.prototype._displayNotice = function( surface ) {
  var waiting = this.isCoopStalled( ) ;
  if( ! this.notice && ! waiting )
    return ;
  var nowTime = window.performance ? window.performance.now( ) : Date.now( ) ;
  var noticeText = this.notice ;
  var noticeAlpha = 1 ;
  if( waiting ) {
    noticeText = 'Waiting for ' + this.partnerName + '...' ;
  } else {
    var shownMs = nowTime - this.noticeTime ;
    if( shownMs > Game._NOTICE_MS ) {
      this.notice = null ;
      return ;
    }
    noticeAlpha = __clamp01( shownMs / 200 ) * __clamp01( ( Game._NOTICE_MS - shownMs ) / 600 ) ;
  }

  surface.save( ) ;
  surface.font = '16px Arial' ;
  surface.textAlign = 'center' ;
  surface.textBaseline = 'middle' ;
  var noticeWidth = surface.measureText( noticeText ).width + 40 ;
  surface.globalAlpha = 0.75 * noticeAlpha ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  surface.fillRect( this.width / 2 - noticeWidth / 2, this.height - 44, noticeWidth, 28 ) ;
  surface.globalAlpha = noticeAlpha ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.fillText( noticeText, this.width / 2, this.height - 30 ) ;
  surface.restore( ) ;
} ;


// every screen change comes in from black
Game.prototype._displayFade = function( surface ) {
  if( ! this.fadeCount )
    return ;
  surface.save( ) ;
  surface.globalAlpha = __easeInOut( this.fadeCount / Game._FADE_SPAN ) ;
  surface.fillStyle = 'rgb( 0, 0, 0 )' ;
  surface.fillRect( 0, 0, this.width, this.height ) ;
  surface.restore( ) ;
} ;


Game.prototype.runNextStep = function() {
  requestAnimationFrame(this.runFunc);
};


Game.prototype._calculateFps = function( ) {
  if( ( this.count % Game._FPS_SPAN ) != 0 )
    return ;
  var newTime = Date.now( ) ;
  if( this.oldTime ) {
    this.fps = parseInt( 1000 * Game._FPS_SPAN / ( newTime - this.oldTime ) ) ;
  }
  this.oldTime = newTime ;
} ;


// real frames drawn each second and how long drawing took, for the fps option
Game.prototype._countFrame = function( drawStart ) {
  var nowTime = window.performance ? window.performance.now( ) : Date.now( ) ;
  this.frameCountNow = ( this.frameCountNow || 0 ) + 1 ;
  this.drawTimeNow = ( this.drawTimeNow || 0 ) + ( nowTime - drawStart ) ;
  if( ! this.frameCountStart )
    this.frameCountStart = nowTime ;
  if( nowTime - this.frameCountStart >= 1000 ) {
    this.shownFps = Math.round( this.frameCountNow * 1000 / ( nowTime - this.frameCountStart ) ) ;
    this.shownDrawMs = this.drawTimeNow / this.frameCountNow ;
    this.frameCountNow = 0 ;
    this.drawTimeNow = 0 ;
    this.frameCountStart = nowTime ;
  }
} ;


Game.prototype._displayFps = function( surface ) {
  if( ! this.options.fps && ! this.debug )
    return ;
  if( ! this.shownFps )
    return ;

  surface.save( ) ;
  surface.fillStyle = 'rgb( 255, 255, 255 )' ;
  surface.font = '13px Arial' ;
  surface.textAlign = 'right' ;
  surface.fillText( this.shownFps + ' fps  ' + this.shownDrawMs.toFixed( 1 ) + ' ms', this.getWidth( ) - 8, this.getHeight( ) - 8 ) ;
  surface.restore( ) ;
} ;


/**
 * TODO: temporal.
 */
Game.prototype.sendMessageToServer = function(key) {
  this.gs.send(key);
};


/**
 * TODO: temporal.
 */
Game.prototype.notifyMessageReceive = function(activeNum, key) {
  this.onlineActiveNum = activeNum;
  this.someoneState = key;
  this.messageReceiveCount = this.count;
};


Game.prototype.notifyLoadingConclusion = function( ) {
  this._changeState( Game._STATE_OPENING, { } ) ;
//  this._changeState( Game._STATE_STAFF_ROLL, { } ) ;
} ;


Game.prototype.notifyOpeningConclusion = function( ) {
  this._changeState( Game._STATE_CHARA_SEL, { } ) ;
} ;


Game.prototype.notifyCharacterSelectConclusion = function(index) {
  var seed = (new Date()).getTime() & 0xffff;

  if(this.isMultiPlay()) {
    var p = {};
    p.i = index;
    p.s = seed;
    p.n = this.coopRun;
    this.meParams = p;
    this.waitingOther = true;
    this.coopLink.send({id: this._PEER_ID_START, p: p});
    if(this.receivedOther)
      this._changeState(Game._STATE_IN_STAGE,
                        this._makeStageStateParameterForMultiPlay());
  } else {
    var params = {};
    params.characterIndex = index; // me
    params.seed = seed;
    params.practice = this.pendingPractice || null;
    this.pendingPractice = null;
    this._changeState(Game._STATE_IN_STAGE, params);
  }
};


Game.prototype.notifyReplaySelectBegin = function( index ) {
  this._changeState( Game._STATE_REPLAY_SEL, { } ) ;
} ;


/**
 * TODO: temporal
 */
Game.prototype.notifyReplaySelectConclusion = function( params ) {
  // currently, only Reimu.
  this._changeState( Game._STATE_IN_STAGE,
                     { 'autoplayParams': params, 'autoplay': true } ) ;
} ;


/**
 * TODO: temporal
 */
Game.prototype.notifyQuitStage = function( flag ) {
  // after a finished run, ask to save the replay in the browser
  var stage = this.states[ Game._STATE_IN_STAGE ] ;
  if(this.isMultiPlay())
    this.resetSyncParams();
  if( flag && ! this.isMultiPlay( ) && stage.canSaveReplay( ) )
    this._changeState( Game._STATE_POST_REPLAY, { } ) ;
  else
    this._changeState( Game._STATE_OPENING, { } ) ;
} ;


Game.prototype.notifyGameClear = function( ) {
//  this._changeState( Game._STATE_ENDING, { } ) ;
  if(this.isMultiPlay())
    this.resetSyncParams();
  this._changeState( Game._STATE_STAFF_ROLL, { } ) ;
} ;


Game._FADE_SPAN = 18 ;

Game.prototype._changeState = function( state, params ) {
  // a co-op pair goes back to picking characters instead of the title
  if( state == Game._STATE_OPENING && this.isMultiPlay( ) )
    state = Game._STATE_CHARA_SEL ;
  if( state != this.state )
    this.fadeCount = Game._FADE_SPAN ;
  this.state = state ;
  this.states[ this.state ].init( params ) ;
} ;


Game.prototype.getWidth = function( ) {
  return this.width ;
} ;


Game.prototype.getHeight = function( ) {
  return this.height ;
} ;


Game.prototype.isFlagSet = function( type ) {
  return ( this.flags & type ) ? true : false ;
} ;


Game.prototype.setFlag = function( type ) {
  this.flags |= type ;
} ;


Game.prototype.clearFlag = function( type ) {
  this.flags &= ~type ;
} ;


// the co-op connection this page can use, or null when there is none
Game.prototype.getCoopLink = function( ) {
  if( this.coopLink )
    return this.coopLink ;
  var coopKind = CoopLink.detect( ) ;
  if( coopKind )
    this.coopLink = new CoopLink( this, coopKind ) ;
  return this.coopLink ;
} ;


Game.prototype.notifyCoopPaired = function( isMaster, partnerName, lag ) {
  this.multiPlay = true ;
  this.master = isMaster ;
  this.partnerName = partnerName ;
  this.lag = Math.max( 1, Math.min( 20, Math.round( lag ) ) ) ;
  this.coopRun = 0 ;
  this.otherParams = null ;
  this.resetSyncParams( ) ;
  this.coopRun = 0 ;
  this.stallStart = null ;
  this.pendingPractice = null ;
  this._changeState( Game._STATE_CHARA_SEL, { } ) ;
} ;


Game.prototype.notifyCoopClosed = function( reason ) {
  var closeText = this.partnerName + ' left the co-op game.' ;
  if( reason == 'desync' )
    closeText = 'The two games went out of sync, so the co-op game ended.' ;
  this._endCoop( closeText ) ;
} ;


// this side ends the session
Game.prototype.leaveCoop = function( text ) {
  if( ! this.isMultiPlay( ) )
    return ;
  if( this.coopLink )
    this.coopLink.leave( ) ;
  this._endCoop( text ) ;
} ;


Game.prototype._endCoop = function( text ) {
  if( ! this.isMultiPlay( ) )
    return ;
  this.multiPlay = false ;
  this.master = false ;
  this.waitingOther = false ;
  this.receivedOther = false ;
  this.otherParams = null ;
  this.meParams = null ;
  this.stallStart = null ;
  if( text )
    this.showNotice( text ) ;
  this._changeState( Game._STATE_OPENING, { } ) ;
} ;


Game.prototype.getPartnerName = function( ) {
  return this.partnerName ;
} ;


Game.prototype.isWaitingOther = function( ) {
  return this.isMultiPlay( ) && this.waitingOther ;
} ;


Game.prototype.sync = function(params) {
  this.coopLink.send(params);
};


Game.prototype.receiveFromPeer = function(data) {
  if(! this.isMultiPlay() || ! data)
    return;
  if(data.id === this._PEER_ID_START) {
    this.otherParams = data.p;
    this.receivedOther = data.p.n == this.coopRun;
    if(this.receivedOther && this.waitingOther)
      this._changeState(Game._STATE_IN_STAGE,
                        this._makeStageStateParameterForMultiPlay());
    return;
  }
  if(this.state == Game._STATE_IN_STAGE)
    this.states[this.state].receiveFromPeer(data);
};


Game.prototype._makeStageStateParameterForMultiPlay = function() {
  var p = {};
  p.characterIndex = this.meParams.i;
  p.characterIndex2 = this.otherParams.i;
  // use greater one.
  p.seed = this.meParams.s > this.otherParams.s
             ? this.meParams.s : this.otherParams.s;

  p.lag = this.lag;
  this.waitingOther = false;

  return p;
};


Game.prototype.isMultiPlay = function() {
  return this.multiPlay;
};


Game.prototype.isMaster = function() {
  return this.master;
};


// gets ready for the next run. a partner who already picked for it is remembered
Game.prototype.resetSyncParams = function() {
  this.coopRun++;
  this.waitingOther = false;
  this.meParams = null;
  this.receivedOther = this.otherParams ? this.otherParams.n == this.coopRun : false;
};
