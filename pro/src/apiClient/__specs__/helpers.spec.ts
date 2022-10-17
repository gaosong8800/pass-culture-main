import '@testing-library/jest-dom'
import { ApiError } from 'apiClient/v1'
import { ApiRequestOptions } from 'apiClient/v1/core/ApiRequestOptions'
import { ApiResult } from 'apiClient/v1/core/ApiResult'

import { getErrorCode, serializeApiErrors } from '../helpers'

describe('test apiClient:helpers', () => {
  describe('test getErrorCode', () => {
    it("should return ApiError body's error code", () => {
      const request: ApiRequestOptions = {
        method: 'GET',
        url: 'http://test.url',
      }
      const response: ApiResult = {
        url: 'http://test.url',
        ok: false,
        status: 501,
        statusText: 'UNAUTHORIZED',
        body: {
          error: "Vous n'etes pas authorisé à voir cette page.",
          code: 'UNAUTHORIZED_ACCESS',
        },
      }
      const error = new ApiError(
        request,
        response,
        "Vous n'etes pas authorisé à voir cette page."
      )

      const errorCode = getErrorCode(error)
      expect(errorCode).toBe('UNAUTHORIZED_ACCESS')
    })
  })

  it('should map api response errors to form one without changes', () => {
    const initialError: Record<string, string> = {
      f1: 'e1',
      f2: 'e2',
      f3: 'e3',
    }
    const serializedError = serializeApiErrors(initialError)

    expect(Object.keys(serializedError)).toContain('f1')
    expect(Object.keys(serializedError)).toContain('f2')
    expect(Object.keys(serializedError)).toContain('f3')
  })

  it('should map api response errors to form one with changes', () => {
    const initialError: Record<string, string> = {
      f1: 'e1',
      f2: 'e2',
      f3: 'e3',
    }

    const apiFieldsMap: Record<string, string> = {
      f1: 'f4',
    }
    const serializedError = serializeApiErrors(initialError, apiFieldsMap)

    expect(Object.keys(serializedError)).not.toContain('f1')
    expect(Object.keys(serializedError)).toContain('f4')
  })
})
