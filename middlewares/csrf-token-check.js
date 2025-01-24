function csrfTokenCheck(req, res, next) {
  const csrfInput = {
    secret: req.session.csrfSecret,
    token: req.body._csrf,
  };

  const csrf = global.csrf;

  if (!csrf.verify(csrfInput.secret, csrfInput.token)) {
    throw new Error("invalid token!");
  }

  req.session.csrfSecret = null;

  next();
}

module.exports = csrfTokenCheck;
