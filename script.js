"use strict";

const navBar = document.getElementById("Navbar");
navBar.innerHTML = `
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
            <a class="nav-link" id="PageLink-1" href="./index.html">Main Page</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" id="PageLink-2" href="./index.html">Temperature</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" id="PageLink-3" href="./index.html">Humidity in</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
`;

const fetchData = async (source) => {
  try {
    // const res = await fetch(`test.json`);
    const res = await fetch(source);
    const data = await res.json();
    // console.log(data);
    return data;
  } catch (e) {
    console.error(e);
  }
};

const createMainPage = async () => {
  const data = await fetchData(
    `https://webapi19sa-1.course.tamk.cloud/v1/weather/limit/50`
  );
  const table = document.getElementById("MainTable");
  table.innerHTML = `
    <table class="table table-hover">
      <thead class="table-light">
        <tr>
          <th scope="col">Local Date And Time</th>
          <th scope="col">Datatype</th>
          <th scope="col">Data</th>
        </tr>
      </thead>
      <tbody id="tableBody">
      </tbody>
    </table>
  `;
  const tableBody = document.getElementById("tableBody");

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

const createSecondaryPage = async (dataType) => {
  const data = await fetchData(
    `https://webapi19sa-1.course.tamk.cloud/v1/weather/${dataType}`
  );
  const table = document.getElementById("SideTable");
  const chart = document.getElementById("ChartTable");

  table.innerHTML = `
    <table class="table table-hover">
      <thead class="table-light">
        <tr>
          <th scope="col">Local Date</th>
          <th scope="col">Local Time</th>
          <th scope="col">Data</th>
        </tr>
      </thead>
      <tbody id="tableBody">
      </tbody>
    </table>
  `;
  const tableBody = document.getElementById("tableBody");

  chart.innerHTML = `
    <canvas id="Forecast"></canvas>
    `;

  // const temps = data.map((n) => n[datatype]);
  const date1 = data.map((n) => new Date(n.date_time).toLocaleDateString());
  const date2 = data.map((n) => new Date(n.date_time).toLocaleTimeString());

  data.forEach((elem, idx) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td scope="row">${date1[idx]}</td>
        <td>${date2[idx]}</td>
        <td>${elem[dataType]}</td>
      `;
    tableBody.appendChild(row);
  });

  // let xVals = date2;
  // let yVals = temps;
  // let barColors = ["red", "green", "blue", "orange", "brown"];

  const datatype = Object.entries(data[0])[2][0];
  new Chart("Forecast", {
    type: "bar",
    data: {
      labels: date2,
      datasets: [
        {
          // backgroundColor: barColors,
          data: data.map((n) => n[datatype]),
        },
      ],
    },
    options: {
      plugins: {
        colors: { enabled: true },
        legend: { display: false },
        title: {
          display: true,
          text: `20 latest ${dataType.replace("_", " ")} readings`,
        },
      },
    },
  });
};

const assignHeader = (title) => {
  const header = document.getElementById("Header");
  header.innerHTML = title;
};

const page = sessionStorage.page;
if (page === "page3") {
  assignHeader("Humidity in");
  createSecondaryPage("humidity_in");
} else if (page === "page2") {
  assignHeader("Temperature");
  createSecondaryPage("temperature");
} else {
  assignHeader("Main Page");
  createMainPage();
}
// if (page === "page1" || page === undefined)
// <canvas id="weather-forecast"></canvas>

const link1 = document.getElementById("PageLink-1");
link1.addEventListener("click", () => {
  sessionStorage.setItem("page", "page1");
});

const link2 = document.getElementById("PageLink-2");
link2.addEventListener("click", () => {
  sessionStorage.setItem("page", "page2");
});

const link3 = document.getElementById("PageLink-3");
link3.addEventListener("click", () => {
  sessionStorage.setItem("page", "page3");
});
