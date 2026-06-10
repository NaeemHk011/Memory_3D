import { createServer } from "http";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const submitHandler = require("./api/submit.js");

function wrapRes(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  };
  return res;
}

const server = createServer(async (req, res) => {
  wrapRes(res);
  if (req.url === "/api/submit") {
    return submitHandler(req, res);
  }
  res.statusCode = 404;
  res.end("Not found");
});

server.listen(3001, () => {
  console.log("API dev server running at http://localhost:3001");
});
