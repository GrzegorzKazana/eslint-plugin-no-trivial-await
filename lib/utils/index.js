const flatMap = (fn, arr) => [].concat(...arr.map(fn));

module.exports = { flatMap };
