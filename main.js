export default function handler(req, res) {
  const redirects = {
    "Url1": "https://google.com",
    "Url2": "https://youtube.com",
  };

  // ambil path dari URL, misalnya /Url1
  const id = req.url.replace("/", "");

  if (id && redirects[id]) {
    res.writeHead(302, { Location: redirects[id] });
    res.end();
  } else {
    res.statusCode = 404;
    res.end("Not found");
  }
}