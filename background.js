try {
var blacklist=[];
var rem_encoded_http=false;
	
function removeEls(d, array){
	var newArray = [];
	for (let i = 0; i < array.length; i++)
	{
		if (array[i] != d)
		{
			newArray.push(array[i]);
		}
	}
	return newArray;
}

function removeChar(c, array) {
	for (let i = 0; i < array.length; i++) {
		array[i] = array[i].split(c).join('');
	}
	return array;
}

function findIndexTotalInsens(string, substring, index) {
    string = string.toLocaleLowerCase();
    substring = substring.toLocaleLowerCase();
    for (let i = 0; i < string.length ; i++) {
        if ((string.includes(substring, i)) && (!(string.includes(substring, i + 1)))) {
            index.push(i);
            break;
        }
    }
    return index;
}

function blacklistMatch(array, t) {
    var found = false;
	var blSite='';
    if (!((array.length == 1 && array[0] == "") || (array.length == 0))) {
        ts = t.toLocaleLowerCase();
        for (var i = 0; i < array.length; i++) {
            let spl = array[i].split('*');
            spl = removeEls("", spl);

            var spl_mt = [];
            for (let k = 0; k < spl.length; k++) {
                var spl_m = [];
                findIndexTotalInsens(ts, spl[k], spl_m);

                spl_mt.push(spl_m);


            }

            found = true;

            if ((spl_mt.length == 1) && (typeof spl_mt[0][0] === "undefined")) {
                found = false;
            } else if (!((spl_mt.length == 1) && (typeof spl_mt[0][0] !== "undefined"))) {

                for (let m = 0; m < spl_mt.length - 1; m++) {

                    if ((typeof spl_mt[m][0] === "undefined") || (typeof spl_mt[m + 1][0] === "undefined")) {
                        found = false;
                        m = spl_mt.length - 2; //EARLY TERMINATE
                    } else if (!(spl_mt[m + 1][0] > spl_mt[m][0])) {
                        found = false;
                    }
                }

            }
            blSite = (found) ? array[i] : blSite;
            i = (found) ? array.length - 1 : i;
        }
    }
    //console.log(found);
    return [found,blSite];

}

function redirect(requestDetails) {
if( (blacklist.length==0 || !blacklistMatch(blacklist,requestDetails.url)[0]) && (requestDetails.url.includes('http://') || requestDetails.url.includes('http%3A%2F%2F') )  ){
  return {
    redirectUrl: (rem_encoded_http)?requestDetails.url.split('http://').join('https://').split('http%3A%2F%2F').join('https%3A%2F%2F'):requestDetails.url.replace('http://','https://')
  };
}
}
	
function start() {

		chrome.storage.sync.get(null, function(items) {
			if (Object.keys(items).length == 0) {
						chrome.storage.sync.set({
							"bList": "",
							"rem_enc_HTTP": false		
						}, function() {});
			}else{
				if(items.bList.length>0){
						blacklist = items.bList.split('\n').join('').split(',');
						blacklist = removeEls("", blacklist);
						blacklist = removeChar("\n", blacklist);
				}
				rem_encoded_http=items.rem_enc_HTTP;
			}
			
	chrome.webRequest.onBeforeRequest.addListener(
	  redirect,
	  {urls:["<all_urls>"], types:["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"]},
	  ["blocking","requestBody", "extraHeaders"]
	);

		});
}


start();

} catch (e) {
  console.error(e);
}