import clsx from 'clsx';
import styles from './home.module.scss';
import { Add, Close, GitHub } from '@mui/icons-material';
import { ChatList } from './chat-list';
import { IconButton, Tooltip, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChatGptIcon from 'public/chatgpt.svg'
import { REPO_URL } from '../constant';
import { useChatStore } from '../store';
import Locale from '../locales';

export default function Sidebar() {
  const [createNewSession, currentIndex, removeSession] = useChatStore((state) => [
    state.newSession,
    state.currentSessionIndex,
    state.removeSession,
  ]);
  const chatStore = useChatStore();
  const theme = useTheme();
  return (
    <Paper
      className={clsx(styles.sidebar, styles['sidebar-show'])}
      sx={theme => ({ backgroundColor: theme.palette.secondary.main})}
    >
      <div className={styles['sidebar-header']}>
        <div className={styles['sidebar-title']}>ChatGPT Next</div>
        <div className={styles['sidebar-sub-title']}>Build your own AI assistant.</div>
        <div className={styles['sidebar-logo']}>
          <ChatGptIcon />
        </div>
      </div>

      <div
        className={styles['sidebar-body']}
        onClick={() => {
          // setOpenSettings(false);
          // setShowSideBar(false);
        }}
      >
        <ChatList />
      </div>

      <div className={styles['sidebar-tail']}>
        <div className={styles['sidebar-actions']}>
          <div className={styles['sidebar-action'] + ' ' + styles.mobile}>
            <IconButton onClick={chatStore.deleteSession}>
              <Close />
            </IconButton>
          </div>
          {/* <div className={styles["sidebar-action"]}>
              <IconButton
                icon={<SettingsIcon />}
                onClick={() => {
                  setOpenSettings(true);
                  setShowSideBar(false);
                }}
                shadow
              />
            </div> */}
          <div className={styles['sidebar-action']}>
            <a href={REPO_URL} target="_blank">
              <IconButton>
                <GitHub />
              </IconButton>
            </a>
          </div>
        </div>
        <div>
          <Tooltip title={Locale.Home.NewChat}>
            <IconButton
              onClick={() => {
                createNewSession();
                // setShowSideBar(false);
              }}
            >
              <Add />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </Paper>
  );
}
