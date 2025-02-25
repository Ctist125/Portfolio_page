function addCsrfToken(req, res, next) {
  const csrf = global.csrf;

  const secret = csrf.secretSync();
  const token = csrf.create(secret);

  req.session.csrfSecret = secret;
  res.locals.csrfToken = token;
  next();
}

module.exports = addCsrfToken;
