const Unibase = require("../models/unibaseDB");
const User = require("../models/userDB");
const Interview = require("../models/interviewDB");
const Consultant = require("../models/consultant");

// Helper Functions
function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

const getSupportRecordsByQuery = (query) => {
  return Unibase.aggregate([
    {
      $match: {
        reqEnteredDate: {
          $gte: query.fromDate,
          $lte: query.toDate,
        },
        recordOwner: {
          $eq: query.name,
        },
        reqStatus: {
          $eq: query.type,
        },
      },
    },
  ]);
};

const getMarketingRecordsByQuery = (query) => {
  return Unibase.aggregate([
    {
      $match: {
        reqEnteredDate: {
          $gte: query.fromDate,
          $lte: query.toDate,
        },
        assignedTo: {
          $eq: query.name,
        },
        reqStatus: {
          $eq: query.type,
        },
      },
    },
  ]);
};

const sortSupportRecords = (positions) => {
  let positionSorted = [];
  for (let req of positions) {
    if (positionSorted.length) {
      const i = positionSorted.findIndex((e) => e.name === req.recordOwner);

      if (i > -1) {
        /* vendors contains the element we're looking for, at index "i" */
        positionSorted[i].totalPositions =
          positionSorted[i].totalPositions + 1 || 1;
        if (req.reqStatus === "Submitted") {
          positionSorted[i].submitted = positionSorted[i].submitted + 1 || 1;
        } else if (req.reqStatus === "Cancelled") {
          positionSorted[i].cancelled = positionSorted[i].cancelled + 1 || 1;
        } else if (req.reqStatus === "Call But No Response") {
          positionSorted[i].cbnr = positionSorted[i].cbnr + 1 || 1;
        }
      } else {
        const info = {};
        info.name = req.recordOwner;
        info.totalPositions = info.totalPositions + 1 || 1;

        if (req.reqStatus === "Submitted") {
          info.submitted = info.submitted + 1 || 1;
        } else if (req.reqStatus === "Cancelled") {
          info.cancelled = info.cancelled + 1 || 1;
        } else if (req.reqStatus === "Call But No Response") {
          info.cbnr = info.cbnr + 1 || 1;
        }
        positionSorted.push(info);
      }
    } else {
      const info = {};
      info.name = req.recordOwner;
      info.totalPositions = info.totalPositions + 1 || 1;
      if (req.reqStatus === "Submitted") {
        info.submitted = info.submitted + 1 || 1;
      } else if (req.reqStatus === "Cancelled") {
        info.cancelled = info.cancelled + 1 || 1;
      } else if (req.reqStatus === "Call But No Response") {
        info.cbnr = info.cbnr + 1 || 1;
      }
      positionSorted.push(info);
    }
  }

  return positionSorted;
};

