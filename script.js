/**
 *  Define variables
 */
let currentDate = new Date().toISOString().split('T')[0]; // Today's date
let startDate = ''; // Start date for the chart
let endDate = ''; // End date for the chart
let currencyChart; // Chart object for currency data
let changeChart; // Chart object for exchange rate data
let courseDateApi; // Object containing exchange rates over time
let changeRate; // Exchange rate between two currencies
let baseCurrency = 'EUR'; // Base currency for exchange rates
let currency = ['USD', 'EUR', 'CHF', 'GBP', 'EUR','EUR','USD']; // List of currencies to display in the chart


/**
 * Initialize the web page
 */
async function init() {
  setDatePicker(); // Set the date picker to default values
  await loadTimeSeriesAPI(startDate, endDate, baseCurrency); // Load exchange rates over time from the API
  creatChart(getDatesBetween(startDate, endDate), createCurrencyList(currency[0]), createCurrencyList(currency[1]), createCurrencyList(currency[2]), createCurrencyList(currency[3])); // Create the chart
  changeRate = await loadConvertRatesAPI(currentDate,currency[5]); // Load the exchange rate for a specific date
  loadChangeChart(currentDate); // Load the chart for exchange rates over time
  renderDropDown(); // Render the currency dropdown menus
  calcChange(); // Calculate the exchange rate based on user input
}


/**
 * Set the date picker to default values
 */
function setDatePicker() {
    let date = new Date();

    // Set the end date to today's date
    endDate = formatDate(date);
     // Set the start date to six months ago
    startDate = formatDate(date.setMonth(date.getMonth() - 6));
     // Set the change date to today's date
    document.getElementById('endDate').value = endDate;
    // Set the date picker start date
    document.getElementById('startDate').value = startDate;
     // Set the date picker end date
    document.getElementById('changeDate').value = endDate;

    ['startDate', 'endDate', 'changeDate'].forEach((date) => {
        document.getElementById(date).setAttribute('max', currentDate);
    });
}


/**
 * Load the exchange rate for a specific date
  */
async function loadConvertRatesAPI(changeDate,baseCurrency) {
  let url = `https://api.exchangerate.host/convert?from=${currency[5]}&to=${currency[6]}&date=${changeDate}&base=${baseCurrency}`; // URL for the API call
  let response = await fetch(url); // Make the API call
  let responseAsJson = await response.json(url); // Convert the response to JSON

  return responseAsJson.result; // Return the exchange rate
}


/**
 * Load exchange rates over time from the API
  */
async function loadTimeSeriesAPI(fromDate, toDate, baseCurrency) {
  let url = `https://api.exchangerate.host/timeseries?start_date=${fromDate}&end_date=${toDate}&base=${baseCurrency}`; // URL for the API call
  let response = await fetch(url); // Make the API call
  let responseAsJson = await response.json(url); // Convert the response to JSON

  courseDateApi = responseAsJson.rates; // Store the exchange rates in the courseDateApi variable
  courseDateApiJSON = JSON.stringify(responseAsJson.rates[startDate]); // Convert the exchange rates for the start date to a JSON string
}


/**
 * Update the chart when the user changes the start or end date
 */
async function changeDate() {
    startDate = document.getElementById('startDate').value;
    endDate = document.getElementById('endDate').value;

    await loadTimeSeriesAPI(startDate, endDate, baseCurrency);// load the exchange rates data for the selected dates
    creatChart(getDatesBetween(startDate, endDate), createCurrencyList(currency[0]), createCurrencyList(currency[1]), createCurrencyList(currency[2]), createCurrencyList(currency[3]));
}


/**
 * Toggles visibility of elements with class "changeMode" and "headline".
 */
function changeModeBtn() {
    let elements = document.getElementsByClassName('changeMode');

    // Loop through elements with class "changeMode" and toggle their visibility
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.toggle("d-none");
    }

    elements = document.getElementsByClassName('headline');

    // Loop through elements with class "headline" and toggle their visibility
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.toggle("d-none");
    }
}


/**
 * Changes currency button text and updates currency data based on selected currency.
 * @param {string} cur - The selected currency.
 * @param {number} btnNr - The button number.
 */
async function changeCurrecyBtn(cur, btnNr) {
     // Change the text of the currency button with the selected currency
    document.getElementById('currencyBtn' + btnNr).innerText = cur;

    if (btnNr < 5) {
        // If the button number is less than 5, update the corresponding currency and render the currency chart
        currency[btnNr] = cur;
        await loadTimeSeriesAPI(startDate, endDate, currency[4]);
        creatChart(getDatesBetween(startDate, endDate), createCurrencyList(currency[0]), createCurrencyList(currency[1]), createCurrencyList(currency[2]), createCurrencyList(currency[3]));
    } else {
         // If the button number is greater than or equal to 5, update the corresponding currency and render the change chart
        if (btnNr == 5) {
            currency[5] = cur;
        } else {
            currency[6] = cur;
        }
        onChangeData()
    }
}


/**
 * Calculates and displays currency change rate.
 */
function calcChange() {
    document.getElementById('changeInput2').value = document.getElementById('changeInput1').value * changeRate;
}


