import { selectUser } from "../../core/stores/user/user.selectors";

export const userMock = {         
    _id: '1',
    username: 'user',
    email: 'test@test.com', 
    peblobs: [] 
};

export const userStoreMock = {
  selectors: [
    {
      selector: selectUser,
      value: userMock
    }
  ]
};