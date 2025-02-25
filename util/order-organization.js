const e = require("express");

function upToDataOrder(contentsList) {
  const contentsMemory = contentsList;
  const organizedContents = [];

  while (contentsMemory.length > 1) {
    let max = contentsMemory[0].startDate.split("-");

    for (let i = 1; i < contentsMemory.length; i++) {
      const memory = contentsMemory[i].startDate.split("-");

      if (max[0] < memory[0]) {
        max = memory;
      } else if (max[0] === memory[0]) {
        if (max[1] < memory[1]) {
          max = memory;
        } else if (max[1] === memory[1]) {
          if (max[2] < memory[2]) {
            max = memory;
          }
        }
      }
    }

    max = max[0] + "-" + max[1] + "-" + max[2];

    for (let i = 0; i < contentsMemory.length; i++) {
      if (max === contentsMemory[i].startDate) {
        organizedContents.push(contentsMemory[i]);
        contentsMemory.splice(i, 1);
      }
    }
  }

  organizedContents.push(contentsMemory[0]);
  
  return organizedContents;
}

module.exports = {
  upToDataOrder: upToDataOrder,
};
