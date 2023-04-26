import { Palette, ThemeOptions } from "@mui/material";
import { orange } from "@mui/material/colors";

declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
    palette: Palette;
  }

  interface PaletteColor {
    darker?: string;
  }
  interface SimplePaletteColorOptions {
    darker?: string;
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}

export const darkTheme: ThemeOptions = {
  status: {
    danger: orange[500],
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#0ea5ea',
          ":hover": {
            backgroundColor: '#0bd1d1'
          }
        },
        textPrimary: {
          color: "#fff",
          fontWeight: 'bold'
        },
        outlinedPrimary: {
          borderColor: '#0ea5ea',
          backgroundColor: '#fff',
          ":hover": {
            borderColor: '#0bd1d1',
            backgroundColor: 'rgba(11, 209, 209)'
          }
        }
      }
    }
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#607d8b'
    },
    secondary: {
      main: '#0a101d'
    },
    text: {
      primary: 'rgba(148, 169, 201, 1)',
      secondary: 'rgba(148, 169, 201, 0.7)',
      disabled: 'rgba(148, 169, 201, 0.5)',
    },
    background: {
      paper: '#0f172a',
      default: '#0f172a'
    }
  }
}