const handleRevise = (req, res, db) => {
  let { id, revisedInfo } = req.body;
  // user info checking
  if (!id) {
    return res
      .status(400)
      .json("Activity : reviseTaskInfos, blank signin info");
  }
  if (id !== "zoran") {
    res.status(400).json("Activity : reviseTaskInfos, wrong login Info");
  }
  console.log("revisedInfo", revisedInfo);

  // according to requestedType, getting task info
  switch (revisedInfo.requestType) {
    case "taskTypes":
      //update tasktypes
      db("tasktypes")
        .where({
          tasktype: revisedInfo.taskType,
        })
        .then((data) => {
          // avoid duplicate tasktype in tasktypes
          if (
            data.length === 0 //no such tasktype in tasktypes
          ) {
            //update the tasktypes to name, sop, detail including the revised tasktype
            db("tasktypes")
              .where({
                id: revisedInfo.id,
              })
              .returning("*")
              .then((data) => {
                //update the tasktypes of tasksops which tasktype is revised
                db("tasknames")
                  .where({
                    // get tasknames which tasktype is revised
                    tasktype: data[0].tasktype,
                  })
                  .update({
                    // update tasknames with new tasktype
                    tasktype: JSON.stringify(revisedInfo.taskType),
                  })
                  .catch((err) => {
                    if (err.code === "23505") {
                      return;
                    }
                    console.log(err);
                  });

                //update the tasktypes of tasksops which tasktype is revised
                db("tasksops")
                  .where({
                    // get tasksops which tasktype is revised
                    tasktype: data[0].tasktype,
                  })
                  .update({
                    // update tasksops with new tasktype
                    tasktype: JSON.stringify(revisedInfo.taskType),
                  })
                  .catch((err) => {
                    if (err.code === "23505") {
                      return;
                    }
                    console.log(err);
                  });

                // update the tasktypes of taskdetails which tasktype is revised
                db("taskdetails")
                  .where({
                    // get taskdetails which tasktype is revised
                    tasktype: data[0].tasktype,
                  })
                  .update({
                    // update taskdetails with new tasktype
                    tasktype: JSON.stringify(revisedInfo.taskType),
                  })
                  .catch((err) => {
                    if (err.code === "23505") {
                      return;
                    }
                    console.log(err);
                  });
              });

            //update the tasktypes
            db("tasktypes")
              .where({
                id: revisedInfo.id,
              })
              .update({
                tasktype: JSON.stringify(revisedInfo.taskType),
              })
              .returning("*")
              .then((data) => {
                //get tasktypes
                res.json(data);
              })
              .catch((err) => {
                if (err.code === "23505") {
                  return;
                }
                console.log(err);
                res
                  .status(400)
                  .json("Activity : reviseTaskInfos, system error");
              });
          } else {
            //duplicate tasktype in tasktypes
            res.status(400).json("Duplicate tasktype");
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json("Activity : reviseTaskInfos, system error");
        });
      break;
    case "taskNames":
      //update tasknames
      db("tasknames")
        .where({
          tasktype: revisedInfo.taskType,
          taskname: revisedInfo.taskName,
        })
        .then((data) => {
          // avoid duplicate taskname in tasktypes
          if (
            data.length === 0 //no such taskname in tasktypes
          ) {
            db("tasknames")
              .where({
                id: revisedInfo.id,
              })
              .returning("*")
              .then((data) => {
                //update the tasknames to sop, detail including the revised taskname
                db("tasksops")
                  .where({
                    // get the taskname of tasksops which taskname is revised
                    taskname: data[0].taskname,
                  })
                  .update({
                    // update the taskname of tasksops with new taskname
                    taskname: JSON.stringify(revisedInfo.taskName),
                  })
                  .catch((err) => {
                    if (err.code === "23505") {
                      return;
                    }
                    console.log(err);
                  });
                //update the tasknames of taskdetails which taskname is revised
                db("taskdetails")
                  .where({
                    // get the taskname of tasksops which taskname is revised
                    taskname: data[0].taskname,
                  })
                  .update({
                    // update the taskname of tasksops with new taskname
                    taskname: JSON.stringify(revisedInfo.taskName),
                  })
                  .catch((err) => {
                    if (err.code === "23505") {
                      return;
                    }
                    console.log(err);
                  });
              });

            //update the tasknames
            db("tasknames")
              .where({
                id: revisedInfo.id,
              })
              .update({
                taskname: JSON.stringify(revisedInfo.taskName),
              })
              .returning("*")
              .then((data) => {
                //get tasknames by tasktype
                console.log("taskNames", "data", data);
                res.json(data);
              })
              .catch((err) => {
                if (err.code === "23505") {
                  return;
                }
                console.log(err);
                res
                  .status(400)
                  .json("Activity : reviseTaskInfos, system error");
              });
          } else {
            res.status(400).json("Duplicate taskname in tasktypes");
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json("Activity : reviseTaskInfos, system error");
        });

      break;
    case "taskTags":
      //update tasktags
      db("tasktags")
        .where({
          tasktag: revisedInfo.taskTag,
        })
        .then((data) => {
          // avoid duplicate tasktag in tasktags
          if (data.length === 0) {
            //no such tasktag in tasktags
            //update the tasktags to sop, detail including the revised tasktag
            db("tasktags")
              .where({
                id: revisedInfo.id,
              })
              .returning("*")
              .then((data) => {
                //update the tasktags of tasksops which tasktype is revised
                const originalDataJsonb = JSON.stringify([
                  JSON.parse(data[0].tasktag),
                ]);
                const originalTitle = JSON.parse(data[0].tasktag).title;
                const revisedDataJsonb = revisedInfo.taskTag; //
                db("tasksops")
                  .whereRaw(
                    //check if the tasktags already exist
                    "tasktag::jsonb @> ?::jsonb",
                    [originalDataJsonb]
                  )
                  .update({
                    tasktag: db.raw(
                      "jsonb_set(tasktag::jsonb, CONCAT('{', (SELECT idx FROM jsonb_array_elements(tasktag::jsonb) WITH ORDINALITY AS elem(obj, idx) WHERE obj->>'title' = ? )-1, '}')::text[], ?::jsonb)",
                      [originalTitle, revisedDataJsonb]
                    ),
                  })
                  .catch((err) => {
                    if (err.code === "23505") {
                      return;
                    }
                    console.log(err);
                  });
                db("taskdetails")
                  .where({
                    //check if the tasktags already exist
                    tasktag: data[0].tasktag,
                    // Because the format of tasktag column in taskdetails
                    //is {title: "xxx"} not [{title: "xxx"}] for only one tasktag in it
                  })
                  .update({
                    tasktag: JSON.stringify(revisedInfo.taskTag),
                  })
                  // .returning("*")
                  .then((data) => {
                    console.log("taskdetails", "data", data);
                  })
                  .catch((err) => {
                    if (err.code === "23505") {
                      return;
                    }
                    console.log(err);
                  });
              });
            // update the tasktags
            db("tasktags")
              .where({
                id: revisedInfo.id,
              })
              .update({
                tasktag: JSON.stringify(revisedInfo.taskTag),
              })
              .returning("*")
              .then((data) => {
                //get tasktypes
                res.json(data);
              })
              .catch((err) => {
                if (err.code === "23505") {
                  return;
                }
                console.log(err);
                res
                  .status(400)
                  .json("Activity : reviseTaskInfos, system error");
              });
          } else {
            //duplicate tasktype in tasktypes
            res.status(400).json("Duplicate task tag");
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json("Activity : reviseTaskInfos, system error");
        });
      break;
    case "TaskSOP":
      const originalDataJsonb = JSON.stringify(revisedInfo.taskTag);
      db("tasksops")
        .whereRaw(
          //check if the tasktags already exist
          "tasktag::jsonb @> ?::jsonb AND jsonb_array_length(tasktag::jsonb) = jsonb_array_length(?::jsonb)",
          [originalDataJsonb, originalDataJsonb]
        )
        .andWhere({
          // and check if the task is the same as the original one
          tasktype: revisedInfo.taskType,
          taskname: revisedInfo.taskName,
        })
        .then((data) => {
          // avoid duplicate task SOP with the same tasktag, tasktype and taskname
          if (
            //no such task
            data.length === 0 ||
            //the task is the original one, only task SOP is revised
            (data.length && data[0].sopid === revisedInfo.sopId)
          ) {
            //no such task or the task is the same as the original one
            //The reason why I don't use constraint in database is that tasktag is a array,
            //db can't tell the difference, so unique constraint will not work.
            db("tasksops")
              .where({ sopid: revisedInfo.sopId })
              .update({
                sop: JSON.stringify(revisedInfo.sop),
                tasktype: JSON.stringify(revisedInfo.taskType),
                taskname: JSON.stringify(revisedInfo.taskName),
                tasktag: JSON.stringify(revisedInfo.taskTag),
              })
              .returning("*")
              .then((data) => {
                res.json(data);
              })
              .catch((err) => {
                console.log(err);
                res
                  .status(400)
                  .json("Activity : reviseTaskInfos, system error");
              });
          } else {
            //task already exist
            res
              .status(400)
              .json("This SOP already exist, please revise SOP informaton");
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json("Activity : reviseTaskInfos, system error");
        });
      break;
  }
};

module.exports = { handleRevise: handleRevise };
