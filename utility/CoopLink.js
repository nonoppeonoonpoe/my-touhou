/*
 * the connection to a co-op partner. two kinds:
 *  local: another tab of this page in the same browser (?coop=local), for testing
 *  gmod:  the z-city server passes the messages along, through functions gmod adds to the page
 */
function CoopLink( receiver, kind ) {
  this.receiver = receiver ;
  this.kind = kind ;
  this.inLobby = false ;
  this.paired = false ;
  this.players = [ ] ;

  // local
  this.tabId = Math.floor( Math.random( ) * 1000000000 ) ;
  this.otherTab = null ;
  this.channel = null ;
  this.helloTimer = null ;

  var self = this ;
  if( kind == 'local' ) {
    this.channel = new BroadcastChannel( CoopLink._CHANNEL ) ;
    this.channel.onmessage = function( event ) { self._gotLocal( event.data ) ; } ;
    window.addEventListener( 'pagehide', function( ) { self.leave( ) ; } ) ;
  } else {
    try {
      window.top.__zcoopIn = function( type, first, second, third ) { self._gotBridge( type, first, second, third ) ; } ;
    } catch( err ) {
    }
    window.addEventListener( 'pagehide', function( ) { self.closeLobby( ) ; self.leave( ) ; } ) ;
  }
}

CoopLink._CHANNEL = 'jstouhou-coop' ;
CoopLink._LOCAL_LAG = 3 ;
CoopLink._LOCAL_NAME = 'Partner' ;


CoopLink._getBridge = function( ) {
  try {
    if( window.zcoop && window.zcoop.send )
      return window.zcoop ;
    if( window.top && window.top.zcoop && window.top.zcoop.send )
      return window.top.zcoop ;
  } catch( err ) {
  }
  return null ;
} ;


// which kind of co-op this page can do right now, or null
CoopLink.detect = function( ) {
  if( CoopLink._getBridge( ) )
    return 'gmod' ;
  if( /[?&]coop=local/.test( window.location.search ) && window.BroadcastChannel )
    return 'local' ;
  return null ;
} ;


CoopLink.prototype.openLobby = function( ) {
  this.inLobby = true ;
  if( this.kind == 'local' ) {
    var self = this ;
    this._postLocal( { 't': 'hello' } ) ;
    if( this.helloTimer === null )
      this.helloTimer = setInterval( function( ) { self._postLocal( { 't': 'hello' } ) ; }, 1000 ) ;
    return ;
  }
  this._callBridge( 'lobby', 1 ) ;
} ;


CoopLink.prototype.closeLobby = function( ) {
  if( ! this.inLobby )
    return ;
  this.inLobby = false ;
  this._stopHello( ) ;
  if( this.kind == 'gmod' )
    this._callBridge( 'lobby', 0 ) ;
} ;


CoopLink.prototype._stopHello = function( ) {
  if( this.helloTimer !== null )
    clearInterval( this.helloTimer ) ;
  this.helloTimer = null ;
} ;


// the people that can be invited: id, name and state ('', 'invited', 'asked', 'busy')
CoopLink.prototype.getPlayers = function( ) {
  return this.players ;
} ;


CoopLink.prototype.invite = function( playerId ) {
  this._callBridge( 'invite', playerId ) ;
} ;


CoopLink.prototype.accept = function( playerId ) {
  this._callBridge( 'accept', playerId ) ;
} ;


CoopLink.prototype.send = function( data ) {
  if( ! this.paired )
    return ;
  if( this.kind == 'local' )
    this._postLocal( { 't': 'data', 'to': this.otherTab, 'd': data } ) ;
  else
    this._callBridge( 'send', JSON.stringify( data ) ) ;
} ;


// ends the session from this side
CoopLink.prototype.leave = function( ) {
  if( ! this.paired )
    return ;
  this.paired = false ;
  if( this.kind == 'local' ) {
    this._postLocal( { 't': 'bye', 'to': this.otherTab } ) ;
    this.otherTab = null ;
  } else {
    this._callBridge( 'leave' ) ;
  }
} ;


CoopLink.prototype._callBridge = function( name, value ) {
  var bridge = CoopLink._getBridge( ) ;
  if( ! bridge || ! bridge[ name ] )
    return ;
  try {
    if( value === undefined )
      bridge[ name ]( ) ;
    else
      bridge[ name ]( value ) ;
  } catch( err ) {
  }
} ;


CoopLink.prototype._gotBridge = function( type, first, second, third ) {
  switch( type ) {
    case 'players':
      try {
        this.players = JSON.parse( first ) || [ ] ;
      } catch( err ) {
        this.players = [ ] ;
      }
      break ;
    case 'start':
      this._pair( !! Number( first ), String( second ), Number( third ) || CoopLink._LOCAL_LAG ) ;
      break ;
    case 'data':
      if( ! this.paired )
        break ;
      var data = null ;
      try {
        data = JSON.parse( first ) ;
      } catch( err ) {
        break ;
      }
      this.receiver.receiveFromPeer( data ) ;
      break ;
    case 'closed':
      this._closed( String( first || 'left' ) ) ;
      break ;
  }
} ;


CoopLink.prototype._pair = function( isMaster, partnerName, lag ) {
  this.paired = true ;
  this.inLobby = false ;
  this._stopHello( ) ;
  // ?lag=8 tries a longer input delay, to feel what a slow connection is like
  var lagMatch = /[?&]lag=(\d+)/.exec( window.location.search ) ;
  if( lagMatch && this.kind == 'local' )
    lag = Number( lagMatch[ 1 ] ) ;
  this.receiver.notifyCoopPaired( isMaster, partnerName, lag ) ;
} ;


CoopLink.prototype._closed = function( reason ) {
  if( ! this.paired )
    return ;
  this.paired = false ;
  this.otherTab = null ;
  this.receiver.notifyCoopClosed( reason ) ;
} ;


CoopLink.prototype._postLocal = function( message ) {
  message.from = this.tabId ;
  this.channel.postMessage( message ) ;
} ;


/*
 * two tabs find each other: a tab in the lobby says hello, another one
 * waiting there asks to join, the first one says ok. the higher id is player 1
 */
CoopLink.prototype._gotLocal = function( message ) {
  if( ! message || message.from == this.tabId )
    return ;
  if( message.to !== undefined && message.to != this.tabId )
    return ;

  switch( message.t ) {
    case 'hello':
      if( this.inLobby && ! this.paired )
        this._postLocal( { 't': 'join', 'to': message.from } ) ;
      break ;
    case 'join':
      if( this.inLobby && ! this.paired ) {
        this.otherTab = message.from ;
        this._postLocal( { 't': 'ok', 'to': message.from } ) ;
        this._pair( this.tabId > message.from, CoopLink._LOCAL_NAME, CoopLink._LOCAL_LAG ) ;
      }
      break ;
    case 'ok':
      if( this.inLobby && ! this.paired ) {
        this.otherTab = message.from ;
        this._pair( this.tabId > message.from, CoopLink._LOCAL_NAME, CoopLink._LOCAL_LAG ) ;
      }
      break ;
    case 'data':
      if( this.paired && message.from == this.otherTab )
        this.receiver.receiveFromPeer( message.d ) ;
      break ;
    case 'bye':
      if( this.paired && message.from == this.otherTab )
        this._closed( 'left' ) ;
      break ;
  }
} ;
