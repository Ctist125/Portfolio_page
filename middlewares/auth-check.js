function authCheck(req, res, next) {
  let authData;

  if (req.session.login) {
    authData = req.session.login;
  } else {
    return next();
  }

  if (authData.auth) {
    res.locals.auth = true;
    res.locals.userName = authData.userName;
  }

  if (authData.class == "admin") {
    res.locals.admin = true;
  } else if (authData.class == "manager") {
    res.locals.manager = true;
  }

  next();
}

module.exports = authCheck;
