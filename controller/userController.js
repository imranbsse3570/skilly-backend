exports.getAllUsers = (req, res) => {
  res.status(200).json({
    status: "success",
    data: null,
  });
};

exports.addNewUser = (req, res) => {
  console.log(req.body);
  res.status(201).json({
    status: "Success",
    data: req.body,
  });
};

exports.getUser = (req, res) => {
  res.status(200).json({
    status: "success",
    data: req.params.id,
  });
};

exports.deleteUser = (req, res) => {
  res.status(204).json({
    status: "success",
    data: req.params.id,
  });
};

exports.updateUser = (req, res) => {
  res.status(202).json({
    status: "Success",
    data: req.body,
  });
};
