exports.getInterviewTeamsDashboard = async (req, res) => {
  res.render("teams/interview-teams", {
    path: "/home",
    docTitle: "UniStack || Home",
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
  });
};
