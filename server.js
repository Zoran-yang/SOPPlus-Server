const express = require('express');
const cors = require('cors');
const knex = require('knex')
const path = require('path');

const app = express();

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : '',
    database : 'sopplus'
  }
});

//監聽使用者需求
let PORT = process.env.PORT;
if (PORT == null || PORT === "") {
  PORT = 3000;
}


app.listen(PORT, () => {
  console.log(`Server is working!!!!!!!!!`)
})

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'build')));

//解析使用者需求
app.use(express.json());
// 跨網域需求(讓撰寫者可以在瀏覽器上測試全端專案)
app.use(cors());

app.get('/ping', function (req, res) {
  return res.send('pong');
});

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

//使用者行為 : get users's data || 對應網路行為 : post || 結果 : 返回user資料
app.post("/getTaskInfos", (req, res) => {
  const {id, requestInfo} = req.body
  // user info checking
  if (!id) {return res.status(400).json("blank signin info")}
  if (id !== "zoran"){res.status(400).json("wrong login Info")}

  // according to requestedType, getting task info
  switch (requestInfo.requestType) {
    case "taskTypes":
      db("tasktypes").select("tasktype").then((data) => { //get all tasktypes
        res.json(data);
      }).catch((err)=>{
        console.log(err)
        res.status(400).json("system error")
      })
      break;
    case "taskNames":
      db("tasknames").select("taskname").where({tasktype:requestInfo.taskType}).then((data) => { //get tasknames by tasktype
        res.json(data);
      })
      .catch((err)=>{
        console.log(err)
        res.status(400).json("system error")
      })
      break;
    case "taskTags":
      db("tasktags").select("tasktag").then((data) => { //get all tasktags
        res.json(data);
      })
      .catch((err)=>{
        console.log(err)
        res.status(400).json("system error")
      })
      break;
    case "taskSOP":
      db("tasksops")
      .whereRaw("tasktag::jsonb @> ?", [JSON.stringify(requestInfo.taskTags)])
      .andWhere({
        tasktype:requestInfo.taskType, 
        taskname:requestInfo.taskName
      }).then((data) => { //get tasknames by tasktype
        res.json(data);
      })
      .catch((err)=>{
        console.log(err)
        res.status(400).json("system error")
      })
      break;
  }
});


// //使用者行為 : update Task Information || 對應網路行為 : patch || 結果 : transfer user Information
app.patch("/updateTaskInfos", (req, res) => {
  let {id, updatedInfo} = req.body
  // user info checking
  if (!id) {return res.status(400).json("blank signin info")}
  if (id !== "zoran"){res.status(400).json("wrong login Info")}
  console.log("updatedInfo",updatedInfo)
  updatedInfo = JSON.stringify(updatedInfo)

  // according to requestedType, getting task info
  switch (updatedInfo.requestType) {
    case "taskTypes":
      db("tasktypes").insert({tasktype : updatedInfo.taskType})
      .returning("*")
      .then((data) => { //get all tasktypes
        res.json(data);
      }).catch((err)=>{
        if (err.code === "23505") {
          return
        }
        res.status(400).json("system error")
      })
      break;
    case "taskNames":
      db("tasknames").insert({
        tasktype : updatedInfo.taskType,
        taskname : updatedInfo.taskName
      }).returning("*").then((data) => { //get tasknames by tasktype
        res.json(data);
      })
      .catch((err)=>{
        if (err.code === "23505") {
          return
        }
        console.log(err)
        res.status(400).json("system error")
      })
      break;
    case "taskTags":
      db("tasktags").insert({
        tasktag : updatedInfo.TaskTag
      }).returning("*").then((data) => { //get all tasktags
        res.json(data);
      })
      .catch((err)=>{
        if (err.code === "23505") {
          return
        }
        console.log(err)
        res.status(400).json("system error")
      })
      break;
    case "taskContent":
      db("taskdetails").insert({
          tasktype : updatedInfo.taskType,
          taskname : updatedInfo.taskName,
          tasktag : updatedInfo.taskTag,
          taskdetail : updatedInfo.taskContent,
          detailid : updatedInfo.detailId
        }).returning("*").then((data) => { //get all tasktags
        res.json(data);
      })
      .catch((err)=>{
        if (err.code === "23505") {
          return
        }
        console.log(err)
        res.status(400).json("system error")
      })
      break;
    case "TaskSOP":
      db("tasksops").insert({
        tasktype : updatedInfo.taskType, 
        taskname : updatedInfo.taskName, 
        tasktag : updatedInfo.taskTag, 
        sop : updatedInfo.sop,
        sopid : updatedInfo.sopId
      }).returning("*").then((data) => { //get all tasktags
        res.json(data);
      })
      .catch((err)=>{
        if (err.code === "23505") {
          return
        }
        console.log(err)
        res.status(400).json("system error")
      })
      break;
  }
});






