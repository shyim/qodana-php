var matcher = require('../semver-range-matcher');
var assert = require('assert');

describe('Version range matcher', function () {
  it('should match', function () {
    expect(true, true, true, '^1.0.0', '1.0.0');
    expect(true, true, true, '^1.0.0', '1.0.1');
    expect(true, true, true, '^1.0.0', '1.1.1');
    expect(false, true, true, '^1.0.0', '2.1.1');
    expect(false, true, true, '>=2.5.10 <= 3.0.1', '2.1.1');
    expect(false, true, true, '>=2.5.10 <= 3.0.1', '3.0.2');
    expect(true, true, true, '>=2.5.10 <= 3.0.1', '2.6.0');
    expect(true, true, true, '', '2.6.0');
    expect(true, true, true, '*', '2.6.0');
    expect(true, true, true, '3.3.x', '3.3.80');
    expect(true, true, true, '2.x', '2.36.0');
    expect(true, true, true, '1.0.0 - 2.9999.9999', '2.36.10');
    expect(true, true, true, '~1.2.3', '1.2.4');
    expect(false, true, true, '~1.2.3', '1.3.4');
  });

  it('should report invalid version', function () {
    expect(undefined, false, true, '^1.0.0', '294r8af092b');
    expect(undefined, false, true, '^1.0.0', 'test');
    expect(undefined, false, true, '^1.0.0', '');
    expect(undefined, false, true, '^1.0.0', '1.0');
    expect(undefined, false, true, '^1.0.0', '1.0.a');
  });

  it('should report invalid version range', function () {
    expect(undefined, true, false, 'http://asdf.com/asdf.tar.gz', '1.0.0');
    expect(undefined, true, false, 'latest', '1.0.0');
    expect(undefined, true, false, 'file:../dyl', '1.0.0');
    expect(undefined, true, false, 'git://github.com/markdalgleish/gh-pages#cli-message', '1.0.0');
    expect(undefined, true, false, 'mochajs/mocha#4727d357ea', '1.0.0');
  });

  it('should respect asterisk version range', function () {
    expect(true, true, true, '*', '4.0.0-beta.3');
  });
});

function expect(expectedMatched, expectedValidVersion, expectedValidVersionRange, range, version) {
  var result = matcher.match([{
    packageName:'qqq',
    versionRange: range,
    version: version
  }]);
  assert.strictEqual(result.length, 1);
  var response = result[0];
  assert.strictEqual(response.packageName, 'qqq');
  assert.strictEqual(response.versionRange, range);
  assert.strictEqual(response.version, version);
  assert.strictEqual(response.matched, expectedMatched);
  assert.strictEqual(response.validVersionRange, expectedValidVersionRange);
  assert.strictEqual(response.validVersion, expectedValidVersion);
}
