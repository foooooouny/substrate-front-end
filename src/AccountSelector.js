import React, { useState, useEffect } from 'react';
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

import { useSelector, useDispatch } from 'react-redux';
import { setAccount, setPair } from './store/features/accountSlice';
import Logo from '@/assets/substrate-logo.png';

function Main (props) {
  const dispatch = useDispatch();
  const { account } = useSelector(state => state.account);
  // api apiError apiState jsonrpc keyring keyringState socket
  const { keyring, keyringState } = useSelector(state => state.config);
  const { address } = account;

  const accounts = keyring.getPairs().map(pair => ({
    address: pair.address,
    name: pair.meta.name
  }));

  // Get the list of accounts we possess the private key for
  const keyringOptions = accounts.map(item => ({
    key: item.address,
    value: item.address,
    text: item.name.toUpperCase(),
    icon: 'user'
  }));

  const { address: initialAddress, name: initialName } = accounts[0] || {};

  // Set the initial address
  useEffect(() => {
    dispatch(setAccount({ address: initialAddress, name: initialName }));
  }, [dispatch, initialAddress, initialName]);

  const setAccountAddress = address => {
    dispatch(setAccount(accounts.filter(item => item.address === address)[0]));
  };

  const setBalanceFunc = balance => {
    if (!balance) return;
    dispatch(setAccount({ address, balance: { human: balance.data.free.toHuman(), hex: balance.data.free.toHex() } }));
  };

  useEffect(() => {
    const pair = address &&
      keyringState === 'READY' &&
      keyring.getPair(address);
    dispatch(setPair(pair));
  }, [address, keyringState, keyring, dispatch]);

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
          <Image src={ Logo } size='mini' />
        </Menu.Menu>
        <Menu.Menu position='right' style={{ alignItems: 'center' }}>
          { !address
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
          <CopyToClipboard text={address}>
            <Button
              basic
              circular
              size='large'
              icon='user'
              color={address ? 'green' : 'red'}
            />
          </CopyToClipboard>
          <Dropdown
            search
            selection
            clearable
            placeholder='Select an account'
            options={keyringOptions}
            onChange={(_, dropdown) => {
              setAccountAddress(dropdown.value);
            }}
            value={address}
          />
          <BalanceAnnotation address={address} setBalanceMethod={setBalanceFunc}/>
        </Menu.Menu>
      </Container>
    </Menu>
  );
}

function BalanceAnnotation (props) {
  const { address: inputAddress, setBalanceMethod } = props;
  const [address, setAddress] = useState(inputAddress);
  const [balance, setBalance] = useState(0);
  const { api } = useSelector(state => state.config);

  useEffect(() => {
    setAddress(inputAddress);
  }, [inputAddress, setAddress]);

  // When account address changes, update subscriptions
  useEffect(() => {
    let unsubscribe;

    // If the user has selected an address, create a new subscription
    address &&
      api.query.system.account(address, balance => {
        setBalance(balance.data.free.toHuman());
        setBalanceMethod(balance);
      })
        .then(unsub => {
          unsubscribe = unsub;
        })
        .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api, address, setBalance]);

  return address
    ? <Label pointing='left'>
        <Icon name='money' color='green' />
        {balance}
      </Label>
    : null;
}

export default function AccountSelector (props) {
  const { api, keyring } = useSelector(state => state.config);
  return keyring.getPairs && api.query ? <Main {...props} /> : null;
}
