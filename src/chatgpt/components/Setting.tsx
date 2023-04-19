import { useState, useEffect, useMemo } from 'react';

import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';

import styles from './settings.module.scss';

import { List, ListItem, Popover } from './ui-lib';

import {
  SubmitKey,
  useChatStore,
  ALL_MODELS,
  useUpdateStore,
  useAccessStore,
  ModalConfigValidator,
} from '../store';

import Locale, { AllLangs, changeLang, getLang } from '../locales';
import { getCurrentVersion, getEmojiUrl } from '../utils';
import { SearchService, usePromptStore } from '../store/prompt';
import { requestUsage } from '../requests';
import IconButton from '@mui/material/IconButton';
import { Close, DeleteForever, RestartAlt, Visibility, VisibilityOff } from '@mui/icons-material';
import { Slider, TextField, TextFieldProps } from '@mui/material';
import ErrorBoundary from '@/components/ErrorBoundary';
import MouseOverPopover from '@/components/PopoverOnHover';
import Avatar from './Avatar';

function SettingItem(props: { title: string; subTitle?: string; children: JSX.Element }) {
  return (
    <ListItem>
      <div className={styles['settings-title']}>
        <div>{props.title}</div>
        {props.subTitle && <div className={styles['settings-sub-title']}>{props.subTitle}</div>}
      </div>
      {props.children}
    </ListItem>
  );
}
function PasswordInput(props: TextFieldProps) {
  const [visible, setVisible] = useState(false);

  function changeVisibility() {
    setVisible(!visible);
  }

  return (
    <div className={styles['password-input']}>
      <IconButton aria-label="eye" onClick={changeVisibility} className={styles['password-eye']}>
        {visible ? <Visibility /> : <VisibilityOff />}
      </IconButton>
      <TextField {...props} type={visible ? 'text' : 'password'} />
    </div>
  );
}

