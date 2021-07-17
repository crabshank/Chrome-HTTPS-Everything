try {
function redirect(requestDetails) {
	if(requestDetails.url.startsWith('http://')){
  console.log("Redirecting to HTTPS: " + requestDetails.url);
  return {
    redirectUrl: requestDetails.url.split('http://').join('https://')
  };
}
}

chrome.webRequest.onBeforeRequest.addListener(
  redirect,
  {urls:["<all_urls>"], types:["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"]},
  ["blocking","requestBody", "extraHeaders"]
);

} catch (e) {
  console.error(e);
}