import React, { useEffect, useState } from 'react';
import { Container, Statistic, Grid, Card, Icon, Tab } from 'semantic-ui-react';

import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import moment from 'moment';

import '@/styles/detail.scss';

function Main () {
  const { api } = useSelector(state => state.config);
  const param = useParams();
  const blockNumber = param.block;
  const [blockHash, setBlockHash] = useState(null);
  const [blockLoading, setBlockLoading] = useState(true);
  const [blockInfo, setBlockInfo] = useState(null);
  const [blockItems, setBlockItems] = useState([]);
  const [blockPanes, setBlockPanes] = useState([]);

  useEffect(async () => {
    const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
    // returns SignedBlock
    const signedBlock = await api.rpc.chain.getBlock(blockHash);
    console.log('- signedBlock', signedBlock, signedBlock.block.header.hash, signedBlock.toHuman());
    const allRecords = await api.query.system.events.at(signedBlock.block.header.hash);
    console.log('- allRecords', allRecords.toHuman());
    signedBlock.block.extrinsics.forEach(({ method: { method, section, args } }, index) => {
      allRecords
        // filter the specific events based on the phase and then the
        // index of our extrinsic in the block
        .filter(({ phase }) =>
          phase.isApplyExtrinsic &&
          phase.asApplyExtrinsic.eq(index)
        )
        // test the events against the specific types we are looking for
        .forEach(({ event, phase, topics }) => {
          const extraInfo = {}
          if (api.events.system.ExtrinsicSuccess.is(event)) {
            // extract the data for this event
            // (In TS, because of the guard above, these will be typed)
            const [dispatchInfo] = event.data;
            extraInfo.type = 'success';
            extraInfo.data = dispatchInfo.toHuman();
            console.log('--- dispatchInfo.toHuman()', dispatchInfo.toHuman());
          } else if (api.events.system.ExtrinsicFailed.is(event)) {
            // extract the data for this event
            const [dispatchError] = event.data;
            extraInfo.type = 'faild';
    
            // decode the error
            if (dispatchError.isModule) {
              // for module errors, we have the section indexed, lookup
              // (For specific known errors, we can also do a check against the
              // api.errors.<module>.<ErrorName>.is(dispatchError.asModule) guard)
              const decoded = api.registry.findMetaError(dispatchError.asModule);
    
              extraInfo.data = `${decoded.section}.${decoded.name}`;
            } else {
              // Other, CannotLookup, BadOrigin, no extra info
              extraInfo.data = dispatchError.toString();
            }
          }
          console.log('- extraInfo', extraInfo)
        });
      })
    setBlockInfo(signedBlock);
    setBlockHash(blockHash);
  }, [blockNumber, setBlockInfo, setBlockHash, api]);

  useEffect(async () => {
    // the hash for the block, always via header (Hash -> toHex()) - will be
    // the same as blockHash above (also available on any header retrieved,
    // subscription or once-off)
    if (!blockInfo) return
    const { block } = blockInfo;
    // header.author 没有打包人信息
    const { header, extrinsics } = block;
    const timestampData = extrinsics.filter(item => item.method.section === 'timestamp')[0];
    const [timestamp] = timestampData.args;
    const date = moment(new Date(timestamp.toNumber()));

    const items = [
      {
        name: 'Block Height:',
        text: blockNumber,
        desc: 'Block Height desc',
      },
      {
        name: 'Timestamp:',
        text: `${date.fromNow()}（${date.utc()}）`,
        icon: 'time',
        desc: 'Block Height desc',
      },
      {
        name: 'Transactions:',
        text: extrinsics.map((ex, index) => (<Link key={index} to={ `/tx/${ex.hash.toHex()}` }>{ ex.hash.toHex() }</Link>)),
        desc: 'Block Height desc',
      },
      {
        name: 'Hash:',
        text: header.hash.toHex(),
        desc: 'Block Height desc',
      },
      {
        name: 'parentHash:',
        text: header.parentHash.toHex(),
        desc: 'Block Height desc',
      },
      {
        name: 'stateRoot:',
        text: header.stateRoot.toHex(),
        desc: 'Block Height desc',
      },
      {
        name: 'extrinsicsRoot:',
        text: header.extrinsicsRoot.toHex(),
        desc: 'Block Height desc',
      },
      // {
      //   name: 'Signer:',
      //   text: header.extrinsicsRoot.toHex(),
      //   desc: 'Block Height desc',
      // },
      // {
      //   name: 'nonce:',
      //   text: header.extrinsicsRoot.toHex(),
      //   desc: 'Block Height desc',
      // },
    ];
    setBlockLoading(false);
    setBlockItems(items);
  }, [blockInfo, setBlockItems]);

  useEffect(() => {
    const panes = [{
      menuItem: 'Overview',
      render: () => {
        return (
          <Tab.Pane loading={blockLoading} className="detail-overview">
            { blockItems.map((item, index) => (
              (
                <Grid key={index} columns="equal">
                  <Grid.Column width={4} className="block-item-name">{ item.name }</Grid.Column>
                  <Grid.Column className="block-item-text">
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
    setBlockPanes(panes);
  }, [blockItems, setBlockPanes]);

  return (
    <Container className="detail-box">
      <Grid verticalAlign="bottom">
        <Grid.Column>
          <h1 className="detail-h1">Block</h1>
        </Grid.Column>
        <Grid.Column width={8}>
          <h2 className="detail-h1-sub">#{ blockNumber }</h2>
        </Grid.Column>
      </Grid>
      <Tab defaultActiveIndex={0} menu={{ secondary: true, pointing: true }} panes={blockPanes}></Tab>
    </Container>
  );
}

export default function BlockDetail () {
  return <Main />
}
