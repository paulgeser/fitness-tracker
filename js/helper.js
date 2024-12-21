const createSuccessMessage = (message) => {
    return `
    <div class="w3-panel w3-pale-green w3-border w3-round-large w3-border-green">
        <p>${message}</p>
    </div>
    `;
}

const createWarningMessage = (message) => {
    return `
    <div class="w3-panel w3-pale-yellow w3-border w3-round-large w3-border-yellow">
        <p>${message}</p>
    </div>
    `;
}


const createErrorMessage = (message) => {
    return `
    <div class="w3-panel w3-pale-red w3-border w3-round-large w3-border-red">
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
function drawCaloriesBurnLineChart(inputChartData) {

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
        ctx.fillText(pointData.label, chartData[index].xPosition * width, 0.95 * height);
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

// During resize of window, also resize the chart
window.addEventListener("resize", () => drawCaloriesBurnLineChart(null));
