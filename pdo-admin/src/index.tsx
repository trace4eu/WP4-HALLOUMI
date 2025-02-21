import { createRoot } from 'react-dom/client';

import { CssBaseline, ThemeProvider, StyledEngineProvider } from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import App from './App';
import './style.css';
import theme from './theme';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <StyledEngineProvider injectFirst>
          <App />
        </StyledEngineProvider>
      </CssBaseline>
    </ThemeProvider>
  );
} else {
  console.error('App not found');
}
