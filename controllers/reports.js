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

const getSupportRecordsByQuery =  (query)=>{
    return  Unibase.aggregate([
        {
            $match:{
                reqEnteredDate:{
                    $gte:query.fromDate,
                    $lte:query.toDate
                },
                recordOwner: {
                    $eq:query.name
                },
                reqStatus:{
                    $eq: query.type
                }
            }
        }
    ]);

}

const getMarketingRecordsByQuery = (query)=>{
    return  Unibase.aggregate([
        {
            $match:{
                reqEnteredDate:{
                    $gte:query.fromDate,
                    $lte:query.toDate
                },
                assignedTo: {
                    $eq:query.name
                },
                reqStatus:{
                    $eq: query.type
                }
            }
        }
    ]);
}

exports.getSupportDashboard = async (req, res) => {
    const d = new Date();
    const dateToday = formatDate(d);

  return res.render("reports/support", {
    path: "/reports",
    docTitle: "UniStack || Reports",
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    dateFrom:"",
    dateTo:"",
    dateToday,
    positionSorted:[],
    totalPositions: 0
  });
};

exports.getMarketingDashboard = async (req, res) => {
  const d = new Date();
  const dateToday = formatDate(d);

  return res.render("reports/marketing", {
    path: "/reports",
    docTitle: "UniStack || Reports",
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    dateToday,
    unassigned:[],
    allPositions:[],
    sortedRecords:[],
    totalPositions:0,
    dateFrom:'',
    dateTo:""
  });
};

exports.getSupportHistoricalReports = async(req,res)=>{
    const positionSorted = [];
    const d = new Date();
    const dateToday = formatDate(d);

    const positions = await Unibase.aggregate([
        {
            $match:{
                reqEnteredDate:{
                    $gte:req.body.fromDate,
                    $lte:req.body.toDate
                }
            }
        }
    ]);


  for(let req of positions){
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
    dateFrom:req.body.fromDate,
    dateTo:req.body.toDate,
    dateToday,
    positionSorted,
    totalPositions: positions.length
  });
}

exports.getMarketingHistoricalReport = async(req,res)=>{
    const d = new Date();
    const dateToday = formatDate(d);
    const sortedRecords = [];
    let unassigned = [];
    const allPositions = await Unibase.aggregate([
        {
            $match:{
                reqEnteredDate:{
                    $gte:req.body.fromDate,
                    $lte:req.body.toDate
                }
            }
        }
    ]);
  
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
        dateFrom: req.body.fromDate,
        dateTo: req.body.toDate,
        dateToday,
        unassigned:unassigned.length,
        totalPositions:allPositions.length,
        sortedRecords
      });
}

exports.getSupportDetailsByQuery = async (req,res) =>{
    console.log(req.query);
    const d = new Date();
    const dateToday = formatDate(d);
    let reportFor = '';
    let records;

    if(req.query.type === 'totalPositions'){
        reportFor = "support";
         records = await Unibase.aggregate([
            {
                $match:{
                    reqEnteredDate:{
                        $gte:req.query.fromDate,
                        $lte:req.query.toDate
                    },
                    recordOwner: {
                        $eq:req.query.name
                    },
                }
            }
        ]);
    }
    if(req.query.type === "Submitted"){
        reportFor = "support";
        records = await getSupportRecordsByQuery(req.query);

    }
    if(req.query.type === "Cancelled"){
        reportFor = "support";
        records = await getSupportRecordsByQuery(req.query);
    }
    if(req.query.type === "Call But No Response" ){
        reportFor = "support";
        records = await getSupportRecordsByQuery(req.query);
    }

    return res.render('reports/report-list', {
        path: "/reports/report-list",
        docTitle: "UniStack || Reports",
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        name: req.query.name,
        type:req.query.type,
        dateToday,
        dateFrom: req.query.fromDate,
        dateTo: req.query.toDate,
        totalRecords:records.length,
        records,
        reportFor
    })

}

exports.getMarketingDetailsByQuery = async(req,res) => {
    const d = new Date();
    const dateToday = formatDate(d);
    let reportFor = '';
    let records;

    if(req.query.type === "totalAssigned"){
        reportFor = "marketing";
        records = await Unibase.aggregate([
            {
                $match:{
                    reqEnteredDate:{
                        $gte:req.query.fromDate,
                        $lte:req.query.toDate
                    },
                    assignedTo: {
                        $eq:req.query.name
                    },
                }
            }
        ]);
    }

    if(req.query.type === "unassigned"){
        reportFor = "marketing";
        records = await Unibase.aggregate([
            {
                $match:{
                    reqEnteredDate:{
                        $gte:req.query.fromDate,
                        $lte:req.query.toDate
                    },
                    assignedTo: {
                        $eq:req.query.name
                    },
                }
            }
        ]);
    }

    if(req.query.type === "New Working"){
        reportFor = "marketing";
        records = await getMarketingRecordsByQuery(req.query);
    }

    if(req.query.type === "Submitted"){
        reportFor = "marketing";
        records = await getMarketingRecordsByQuery(req.query);
    }

    if(req.query.type === "Cancelled"){
        reportFor = "marketing";
        records = await getMarketingRecordsByQuery(req.query);
    }
    if(req.query.type === "Call But No Response" ){
        reportFor = "marketing";
        records = await getMarketingRecordsByQuery(req.query);
    }

    return res.render('reports/report-list', {
        path: "/reports/report-list",
        docTitle: "UniStack || Reports",
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        name: req.query.name,
        type:req.query.type,
        dateToday,
        dateFrom: req.query.fromDate,
        dateTo: req.query.toDate,
        totalRecords:records.length,
        records,
        reportFor
    })
}
