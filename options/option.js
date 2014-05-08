"use strict";



function updateIcon(){
		chrome.browserAction.setIcon({path:"../skin/icon16-"+localStorage.skin+"-"+localStorage.source+".png"});
}

function getValueOfCheckedRadioElement(parent){
	for (var i = 0; i < parent.children.length; i++){
			if (parent.children[i].checked) {
					return parent.children[i].value;
				}
	}
}

function inserti18n(message_name){
	var element = document.querySelector(".i18n_"+message_name);
	var i18n = chrome.i18n.getMessage(message_name);
	if(element.tagName == "INPUT")
		element.value = i18n;
	else
		element.innerText = i18n;
}

function i18n(){
	document.title = "Random Bookmark " + chrome.i18n.getMessage('settings_heading');
	document.querySelector('.i18n_settings_heading').innerText = "Random Bookmark " + chrome.i18n.getMessage('settings_heading');
	
	inserti18n('settings_buttonstyle');
	inserti18n('settings_source');
	inserti18n('settings_source_bookmark');
	inserti18n('settings_source_history');
	inserti18n('settings_source_combined');
	inserti18n('settings_filter');
	inserti18n('settings_filter_enabled');
	inserti18n('settings_filter_addfilter');
	inserti18n('settings_save');
	inserti18n('settings_cancel');

}



function addFilter(enabled, filter){
		
	var filterString = filter === undefined ? "" : filter;
	
	var filterList = document.getElementById("filter_list");
	
	var row = document.createElement('div');
	
	var checkbox = document.createElement('input');
	var input = document.createElement('input');
	var delbutton = document.createElement('input');

	row.setAttribute('class','row');

	row.innerHTML = '<div class="filter_item filter_checkbox">';
	row.innerHTML += '</div>';
	row.innerHTML += '<div class="filter_item filter_string">';
	row.innerHTML += '</div>';
	row.innerHTML += '<div class="filter_item delete_filter">';
	row.innerHTML += '</div><br>';

	checkbox.setAttribute('type',"checkbox");
	checkbox.setAttribute('class',"filter_enabled");
	checkbox.setAttribute('checked', enabled);

	input.setAttribute('type',"text");
	input.setAttribute('class',"filter_string_input");
	input.setAttribute('value',filterString);

	delbutton.setAttribute('class','filter_delete');
	delbutton.setAttribute("type", "button");
	delbutton.setAttribute("value", "x");

	row.querySelector('.filter_checkbox').appendChild(checkbox);
	row.querySelector('.filter_string').appendChild(input);
	row.querySelector('.delete_filter').appendChild(delbutton);

	delbutton.addEventListener('click', function(){
		filterList.removeChild(row);
	});	
	filterList.appendChild(row);


}

function loadSettings(){
	document.getElementById("button_style_" + localStorage.skin).checked = true;
	document.getElementById("selection_source_" + localStorage.source).checked = true;
	document.getElementById("filtering_enabled").checked = localStorage.filteringEnabled === "false" ? false : true; 
	var filterList = JSON.parse(localStorage.filter);
	for (var i = 0;i < filterList.length; ++i) {
		if(filterList[i].enabled === false || filterList[i].enabled === true)
			addFilter(filterList[i].enabled, filterList[i].filter);
		else
			addFilter(JSON.parse(filterList[i]).enabled, JSON.parse(filterList[i]).filter);
	}

	updateIcon();
}

function saveSettings(){
	localStorage.skin = getValueOfCheckedRadioElement(document.getElementById("settings_button_style"));
	localStorage.source = getValueOfCheckedRadioElement(document.getElementById("settings_selection_source"));
	var filter_list = document.getElementById("filter_list");
	var filter = [];
		for (var i = 0; i < filter_list.children.length; ++i){
			var val = filter_list.children[i].getElementsByClassName('filter_string_input')[0].value.replace(/ /g,"");
			if(val.length > 0)
			{
				filter.push(JSON.stringify({
					enabled : filter_list.children[i].getElementsByClassName('filter_enabled')[0].checked, 
					filter : val
				}));
			}
		}
		localStorage.filter = JSON.stringify(filter);
		localStorage.filteringEnabled = document.getElementById("filtering_enabled").checked;

		updateIcon();
		window.setTimeout(window.close, 10);
}
document.querySelector('#save').addEventListener('click', saveSettings);
document.querySelector('#cancel').addEventListener('click', cancel);
document.querySelector('#add_filter').addEventListener('click', addFilter);
document.querySelector('#rbform').onsubmit = function(){return false;};
	
loadSettings();
i18n();