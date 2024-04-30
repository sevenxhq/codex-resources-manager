import * as vscode from "vscode";
import { fileExists } from "../../utilities";
import { DownloadedResource } from "../../types/codexResource";

const CONFIG_FILE_NAME = "scribe.config.json";
export const getDownloadedResourcesFromProjectConfig = async () => {
  const projectURI = vscode.workspace.workspaceFolders?.[0].uri;

  const configFileUri = projectURI?.with({
    path: vscode.Uri.joinPath(projectURI, CONFIG_FILE_NAME).path,
  });

  if (!configFileUri) {
    console.error("No workspace opened");
    return;
  }

  let config: Record<string, any> = {};
  const configFileExists = await fileExists(configFileUri);

  if (configFileExists) {
    const configFile = await vscode.workspace.fs.readFile(configFileUri);
    config = JSON.parse(new TextDecoder().decode(configFile));
  }

  return (config.resources ?? []) as DownloadedResource[];
};
