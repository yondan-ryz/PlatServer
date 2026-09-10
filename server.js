
const express = require('express');

const app = express();

app.use(express.json({ limit: '10mb' }));


// ======================================================
// DYNAMIC RFU API
//
// Contoh:
// GET  /core/api/qc/rfu/sadasdsadf
// POST /core/api/qc/rfu/123456
// ======================================================

app.all('/internal/pega/qc-rfu/:id', async (req, res) => {

  try {

    // ==================================================
    // AMBIL ID DARI URL
    // ==================================================

    const id = req.params.id;


    // ==================================================
    // AMBIL QUERY PARAMETER
    // ==================================================

    const query = req.query;


    // ==================================================
    // AMBIL BODY
    // ==================================================

    const body = req.body;


    // ==================================================
    // RESPONSE
    //
    // response dibuat sebagai escaped JSON string
    // ==================================================

    const responseData = {
      method: req.method,
      id: id,
      query: query,
      body: body
    };


    const escapedResponse =
      JSON.stringify(responseData);


    // ==================================================
    // RETURN
    // ==================================================

    res.status(200);

    res.setHeader(
      'Content-Type',
      'application/json; charset=utf-8'
    );


    return res.send(
      JSON.stringify({

        success: true,

        id: id,

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

