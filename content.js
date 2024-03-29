var blacklist=[];
var rem_encoded_http=false;

function keepMatchesShadow(els,slcArr,isNodeName){
   if(slcArr[0]===false){
      return els;
   }else{
		let out=[];
		for(let i=0, len=els.length; i<len; i++){
		  let n=els[i];
				for(let k=0, len_k=slcArr.length; k<len_k; k++){
					let sk=slcArr[k];
					if(isNodeName){
						if((n.nodeName.toLocaleLowerCase())===sk){
							out.push(n);
						}
					}else{ //selector
						   if(!!n.matches && typeof n.matches!=='undefined' && n.matches(sk)){
							  out.push(n);
						   }
					}
				}
		}
		return out;
   	}
}

function getMatchingNodesShadow(docm, slc, isNodeName, onlyShadowRoots){
	let slcArr=[];
	if(typeof(slc)==='string'){
		slc=(isNodeName && slc!==false)?(slc.toLocaleLowerCase()):slc;
		slcArr=[slc];
	}else if(typeof(slc[0])!=='undefined'){
		for(let i=0, len=slc.length; i<len; i++){
			let s=slc[i];
			slcArr.push((isNodeName && slc!==false)?(s.toLocaleLowerCase()):s)
		}
	}else{
		slcArr=[slc];
	}
	var shrc=[docm];
	var shrc_l=1;
	var out=[];
	let srCnt=0;

	while(srCnt<shrc_l){
		let curr=shrc[srCnt];
		let sh=(!!curr.shadowRoot && typeof curr.shadowRoot !=='undefined')?true:false;
		let nk=keepMatchesShadow([curr],slcArr,isNodeName);
		let nk_l=nk.length;
		
		if( !onlyShadowRoots && nk_l>0){
			for(let i=0; i<nk_l; i++){
				out.push(nk[i]);
			}
		}
		
		for(let i=0, len=curr.childNodes.length; i<len; i++){
			shrc.push(curr.childNodes[i]);
		}
		
		if(sh){
			   let cs=curr.shadowRoot;
			   let csc=[...cs.childNodes];
			   if(onlyShadowRoots){
				  if(nk_l>0){
				   out.push({root:nk[0], childNodes:csc});
				  }
			   }
				for(let i=0, len=csc.length; i<len; i++){
					shrc.push(csc[i]);
				}
		}

		srCnt++;
		shrc_l=shrc.length;
	}
	
	return out;
}

function removeEls(d, array){
	var newArray = [];
	for (let i = 0; i < array.length; i++)
	{
		if (array[i] !== d)
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
		
		
if(typeof observer ==="undefined" && typeof timer ==="undefined"){
	var timer;
	var timer_tm=null;
const observer = new MutationObserver((mutations) =>
{
	if(timer){
		clearTimeout(timer);
		if(performance.now()-timer_tm>=6500){
			changeHTTPS();
			timer_tm=performance.now();
		}
	}
	
	timer = setTimeout(() =>
	{
		changeHTTPS();
		timer_tm=performance.now();
	}, 1000);
	
	if(timer_tm ===null){
		timer_tm=performance.now();
	}
});


observer.observe(document, {
	subtree: true,
	childList: true,
	attributes: true,
	attributeOldValue: true,
	characterData: true,
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
let lks=getMatchingNodesShadow(document, 'A',true,false);
	
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