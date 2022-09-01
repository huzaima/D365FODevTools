"use strict"

function openTab(isNewTab) {

    var element = document.getElementsByClassName("mdl-tabs__tab is-active")[0];

    var url, baseURL, company;

    baseURL = document.getElementById('base_url').value;
    company = document.getElementById('company').value;

    switch (element.hash) {
        case '#table-browser-panel':

            var searchParams = new URLSearchParams({
                cmp: company,
                mi: "SysTableBrowser",
                tableName: document.getElementById('table_name').value
            });

            break;

        case '#class-runner-panel':
            var searchParams = new URLSearchParams({
                cmp: company,
                mi: "SysClassRunner",
                cls: document.getElementById('class_name').value
            });

            break;

        case '#form-panel':
            var searchParams = new URLSearchParams({
                cmp: company,
                f: document.getElementById('form_name').value
            });

            break;
    }

    url = `${baseURL}/?${searchParams.toString()}`;

    if (isNewTab) {
        chrome.tabs.create({ url: url }, null);
    }
    else {
        chrome.tabs.update(null, { url: url });
    }

    chrome.storage.sync.get(['base_url'], (result) => {

        var resultCopy;

        if (result.base_url && !result.base_url.includes(baseURL)) {
            resultCopy = {
                'base_url': [
                    ...result.base_url,
                    baseURL
                ]
            };
        }
        else {
            resultCopy = {
                'base_url': [
                    baseURL
                ]
            };
        }
        console.log(resultCopy);
        chrome.storage.sync.set(resultCopy);
    });
}

function validateFields(fieldName, fieldValue) {
    var baseURL, company, message = "";

    baseURL = document.getElementById('base_url').value;
    company = document.getElementById('company').value;

    if (!baseURL) {
        message += "Base URL is required. ";
    }

    if (!company) {
        message += "Company is required. ";
    }

    var element = document.getElementsByClassName("mdl-tabs__tab is-active")[0];

    switch (element.hash) {
        case '#table-browser-panel':
            if (!document.getElementById('table_name').value) {
                message += `Table name is required. `;
            }
            break;

        case '#class-runner-panel':
            if (!document.getElementById('class_name').value) {
                message += `Class name is required. `;
            }
            break;

        case '#form-panel':
            if (!document.getElementById('form_name').value) {
                message += `Form name is required. `;
            }
            break;
    }

    if (message) {
        var snackbarContainer = document.getElementById("validation-message-box");
        var data = { message: message };
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
        return false;
    }
    else {
        return true;
    }
}

window.addEventListener('DOMContentLoaded', function () {

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, ([currentTab]) => {

        var url = new URL(currentTab.url);
        let params = url.searchParams;

        // set url and company from current tab URL
        document.getElementById('base_url').value = url.origin;
        document.getElementById('company').value = params.get('cmp');
    });

    // Base URL autocomplete
    document.getElementById('base_url').addEventListener('keyup', (event) => {

        // retrieve the base_url_list element
        var base_url_list = document.getElementById('base_url_list');

        // minimum number of characters before we start to generate suggestions
        var min_characters = 0;

        if (event.target.value.length < 0) {
            return;
        }
        else {
            base_url_list.innerHTML = "";

            chrome.storage.sync.get(['base_url'], (result) => {

                if (result.base_url) {
                    result.base_url.forEach((value, index, array) => {
                        // Create a new <option> element.
                        var option = document.createElement('option');
                        option.value = value;

                        // attach the option to the datalist element
                        base_url_list.appendChild(option);
                    });
                }
            });
        }
    });

    // Button click listener
    document.getElementById('open_new_tab_button').addEventListener('click', (event) => {

        event.preventDefault();

        if (validateFields()) {
            openTab(true);
        }
    });

    // Button click listener
    document.getElementById('open_current_tab_button').addEventListener('click', (event) => {

        event.preventDefault();

        if (validateFields()) {
            openTab(false);
            window.close();
        }
    });

    // attach listeners to respond on "Enter"
    document.querySelectorAll('.mdl-textfield__input').forEach((value, index, array) => {
        value.focus();
        document.execCommand("Paste");
        value.addEventListener("keyup", event => {
            if (event.key !== "Enter") {
                return;
            }
            document.querySelector("#open_new_tab_button").click(); // Things you want to do.
            event.preventDefault(); // No need to `return false;`.
        });
    });
});