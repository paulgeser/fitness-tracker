
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
    tableContentElement.innerHTML = contentDiv;
}

function loadTrainingRecords() {
    xhr = new XMLHttpRequest();
    xhr.onerror = () => { displayNotification('application error: cannot send request'); }
    xhr.timeout = () => { displayNotification('application error: timeout'); }
    xhr.onload = () => {
        const response = parseJsonHelper(xhr.responseText);
        console.log(response);
        addTrainingRecordsToDOM(response);
        createCaloriesBurnLineChart(response.chart);
    }
    const trainingType = 'outdoor';
    const url = `backend?training_type=${trainingType}`;
    xhr.open("GET", url, true);
    xhr.send();
}

function addNewTrainingRecord() {
    const formDiv = document.getElementById("add-record-form");
    console.log();
    if (formDiv.checkValidity()) {
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
            displayNotification(`Succesfully added training record, your current average calories burn is <b>${response.average_burned_calories}</b>`, 'SUCCESS');
            loadTrainingRecords();
        }

        xhr.open('POST', 'backend', true);
        const request = { name, timestamp, burned_calories: burnedCalories, training_type: trainingType, description };
        xhr.send(JSON.stringify(request));
    } else {
        let inputElements = document.querySelectorAll("input, select, textarea");
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        inputElements.forEach((input) => {
            input.dispatchEvent(inputEvent);
        });
    }
}

const createMessage = (message, color) => {
    return `
    <div class="w3-panel w3-pale-${color} w3-border w3-round-large w3-border-${color}">
        <p>${message}</p>
    </div>
    `;
}

const createDivForRecordItem = (record) => {
    return `
    <div class="w3-container w3-border w3-round-large w3-card-2 w3-margin-bottom">
        <h2>Training ${record.record_id}</h2>
        <p>Burned calories: ${record.burnedCalories}</p>
        <p>When: ${record.timestamp}</p>
        <p>${record.description}</p>
    </div>
    `;
}

let tempChartData = null;

// Draw the chart
function createCaloriesBurnLineChart(inputChartData) {

    // Check if input data contains actual data, otherwise use last stored tempChartData
    let chartData;
    if (inputChartData) {
        tempChartData = inputChartData;
        chartData = inputChartData;
    } else {
        chartData = tempChartData;
    }

    const canvasElement = document.getElementById("training-record-chart");
    const ctx = canvasElement.getContext("2d");
    // Get real sizes of canvas
    const rect = canvasElement.getBoundingClientRect();
    const width = rect.width;
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
    const maxBurnedCalories = Math.max(...chartData.map(x => x.burnedCalories))
    const verticalLabels = [
        { name: 0, yPosition: 315 },
        { name: Math.round(maxBurnedCalories * 0.25), yPosition: 245 },
        { name: Math.round(maxBurnedCalories * 0.5), yPosition: 175 },
        { name: Math.round(maxBurnedCalories * 0.75), yPosition: 105 },
        { name: Math.round(maxBurnedCalories), yPosition: 35 }
    ];
    ctx.font = "14px Arial";
    ctx.textAlign = "right";
    verticalLabels.forEach((label) => {
        ctx.fillText(label.name, 0.1 * width, label.yPosition);
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
window.addEventListener("resize", () => drawCaloriesBurnLineChart(null));

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
});