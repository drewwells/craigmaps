var po = org.polymaps;
var map = po.map()
    .container(document.getElementById("map").appendChild(po.svg("svg")))
    .center({lat: 10, lon: -30})
    .zoom(2)
    .add(po.interact());

map.add(po.image()
    .url(po.url("http://{S}tile.cloudmade.com"
		+ "/1a1b06b230af4efdbb989ea99e9841af" // http://cloudmade.com/register
		+ "/998/256/{Z}/{X}/{Y}.png")
	 .hosts(["a.", "b.", "c.", ""])));


$.ajax('proxy.php?url=http://atlanta.craigslist.org/nat/roo/',{
    success: function(data){
	var doc = data.contents;
	var a = $("p > a", doc);
	//$("#contents").append( a.append('<br/>') );
	var popup = $("<div>").css({
	    width: 200,
	    height: 200,
	    display: 'none',
	    'z-index': 1000,
	    position: 'absolute',
	    border: 'solid 1px black',
	    'background-color': 'white'
	}).appendTo('body');
	var links = a.get().map(function(n,i){
	    return n.href;
	}),
	    l = links.length;
	l = 5;
	while (--l) {

	    $.ajax('proxy.php?url=' + links[l],{
		type: 'GET',
		dataType: 'json',
	    	success: function (data) {

		    var doc = data.contents;
		    window.doc = doc;
		    var glink = $('a[href*="maps.google.com"]',doc);
		    var userbody = $('div', doc);
		    console.log(glink, userbody);

		    if( glink[0] ){
			//Address is URI encoded, decode in case of problems
			var address = glink[0].href.replace('http://maps.google.com/?q=loc%3A+','');

			console.log($(doc))
			$.ajax('proxy.php?url=http://maps.googleapis.com/maps/api/geocode/json'
			       + encodeURIComponent('?sensor=true&address=' + address),{
			    success: function(data){
				var loc;
				if( data.contents.results ){
				    loc = data.contents.results[0].geometry.location;
				}
				map.add(po.geoJson()
					 .features([{
					     geometry:{
						 type: "Point",
						 coordinates: [loc.lng, loc.lat]
					     }
					     }])
					 .on("load",function(){

					     $(this.container()).hover(function(){
						 popup.show().html(a.eq(l)).css({
						     left: 100,
						     top: 100
						 });
					     });
					 }));
				
			    }
			});	
		    }
	    	}
	    });
	}
    }
});