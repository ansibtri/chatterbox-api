function response(res, status_code, status_type, data=null) {
  return res.status(status_code).json({
    type: status_type,
    ...data
  });
}
module.exports = { response };
