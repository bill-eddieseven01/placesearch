const { createPool } = require('mysql2/promise')
const conn = createPool( {...(JSON.parse(process.env.DB))  })
const crypto = require('crypto')
const fs = require('fs')
function upkey ( ) {
    const PASSWORD = process.env.KEY
    const key = crypto.createHash( 'sha256' ).update( PASSWORD, 'utf8' ).digest()
    const iv = key.slice( 0, 16 )
    return { key, iv }
}
 function code ( text ){
    const { key, iv } = upkey()
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv )
    const encrypted = Buffer.concat([ cipher.update( Buffer.from( text, 'utf8' )), cipher.final() ])
    return encrypted.toString('base64')
}
 function decode ( textcode ) {
    const { key, iv } = upkey()
    const encrypted = Buffer.from( textcode, 'base64' )
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv )
    const decrypted = Buffer.concat([ decipher.update( encrypted ), decipher.final() ])
    return decrypted.toString('utf8')
}
function d ( list ) {
    if ( list.length && !Buffer.isBuffer( list ) )
    list.forEach(e=>{
       if (e['placedescription']) e['placedescription'] = decode( e['placedescription'] )
       if (e['location']) e['location'] = decode( e['location'] )
       if (e['website']) e['website'] = decode( e['website'] )
       if (e['whatsapp']) e['whatsapp'] = decode( e['whatsapp'] )
       if (e['email']) e['email'] = decode( e['email'] )
       if (e['maps']) e['maps'] = decode( e['maps'] )
    })
    else if ( list.placeId ) {
         if (list['placedescription']) list['placedescription'] = decode( list['placedescription'] )
       if (list['location']) list['location'] = decode( list['location'] )
       if (list['website']) list['website'] = decode( list['website'] )
       if (list['whatsapp']) list['whatsapp'] = decode( list['whatsapp'] )
       if (list['email']) list['email'] = decode( list['email'] )
       if (list['maps']) list['maps'] = decode( list['maps'] )
    }
    return list
}
function apass ( l, func ) {
    Object.keys( l ).forEach( key=>{ if( !l[key] || l[key]==null ) delete l[key]; else if( (['image','logo','coords','hours','placeId','placename','services','placeType']).indexOf( key ) < 0 ) l[key]=func(l[key]); else l[key]=l[key] });
    return l;
}
exports.addPlace = async ( data ) =>{
    data = apass( data, code )
    const r = await conn.query(`INSERT INTO places(${ Object.keys( data ).join(', ') }) VALUES(${(()=>{let q='?';for(let n=1;n<Object.keys(data).length;n++){q+=',?'};return q})()})`, Object.values( data ))
    if ( r[0] ) return true; return false;
}
exports.update = async ( id, data ) =>{
    data = apass( data, code )
    const r = await conn.query(`UPDATE places SET ${ Object.keys( data ).join(' = ?, ') } = ? WHERE placeId = ${id}`, Object.values( data ))
    if ( r[0] ) return true; return false;
}
exports.image = async id=>{
    const [r] = await conn.query('SELECT * FROM viewImage WHERE placeId = ?', id )
    if ( r[0] && r[0]['image'] ) return (r[0]['image']); return fs.readFileSync('./viewers/image/space.jpg')
}
exports.logo = async id=>{
    const [r] = await conn.query('SELECT * FROM viewlogo WHERE placeId = ?', id )
    if ( r[0] && r[0]['logo'] ) return (r[0]['logo']); return fs.readFileSync('./viewers/image/space.jpg')
}
exports.search = async word=>{
    console.log( word )
    const [r] = await conn.query(`SELECT * FROM placed WHERE placename LIKE '%${ word }%' OR services LIKE '%${ word }%';`  )
    if ( r[0] ) return d(r); return false
}
exports.getType = async id=>{
    const [r] = await conn.query('SELECT * FROM place WHERE placeType = ?', (id) )
    if ( r[0] ) return d( r ); return false
}
exports.getPlace = async id=>{
    const [r] = await conn.query('SELECT * FROM place' )
    if ( r[0]?.placename ) return d(r); return false
}
exports.getOnlyPlace = async id=>{
    const [r] = await conn.query('SELECT * FROM pall WHERE placeId = '+id )
    if ( r[0]?.placename ) return d(r[0]); return false
}
exports.login = async ( data, reply ) => {
    const { email, password } = JSON.parse(process.env.LOGIN)
    if ( data.email == email && data.password == password ) {
        reply.cookie('root',{ confirm: true }, { httpOnly: true, sameSite: 'lax', secure: true, maxAge: 60_000_000 })
        reply.status( 200 ).json({ ok: true })
    } else reply.status( 404 ).json({ bug: true })
}