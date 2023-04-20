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
            <a class="nav-link" id="pageLink-1" href="./index.html">Main Page</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" id="pageLink-2" href="./index.html">Temperature</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" id="pageLink-3" href="./index.html">Humidity in</a>
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

const createMainTable = async () => {
  const data = await fetchData(
    `https://webapi19sa-1.course.tamk.cloud/v1/weather/limit/50`
  );
  const table = document.getElementById("MainTable");
  table.innerHTML = `
    <table class="table table-hover">
      <thead class="table-light">
        <tr>
          <th scope="col">Date</th>
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

const createSecondTable = async (dataType) => {
  const data = await fetchData(
    `https://webapi19sa-1.course.tamk.cloud/v1/weather/${dataType}`
  );
  const table = document.getElementById("SideTable");
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

  data.forEach((elem) => {
    const date = new Date(elem.date_time);
    const [date1, date2] = [
      date.toLocaleDateString(),
      date.toLocaleTimeString(),
    ];
    const row = document.createElement("tr");

    row.innerHTML = `
        <td scope="row">${date1}</td>
        <td>${date2}</td>
        <td>${elem[dataType]}</td>
      `;
    tableBody.appendChild(row);
  });
};

const assignHeader = (title, id) => {
  const header = document.getElementById("Header");
  header.innerHTML = title;
};

const page = sessionStorage.page;
if (page === "page1" || page === undefined) {
  assignHeader("Main Page", 1);
  createMainTable();
} else if (page === "page2") {
  assignHeader("Temperature", 2);
  createSecondTable("temperature");
} else if (page === "page3") {
  assignHeader("Humidity in", 3);
  createSecondTable("humidity_in");
}

const link1 = document.getElementById("pageLink-1");
link1.addEventListener("click", () => {
  sessionStorage.setItem("page", "page1");
});

const link2 = document.getElementById("pageLink-2");
link2.addEventListener("click", () => {
  sessionStorage.setItem("page", "page2");
});

const link3 = document.getElementById("pageLink-3");
link3.addEventListener("click", () => {
  sessionStorage.setItem("page", "page3");
});
