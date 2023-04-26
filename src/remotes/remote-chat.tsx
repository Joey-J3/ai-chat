import { ThemeProviderProps } from "@mui/material/styles/ThemeProvider";
import RemoteThemeProvider from "./remote-theme-provider";
import Chat from "@/chatgpt/components/Chat";

export default function RemoteChat({ theme }: { theme: ThemeProviderProps}) {
  return (
    <RemoteThemeProvider theme={theme}>
      <Chat />
    </RemoteThemeProvider>
  )
}