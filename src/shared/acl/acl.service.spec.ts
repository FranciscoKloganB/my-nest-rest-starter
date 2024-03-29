import type { TestingModule } from "@nestjs/testing"
import { Test } from "@nestjs/testing"

import { ROLE } from "@auth/constants/role.constant"

import { BaseAclService } from "./acl.service"
import type { RuleCallback } from "./acl-rule.constant"
import { Action } from "./action.constant"

class MockResource {
  id: number
}

class MockAclService extends BaseAclService<MockResource> {
  public canDo(
    role: ROLE,
    actions: Action[],
    ruleCallback?: RuleCallback<MockResource>,
  ) {
    super.canDo(role, actions, ruleCallback)
  }

  public getAclRules() {
    return this.aclRules
  }
}

describe("AclService", () => {
  let service: MockAclService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockAclService],
    }).compile()

    service = module.get<MockAclService>(MockAclService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("canDo", () => {
    it("should add acl rule", () => {
      service.canDo(ROLE.USER, [Action.Read])
      const aclRules = service.getAclRules()
      expect(aclRules).toContainEqual({
        actions: [Action.Read],
        role: ROLE.USER,
      })
    })

    it("should add acl rule with custom rule", () => {
      const customRuleCallback = () => true
      service.canDo(ROLE.USER, [Action.Read], customRuleCallback)

      const aclRules = service.getAclRules()

      expect(aclRules).toContainEqual({
        actions: [Action.Read],
        role: ROLE.USER,
        ruleCallback: customRuleCallback,
      })
    })
  })

  describe("forActor", () => {
    const user = {
      id: 6,
      roles: [ROLE.USER],
      username: "foo",
    }

    const admin = {
      id: 7,
      roles: [ROLE.ADMIN],
      username: "admin",
    }

    it("should return canDoAction method", () => {
      const userAcl = service.forActor(user)
      expect(userAcl.canDoAction).toBeDefined()
    })

    it("should return false when no role sepcific rules found", () => {
      service.canDo(ROLE.USER, [Action.Read])
      const userAcl = service.forActor(admin)
      expect(userAcl.canDoAction(Action.Read)).toBeFalsy()
    })

    it("should return false when no action sepcific rules found", () => {
      service.canDo(ROLE.USER, [Action.Read])
      const userAcl = service.forActor(user)
      expect(userAcl.canDoAction(Action.Create)).toBeFalsy()
    })

    it("should return true when role has action permission", () => {
      service.canDo(ROLE.USER, [Action.Read])
      const userAcl = service.forActor(user)
      expect(userAcl.canDoAction(Action.Read)).toBeTruthy()
    })

    it("should return true when ruleCallback is true", () => {
      const customOwnerRule = () => true
      service.canDo(ROLE.USER, [Action.Manage], customOwnerRule)
      const userAcl = service.forActor(user)
      expect(userAcl.canDoAction(Action.Read)).toBeTruthy()
    })

    it("should return false when ruleCallback is false", () => {
      const customOwnerRule = () => false
      service.canDo(ROLE.USER, [Action.Manage], customOwnerRule)
      const userAcl = service.forActor(user)
      expect(userAcl.canDoAction(Action.Read)).toBeFalsy()
    })
  })
})
