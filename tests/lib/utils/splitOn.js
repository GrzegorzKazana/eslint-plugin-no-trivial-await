const assert = require('assert');

const { splitOn } = require('../../../lib/utils');

describe('splitOn util', () => {
    const isNegative = x => x < 0;
    const splitOnNegative = splitOn(isNegative);

    it('handles empty array', () => {
        const result = splitOnNegative([]);
        const expected = [[], null, []];
        assert.deepEqual(result, expected);
    });

    it('handles cases when no element matches the predicate', () => {
        const result = splitOnNegative([1, 2, 3, 4]);
        const expected = [[1, 2, 3, 4], null, []];
        assert.deepEqual(result, expected);
    });

    it('handles cases when matched element is first', () => {
        const result = splitOnNegative([-1, 2, 3, 4]);
        const expected = [[], -1, [2, 3, 4]];
        assert.deepEqual(result, expected);
    });

    it('handles cases when matched element is last', () => {
        const result = splitOnNegative([1, 2, 3, -4]);
        const expected = [[1, 2, 3], -4, []];
        assert.deepEqual(result, expected);
    });

    it('handles cases when matched element is between', () => {
        const result = splitOnNegative([1, 2, -3, 4]);
        const expected = [[1, 2], -3, [4]];
        assert.deepEqual(result, expected);
    });
});
