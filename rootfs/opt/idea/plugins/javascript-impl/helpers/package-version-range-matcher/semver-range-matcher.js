var semver = require('semver');

function match(requests) {
  var responses = [];
  requests.forEach(function (request) {
    var response = {};
    response.packageName = request.packageName;
    response.versionRange = request.versionRange;
    response.version = request.version;
    response.validVersion = !!semver.valid(request.version);
    response.validVersionRange = !!semver.validRange(request.versionRange);
    if (response.validVersion && response.validVersionRange) {
      if (request.versionRange === '*') {
        response.matched = true;
      }
      else {
        response.matched = semver.satisfies(request.version, request.versionRange);
      }
    }
    responses.push(response);
  });
  return responses;
}

exports.match = match;
