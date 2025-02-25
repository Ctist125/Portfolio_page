function logForm(mainAgent, text) {
  const date = new Date();
  const logDate = "[" + date.toISOString() + "]";

  const logMainAgent = "[" + mainAgent + "]";

  const log = logDate + " " + logMainAgent + " " + text;

  return log;
}

module.exports = logForm;
