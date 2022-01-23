import React, { useEffect, useState } from 'react';
import { Card, Icon, Grid } from 'semantic-ui-react';

// import { useSubstrate } from './substrate-lib';
import { useSelector } from 'react-redux';

function Main (props) {
  const { api, socket } = useSelector(state => state.config);
  const [nodeInfo, setNodeInfo] = useState({});

  useEffect(() => {
    const getInfo = async () => {
      try {
        console.log('-- api.rpc.system', api.rpc.system);
        const [chain, nodeName, nodeVersion] = await Promise.all([
          api.rpc.system.chain(),
          api.rpc.system.name(),
          api.rpc.system.version()
        ]);
        setNodeInfo({ chain, nodeName, nodeVersion });
      } catch (e) {
        console.error(e);
      }
    };
    getInfo();
  }, [api.rpc.system]);

  return (
    <Grid.Column>
      <Card>
        <Card.Content>
          <Card.Header>{nodeInfo.nodeName}</Card.Header>
          <Card.Meta>
            <span>{nodeInfo.chain}</span>
          </Card.Meta>
          <Card.Description>{socket}</Card.Description>
        </Card.Content>
        <Card.Content extra>
          <Icon name='setting' />{nodeInfo.nodeVersion}
        </Card.Content>
      </Card>
    </Grid.Column>
  );
}

export default function NodeInfo (props) {
  const { api } = useSelector(state => state.config);
  return api.rpc &&
    api.rpc.system &&
    api.rpc.system.chain &&
    api.rpc.system.name &&
    api.rpc.system.version
    ? <Main {...props} />
    : null;
}
