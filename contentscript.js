// this is the regex for the classic garmin connect view
var regex_classic = /var\s+route*\s*=\s*{[\s\S]*};/g;
var regex_modern = /^http:\/\/connect\.garmin\.com\/modern\/course/

matches_classic = document.body.innerHTML.match(regex_classic);

matches_modern = document.location.href.match(regex_modern);


// replaces non chars
function replaceNonChar(str, rpl){
	return str.replace(/[^a-z0-9]+/gi, rpl).replace(/^-*|-*$/g, '').toLowerCase();
}

// replaces non chars with dashes
function doDashes2(str) {
    return replaceNonChar(str, '-');
}

// removes special chars from a string
function removeSpecialChars(str){
	return str.replace(/[^a-z0-9A-Z ]+/gi, '').replace(/^-*|-*$/g, '').toLowerCase();	
}


// adds the download button for the classic view
function addDownloadButtonClassic(){
		var form = window.document.getElementById('courseFormActions');
		console.log(form);
		var toolbar = form.getElementsByTagName('span')[0];
		console.log(toolbar);
		
		// var toolbar =  window.document.getElementById('courseFormActions:j_id135');
		
		
		var li = document.createElement('li');
		var a = document.createElement('a');
		a.innerHTML = 'test';
		a.className='gpx button-text route-button-text no-text';
		a.style.backgroundPosition = "-2px -1136px";
		

		a.target = '_blank';

		li.appendChild(a);
		
		var firstChild = toolbar.childNodes[0];
		
		toolbar.insertBefore(li, firstChild);

		return a;
}

// adds a download button for the modern view TODO: refactor
function addDownloadButtonModern(){
	
	
		var form = window.document.getElementById('iFrameWidget-0').contentWindow.document.getElementById('courseFormActions');
		var toolbar = form.getElementsByTagName('span')[0];
		console.log(toolbar);
		
		// var toolbar =  window.document.getElementById('courseFormActions:j_id135');
		
		
		var li = document.createElement('li');
		var a = document.createElement('a');
		a.innerHTML = 'test';
		a.className='edit no-text route-button-text';
		a.style.backgroundPosition = "-2px -1136px";
		

		a.target = '_blank';

		li.appendChild(a);
		
		var firstChild = toolbar.childNodes[0];
		
		toolbar.insertBefore(li, firstChild);

		return a;
}

function getXMLStart(routeName){
	var str = 
		'<?xml version="1.0" encoding="UTF-8"?> \n'
		+'<gpx version="1.1" creator="Garmin Connect"\n'
		+'  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd" \n'
		+'  xmlns="http://www.topografix.com/GPX/1/1" \n '
		+'  xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" \n '
		+'  xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">  \n '
		+'  <trk>   \n '
		+'    <name>'+removeSpecialChars(routeName)+'</name> \n '
		+'    <trkseg> \n'; 

	return str;
}

// switch between classic and modern view
if (matches_classic) {
	
	
	// try to find the json route information
	var first = matches_classic[0];
	
	eval(first);
	
	if(route != null){
		
		
		a = addDownloadButtonClassic();
		
		// get route name
		var routeName = document.getElementById('viewModeItems').getElementsByClassName('course-name')[0].innerHTML;


		
		
		var str = getXMLStart(routeName);
		
		
		for(o = 0; o < route.lines.length; o++){
			var points = route.lines[o].points;
			
			for(i = 0; i < points.length; i++){
				
				var point = points[i];
				

				
					str+='      <trkpt lon="'+point.lon+'" lat="'+point.lat+'"> \n '
					+'      </trkpt>\n';
				
			}
			
			
		}
	
		
		str+='    </trkseg>   '
		+'  </trk>          '
		+'</gpx>           ';
		
		var enc = window.btoa(str);
		
		var link = 'data:application/octet-stream;charset=utf-8;base64,'+enc;
		
		a.href = link;
		a.download=doDashes2(routeName)+".gpx";
		
		
	}
 
}

var xhr = new XMLHttpRequest();

// is called in the modern view when the download of the route is completed
function onDownload(){
  if (xhr.readyState == 4) {
    // JSON.parse does not evaluate the attacker's scripts.
    var resp = JSON.parse(xhr.responseText);

    var a = addDownloadButtonModern();

    // get the route's name
    var routeName = window.document.getElementById('iFrameWidget-0').contentWindow.document.getElementsByClassName('course-name')[0].innerHTML;

    		var str = getXMLStart(routeName);
		
		for(o = 0; o < resp.length; o++){
			var points = resp[o].points;
			
			for(i = 0; i < points.length; i++){
				
				var point = points[i];
				

				
					str+='      <trkpt lon="'+point.lon+'" lat="'+point.lat+'"> \n '
					+'      </trkpt>\n';
				
			}
			
			
		}
	
		
		str+='    </trkseg>   '
		+'  </trk>          '
		+'</gpx>           ';
		

		// this is nice trick which allows to "download" arbitrary data from within a link
		var enc = window.btoa(str);
		
		var link = 'data:application/octet-stream;charset=utf-8;base64,'+enc;
		
		a.href = link;
		a.download=doDashes2(routeName)+".gpx";

  }





}

// is called after the iframe is loaded and the toolbar is visible
function initializeModern(){
	
	// find the route id
	var route_id_regex = /[0-9]+/

	var matches_route_id = document.location.href.match(route_id_regex);

	var route_id = matches_route_id[0];

	
	//
	var route_json_url = "/connect.garmin.com/proxy/course-service/course/"+route_id+"/lines?_=1";

	
	xhr.onreadystatechange = onDownload; // Implemented elsewhere.
	xhr.open("GET", route_json_url, true);
	xhr.send();

}

// busy waits until the toolbar is ready
function onModernToolbarReady(){
	
	try{
		var form = window.document.getElementById('iFrameWidget-0').contentWindow.document.getElementById('courseFormActions');
		if(form == null){
			setTimeout(onModernToolbarReady, 300);	
			return;
		}
	}catch(err){
		setTimeout(onModernToolbarReady, 300);	
		return;
	}

	
	initializeModern();

}


// switchtes in case of modern view
if(matches_modern){
	
	onModernToolbarReady();


}


