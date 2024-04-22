import * as vscode from "vscode";
import { CodexResource } from "../../types/codexResource";
import { TwlApiResponse } from "./types";

export class TWLResource implements CodexResource {
  id = "codex.twl";
  displayLabel = "Translation Words List";

  downloadResource = async () => {
    await vscode.window.showInformationMessage("GOING TO DOWNLOAD");
    return {} as ReturnType<CodexResource["downloadResource"]>;
  };

  getResources = async () => {
    return Promise.resolve();
  };

  getResourceById = async () => {
    return Promise.resolve();
  };

  getResourceDisplayData = async () => {
    return Promise.resolve();
  };

  openResource = async () => {
    return Promise.resolve();
  };
  getTableDisplayData = async () => {
    const resourceUrl = `https://git.door43.org/api/v1/catalog/search?subject=TSV Translation Words Links&metadataType=rc`;

    const response = await fetch(resourceUrl);

    const responseJson = (await response.json()) as TwlApiResponse;

    if (responseJson?.data) {
      return responseJson.data.map((resource) => ({
        name: resource.name,
        owner: {
          name: resource.repo.owner.full_name,
          url: resource.repo.owner.website,
          avatarUrl: resource.repo.owner.avatar_url,
        },
        version: {
          tag: resource.release.tag_name,
          releaseDate: new Date(resource.released),
        },
      }));
    }

    return [];
  };
}
