const db = require('../models/index')
const fs = require('fs')
module.exports = (app, storage)=>{
   app.get('/img/:id', async ( req, res ) => {
     const image = await db.image( req.params.id )
     res.status( 200 ).type('image/jpg').end( image )
   })
   app.get('/logo/:id', async ( req, res ) => {
     const image = await db.logo( req.params.id )
     res.status( 200 ).type('image/jpg').end( image )
   })
   app.post('/login', (req, res)=>{
    if ( 'email' in req.body && 'password' in req.body )
     return db.login( req.body, res )
    res.status( 404 )
   })
   app.post('/place', storage.single('logo'), async ( req, res ) => {
     if ( !req.cookies.root ) return res.status( 404 ).json({ bug: true })
        if ( req.file?.filename ) req.body.logo = fs.readFileSync('./uploads/'+req.file.filename)
        const { id } = req.body; delete req.body.id;
        if ( id ) { 
          const r = await (db.update( id, req.body ))
          if ( r || r.insertId ) return res.status( 200 ).json({ok:true}); res.status( 404 )
        } else {
          const r = await ( db.addPlace( req.body ))
          if ( r || r.insertId ) return res.status( 200 ).json({ok:true}); res.status( 404 )
        }
   })
   app.post('/place/:id', async ( req, res ) => {
    const r = await db.getOnlyPlace( req.params.id )
    console.log( r )
    if ( r ) return res.status( 200 ).json({ ...r })
        res.status( 404 ).json({ bug: true })
   })
   app.post('/places', async ( req, res ) => {
     const r = await db.getPlace()
     if ( r ) return res.status( 200 ).json( r )
        res.status( 404 ).json({ bug: true })
   })
   app.post('/search/:type', async ( req, res ) => {
     const r = await db.getType( req.params.type )
     if ( r ) return res.status( 200 ).json( r )
        res.status( 404 ).json({ bug: true })
   })
   app.post('/search/', async ( req, res ) => {
     const r = await db.search( req.body.tag )
     if ( r ) return res.status( 200 ).json( r )
        res.status( 404 ).json({ bug: true })
   })
   app.post('/verify',( req, res ) =>{
    if ( req.cookies.root ) return res.status( 200 ).json({ok: true});res.status( 404 )
   })
}