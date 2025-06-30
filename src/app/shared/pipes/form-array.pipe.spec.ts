import { ToFormArrayPipe } from './form-array.pipe';

describe('ToFormArrayPipe', () => {
  it('create an instance', () => {
    const pipe = new ToFormArrayPipe();
    expect(pipe).toBeTruthy();
  });
});
