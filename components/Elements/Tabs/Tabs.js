import React, { useState, useEffect } from "react";
import Tab from "./Tab";
import Content from "./Content";

const Tabs = ({ children, value, onTabChange }) => {
  const [tabs, setTabs] = useState([]);
  const [contentList, setContentList] = useState([]);

  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    setSelectedTab(value || 0);
  }, [value]);

  useEffect(() => {
    let tabsVar = [];
    let contentListVar = [];

    React.Children.forEach(children, (child) => {
      if (child.type.displayName === "Tab") {
        setTabs([...tabs, { ...child }]);
        tabsVar.push({ ...child });
      } else if (child.type.displayName === "Content") {
        setContentList([...contentList, { ...child }]);
        contentListVar.push({ ...child });
      }
    });

    tabsVar.forEach((item, index) => {
      if (tabsVar[index]) tabsVar[index].key = index;
      if (contentListVar[index]) contentListVar[index].key = index;
    });
    setTabs(tabsVar);
    setContentList(contentListVar);
  }, [children]);

  return (
    <div>
      <div className="flex border-b border-black/20">
        {tabs?.map((tab) => (
          <Tab
            key={tab.key}
            onClick={() => {
              setSelectedTab(tab.key);
              onTabChange(tab.key);
            }}
            active={tab.key === selectedTab}
          >
            {tab.props.children}
          </Tab>
        ))}
      </div>
      {contentList?.map((content) => (
        <Content key={content.key} active={content.key === selectedTab}>
          {content.props.children}
        </Content>
      ))}
    </div>
  );
};

export default Tabs;
export { Tab, Content };
