import { useState, useRef, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useDebouncedCallback } from 'use-debounce';
import clsx from 'clsx';

import { CircularProgress, IconButton, SwipeableDrawer, TextareaAutosize, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Download,
  ContentCopyOutlined,
  KeyboardReturnOutlined,
  Psychology,
  FileDownloadDoneRounded,
  SendRounded,
  Settings as SettingsIcon,
} from '@mui/icons-material';

import { Message, useChatStore, BOT_HELLO, createMessage } from '../store';
import { Prompt, usePromptStore } from '../store/prompt';
import { copyToClipboard, downloadAs, isMobileScreen, selectOrCopy, autoGrowTextArea } from '../utils';
import { useScrollToBottom, useSubmitHandler } from '../hooks';

// import { PromptHints } from './ui-lib';
import Avatar from './Avatar';
// import PromptToast from './PromptToast';
import { ControllerPool } from '../requests';
import Locale from '../locales';
import styles from './home.module.scss';
import { showModal } from './Modal';
import { useIsClient, useVisibilityInClient } from '@/utils/hooks';
import MouseOverPopover from '@/components/PopoverOnHover';
import Settings from './Setting';

const PromptToast = dynamic(async () => (await import('./PromptToast')).default, {
  loading: () => <CircularProgress />,
})

const PromptHints = dynamic(async () => ((await import('./ui-lib')).PromptHints), {
  loading: () => <CircularProgress />,
})

const Markdown = dynamic<{ markdownInput: string }>(() => import('main/markdown'), { suspense: false });

function exportMessages(messages: Message[], topic: string) {
  const mdText =
    `# ${topic}\n\n` +
    messages
      .map((m) => {
        return m.role === 'user'
          ? `## ${Locale.Export.MessageFromYou}:\n${m.content}`
          : `## ${Locale.Export.MessageFromChatGPT}:\n${m.content.trim()}`;
      })
      .join('\n\n');
  const filename = `${topic}.md`;

  showModal({
    title: Locale.Export.Title,
    children: (
      <div className="markdown-body">
        <pre className={styles['export-content']}>{mdText}</pre>
      </div>
    ),
    actions: [
      <MouseOverPopover content={Locale.Export.Copy} key={1}>
        <IconButton color="inherit" aria-label="copy" onClick={() => copyToClipboard(mdText)}>
          <ContentCopyOutlined />
        </IconButton>
      </MouseOverPopover>,
      <MouseOverPopover content={Locale.Export.Download} key={2}>
        <IconButton color="inherit" aria-label="download" onClick={() => downloadAs(mdText, filename)}>
          <Download />
        </IconButton>
      </MouseOverPopover>,
    ],
  });
}

