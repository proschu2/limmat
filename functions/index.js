const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const fetch = require("node-fetch");

admin.initializeApp();

exports.cors = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    let url = req.body.url;

    if (!url) {
      return res.status(403).send("URL is empty.");
    }

    try {
      const response = await fetch(url, {
        method: req.method,
        body:
          req.get("content-type") === "application/json"
            ? JSON.stringify(req.body)
            : req.body,
        headers: {
          "Content-Type": req.get("Content-Type"),
        },
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  });
});
