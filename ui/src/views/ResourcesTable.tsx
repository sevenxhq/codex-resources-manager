import {
  VSCodeButton,
  VSCodeDropdown,
  VSCodeOption,
} from "@vscode/webview-ui-toolkit/react";
import { useEffect, useState } from "react";
import { vscode } from "../utilities/vscode";
import { renderToPage } from "../utilities/main-vscode";
import { ResourceDisplay } from "../../../src/types/shared";
import { DownloadedResource, MessageType } from "../types";

const ResourcesTable = () => {
  const { resourcesTypes } = useResourcesTypes();
  const [selectedResourceType, setSelectedResourceType] = useState<string>("");

  const { resourceTableData } = useResourceTableData();

  const { downloadedResources } = useDownloadedResources();

  useEffect(() => {
    vscode.postMessage({
      type: MessageType.SET_CURRENT_RESOURCE_TYPE,
      payload: { resourceType: selectedResourceType },
    });
  }, [selectedResourceType]);

  const handleDownload = (
    resource: ResourceDisplay<Record<string, any>>,
    resourceType: string
  ) => {
    vscode.postMessage({
      type: MessageType.DOWNLOAD_RESOURCE,
      payload: {
        fullResource: resource.fullResource,
        resourceType: resourceType,
      },
    });
  };

  const handleOpenResource = (resource: DownloadedResource | undefined) => {
    if (!resource) {
      return;
    }

    vscode.postMessage({
      type: MessageType.OPEN_RESOURCE,
      payload: {
        resource: resource,
      },
    });
  };

  return (
    <div>
      <div className="flex justify-between w-full">
        Filter Resources
        <VSCodeDropdown
          className="w-1/2"
          onInput={(e: any) => {
            //FIXME: type
            setSelectedResourceType(e.target.value);
          }}
        >
          {resourcesTypes.map((type) => (
            <VSCodeOption onClick={() => setSelectedResourceType(type.value)}>
              {type.label}
            </VSCodeOption>
          ))}
        </VSCodeDropdown>
      </div>
      <table className="table-auto w-full">
        <thead className="font-semibold">
          <tr>
            <td>Resource</td>
            <td>Owner</td>
            <td>Version</td>
            <td></td>
          </tr>
        </thead>

        <tbody className="gap-3">
          {resourceTableData?.map((resource) => (
            <tr>
              <td>{resource.name}</td>

              <td>
                {resource.owner.avatarUrl ? (
                  <img
                    src={resource.owner.avatarUrl}
                    alt={resource.owner.name}
                    className="w-8 h-8 rounded-lg object-contain"
                  />
                ) : (
                  resource.owner.name
                )}
              </td>
              <td
                title={`Released on : ${new Date(
                  resource.version.releaseDate
                ).toLocaleDateString()}`}
              >
                {resource.version.tag}
              </td>
              <td className="flex items-center justify-center px-2">
                {!downloadedResources.find(
                  (item) => item.id === resource.id
                ) ? (
                  <VSCodeButton
                    title="Download Resource"
                    appearance="secondary"
                    className="w-full"
                    onClick={() =>
                      handleDownload(resource, resource.resourceType)
                    }
                  >
                    <i className="codicon codicon-cloud-download"></i> Download
                  </VSCodeButton>
                ) : (
                  <VSCodeButton
                    title="Open Resource"
                    appearance="primary"
                    className="w-full"
                    onClick={() =>
                      handleOpenResource(
                        downloadedResources.find(
                          (item) => item.id === resource.id
                        )
                      )
                    }
                  >
                    <i className="codicon codicon-eye"></i> Open
                  </VSCodeButton>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

renderToPage(<ResourcesTable />);

const useResourcesTypes = () => {
  const [resourcesTypes, setResourcesTypes] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);

  useEffect(() => {
    vscode.setMessageListeners((event) => {
      switch (event.data.type) {
        case "SET_RESOURCES_TYPES":
          console.log("event.data.payload.resourcesTypes", event.data.payload);
          setResourcesTypes(event.data.payload.resourcesTypes ?? []);
          break;
      }
    });
  }, []);

  return { resourcesTypes, setResourcesTypes };
};

const useResourceTableData = () => {
  const [resourceTableData, setResourceTableData] = useState<
    ResourceDisplay<Record<string, any>>[] // FIXME: type fullResource
  >([]);

  useEffect(() => {
    vscode.setMessageListeners((event) => {
      switch (event.data.type) {
        case "SET_RESOURCE_TABLE_DATA":
          console.log("event.data.payload.tableData", event.data.payload);
          setResourceTableData(event.data.payload.tableData ?? []);
          break;
      }
    });
  }, []);

  return { resourceTableData };
};

const useDownloadedResources = () => {
  const [downloadedResources, setDownloadedResources] = useState<
    DownloadedResource[]
  >([]);

  useEffect(() => {
    vscode.setMessageListeners((event) => {
      switch (event.data.type) {
        case "SET_DOWNLOADED_RESOURCES":
          console.log(
            "event.data.payload.downloadedResources",
            event.data.payload
          );
          setDownloadedResources(event.data.payload.downloadedResources ?? []);
          break;
      }
    });
  }, []);

  return { downloadedResources };
};
