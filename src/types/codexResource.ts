import { ResourceDisplay } from "./shared";

export interface CodexResource {
  id: string;
  displayLabel: string;
  downloadResource: () => Promise<DownloadedResource>;
  getResourceById: () => Promise<void>;
  getTableDisplayData: () => Promise<ResourceDisplay[]>;
  openResource: (resource: DownloadedResource) => Promise<void>;
  registerForBibleVerseChange?: () => void;
  registerForObsVerseChange?: () => void;
}

export type DownloadedResource = {
  name: string;
  id: string;
  localPath: string;
  remoteUrl: string;
  version: string;
  type: string;
};
