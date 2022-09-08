import { uniqueId } from "lodash";
import { atom } from "recoil";
import { userPersistAtom } from "./persistAtom";
import { setRecoilExternalState } from "./RecoilExternalStatePortal";
import {
  importCollectionPathAtom,
  isImportModalAtom,
  isModalPickProperty,
  isParsingLargeDataAtom,
  notifierAtom,
} from "./ui";

export const actionToggleModalPickProperty = (status?: boolean): void => {
  setRecoilExternalState(isModalPickProperty, (curStatus) =>
    status === undefined ? !curStatus : status
  );
};

export const actionToggleImportModal = (
  path: string,
  status?: boolean
): void => {
  setRecoilExternalState(importCollectionPathAtom, path);
  setRecoilExternalState(isImportModalAtom, (curStatus) =>
    status === undefined ? !curStatus : status
  );
};

export const actionTriggerLoadData = (totalDocs): void => {
  setRecoilExternalState(isParsingLargeDataAtom, { totalDocs }); // AUTO Trigger loading suspense
};

export const actionSendNotification = (
  type: "error" | "warning" | "success",
  message: string,
  showTime = 6000
): void => {
  setRecoilExternalState(notifierAtom, (notifications) => [
    ...notifications,
    {
      id: uniqueId("notification_"),
      type,
      message,
      showTime,
    },
  ]);
};

window.notification = actionSendNotification;
export const notifyErrorPromise = (error: Error) => {
  actionSendNotification("error", error.message);
};

export const appThemeAtom = atom({
  key: "ui/appTheme",
  default: true,
  effects_UNSTABLE: [userPersistAtom],
});