const sortMarketingRecords = (allPositions) => {
  let sortedRecords = [];
  let unassigned = [];

  for (let req of allPositions) {
    if (req.assignedTo === "") {
      unassigned.push(req);
    }

    if (req.assignedTo !== "") {
      if (sortedRecords.length) {
        const i = sortedRecords.findIndex(
          (e) => e.marketingPerson === req.assignedTo
        );

        if (i > -1) {
          /* vendors contains the element we're looking for, at index "i" */
          sortedRecords[i].totalAssigned =
            sortedRecords[i].totalAssigned + 1 || 1;
          if (req.reqStatus === "New Working") {
            sortedRecords[i].newWorking = sortedRecords[i].newWorking + 1 || 1;
          } else if (req.reqStatus === "Submitted") {
            sortedRecords[i].submitted = sortedRecords[i].submitted + 1 || 1;
          } else if (req.reqStatus === "Cancelled") {
            sortedRecords[i].cancelled = sortedRecords[i].cancelled + 1 || 1;
          } else if (req.reqStatus === "Call But No Response") {
            sortedRecords[i].cbnr = sortedRecords[i].cbnr + 1 || 1;
            if (req.mComment.length) {
              sortedRecords[i].cbnrwc = sortedRecords[i].cbnrwc + 1 || 1;
            } else {
              sortedRecords[i].cbnrnc = sortedRecords[i].cbnrnc + 1 || 1;
            }
          }
        } else {
          const info = {};
          info.marketingPerson = req.assignedTo;
          info.totalAssigned = info.totalAssigned + 1 || 1;
          if (req.reqStatus === "New Working") {
            info.newWorking = info.newWorking + 1 || 1;
          } else if (req.reqStatus === "Submitted") {
            info.submitted = info.submitted + 1 || 1;
          } else if (req.reqStatus === "Cancelled") {
            info.cancelled = info.cancelled + 1 || 1;
          } else if (req.reqStatus === "Call But No Response") {
            info.cbnr = info.cbnr + 1 || 1;
            if (req.mComment.length) {
              info.cbnrwc = info.cbnrwc + 1 || 1;
            } else {
              info.cbnrnc = info.cbnrnc + 1 || 1;
            }
          }
          sortedRecords.push(info);
        }
      }

      if (!sortedRecords.length) {
        const info = {};
        info.marketingPerson = req.assignedTo;
        info.totalAssigned = info.totalAssigned + 1 || 1;
        if (req.reqStatus === "New Working") {
          info.newWorking = info.newWorking + 1 || 1;
        } else if (req.reqStatus === "Submitted") {
          info.submitted = info.submitted + 1 || 1;
        } else if (req.reqStatus === "Cancelled") {
          info.cancelled = info.cancelled + 1 || 1;
        } else if (req.reqStatus === "Call But No Response") {
          info.cbnr = info.cbnr + 1 || 1;
          if (req.mComment.length) {
            info.cbnrwc = info.cbnrwc + 1 || 1;
          } else {
            info.cbnrnc = info.cbnrnc + 1 || 1;
          }
        }
        sortedRecords.push(info);
      }
    }
  }

  return [sortedRecords, unassigned];
};

const sortInterviewsRecords = (allInterviews) => {
  let sortedInterviews = [];
  let completedInterviews = 0;
  for (let req of allInterviews) {
    if (sortedInterviews.length) {
      const i = sortedInterviews.findIndex(
        (e) => e.name === req.marketingPerson
      );

      if (i > -1) {
        /* vendors contains the element we're looking for, at index "i" */
        sortedInterviews[i].totalInterviews =
          sortedInterviews[i].totalInterviews + 1 || 1;
        if (req.interviewStatus === "Interview Confirm") {
          sortedInterviews[i].confirm = sortedInterviews[i].confirm + 1 || 1;
        } else if (req.interviewStatus === "Interview Cancelled") {
          sortedInterviews[i].cancelled =
            sortedInterviews[i].cancelled + 1 || 1;
        } else if (req.interviewStatus === "Interview Tentative") {
          sortedInterviews[i].tentative =
            sortedInterviews[i].tentative + 1 || 1;
        } else if (req.interviewStatus === "Interview Completed") {
          sortedInterviews[i].completed =
            sortedInterviews[i].completed + 1 || 1;
          completedInterviews++;
        }
      } else {
        const info = {};
        info.name = req.marketingPerson;
        info.totalInterviews = info.totalInterviews + 1 || 1;
        if (req.interviewStatus === "Interview Confirm") {
          info.confirm = info.confirm + 1 || 1;
        } else if (req.interviewStatus === "Interview Tentative") {
          info.tentative = info.tentative + 1 || 1;
        } else if (req.interviewStatus === "Interview Completed") {
          info.completed = info.completed + 1 || 1;
          completedInterviews++;
        } else if (req.interviewStatus === "Interview Cancelled") {
          info.cancelled = info.cancelled + 1 || 1;
        }
        sortedInterviews.push(info);
      }
    } else {
      const info = {};
      info.name = req.marketingPerson;
      info.totalInterviews = info.totalInterviews + 1 || 1;
      if (req.interviewStatus === "Interview Confirm") {
        info.confirm = info.confirm + 1 || 1;
      } else if (req.interviewStatus === "Interview Tentative") {
        info.tentative = info.tentative + 1 || 1;
      } else if (req.interviewStatus === "Interview Completed") {
        info.completed = info.completed + 1 || 1;
        completedInterviews++;
      } else if (req.interviewStatus === "Interview Cancelled") {
        info.cancelled = info.cancelled + 1 || 1;
      }
      sortedInterviews.push(info);
    }
  }

  return [sortedInterviews, completedInterviews];
};

