import { selectUser, selectIsLoggedIn } from './user.selectors';
import { UserState } from './user.reducer';
import { userMock } from '../../../tests/mocks/user.mock';

describe('User Selectors', () => {
  describe('selectUser', () => {
    it('should return the user from state', () => {
      const state: UserState = { user: userMock };
      expect(selectUser.projector(state)).toEqual(userMock);
    });
    it('should return null if user is null', () => {
      const state: UserState = { user: null };
      expect(selectUser.projector(state)).toBeNull();
    });
  });

  describe('selectIsLoggedIn', () => {
    it('should return true if user exists', () => {
      expect(selectIsLoggedIn.projector(userMock)).toBeTrue();
    });
    it('should return false if user is null', () => {
      expect(selectIsLoggedIn.projector(null)).toBeFalse();
    });
  });
});
