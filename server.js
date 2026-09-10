const express = require('express');

const app = express();

app.use(express.json({ limit: '10mb' }));


// ============================================================
// QC RFU
// ============================================================

app.all('/core/api/qc/rfu/Param.id', async (req, res) => {
  try {

    const targetUrl = process.env.QC_RFU_URL;

    if (!targetUrl) {
      return res.status(500).send(
        JSON.stringify({
          error: 'QC_RFU_URL is not configured'
        })
      );
    }


    // Query
    const queryString =
      new URLSearchParams(req.query).toString();

    const requestUrl =
      queryString
        ? targetUrl + '?' + queryString
        : targetUrl;


    // Header
    const headers = {};

    Object.keys(req.headers).forEach(function (key) {

      if (
        key.toLowerCase() !== 'host' &&
        key.toLowerCase() !== 'content-length'
      ) {
        headers[key] = req.headers[key];
      }

    });


    // Body
    let body = undefined;

    if (
      req.method !== 'GET' &&
      req.method !== 'HEAD'
    ) {
      body = JSON.stringify(req.body);
    }


    // Request
    const response = await fetch(requestUrl, {
      method: req.method,
      headers: headers,
      body: body
    });


    // Ambil response
    const responseText =
      await response.text();


    // Escape response
    const escapedResponse =
      JSON.stringify(responseText);


    // Return
    res.status(response.status);

    res.setHeader(
      'Content-Type',
      'application/json; charset=utf-8'
    );

    return res.send(
      escapedResponse
    );

  } catch (error) {

    console.error(error);

    return res.status(500).send(
      JSON.stringify({
        error: error.message
      })
    );

  }
});


// ============================================================
// START EXPRESS
// ============================================================

const port =
  process.env.PORT || 3000;

app.listen(port, function () {

  console.log(
    'Express server running on port ' + port
  );

});
