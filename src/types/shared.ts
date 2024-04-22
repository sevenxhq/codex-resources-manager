export type ResourceDisplay = {
  name: string;
  version: {
    tag: string;
    releaseDate: Date;
  };
  owner: {
    name: string;
    url: string;
    avatarUrl: string;
  };
};
