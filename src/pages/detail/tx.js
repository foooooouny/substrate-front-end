import React, { createRef } from 'react';
import { Container } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

// import { SubstrateContextProvider, useSubstrate } from '@slib';
import { useSelector } from 'react-redux';
import { DeveloperConsole } from '@slib/components';

import Events from '@/Events';

function Main () {
  const { apiState, keyring, keyringState, apiError } = useSelector(state => state.config);

  const contextRef = createRef();

  return (
    <div ref={contextRef}>
      <Container>
        <Events />
        <div>detail</div>
        {}
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
