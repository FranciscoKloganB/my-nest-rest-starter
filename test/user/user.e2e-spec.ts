import type { INestApplication } from "@nestjs/common"
import { HttpStatus, ValidationPipe } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"

import { VALIDATION_PIPE_OPTIONS } from "@shared/constants"

import {
  closeDBAfterTest,
  createDBEntities,
  resetDBBeforeTest,
  seedAdminUser,
} from "../test-utils"

import { AppModule } from "../../src/app.module"
import type { AuthTokenOutput } from "../../src/auth/dtos/auth-token-output.dto"
import type { UserOutput } from "../../src/user/dtos/user-output.dto"

describe("UserController (e2e)", () => {
  let app: INestApplication
  let adminUser: UserOutput
  let authTokenForAdmin: AuthTokenOutput

  beforeAll(async () => {
    await resetDBBeforeTest()
    await createDBEntities()

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS))
    await app.init()
    ;({ adminUser, authTokenForAdmin } = await seedAdminUser(app))
  })

  describe("Get user me", () => {
    it("gets user me", async () =>
      request(app.getHttpServer())
        .get("/users/me")
        .set("Authorization", "Bearer " + authTokenForAdmin.accessToken)
        .expect(HttpStatus.OK))

    it("Unauthorized error when BearerToken is not provided", async () =>
      request(app.getHttpServer()).get("/users/me").expect(HttpStatus.UNAUTHORIZED))

    it("Unauthorized error when BearerToken is wrong", async () =>
      request(app.getHttpServer())
        .get("/users/me")
        .set("Authorization", "Bearer " + "abcd")
        .expect(HttpStatus.UNAUTHORIZED))
  })

  describe("get all users", () => {
    it("returns all users", async () => {
      const expectedOutput = [adminUser]

      return request(app.getHttpServer())
        .get("/users")
        .set("Authorization", "Bearer " + authTokenForAdmin.accessToken)
        .expect(HttpStatus.OK)
        .expect({ data: expectedOutput, meta: { count: 1 } })
    })
  })

  describe("get a user by Id", () => {
    it("should get a user by Id", async () => {
      const expectedOutput = adminUser

      return request(app.getHttpServer())
        .get("/users/1")
        .expect(HttpStatus.OK)
        .expect({ data: expectedOutput, meta: {} })
    })

    it("throws NOT_FOUND when user doesnt exist", () =>
      request(app.getHttpServer()).get("/users/99").expect(HttpStatus.NOT_FOUND))
  })

  const updateUserInput = {
    name: "New e2etestername",
    password: "12345678aA12",
  }

  describe("update a user", () => {
    it("successfully updates a user", async () => {
      const expectedOutput: UserOutput = {
        ...adminUser,
        ...{ name: "New e2etestername" },
      }

      return request(app.getHttpServer())
        .patch("/users/1")
        .send(updateUserInput)
        .expect(HttpStatus.OK)
        .expect((res) => {
          const resp = res.body
          expectedOutput.updatedAt = resp.data.updatedAt
          expect(resp).toEqual({ data: expectedOutput, meta: {} })
        })
    })

    it("throws NOT_FOUND when user doesnt exist", () =>
      request(app.getHttpServer()).patch("/users/99").expect(HttpStatus.NOT_FOUND))

    it("update fails when incorrect password type", () => {
      updateUserInput.password = 12345 as any

      return request(app.getHttpServer())
        .patch("/users/1")
        .expect(HttpStatus.BAD_REQUEST)
        .send(updateUserInput)
        .expect((res) => {
          const resp = res.body

          expect(resp.error.details.message).toContain("password must be a string")
        })
    })
  })

  afterAll(async () => {
    await app.close()
    await closeDBAfterTest()
  })
})
