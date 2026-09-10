
const express = require('express');

const app = express();

app.use(express.json({ limit: '10mb' }));


// ======================================================
// DYNAMIC PARAM + ID
// Contoh:
// /core/api/qc/rfu/Test.123
// /core/api/qc/rfu/Application.456
// /core/api/qc/rfu/NIK.789
// ======================================================
app.all('/core/api/qc/rfu/:param.:id', async (req, res) => {

  try {

    const targetUrl = process.env.QC_RFU_URL;

    if (!targetUrl) {
      return res.status(500).json({
        success: false,
        message: 'QC_RFU_URL is not configured'
      });
    }


    // ==================================================
    // Ambil PARAM dan ID dari URL
    // ==================================================

    const param = req.params.param;
    const id = req.params.id;


    // ==================================================
    // Query parameter
    // ==================================================

    const query = new URLSearchParams(req.query).toString();

    const url = query
      ? targetUrl + '?' + query
      : targetUrl;


    // ==================================================
    // Forward header
    // ==================================================

    const headers = {};

    Object.keys(req.headers).forEach(function (key) {

      if (
        key.toLowerCase() !== 'host' &&
        key.toLowerCase() !== 'content-length'
      ) {
        headers[key] = req.headers[key];
      }

    });


    // ==================================================
    // Forward body
    // ==================================================

    let body;

    if (
      req.method !== 'GET' &&
      req.method !== 'HEAD'
    ) {
      body = JSON.stringify(req.body);
    }


    // ==================================================
    // Request ke RFU
    // ==================================================

    const response = await fetch(url, {
      method: req.method,
      headers: headers,
      body: body
    });


    // ==================================================
    // Ambil response asli
    // ==================================================

    const responseText = await response.text();


    // ==================================================
    // Escape response
    // ==================================================

    const escapedResponse = JSON.stringify(responseText);


    // ==================================================
    // Return response
    // ==================================================

    res.status(response.status);

    res.setHeader(
      'Content-Type',
      'application/json; charset=utf-8'
    );


    return res.send(
      JSON.stringify({
        success: response.ok,

        // Param dari request
        Param: param,

        // ID dari request
        id: id,

        // Response dari RFU dalam bentuk escaped string
        response: escapedResponse
      })
    );


  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

});


module.exports = app;
