
const express = require('express');

const app = express();

app.use(express.json({ limit: '10mb' }));


// ======================================================
// QC RFU HANDLER
// ======================================================

async function qcRfuHandler(req, res) {

  try {

    // ==================================================
    // ID DARI URL
    //
    // Tetap tersedia sebagai parameter URL,
    // tetapi TIDAK digunakan sebagai qc_rfu_id.
    // ==================================================

    const id = req.params.id;


    // ==================================================
    // BODY REQUEST
    // ==================================================

    const body = req.body || {};


    // ==================================================
    // DATA RESPONSE
    //
    // qc_rfu_id WAJIB mengambil dari BODY
    // ==================================================

    const data = {

      qc_rfu_id: body.qc_rfu_id,

      notes: body.notes,

      is_invalid: body.is_invalid

    };


    // ==================================================
    // RESPONSE
    // ==================================================

    const responseData = {

      code: 0,

      message: 'Success',

      data: data,

      timestamp: new Date().toISOString()

    };


    // ==================================================
    // RETURN
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

app.all(
  '/api/qc-rfu/:id',
  qcRfuHandler
);


// ======================================================
// ROUTE BARU UNTUK PEGA
// ======================================================

app.all(
  '/internal/pega/qc-rfu/:id',
  qcRfuHandler
);


// ======================================================
// EXPORT
// ======================================================

module.exports = app;
