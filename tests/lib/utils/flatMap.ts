import assert from 'assert';

import { flatMap } from '@/utils';

describe('flatMap util', () => {
    const negate = x => [-x];
    const complement = x => [-x, x];
    const negateNumbers = flatMap(negate);
    const complementNumbers = flatMap(complement);

    it('handles empty array', () => {
        assert.deepEqual(complementNumbers([]), []);
    });

    it('handles functions returning single element arrays', () => {
        assert.deepEqual(negateNumbers([1, 2]), [-1, -2]);
    });

    it('handles functions returning multi-element arrays', () => {
        assert.deepEqual(complementNumbers([1, 2]), [-1, 1, -2, 2]);
    });
});
