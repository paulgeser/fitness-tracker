
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
    switch (type) {
        case "SUCCESS":
            div.innerHTML = createSuccessMessage(message);
            break;
        case "WARNING":
            div.innerHTML = createWarningMessage(message);
            break;
        case "ERROR":
            div.innerHTML = createErrorMessage(message);
            break;
        default:
            div.innerHTML = createErrorMessage("Event with unhandled type occured!");
            break;
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
        prepareDateForChart(response);
    }
    const trainingType = 'outdoor';
    const url = `backend?training_type=${trainingType}`;
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
        displayNotification(`Succesfully added training record, your current average calories burn is <b>${response.average_burned_calories}</b>`, 'SUCCESS');
    }

    xhr.open('POST', 'backend', true);

    const request = { name, timestamp, burned_calories: burnedCalories, training_type: trainingType, description };
    xhr.send(JSON.stringify(request));
}

function prepareDateForChart(response) {
    let date = new Date();
    const chartData = [];
    chartData.push({
        label: date.toString().split(' ')[0],
        date: date.getDate(),
        month: date.getMonth(),
        burnedCalories: 0,
        xPosition: 0.8,
        yPosition: 0
    });
    let xPositionValue = 0.8;
    for (let i = 0; i < 6; i++) {
        xPositionValue = Number(Number(xPositionValue - 0.1).toFixed(1));
        date.setDate(date.getDate() - 1);
        chartData.push({
            label: date.toString().split(' ')[0],
            date: date.getDate(),
            month: date.getMonth(),
            burnedCalories: 0,
            xPosition: xPositionValue,
            yPosition: 0
        });
    }

    if (response.result.length !== 0) {
        chartData.forEach(chartDataItem => {
            response.result.forEach(recordItem => {
                const recordItemDate = new Date(recordItem.timestamp);
                if (recordItemDate.getDate() === chartDataItem.date && recordItemDate.getMonth() === chartDataItem.month) {
                    chartDataItem.burnedCalories += recordItem.burnedCalories;
                }
            });
        });
    }
    const maxBurnedCalories = Math.max(...chartData.map(x => x.burnedCalories))
    chartData.forEach(chartDataItem => {
        chartDataItem.yPosition = (1 - (chartDataItem.burnedCalories / maxBurnedCalories) * 0.8 - 0.1);
    })
    chartData.reverse();
    drawCaloriesBurnLineChart(chartData)
}

document.addEventListener("DOMContentLoaded", (event) => {
    loadTrainingRecords();
});