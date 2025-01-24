// 외부 라이브러리 선언
const express = require("express");

// 프로젝트 내 파일
const managementController = require("../controller/management.controller");
const adminAccessCheckMiddleware = require("../middlewares/admin-access-check");
const imageUploadMiddleware = require("../middlewares/image-upload");
const csrfTokenCheckMiddleware = require("../middlewares/csrf-token-check");
const addCsrfTokenMiddleware = require("../middlewares/csrf-token");

// express
const router = express.Router();

router.get("/", managementController.getMain);

router.get("/service", addCsrfTokenMiddleware, managementController.getService);

router.get("/service/contents/:id", managementController.contentsStatusManagement);

router.get("/service/history/:id", managementController.historyStatusManagement);

router.get("/service/content/revise/:id", adminAccessCheckMiddleware, addCsrfTokenMiddleware, managementController.getReviseContent);

router.post("/service/content/revise/:id", adminAccessCheckMiddleware, csrfTokenCheckMiddleware, imageUploadMiddleware, managementController.reviseContent);

router.get("/service/history/revise/:id", adminAccessCheckMiddleware, addCsrfTokenMiddleware, managementController.getReviseHistory);

router.post("/service/history/revise/:id", adminAccessCheckMiddleware, csrfTokenCheckMiddleware, managementController.reviseHistory);

router.get("/service/skills/:id", adminAccessCheckMiddleware, managementController.deleteSkill);

router.post("/service/new-skill", adminAccessCheckMiddleware, csrfTokenCheckMiddleware, managementController.newSkill);

router.get("/user", addCsrfTokenMiddleware, managementController.getUser);

router.post("/user/signup-function", csrfTokenCheckMiddleware, managementController.signupFunction);

router.get("/user/:id", managementController.signupApprovalFunction);

router.get("/user/lock-management/:id", managementController.lockManagement);

router.get("/user/manager/:id", adminAccessCheckMiddleware, managementController.managerManagemenFunction);

router.get("/user/kick/:id", adminAccessCheckMiddleware, managementController.userKickFunction);

module.exports = router;