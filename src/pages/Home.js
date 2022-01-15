import React, { createRef, useState } from 'react';
import { Container, Grid, Input, Form } from 'semantic-ui-react';

// import { SubstrateContextProvider } from '../substrate-lib';
import { DeveloperConsole } from '../substrate-lib/components';

import Balances from '../Balances';
import BlockNumber from '../BlockNumber';
import Metadata from '../Metadata';
import NodeInfo from '../NodeInfo';
import Events from '../Events';
import Transfer from '../Transfer';

import '../styles/home.scss';

function Main () {
  const [inputText, setInputText] = useState('');

  const contextRef = createRef();

  const searchByInput = (e) => {
    console.log('--- searchByInput', e, inputText);
    if (inputText.indexOf('0x') !== -1) {
      this.context.router.push(`/tx/${inputText}`);
      return
    }
    this.context.router.push(`/hash/${inputText}`);
  };

  const inputChange = (e) => {
    console.log('-- input change');
    setInputText(e.target.value);
  };
  console.log('======= inputText', inputText);
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
                      icon='search'
                      fluid
                      size='big'
                      placeholder='Search by Address / Tx / Block'
                      value={inputText}
                      onChange={inputChange} />
                  </Form.Field>
                </Form>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Grid.Row stretched>
            <NodeInfo />
            <Metadata />
            <BlockNumber />
            {/* <BlockNumber finalized /> */}
          </Grid.Row>
          <Grid.Row stretched>
            <Events />
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
