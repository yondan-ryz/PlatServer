const express = require('express');

const app = express();

app.use(express.json({ limit: '10mb' }));


app.all('/core/api/qc/rfu/Param.id', async (req, res) => {
  try {

    const targetUrl = process.env.QC_RFU_URL;

    if (!targetUrl) {
      return res.status(500).send(
        JSON.stringify({
          success: false,
          message: 'QC_RFU_URL is not configured'
        })
      );
    }


    // Query parameter
    const query = new URLSearchParams(req.query).toString();

    const url = query
      ? targetUrl + '?' + query
      : targetUrl;


    // Forward header
    const headers = {};

    Object.keys(req.headers).forEach(function (key) {

      if (
        key.toLowerCase() !== 'host' &&
        key.toLowerCase() !== 'content-length'
      ) {
        headers[key] = req.headers[key];
      }

    });


    // Forward body
    let body;

    if (
      req.method !== 'GET' &&
      req.method !== 'HEAD'
    ) {
      body = JSON.stringify(req.body);
    }


    // Request ke RFU
    const response = await fetch(url, {
      method: req.method,
      headers: headers,
      body: body
    });


    // Ambil response
    const responseText = await response.text();


    // Escape response
    const escapedResponse =
      JSON.stringify(responseText);


    // Return
    res.status(response.status);
    res.setHeader(
      'Content-Type',
      'application/json; charset=utf-8'
    );

    return res.send(escapedResponse);

  } catch (error) {

    return res.status(500).send(
      JSON.stringify({
        success: false,
        message: error.message
      })
    );

  }
});


module.exports = app;
