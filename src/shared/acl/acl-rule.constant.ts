import type { ROLE } from "@auth/constants/role.constant"

import type { Action } from "./action.constant"
import type { IActor } from "./actor.constant"

/**
 * Custom rule callback definition
 */
type RuleCallback<Resource> = (resource: Resource, actor: IActor) => boolean

/**
 * ACL rule format
 */
type AclRule<Resource> = {
  //if rule for particular role or for all role
  role: ROLE

  //list of actions permissible
  actions: Action[]

  //specific rule there or otherwise true
  ruleCallback?: RuleCallback<Resource>
}

export type { AclRule, RuleCallback }
