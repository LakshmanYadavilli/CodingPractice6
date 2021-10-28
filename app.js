const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
const app = express();
app.use(express.json());

let db = null;

const InitializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("http://localhost:3000 running...");
    });
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
  }
};
InitializeDbAndServer();

let state = (n) => {
  return {
    stateId: n.state_id,
    stateName: n.state_name,
    population: n.population,
  };
};
let district = (n) => {
  return {
    districtId: n.district_id,
    districtName: n.district_name,
    stateId: n.state_id,
    cases: n.cases,
    active: n.active,
    deaths: n.deaths,
  };
};

// API 1
app.get("/states/", async (request, response) => {
  let get_Q = `SELECT * FROM state`;
  let Q = await db.all(get_Q);
  response.send(
    Q.map((n) => ({
      stateId: n.state_id,
      stateName: n.state_name,
      population: n.population,
    }))
  );
});

//API 2
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  let get_Q = `SELECT * FROM state WHERE state_id=${stateId}`;
  let Q = await db.get(get_Q);
  response.send(state(Q));
});

//API 3
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  let get_Q = `INSERT INTO district(district_name,state_id,cases,cured,active,deaths) VALUES
    ('${districtName}',${stateId},${cases},${cured},${active},${deaths})`;
  let Q = await db.run(get_Q);
  response.send("District Successfully Added");
});

//API 4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  let getQ = `SELECT * FROM district WHERE district_id=${districtId}`;
  let Q = await db.get(getQ);
  response.send(district(Q));
});

//API 5
app.delete("/districts/:districtId/", async (require, response) => {
  const { districtId } = request.params;
  let getQ = `DELETE FROM district WHERE district_id='${districtId}'`;
  await db.run(getQ);
  response.send("District Removed");
});

//API 6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  let get_Q = `UPDATE district SET district_name='${districtName}',state_id=${stateId},cases=${cases},cured=${cured},active=${active},deaths=${deaths}`;
  let Q = await db.run(get_Q);
  response.send("District Details Updated");
});

//API 7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateStatsQuery = `
    SELECT
      SUM(cases),
      SUM(cured),
      SUM(active),
      SUM(deaths)
    FROM
      district
    WHERE
      state_id=${stateId};`;
  const stats = await database.get(getStateStatsQuery);
  response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured)"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
});

//API 8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  let getQ = `SELECT state.state_name as stateName from state join district on state.state_id=district.state_id 
    WHERE district.district_id=${districtId} `;
  let Q = await db.get(getQ);
  response.send(Q);
});

module.exports = app;
