import { React, createRef } from 'react';
import { Container, Grid, Input, Form } from 'semantic-ui-react';

function Main () {
  const contextRef = createRef();
  return (
    <div ref={contextRef}>
      <Container>
        address
      </Container>
    </div>
  );
}

export default function App () {
  return (
    <Main />
  );
}
