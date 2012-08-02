
var mime = require( 'mime-lib' )

/**
 * [filter description]
 * @param  {[type]} key   [description]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
function filter( key, value ) {
  
  for( var i in filter.map ) {
    if( ~filter.map[i].indexOf( key ) )
      return filter.fn[i]( value )
  }
  
  return value
  
}

/**
 * Maps header field names
 * to their filter functions.
 * 
 * @type {Object}
 */
filter.map = {
  address: [ 'from', 'reply_to', 'to', 'cc', 'bcc', 'sender', 'return_path' ],
  subject: [ 'subject' ],
  content_type: [ 'content_type' ]
}

/**
 * Filter functions
 * @type {Object}
 */
filter.fn = {
  
  /**
   * Desperately tries to get a name
   * from a contact definition.
   * 
   * @param  {String} input
   * @return {Object|Array} 
   */
  address: function address( input ) {
    
    // Run over multiple addresses
    if( ~input.indexOf( ',' ) )
      return input.split( ',' ).map( address )
    
    // Address formats
    var patterns = [
      // "Example Name" <hello@example.com>
      [ /"([^"]+)"\s+<([^>]+)>/, 2, 1 ],
      // 'Example Name' <hello@example.com>
      [ /'([^']+)'\s+<([^>]+)>/, 2, 1 ],
      // Example Name <hello@example.com>
      [ /(.+)\s+<([^>]+)>/, 2, 1 ],
      // <hello@example.com> (Example Name)
      [ /([^\s]+)\s+[(][^)]+[)]/, 1, 2 ],
      // hello@example.com (Example Name)
      [ /<([^>]+)>\s+[(][^)]+[)]/, 1, 2 ],
      // <hello@example.com>
      [ /<([^>]+)>/, 1 ],
      // hello@example.com
      [ /.*/, 0 ]
      // " <- Syntax highlighter fix (Sublime Text 2)
    ]
    
    var pattern, fmt, i, m
    
    for( fmt in patterns ) {
      i = patterns[ fmt ]
      if( m = i[0].exec( input ) ) {
        input = {
          address: m[ i[1] ] || null,
          name: m[ i[2] ] || null
        }
        break
      }
    }
    
    return input
    
  },
  
  /**
   * Strips 'Re:' and 'Fwd:' from the subject line,
   * the "reply" or "forwarded" status should be determined
   * through the mail headers anyway...
   * 
   * Also, subject lines like "Fwd: Re: Re: Re: Actual subject"
   * are fucking annoying.
   * 
   * @param  {String} input
   * @return {String} 
   */
  subject: function( input ) {
    return mime.decodeWord( input )
    return input.replace( /(Re): |(Fwd): /gi, '' )
  },
  
  /**
   * Converts mime strings like
   * `text/plain; charset="utf-8"; format="fixed"`
   * to an object of this form:
   *     
   *     {
   *       mime: 'text/plain',
   *       charset: 'utf-8',
   *       format: 'fixed'
   *     }
   *     
   * @param  {String} input
   * @return {Object} 
   */
  content_type: function( input ) {
    
    var pattern = /^(.*?)([=](['"]?)(.*)\3)?$/
    var i, m, object = {}
    
    input = input.split( '; ' )
    object.mime = input.shift()
    
    for( i in input ) {
      if( m = pattern.exec( input[i] ) ) {
        if( m[4] ) object[ m[1] ] = m[4]
      }
    }
    
    return object
    
  },
  
}

module.exports = filter