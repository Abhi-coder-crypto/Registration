const { MongoClient } = require("mongodb");

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    await client
      .db("registration")
      .collection("registrations")
      .insertOne({
        ...data,
        createdAt: new Date()
      });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false })
    };
  }
};
