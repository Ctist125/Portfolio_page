function logCollectCheck(req, res, next) {
  if (!req.session.logCollect) {
    return res.redirect("/log");
  }

  next();
}

module.exports = logCollectCheck;
