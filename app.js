const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("app listening at localhost:3000");
    });
  } catch (e) {
    console.log(`Db Error ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const modifyPlayer = (obj) => ({
  playerId: obj.player_id,
  playerName: obj.player_name,
  jerseyNumber: obj.jersey_number,
  role: obj.role,
});

//get all players
app.get("/players/", async (request, response) => {
  const getALlPlayers = `SELECT * FROM cricket_team`;
  const playersList = await db.all(getALlPlayers);
  response.send(playersList.map((eachPlayer) => modifyPlayer(eachPlayer)));
});

//add new player
app.post("/players/", async (request, response) => {
  const data = request.body;
  const { playerName, jerseyNumber, role } = data;
  const addNewPlayer = `INSERT INTO cricket_team (player_name,jersey_number,role) VALUES ('${playerName}', ${jerseyNumber}, '${role}')`;
  await db.run(addNewPlayer);
  response.send("Player Added to Team");
});

//get player by id
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `SELECT * FROM cricket_team WHERE player_id=${playerId}`;
  const playerDetails = await db.get(getPlayer);
  response.send(modifyPlayer(playerDetails));
});

// update player by id
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const data = request.body;
  const { playerName, jerseyNumber, role } = data;
  const updatePlayer = `UPDATE cricket_team SET player_name='${playerName}', jersey_number=${jerseyNumber}, role='${role}' WHERE player_id=${playerId}`;
  db.run(updatePlayer);
  response.send("Player Details Updated");
});

//delete player by id
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `DELETE FROM cricket_team WHERE player_id=${playerId}`;
  await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
