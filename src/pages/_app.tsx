import '@/styles/globals.css'
import '@/chatgpt/styles/common.scss'
import type { AppProps } from 'next/app'
import { ColorContext } from '@/context/ColorContext'
import { useEffect, useMemo, useState } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, PaletteMode } from '@mui/material'
import { lightTheme } from '@/styles/theme/light'
import { darkTheme } from '@/styles/theme/theme'

const THEME_MODE = 'theme-mode';

export default function App({ Component, pageProps }: AppProps) {
  const [mode, setMode] = useState<PaletteMode>('light')
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode: PaletteMode) => {
          const mode = prevMode === 'light' ? 'dark' : 'light';

          const bodyClasses = document.body.classList
          mode === 'dark'
            ? bodyClasses.add('dark')
            : bodyClasses.remove('dark')
          
          localStorage.setItem(THEME_MODE, mode)
          return mode;
        });
      },
    }),
    [],
  );

  useEffect(() => {
    setMode(localStorage.getItem(THEME_MODE) as PaletteMode || 'light')
  }, [])

  const theme = useMemo(() => createTheme(mode === 'light' ? lightTheme : darkTheme), [mode]);
  return (
    <ColorContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <Component {...pageProps} />
      </ThemeProvider>
    </ColorContext.Provider>
  )
}
