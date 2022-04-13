var timer;
var blacklist=[];
var rem_encoded_http=false;

function getTagNameShadow(docm, tgn){
var shrc=[docm];
var shrc_l=1;

let srCnt=0;

while(srCnt<shrc_l){
	allNodes=[shrc[srCnt],...shrc[srCnt].querySelectorAll('*')];
	for(let i=0, len=allNodes.length; i<len; i++){
		if(!!allNodes[i] && typeof allNodes[i] !=='undefined' && allNodes[i].tagName===tgn && i>0){
			shrc.push(allNodes[i]);
		}

		if(!!allNodes[i].shadowRoot && typeof allNodes[i].shadowRoot !=='undefined'){
			let c=allNodes[i].shadowRoot.children;
			shrc.push(...c);
		}
	}
	srCnt++;
	shrc_l=shrc.length;
}
	shrc=shrc.slice(1);
	let out=shrc.filter((c)=>{return c.tagName===tgn;});
	
	return out;
}

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


function restore_options()
{
	if(typeof chrome.storage==='undefined'){
		restore_options();
	}else{
	chrome.storage.sync.get(null, function(items)
	{
		if (Object.keys(items).length != 0)
		{
			//console.log(items);
		
		if(!!items.bList && typeof  items.bList!=='undefined' && items.bList.length>0){
			blacklist=items.bList.split('\n').join('').split(',');
		}		
		
		if(!!items.rem_enc_HTTP && typeof  items.rem_enc_HTTP!=='undefined'){
			rem_encoded_http=items.rem_enc_HTTP;
		}

if (typeof observer === "undefined" && typeof timer === "undefined") {

changeHTTPS();

    const observer = new MutationObserver((mutations) => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
			changeHTTPS();
        }, 1000);
    });


    observer.observe(document, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
        attributeOldValue: true,
        characterDataOldValue: true
    });
}

		}
		else
		{
			save_options();
		}
	});
	}
}

function save_options()
{
		chrome.storage.sync.clear(function() {
	chrome.storage.sync.set(
	{
		bList: "",
		rem_enc_HTTP: false
	}, function()
	{
		console.log('Default options saved.');
		restore_options();
	});
		});

}

function changeHTTPS() {
let lks=getTagNameShadow(document, 'A');
	
for (let i=0; i<lks.length; i++){
	if( (blacklist.length==0 || !blacklistMatch(blacklist,lks[i].href)[0])  && (lks[i].href.includes('http://') || lks[i].href.includes('http%3A%2F%2F') )  ){
		let itx=lks[i].innerText;
		if((itx==lks[i].href) || (itx+'/'==lks[i].href)){
				lks[i].href=(rem_encoded_http)?lks[i].href.split('http://').join('https://').split('http%3A%2F%2F').join('https%3A%2F%2F'):lks[i].href.replace('http://','https://');
				lks[i].innerText=(rem_encoded_http)?itx.split('http://').join('https://').split('http%3A%2F%2F').join('https%3A%2F%2F'):itx.replace('http://','https://');
		}else{
			lks[i].href=(rem_encoded_http)?lks[i].href.split('http://').join('https://').split('http%3A%2F%2F').join('https%3A%2F%2F'):lks[i].href.replace('http://','https://');
		}
}

}
}

restore_options();