const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");

exports.handler = async (event) => {
  jwt.verify(event.queryStringParameters.token, process.env.JWT_SECRET);

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();

  const data = await client.db("registration")
    .collection("registrations").find().toArray();

  let csv = "Name,Email,Mobile\n";
  data.forEach(r => csv += `${r.name},${r.email},${r.mobile}\n`);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=data.csv"
    },
    body: csv
  };
};
