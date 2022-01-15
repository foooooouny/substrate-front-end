import React, { createRef } from 'react';
import { Dimmer, Loader, Grid, Sticky, Message } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import { DeveloperConsole } from './substrate-lib/components';

import AccountSelector from './AccountSelector';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Main () {
  const { apiState, keyringState, apiError } = useSelector(state => state.config);

  const loader = text =>
    <Dimmer active>
      <Loader size='small'>{text}</Loader>
    </Dimmer>;

  const message = err =>
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message negative compact floating
          header='Error Connecting to Substrate'
          content={`${JSON.stringify(err, null, 4)}`}
        />
      </Grid.Column>
    </Grid>;

  if (apiState === 'ERROR') return message(apiError);
  else if (apiState !== 'READY') return loader('Connecting to Substrate');

  if (keyringState !== 'READY') {
    return loader('Loading accounts (please review any extension\'s authorization)');
  }

  const contextRef = createRef();

  return (
    <div ref={contextRef}>
      <Sticky context={contextRef}>
        <AccountSelector/>
      </Sticky>
      <Outlet />
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
