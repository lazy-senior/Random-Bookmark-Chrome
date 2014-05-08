var defaultSource = "history"; //bookmark, history or combined
var defaultSkin = "red"; //red, black, symbiose, classic

var maxHistoryResults = 100000; // TODO: implement in the CONFIGURATION PAGE 

var historyLinks;
var bookmarkLinks;

function init(){
	
	Array.prototype.add = function(element){
		if((this.indexOf(element)) < 0  && element !== undefined){
			this.push(element);
		}	
	};

	Array.prototype.fillWithNode = function(node, property){
		var arr = this;
		node.forEach(function(node){
			if(node.children){
				arr.fillWithNode(node.children, property);
			}
			arr.add(node[property]);
		});
	};

	chrome.browserAction.setIcon({path:"skin/icon16-"+localStorage.skin+"-"+localStorage.source+".png"});

	localStorage.source       		= localStorage.source === undefined ? defaultSource : localStorage.source;
	localStorage.skin         		= localStorage.skin === undefined ? defaultSkin : localStorage.skin;
	localStorage.filteringEnabled 	= localStorage.filteringEnabled === undefined ? "false" : localStorage.filteringEnabled;
	localStorage.filterList     	= localStorage.filterList === undefined ? JSON.stringify([{enabled : true, filter : "youtube.com"}]) : localStorage.filter;

	historyLinks 	= historyLinks 	=== undefined ? new Array() : historyLinks;
	bookmarkLinks	= bookmarkLinks	=== undefined ? new Array() : bookmarkLinks;

	chrome.bookmarks.getTree(function(node){
		bookmarkLinks.fillWithNode(node, 'id');
	});
	chrome.history.search({text: "", maxResults: maxHistoryResults}, function(node){
		historyLinks.fillWithNode(node, 'url');
	});

	chrome.history.onVisited.addListener(function (historyItem){
		if(historyItem.url){
			historyLinks.add(historyItem.url);
		}
	}); 
	chrome.history.onVisitRemoved.addListener(function (removed){
		console.log(removed);
	});

	chrome.bookmarks.onCreated.addListener(function(id, bookmark){
		if(!bookmark.children){
			bookmarkLinks.add(bookmark.id);
		}
	});
	chrome.bookmarks.onRemoved.addListener(function(id, removeInfo){
		
	});

}

function isValidEntry(entry){
	var oneFilterEnabled = false;
	var filterList = JSON.parse(localStorage.filterList);
	if(localStorage.filteringEnabled === "true"){
		for(var i = 0; i < filterList.length; i++){
			var filter = JSON.parse(filterList[i]);
			if(filter.enabled === true){
				oneFilterEnabled = true;
				var reg = new RegExp("^(http(s){0,1}://){0,1}(www.){0,1}("+filter.filter+"){1}.*$");
				if(reg.test(entry.url)){
					return true;
				}
			}
		}
		return !oneFilterEnabled;
	}
	return true;
}

function displayBookmark(tab, id){
	chrome.bookmarks.get(id, function callback(results){
		chrome.tabs.update(tab.id, {url: results[0].url});
	});
}

function displayHistory(tab, link){
	chrome.tabs.update(tab.id, {url: link});
}

//ADD FILTERING
function displayRandomLink(links){
	console.log(bookmarkLinks);
	console.log(historyLinks);

	chrome.windows.getLastFocused({populate: true}, function(window){
		window.tabs.forEach(function(tab){
			if(tab.active){
				if(localStorage.source == "bookmark"){
					displayBookmark(tab, bookmarkLinks[Math.floor(Math.random()*bookmarkLinks.length)]);
				}
				else if(localStorage.source == "history"){
					displayHistory(tab, historyLinks[Math.floor(Math.random()*historyLinks.length)]);
				
				} else {
					var rand = Math.floor(Math.random());
					if(rand == 0){
						rand = Math.floor(Math.random(historyLinks.length - 1));
						displayHistory(tab, historyLinks[rand]);
						
					}
					else{
						rand = Math.floor(Math.random(bookmarkLinks.length - 1));
						displayBookmark(tab, bookmarkLinks[rand]);
					}
				}
				return;
			}
		});
	});
}


init();
chrome.browserAction.onClicked.addListener(displayRandomLink);