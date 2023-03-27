// popup.js

// https://stackoverflow.com/a/46870005/6243352
// load to text1 cookie
/*
async function getCookie(tabId) {
	const [{ result }] = await chrome.scripting.executeScript({
		func: () => document.cookie,
		args: [],
		target: {
			tabId: tabId ??
				(await chrome.tabs.query({ active: true, currentWindow: true }))[0].id
		},
		world: "MAIN",
	});
	return result;
}
// load to text1 cookie part2
(async () => {
	const cookie = await getCookie();

	// visible in the extension's devtools console
	console.log("popup:", cookie);

	// visible in the extension's DOM
	document.querySelector("#cookie_text").textContent = cookie;
})();
*/

// $textarea
const cookieTextarea = document.getElementById("cookie_text");
const ButtonCopy = document.getElementById("BTcopy");

// Read Cookie
(async () => {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		// since only one tab should be active and in the current window at once
		// the return variable should only have one entry
		var activeTab = tabs[0];
		var activeTabId = activeTab.id; // or do whatever you need


		chrome.cookies.getAll({ url: activeTab.url }, function (cookie) {
			console.log(cookie.length);
			let allCookieInfo = "";
			allCookieInfo = JSON.stringify(cookie);
			/*
			for (i = 0; i < cookie.length; i++) {
				console.log(JSON.stringify(cookie[i]));

				allCookieInfo = allCookieInfo + JSON.stringify(cookie[i]);
			}*/
			cookieTextarea.textContent = allCookieInfo;
		});
	});
})();

// convert to Netscape type
async function convertToNetscape(cookieText) {

	// convert to Netscape type
	/*
	//
	let finaltxt = "# Netscape HTTP Cookie File\n\n";

	let origintext = cookieText;
	origintext = origintext.replace(/}{/g, '\n');
	origintext = origintext.replace(/{|}|"/g, '');
	const cookies = origintext.split('\n');

	let cookieObj = new Object();

	for (const [i, cookie] of cookies.entries()) {
		let cookieparse = cookie.split(',');
		let tempObj = new Object();
		tempObj.hasOwnProperty('expirationDate')
		tempObj["expirationDate"] = 0; // default expiration set 0
		for (const [j, cookieToken] of cookieparse.entries()) {
			let pair = cookieToken.split(':');
			pair[1] = pair[1] === "true" ? "TRUE" : pair[1];
			pair[1] = pair[1] === "false" ? "FALSE" : pair[1];
			tempObj[pair[0]] = pair[1];
		}
		//post process
		if (tempObj["sameSite"] != "FALSE") tempObj["sameSite"] = "TRUE";

		if (tempObj["domain"].charAt(0) !== '.') tempObj["domain"] = '.' + tempObj["domain"];

		cookieObj[i] = tempObj;
	}

	//OUTPUT
	for (const key in cookieObj) {
		finaltxt += ([cookieObj[key]["domain"], cookieObj[key]["sameSite"], cookieObj[key]["path"], cookieObj[key]["httpOnly"], cookieObj[key]["expirationDate"], cookieObj[key]["name"], cookieObj[key]["value"]].join('\t'));
		finaltxt += "\n"
	}*/
	// convert to Netscape type

	let parsed = JSON.parse(cookieText);

	//OUTPUT
	let finaltxt = "# Netscape HTTP Cookie File\n\n";
	for (const key in parsed) {
		// organize
		parsed[key]["sameSite"] = parsed[key]["sameSite"] == "false" ? "FALSE" : "TRUE";
		parsed[key]["httpOnly"] = parsed[key]["httpOnly"] == false ? "FALSE" : "TRUE";
		if (parsed[key]["domain"].charAt(0) !== '.') parsed[key]["domain"] = '.' + parsed[key]["domain"];
		if (!parsed[key].hasOwnProperty("expirationDate")) parsed[key]["expirationDate"] = "0";

		// final writing
		finaltxt += (
			[parsed[key]["domain"], parsed[key]["sameSite"], parsed[key]["path"],
			parsed[key]["httpOnly"], parsed[key]["expirationDate"], parsed[key]["name"], parsed[key]["value"]].join('\t')
		);
		finaltxt += "\n"
	}

	return finaltxt;
}



// Copy button
ButtonCopy.onclick = () => {

	chrome.cookies.getAll({
	}, function (theCookies) {
		cookies = theCookies
		console.log(cookies)
	});


	// textarea의 내용을 복사한다.

	window.navigator.clipboard.writeText(cookieTextarea.value).then(() => {
		// 복사가 완료되면 호출된다.
		ButtonCopy.firstChild.data = "복사완료";
		setTimeout(function () {
			ButtonCopy.firstChild.data = "복사";
		}, 3000);
	});
};

// Download button
document.getElementById("BTdownload").onclick = async () => {
	const text = cookieTextarea.value;
	const netscapeText = await convertToNetscape(text);
	// 저장하고자하는 파일명
	const filename = 'cookies';
	const element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(netscapeText));
	element.setAttribute('download', filename);
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}


