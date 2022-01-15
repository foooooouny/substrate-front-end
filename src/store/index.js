import { configureStore } from '@reduxjs/toolkit';
import accountSlice from './features/accountSlice';
import configSlice from './features/configSlice';
// configureStore创建一个redux数据
export default configureStore({
  reducer: {
    config: configSlice,
    account: accountSlice
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
});
