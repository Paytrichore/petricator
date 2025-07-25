import { selectUser } from "../../core/stores/user/user.selectors";

export const userMock = {         
    _id: '1',
    username: 'user',
    email: 'test@test.com', 
    actionPoints: 10,
    nextDLA: '',
    drafted: false,
    timeUntilNextDLA: {
      hours: 0,
      minutes: 0,
    },
};

export const userStoreMock = {
  selectors: [
    {
      selector: selectUser,
      value: userMock
    }
  ]
};