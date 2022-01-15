import { createSlice } from '@reduxjs/toolkit';

export const accountSlice = createSlice({
  name: 'account',
  initialState: {
    pair: null,
    accounts: [],
    account: {
      address: '',
      name: '',
      balance: {
        hex: '',
        human: ''
      }
    }
  },
  reducers: {
    setAccount (state, { payload }) {
      console.log('====== set account', payload);
      const { address, name, balance } = payload;
      if (!address) return;

      const newAccount = { address, name, balance };
      const accounts = state.accounts.map(account => {
        if (account.address === address) {
          newAccount.address = address;
          newAccount.name = name || account.name;
          newAccount.balance = balance || account.balance;
          return newAccount;
        }
        return account;
      });
      if (!accounts.filter(account => account.address === address).length) {
        const newAccount = {
          address: address || state.account.address,
          name: name || state.account.name,
          balance: ''
        };
        newAccount.name = newAccount.name || state.account.name;
        newAccount.balance = newAccount.balance || state.account.balance;
        accounts.push(newAccount);
      }
      state.account = newAccount;
      state.accounts = accounts;
      console.log('set account slice', newAccount);
    },
    setPair (state, { payload }) {
      if (!payload) return;
      console.log('--- set pair', payload);
      state.pair = payload;
    }
  }
});
// 导出actions
export const { setAccount, setPair } = accountSlice.actions;
export default accountSlice.reducer;
