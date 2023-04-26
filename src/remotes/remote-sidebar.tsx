import { ThemeProviderProps } from "@mui/material/styles/ThemeProvider";
import RemoteThemeProvider from "./remote-theme-provider";
import Sidebar from "@/chatgpt/components/sidebar";

export default function RemoteSidebar({ theme }: { theme: ThemeProviderProps}) {
  return (
    <RemoteThemeProvider theme={theme}>
      <Sidebar />
    </RemoteThemeProvider>
  )
}