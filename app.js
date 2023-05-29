const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
app.use(express.json());
let db = null;

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite.Database,
    });

    app.listen(3000, () => {
      console.log("server is running");
    });
  } catch (e) {
    console.log(`DB Error is ${e}`);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const query = `SELECT * FROM cricket_team ORDER BY player_id`;
  const result = await db.all(query);
  response.send(result.map((each) => convertDbObjectToResponseObject(each)));
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  const query = `INSERT INTO 
                        cricket_team (player_name,jersey_number,role)
                    VALUES
                     ('${playerName}',
                      ${jerseyNumber},
                      '${role}');`;

  const result = await db.run(query);
  const playerId = result.lastID;
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const result = await db.get(query);
  response.send(convertDbObjectToResponseObject(result));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const query = `UPDATE cricket_team
                     SET 
                        player_name = '${playerName}',
                        jersey_number = ${jerseyNumber},
                        role = '${role}'
                    WHERE player_id =${playerId};`;
  const result = await db.run(query);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  console.log(playerId);
  const query = `DELETE FROM 
                    cricket_team 
                  WHERE player_id = ${playerId};`;
  const result = await db.run(query);
  response.send("Player Removed");
});

module.exports = app;
