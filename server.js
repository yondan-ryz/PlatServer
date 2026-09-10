app.all('/api/qc/rfu/Param.id', async (req, res, next) => {
  try {
    const targetUrl = process.env.QC_RFU_URL;

    if (!targetUrl) {
      return res.status(500).json({
        success: false,
        message: 'QC_RFU_URL is not configured'
      });
    }

    const query = new URLSearchParams(req.query).toString();

    const url = query
      ? targetUrl + '?' + query
      : targetUrl;

    const headers = {};

    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'];
    }

    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    if (req.headers.accept) {
      headers['Accept'] = req.headers.accept;
    }

    let body;

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body !== undefined) {
        body = JSON.stringify(req.body);
      }
    }

    const response = await fetch(url, {
      method: req.method,
      headers: headers,
      body: body
    });

    const responseText = await response.text();

    // Response dibuat escaped
    const escapedResponse = JSON.stringify(responseText);

    res.status(response.status);
    res.setHeader(
      'Content-Type',
      'application/json; charset=utf-8'
    );

    return res.send(escapedResponse);

  } catch (e) {
    return next(e);
  }
});
