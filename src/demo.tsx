//@ts-nocheck
import React, { useState } from 'react';
import 'antd/dist/antd.css';
import './index.css';
import { Tree } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import { BasicDataNode } from 'rc-tree';
const { TreeNode } = Tree;

const x = 3;
const y = 2;
const z = 1;
const defaultData: DataNode[] = [];

const generateData = (
  _level: number,
  _preKey?: React.Key,
  _tns?: DataNode[]
) => {
  const preKey = _preKey || 'Folder';
  const tns = _tns || defaultData;

  const children = [];
  for (let i = 0; i < x; i++) {
    const key = `${preKey}-${i}`;
    tns.push({ title: key, key });
    if (i < y) {
      children.push(key);
    }
  }
  if (_level < 0) {
    return tns;
  }
  const level = _level - 1;
  children.forEach((key, index) => {
    tns[index].children = [];
    return generateData(level, key, tns[index].children);
  });
};
generateData(z);
console.log('Default Data: ', defaultData);

const App: React.FC = () => {
  const [gData, setGData] = useState(defaultData);
  const [expandedKeys, setExpandedKeys] = useState(['0-0', '0-0-0', '0-0-0-0']);

  const onDragEnter: TreeProps['onDragEnter'] = (info) => {
    console.log(`OnDragEnter: `, info);
    // expandedKeys
    //setExpandedKeys(info.expandedKeys)
    //console.log('Expanded keys: ', info.expandedKeys);
  };

  const onDrop: TreeProps['onDrop'] = (info) => {
    console.log(`OnDrag-Drop: `, info);
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition =
      info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const loop = (
      data: DataNode[],
      key: React.Key,
      callback: (node: DataNode, i: number, data: DataNode[]) => void
    ) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          loop(data[i].children!, key, callback);
        }
      }
    };
    const data = [...gData];

    // Find dragObject
    let dragObj: DataNode;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        // where to insert when expanded
        item.children.unshift(dragObj);
      });
      //console.log('Dragged obg?', dragObj);
    } else if (
      ((info.node as any).props.children || []).length > 0 && // Has children
      (info.node as any).props.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        // where to insert
        item.children.unshift(dragObj);
      });
    } else {
      let ar: DataNode[] = [];
      let i: number;
      loop(data, dropKey, (_item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i!, 0, dragObj!);
      } else {
        ar.splice(i! + 1, 0, dragObj!);
      }
      //console.log('Dragged obg?', dragObj);
    }
    setGData(data);
  };

  const renderNodeTree = (gData: DataNode[]) => {
    return gData;
  };

  const customTreeNode: (BasicDataNode & DataNode)[] = gData.map((obj) => ({
    checkable: true,
    disabled: false,
    disableCheckbox: false,
    key: obj.key,
    title: obj.title,
  }));
  customTreeNode.push({
    disabled: true,
    key: 'Personal',
    title: 'Personal',
    style: { backgroundColor: 'cyan' },
  });
  customTreeNode.push(
    ...gData
      .filter((obj) => obj.title.includes('0-1'))
      .map((obj) => ({
        key: obj.key,
        title: obj.title,
        style: { backgroundColor: 'yellow' },
      }))
  );
  console.log('New data: ', gData);
  return (
    <>
      <Tree
        className="draggable-tree"
        defaultExpandedKeys={expandedKeys}
        draggable
        blockNode
        onDragEnter={onDragEnter}
        onDrop={onDrop}
        treeData={renderNodeTree(gData)}
        // treeData={customTreeNode}
      />

      {/* {gData.length ? (
        <Tree
          defaultExpandedKeys={expandedKeys}
          draggable
          onDragEnter={onDragEnter}
          onDrop={onDrop}
        >
          <TreeNode
            disabled={true}
            key="Team"
            title="Team"
            style={{ backgroundColor: 'yellow' }}
          />
          {gData.map((obj) => (
            <TreeNode key={obj.key} title={obj.title} />
          ))}
          <TreeNode
            disabled={true}
            key="Personal"
            title="Personal"
            style={{ backgroundColor: 'yellow' }}
          />
          {gData
            .filter((obj) => obj.title.includes('0-1'))
            .map((obj) => (
              <TreeNode key={obj.key} title={obj.title} />
            ))}
        </Tree>
      ) : (
        <></>
      )} */}
    </>
  );
};

export default App;
