const express = require('express')
const app = express()
const handler = require('./src/triage-pr');


app.listen(8000, () => {
  //handler(fakePayload);
});
