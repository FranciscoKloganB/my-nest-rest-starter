import type { Request } from "express"

import { UserAccessTokenClaims } from "@auth/dtos/auth-token-output.dto"
import { FORWARDED_FOR_TOKEN_HEADER, REQUEST_ID_TOKEN_HEADER } from "@shared/constants"

import { createRequestContext } from "."

describe("createRequestContext function", () => {
  const user = new UserAccessTokenClaims()
  const request = {
    header: jest.fn().mockImplementation((header) => {
      switch (header) {
        case REQUEST_ID_TOKEN_HEADER:
          return "123"
        case FORWARDED_FOR_TOKEN_HEADER:
          return "forwardedIP"
        default:
          break
      }
    }),
    ip: "someIP",

    url: "someUrl",
    user,
  } as unknown as Request

  const expectedOutput = {
    ip: "forwardedIP",
    requestID: "123",
    url: "someUrl",
    user,
  }

  it("should return RequestContext", () => {
    expect(createRequestContext(request)).toEqual(expectedOutput)
  })
})
