import { ThemeProvider } from '@mui/material/styles';
import { ThemeProviderProps } from '@mui/material/styles/ThemeProvider';
import { CssBaseline } from '@mui/material'

const RemoteThemeProvider:React.FC<{ children: JSX.Element; theme: ThemeProviderProps}> = ({ children, theme }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  )
}

export default RemoteThemeProvider;