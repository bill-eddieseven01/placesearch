function search ( value, point, s ) {
 document.querySelector('menu.local main').innerHTML = '<i class="process"></i>'
  fetch(location.origin+'/search'+( s ? '/'+value.toLowerCase() : '/'),{method:'POST',headers:{'Content-Type':'application/json'},body:`{ "tag":"${ value }", "point":"${ point }" }`})
  .then( r=>r.json() ).then( r=>{
    if ( typeof r == 'object' )
    listPlace( r )
  }).catch( error=>{
    document.querySelector('menu.local main').innerHTML = '<p class="error"></p>'
    console.error( error )
  })
  return value
}

function listPlace ( r ) {
    let html = '';
    if ( r && r[0] ) r.forEach( d =>{
        if ( d ) html+=`
        <fieldset class="place" onclick="getPlace(${ d.placeId+`,'${d.placename}'` })">
                    <i class="img" style="background:url(${location.origin+'/img/'+d.placeId});background-size:100% 100%;"><i style="background:url(${location.origin+'/logo/'+d.placeId});background-size:100% 100%;" class="logo"></i></i>
                    <div class="desc">
                        <output class="placename">${ d.placename }</output>
                        <output class="street">${ d.location }</output>
                        <output class="time">${ d.coords }<sup>2</sup> distancia</output>
                        <output class="placetype">${ d.placeType }</output>
                    </div>
                </fieldset>`
    }); else html = '<p class="info"></p>';
 document.querySelector('menu.local main').innerHTML = html
}

function getPlace( id, name ) {
    document.querySelector('.onplace input').checked = (true)
    document.querySelector('.onplace #placename').innerHTML = name
    document.querySelector('.onplace main').innerHTML = '<i class="process"></i>'
    fetch(location.origin+'/place/'+id,{method:'POST'}).then( r=>r.json() )
    .then( r => {
         if ( r )
           document.querySelector('.onplace main').innerHTML = `
            <h1>${ r.placename }</h1>
            <span id="type"><i></i><strong>${ r.placeType }</strong></span>
            <span id="Location"><i></i><strong>${ r.location }</strong></span>
            <p id="description">${ r.placedescription }</p>
           <iframe src="${ r.maps }" frameborder="0" class="image"></iframe>
            <span id="whatsapp"><i></i><strong>+244 ${ r.whatsapp }5</strong></span>
            <span id="email"><i></i><strong>${ r.email }</strong></span>
            <span id="website"><i></i><a href="${ r.website }">${ r.website }</a></span>
            <span id="hours"><i></i><strong>${ r.hours }hrs/24h</strong></span>
            <p class="services">${ r.services }.</p>
           `;else document.querySelector('.onplace main').innerHTML = '<p class="info"></p>'
    }).catch( error=>{
     console.error( error )
     document.querySelector('.onplace main').innerHTML = '<p class="error"></p>'
    })
}