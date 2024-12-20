function parseJsonHelper(text) {
    try {
        return JSON.parse(text);
    } catch (e) {
        return null;
    }
}

function displayNotification(message) {

}

function addTableContent(requestResponse) {
    const tableContentElement = document.getElementById("table-content");

}

function loadTrainingRecords() {
    xhr = new XMLHttpRequest();
    xhr.onerror = () => { displayNotification('application error: cannot send request'); }
    xhr.timeout = () => { displayNotification('application error: timeout'); }
    xhr.onload = () => {
        const response = parseJsonHelper(xhr.responseText);
        console.log(response);
        addTableContent(response);
    }
    const trainingType = 'outdoor';
    const url = `backend.php?training_type=${trainingType}`;
    xhr.open("GET", url, true);
    xhr.send();
}

function addNewTrainingRecord() {
    const name = document.getElementById('name').value.trim();
    const timestamp = document.getElementById('timestamp').value.trim().replace('T', ' ');
    const burnedCalories = document.getElementById('burnedCalories').value.trim();;
    const trainingType = document.getElementById('trainingType').value.trim();;
    const description = document.getElementById('description').value.trim();

    let xhr = new XMLHttpRequest();
    xhr.onerror = () => { displayNotification('application error: cannot send request'); }
    xhr.timeout = () => { displayNotification('application error: timeout'); }
    xhr.onload = () => {
        const response = parseJsonHelper(xhr.responseText);
        console.log(response);
        displayNotification('Succesfully added')
    }

    xhr.open('POST', 'backend.php', true);

    const request = { name, timestamp, burned_calories: burnedCalories, training_type: trainingType, description };
    xhr.send(JSON.stringify(request));
}

function createCanvas() {
    let canvas = document.getElementById("training-diagramm");
    let ctx = canvas.getContext("2d");

}

/* addNewTrainingRecord(); */