import { clamp } from './helpers';

describe('#helper', () => {
    describe('#clamp', () => {
        it(`should be 0 when clamp -1`, () => {
            expect(clamp(-1)).toBe(0);
        });

        it(`should be 0 when clamp 0`, () => {
            expect(clamp(0)).toBe(0);
        });

        it(`should be 1 when clamp 1`, () => {
            expect(clamp(1)).toBe(1);
        });

        it(`should be 50 when clamp 50`, () => {
            expect(clamp(50)).toBe(50);
        });

        it(`should be 100 when clamp 100`, () => {
            expect(clamp(100)).toBe(100);
        });

        it(`should be 100 when clamp 101`, () => {
            expect(clamp(101)).toBe(100);
        });

        it(`should be 2 when clamp 1 with min=2`, () => {
            expect(clamp(1, 2)).toBe(2);
        });

        it(`should be 10 when clamp 11 with max=10`, () => {
            expect(clamp(11, undefined, 10)).toBe(10);
        });
    });

    describe('#hexToRgb', () => {
        it('should be', () => {
            // hexToRgb('')
        });
    });
});
