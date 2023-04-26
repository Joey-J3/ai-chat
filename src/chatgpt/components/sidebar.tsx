import clsx from 'clsx';
import styles from './home.module.scss';
import { Add, Close, DeleteForever, GitHub } from '@mui/icons-material';
import { ChatList } from './chat-list';
import { IconButton, Tooltip, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatGptIcon from 'public/chatgpt.svg'
import { REPO_URL } from '../constant';
import { useChatStore } from '../store';
import Locale from '../locales';

const StyledPaper = styled(Paper)(({theme}) => ({
  backgroundColor: theme.palette.secondary.main,
  width: '300px',
  [theme.breakpoints.down('sm')]: {
    width: '100%'
  },
}))

const CloseDiv = styled('div')(({theme}) => ({
  display: 'block',
  [theme.breakpoints.up('sm')]: {
    display: 'none',
  },
}))

export default function Sidebar() {
  const [createNewSession, currentIndex, removeSession, showSidebar, setShowSidebar] = useChatStore((state) => [
    state.newSession,
    state.currentSessionIndex,
    state.removeSession,
    state.showSidebar,
    state.setShowSidebar,
  ]);
  const chatStore = useChatStore();
  return (
    <StyledPaper
      className={clsx(styles.sidebar, showSidebar && styles['sidebar-show'])}
    >
      <div className={styles['sidebar-header']}>
        <div className={styles['sidebar-header-left']}>
          <div className={styles['sidebar-title']}>ChatGPT Next</div>
          <div className={styles['sidebar-sub-title']}>Build your own AI assistant.</div>
        </div>

        <div className={styles['sidebar-header-right']}>
          <ChatGptIcon />
          <CloseDiv>
            <IconButton aria-label='close' onClick={() => setShowSidebar(false)}>
              <Close />
            </IconButton>
          </CloseDiv>
        </div>
      </div>

      <div
        className={styles['sidebar-body']}
        onClick={() => {
          setShowSidebar(false);
        }}
      >
        <ChatList />
      </div>

      <div className={styles['sidebar-tail']}>
        <div className={styles['sidebar-actions']}>
          <div className={styles['sidebar-action'] + ' ' + styles.mobile}>
            <IconButton onClick={chatStore.deleteSession}>
              <DeleteForever />
            </IconButton>
          </div>
          {/* <div className={styles["sidebar-action"]}>
              <IconButton
                icon={<SettingsIcon />}
                onClick={() => {
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
                setShowSidebar(false);
              }}
            >
              <Add />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </StyledPaper>
  );
}
