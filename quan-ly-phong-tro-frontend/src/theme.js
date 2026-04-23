import { alpha, createTheme } from '@mui/material/styles'

const primaryMain = '#1e5eff'
const primaryDark = '#1747bf'
const backgroundDefault = '#f4f7ff'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primaryMain,
      dark: primaryDark,
    },
    secondary: {
      main: '#7c4dff',
    },
    success: {
      main: '#149954',
    },
    warning: {
      main: '#d58a00',
    },
    error: {
      main: '#d82f49',
    },
    background: {
      default: backgroundDefault,
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    divider: '#dce4f6',
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h3: { fontWeight: 800, letterSpacing: '-0.02em' },
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button: {
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: backgroundDefault,
          backgroundImage:
            'radial-gradient(circle at 0% 0%, rgba(30,94,255,0.09) 0, rgba(30,94,255,0) 45%), radial-gradient(circle at 100% 0%, rgba(124,77,255,0.08) 0, rgba(124,77,255,0) 38%)',
          minHeight: '100vh',
        },
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: 'xl',
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #e2e8f5',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #e2e8f5',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
          transition: 'transform .18s ease, box-shadow .18s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 36px rgba(15, 23, 42, 0.08)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 14,
        },
        contained: {
          boxShadow: '0 8px 18px rgba(30, 94, 255, .25)',
          '&:hover': {
            boxShadow: '0 10px 22px rgba(30, 94, 255, .32)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#fff',
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: primaryMain,
            borderWidth: 2,
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f6f9ff',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: '#334155',
          fontWeight: 700,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 4,
          backgroundColor: primaryMain,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          minHeight: 44,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&:hover': {
            backgroundColor: alpha(primaryMain, 0.08),
          },
        },
      },
    },
  },
})

export default theme
