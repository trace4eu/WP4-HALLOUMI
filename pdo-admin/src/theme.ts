import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { red } from '@mui/material/colors';

let theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      // main: '#002f67',
      main: '#1fb1e6',
      light: '#30839f', // Citizen ID color
      dark: '#00469a', // Diploma color
    },
    secondary: {
      main: '#19857b', // '#556cd6',
      light: '#4a8d44', // Self Issued Wallet Credential Certificate color
    },
    text: {
      secondary: 'orange',
    },
    error: {
      main: red.A400,
    },
  },

  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderColor: '#fff',
          // '&.label.Mui-shrink': {
          //   color: '#fff',
          // },
          '&.MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#fff',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#fff',
            },
            '&.Mui-focused label': {
              color: '#fff',
            },
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: '#fff',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.variant === 'h5' && {
            color: '#126A8A',
          }),
        }),
      },
    },

    MuiButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.variant === 'contained' && {
            color: '#fff',
            px: '20px',
            border: '1px solid rgba(31, 177, 230, 0.5)',
            '&:hover': {
              backgroundColor: '#126A8A',
              border: '1px solid rgba(31, 177, 230, 0.5)',
            },
          }),
          ...(ownerState.variant === 'outlined' && {
            border: '2px solid rgba(31, 177, 230, 0.5)',
            '&:hover': {
              border: '2px solid rgba(31, 177, 230, 0.5)',
            },
          }),
          fontSize: '1rem',
          letterSpacing: 0,
          borderRadius: '25px',
          width: '150px',
          '&:disabled': {
            backgroundColor: '#5d5858',
            borderColor: '#5d5858',
            // color: '#000000',
          },
        }),
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
