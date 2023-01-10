let currentDate = new Date().toISOString().split('T')[0];
let startDate = '';
let endDate = '';
let currencyChart;
let changeChart;
let courseDateApi;
let changeRate;
let baseCurrency = 'EUR';
let currency = ['USD', 'EUR', 'CHF', 'GBP', 'EUR','EUR','USD'];


async function init() {
    setDatePicker();
    await loadTimeSeriesAPI(startDate, endDate, baseCurrency);
    creatChart(getDatesBetween(startDate, endDate), createCurrencyList(currency[0]), createCurrencyList(currency[1]), createCurrencyList(currency[2]), createCurrencyList(currency[3]));
    changeRate = await loadConvertRatesAPI(currentDate,currency[5]);
    loadChangeChart(currentDate);
    renderDropDown();
    calcChange();
}


function setDatePicker() {
    let date = new Date();

    endDate = formatDate(date);
    startDate = formatDate(date.setMonth(date.getMonth() - 6));
    document.getElementById('endDate').value = endDate;
    document.getElementById('startDate').value = startDate;
    document.getElementById('changeDate').value = endDate;

    ['startDate', 'endDate', 'changeDate'].forEach((date) => {
        document.getElementById(date).setAttribute('max', currentDate);
    });
}


async function loadConvertRatesAPI(changeDate,baseCurrency) {
    let url = `https://api.exchangerate.host/convert?from=${currency[5]}&to=${currency[6]}&date=${changeDate}&base=${baseCurrency}`;
    let response = await fetch(url);
    let responseAsJson = await response.json(url);

    return responseAsJson.result;

}


async function loadTimeSeriesAPI(fromDate, toDate, baseCurrency) {
    let url = `https://api.exchangerate.host/timeseries?start_date=${fromDate}&end_date=${toDate}&base=${baseCurrency}`;
    let response = await fetch(url);
    let responseAsJson = await response.json(url);

    courseDateApi = responseAsJson.rates;
    courseDateApiJSON = JSON.stringify(responseAsJson.rates[startDate])
}


async function changeDate() {
    startDate = document.getElementById('startDate').value;
    endDate = document.getElementById('endDate').value;

    await loadTimeSeriesAPI(startDate, endDate, baseCurrency);
    creatChart(getDatesBetween(startDate, endDate), createCurrencyList(currency[0]), createCurrencyList(currency[1]), createCurrencyList(currency[2]), createCurrencyList(currency[3]));
}


/*function changeModeBtn() {
    troggelElements();
}*/


function changeModeBtn() {
    let elements = document.getElementsByClassName('changeMode');

    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.toggle("d-none");
    }

    elements = document.getElementsByClassName('headline');

    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.toggle("d-none");
    }
}


async function changeCurrecyBtn(cur, btnNr) {
    document.getElementById('currencyBtn' + btnNr).innerText = cur;
    if (btnNr < 5) {
        currency[btnNr] = cur;
        await loadTimeSeriesAPI(startDate, endDate, currency[4]);
        creatChart(getDatesBetween(startDate, endDate), createCurrencyList(currency[0]), createCurrencyList(currency[1]), createCurrencyList(currency[2]), createCurrencyList(currency[3]));
    } else {
        if (btnNr == 5) {
            currency[5] = cur;
        } else {
            currency[6] = cur;
        }
        onChangeData()
    }
}


//calculate change 
function calcChange() {
    document.getElementById('changeInput2').value = document.getElementById('changeInput1').value * changeRate;
}


async function onChangeData() {
    let changeDate = new Date(document.getElementById('changeDate').value);
    changeRate = await loadConvertRatesAPI(changeDate,currency[6]);
    loadChangeChart(changeDate);
    calcChange();
}


async function loadChangeChart(changeDate) {
    let date = new Date(changeDate);

    date = date.setMonth(date.getMonth() - 1);
    await loadTimeSeriesAPI(formatDate(date),formatDate(changeDate), currency[5]);
    creatChangeChart(getDatesBetween(formatDate(date),formatDate(changeDate)), createCurrencyList(currency[6]));
}


function createCurrencyList(id) {
    let arrayBuffer = [];
    let dateList = Object.keys(courseDateApi);

    for (let i = 0; i < dateList.length; i++) {
        arrayBuffer.push(courseDateApi[dateList[i]][id]);
    }
    return arrayBuffer;
}


function getDatesBetween(startDate, endDate) {
    let dates = [];
    
    const currentDate = new Date(startDate + 'T00:00Z');
    const lastDate = new Date(endDate + 'T00:00Z');

    while (currentDate <= lastDate) {
        dates.push(formatDate(new Date(currentDate)));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};


function formatDate(date) {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;

    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}


function renderDropDown() {
    let currNames = generateCurrNames();

    for (let j = 0; j < currency.length; j++) {
        for (let i = 0; i < currNames.length; i++) {
            document.getElementById('dropdownBtn' + j).innerHTML += `
            <li><Button class="dropdown-item bg-secondary text-light" onclick="changeCurrecyBtn('${currNames[i]}', ${j})">${currNames[i]}</Button></li>`;
        }
    }
}


function generateCurrNames() {
    let currNamesApi = courseDateApi[startDate];
    return Object.keys(currNamesApi);
}


function creatChart(xValues, currency1, currency2, currency3, currency4) {
    destroyChart(currencyChart);
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


function creatChangeChart(xValues, changeCurrency) {
    destroyChart(changeChart);
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


function destroyChart(myChart) {
    if (myChart) {
        myChart.destroy();
    }
}