export enum StoryType {
    PRIMARY = 'primary',
    SECONDARY = 'secondary',
    PINK = 'pink',
}
export type Story = {
  situation: string;
  choices: Array<{ color: string; action: string; result: string }>;
};

export interface StoryData {
  primary: Story[];
  secondary: Story[];
  pink: Story[];
}