const getInterviewsByQuery = (query) => {
  return Interview.aggregate([
    {
      $match: {
        interviewDate: {
          $gte: query.fromDate,
          $lte: query.toDate,
        },
        marketingPerson: {
          $eq: query.name,
        },
        interviewStatus: {
          $eq: query.type,
        },
      },
    },
  ]);
};

//Controllers --
exports.getSupportDashboard = async (req, res) => {
  const d = new Date();
  const dateToday = formatDate(d);
  const positions = await Unibase.aggregate([
    {
      $match: {
        reqEnteredDate: {
          $gte: dateToday,
          $lte: dateToday,
        },
        isDuplicate: {
          $eq: "false",
        },
      },
    },
  ]);

  const positionSorted = sortSupportRecords(positions);

  return res.render("reports/support", {
    path: "/reports",
    docTitle: "UniStack || Reports",
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    dateFrom: dateToday,
    dateTo: dateToday,
    dateToday,
    positionSorted,
    totalPositions: positions.length,
  });
};

exports.getMarketingDashboard = async (req, res) => {
  const d = new Date();
  const dateToday = formatDate(d);

  const allPositions = await Unibase.aggregate([
    {
      $match: {
        reqEnteredDate: {
          $gte: dateToday,
          $lte: dateToday,
        },
      },
    },
  ]);

  const newRecords = sortMarketingRecords(allPositions);
  const sortedRecords = newRecords[0];
  const unassigned = newRecords[1];

  return res.render("reports/marketing", {
    path: "/reports",
    docTitle: "UniStack || Reports",
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    dateToday,
    unassigned: unassigned.length,
    allPositions: allPositions.length,
    sortedRecords: sortedRecords,
    totalPositions: allPositions.length,
    dateFrom: dateToday,
    dateTo: dateToday,
  });
};

exports.getInterviewStatus = async (req, res) => {
  const d = new Date();
  const dateToday = formatDate(d);

  const allInterviews = await Interview.aggregate([
    {
      $match: {
        interviewDate: {
          $gte: dateToday,
          $lte: dateToday,
        },
      },
    },
  ]);

  const [sortedInterviews, completedInterviews] =
    sortInterviewsRecords(allInterviews);

  return res.render("reports/interview-report", {
    path: "/reports/interview-report",
    docTitle: "UniStack || Reports",
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    dateFrom: dateToday,
    dateTo: dateToday,
    dateToday,
    sortedInterviews,
    totalInterviews: allInterviews.length,
    completedInterviews,
  });
};

// Historic data by Date
exports.getSupportHistoricalReports = async (req, res) => {
  const d = new Date();
  const dateToday = formatDate(d);

  const positions = await Unibase.aggregate([
    {
      $match: {
        reqEnteredDate: {
          $gte: req.body.fromDate,
          $lte: req.body.toDate,
        },
      },
    },
  ]);

  const positionSorted = sortSupportRecords(positions);
  return res.render("reports/support", {
    path: "/reports",
    docTitle: "UniStack || Reports",
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    dateFrom: req.body.fromDate,
    dateTo: req.body.toDate,
    dateToday,
    positionSorted,
    totalPositions: positions.length,
    success_msg: "Report Generated Successfully",
  });
};

exports.getMarketingHistoricalReport = async (req, res) => {
  const d = new Date();
  const dateToday = formatDate(d);
  const allPositions = await Unibase.aggregate([
    {
      $match: {
        reqEnteredDate: {
          $gte: req.body.fromDate,
          $lte: req.body.toDate,
        },
      },
    },
  ]);

  const newRecords = sortMarketingRecords(allPositions);
  const sortedRecords = newRecords[0];
  const unassigned = newRecords[1];

  return res.render("reports/marketing", {
    path: "/reports",
    docTitle: "UniStack || Reports",
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    dateFrom: req.body.fromDate,
    dateTo: req.body.toDate,
    dateToday,
    unassigned: unassigned.length,
    totalPositions: allPositions.length,
    sortedRecords,
  });
};

