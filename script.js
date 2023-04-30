"use strict";

// ----------------------------------------------------------------------------------
const stats = (() => {
  const mean = (arr) => {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  };

  const median = (arr) => {
    const sort = arr.sort((a, b) => a - b);
    const mid = Math.floor(sort.length / 2);
    return sort.length % 2 === 0 ? (sort[mid - 1] + sort[mid]) / 2 : sort[mid];
  };

  const mode = (arr) => {
    let counter = {};
    let mode = [];
    let max = 0;

    arr.forEach((x) => {
      if (!counter[x]) counter[x] = 0;
      counter[x] += 1;

      if (counter[x] === max) mode.push(x);
      else if (counter[x] > max) {
        max = counter[x];
        mode = [x];
      }
    });
    return mode;
  };

  const range = (arr) => {
    const sort = arr.sort((a, b) => a - b);
    return sort[arr.length - 1] - sort[0];
  };

  const stdDev = (arr) => {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const tmp = arr.map((x) => Math.pow(Math.abs(x - mean), 2));
    return Math.sqrt(tmp.reduce((a, b) => a + b, 0) / tmp.length);
  };

  return { mean, median, mode, range, stdDev };
})();

const mainData = (() => {
  let type = "temperature";
  let time = 0;
  let tableState = false;

  const setType = (t) => (type = t);
  const getType = () => type;

  const setTime = (t) => (time = t);
  const getTime = () => time;

  const resetTableState = () => (tableState = false);
  const getTableState = () => {
    if (tableState) return true;
    tableState = true;
    return false;
  };

  return { setType, getType, setTime, getTime, resetTableState, getTableState };
})();

const fetchData = async (source) => {
  try {
    const res = await fetch(source);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(e);
  }
};

// ----------------------------------------------------------------------------------
const crNavbar = () => {
  document.getElementById("Navbar").innerHTML = `
  <nav id="navbar" class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand">Weather Station</a>
      <button
        class="navbar-toggler collapsed"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" id="Page-1" href="#">Main Page</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" id="Page-2" href="#">Temperature</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" id="Page-3" href="#">Humidity in</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
`;

  document.getElementById("Page-1").onclick = () => crPage();
  document.getElementById("Page-2").onclick = () => crPage("temperature");
  document.getElementById("Page-3").onclick = () => crPage("humidity_in");
};

// ----------------------------------------------------------------------------------
const crMnPage = async () => {
  document.getElementById("Header").innerText = "Main Page";

  document.getElementById("Data").innerHTML = `
    <table class="table table-hover">
      <thead class="table-light">
        <tr>
          <th scope="col">Local Date And Time</th>
          <th scope="col">Datatype</th>
          <th scope="col">Data</th>
        </tr>
      </thead>
      <tbody id="TableBody">
      </tbody>
    </table>
  `;

  const data = await fetchData(
    `https://webapi19sa-1.course.tamk.cloud/v1/weather/limit/50`
  );
  const tableBody = document.getElementById("TableBody");

  data.forEach((elem) => {
    const [innerData] = Object.entries(elem.data);
    const date = new Date(elem.date_time).toLocaleString();
    const row = document.createElement("tr");
    const DataTitle =
      innerData[0].charAt(0).toUpperCase() +
      innerData[0].slice(1).replace("_", " ");

    row.innerHTML = `
      <td>${date}</td>
      <td>${DataTitle}</td>
      <td>${innerData[1]}</td>
    `;
    tableBody.appendChild(row);
  });
};

