import { createSlice } from '@reduxjs/toolkit';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import queryString from 'query-string';

import config from '../../config';

const parsedQuery = queryString.parse(window.location.search);
const connectedSocket = parsedQuery.rpc || config.PROVIDER_SOCKET;
console.log(`Connected socket: ${connectedSocket}`);

export const configSlice = createSlice({
  name: 'config',
  initialState: {
    socket: connectedSocket,
    jsonrpc: { ...jsonrpc, ...config.RPC },
    keyring: null,
    keyringState: null,
    api: null,
    apiError: null,
    apiState: null
  },
  reducers: {
    CONNECT_INIT (state, { payload }) {
      state.apiState = 'CONNECT_INIT';
    },
    CONNECT (state, { payload }) {
      state.api = payload;
      state.apiState = 'CONNECTING';
    },
    CONNECT_SUCCESS (state, { payload }) {
      state.apiState = 'READY';
    },
    CONNECT_ERROR (state, { payload }) {
      state.apiError = payload;
      state.apiState = 'ERROR';
    },
    LOAD_KEYRING (state, { payload }) {
      state.keyringState = 'LOADING';
    },
    SET_KEYRING (state, { payload }) {
      state.keyring = payload;
      state.keyringState = 'READY';
    },
    KEYRING_ERROR (state, { payload }) {
      state.keyring = null;
      state.keyringState = 'ERROR';
    }
  }
});

// 导出actions
export const { CONNECT_INIT, CONNECT, CONNECT_SUCCESS, CONNECT_ERROR, LOAD_KEYRING, SET_KEYRING, KEYRING_ERROR } = configSlice.actions;
export default configSlice.reducer;
