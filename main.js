(function($, undefined){

var index = 0,
    layerList = [],
    po = org.polymaps;
    
var map = po.map()
    .container(document.getElementById("map").appendChild(po.svg("svg")))
    .center({lat: 33.65, lon: -84.42})
    .zoom(9)
    .add(po.interact())
    .add(po.image()
         .url(po.url("http://{S}tile.cloudmade.com"
                     + "/1a1b06b230af4efdbb989ea99e9841af" // http://cloudmade.com/register
                     + "/998/256/{Z}/{X}/{Y}.png")
              .hosts(["a.", "b.", "c.", ""])));

    
var work = po.geoJson()
    .features(
	[{
	    geometry:{
                type        : "Point",
                coordinates : [-84.211653, 33.977504]
            }
        }]).id('work');
    
map.add(work);


    
var accordion,
    select = $("#select"),
    loading = $("#loading").dialog({ disabled: false, autoheight: false }).dialog('widget'),
    contents = $("#contents").ajaxStop(function(){
        loading.stop(true, true).fadeOut();     //Kill the AJAX dialog
        accordion = $("#contents").accordion({
            collapsible: true,
            active: true
        }).effect('slide',{
            opacity: 1
        }).css('visibility','visible');

    }).ajaxStart(function(){

        loading.show().effect('pulsate',{ easing: 'easeOutBack' }, 2500);

    });

//Handle window resizing
$(window).resize(function(){

    $("#map").width( this.innerWidth - contents.width() - 5).height( this.innerHeight );
}).trigger('resize');
map.resize();

    
select.bind('change',function(){
    var selected = this.value;
    index = 0;
    contents.accordion('destroy').empty().css('visibility','hidden');//.hide();

    $.ajax('proxy.php?mode=native&url=http://atlanta.craigslist.org/' + selected,{
        success: function(data){
            var doc = data,
                a = $("p > a", doc);

            //.append( a.append('<br/>') );
            // popup = $("<div>").css({
            //  width: 200,
            //  height: 200,
            //  display: 'none',
            //  'z-index': 1000,
            //  position: 'absolute',
            //  border: 'solid 1px black',
            //  'background-color': 'white'
            // }).appendTo('body');

            var links = a.get().map(function(n,i){
                return n.href;
            }),
            l = links.length;

            while( layerList.length ){
                map.remove(layerList.pop());
            }
            for (var i = 0; i < l; i++) {

                parseItem(links[i]);
            }
        }
    });

}).trigger('change');

function parseItem(item){

    $.ajax('proxy.php?mode=native&url=' + item,{
        success: function (data) {
            var title = data.match(/<title>([^<]+)/),
                title = title && title.length > 1 ? title[1] : '';
            data = data.replace(/(<link|<script).+/gi,'').match(/<body[\s\S\r\n]+body>/mg);
            
            if( data ){
                data = data[0];
            } else {
                return;
            }

            var images = data.match(/<img[^<]+/gi), //Preserve reference to image, but remove them to prevent unnecessary loading
                data = data.replace(/<img[^<]+/gi,''),
                body = $("<div />").html(data),
                glink = $('a[href*="maps.google.com"]',body)//.text(title)
                .clone(),
                userbody = $('#userbody', body).text().replace(/[\s\t][\t\s]+/gm,' ');

            if( glink.attr('href') ){
                //Address is URI encoded, decode in case of problems
                var address = glink[0].href.replace('http://maps.google.com/?q=loc%3A+','');

                $.ajax('proxy.php?url=http://maps.googleapis.com/maps/api/geocode/json' + encodeURIComponent('?sensor=true&address=' + address),{
                    success: function(geo){

                        var loc,
                            firstTime = true;
                        if( geo.contents.results.length ){
                            loc = geo.contents.results[0].geometry.location;
                            var point = po.geoJson()
                                    .features([{
                                        geometry:{
                                            type        : "Point",
                                            coordinates : [loc.lng, loc.lat]
                                        }
                                    }])
                                    .on("load",function(){
                                        var i = index++;
                                        if (firstTime) {
                                            firstTime = false;
                                            //Build accordion elements
                                            //Required dom tree
                                            // h3 > a
                                            // div
                                            var h3 = $('<h3>').append('<a>' + title + '</a>')
                                                .appendTo(contents)
                                                .data({
                                                    map  : glink,
                                                    link : item
                                                });
                                            contents.append('<div>' + userbody +
                                                            '<a target="_blank" href="' + item +
                                                            '">Go to craig</a>' +
                                                            '</div>');
                                            //I want a nice popup, but I'm too busy to write it
                                            //popup.html( '<a href=' + glink + '>Title</a>').show();
                                            $(this.container()).click(function(){
                                                //div.addClass('ui-state-highlight');

                                                accordion.accordion('activate',i);
                                            });

                                        }

                                    });
                            layerList.push(point);
                            map.add(point);
                        }
                    }
                });     
            }
        }
    });
};

})(jQuery);