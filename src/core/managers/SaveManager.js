import { mapState } from 'pinia';
import { store } from '../../store/index';
import { useDesignStore } from '../../stores/design';

export default class SaveManager {
    constructor(stage) {
        this.stage = stage;
        this.state = mapState(useDesignStore, {
            isDesignLoaded: state => state.isDesignLoaded,
            designVersionScene: state => state.versions.scene,
        });
    }

    isDesignSaved() {
        
    }

    isCloselyEqual(received, expected, decimals) {
        const error = this.recursiveCheck(received, expected, decimals, false);
        if (error) {
            return false;
        }
        return true;
    }

    /**
     * checks if actual and expected data are same or not recursively
     * @param {number|Array} actual
     * @param {number|Array} expected
     * @param {number} decimals
     * @param {boolean} strict equality or subsets allowed
     * @return {boolean|{reason, expected, received}}
     */
    recursiveCheck(actual, expected, decimals, strict = true) {
        this.name = 'name';
        if (typeof actual === 'number' && typeof expected === 'number') {
            if (isNaN(actual)) {
                return !isNaN(expected);
            }
            else if (Math.abs(actual - expected) <= Math.pow(10, -decimals)) {
                return false;
            }
            return {
                reason: `Expected value to be (using ${decimals} decimals)`,
                expected,
                received: actual,
            };
        }
        else if (
            (typeof actual === 'string' && typeof expected === 'string') ||
            (typeof actual === 'boolean' && typeof expected === 'boolean')
        ) {
            if (actual === expected) {
                return false;
            }
            return {
                reason: `The ${typeof expected}s do not match`,
                expected,
                received: actual,
            };
        }
        else if (Array.isArray(actual) && Array.isArray(expected)) {
            if (actual.length !== expected.length) {
                return {
                    reason: 'The arrays length does not match',
                    expected: expected.length,
                    received: actual.length,
                };
            }
            for (let i = 0; i < actual.length; i++) {
                const error = recursiveCheck(actual[i], expected[i], decimals, strict);
                if (error) return error;
            }
            return false;
        }
        else if (expected === null && actual === null) {
            return false;
        }
        else if (
            expected !== null &&
            typeof expected === 'object' &&
            actual !== null &&
            typeof actual === 'object'
        ) {
            const actualKeys = Object.keys(actual).sort();
            const expectedKeys = Object.keys(expected).sort();
            const sameLength = !strict || actualKeys.length === expectedKeys.length;
            if (
                !sameLength ||
                expectedKeys.some(e => !Object.prototype.hasOwnProperty.call(actual, e))
            ) {
                return {
                    reason: 'The objects do not have similar keys',
                    expected: expectedKeys,
                    received: actualKeys,
                };
            }
            for (const prop in expected) {
                const properror = recursiveCheck(actual[prop], expected[prop], decimals, strict);
                if (properror) return properror;
            }
            return false;
        }
        // error for all other types
        return {
            reason: 'The current data type is not supported or they do not match',
            expected: typeof expected,
            received: typeof actual,
        };
    }
}