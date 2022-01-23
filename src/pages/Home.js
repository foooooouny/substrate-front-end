import React, { createRef, useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Grid, Input, Form, Icon, Transition, Card } from 'semantic-ui-react';

// import { SubstrateContextProvider } from '../substrate-lib';
import { DeveloperConsole } from '@sub-lib/components';
import { isHex } from '@polkadot/util';
import moment from 'moment';

import { useSelector } from 'react-redux';

import Balances from '@/Balances';
import BlockNumber from '@/BlockNumber';
import Metadata from '@/Metadata';
import NodeInfo from '@/NodeInfo';
import Transfer from '@/Transfer';

import '@/styles/home.scss';

function BlockFeedCards (props) {
  const { list } = props;
  return (
    list.map(item => {
      const { block } = item;
      // header.author 没有打包人信息
      const { header, extrinsics } = block;
      const blockNumber = header.number.toNumber();
      const timestampData = extrinsics.filter(item => item.method.section === 'timestamp')[0];
      const [timestamp] = timestampData.args;
      const date = moment(new Date(timestamp.toNumber()));
      return (
        <Transition key={blockNumber} visible={true} animation='scale' duration={500}>
          <Card fluid color="blue">
            <Card.Content>
              <Card.Header>Block <Link to={`/block/${blockNumber}`}>#{ blockNumber }</Link></Card.Header>
              {/* <Card.Meta>
                <span className='date'>Joined in 2015</span>
              </Card.Meta> */}
              <Card.Description>
                <Icon name='clock' color="grey" />{ date.fromNow() }
              </Card.Description>
            </Card.Content>
          </Card>
        </Transition>
      );
    })
  );
}

function TransationFeedCards (props) {
  const { list } = props;
  return (
    list.map((tx, index) => {
      const date = moment();
      return (
        <Transition key={tx.blockNumber} visible={true} animation='scale' duration={500}>
          <Card fluid color="green">
            <Card.Content>
              <Card.Header>Tx <Link to={`/tx/${tx.hash}`}>#{ tx.hash }</Link></Card.Header>
              {/* <Card.Meta>
                <span className='date'>Joined in 2015</span>
              </Card.Meta> */}
              <Card.Description>
                <Icon name='clock' color="grey" />{ date.fromNow() }
              </Card.Description>
            </Card.Content>
          </Card>
        </Transition>
      );
    })
  );
}

function Main () {
  const { api } = useSelector(state => state.config);
  const [inputText, setInputText] = useState('');
  const [blockList, setBlockList] = useState([]);
  const [txList, setTxList] = useState([]);
  const naviate = useNavigate();

  const contextRef = createRef();

  const searchByInput = (e) => {
    if (!isHex(inputText) && !isNaN(Number(inputText))) {
      naviate(`/block/${inputText}`);
      return;
    }
    if (!isHex(inputText)) return;
    if (inputText.indexOf('0x') !== -1 && inputText.length === 66) {
      naviate(`/tx/${inputText}`);
      return;
    }
    if (inputText.length === 48) {
      naviate(`/address/${inputText}`);
    }
  };

  const inputChange = (e) => {
    setInputText(e.target.value || '');
  };

  const initList = useCallback(async (number) => {
    const list = [];
    for (let i = 0; i <= 19; i++) {
      // api.rpc.eth.getBlockByNumber()
      const block = await api.rpc.chain.getBlock(await api.rpc.chain.getBlockHash(number - i));
      list.push(block);
    }
    return list;
  });

  useEffect(() => {
    // 监听block
    api.derive.chain.subscribeNewHeads(async (block) => {
      const newBlock = await api.rpc.chain.getBlock(await api.rpc.chain.getBlockHash(block.number.toNumber()));
      if (!blockList.length) {
        setBlockList(await initList(newBlock.block.header.number.toNumber()));
        return
      }
      setBlockList(oldArray => {
        oldArray.splice(0, 1);
        return [...oldArray, newBlock];
      });
    });
  }, [setBlockList, api.derive, api.rpc]);

  useEffect(() => {
    const _txlist = [];
    for (const block of blockList) {
      const _txs = block.block.extrinsics.map(ex => ({
        hash: ex.hash.toHex(),
        blockNumber: block.block.header.number.toNumber()
      }));
      _txlist.push(..._txs);
    }
    setTxList(() => [..._txlist.slice(_txlist.length - 20, _txlist.length)]);
  }, [blockList]);

  return (
    <div ref={contextRef}>
      <Container>
        <Grid stackable columns='equal'>
          <Grid container className="home-head">
            <Grid.Row centered columns={2}>
              <Grid.Column>
                <Form onSubmit={searchByInput}>
                  <Form.Field>
                    <label>Blockchain Explorer</label>
                    <Input
                      type="text"
                      icon="search"
                      fluid
                      size="big"
                      placeholder="Search by Address / Tx / Block"
                      defaultValue={ inputText ?? '' }
                      onChange={inputChange} />
                  </Form.Field>
                </Form>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Grid.Row stretched>
            <NodeInfo />
            <Metadata />
            <BlockNumber finalized />
          </Grid.Row>
          <Grid.Row stretched columns={2}>
            <Grid.Column>
              <h3 className="tit-h3">Lastest Blocks:</h3>
              <BlockFeedCards list={blockList} />
            </Grid.Column>
            <Grid.Column>
              <h3 className="tit-h3">Latest Transactions</h3>
              <TransationFeedCards list={txList} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row stretched>
            <Balances />
          </Grid.Row>
          <Grid.Row stretched>
            <Transfer/>
          </Grid.Row>
        </Grid>
      </Container>
      <DeveloperConsole />
    </div>
  );
}

export default function App () {
  return (
    // <SubstrateContextProvider>
    <Main />
    // </SubstrateContextProvider>
  );
}
