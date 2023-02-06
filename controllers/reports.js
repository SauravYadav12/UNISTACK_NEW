const Unibase = require("../models/unibaseDB");
const User = require("../models/userDB");
const Interview = require("../models/interviewDB");
const Consultant = require("../models/consultant");

function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

// function countPositions(arr) {
//   let chars = {};
//   let newArr = [];
//   let status = {};
//   for (let name of arr) {
//     chars[name.recordOwner] = chars[name.recordOwner] + 1 || 1;
//     status[name.reqStatus] = status[name.reqStatus] + 1 || 1;
//   }

//   console.log("Chars", chars, status);
//   newArr = Object.entries(chars).map((e) => ({
//     name: e[0],
//     positionCount: e[1],
//   }));
//   // console.log(newArr)
//   return newArr;
// }

exports.getSupportDashboard = async (req, res) => {
  const d = new Date();
  const dateToday = formatDate(d);
  const positionSorted = [];

  const positionsToday = await Unibase.find({
    reqEnteredDate: dateToday
  });


  for(let req of positionsToday){
    if(positionSorted.length){
        const i = positionSorted.findIndex(e => e.name === req.recordOwner);
        
        if (i > -1) {
          /* vendors contains the element we're looking for, at index "i" */
          positionSorted[i].totalPositions = positionSorted[i].totalPositions + 1 || 1;
          if(req.reqStatus === "Submitted"){
            positionSorted[i].submitted = positionSorted[i].submitted + 1 || 1;
          } else if(req.reqStatus === "Cancelled"){
            positionSorted[i].cancelled = positionSorted[i].cancelled + 1 || 1;
          } else if(req.reqStatus = "Called But No Response"){
            positionSorted[i].cbnr = positionSorted[i].cbnr + 1 || 1;
          }
        }
         else {
            const info = {}
            info.name = req.recordOwner;
            info.totalPositions = info.totalPositions + 1 || 1;

            if(req.reqStatus === "Submitted"){
                info.submitted = info.submitted + 1 || 1;
            } else if(req.reqStatus === "Cancelled"){
                info.cancelled = info.cancelled + 1 || 1;
            } else if(req.reqStatus = "Called But No Response"){
                info.cbnr = info.cbnr + 1 || 1;
            }
            positionSorted.push(info);
         }

    } else {
        const info = {}
        info.name = req.recordOwner;
        info.totalPositions = info.totalPositions + 1 || 1;
        if(req.reqStatus === "Submitted"){
            info.submitted = info.submitted + 1 || 1;
        } else if(req.reqStatus === "Cancelled"){
            info.cancelled = info.cancelled + 1 || 1;
        } else if(req.reqStatus = "Called But No Response"){
            info.cbnr = info.cbnr + 1 || 1;
        }
        positionSorted.push(info)
    }
  }

  return res.render("reports/support", {
    path: "/reports",
    docTitle: "UniStack || Reports",
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    dateToday,
    positionSorted,
    positionsToday
  });
};

exports.getMarketingDashboard = async (req, res) => {
  const d = new Date();
  const dateToday = formatDate(d);
  const sortedRecords = [];
  let unassigned = [];
  const allPositions = await Unibase.find({ reqEnteredDate: dateToday });

  for (let req of allPositions) {
    if(req.assignedTo === ""){
        unassigned.push(req);
    }

    if (req.assignedTo !== "") {
      if (sortedRecords.length) {           
        const i = sortedRecords.findIndex(e => e.marketingPerson === req.assignedTo);
        
        if (i > -1) {
          /* vendors contains the element we're looking for, at index "i" */
          sortedRecords[i].totalAssigned = sortedRecords[i].totalAssigned + 1 || 1
          if (req.reqStatus === "New Working") {
            sortedRecords[i].newWorking = sortedRecords[i].newWorking + 1 || 1;
          } else if (req.reqStatus === "Submitted") {
            sortedRecords[i].submitted = sortedRecords[i].submitted + 1 || 1 ;
          } else if (req.reqStatus === "Cancelled") {
            sortedRecords[i].cancelled = sortedRecords[i].cancelled + 1 || 1;
          } else if(req.reqStatus = "Called But No Response"){
            sortedRecords[i].cbnr = sortedRecords[i].cbnr + 1 || 1;
          }

        } else {
            const info = {};
            info.marketingPerson = req.assignedTo;
            info.totalAssigned = info.totalAssigned + 1 || 1
            if (req.reqStatus === "New Working") {
              info.newWorking = info.newWorking + 1 || 1;
            } else if (req.reqStatus === "Submitted") {
              info.submitted = info.submitted + 1 || 1;
            } else if (req.reqStatus === "Cancelled") {
              info.cancelled = info.cancelled + 1 || 1;
            } else if(req.reqStatus = "Called But No Response"){
                info.cbnr = info.cbnr + 1 || 1;
            }
            sortedRecords.push(info);
        }         
      }

      if (!sortedRecords.length) {
        const info = {};
        info.marketingPerson = req.assignedTo;
        info.totalAssigned = info.totalAssigned + 1 || 1
        if (req.reqStatus === "New Working") {
          info.newWorking = info.newWorking + 1 || 1;
        } else if (req.reqStatus === "Submitted") {
          info.submitted = info.submitted + 1 || 1;
        } else if (req.reqStatus === "Cancelled") {
          info.cancelled = info.cancelled + 1 || 1;
        } else if(req.reqStatus = "Called But No Response"){
            info.cbnr = info.cbnr + 1 || 1;
        }
        sortedRecords.push(info);
      }
    }
  }


  return res.render("reports/marketing", {
    path: "/reports",
    docTitle: "UniStack || Reports",
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    dateToday,
    unassigned,
    allPositions,
    sortedRecords
  });
};