exports.getInterviewHistoricReport = async (req, res) => {
  const d = new Date();
  const dateToday = formatDate(d);

  const allInterviews = await Interview.aggregate([
    {
      $match: {
        interviewDate: {
          $gte: req.body.fromDate,
          $lte: req.body.toDate,
        },
      },
    },
  ]);

  const [sortedInterviews, completedInterviews] =
    sortInterviewsRecords(allInterviews);

  return res.render("reports/interview-report", {
    path: "/reports/interview-report",
    docTitle: "UniStack || Reports",
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    dateFrom: req.body.fromDate,
    dateTo: req.body.toDate,
    dateToday,
    sortedInterviews,
    totalInterviews: allInterviews.length,
    completedInterviews,
  });
};

//Details By query
exports.getSupportDetailsByQuery = async (req, res) => {
  const d = new Date();
  const dateToday = formatDate(d);
  let reportFor = "";
  let records;

  if (req.query.type === "totalPositions") {
    reportFor = "support";
    records = await Unibase.aggregate([
      {
        $match: {
          reqEnteredDate: {
            $gte: req.query.fromDate,
            $lte: req.query.toDate,
          },
          recordOwner: {
            $eq: req.query.name,
          },
        },
      },
    ]);
  }
  if (req.query.type === "Submitted") {
    reportFor = "support";
    records = await getSupportRecordsByQuery(req.query);
  }
  if (req.query.type === "Cancelled") {
    reportFor = "support";
    records = await getSupportRecordsByQuery(req.query);
  }
  if (req.query.type === "Call But No Response") {
    reportFor = "support";
    records = await getSupportRecordsByQuery(req.query);
  }

  return res.render("reports/report-list", {
    path: "/reports/report-list",
    docTitle: "UniStack || Reports",
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    name: req.query.name,
    type: req.query.type,
    dateToday,
    dateFrom: req.query.fromDate,
    dateTo: req.query.toDate,
    totalRecords: records.length,
    records,
    reportFor,
  });
};

exports.getMarketingDetailsByQuery = async (req, res) => {
  const d = new Date();
  const dateToday = formatDate(d);
  let reportFor = "";
  let records = [];

  if (req.query.type === "totalAssigned") {
    reportFor = "marketing";
    records = await Unibase.aggregate([
      {
        $match: {
          reqEnteredDate: {
            $gte: req.query.fromDate,
            $lte: req.query.toDate,
          },
          assignedTo: {
            $eq: req.query.name,
          },
        },
      },
    ]);
  }

  if (req.query.type === "unassigned") {
    reportFor = "marketing";
    records = await Unibase.aggregate([
      {
        $match: {
          reqEnteredDate: {
            $gte: req.query.fromDate,
            $lte: req.query.toDate,
          },
          assignedTo: {
            $eq: req.query.name,
          },
        },
      },
    ]);
  }

  if (req.query.type === "New Working") {
    reportFor = "marketing";
    records = await getMarketingRecordsByQuery(req.query);
  }

  if (req.query.type === "Submitted") {
    reportFor = "marketing";
    records = await getMarketingRecordsByQuery(req.query);
  }

  if (req.query.type === "Cancelled") {
    reportFor = "marketing";
    records = await getMarketingRecordsByQuery(req.query);
  }
  if (req.query.type === "Call But No Response") {
    reportFor = "marketing";
    records = await getMarketingRecordsByQuery(req.query);
  }

  if (req.query.type === "cbnrwc") {
    reportFor = "marketing";
    records = await Unibase.aggregate([
      {
        $match: {
          reqEnteredDate: {
            $gte: req.query.fromDate,
            $lte: req.query.toDate,
          },
          assignedTo: {
            $eq: req.query.name,
          },
          reqStatus: {
            $eq: "Call But No Response",
          },
          "mComment.0": { $exists: true },
        },
      },
    ]);
  }

  if (req.query.type === "cbnrnc") {
    reportFor = "marketing";
    records = await Unibase.aggregate([
      {
        $match: {
          reqEnteredDate: {
            $gte: req.query.fromDate,
            $lte: req.query.toDate,
          },
          assignedTo: {
            $eq: req.query.name,
          },
          reqStatus: {
            $eq: "Call But No Response",
          },
          "mComment.0": { $exists: false },
        },
      },
    ]);
  }
  return res.render("reports/report-list", {
    path: "/reports/report-list",
    docTitle: "UniStack || Reports",
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    name: req.query.name,
    type: req.query.type,
    dateToday,
    dateFrom: req.query.fromDate,
    dateTo: req.query.toDate,
    totalRecords: records.length,
    records,
    reportFor,
  });
};

