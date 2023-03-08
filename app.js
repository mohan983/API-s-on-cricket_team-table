const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//API_1

app.get("/players/", async (request, response) => {
  const getCricketTeamQuery = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
      player_id;`;
  const cricketTeamArray = await db.all(getCricketTeamQuery);
  response.send(
    cricketTeamArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//API_2

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerDetails = `
    INSERT INTO
      cricket_team(player_name,jersey_number,role)
    VALUES
      (
        "Vishal",
        17,
        "Bowler"
      );`;

  const dbResponse = await db.run(addPlayerDetails);
  const bookId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//API_3

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetails = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      playerId = ${playerId};`;
  const player = await db.get(getPlayerDetails);
  response.send(
    player.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

///API_4
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetails = `
    UPDATE
      cricket_team
    SET
      player_name="Maneesh",
      jersey_number=54,
      role="All-rounder"
    WHERE
      player_id=${playerId};
      `;

  const dbResponse = await db.run(updatePlayerDetails);

  response.send("Player Details Updated");
});

//API_5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerDetails = `
    DELETE FROM
      cricket_team
    
    WHERE
      player_id=${playerId};
      `;

  const dbResponse = await db.run(deletePlayerDetails);

  response.send("Player Removed");
});

module.exports = app;