export default function Chat(props: { showSideBar?: () => void; sideBarShowing?: boolean }) {
  type RenderMessage = Message & { preview?: boolean };

  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [state.currentSession(), state.currentSessionIndex]);
  const fontSize = useChatStore((state) => state.config.fontSize);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null)
  const [userInput, setUserInput] = useState('');
  const [beforeInput, setBeforeInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { submitKey, shouldSubmit } = useSubmitHandler();
  const { scrollRef, setAutoScroll } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(false);
  const [showSetting, setShowSetting] = useState(false);
  const isClient = useIsClient();
  const visibility = useVisibilityInClient();
  const theme = useTheme();

  const onChatBodyScroll = (e: HTMLElement) => {
    const isTouchBottom = e.scrollTop + e.clientHeight >= e.scrollHeight - 20;
    setHitBottom(isTouchBottom);
  };

  // prompt hints
  const promptStore = usePromptStore();
  const [promptHints, setPromptHints] = useState<Prompt[]>([]);
  const onSearch = useDebouncedCallback(
    (text: string) => {
      setPromptHints(promptStore.search(text));
    },
    100,
    { leading: true, trailing: true },
  );

  const onPromptSelect = (prompt: Prompt) => {
    setUserInput(prompt.content);
    setPromptHints([]);
    inputRef.current?.focus();
  };

  const scrollInput = () => {
    const dom = inputRef.current;
    if (!dom) return;
    const paddingBottomNum: number = parseInt(window.getComputedStyle(dom).paddingBottom, 10);
    dom.scrollTop = dom.scrollHeight - dom.offsetHeight + paddingBottomNum;
  };

  // auto grow input
  const [inputRows, setInputRows] = useState(2);
  const measure = useDebouncedCallback(
    () => {
      const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
      const inputRows = Math.min(5, Math.max(2 + Number(!isMobileScreen()), rows));
      setInputRows(inputRows);
    },
    100,
    {
      leading: true,
      trailing: true,
    },
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(measure, [userInput]);

  // only search prompts when user input is short
  const SEARCH_TEXT_LIMIT = 30;
  const onInput = (text: string) => {
    scrollInput();
    setUserInput(text);
    const n = text.trim().length;

    // clear search results
    if (n === 0) {
      setPromptHints([]);
    } else if (!chatStore.config.disablePromptHint && n < SEARCH_TEXT_LIMIT) {
      // check if need to trigger auto completion
      if (text.startsWith('/')) {
        let searchText = text.slice(1);
        onSearch(searchText);
      }
    }
  };

  // submit user input
  const onUserSubmit = () => {
    if (userInput.length <= 0) return;
    setIsLoading(true);
    chatStore.onUserInput(userInput).then(() => setIsLoading(false));
    setBeforeInput(userInput);
    setUserInput('');
    setPromptHints([]);
    if (!isMobileScreen()) inputRef.current?.focus();
    setAutoScroll(true);
  };

  // stop response
  const onUserStop = (messageId: number) => {
    ControllerPool.stop(sessionIndex, messageId);
  };

  // check if should send message
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if ArrowUp and no userInput
    if (e.key === 'ArrowUp' && userInput.length <= 0) {
      setUserInput(beforeInput);
      e.preventDefault();
      return;
    }
    if (shouldSubmit(e)) {
      onUserSubmit();
      e.preventDefault();
    }
  };
  const onRightClick = (e: any, message: Message) => {
    // auto fill user input
    if (message.role === 'user') {
      setUserInput(message.content);
    }

    // copy to clipboard
    if (selectOrCopy(e.currentTarget, message.content)) {
      e.preventDefault();
    }
  };

  const onResend = (botIndex: number) => {
    // find last user input message and resend
    for (let i = botIndex; i >= 0; i -= 1) {
      if (messages[i].role === 'user') {
        setIsLoading(true);
        chatStore.onUserInput(messages[i].content).then(() => setIsLoading(false));
        chatStore.updateCurrentSession((session) => session.messages.splice(i, 2));
        inputRef.current?.focus();
        return;
      }
    }
  };

  const config = useChatStore((state) => state.config);

  const context: RenderMessage[] = session.context.slice();

  if (context.length === 0 && session.messages.at(0)?.content !== BOT_HELLO.content && isClient) {
    context.push(BOT_HELLO);
  }

  // preview messages
  const messages = context
    .concat(session.messages as RenderMessage[])
    .concat(
      isLoading
        ? [
            {
              ...createMessage({
                role: 'assistant',
                content: '……',
              }),
              preview: true,
            },
          ]
        : [],
    )
    .concat(
      userInput.length > 0 && config.sendPreviewBubble
        ? [
            {
              ...createMessage({
                role: 'user',
                content: userInput,
              }),
              preview: true,
            },
          ]
        : [],
    );

  const [showPromptModal, setShowPromptModal] = useState(false);

  // Auto focus
  useEffect(() => {
    if (props.sideBarShowing && isMobileScreen()) return;
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={clsx(styles.chat, theme.palette.mode === 'dark' ? ' bg-slate-800' : 'white')} ref={chatRef} key={session.id}>
      <div className={styles['window-header']}>
        <div className={styles['window-header-title']}>
          <div
            className={`${styles['window-header-main-title']} ${styles['chat-body-title']}`}
            onClickCapture={() => {
              const newTopic = prompt(Locale.Chat.Rename, session.topic);
              if (newTopic && newTopic !== session.topic) {
                chatStore.updateCurrentSession((session) => (session.topic = newTopic!));
              }
            }}
          >
            {session.topic}
          </div>
          <div className={styles['window-header-sub-title']}>{Locale.Chat.SubTitle(isClient ? session.messages.length : 0)}</div>
        </div>
        <div className={styles['window-actions']}>
          <div className={styles['window-action-button'] + ' ' + styles.mobile}>
            <MouseOverPopover content={Locale.Chat.Actions.ChatList}>
              <IconButton color="inherit" aria-label="return" onClick={props?.showSideBar}>
                <KeyboardReturnOutlined />
              </IconButton>
            </MouseOverPopover>
          </div>
          <div className={styles['window-action-button']}>
            <MouseOverPopover content={Locale.Chat.Actions.CompressedHistory}>
              <IconButton color="inherit" aria-label="brain" onClick={() => setShowPromptModal(true)}>
                <Psychology />
              </IconButton>
            </MouseOverPopover>
          </div>
          <div className={styles['window-action-button']}>
            <MouseOverPopover content={Locale.Chat.Actions.Export}>
              <IconButton color="inherit"
                aria-label="brain"
                onClick={() =>
                  exportMessages(
                    session.messages.filter((msg) => !msg.isError),
                    session.topic,
                  )
                }
              >
                <FileDownloadDoneRounded />
              </IconButton>
            </MouseOverPopover>
          </div>
          <div className={styles['window-action-button']}>
          <Tooltip title={Locale.Settings.Title}>
            <IconButton color="inherit"
                aria-label="setting"
                onClick={() => setShowSetting(true)}
              >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          </div>
        </div>

        <Suspense fallback={<CircularProgress />}>
          <PromptToast showToast={!hitBottom} showModal={showPromptModal} setShowModal={setShowPromptModal} />
        </Suspense>
      </div>

      <div
        className={styles['chat-body']}
        ref={scrollRef}
        onScroll={(e) => onChatBodyScroll(e.currentTarget)}
        onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
        onTouchStart={() => {
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        {isClient && messages.map((message, i) => {
          const isUser = message.role === 'user';

          return (
            <div key={i} className={isUser ? styles['chat-message-user'] : styles['chat-message']}>
              <div className={styles['chat-message-container']}>
                <div className={styles['chat-message-avatar']}>
                  <Avatar role={message.role} />
                </div>
                {(message.preview || message.streaming) && (
                  <div className={styles['chat-message-status']}>{Locale.Chat.Typing}</div>
                )}
                <div className={styles['chat-message-item']}>
                  {!isUser && !(message.preview || message.content.length === 0) && (
                    <div className={styles['chat-message-top-actions']}>
                      {message.streaming ? (
                        <div className={styles['chat-message-top-action']} onClick={() => onUserStop(message.id ?? i)}>
                          {Locale.Chat.Actions.Stop}
                        </div>
                      ) : (
                        <div className={styles['chat-message-top-action']} onClick={() => onResend(i)}>
                          {Locale.Chat.Actions.Retry}
                        </div>
                      )}

                      <div
                        className={styles['chat-message-top-action']}
                        onClick={() => copyToClipboard(message.content)}
                      >
                        {Locale.Chat.Actions.Copy}
                      </div>
                    </div>
                  )}
                  {(message.preview || message.content.length === 0) && !isUser ? (
                    <CircularProgress />
                  ) : (
                    <div
                      className="markdown-body"
                      style={{ fontSize: `${fontSize}px` }}
                      onContextMenu={(e) => onRightClick(e, message)}
                      onDoubleClickCapture={() => {
                        if (!isMobileScreen()) return;
                        setUserInput(message.content);
                      }}
                    >
                      <Suspense fallback={<CircularProgress />}>
                        <Markdown markdownInput={message.content} />
                      </Suspense>
                    </div>
                  )}
                </div>
                {!isUser && !message.preview && (
                  <div className={styles['chat-message-actions']}>
                    <div className={styles['chat-message-action-date']} style={visibility}>
                      {message.date.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles['chat-input-panel']}>
        <PromptHints prompts={promptHints} onPromptSelect={onPromptSelect} />
        <div className={styles['chat-input-panel-inner']}>
          <TextareaAutosize
            // ref={inputRef}
            className={styles['chat-input']}
            placeholder={Locale.Chat.Input(submitKey)}
            onInput={(e) => onInput(e.currentTarget.value)}
            value={userInput}
            onKeyDown={onInputKeyDown}
            onFocus={() => setAutoScroll(true)}
            onBlur={() => {
              setAutoScroll(false);
              setTimeout(() => setPromptHints([]), 500);
            }}
            autoFocus={!props?.sideBarShowing}
            minRows={inputRows}
            maxRows={inputRows}
          />
          <MouseOverPopover content={Locale.Chat.Send}>
            <IconButton color="inherit" aria-label="send" onClick={onUserSubmit} className={styles['chat-input-send']}>
              <SendRounded />
            </IconButton>
          </MouseOverPopover>
        </div>
      </div>

      <SwipeableDrawer
        anchor="right"
        open={showSetting}
        onClose={() => setShowSetting(false)}
        onOpen={() => setShowSetting(true)}
        // swipeAreaWidth={drawerBleeding}
        // disableSwipeToOpen={false}
        ModalProps={{
          keepMounted: true,
          container: chatRef.current
        }}
      >
        <Settings closeSettings={() => setShowSetting(false)} />
      </SwipeableDrawer>
    </div>
  );
}
