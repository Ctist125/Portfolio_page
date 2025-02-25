// 프로젝트 내 파일
const Contents = require("../models/portfolio-contents.model");
const Comments = require("../models/portfolio-comments.model");
const validation = require("../util/validation");
const contentsSplitUtil = require("../util/contents-split");
const orderOrganization = require("../util/order-organization");
const logForm = require("../util/log-form");

async function getMain(req, res) {
  // query 값 불러오기
  let contentsPage = req.query.contentsPage;
  const codingLanguage = req.query.codingLanguage;

  // 변수 선언
  const viewContents = [];
  let contentsBundle = [];
  let contentsList;

  // model
  const contents = new Contents("");

  // 검색 관련 기능 구현
  if (codingLanguage) {
    contentsList = await contents.findByLanguage(codingLanguage.toLowerCase());
  } else {
    contentsList = await contents.allList();
  }

  // 최신순으로 정렬
  contentsList = orderOrganization.upToDataOrder(contentsList);

  if (contentsList[0]) {
    // 숨겨진 컨텐츠 목록에서 제거
    for (let content of contentsList) {
      if (content.status !== "hidden") {
        viewContents.push(content);
      }
    }

    // description 부분 요약
    for (let viewContent of viewContents) {
      if (viewContent.description.length > 100) {
        let memory = "";

        for (let cnt = 0; cnt <= 100; cnt++) {
          memory += viewContent.description[cnt];
        }

        viewContent.description = memory + "...";
      }
    }

    // 게시물 페이지 분할
    if (!contentsPage) {
      contentsPage = 1;
    }

    if (viewContents.length > 5) {
      contentsBundle = contentsSplitUtil(viewContents, 5);
    } else if (viewContents.length <= 5 && viewContents.length !== 0) {
      contentsBundle[0] = viewContents;
    }
  }

  res.render("portfolio/main", {
    contentsList: contentsBundle,
    contentsPage: contentsPage,
  });
}

async function contentsDetails(req, res) {
  const id = req.params.id;
  let commentsPage = req.query.commentsPage;

  const contents = new Contents("");
  const comments = new Comments("");

  const content = await contents.findById(id);
  let commentList = await comments.findByContentsId(id);

  let commentsBundle = [];
  let commentsCheck = true;

  if (content.status === "hidden") {
    // 로그 기록
    const userIp = "USER: " + req.ip;
    console.log(logForm(userIp, "숨김 처리된 Portfolio 접근 시도."));
    return res.send(
      "<script>alert('숨김 처리된 컨텐츠 입니다.'); history.back();</script>"
    );
  }

  if (!commentList[0]) {
    commentsCheck = false;
  } else {
    commentList.reverse();
  }

  if (!commentsPage) {
    commentsPage = 1;
  }

  // 댓글 단위를 4개씩 끊기
  if (commentList.length > 4) {
    commentsBundle = contentsSplitUtil(commentList, 4);
  } else {
    commentsBundle[0] = commentList;
  }

  res.render("portfolio/detail-view", {
    content: content,
    commentsCheck: commentsCheck,
    comments: commentsBundle,
    commentsPage: commentsPage,
  });
}

async function writingComment(req, res) {
  const commentInfo = {
    contentsId: req.params.id,
    userName: req.session.login.userName,
    commentText: req.body.commentText,
  };

  // 로그 수집을 위한 IP
  const userIp = "USER: " + req.ip;

  if (!validation.noEmpty(commentInfo.commentText)) {
    return res.send(
      "<script>alert('댓글의 입력창이 빈 공간으로 이루어져 있습니다.'); history.back();</script>"
    );
  } else if (!validation.lengthValid(commentInfo.commentText, 40)) {
    // 로그
    console.log(
      logForm(userIp, res.locals.userName + " 댓글 입력 폼 우회 시도.")
    );
    return res.status(400).render("errors/400");
  }

  const comments = new Comments(commentInfo);

  await comments.writingComment();

  console.log(
    logForm(
      userIp,
      res.locals.userName + " " + commentInfo.contentsId + " 댓글 입력."
    )
  );

  res.redirect("/portfolio/details/" + commentInfo.contentsId);
}

async function deleteComment(req, res) {
  // 댓글 정보 불러오기
  const commentId = req.params.id;

  const comments = new Comments("");

  const commentInfo = await comments.findById(commentId);

  // 로그 수집을 위한 ip
  const userIp = "USER: " + req.ip;

  // 댓글 작성자와 삭제하려는 사람이 같은지
  try {
    if (
      commentInfo.userName === res.locals.userName ||
      res.locals.admin ||
      res.locals.manager
    ) {
      await comments.deleteById(commentId);

      console.log(
        logForm(userIp, res.locals.userName + " " + commentId + " 댓글 삭제.")
      );
    }
  } catch (error) {
    // 로그
    console.log(logForm(userIp, res.locals.userName + " 댓글 삭제 우회 시도."));
    console.log(error);
    return res.status(400).render("errors/400");
  }

  res.redirect("/portfolio/details/" + commentInfo.contentsId);
}

module.exports = {
  getMain: getMain,
  contentsDetails: contentsDetails,
  writingComment: writingComment,
  deleteComment: deleteComment,
};
