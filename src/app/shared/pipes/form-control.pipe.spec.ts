import { ToFormControlPipe } from './form-control.pipe';

describe('ToFormControlPipe', () => {
  it('create an instance', () => {
    const pipe = new ToFormControlPipe();
    expect(pipe).toBeTruthy();
  });
});
