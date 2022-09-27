const express = require("express");
const fs = require("fs");
const morgan = require("morgan");

const app = express();
app.use(express.json());

app.use(
  morgan(function (tokens, req, res) {
    let morganData = [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens["user-agent"](req, res),
      tokens.status(req, res),
      // tokens.res(req, res, "content-length"),
      // "-",
      // tokens["response-time"](req, res),
      // "ms",
    ].join(" ");
    fs.appendFileSync("./logs.txt", morganData + "\n");
  })
);

app.get("/posts", (req, res) => {
  let data = fs.readFileSync("./posts.json", { encoding: "utf-8" });
  res.send(data);
});

const validator = (req, res, next) => {
  let { id, title, content, author } = req.body;
  if (
    id &&
    typeof id === "number" &&
    title &&
    typeof title === "string" &&
    content &&
    typeof content === "string" &&
    author &&
    typeof author === "string"
  ) {
    next();
  }
  res.send("Validation Failed");
};

const guard = (req, res, next) => {
  let { password } = req.query;
  if (password == 54123) {
    next();
  }
  res.send("Access Denied");
};

app.post("/posts/create", validator, (req, res) => {
  const payload = req.body;
  let data = fs.readFileSync("./posts.json", { encoding: "utf-8" });
  let parseData = JSON.parse(data);
  let updatedData = parseData.todo;
  let freshData = [...updatedData, payload];
  parseData.todo = freshData;
  let newData = JSON.stringify(parseData);
  fs.writeFileSync("./posts.json", newData);
  res.send("post success");
});

app.put("/posts/:postId", guard, (req, res) => {
  let id = req.params.postId;
  const payload = req.body;
  let data = fs.readFileSync("./posts.json", { encoding: "utf-8" });
  let parseData = JSON.parse(data);
  let updatedData = parseData.todo;

  let afterRemove = updatedData.filter((el) => Number(el.id) !== Number(id));
  let newData = [...afterRemove, payload];
  parseData.todo = newData;
  let freshData = JSON.stringify(parseData);
  fs.writeFileSync("./posts.json", freshData);

  res.send("Put Success");
});

app.delete("/posts/:postId", guard, (req, res) => {
  let id = req.params.postId;

  let data = fs.readFileSync("./posts.json", { encoding: "utf-8" });
  let parseData = JSON.parse(data);
  let updatedData = parseData.todo;
  let afterRemove = updatedData.filter((el) => Number(el.id) !== Number(id));
  let newData = [...afterRemove];
  parseData.todo = newData;
  let freshData = JSON.stringify(parseData);
  fs.writeFileSync("./posts.json", freshData);

  res.send("Delete Success");
});

app.listen(8080, () => {
  console.log("Listning on port 8080");
});
