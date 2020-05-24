const assert = require('assert');

const { chunkBy } = require('../../../lib/utils');

describe('chunkBy util', () => {
    const isNegative = x => x < 0;
    const chunkByNegative = chunkBy(isNegative);

    it('handles empty array', () => {
        const result = chunkByNegative([]);
        const expected = [[]];
        assert.deepEqual(result, expected);
    });

    it('handles cases when no element matches the predicate', () => {
        const result = chunkByNegative([1, 2, 3, 4]);
        const expected = [[1, 2, 3, 4]];
        assert.deepEqual(result, expected);
    });

    it('handles cases when matched element is first', () => {
        const result = chunkByNegative([-1, 2, 3, 4]);
        const expected = [[-1, 2, 3, 4]];
        assert.deepEqual(result, expected);
    });

    it('handles cases when matched element is last', () => {
        const result = chunkByNegative([1, 2, 3, -4]);
        const expected = [[1, 2, 3], [-4]];
        assert.deepEqual(result, expected);
    });

    it('handles cases when matched element is between', () => {
        const result = chunkByNegative([1, 2, -3, 4]);
        const expected = [
            [1, 2],
            [-3, 4],
        ];
        assert.deepEqual(result, expected);
    });

    it('handles cases when multiple elements are matched', () => {
        const result = chunkByNegative([1, 2, -3, 4, -5, 6, 7, -8]);
        const expected = [[1, 2], [-3, 4], [-5, 6, 7], [-8]];
        assert.deepEqual(result, expected);
    });
});
