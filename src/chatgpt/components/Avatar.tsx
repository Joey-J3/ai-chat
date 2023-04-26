import { SmartToy, SmartToyOutlined } from '@mui/icons-material';
import { Box } from '@mui/material';
import { Message, useChatStore } from '../store';
import { Emoji } from './ui-lib';
import { getEmojiUrl } from '../utils';

export default function Avatar(props: { role: Message['role'] }) {
  const config = useChatStore((state) => state.config);

  return (
    <Box
      sx={(theme) => ({
        width: 30,
        height: 30,
        borderRadius: theme.shape.borderRadius,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: theme.shadows[1],
        ...(props.role !== 'user'
          ? { bgcolor: theme.palette.secondary.light, color: theme.palette.primary.light }
          : {}),
      })}
    >
      {props.role !== 'user' ? (
        <SmartToyOutlined />
      ) : (
        <Emoji unified={config.avatar} size={18} getEmojiUrl={getEmojiUrl} />
      )}
    </Box>
  );
}