export default function Settings(props: { closeSettings: () => void }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [config, updateConfig, resetConfig, clearAllData, clearSessions] = useChatStore((state) => [
    state.config,
    state.updateConfig,
    state.resetConfig,
    state.clearAllData,
    state.clearSessions,
  ]);

  const updateStore = useUpdateStore();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const currentId = getCurrentVersion();
  const remoteId = updateStore.remoteId;
  const hasNewVersion = currentId !== remoteId;

  function checkUpdate(force = false) {
    setCheckingUpdate(true);
    updateStore.getLatestCommitId(force).then(() => {
      setCheckingUpdate(false);
    });
  }

  const [usage, setUsage] = useState<{
    used?: number;
    subscription?: number;
  }>();
  const [loadingUsage, setLoadingUsage] = useState(false);
  function checkUsage() {
    setLoadingUsage(true);
    requestUsage()
      .then((res) => setUsage(res))
      .finally(() => {
        setLoadingUsage(false);
      });
  }

  const accessStore = useAccessStore();
  const enabledAccessControl = useMemo(
    () => accessStore.enabledAccessControl(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const promptStore = usePromptStore();
  const builtinCount = SearchService.count.builtin;
  const customCount = promptStore.prompts.size ?? 0;

  const showUsage = !!accessStore.token || !!accessStore.accessCode;

  useEffect(() => {
    checkUpdate();
    showUsage && checkUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const keydownEvent = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        props.closeSettings();
      }
    };
    document.addEventListener('keydown', keydownEvent);
    return () => {
      document.removeEventListener('keydown', keydownEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary>
      <>
        <div className={styles['window-header']}>
          <div className={styles['window-header-title']}>
            <div className={styles['window-header-main-title']}>{Locale.Settings.Title}</div>
            <div className={styles['window-header-sub-title']}>{Locale.Settings.SubTitle}</div>
          </div>
          <div className={styles['window-actions']}>
            <div className={styles['window-action-button']}>
              <MouseOverPopover content={Locale.Settings.Actions.ClearAll}>
                <IconButton
                  color="inherit"
                  aria-label="clear"
                  onClick={() => {
                    const confirmed = window.confirm(`${Locale.Settings.Actions.ConfirmClearAll.Confirm}`);
                    if (confirmed) {
                      clearSessions();
                    }
                  }}
                >
                  <DeleteForever />
                </IconButton>
              </MouseOverPopover>
            </div>
            <div className={styles['window-action-button']}>
              <MouseOverPopover content={Locale.Settings.Actions.ResetAll}>
                <IconButton
                  color="inherit"
                  aria-label="reset"
                  onClick={() => {
                    const confirmed = window.confirm(`${Locale.Settings.Actions.ConfirmResetAll.Confirm}`);
                    if (confirmed) {
                      resetConfig();
                    }
                  }}
                >
                  <RestartAlt />
                </IconButton>
              </MouseOverPopover>
            </div>
            <div className={styles['window-action-button']}>
              <MouseOverPopover content={Locale.Settings.Actions.Close}>
                <IconButton color="inherit" aria-label="close" onClick={props.closeSettings}>
                  <Close />
                </IconButton>
              </MouseOverPopover>
            </div>
          </div>
        </div>
        <div className={styles['settings']}>
          <List>
            <SettingItem title={Locale.Settings.Avatar}>
              <Popover
                onClose={() => setShowEmojiPicker(false)}
                content={
                  <EmojiPicker
                    lazyLoadEmojis
                    theme={EmojiTheme.AUTO}
                    getEmojiUrl={getEmojiUrl}
                    onEmojiClick={(e) => {
                      updateConfig((config) => (config.avatar = e.unified));
                      setShowEmojiPicker(false);
                    }}
                  />
                }
                open={showEmojiPicker}
              >
                <div className={styles.avatar} onClick={() => setShowEmojiPicker(true)}>
                  <Avatar role="user" />
                </div>
              </Popover>
            </SettingItem>

            {/* <SettingItem
              title={Locale.Settings.Update.Version(currentId)}
              subTitle={
                checkingUpdate
                  ? Locale.Settings.Update.IsChecking
                  : hasNewVersion
                  ? Locale.Settings.Update.FoundUpdate(remoteId ?? 'ERROR')
                  : Locale.Settings.Update.IsLatest
              }
            >
              {checkingUpdate ? (
                <div />
              ) : hasNewVersion ? (
                <Link href={UPDATE_URL} target="_blank" className="link">
                  {Locale.Settings.Update.GoToUpdate}
                </Link>
              ) : (
                <MouseOverPopover content={Locale.Settings.Update.CheckUpdate}>
                  <IconButton color="inherit" aria-label="reset" onClick={() => checkUpdate(true)}>
                    <RestartAlt />
                  </IconButton>
                </MouseOverPopover>
              )}
            </SettingItem> */}

            <SettingItem title={Locale.Settings.SendKey}>
              <select
                value={config.submitKey}
                onChange={(e) => {
                  updateConfig((config) => (config.submitKey = e.target.value as any as SubmitKey));
                }}
              >
                {Object.values(SubmitKey).map((v) => (
                  <option value={v} key={v}>
                    {v}
                  </option>
                ))}
              </select>
            </SettingItem>

            {/* <ListItem>
              <div className={styles['settings-title']}>{Locale.Settings.Theme}</div>
              <select
                value={config.theme}
                onChange={(e) => {
                  updateConfig((config) => (config.theme = e.target.value as any as Theme));
                }}
              >
                {Object.values(Theme).map((v) => (
                  <option value={v} key={v}>
                    {v}
                  </option>
                ))}
              </select>
            </ListItem> */}

            {/* <SettingItem title={Locale.Settings.Lang.Name}>
              <select
                value={getLang()}
                onChange={(e) => {
                  changeLang(e.target.value as any);
                }}
              >
                {AllLangs.map((lang) => (
                  <option value={lang} key={lang}>
                    {Locale.Settings.Lang.Options[lang]}
                  </option>
                ))}
              </select>
            </SettingItem> */}

            {/* <SettingItem
            title={Locale.Settings.FontSize.Title}
            subTitle={Locale.Settings.FontSize.SubTitle}
          >
            <InputRange
              title={`${config.fontSize ?? 14}px`}
              value={config.fontSize}
              min="12"
              max="18"
              step="1"
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.fontSize = Number.parseInt(e.currentTarget.value)),
                )
              }
            ></InputRange>
          </SettingItem> */}

            {/* <SettingItem title={Locale.Settings.TightBorder}>
              <input
                type="checkbox"
                checked={config.tightBorder}
                onChange={(e) => updateConfig((config) => (config.tightBorder = e.currentTarget.checked))}
              ></input>
            </SettingItem> */}

            <SettingItem title={Locale.Settings.SendPreviewBubble}>
              <input
                type="checkbox"
                checked={config.sendPreviewBubble}
                onChange={(e) => updateConfig((config) => (config.sendPreviewBubble = e.currentTarget.checked))}
              ></input>
            </SettingItem>
          </List>
          {/* <List>
            <SettingItem
              title={Locale.Settings.Prompt.Disable.Title}
              subTitle={Locale.Settings.Prompt.Disable.SubTitle}
            >
              <input
                type="checkbox"
                checked={config.disablePromptHint}
                onChange={(e) => updateConfig((config) => (config.disablePromptHint = e.currentTarget.checked))}
              ></input>
            </SettingItem>

            <SettingItem
              title={Locale.Settings.Prompt.List}
              subTitle={Locale.Settings.Prompt.ListCount(builtinCount, customCount)}
            >
              <MouseOverPopover content={Locale.Settings.Prompt.Edit}>
                <IconButton color="inherit" aria-label="reset" onClick={() => showToast(Locale.WIP)}>
                  <Edit />
                </IconButton>
              </MouseOverPopover>
            </SettingItem>
          </List> */}
          <List>
            {enabledAccessControl ? (
              <SettingItem title={Locale.Settings.AccessCode.Title} subTitle={Locale.Settings.AccessCode.SubTitle}>
                <PasswordInput
                  value={accessStore.accessCode}
                  type="text"
                  placeholder={Locale.Settings.AccessCode.Placeholder}
                  onChange={(e) => {
                    accessStore.updateCode(e.currentTarget.value);
                  }}
                />
              </SettingItem>
            ) : (
              <></>
            )}

            <SettingItem title={Locale.Settings.Token.Title} subTitle={Locale.Settings.Token.SubTitle}>
              <PasswordInput
                value={accessStore.token}
                type="text"
                placeholder={Locale.Settings.Token.Placeholder}
                onChange={(e) => {
                  accessStore.updateToken(e.currentTarget.value);
                }}
              />
            </SettingItem>

            <SettingItem
              title={Locale.Settings.Usage.Title}
              subTitle={
                showUsage
                  ? loadingUsage
                    ? Locale.Settings.Usage.IsChecking
                    : Locale.Settings.Usage.SubTitle(usage?.used ?? '[?]', usage?.subscription ?? '[?]')
                  : Locale.Settings.Usage.NoAccess
              }
            >
              {!showUsage || loadingUsage ? (
                <div />
              ) : (
                <MouseOverPopover content={Locale.Settings.Usage.Check}>
                  <IconButton color="inherit" aria-label="reset" onClick={checkUsage}>
                    <RestartAlt />
                  </IconButton>
                </MouseOverPopover>
              )}
            </SettingItem>

            {/* <SettingItem
            title={Locale.Settings.HistoryCount.Title}
            subTitle={Locale.Settings.HistoryCount.SubTitle}
          >
            <InputRange
              title={config.historyMessageCount.toString()}
              value={config.historyMessageCount}
              min="0"
              max="25"
              step="1"
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.historyMessageCount = e.target.valueAsNumber),
                )
              }
            ></InputRange>
          </SettingItem> */}

            <SettingItem
              title={Locale.Settings.CompressThreshold.Title}
              subTitle={Locale.Settings.CompressThreshold.SubTitle}
            >
              <input
                type="number"
                min={500}
                max={4000}
                value={config.compressMessageLengthThreshold}
                onChange={(e) =>
                  updateConfig((config) => (config.compressMessageLengthThreshold = e.currentTarget.valueAsNumber))
                }
              ></input>
            </SettingItem>
          </List>

          <List>
            <SettingItem title={Locale.Settings.Model}>
              <select
                value={config.modelConfig.model}
                onChange={(e) => {
                  updateConfig(
                    (config) => (config.modelConfig.model = ModalConfigValidator.model(e.currentTarget.value)),
                  );
                }}
              >
                {ALL_MODELS.map((v) => (
                  <option value={v.name} key={v.name} disabled={!v.available}>
                    {v.name}
                  </option>
                ))}
              </select>
            </SettingItem>
            <SettingItem title={Locale.Settings.Temperature.Title} subTitle={Locale.Settings.Temperature.SubTitle}>
              <Slider
                value={Number(config.modelConfig.temperature?.toFixed(1))}
                min={0}
                max={2}
                step={0.1}
                onChange={(e, newVal) => {
                  updateConfig(
                    (config) => (config.modelConfig.temperature = ModalConfigValidator.temperature(newVal as number)),
                  );
                }}
                sx={{ width: 120}}
              />
            </SettingItem>
            <SettingItem title={Locale.Settings.MaxTokens.Title} subTitle={Locale.Settings.MaxTokens.SubTitle}>
              <input
                type="number"
                min={100}
                max={32000}
                value={config.modelConfig.max_tokens}
                onChange={(e) =>
                  updateConfig(
                    (config) =>
                      (config.modelConfig.max_tokens = ModalConfigValidator.max_tokens(e.currentTarget.valueAsNumber)),
                  )
                }
              ></input>
            </SettingItem>
            <SettingItem
              title={Locale.Settings.PresencePenlty.Title}
              subTitle={Locale.Settings.PresencePenlty.SubTitle}
            >
              <Slider
                value={Number(config.modelConfig.presence_penalty?.toFixed(1))}
                min={-2}
                max={2}
                step={0.5}
                onChange={(e, newVal) => {
                  updateConfig(
                    (config) =>
                      (config.modelConfig.presence_penalty = ModalConfigValidator.presence_penalty(newVal as number)),
                  );
                }}
                sx={{ width: 120}}
              />
            </SettingItem>
          </List>
        </div>
      </>
    </ErrorBoundary>
  );
}
