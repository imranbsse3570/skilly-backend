module.exports = (courses, courseId) =>
  courses.find((course) => course.courseId.toString() === courseId.toString());
