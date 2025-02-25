function useDateAsName() {
  const date = new Date();

  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString();
  const day = date.getDate().toString();

  const result = year + "-" + month + "-" + day;

  return result;
}

module.exports = useDateAsName;