/**
 * Updates data and chart for currency change.
 */
async function onChangeData() {
    let changeDate = new Date(document.getElementById('changeDate').value);

    changeRate = await loadConvertRatesAPI(changeDate,currency[6]);
    loadChangeChart(changeDate);
    calcChange();
}


/**
 * Loads data and creates chart for currency change.
 * @param {Date} changeDate - The change date.
 */
async function loadChangeChart(changeDate) {
     // Create a new date object based on the change date
    let date = new Date(changeDate);

    // Set the month of the new date object back by one month
    date = date.setMonth(date.getMonth() - 1);

    // Load time series data for the previous month using the loadTimeSeriesAPI function
    // and the currency code from the global currency array
    await loadTimeSeriesAPI(formatDate(date),formatDate(changeDate), currency[5]);

    // Create a change chart using the creatChangeChart function,
    // with the array of dates between the two dates and the array of currency values
    creatChangeChart(getDatesBetween(formatDate(date),formatDate(changeDate)), createCurrencyList(currency[6]));
}


/**
 * Creates an array of currency values for a given currency id.
 * @param {string} id - The currency id.
 * @returns {Array} - An array of currency values.
 */
function createCurrencyList(id) {
    // Create an empty array
    let arrayBuffer = [];

    // Get an array of date strings from the global courseDateApi object
    let dateList = Object.keys(courseDateApi);

      // Loop through the array of dates
    for (let i = 0; i < dateList.length; i++) {
        // Add the currency value for the given currency ID to the array buffer
        arrayBuffer.push(courseDateApi[dateList[i]][id]);
    }

    // Return the array buffer
    return arrayBuffer;
}


/**
 * Creates an array of dates between two given dates.
 * @param {string} startDate - The start date.
 * @param {string} endDate - The end date.
 * @returns {Array} - An array of dates.
 */
function getDatesBetween(startDate, endDate) {
    // Create an empty array to hold the dates
    let dates = [];
    
    // Create new date objects from the start and end dates
    const currentDate = new Date(startDate + 'T00:00Z');
    const lastDate = new Date(endDate + 'T00:00Z');

    // Loop through the dates and add them to the array
    while (currentDate <= lastDate) {
        dates.push(formatDate(new Date(currentDate)));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Return the array of dates
    return dates;
};

/**
 * Formats a date object to a string in yyyy-mm-dd format.
 * @param {Date} date - The date object.
 * @returns {string} - The formatted
 */
function formatDate(date) {
     // Get the year, month, and day from the date object
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    // Add leading zeros to the month and day if necessary
    if (month.length < 2)
        month = '0' + month;

    if (day.length < 2)
        day = '0' + day;

    // Return the date string in yyyy-mm-dd forma
    return [year, month, day].join('-');
}


/**
 * Renders the dropdown menu for selecting currency
 */
function renderDropDown() {
    // Generate an array of available currency names
    let currNames = generateCurrNames();

    // Iterate through each currency button and create a dropdown menu with currency options
    for (let j = 0; j < currency.length; j++) {
        for (let i = 0; i < currNames.length; i++) {
            // Create a list item with a button for each currency option
            document.getElementById('dropdownBtn' + j).innerHTML += `
            <li><Button class="dropdown-item bg-secondary text-light" onclick="changeCurrecyBtn('${currNames[i]}', ${j})">${currNames[i]}</Button></li>`;
        }
    }
}


/**
 * Generates an array of available currency names
 */
function generateCurrNames() {
    let currNamesApi = courseDateApi[startDate];
    return Object.keys(currNamesApi);
}


/**
 * Creates a line chart with multiple currency datasets.
 * @param {Array} xValues - The array of x-axis labels.
 * @param {Array} currency1 - The array of currency values for the first currency.
 * @param {Array} currency2 - The array of currency values for the second currency.
 * @param {Array} currency3 - The array of currency values for the third currency.
 */
function creatChart(xValues, currency1, currency2, currency3, currency4) {
    // Destroy any existing chart to prevent overlapping charts
    destroyChart(currencyChart);
    // Create a new chart with the given data
    currencyChart = new Chart("currencyChart", {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
                data: currency1,
                borderColor: "red",
                fill: false
            }, {
                data: currency2,
                borderColor: "blue",
                fill: false
            }, {
                data: currency3,
                borderColor: "green",
                fill: false
            }, {
                data: currency4,
                borderColor: "orange",
                fill: false
            },]
        },
        options: {
            legend: { display: false }
        }
    });
}


/**
 * Creates a line chart with a single currency dataset for showing changes in currency value over time
 */
function creatChangeChart(xValues, changeCurrency) {
    // Destroy any existing chart to prevent overlapping charts
    destroyChart(changeChart);
    // Create a new chart with the given data
    changeChart = new Chart("changeChart", {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
                data: changeCurrency,
                borderColor: "blue",
                fill: false
            },]
        },
        options: {
            legend: { display: false }
        }
    });
}


/**
 * Destroys a chart to prevent overlapping charts
 */
function destroyChart(myChart) {
    if (myChart) {
        myChart.destroy();
    }
}