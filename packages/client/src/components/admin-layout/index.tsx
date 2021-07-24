import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Button,
  Spin,
  Layout,
  PageHeader,
  Modal,
  Menu,
  Collapse,
  Dropdown,
} from 'antd';
import isEmpty from 'lodash/isEmpty';
import {
  Link,
  useLocation,
  useRouteMatch,
  useHistory,
  Redirect,
} from 'react-router-dom';
import {
  CollectionContextProvider,
  PageTitleContextProvider,
  SchemaRenderer,
  SwithDesignableContextProvider,
  usePageTitleContext,
  useSwithDesignableContext,
} from '../../schemas';
import { useRequest } from 'ahooks';
import './style.less';

import { uid } from '@formily/shared';
import { ISchema } from '@formily/react';
import Database from './datatable';
import { HighlightOutlined } from '@ant-design/icons';
import { useCookieState } from 'ahooks';
import cls from 'classnames';

function DesignableToggle() {
  const { designable, setDesignable } = useSwithDesignableContext();
  return (
    <Button
      className={cls('nb-designable-toggle', { active: designable })}
      type={'primary'}
      style={{ height: 46, border: 0 }}
      onClick={() => {
        setDesignable(!designable);
      }}
    >
      <HighlightOutlined />
    </Button>
  );
}

function LayoutWithMenu({ schema }) {
  const match = useRouteMatch<any>();
  const location = useLocation();
  const sideMenuRef = useRef();
  const [activeKey, setActiveKey] = useState(match.params.name);
  const [, setPageTitle] = usePageTitleContext();
  const onSelect = (info) => {
    console.log('LayoutWithMenu', info);
    if (!info.schema) {
      setActiveKey(null);
    } else if (info.schema['x-component'] === 'Menu.SubMenu') {
      // 实际应该取第一个子元素
      setActiveKey(null);
    } else {
      setActiveKey(info.schema.key);
      if (info.schema.title) {
        setPageTitle(info.schema.title);
      }
    }
  };
  console.log({ match });
  return (
    <Layout>
      <Layout.Header style={{ display: 'flex' }}>
        <SchemaRenderer
          schema={schema}
          scope={{
            sideMenuRef,
            onSelect,
            selectedKeys: [activeKey].filter(Boolean),
          }}
        />
        <Database />
        <DesignableToggle />
      </Layout.Header>
      <Layout>
        <Layout.Sider
          ref={sideMenuRef}
          theme={'light'}
          width={200}
        ></Layout.Sider>
        <Layout.Content style={{ minHeight: 'calc(100vh - 46px)' }}>
          {activeKey && <Content activeKey={activeKey} />}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}

function Content({ activeKey }) {
  const { data = {}, loading } = useRequest(
    `ui_schemas:getTree?filter[parentKey]=${activeKey}`,
    {
      refreshDeps: [activeKey],
      formatResult: (result) => result?.data,
    },
  );

  if (loading) {
    return <Spin />;
  }

  return <SchemaRenderer schema={data} />;
}

export function AdminLayout({ route }: any) {
  const { data = {}, loading } = useRequest(
    `ui_schemas:getTree/${route.uiSchemaKey}`,
    {
      refreshDeps: [route],
      formatResult: (result) => result?.data,
    },
  );

  if (loading) {
    return <Spin />;
  }

  return (
    <SwithDesignableContextProvider>
      <CollectionContextProvider>
        <PageTitleContextProvider>
          <LayoutWithMenu schema={data} />
        </PageTitleContextProvider>
      </CollectionContextProvider>
    </SwithDesignableContextProvider>
  );
}

export default AdminLayout;