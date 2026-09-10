
const express = require('express');

const app = express();

app.use(express.json({ limit: '10mb' }));


// ======================================================
// DYNAMIC RFU ENDPOINT
//
// Contoh:
// GET  /core/api/qc/rfu/12345
// POST /core/api/qc/rfu/ABC123
// GET  /core/api/qc/rfu/sadasdsadf
//
// req.params.id akan mengambil nilai terakhir tersebut.
// ======================================================

app.all('/core/api/qc/rfu/:id', async (req, res) => {

  try {

    // ==================================================
    // AMBIL TARGET URL DARI ENVIRONMENT VARIABLE
    // ==================================================

    const targetUrl = process.env.QC_RFU_URL;

    if (!targetUrl) {

      return res.status(500).json({
        success: false,
        message: 'QC_RFU_URL is not configured'
      });

    }


    // ==================================================
    // AMBIL ID DARI REQUEST
    // ==================================================

    const id = req.params.id;


    // ==================================================
    // QUERY PARAMETER
    //
    // Contoh:
    // /core/api/qc/rfu/12345?nik=ABC&status=APPROVED
    //
    // Akan diteruskan menjadi:
    // targetUrl?nik=ABC&status=APPROVED
    // ==================================================

    const query = new URLSearchParams(req.query).toString();

    const url = query
      ? targetUrl + '?' + query
      : targetUrl;


    // ==================================================
    // FORWARD HEADER
    // ==================================================

    const headers = {};

    Object.keys(req.headers).forEach(function (key) {

      const lowerKey = key.toLowerCase();

      if (
        lowerKey !== 'host' &&
        lowerKey !== 'content-length'
      ) {

        headers[key] = req.headers[key];

      }

    });


    // ==================================================
    // FORWARD BODY
    // ==================================================

    let body;

    if (
      req.method !== 'GET' &&
      req.method !== 'HEAD'
    ) {

      body = JSON.stringify(req.body);

    }


    // ==================================================
    // REQUEST KE RFU
    // ==================================================

    const response = await fetch(url, {

      method: req.method,

      headers: headers,

      body: body

    });


    // ==================================================
    // AMBIL RESPONSE DARI RFU
    // ==================================================

    const responseText = await response.text();


    // ==================================================
    // ESCAPE RESPONSE
    //
    // Contoh response asli:
    //
    // {"status":"APPROVED","score":850}
    //
    // Menjadi:
    //
    // "{\"status\":\"APPROVED\",\"score\":850}"
    // ==================================================

    const escapedResponse = JSON.stringify(responseText);


    // ==================================================
    // RETURN RESPONSE
    // ==================================================

    res.status(response.status);

    res.setHeader(
      'Content-Type',
      'application/json; charset=utf-8'
    );


    return res.send(

      JSON.stringify({

        // Status request
        success: response.ok,

        // HTTP status dari RFU
        statusCode: response.status,

        // ID yang dikirim pada URL
        id: id,

        // Response RFU dalam bentuk escaped string
        response: escapedResponse

      })

    );


  } catch (error) {

    // ==================================================
    // ERROR HANDLING
    // ==================================================

    return res.status(500).json({

      success: false,

      message: error.message

    });

  }

});


// ======================================================
// EXPORT APP
// ======================================================

module.exports = app;

