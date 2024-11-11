import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux/es/exports';
import {CssBaseline, ThemeProvider, StyledEngineProvider} from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import App from './components/App';
import WalletModel from './models/WalletModel';
import {store} from './features/store';
import './components/style.css';
import theme from './theme';
import ApiService from './features/api/apiService';

export const walletModel = new WalletModel();
export const apiService = new ApiService(walletModel);

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline>
          <StyledEngineProvider injectFirst>
            <App walletModel={walletModel} />
          </StyledEngineProvider>
        </CssBaseline>
      </ThemeProvider>
    </Provider>
  );
} else {
  console.error('App not found');
}
