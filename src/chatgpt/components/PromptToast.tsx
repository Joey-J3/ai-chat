import { IconButton } from "@mui/material";
import { Message, ROLES, useChatStore } from "../store";
import chatStyle from './chat.module.scss'
import { Add, ContentCopyOutlined, Delete, Psychology } from "@mui/icons-material";
import { copyToClipboard } from "../utils";
import Locale from '../locales';
import Modal from "./Modal";
import { Input } from "./Input";

export default function PromptToast(props: { showToast?: boolean; showModal?: boolean; setShowModal: (_: boolean) => void }) {
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
        <div
          className={chatStyle['prompt-toast-inner'] + ' clickable'}
          role="button"
          onClick={() => props.setShowModal(true)}
        >
          <Psychology />
          <span className={chatStyle['prompt-toast-content']}>{Locale.Context.Toast(context.length)}</span>
        </div>
      )}
      {props.showModal && (
        <div className="modal-mask">
          <Modal
            title={Locale.Context.Edit}
            onClose={() => props.setShowModal(false)}
            actions={[
              <IconButton
                aria-label="reset"
                onClick={() => confirm(Locale.Memory.ResetConfirm) && chatStore.resetSession()}
              >
                <ContentCopyOutlined />
                {/* <span>{Locale.Memory.Reset}</span> */}
              </IconButton>,
              <IconButton aria-label="copy" onClick={() => copyToClipboard(session.memoryPrompt)}>
                <ContentCopyOutlined />
                {/* <span>{Locale.Memory.Copy}</span> */}
              </IconButton>,
            ]}
          >
            <>
              <div className={chatStyle['context-prompt']}>
                {context.map((c, i) => (
                  <div className={chatStyle['context-prompt-row']} key={i}>
                    <select
                      value={c.role}
                      className={chatStyle['context-role']}
                      onChange={(e) =>
                        updateContextPrompt(i, {
                          ...c,
                          role: e.target.value as any,
                        })
                      }
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <Input
                      value={c.content}
                      type="text"
                      className={chatStyle['context-content']}
                      rows={1}
                      onInput={(e) =>
                        updateContextPrompt(i, {
                          ...c,
                          content: e.currentTarget.value as any,
                        })
                      }
                    />
                    <IconButton
                      aria-label="copy"
                      onClick={() => removeContextPrompt(i)}
                      className={chatStyle['context-delete-button']}
                    >
                      <Delete />
                      {/* <span>{Locale.Memory.Copy}</span> */}
                    </IconButton>
                    ,
                  </div>
                ))}

                <div className={chatStyle['context-prompt-row']}>
                  <IconButton
                    aria-label="add"
                    onClick={() =>
                      addContextPrompt({
                        role: 'system',
                        content: '',
                        date: '',
                      })
                    }
                    className={chatStyle['context-prompt-button']}
                  >
                    <Add />
                    {/* <span>{Locale.Context.Add}</span> */}
                  </IconButton>
                </div>
              </div>
              <div className={chatStyle['memory-prompt']}>
                <div className={chatStyle['memory-prompt-title']}>
                  <span>
                    {Locale.Memory.Title} ({session.lastSummarizeIndex} of {session.messages.length})
                  </span>

                  <label className={chatStyle['memory-prompt-action']}>
                    {Locale.Memory.Send}
                    <input
                      type="checkbox"
                      checked={session.sendMemory}
                      onChange={() =>
                        chatStore.updateCurrentSession((session) => (session.sendMemory = !session.sendMemory))
                      }
                    ></input>
                  </label>
                </div>
                <div className={chatStyle['memory-prompt-content']}>
                  {session.memoryPrompt || Locale.Memory.EmptyContent}
                </div>
              </div>
            </>
          </Modal>
        </div>
      )}
    </div>
  );
}