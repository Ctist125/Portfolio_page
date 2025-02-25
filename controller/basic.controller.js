// 프로젝트 내 파일
const History = require("../models/history.model");
const Skills = require("../models/skills.model");
const Contents = require("../models/portfolio-contents.model");
const orderOrganization = require("../util/order-organization");

async function getIndex(req, res) {
  // model 불러오기
  const history = new History();
  const skills = new Skills("");
  const contents = new Contents("");

  const languageList = {
    frontEnd: await skills.findByGroup("frontEnd"),
    backEnd: await skills.findByGroup("backEnd"),
    database: await skills.findByGroup("database"),
    versionControl: await skills.findByGroup("versionControl"),
    tools: await skills.findByGroup("tools"),
    studying: await skills.findByGroup("studying"),
  };
  let contentsList = await contents.allList();
  let historyList = await history.allList();

  // 변수 선언
  const viewContents = [];
  const viewHistory = [];

  if (contentsList[0]) {
    // 날짜별 최신순
    contentsList = orderOrganization.upToDataOrder(contentsList);

    // description 부분 요약
    for (let num in contentsList) {
      if (contentsList[num].description.length > 100) {
        let memory = "";

        for (let cnt = 0; cnt <= 100; cnt++)
          memory += contentsList[num].description[cnt];

        contentsList[num].description = memory + "...";
      }
    }

    // 숨김 컨텐츠 제거
    for (let content of contentsList) {
      if (content.status !== "hidden") {
        viewContents.push(content);
      }
    }
  }

  if (historyList[0]) {
    // 날짜별 최신순 정리
    historyList = orderOrganization.upToDataOrder(historyList);
  }

  // 숨김 컨텐츠 제거
  for (let history of historyList) {
    if (history.status !== "hidden") {
      viewHistory.push(history);
    }
  }

  res.render("basic/index", {
    languageList: languageList,
    viewContents: viewContents,
    viewHistory: viewHistory,
  });
}

function getBlogList(req, res) {
  res.render("basic/blog-list");
}

function getImageLicense(req, res) {
  res.render("basic/image-license");
}

function getFontLicense(req, res) {
  res.render("basic/font-license");
}

function getEmail(req, res) {
  res.render("basic/email");
}

module.exports = {
  getIndex: getIndex,
  getBlogList: getBlogList,
  getImageLicense: getImageLicense,
  getFontLicense: getFontLicense,
  getEmail: getEmail,
};
