import type { TestingModule } from "@nestjs/testing"
import { Test } from "@nestjs/testing"

import { AppLogger } from "@shared/logger/logger.service"
import { RequestContext } from "@shared/request-context/request-context.dto"

import { AppService } from "./app.service"

describe("AppService", () => {
  let service: AppService
  const mockedLogger = { log: jest.fn(), setContext: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService, { provide: AppLogger, useValue: mockedLogger }],
    }).compile()

    service = module.get<AppService>(AppService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  const ctx = new RequestContext()

  describe("getHello", () => {
    it("should return Hello World", () => {
      expect(service.getHello(ctx)).toEqual("Hello World!")
    })
  })
})
