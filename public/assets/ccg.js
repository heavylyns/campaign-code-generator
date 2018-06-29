(function (db, util) {
	'use strict';
		var countryCode = util.getParameterByName("country") || "kr",
		langCode = util.getParameterByName("lang") || "kr",
	    elements, data, dict;

  
  
  
  
  
  


	function ready() {
		//enbale showing suggestions on autocomplete components"
		// var autoCompleteFields = util.qsAll("coral-autocomplete");
		// $.each(autoCompleteFields, function (i, el) {
		// 	Coral.commons.ready(el, function() {
		// 		var tf = el.querySelector(".coral-Textfield");
		// 		if (tf) {
		// 			tf.onfocus = function () {
		// 				el.showSuggestions();
		// 			};
		// 			tf.setAttribute("keycheck", true);
		// 			tf.setAttribute("maxlength", 10);	
		// 		}
				
		// 		bindKeyValidation(el);
		// 		//		//add key press validator to input box
		// 		var inputFields = util.qsAll("[keycheck]");
		// 		$.each(inputFields, function (i, el) {
		// 			bindKeyValidation(el);
		// 		});

		// 		getDBCode(true);
		// 	});
			
		// });
		var inputFields = util.qsAll("input");
		$.each(inputFields, function (i, el) {
			Coral.commons.ready(el, function() {
				var tf = el.querySelector(".coral-Textfield");
				if (tf) {
					tf.onfocus = function () {
					el.showSuggestions();
				};
					tf.setAttribute("keycheck", true);
					tf.setAttribute("maxlength", 10);	
				}
					
				bindKeyValidation(el);
					//		//add key press validator to input box
				var inputField = util.qsAll("[keycheck]");
				// $.each(inputField, function (i, el) {
				// 	bindKeyValidation(el);
				// });
				
			});
		});
		getDBCode(true);

		
		//i18n
		i18n(function(){
			util.qs("#section-wrapper").style.display = "block";
			util.qs("#loading").style.display = "none";
		});
		
	}

	function getDBCode(updateDefault) {
		
		//init campaign data
		db.ref('company/hanwha/' + countryCode).once('value').then(function (snapshot) {

			var username = snapshot.val().username;
			// [START_EXCLUDE]
			data = snapshot.val();
			//data = jsonData;
			
			if (updateDefault) {
				// initCodeList("brand", data);
				// initCodeList("countries", data);
				// initCodeList("agency", data);

				initCodeList("utm_source", data);
				initCodeList("utm_medium", data);//utm_campaign
				initCodeList("utm_campaign", data);
			}

			// initCodeList("campaign_type", data);
			// initCodeList("channel", data);
			// //initCodeList("campaign_category");

			// util.qs("[name=channel]").addEventListener("change", function (event) {
			// 	initCodeList("channel_name", data.channel.filter(function (v) {
			// 		return v.name === event.target.value;
			// 	})[0]);
			// });

			// util.qs("[name=countries]").addEventListener("change", function (event) {
			// 	if(this.value == "cn"){
			// 		location.href = "index.html?lang=en&country=cn";
			// 	}else{
			// 		location.href = "index.html?lang=ko&country=kr";
			// 	}
			// });
			//init start / end date
			// setDate();

			//init default info
			//setTimeout(loadDefaultInfo, 500);
		});
	}

	//set sites
	function initCodeList(name, dataList) {
		dataList = dataList || data;
		var obj = dataList[name];
		var list = util.qs("[name=" + name + "]");
		list.items.clear();

		if (obj && obj.length > 0) {
			$.each(obj, function (i, item) {
				list.items.add({
					value: item.name,
					content: {
						innerHTML: item.displayName
					}
				}).selected = item.selected;
			});
		}
	}

	function getData(type) {
		return data[type];
	}

	function setDate() {
		var today = new Date();
		var datepickers = util.qsAll("coral-datepicker");
		$.each(datepickers, function (i, v) {
			v.valueAsDate = today;
		});
	}

	function generateCode() {
		clearAllInvalidMessage();
		visibleAlertArea(false);

		try {
			var c = {
				utm_source: getValue("utm_source"),
				utm_medium: getValue("utm_medium"),
				utm_term: getValue("utm_term"),
				utm_content: getValue("utm_content"),
				utm_campaign: {
					company: getValue("utm_campaign")
				}
			};
		} catch (errorObj) {
			setInvalidMessage(errorObj);
			errorObj.el.focus();
			return;
		}
		

		var utm_term = "";
		var utm_content = "";

		if(c.utm_term != "" && typeof c.utm_term != 'undefined'){
			utm_term = "&utm_term="+c.utm_term;
		}else{
			utm_term = "";
		}
		if(c.utm_content != "" && typeof c.utm_content != 'undefined'){
			utm_content = "&utm_content="+c.utm_content;
		}else{
			utm_content = "";
		}
		var code = "?utm_source="+c.utm_source+"&utm_medium="+c.utm_medium+"&utm_campaign="+c.utm_campaign.company+utm_term+utm_content;

		// if (code.length > 120) {
		// 	alert(dict["dic_alt_01"]);
		// 	return;
		// }
		
		//showResult(code);
		checkUnique(code, function (isUnique) {
			if (isUnique) {
				//submit code to repo
				c.utm_campaign.code = code;
				updateManagerCode(c.utm_campaign, function () {
				showResult(code);
				//saveDefaultInfo(c);
				});

				//No code updated
				//updateCodeList(c);

		 	}else {
		 		visibleAlertArea(true, "warning");
		 	}
		});
		

	}

	function saveDefaultInfo(codeObj) {
		var defaultInfo = {};

		if (util.qs("#general-holder").checked) {
			defaultInfo.site = { brand: codeObj.brand, country: codeObj.country };
		}

		if (util.qs("#manager-holder").checked) {
			defaultInfo.manager = { company: codeObj.manager.company, name: codeObj.manager.name };
		}

		defaultInfo.holder = {
			site: util.qs("#general-holder").checked,
			manager: util.qs("#manager-holder").checked
		};

		Cookies.set("default_"+countryCode, defaultInfo);
	}

	function loadDefaultInfo() {
		var defaultInfo = JSON.parse(Cookies.get("default_"+countryCode) || "{}");
		if (defaultInfo && defaultInfo.holder) {

			if (defaultInfo.holder.site) {
				util.qs("[name=countries]").items.getAll().filter(function (item) {
					return item.value == countryCode;
				})[0].selected = true;
				util.qs("[name=brand]").value = defaultInfo.site.brand;
				util.qs("#general-holder").checked = true;
			}

			if (defaultInfo.holder.manager) {
				/*util.qs("[name=agency]").value = defaultInfo.manager.company;*/
				util.qs("[name=agency]").value = defaultInfo.manager.company;
				util.qs("[name=manager_name]").value = defaultInfo.manager.name;
				util.qs("#manager-holder").checked = true;
			}
		}
	}

	var managerCodes = [];
	//function checkUnique(code, fn) {
	//	var company = util.qs("[name=agency]").value,
	//	    manager = util.qs("[name=manager_name]").value;

	//	db.ref("generated/" + company + "/" + manager).once('value').then(function (snapshot) {
	//		var isUnique = true;

	//		managerCodes = snapshot.val() || [];
	//		if (managerCodes && managerCodes.length > 0) {
	//			$.each(managerCodes, function (i, g) {
	//				if (g.code === code) {
	//					isUnique = false;
	//				}
	//			});
	//		}

	//		fn(isUnique);
	//	});
	//}

	// function updateManagerCode(manager, callback) {
	// 	var path = "/" + manager.company + "/" + manager.name;
	// 	var codeindex = managerCodes.length || 0;
	// 	db.ref("generated" + path + "/" + codeindex).set(manager, callback);
	// }
	function checkUnique(code, fn) {
		var campaign = util.qs("[name=utm_campaign]").value;

		db.ref("generated/" + campaign).once('value').then(function (snapshot) {
			var isUnique = true;

			managerCodes = snapshot.val() || [];
			if (managerCodes && managerCodes.length > 0) {
				$.each(managerCodes, function (i, g) {
					if (g.code === code) {
						isUnique = false;
					}
				});
			}

			fn(isUnique);
		});
	}
	function updateManagerCode(campaign, callback) {
		var path = "/" + campaign.company;
		var codeindex = managerCodes.length || 0;
		db.ref("generated" + path + "/" + codeindex).set(campaign, callback);
	}

	function showResult(code) {
		var resultMessage = util.qs("#result");
		resultMessage.value = code;

		visibleAlertArea(true, "success");
	}

	function validateDate(strElementName, endElementName) {
		var str = util.qs("[name=" + strElementName + "]");
		var end = util.qs("[name=" + endElementName + "]");

		if (str.valueAsDate > end.valueAsDate) {
			var errorObj = {
				el: end,
				name: name,
				message: dict["dic_alt_02"]
			};
			throw errorObj;
		}
	}


	function getValue(name) {
		var el = util.qs("[name=" + name + "]");

		// var errorMessage;
		// if (el.tagName == "CORAL-SELECT" && !el.selectedItem) {
		// 	errorMessage = dict["dic_alt_03"];
		// } else if (el.required && !el.value) {
		// 	errorMessage = dict["dic_alt_03"];
		// } else if (!/^[a-zA-Z0-9-_]*$/.test(el.value)) {
		// 	errorMessage = dict["dic_alt_05"];
		// } else if (el.length > 20) {
		// 	errorMessage = dict["dic_alt_04"];
		// }
		
		var errorMessage;
		if (el.tagName == "CORAL-SELECT" && !el.selectedItem) {
			errorMessage = dict["dic_alt_03"];
		} else if (el.required && !el.value) {
			errorMessage = dict["dic_alt_03"];
		} else if (el.length > 20) {
			errorMessage = dict["dic_alt_04"];
		} 
		if(el.tagName == 'INPUT'){
			if (!/^[가-힣a-zA-Z0-9-_]*$/.test(el.value)) {
				errorMessage = dict["dic_alt_05"];
			}
		}
		// if(el.tagName == 'INPUT'){
		// 	var codeByte = 0;
		// 	for(var idx = 0; idx < el.value.length; idx++){
		// 		var c = escape(el.value.charAt(idx));
		// 		c = c.replace('%','');
		// 		if(c>='u4EOO' && c<='u9FFF'){
		// 			errorMessage = dict["dic_alt_05"];
		// 		}
		// 	}
		// }

		if (errorMessage) {
			var errorObj = {
				el: el,
				name: name,
				message: errorMessage
			};
			throw errorObj;
		} else {
			return el.value;
		}
	}

	function visibleAlertArea(showAlert, type, message) {
		$.each(util.qsAll("coral-alert"), function (i, el) {
			if (type == el.getAttribute("variant") && showAlert) {
				el.style.display = "block";
			} else {
				el.style.display = "none";
			}
		});

		var pasteBtn = util.qs("#paste");
		if ("success" === type && showAlert) {
			pasteBtn.set({ label: { innerHTML: "복사" } });
			pasteBtn.disabled = false;
			pasteBtn.style.display = "inline";
		} else {
			pasteBtn.style.display = "none";
		}
	}

	function clearAllInvalidMessage() {
		//remove invalid attribute of the fields
		$.each(util.qsAll("[invalid]"), function (i, el) {
			el.removeAttribute("invalid");
		});

		//remove all error tooltips
		$.each(util.qsAll("coral-tooltip[variant=error]"), function (i, el) {
			el.remove();
		});
	}

	function setInvalidMessage(errorObj) {
		errorObj.el.setAttribute("invalid", true);

		var tooltip = new Coral.Tooltip().set({
			target: errorObj.el,
			variant: "error",
			placement: "bottom",
			open: true,
			content: {
				innerHTML: errorObj.message
			}
		});
		document.body.appendChild(tooltip);
	}

	function reset() {
		if (!confirm(dict["dic_alt_06"])) return false;

		//clear fields
		$.each(util.qsAll(".campaign-info [name]"), function (i, el) {
			_resetElement(el);
		});

		if (!util.qs("[name=general-holder]").checked) {
			$.each(util.qsAll(".default-info [name]"), function (i, el) {
				_resetElement(el);
			});
		}

		if (!util.qs("[name=manager-holder]").checked) {
			$.each(util.qsAll(".manager-info [name]"), function (i, el) {
				_resetElement(el);
			});
		}

		//hide result
		visibleAlertArea(false);
	}

	function _resetElement(element) {
		if (element.tagName === "CORAL-SELECT") {
			element.clear();
		} else if (element.tagName === "CORAL-AUTOCOMPLETE") {
			element._elements.input.value = "";
		} else {
			element.value = "";
		}
	}

	function copyCode() {
		util.qs("#result").select();
		document.execCommand('copy');

		var pasteBtn = util.qs("#paste");
		pasteBtn.set({ label: { innerHTML: dict["dic_alt_08"] } });
		pasteBtn.disabled = true;
	}

	function bindKeyValidation(el) {
		if (el) {
			el.onkeypress = function (e) {
				//return (/[|0-9|A-Z|a-z|_]/.test(String.fromCharCode(e.which))
				var returnVal = /[가-힣a-zA-Z0-9_]/g.test(String.fromCharCode(e.which));
				return returnVal;
			};
			el.onkeyup = function (e) {
				e.target.value = e.target.value.replace(/[ㄱ-ㅎ]/g, "").toLowerCase();
			};
			// el.onkeyup = function (e) {
			// 	//e.target.value = e.target.value.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, "").toLowerCase();
			// 	var arr_char = "\"'\[]!@#$^&*=\\,<>?！'，．／：；？＾｀｜￣‥…¨〃–―∥＼´ˇ˘˝˙¸˛¡¿ː（）［］｛｝〔〕〈〉《》「」『』【】＋－＜＝＞±×÷≠≤≥∞∴♂♀∠⊥⌒∂∇≡≒≪≫√∽∝∵∫∬∈∋⊆⊇⊂⊃∪∩∧∨￢⇒⇔∀∃∮∑∏＄％￦′″Å￠￡￥¤℉‰€㎕㎗㎘㏄㎣㎤㎦㎙㎚㎛㎞㎢㏊㎍㎎㎏㏏㎈㎉㏈㎧㎨㎰㎱㎲㎳㎴㎵㎶㎷㎸㎹㎀㎁㎂㎃㎄㎺㎻㎼㎽㎾㎿㎐㎑㎒㎓㎔Ω㏀㏁㎊㎋㎌㏖㏅㎭㎮㎯㏛㎩㎪㎫㎬㏝㏐㏓㏃㏉㏜㏆＃＆＊＠§※☆★○●◎◇◆□■△▲▽▼→←↑↓↔〓◁◀▷▶♤♠♡♥♧♣⊙◈▣◐◑▒▤▥▨▧▦▩♨☏☎☜☞¶†‡↕↗↙↖↘♭♩♪♬㉿㈜№㏇™㏂㏘℡ªº─│┌┐┘└├┬┤┴┼━┃┏┓┛┗┣┳┫┻╋┠┯┨┷┿┝┰┥┸╂┒┑┚┙┖┕┎┍┞┟┡┢┦┧┩┪┭┮┱┲┵┶┹┺┽┾╀╁╃╄╅╆╇╈╉╊㉠㉡㉢㉣㉤㉥㉦㉧㉨㉩㉪㉫㉬㉭㉮㉯㉰㉱㉲㉳㉴㉵㉶㉷㉸㉹㉺㉻㈀㈁㈂㈃㈄㈅㈆㈇㈈㈉㈊㈋㈌㈍㈎㈏㈐㈑㈒㈓㈔㈕㈖㈗㈘㈙㈚㈛ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽⑾⑿⒀⒁⒂ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ½⅓⅔¼¾⅛⅜⅝⅞¹²³⁴ⁿ₁₂₃₄ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψωÆÐĦĲĿŁØŒÞŦŊæđðħıĳĸŀłøœßŧŋŉАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя";

			// 	for (var i=0; i<arr_char.length; i++) {
			// 		if (value.indexOf(arr_char[i]) != -1) {
			// 			alert ("특수문자는 입력하실 수 없습니다.");
			// 			value = value.substr(0, value.indexOf(arr_char[i]));
			// 			$(this).val(value);

			// 		}

			// 	}

			// };
			el.onchange = el.onkeypress;
		}
	}
	
	function i18n(callbackFn){
		db.ref("company/hanwha/"+langCode + "/i18n/").once('value').then(function (snapshot) {
			dict = snapshot.val();
			//dict = i18nJson;
			
			var textEls = [].slice.call(document.querySelectorAll("[data-i18n]"));
			textEls.forEach(function(el) {
				var i18nVar = el.getAttribute("data-i18n");
				var i18nAttr = el.getAttribute("data-i18n-attr");
				if (dict[i18nVar]) {
					if (i18nAttr) {
						el.setAttribute(i18nAttr, dict[i18nVar]);
					} else {
						el.innerHTML = dict[i18nVar];
					}
				}
			});
			
			callbackFn();
		});
		
	}
	
	window.campaignData = {
		generate: generateCode,
		getData: getData,
		reset: reset,
		copyCode: copyCode,
		initFirebase: ready

	};
})(function () {
	// Initialize Firebase
	var app = firebase.initializeApp({
		apiKey: "AIzaSyDboSQYOH9xXZxuYHcZZhofGK--c9jJB18",
		authDomain: "hanwha-code-generator.firebaseapp.com",
		databaseURL: "https://hanwha-code-generator.firebaseio.com",
		projectId: "hanwha-code-generator",
		storageBucket: "hanwha-code-generator.appspot.com",
		messagingSenderId: "235339263770"
	});

	return firebase.database();
}(), function () {
	//util
	return {
		qs: function (selector) {
			return document.querySelector(selector);
		},
		qsAll: function (selector) {
			return [].slice.call(document.querySelectorAll(selector));
		},
		getParameterByName: function(name, url) {
			if (!url) url = window.location.href;
			name = name.replace(/[\[\]]/g, "\\$&");
			var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
				results = regex.exec(url);
			if (!results) return null;
			if (!results[2]) return '';
			return decodeURIComponent(results[2].replace(/\+/g, " "));
		}
	};
}());

$(document).ready(campaignData.initFirebase);