exports.getInterviewDetailsByQuery = async (req, res) => {
  const d = new Date();
  const dateToday = formatDate(d);
  let reportFor = "";
  let records = [];

  if (req.query.type === "totalInterviews") {
    reportFor = "interview-report";
    records = await Interview.aggregate([
      {
        $match: {
          interviewDate: {
            $gte: req.query.fromDate,
            $lte: req.query.toDate,
          },
          marketingPerson: {
            $eq: req.query.name,
          },
        },
      },
    ]);
  }

  if (req.query.type === "Interview Confirm") {
    reportFor = "interview-report";
    records = await getInterviewsByQuery(req.query);
  }

  if (req.query.type === "Interview Completed") {
    reportFor = "interview-report";
    records = await getInterviewsByQuery(req.query);
  }

  if (req.query.type === "Interview Cancelled") {
    reportFor = "interview-report";
    records = await getInterviewsByQuery(req.query);
  }

  if (req.query.type === "Interview Tentative") {
    reportFor = "interview-report";
    records = await getInterviewsByQuery(req.query);
  }

  return res.render("reports/report-list", {
    path: "/reports/report-list",
    docTitle: "UniStack || Reports",
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    name: req.query.name,
    type: req.query.type,
    dateToday,
    dateFrom: req.query.fromDate,
    dateTo: req.query.toDate,
    totalRecords: records.length,
    records,
    reportFor,
  });
};

exports.getDashboardDetailsByQuery = async (req, res) => {
  const reportFor = "marketing";
  const records = await Unibase.aggregate([
    {
      $match: {
        reqEnteredDate: {
          $eq: req.query.date,
        },
        reqStatus: {
          $eq: req.query.type,
        },
      },
    },
  ]);

  return res.render("reports/report-list", {
    path: "/reports/report-list",
    docTitle: "UniStack || Reports",
    username: req.user.username,
    email: req.user.email,
    name: "",
    role: req.user.role,
    type: req.query.type,
    dateFrom: req.query.date,
    dateTo: req.query.date,
    totalRecords: records.length,
    records,
    reportFor,
  });
};

exports.getDashboardPositionsByQuery = async (req, res) => {
  const reportFor = "marketing";
  const records = await Unibase.aggregate([
    {
      $match: {
        reqEnteredDate: {
          $eq: req.query.date,
        },
      },
    },
  ]);

  return res.render("reports/report-list", {
    path: "/reports/report-list",
    docTitle: "UniStack || Reports",
    username: req.user.username,
    email: req.user.email,
    name: "",
    role: req.user.role,
    type: req.query.type,
    dateFrom: req.query.date,
    dateTo: req.query.date,
    totalRecords: records.length,
    records,
    reportFor,
  });
};

exports.getProjectDetailsByQuery = async (req, res) => {
  const d = new Date();
  const dateToday = formatDate(d);
  let records, reportFor;
  if (req.query.type === "Offer") {
    reportFor = "interview-report";
    records = await Interview.find({ result: req.query.type }).sort({
      _id: -1,
    });
  }
  if (req.query.type === "Project Active") {
    reportFor = "marketing";
    records = await Unibase.find({ reqStatus: req.query.type }).sort({
      _id: -1,
    });
  }
  if (req.query.type === "Project Inactive") {
    reportFor = "marketing";
    records = await Unibase.find({ reqStatus: req.query.type }).sort({
      _id: -1,
    });
  }

  return res.render("reports/report-list", {
    path: "/reports/report-list",
    docTitle: "UniStack || Reports",
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    name: req.query.name,
    type: req.query.type,
    dateToday,
    dateFrom: dateToday,
    dateTo: dateToday,
    totalRecords: records.length,
    records,
    reportFor,
  });
};
