import type { ROLE } from "@auth/constants/role.constant"

import type { AclRule, RuleCallback } from "./acl-rule.constant"
import { Action } from "./action.constant"
import type { IActor } from "./actor.constant"

export class BaseAclService<Resource> {
  /**
   * ACL rules
   */
  protected aclRules: AclRule<Resource>[] = []

  /**
   * Set ACL rule for a role
   */
  protected canDo(
    role: ROLE,
    actions: Action[],
    ruleCallback?: RuleCallback<Resource>,
  ): void {
    ruleCallback
      ? this.aclRules.push({ actions, role, ruleCallback })
      : this.aclRules.push({ actions, role })
  }

  /**
   * create user specific acl object to check ability to perform any action
   */
  public forActor = (actor: IActor): any => ({
    canDoAction: (action: Action, resource?: Resource) => {
      let canDoAction = false

      actor.roles.forEach((actorRole) => {
        //If already has access, return
        if (canDoAction) {
          return true
        }

        //find all rules for given user role
        const aclRules = this.aclRules.filter((rule) => rule.role === actorRole)

        //for each rule, check action permission
        aclRules.forEach((aclRule) => {
          //If already has access, return
          if (canDoAction) {
            return true
          }

          //check action permission
          const hasActionPermission =
            aclRule.actions.includes(action) || aclRule.actions.includes(Action.Manage)

          //check for custom `ruleCallback` callback
          canDoAction =
            hasActionPermission &&
            (!aclRule.ruleCallback || aclRule.ruleCallback(resource, actor))
        })
      })

      return canDoAction
    },
  })
}
