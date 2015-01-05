module.exports = function() {
  return function(req, res, next) {
  	next(null, { name: 'Bob' });
  };
};