import { SmartToy } from '@mui/icons-material';
import { Message, useChatStore } from '../store';
import { Emoji } from './ui-lib';
import { getEmojiUrl } from '../utils';
import { Box } from '@mui/material';

export default function Avatar(props: { role: Message['role'] }) {
  const config = useChatStore((state) => state.config);

  return (
    <Box sx={theme => ({ border: '1px solid grey', width: 30, height: 30, borderRadius: theme.shape.borderRadius, display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: theme.shadows[1] })}>
      {props.role !== 'user' ? <SmartToy /> : <Emoji unified={config.avatar} size={18} getEmojiUrl={getEmojiUrl} />}
    </Box>
  );
}
