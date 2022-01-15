import React, { useEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import {
  Menu,
  Button,
  Dropdown,
  Container,
  Icon,
  Image,
  Label
} from 'semantic-ui-react';

// import { useSubstrate } from './substrate-lib';
import { useSelector, useDispatch } from 'react-redux';
import { setAccount, setBalance } from './store/features/accountSlice';

function Main (props) {
  console.log('------ account main');
  const { account, balance } = useSelector((state) => state.account);
  const dispatch = useDispatch();
  // api apiError apiState jsonrpc keyring keyringState socket
  const { keyring } = useSelector(state => state.config);

  const accounts = keyring.getPairs().map(account => ({
    address: account.address,
    name: account.meta.name
  }));

  // Get the list of accounts we possess the private key for
  const keyringOptions = accounts.map(account => ({
    key: account.address,
    value: account.address,
    text: account.name.toUpperCase(),
    icon: 'user'
  }));

  // Set the initial address
  useEffect(() => {
    dispatch(setAccount(accounts[0]));
  });

  const onChange = address => {
    dispatch(setAccount(accounts.filter(item => item.address === address)[0]));
  };

  return (
    <Menu
      attached='top'
      tabular
      style={{
        backgroundColor: '#fff',
        borderColor: '#fff',
        paddingTop: '1em',
        paddingBottom: '1em'
      }}
    >
      <Container>
        <Menu.Menu>
          <Image src={`${process.env.PUBLIC_URL}/assets/substrate-logo.png`} size='mini' />
        </Menu.Menu>
        <Menu.Menu position='right' style={{ alignItems: 'center' }}>
          { !account.address
            ? <span>
              Add your account with the{' '}
              <a
                target='_blank'
                rel='noopener noreferrer'
                href='https://github.com/polkadot-js/extension'
              >
                Polkadot JS Extension
              </a>
            </span>
            : null }
          <CopyToClipboard text={account.address}>
            <Button
              basic
              circular
              size='large'
              icon='user'
              color={account.address ? 'green' : 'red'}
            />
          </CopyToClipboard>
          <Dropdown
            search
            selection
            clearable
            placeholder='Select an account'
            options={keyringOptions}
            onChange={(_, dropdown) => {
              onChange(dropdown.value);
            }}
            value={account.address}
          />
          <BalanceAnnotation address={account.address} balance={balance} />
        </Menu.Menu>
      </Container>
    </Menu>
  );
}

function BalanceAnnotation (props) {
  const { address, balance } = props;
  const { api } = useSelector(state => state.config);
  const dispatch = useDispatch();

  // When account address changes, update subscriptions
  useEffect(() => {
    let unsubscribe;

    // If the user has selected an address, create a new subscription
    address &&
      api.query.system.account(address, balance => {
        dispatch(setBalance({ hex: balance.data.free.toHex(), human: balance.data.free.toHuman() }));
      })
        .then(unsub => {
          unsubscribe = unsub;
        })
        .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api, address]);

  return address
    ? <Label pointing='left'>
        <Icon name='money' color='green' />
        {balance.human}
      </Label>
    : null;
}

export default function AccountSelector (props) {
  const { api, keyring } = useSelector(state => state.config);
  return keyring.getPairs && api.query ? <Main {...props} /> : null;
}
