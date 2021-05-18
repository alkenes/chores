'use strict';

const DONE = 4;
const HTTP_OK = 200;
const JSON_URL = "/resources/data/chores.json";
const EVERYDAY_CHORES = "Everyday";

const TODAYS_CHORES_NODE_ID = "todays-chores";
const TODAYS_FINISHED_CHORES_NODE_ID = "todays-finished-chores";
const TOMORROWS_CHORES_NODE_ID = "tomorrows-chores";

const TODAYS_CHORES_BUTTON_CLASS = "todays-chores-button";
const TOMORROWS_CHORES_BUTTON_CLASS = "tomorrows-chores-button";

function choreTemplate(choreName, className) {
    return `<button class="${className} p-2 mb-2 border-solid border-2 border-gray-200 rounded bg-gray-300 hover:border-gray-400 focus:border-gray-400">${choreName}</button>`;
}

/**
 * Method to call any functions that run on page load.
 */
function onLoad() {
    loadChoresJSON();
}

/**
 * Load the JSON file that stores chores and pass it to the DOM update method.
 */
function loadChoresJSON() {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == DONE && this.status == HTTP_OK) {
            upload(JSON.parse(this.response));
            processChores(JSON.parse(this.response));
        }
    };
    xhr.open("GET", JSON_URL, true);
    xhr.send();
}

/**
 * Adds the chores for today, found in the provided chores object, to the DOM.
 * @param {Object} chores 
 */
function processChores(chores) {
    let today = new Date().toLocaleString('en-US', {weekday: 'long'});
    let todaysChoresNode = document.getElementById(TODAYS_CHORES_NODE_ID);

    let todaysChores = chores[today];
    let everydayChores = chores[EVERYDAY_CHORES];

    addChores(everydayChores.concat(todaysChores), todaysChoresNode, TODAYS_CHORES_BUTTON_CLASS);

    let tomorrow = new Date(new Date() + 1).toLocaleString('en-US', {weekday: 'long'});
    let tomorrowsChoresNode = document.getElementById(TOMORROWS_CHORES_NODE_ID);
    let tomorrowsChores = chores[tomorrow];

    addChores(tomorrowsChores, tomorrowsChoresNode, TOMORROWS_CHORES_BUTTON_CLASS);
}

/**
 * Takes an array of chore buttons and adds them to the choreNode as child <li>s.
 * @param {Array} choreList 
 * @param {Node} choreNode 
 */
function addChores(choreList, choreNode, className) {
    for (let i = 0; i < choreList.length; i++) {
        let chore = choreList[i];

        let li = document.createElement('li');
        li.innerHTML = choreTemplate(chore["Name"], className).trim();
        if (className == TODAYS_CHORES_BUTTON_CLASS) {
            li.firstElementChild.addEventListener("click", handleUnfinishedChoreClick, false);
        }

        choreNode.appendChild(li);
    }
}

/**
 * Move an unfinished chore to the finished section when it is clicked
 * @param {Event} event
 */
function handleUnfinishedChoreClick(event) {
    let node = event.target;

    document.getElementById(TODAYS_FINISHED_CHORES_NODE_ID).appendChild(node.parentNode);
    node.removeEventListener("click", handleUnfinishedChoreClick, false);
    node.addEventListener("click", handleFinishedChoreClick, false);
}

/**
 * Move a finished chore to the unfinished section when it is clicked
 * @param {Event} event 
 */
function handleFinishedChoreClick(event) {
    let node = event.target;

    document.getElementById(TODAYS_CHORES_NODE_ID).appendChild(node.parentNode);
    node.removeEventListener("click", handleFinishedChoreClick, false);
    node.addEventListener("click", handleUnfinishedChoreClick, false);
}

function upload(file) {
    getUploadUrl(file, (file, url) => {
        uploadFile(file, url);
    });
}

function getUploadUrl(file, callback) {
    fetch(`localhost:8080/presignedUrl?name=${file.name}`).then((response) => {
        response.text().then((url) => {
            callback(file, url);
        });
    }).catch((exception) => {
        console.error(exception);
    });
}

function uploadFile(file, url) {
    fetch(url, {
        method: 'PUT',
        body: file
    }).then(() => {
        console.log("Chores JSON persisted");
    }, () => {
        console.warn("Chores JSON could not be persisted, promise not fulfilled.")
    }).catch((exception) => {
        console.error(exception)
    });
}

onLoad();