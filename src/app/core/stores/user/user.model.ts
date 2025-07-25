export interface User {
  _id: string;
  username: string;
  email: string;
  actionPoints: number;
  nextDLA: string;
  drafted: boolean;
  timeUntilNextDLA: {
    hours: number;
    minutes: number;
  };
}