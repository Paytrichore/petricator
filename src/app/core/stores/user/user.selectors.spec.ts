import { selectUser, selectIsLoggedIn } from './user.selectors';
import { UserState } from './user.reducer';

describe('User Selectors', () => {
  describe('selectUser', () => {
    it('should return the user from state', () => {
      const user = { _id: '1', username: 'Test', email: 'test@test.com' };
      const state: UserState = { user };
      expect(selectUser.projector(state)).toEqual(user);
    });
    it('should return null if user is null', () => {
      const state: UserState = { user: null };
      expect(selectUser.projector(state)).toBeNull();
    });
  });

  describe('selectIsLoggedIn', () => {
    it('should return true if user exists', () => {
      expect(selectIsLoggedIn.projector({ _id: '1', username: 'Test', email: 'test@test.com' })).toBeTrue();
    });
    it('should return false if user is null', () => {
      expect(selectIsLoggedIn.projector(null)).toBeFalse();
    });
  });
});
