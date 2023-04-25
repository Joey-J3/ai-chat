import {
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  TextField,
  Fab,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Message, ROLES, useChatStore } from '../store';
import chatStyle from './chat.module.scss';
import { Add, ContentCopyOutlined, Delete, Psychology, RestartAlt } from '@mui/icons-material';
import { copyToClipboard } from '../utils';
import Locale from '../locales';
import { useIsClient } from '@/utils/hooks';

export default function PromptToast(props: {
  showToast?: boolean;
  showModal: boolean;
  setShowModal: (_: boolean) => void;
}) {
  const isClient = useIsClient();
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const context = session.context;

  const addContextPrompt = (prompt: Message) => {
    chatStore.updateCurrentSession((session) => {
      session.context.push(prompt);
    });
  };

  const removeContextPrompt = (i: number) => {
    chatStore.updateCurrentSession((session) => {
      session.context.splice(i, 1);
    });
  };

  const updateContextPrompt = (i: number, prompt: Message) => {
    chatStore.updateCurrentSession((session) => {
      session.context[i] = prompt;
    });
  };

  return (
    <div className={chatStyle['prompt-toast']} key="prompt-toast">
      {props.showToast && (
        <Fab variant="extended" className={chatStyle['prompt-toast-inner']} onClick={() => props.setShowModal(true)}>
          <Psychology sx={{ mr: 1 }} />
          {Locale.Context.Toast(isClient ? context.length : 0)}
        </Fab>
      )}
      <Dialog open={props.showModal} onClose={() => props.setShowModal(false)} fullWidth={true} maxWidth="sm">
        <DialogTitle>{Locale.Context.Edit}</DialogTitle>
        <DialogContent>
          <>
            <div className={chatStyle['context-prompt']}>
              {context.map((c, i) => (
                <div className={chatStyle['context-prompt-row']} key={i}>
                  <Select
                    value={c.role}
                    onChange={(e) =>
                      updateContextPrompt(i, {
                        ...c,
                        role: e.target.value as any,
                      })
                    }
                    className={chatStyle['context-role']}
                  >
                    {ROLES.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </Select>
                  <TextField
                    value={c.content}
                    rows={1}
                    onChange={(e) =>
                      updateContextPrompt(i, {
                        ...c,
                        content: e.currentTarget.value as any,
                      })
                    }
                    className={chatStyle['context-content']}
                  />
                  <IconButton
                    aria-label="copy"
                    onClick={() => removeContextPrompt(i)}
                    className={chatStyle['context-delete-button']}
                  >
                    <Delete />
                    {/* <span>{Locale.Memory.Copy}</span> */}
                  </IconButton>
                </div>
              ))}

              <div className={chatStyle['context-prompt-row']}>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() =>
                    addContextPrompt({
                      role: 'system',
                      content: '',
                      date: '',
                    })
                  }
                  className={chatStyle['context-prompt-button']}
                >
                  Add
                </Button>
              </div>
            </div>
            <div className={chatStyle['memory-prompt']}>
              <div className={chatStyle['memory-prompt-title']}>
                <span>
                  {Locale.Memory.Title} ({session.lastSummarizeIndex} of {session.messages.length})
                </span>

                <FormControlLabel
                  value="send"
                  control={<Checkbox checked={session.sendMemory} onChange={() =>
                    chatStore.updateCurrentSession((session) => (session.sendMemory = !session.sendMemory))
                  } />}
                  label={Locale.Memory.Send}
                  labelPlacement="start"
                  sx={{ '	.MuiFormControlLabel-label': { fontSize: '12px' }}}
                />
              </div>
              <div className={chatStyle['memory-prompt-content']}>
                {session.memoryPrompt || Locale.Memory.EmptyContent}
              </div>
            </div>
          </>
        </DialogContent>
        <DialogActions>
          <IconButton
            aria-label="reset"
            onClick={() => confirm(Locale.Memory.ResetConfirm) && chatStore.resetSession()}
          >
            <RestartAlt />
          </IconButton>
          <IconButton aria-label="copy" onClick={() => copyToClipboard(session.memoryPrompt)}>
            <ContentCopyOutlined />
          </IconButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
