const crypto = require("crypto");
const fs = require("fs");

const path = require("path");
const multer = require("multer");
const { getVideoDurationInSeconds } = require("get-video-duration");

const checkingForMatchingCourse = require(path.resolve(
  "util/findingCourseInUser"
));
const catchAsync = require(path.resolve("util/catchAsync"));
const Lecture = require(path.resolve("model/lectureModel"));
const Course = require(path.resolve("model/courseModel"));
const AppError = require(path.resolve("util/appError"));
const deleteFile = require(path.resolve("util/deleteFile"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { id } = req.params;

    fs.mkdir(`uploads/lectures/${id}`, { recursive: true }, (err) => {
      if (err) {
        cb(new AppError("Error in uploading File", 400));
      }
    });

    cb(null, `uploads/lectures/${id}`);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    const filenameWithExt = `${crypto
      .randomBytes(15)
      .toString("hex")}-${Date.now()}.${ext}`;
    cb(null, filenameWithExt);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video")) {
    if (file.mimetype.endsWith("mp4")) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          "Video Format not valid. please only upload mp4 files",
          400
        )
      );
    }
  } else {
    cb(new AppError("Only video is accepted as upload", 400));
  }
};

exports.lectureUploader = multer({ storage: storage, fileFilter: fileFilter });

exports.gettingCourseData = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new AppError("Course Not found", 404));
  }
  req.course = course;
  next();
});

exports.getLectures = catchAsync(async (req, res, next) => {
  const lectures = req.course.lectures;

  lectures.forEach((value) => {
    if (value.isLocked) {
      value.source = undefined;
    }
  });

  res.status(200).json({
    status: "success",
    results: lectures.length,
    data: {
      doc: lectures,
    },
  });
});

exports.addNewLectures = catchAsync(async (req, res, next) => {
  if (!req.file) {
    next(
      new AppError(
        "Video file must be uploaded in order to create a lecture",
        404
      )
    );
  }

  req.body.source = req.file.filename;

  const duration = Math.floor(
    await getVideoDurationInSeconds(path.resolve(req.file.path))
  );

  req.body.duration = duration;

  const course = req.document;

  req.body.order = course.lectures.length + 1;

  const newLecture = await Lecture.create(req.body);

  course.totalDuration += duration;

  course.lectures = [...req.document.lectures, newLecture._id];

  await course.save({ validateBeforeSave: false });

  res.status(201).json({
    status: "success",
    data: {
      doc: newLecture,
    },
  });
});

exports.getLectureById = (req, res, next) => {
  const lecture = req.course.lectures.filter(
    (value) => value._id.toString() === req.params.lectureId.toString()
  );

  if (lecture.length === 0) {
    return next(new AppError("Lecture Not Found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      doc: lecture[0],
    },
  });
};

exports.checkingLecture = catchAsync(async (req, res, next) => {
  const { lectureFileName } = req.params;

  const lecture = await Lecture.findOne({ source: lectureFileName });

  if (!lecture) {
    return next(
      new AppError("Lecture not found please provide valid address", 404)
    );
  }

  req.lecture = lecture;

  next();
});

exports.checkForLockedLectures = (req, res, next) => {
  const { lectureFileName, id: courseId } = req.params;
  const lecture = req.lecture;
  if (!lecture.isLocked) {
    const filePath = path.resolve(
      `./uploads/lectures/${courseId}/${lectureFileName}`
    );
    res.sendFile(filePath);
  } else {
    next();
  }
};

exports.checkForLockedLecturesAndDownload = (req, res, next) => {
  const { lectureFileName, id: courseId } = req.params;
  const lecture = req.lecture;
  if (!lecture.isLocked) {
    const filePath = path.resolve(
      `./uploads/lectures/${courseId}/${lectureFileName}`
    );
    res.download(filePath, (err) =>
      next(new AppError("Error in downloading File", 500))
    );
  } else {
    next();
  }
};

exports.checkingAccessToLectures = (req, res, next) => {
  const course = req.course;
  const user = req.user;

  if (course.author.toString() !== user._id.toString()) {
    if (user.role !== "admin") {
      if (!checkingForMatchingCourse(user.courses, course._id)) {
        return next(
          new AppError(
            "User is not allowed to access the course. Please purchase the course inorder to access this resource",
            401
          )
        );
      }
    }
  }

  next();
};

exports.sendingLectureToClient = (req, res, next) => {
  const { lectureFileName, id: courseId } = req.params;

  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  const videoPath = path.resolve(
    `./uploads/lectures/${courseId}/${lectureFileName}`
  );
  const videoSize = fs.statSync(videoPath).size;

  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  res.writeHead(206, headers);

  const videoStream = fs.createReadStream(videoPath, { start, end });

  videoStream.pipe(res);
};

exports.downloadLectureToClient = (req, res, next) => {
  const { lectureFileName, id: courseId } = req.params;
  const filePath = path.resolve(
    `./uploads/lectures/${courseId}/${lectureFileName}`
  );
  res.download(filePath);
};

exports.deleteLecture = async (req, res, next) => {
  const course = req.document;

  let lectureFound = false;
  course.lectures = course.lectures
    .filter((lecture) => {
      if (lecture._id.toString() === req.params.lectureId.toString()) {
        lectureFound = true;
        return false;
      } else {
        return true;
      }
    })
    .map((lecture) => {
      return lecture._id;
    });

  if (!lectureFound) {
    return next(new AppError("Lecture Not Found in the course", 404));
  }

  const lecture = await Lecture.findByIdAndDelete(req.params.lectureId);

  if (!lecture) {
    return next(new AppError("Lecture not found ", 404));
  }

  course.totalDuration -= lecture.duration;

  await deleteFile(`./uploads/lectures/${course._id}/${lecture.source}`);

  await course.save();

  res.status(204).json({
    message: "lecture successfully deleted",
  });
};

exports.checkingForTheLectureInCourse = (req, res, next) => {
  const course = req.document;

  let lectureFound = undefined;
  course.lectures.forEach((lecture) => {
    if (lecture._id.toString() === req.params.lectureId) {
      lectureFound = lecture;
    }
  });

  if (!lectureFound) {
    return next(new AppError("Lecture not found in course", 404));
  }

  req.lectureFound = lectureFound;

  next();
};

exports.updateLecture = catchAsync(async (req, res, next) => {
  const course = req.document;

  const lecture = await Lecture.findById(req.params.lectureId);

  if (!lecture) {
    return next(new AppError("Lecture not found", 404));
  }

  if (req.file) {
    await deleteFile(
      `./uploads/lectures/${course._id}/${req.lectureFound.source}`
    );

    const duration = Math.floor(
      await getVideoDurationInSeconds(path.resolve(req.file.path))
    );

    course.totalDuration -= lecture.duration;
    course.totalDuration += duration;

    await course.save();

    req.body.duration = duration;

    req.body.source = req.file.filename;
  }

  await lecture.save();

  res.status(202).json({
    status: "success",
    data: {
      lecture,
    },
  });
});

exports.markingVideoAsWatched = catchAsync(async (req, res, next) => {
  const user = req.user;

  const courseStats = checkingForMatchingCourse(user.courses, req.course._id);

  if (!courseStats) {
    return next(new AppError("Course not purchased", 403));
  }

  const lecture = req.course.lectures.filter(
    (value) => value._id.toString() === req.params.lectureId.toString()
  );

  if (lecture.length === 0) {
    return next(new AppError("Lecture Not Found", 404));
  }

  courseStats.watchedTime += lecture[0].duration;

  const courseIndex = user.courses.indexOf(courseStats);

  user.courses[courseIndex] = courseStats;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
  });
});
