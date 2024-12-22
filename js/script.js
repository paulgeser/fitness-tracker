
function openSideBar() {
    document.getElementById("mySidebar").style.display = "block";
}

function closeSideBar() {
    document.getElementById("mySidebar").style.display = "none";
}

function parseJsonHelper(text) {
    try {
        return JSON.parse(text);
    } catch (e) {
        return null;
    }
}

function displayNotification(message, type) {
    let div = document.getElementById("notification-box");
    if (type === "SUCCESS") {
        div.innerHTML = createMessage(message, "green");
    } else if (type === "WARNING") {
        div.innerHTML = createMessage(message, "yellow");
    } else if (type === "ERROR") {
        div.innerHTML = createMessage(message, "red");
    } else {
        div.innerHTML = createMessage("Event with unhandled type occured!", "red");
    }
}

function addTrainingRecordsToDOM(requestResponse) {
    const tableContentElement = document.getElementById("record-content");
    let contentDiv = "";
    requestResponse.result.forEach(record => {
        const recordItemDiv = createDivForRecordItem(record);
        contentDiv += recordItemDiv;
    });
    if (requestResponse.result.length === 0) {
        contentDiv = "<p>No training records yet registered with current training type selection.</p>";
    }
    tableContentElement.innerHTML = contentDiv;
}

let trainingType = 'outdoor';
function loadTrainingRecords() {
    xhr = new XMLHttpRequest();
    xhr.onerror = () => { displayNotification('Application error occured: Cannot send request'); }
    xhr.timeout = () => { displayNotification('Application error occured: Timeout'); }
    xhr.onload = () => {
        if (xhr.status < 400) {
            const response = parseJsonHelper(xhr.responseText);
            addTrainingRecordsToDOM(response);
            createCaloriesBurnLineChart(response.chart);
        } else {
            displayNotification(`Application error occured: An http error with code ${xhr.status} occured`, 'ERROR');
        }
    }
    xhr.open("GET", `backend?training_type=${trainingType}`, true);
    xhr.send();
}

function addNewTrainingRecord() {
    const formDiv = document.getElementById("add-record-form");
    if (formDiv.checkValidity()) {
        const name = document.getElementById('name').value.trim();
        const timestamp = document.getElementById('timestamp').value.trim().replace('T', ' ');
        const burnedCalories = document.getElementById('burnedCalories').value.trim();;
        const trainingType = document.getElementById('trainingType').value.trim();;
        const description = document.getElementById('description').value.trim();

        let xhr = new XMLHttpRequest();
        xhr.onerror = () => { displayNotification('Application error occured: Cannot send request'); }
        xhr.timeout = () => { displayNotification('Application error occured: Timeout'); }
        xhr.onload = () => {
            if (xhr.status < 400) {
                const response = parseJsonHelper(xhr.responseText);
                displayNotification(`${response.message} <br> Your current average calories burn is <b>${response.average_burned_calories}</b>`, 'SUCCESS');
                loadTrainingRecords();
            } else {
                displayNotification(`Application error occured: An http error with code ${xhr.status} occured`, 'ERROR');
            }
        }
        xhr.open('POST', 'backend', true);
        const request = { name, timestamp, burned_calories: burnedCalories, training_type: trainingType, description };
        xhr.send(JSON.stringify(request));
    } else {
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        document.querySelectorAll("input, select, textarea").forEach((input) => {
            input.dispatchEvent(inputEvent);
        });
    }
}

const createMessage = (message, color) => {
    return `<div class="w3-panel w3-pale-${color} w3-border w3-round-large w3-border-${color}">
        <p>${message}</p>
    </div>`;
}

const createDivForRecordItem = (record) => {
    return `
    <div class="w3-container w3-border w3-round-large w3-card-2 w3-margin-bottom w3-theme-l5">
        <h3>Training ${record.record_id}</h3>
        <p>Burned calories: ${record.burnedCalories}</p>
        <p>When: ${record.timestamp}</p>
        <p>${record.description}</p>
    </div>
    `;
}

let tempChartData = null;
// Draw the chart
function createCaloriesBurnLineChart(chartData) {
    // Check if input data contains actual data, otherwise use last stored tempChartData
    if (chartData) {
        tempChartData = chartData;
    } else {
        chartData = tempChartData;
    }
    const canvasElement = document.getElementById("training-record-chart");
    const ctx = canvasElement.getContext("2d");
    // Get real sizes of canvas
    const width = canvasElement.getBoundingClientRect().width;
    const height = 350;
    // Set sizes correctly and clear current content of canvas
    canvasElement.height = height;
    canvasElement.width = width;
    ctx.clearRect(0, 0, width, height);
    // Add lines to canvas
    ctx.beginPath();
    ctx.moveTo(0.15 * width, 35);
    ctx.lineTo(0.15 * width, 315);
    ctx.lineTo(0.9 * width, 315);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Add weekdays to canvas (horizontal labels)
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    chartData.forEach((pointData, index) => {
        ctx.fillText(pointData.labelName, chartData[index].xPosition * width, 0.95 * height);
    });
    // Add calories burn label to canvas (vertical labels)
    const maxBurnedCalories = Math.max(...chartData.map(x => x.burnedCalories));
    ctx.font = "14px Arial";
    [0, 0.25, 0.5, 0.75, 1].forEach((f, i) => {
        ctx.textAlign = "right";
        ctx.fillText(Math.round(maxBurnedCalories * f), 0.1 * width, 315 - i * 70);
    });
    // Draw calories burn line to canvas
    ctx.beginPath();
    ctx.moveTo(chartData[0].xPosition * width, chartData[0].yPosition * height);
    for (let i = 1; i < chartData.length; i++) {
        ctx.lineTo(chartData[i].xPosition * width, chartData[i].yPosition * height);
    }
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Add data points to canvas 
    ctx.fillStyle = "black";
    chartData.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.xPosition * width, point.yPosition * height, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function validateField(inputDivId, validatorFunction, errorMessage) {
    const inputDiv = document.getElementById(inputDivId);
    const errorDiv = document.getElementById(`${inputDivId}-input-error`);
    inputDiv.addEventListener("input", () => {
        errorDiv.innerHTML = inputDiv.validity.valid && validatorFunction(inputDiv.value) ? "" : errorMessage;
    });
}
// During resize of window, also resize the chart
window.addEventListener("resize", () => createCaloriesBurnLineChart(null));

function validationInit() {
    validateField("name", (value) => !!value.trim(),
        'This field is required, cannot consist only of spaces and has a max length of 45 characters');
    validateField("burnedCalories", (_) => true,
        'This field is required and the value must be in the range between 1 and 10000');
    validateField("timestamp", (value) => (new Date(value) < new Date()),
        'This field is required and cannot be in the future');
    validateField("trainingType", (_) => true,
        'This field is required');
    validateField("description", (value) => !!value.trim(),
        'This field is required, cannot consist only of spaces and has a max length of 300 characters');
}

document.addEventListener("DOMContentLoaded", (event) => {
    loadTrainingRecords();
    validationInit();
    document.getElementById("trainingType-data-output").addEventListener("input", (trainingTypeEvent) => {
        trainingType = trainingTypeEvent.target.value;
        loadTrainingRecords();
    });
});