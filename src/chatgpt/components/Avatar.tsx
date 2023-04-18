import { SmartToy } from "@mui/icons-material";
import { Message, useChatStore } from "../store";
import { Emoji } from "./ui-lib";
import { getEmojiUrl } from "../utils";
import styles from './home.module.scss';

export default function Avatar(props: { role: Message['role'] }) {
  const config = useChatStore((state) => state.config);

  if (props.role !== 'user') {
    return <SmartToy className={styles['user-avtar']} />;
  }

  return (
    <div className={styles['user-avtar']}>
      <Emoji unified={config.avatar} size={18} getEmojiUrl={getEmojiUrl} />
    </div>
  );
}