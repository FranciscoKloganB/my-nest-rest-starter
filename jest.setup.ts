/**
 * Usage:
 *  jest.spyOn(bcrypt, 'hash').mockReturnValue("hello-world")
 *  jest.spyOn(bcrypt, 'compare').mockReturnValue(true)
 */
jest.mock("bcrypt", () => ({
  __esModule: true,
  ...jest.requireActual("bcrypt"),
  compare: jest.fn(),
  hash: jest.fn(),
}))

export {}
