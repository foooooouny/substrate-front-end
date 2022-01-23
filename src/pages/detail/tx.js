import React, { useEffect, useState } from 'react';
import { Container, Statistic, Grid, Card, Icon, Tab } from 'semantic-ui-react';

import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import moment from 'moment';

import '@/styles/detail.scss';

function Main (props) {
  const param = useParams();
  const txHash = param.tx;
  const { api } = useSelector(state => state.config);
  const [txLoading, setTxLoading] = useState(true);
  const [txInfo, setTxInfo] = useState(null);
  const [txItems, setTxItems] = useState([]);
  const [txPanes, setTxPanes] = useState([]);

  useEffect(async () => {
    console.log('- txHash', txHash, api.rpc.eth, api.rpc)
  }, [txHash, api]);

  useEffect(() => {
    if (!txInfo) return

    const items = [
      {
        name: 'Transaction Hash：',
        text: txHash,
        desc: 'Block Height desc',
      },
      // {
      //   name: 'Timestamp：',
      //   text: `${date.fromNow()}（${date.utc()}）`,
      //   icon: 'time',
      //   desc: 'Block Height desc',
      // },
      // {
      //   name: 'Transactions：',
      //   text: extrinsics.map((ex, index) => (<Link key={index} to={ `/tx/${ex.hash.toHex()}` }>{ ex.hash.toHex() }</Link>)),
      //   desc: 'Block Height desc',
      // },
      // {
      //   name: 'Hash：',
      //   text: header.hash.toHex(),
      //   desc: 'Block Height desc',
      // },
      // {
      //   name: 'parentHash：',
      //   text: header.parentHash.toHex(),
      //   desc: 'Block Height desc',
      // },
    ];
    setTxLoading(false);
    setTxItems(items);
  }, [txInfo, setTxItems]);

  useEffect(() => {
    const panes = [{
      menuItem: 'Overview',
      render: () => {
        return (
          <Tab.Pane loading={txLoading} className="detail-overview">
            { txItems.map((item, index) => (
              (
                <Grid key={index} columns="equal">
                  <Grid.Column width={4} className="detail-item-name">{ item.name }</Grid.Column>
                  <Grid.Column className="detail-item-text">
                    <Icon name={item.icon} color='green' />
                    { item.text }
                  </Grid.Column>
                </Grid>
              )
            )) }
          </Tab.Pane>
        )
      }
    }];
    setTxPanes(panes);
  }, [txItems, setTxPanes]);

  return (
    <Container className="detail-box">
      <Grid verticalAlign="bottom">
        <Grid.Row>
          <h1 className="detail-h1">Transaction Details</h1>
        </Grid.Row>
      </Grid>
      <Tab defaultActiveIndex={0} menu={{ secondary: true, pointing: true }} panes={txPanes}></Tab>
    </Container>
  );
}

export default function TxDetail () {
  const { api } = useSelector(state => state.config);
  return api.rpc &&
    api.rpc.system &&
    api.rpc.system.chain &&
    api.rpc.system.name &&
    api.rpc.system.version
    ? <Main />
    : null;
}
