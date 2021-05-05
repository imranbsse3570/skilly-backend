exports.getAllReviews = (req, res) => {
  res.status(200).json({
    status: "success",
    data: null,
  });
};

exports.addNewReview = (req, res) => {
  console.log(req.body);
  res.status(201).json({
    status: "Success",
    data: req.body,
  });
};

exports.getReview = (req, res) => {
  res.status(200).json({
    status: "success",
    data: req.params.id,
  });
};

exports.deleteReview = (req, res) => {
  res.status(204).json({
    status: "success",
    data: req.params.id,
  });
};

exports.updateReview = (req, res) => {
  res.status(202).json({
    status: "Success",
    data: req.body,
  });
};
