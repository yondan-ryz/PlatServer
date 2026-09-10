
const express = require('express');

const app = express();

app.use(express.json({ limit: '10mb' }));


// ======================================================
// QC RFU HANDLER
//
// Logic utama / existing
// Kedua route akan menggunakan handler ini.
//
// /api/qc-rfu/:id
// /internal/pega/qc-rfu/:id
// ======================================================

async function qcRfuHandler(req, res) {

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
    // AMBIL BODY REQUEST
    // ==================================================

    const body = req.body;


    // ==================================================
    // DATA HASIL REQUEST
    //
    // Data berasal dari request yang dikirim
    // ==================================================

    const data = {

      qc_rfu_id: id,

      notes: body && body.notes
        ? body.notes
        : null,

      is_invalid: body && body.is_invalid
        ? body.is_invalid
        : false

    };


    // ==================================================
    // RESPONSE EXISTING
    // ==================================================

    const responseData = {

      code: 0,

      message: 'Success',

      data: data,

      timestamp: new Date().toISOString()

    };


    // ==================================================
    // RETURN RESPONSE
    // ==================================================

    return res.status(200).json(responseData);


  } catch (error) {

    return res.status(500).json({

      code: 500,

      message: error.message,

      data: null,

      timestamp: new Date().toISOString()

    });

  }

}


// ======================================================
// ROUTE LAMA / EXISTING
// ======================================================

app.all('/api/qc-rfu/:id', qcRfuHandler);


// ======================================================
// ROUTE BARU
//
// URL:
// /internal/pega/qc-rfu/:id
//
// Menggunakan handler yang sama dengan route lama.
// ======================================================

app.all('/internal/pega/qc-rfu/:id', qcRfuHandler);


// ======================================================
// EXPORT
// ======================================================

module.exports = app;

