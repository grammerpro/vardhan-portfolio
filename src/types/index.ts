export interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  github: string;
  liveDemo: string;
  image?: {
  asset: {
    _ref: string;
    _type: string;
  };
};
}
