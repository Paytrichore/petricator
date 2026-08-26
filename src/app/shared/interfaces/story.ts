export enum StoryType {
    PRIMARY = 'primary',
    SECONDARY = 'secondary',
    PINK = 'pink',
}

export type StoryChoice = { color: string; action: string; result: string };

export type Story = {
  id?: string;
  situation: string;
  choices: StoryChoice[];
};

export interface StoryData {
  primary: Story[];
  secondary: Story[];
  pink: Story[];
}