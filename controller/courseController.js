exports.getAllCourses = (req, res) => {
  res.status(200).json({
    status: "success",
    data: "all courses list",
  });
};

exports.addNewCourse = (req, res) => {
  console.log(req.body);
  res.status(201).json({
    status: "Success",
    data: req.body,
  });
};

exports.getCourse = (req, res) => {
  res.status(200).json({
    status: "success",
    data: req.params.id,
  });
};

exports.deleteCourse = (req, res) => {
  res.status(204).json({
    status: "success",
    data: req.params.id,
  });
};

exports.updateCourse = (req, res) => {
  res.status(202).json({
    status: "Success",
    data: req.body,
  });
};
