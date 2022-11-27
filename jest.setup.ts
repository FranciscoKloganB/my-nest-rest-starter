/**
 * Usage:
 *  jest.spyOn(bcrypt, 'hash').mockReturnValue("hello-world")
 *  jest.spyOn(bcrypt, 'compare').mockReturnValue(true)
 */
jest.mock('bcrypt', () => ({
  __esModule: true,
  ...jest.requireActual('bcrypt'),
  hash: jest.fn(),
  compare: jest.fn(),
}));
