import { projectIdAtom } from "@/atoms/firestore";
import { actionAddPathExpander } from "@/atoms/firestore.action";
import { setRecoilExternalState } from "@/atoms/RecoilExternalStatePortal";
import { notifyErrorPromise } from "@/atoms/ui.action";
import DataSubscriber from "@/components/DataSubscriber";
import NavBar from "@/components/NavBar";
import ProductBar from "@/components/ProductBar";
import Property from "@/components/Property";
import QuoteLoading from "@/components/QuoteLoading";
import TreeView from "@/components/TreeView";
import URLSynchronizer from "@/components/URLSynchronizer";
import React, { ReactElement, useEffect, useMemo, useState } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import { useHistory, useParams } from "react-router-dom";
import AutoSizer from "react-virtualized-auto-sizer";
import Background from "../background";
import UniversalHotKey from "../hotkey";
import Main from "./main";

const ReactGridLayout = WidthProvider(RGL);

interface IMainLayoutProps {
  size: {
    width: number;
    height: number;
  };
}

const BASE_HEIGHT = 32;
const BASE_SPACE = 16;

function MainLayout({ size }: IMainLayoutProps): ReactElement {
  const history = useHistory();
  const { projectId } = useParams() as any;
  const [showLoading, setShowLoading] = useState(true);
  const layout = useMemo(() => {
    // remainHeight = Screen height - Nav height - Footer height
    const remainHeight = size.height - (BASE_HEIGHT + BASE_SPACE * 2) - 16;

    // Height = BASE_HEIGHT*x + (x-1)*BASE_SPACE = BASE_HEIGHT*x + BASE_SPACE*X - BASE_SPACE. It's MATH
    const remainSpace =
      (remainHeight - BASE_SPACE) / (BASE_HEIGHT + BASE_SPACE);
    return [
      { i: "nav-bar", x: 0, y: 0, w: 12, h: 1 },
      {
        i: "sidebar",
        x: 0,
        y: 0,
        w: 2,
        h: remainSpace - 1,
      },
      {
        i: "main",
        x: 2,
        y: 0,
        w: 7,
        h: remainSpace - 1,
      },
      {
        i: "property",
        x: 10,
        y: 0,
        w: 3,
        h: remainSpace - 1,
      },
    ];
  }, [size.height]);

  useEffect(() => {
    setRecoilExternalState(projectIdAtom, projectId);
    window
      .send("fs.init", { projectId })
      .then((response: string[]) => {
        console.log("Inited fs");
        actionAddPathExpander(response);
        window.api.renameTab(projectId);
      })
      .catch((error) => {
        history.replace({
          pathname: `/`,
          hash: "/",
        });
        notifyErrorPromise(error);
      });
  }, []);

  return (
    <div className="w-screen h-screen">
      {showLoading ? (
        <QuoteLoading onDone={() => setShowLoading(false)} />
      ) : (
        <>
          <div>
            <UniversalHotKey />
            <DataSubscriber />
            <URLSynchronizer />
            <ReactGridLayout
              className="transition-none layout"
              layout={layout}
              cols={12}
              rowHeight={BASE_HEIGHT}
              autoSize={true}
              margin={[BASE_SPACE, BASE_SPACE]}
              isDraggable={false}
              isResizable={false}
            >
              <div key="nav-bar" className="z-30">
                <NavBar />
              </div>
              <div key="sidebar">
                <TreeView />
              </div>
              <div key="main">
                <Main />
              </div>
              <div key="property">
                <Property />
              </div>
            </ReactGridLayout>
            <Background />
          </div>
          <div className="flex flex-row justify-end pr-3 mt-3 text-white transform translate-y-1 bg-gray-400 dark:bg-gray-900">
            <ProductBar />
          </div>
        </>
      )}
    </div>
  );
}

const MainWithSize = () => {
  return (
    <div className="w-screen h-screen bg-white dark:bg-gray-800 dark:text-gray-200">
      <AutoSizer>
        {({ height, width }) => <MainLayout size={{ width, height }} />}
      </AutoSizer>
    </div>
  );
};

export default MainWithSize;
