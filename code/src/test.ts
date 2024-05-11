import assert = require('node:assert')
import { describe, it } from 'node:test'
import { containsValidField } from './helper'

describe('Detects records with valid fields', () => {
    it('Verifies vector length', () => {
        assert(containsValidField('vector', 4, {
            vector: { L: [{ N: '1' }, { N: '2' }, { N: '3' }, { N: '4' }] }
        }))

        assert(!containsValidField('vector', 4, {
            vector: { L: [{ N: '1' }, { N: '2' }, { N: '3' }] }
        }))

        assert(!containsValidField('vector', 4, {
            vector: { L: [] }
        }))
    })

    it('Verifies vector elements', () => {
        assert(!containsValidField('vector', 3, {
            vector: { L: [{ S: '1' }, { S: '2' }, { S: '3' }] }
        }))

        assert(!containsValidField('vector', 3, {
            vector: { L: [{ N: '1' }, { N: '2' }, { S: '3' }] }
        }))
    });

    it('Handles missing data', () => {
        assert(!containsValidField('vector', 4, {
            vector: { S: "test" }
        }))

        assert(!containsValidField('vector', 4, {
            differentFieldName: { S: "test" }
        }))
    });

    it('Handles nulls', () => {
        assert(!containsValidField('vector', 4, null))

        assert(!containsValidField('vector', 4, undefined))
    });
})