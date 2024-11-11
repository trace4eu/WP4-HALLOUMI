import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    primary: {
      main: "#31576F", // Primary button, navigation bars
    },
    secondary: {
      main: "#FFAD2D", // Filler color for lines, sections
    },
    text: {
      primary: "#272525", // Headings, body text
      secondary: "#474545", // Filler color for lines, sections
      disabled: "#6D6E70", // Hint text
    },
    action: {
      active: "#272525", // Active link color
      hover: "#D0D1D3", // General hover color // "#254355", // Main button hover
      selected: "#ffdd00", // Button active
      disabled: "#A6A8AA", // Secondary button hover
      focus: "#FFDD00", // Input focus
    },
    error: {
      main: "#D4351C", // Danger, warning button
      dark: "#AA1D13", // Warning button hover
    },
    success: {
      main: "#00703C", // Success state color
      dark: "#274E13", // Success button hover
    },
    info: {
      main: "#487D93", // Informational messages
    },
    divider: "#BBBCBF", // Default border state color
  },
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#1D70B8", // Default link color
          "&:hover": {
            color: "#003078", // Link hover color
          },
          "&:visited": {
            color: "#4C2C92", // Visited link color
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "8px 12px",
          borderRadius: "4px",
          fontWeight: 400,
          fontSize: "16px",
          textTransform: "capitalize",
          marginBottom: "1.5rem",
          width: "fit-content",
          minWidth: "100px",
        },
        containedPrimary: {
          backgroundColor: "#31576F",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#254355",
          },
        },
        containedSecondary: {
          backgroundColor: "#D0D1D3",
          color: "#272525",
          "&:hover": {
            backgroundColor: "#A6A8AA",
          },
        },
        containedError: {
          backgroundColor: "#D4351C",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#AA1D13",
          },
        },
        containedSuccess: {
          backgroundColor: "#00703C",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#274E13",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "grey",
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          "& .MuiToolbar-root.MuiTablePagination-toolbar": {
            "& .MuiTablePagination-actions": {
              marginBottom: "25px",
            },
          },
          "& .MuiInputBase-root": {
            // "& .MuiTablePagination-select": {
            marginBottom: "22px",
            // },
          },
        },
      },
    },
  },
});

export default theme;