// ----------------------------------------------------------------------------------
const crAddInfo = async (dataType, timeSpan) => {
  const updTable = mainData.getTableState() && mainData.getTime() !== timeSpan;

  if (updTable)
    document.getElementById("Data").innerHTML = `
      <table class="table table-hover">
        <thead class="table-light">
          <tr>
            <th scope="col">Local Date</th>
            <th scope="col">Local Time</th>
            <th scope="col">Data</th>
          </tr>
        </thead>
        <tbody id="TableBody">
        </tbody>
      </table>
    `;

  document.getElementById("Chart").innerHTML = `
    <canvas id="Forecast"></canvas>
  `;

  const showAltData = timeSpan >= 24;

  mainData.setType(dataType);
  mainData.setTime(timeSpan);

  const rawData = showAltData
    ? await fetchData(
        `https://webapi19sa-1.course.tamk.cloud/v1/weather/${dataType}/${timeSpan}`
      )
    : await fetchData(
        `https://webapi19sa-1.course.tamk.cloud/v1/weather/${dataType}/`
      );

  const date = rawData.map((x) => new Date(x.date_time));
  const data = rawData.map((x) => parseFloat(x[dataType]));

  const tableBody = document.getElementById("TableBody");

  if (updTable)
    data.forEach((elem, idx) => {
      const mainRow = document.createElement("tr");
      mainRow.innerHTML = `
        <td>${date[idx].toLocaleDateString()}</td>
        <td>${date[idx].toLocaleTimeString()}</td>
        <td>${elem}</td>
      `;
      tableBody.appendChild(mainRow);
    });

  const fmtDataType = dataType.replace("_", " ");

  const altText =
    timeSpan > 72
      ? `Average readings per hour of ${fmtDataType} for last ${
          timeSpan / 24
        } days`
      : `Average readings per hour of ${fmtDataType} for last ${timeSpan} hours`;

  new Chart("Forecast", {
    type: "bar",
    data: {
      labels: date.map((x) => x.toLocaleString()),
      legend: fmtDataType,
      datasets: [
        {
          backgroundColor: "#adf",
          hoverBackgroundColor: "#7bf",
          data: rawData.map((x) => x[dataType]),
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: showAltData ? altText : `20 latest ${fmtDataType} readings`,
        },
      },
    },
  });

  document.getElementById("More").innerHTML = `
    <h5 class="m-2">Additional info</h5>
    <table class="table table-hover">
      <tbody>
        <tr>
          <td>Mean</td>
          <td>${stats.mean(data)}</td>
        </tr>
          <td>Median</td>
          <td>${stats.median(data)}</td>
        <tr>
        </tr>
          <td>Mode</td>
          <td>${stats.mode(data)}</td>
        <tr>
        </tr>
          <td>Range</td>
          <td>${stats.range(data)}</td>
        </tr>
        <tr>
          <td>Standard deviation</td>
          <td>${stats.stdDev(data)}</td>
        </tr>
      </tbody>
    </table>
  `;
};

// ----------------------------------------------------------------------------------
const crDropDown = () => {
  document.getElementById("Drop").innerHTML = `
    <a
      class="btn btn-primary dropdown-toggle"
      href="#"
      role="button"
      data-bs-toggle="dropdown"
    >
      Datatype
    </a>    
    <ul class="dropdown-menu">
      <li><a id="item-01" class="dropdown-item" href="#">Temperature</a></li>
      <li><a id="item-02" class="dropdown-item" href="#">Humidity in</a></li>
      <li><a id="item-03" class="dropdown-item" href="#">Humidity out</a></li>
      <li><a id="item-04" class="dropdown-item" href="#">Light</a></li>
      <li><a id="item-05" class="dropdown-item" href="#">Wind speed</a></li>
      <li><a id="item-06" class="dropdown-item" href="#">Rain</a></li>
    </ul>
    <a
      class="btn btn-primary dropdown-toggle"
      href="#"
      role="button"
      data-bs-toggle="dropdown"
    >
      Timespan
    </a>    
    <ul class="dropdown-menu">
      <li><a id="item-11" class="dropdown-item" href="#">Latest 20 readings</a></li>
      <li><a id="item-12" class="dropdown-item" href="#">Last 24 hours, average per hour</a></li>
      <li><a id="item-13" class="dropdown-item" href="#">Last 48 hours, average per hour</a></li>
      <li><a id="item-14" class="dropdown-item" href="#">Last 72 hours, average per hour</a></li>
      <li><a id="item-15" class="dropdown-item" href="#">Last week, average per hour</a></li>
      <li><a id="item-16" class="dropdown-item" href="#">Last month, average per hour</a></li>
    </ul>
  `;

  document.getElementById("item-01").onclick = () => crAddInfo("temperature");
  document.getElementById("item-02").onclick = () => crAddInfo("humidity_in");
  document.getElementById("item-03").onclick = () => crAddInfo("humidity_out");
  document.getElementById("item-04").onclick = () => crAddInfo("light");
  document.getElementById("item-05").onclick = () => crAddInfo("wind_speed");
  document.getElementById("item-06").onclick = () => crAddInfo("rain");

  document.getElementById("item-11").onclick = () =>
    crAddInfo(mainData.getType());
  document.getElementById("item-12").onclick = () =>
    crAddInfo(mainData.getType(), 24);
  document.getElementById("item-13").onclick = () =>
    crAddInfo(mainData.getType(), 48);
  document.getElementById("item-14").onclick = () =>
    crAddInfo(mainData.getType(), 72);
  document.getElementById("item-15").onclick = () =>
    crAddInfo(mainData.getType(), 24 * 7);
  document.getElementById("item-16").onclick = () =>
    crAddInfo(mainData.getType(), 24 * 30);
};

// ----------------------------------------------------------------------------------
const crPage = async (dataType) => {
  if (!dataType) {
    mainData.resetTableState();
    crAddInfo(mainData.getType(), mainData.getTime());
    crMnPage();
  } else {
    document.getElementById("Header").innerText =
      dataType.charAt(0).toUpperCase() + dataType.slice(1).replace("_", " ");
    crAddInfo(dataType);
  }
};

// ----------------------------------------------------------------------------------
crNavbar();
crDropDown();
crPage();
