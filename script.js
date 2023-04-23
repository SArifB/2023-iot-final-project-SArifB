"use strict";

// ----------------------------------------------------------------------------------
const stats = (() => {
  const mean = (arr) => {
    return arr.reduce((prev, curr) => prev + curr, 0) / arr.length;
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
    arr.forEach((n) => {
      if (!counter[n]) counter[n] = 0;
      counter[n] += 1;

      if (counter[n] === max) mode.push(n);
      else if (counter[n] > max) {
        max = counter[n];
        mode = [n];
      }
    });
    return mode;
  };

  const range = (arr) => {
    const sort = arr.sort((a, b) => a - b);
    return sort[arr.length - 1] - sort[0];
  };

  const stdDev = (arr) => {
    const mean = arr.reduce((prev, curr) => prev + curr, 0) / arr.length;
    const tmp = arr.map((n) => {
      return Math.pow(Math.abs(n - mean), 2);
    });
    return Math.sqrt(tmp.reduce((prev, curr) => prev + curr, 0) / tmp.length);
  };

  return { mean, median, mode, range, stdDev };
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

document.getElementById("Page-1").addEventListener("click", () => crPage());

document
  .getElementById("Page-2")
  .addEventListener("click", () => crPage("temperature"));

document
  .getElementById("Page-3")
  .addEventListener("click", () => crPage("humidity_in"));

let mainDataType = "temperature";

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
      <td scope="row">${date}</td>
      <td>${DataTitle}</td>
      <td>${innerData[1]}</td>
    `;
    tableBody.appendChild(row);
  });
};

// ----------------------------------------------------------------------------------
const crSecPage = async (dataType, timeSpan) => {
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

  mainDataType = dataType;

  const data = showAltData
    ? await fetchData(
        `https://webapi19sa-1.course.tamk.cloud/v1/weather/${dataType}/${timeSpan}`
      )
    : await fetchData(
        `https://webapi19sa-1.course.tamk.cloud/v1/weather/${dataType}/`
      );

  const date = data.map((n) => new Date(n.date_time));

  const tableBody = document.getElementById("TableBody");
  data.forEach((elem, idx) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td scope="row">${date[idx].toLocaleDateString()}</td>
      <td>${date[idx].toLocaleTimeString()}</td>
      <td>${elem[dataType]}</td>
    `;
    tableBody.appendChild(row);
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
      labels: date.map((n) => n.toLocaleString()),
      legend: fmtDataType,
      datasets: [
        {
          backgroundColor: "#adf",
          hoverBackgroundColor: "#7bf",
          data: data.map((n) => n[dataType]),
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
};

// ----------------------------------------------------------------------------------
const crPage = async (dataType = "none") => {
  if (dataType === "none") {
    crMnPage();
  } else {
    document.getElementById("Header").innerText =
      dataType.charAt(0).toUpperCase() + dataType.slice(1).replace("_", " ");
    crSecPage(dataType, 20);
  }

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
      <li><a id="item-05" class="dropdown-item" href="#">Wind speed</a>
      <li><a id="item-06" class="dropdown-item" href="#">Rain</a>
      </li>
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
      <li><a id="item-15" class="dropdown-item" href="#">Last week, average per hour</a>
      <li><a id="item-16" class="dropdown-item" href="#">Last month, average per hour</a>
      </li>
    </ul>
  `;

  document
    .getElementById("item-01")
    .addEventListener("click", () => crSecPage("temperature"));
  document
    .getElementById("item-02")
    .addEventListener("click", () => crSecPage("humidity_in"));
  document
    .getElementById("item-03")
    .addEventListener("click", () => crSecPage("humidity_out"));
  document
    .getElementById("item-04")
    .addEventListener("click", () => crSecPage("light"));
  document
    .getElementById("item-05")
    .addEventListener("click", () => crSecPage("wind_speed"));
  document
    .getElementById("item-06")
    .addEventListener("click", () => crSecPage("rain"));

  document
    .getElementById("item-11")
    .addEventListener("click", () => crSecPage(mainDataType));
  document
    .getElementById("item-12")
    .addEventListener("click", () => crSecPage(mainDataType, 24));
  document
    .getElementById("item-13")
    .addEventListener("click", () => crSecPage(mainDataType, 48));
  document
    .getElementById("item-14")
    .addEventListener("click", () => crSecPage(mainDataType, 72));
  document
    .getElementById("item-15")
    .addEventListener("click", () => crSecPage(mainDataType, 24 * 7));
  document
    .getElementById("item-16")
    .addEventListener("click", () => crSecPage(mainDataType, 24 * 30));
};

// ----------------------------------------------------------------------------------
crPage();
