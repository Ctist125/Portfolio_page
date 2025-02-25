// 외부 라이브러리 선언
const multer = require("multer");
const uuid = require("uuid").v4;

const upload = multer({
  storage: multer.diskStorage({
    destination: "resource/contents-image",
    filename: function (req, file, cb) {
      cb(null, uuid() + "-" + file.originalname);
    },
  }),
});

const configuredMulterMiddleware = upload.single("image");

module.exports = configuredMulterMiddleware;
