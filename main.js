var po = org.polymaps;
var map = po.map()
    .container(document.getElementById("map").appendChild(po.svg("svg")))
    .center({lat: 33.65, lon: -84.42})
    .zoom(8)
    .add(po.interact());
var accordion;
    
var contents = $("#contents").ajaxStop(function(){
    accordion = $("#contents").accordion({
	collapsible: true,
	active: false
    });

});
map.add(po.image()
    .url(po.url("http://{S}tile.cloudmade.com"
		+ "/1a1b06b230af4efdbb989ea99e9841af" // http://cloudmade.com/register
		+ "/998/256/{Z}/{X}/{Y}.png")
	 .hosts(["a.", "b.", "c.", ""])));

$(window).resize(function(){

    $("#map").width( this.innerWidth - contents.width() - 50).height( this.innerHeight );
    
}).trigger('resize');
map.resize();


$.ajax('proxy.php?mode=native&url=http://atlanta.craigslist.org/nat/roo/',{
    success: function(data){
	var doc = data;
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
	l = 25;


	for (var i = 0; i < l; i++) {

	    parseItem(links[i], i);
	}
    }
});

function parseItem(item, i){
    $.ajax('proxy.php?mode=native&url=' + item,{
	success: function (data) {
	    data = data.replace(/<link.+/gi,'');
	    data = data.replace(/<script.+/gi,'');
	    var title = data.match(/<title>([^<]+)/);
	    title = title && title.length > 1 ? title[1] : '';
	    data = data.match(/<body[\s\S\r\n]+body>/mg);
	    if( data ){
		data = data[0];
	    }
	    var images = data.match(/<img[^<]+/gi);//Preserve reference to image, but remove them to prevent unnecessary loading
	    data = data.replace(/<img[^<]+/gi,'');
	    
	    var body = $("<div />").html(data);
	    var glink = $('a[href*="maps.google.com"]',body).text(title);
	    var userbody = $('#userbody', body).text().replace(/[\s\t][\t\s]+/gm,' ');

	    if( glink.attr('href') ){
		//Address is URI encoded, decode in case of problems
		var address = glink[0].href.replace('http://maps.google.com/?q=loc%3A+','');

		$.ajax('proxy.php?url=http://maps.googleapis.com/maps/api/geocode/json'
		       + encodeURIComponent('?sensor=true&address=' + address),{
			   success: function(data){
			       var loc;
			       if( data.contents.results.length ){

				   loc = data.contents.results[0].geometry.location;
				   map.add(po.geoJson()
					   .features([{
					       geometry:{
						   type        : "Point",
						   coordinates : [loc.lng, loc.lat]
					       }
					   }])
					   .on("load",function(){
					       $('<h3>').append(glink).appendTo(contents);
					       contents.append('<div>' + userbody + '</div>');
					       
					       
					       $(this.container()).click(function(){
						   //div.addClass('ui-state-highlight');
						   //console.log(div)
						   // popup.show()
						   //     .css({
						   // 	   left: 100,
						   // 	   top: 100
						   //     });
						   accordion.accordion('activate',i);
					       });

					   }));

			       }
			       
			   }
		       });	
	    }
	}
    });
}