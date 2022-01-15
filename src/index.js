import React from 'react';
import ReactDOM from 'react-dom';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import App from './App';
import Home from './pages/Home';
// import TxDetail from './pages/detail/tx';
import store from './store';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { CONNECT_INIT, CONNECT, CONNECT_SUCCESS, CONNECT_ERROR, LOAD_KEYRING, SET_KEYRING, KEYRING_ERROR } from './store/features/configSlice';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import keyring from '@polkadot/ui-keyring';
import config from './config';

function Main () {
  const dispatch = useDispatch();
  const configState = useSelector(state => state.config);

  const connect = (state, dispatch) => {
    const { apiState, socket, jsonrpc } = state;
    // We only want this function to be performed once
    if (apiState) return;

    dispatch(CONNECT_INIT());

    const provider = new WsProvider(socket);
    const _api = new ApiPromise({ provider, rpc: jsonrpc });

    // Set listeners for disconnection and reconnection event.
    _api.on('connected', () => {
      dispatch(CONNECT(_api));
      // `ready` event is not emitted upon reconnection and is checked explicitly here.
      _api.isReady.then((_api) => dispatch(CONNECT_SUCCESS()));
    });
    _api.on('ready', () => dispatch(CONNECT_SUCCESS()));
    _api.on('error', err => dispatch(CONNECT_ERROR(err)));
  };

  let loadAccts = false;
  const loadAccounts = (state, dispatch) => {
    const asyncLoadAccounts = async () => {
      dispatch(LOAD_KEYRING());
      try {
        await web3Enable(config.APP_NAME);
        let allAccounts = await web3Accounts();
        allAccounts = allAccounts.map(({ address, meta }) =>
          ({ address, meta: { ...meta, name: `${meta.name} (${meta.source})` } }));
        console.log('--- allAccounts', allAccounts);
        keyring.loadAll({ isDevelopment: config.DEVELOPMENT_KEYRING }, allAccounts);
        dispatch(SET_KEYRING(keyring));
      } catch (e) {
        console.error(e);
        dispatch(KEYRING_ERROR());
      }
    };

    const { keyringState } = state;
    // If `keyringState` is not null `asyncLoadAccounts` is running.
    if (keyringState) return;
    // If `loadAccts` is true, the `asyncLoadAccounts` has been run once.
    if (loadAccts) return dispatch({ type: 'SET_KEYRING', payload: keyring });

    // This is the heavy duty work
    loadAccts = true;
    asyncLoadAccounts();
  };

  connect(configState, dispatch);
  loadAccounts(configState, dispatch);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          {/* <Route path="tx/:blockNumber" element={<TxDetail />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.render((
  <Provider store={store}>
    <Main/>
  </Provider>
), document.getElementById('root'));
