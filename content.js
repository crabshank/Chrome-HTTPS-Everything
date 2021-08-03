var timer;

var chg = window.location.href;

function changeHTTPS() {
	let lks=[...document.getElementsByTagName('A')];
			
	for (let i=0; i<lks.length; i++){
			if(lks[i].href.startsWith('http://')){
				lks[i].href=lks[i].href.split('http://').join('https://');
			}
	}
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