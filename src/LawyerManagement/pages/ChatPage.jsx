import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { colors } from '../../AdminManagement/constants';
import { WelcomeBanner } from '../../AdminManagement/components/StyledComponents';
import { consultationsService } from '../services';

const ChatContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 200px)',
  backgroundColor: colors.lightBlack,
  borderRadius: '12px',
  border: `1px solid ${alpha(colors.gold, 0.1)}`,
  overflow: 'hidden',
});

const MessagesList = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

const MessageBubble = styled(Paper)(({ isOwn }) => ({
  maxWidth: '70%',
  padding: '12px 16px',
  backgroundColor: isOwn ? colors.gold : alpha(colors.white, 0.1),
  color: isOwn ? colors.black : colors.white,
  borderRadius: '16px',
  alignSelf: isOwn ? 'flex-end' : 'flex-start',
  wordWrap: 'break-word',
}));

const InputContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  padding: '16px',
  borderTop: `1px solid ${alpha(colors.gold, 0.1)}`,
  gap: '8px',
});

const StyledTextField = styled(TextField)({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    backgroundColor: alpha(colors.black, 0.5),
    color: colors.white,
    '& fieldset': {
      borderColor: alpha(colors.gold, 0.3),
    },
    '&:hover fieldset': {
      borderColor: alpha(colors.gold, 0.5),
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.gold,
    },
  },
  '& .MuiInputBase-input': {
    color: colors.white,
  },
});

const ConsultationItem = styled(Paper)({
  padding: '16px',
  marginBottom: '12px',
  backgroundColor: colors.lightBlack,
  border: `1px solid ${alpha(colors.gold, 0.1)}`,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: colors.gold,
    transform: 'translateY(-2px)',
  },
});

export default function ChatPage() {
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConsultations();
  }, []);

  useEffect(() => {
    if (selectedConsultation) {
      fetchMessages(selectedConsultation.id);
      // Auto-refresh messages every 5 seconds
      const interval = setInterval(() => {
        fetchMessages(selectedConsultation.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConsultation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const response = await consultationsService.getConsultations({ status: 'accepted' });
      const data = response.data?.data || response.data || [];
      setConsultations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch consultations:', error);
      setError('Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (consultationId) => {
    try {
      const response = await consultationsService.getMessages(consultationId);
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Failed to fetch messages:', error);
      }
      setMessages([]);
    }
  };

  const handleSelectConsultation = async (consultation) => {
    setSelectedConsultation(consultation);
    setMessages([]);
    await fetchMessages(consultation.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConsultation) return;

    try {
      setSendingMessage(true);
      setError('');
      await consultationsService.sendMessage(selectedConsultation.id, {
        message: newMessage.trim(),
      });
      setNewMessage('');
      await fetchMessages(selectedConsultation.id);
      setSuccess('Message sent successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box>
      <WelcomeBanner elevation={5}>
        <Typography variant="h4" fontWeight="bold">
          Chat
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#ccc', mt: 1 }}>
          Communicate with your clients
        </Typography>
      </WelcomeBanner>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        {/* Consultations List */}
        <Box sx={{ width: '300px', flexShrink: 0 }}>
          <Paper sx={{ p: 2, backgroundColor: colors.lightBlack, mb: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Active Consultations
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress sx={{ color: colors.gold }} />
              </Box>
            ) : consultations.length === 0 ? (
              <Typography variant="body2" sx={{ color: colors.textSecondary, textAlign: 'center', py: 4 }}>
                No active consultations
              </Typography>
            ) : (
              <Box>
                {consultations.map((consultation) => (
                  <ConsultationItem
                    key={consultation.id}
                    onClick={() => handleSelectConsultation(consultation)}
                    sx={{
                      backgroundColor:
                        selectedConsultation?.id === consultation.id ? alpha(colors.gold, 0.2) : colors.lightBlack,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Avatar sx={{ bgcolor: colors.gold, width: 40, height: 40 }}>
                        {consultation.client?.name?.[0] || 'C'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {consultation.client?.name || 'Client'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                          {consultation.subject || 'No subject'}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={consultation.status}
                      size="small"
                      sx={{
                        bgcolor: alpha(colors.gold, 0.2),
                        color: colors.gold,
                        fontSize: '0.7rem',
                      }}
                    />
                  </ConsultationItem>
                ))}
              </Box>
            )}
          </Paper>
        </Box>

        {/* Chat Area */}
        <Box sx={{ flex: 1 }}>
          {selectedConsultation ? (
            <ChatContainer>
              <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(colors.gold, 0.1)}` }}>
                <Typography variant="h6" fontWeight="bold">
                  {selectedConsultation.client?.name || 'Client'}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {selectedConsultation.subject || 'No subject'}
                </Typography>
              </Box>

              <MessagesList>
                {messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4, color: colors.textSecondary }}>
                    <Typography>No messages yet. Start the conversation!</Typography>
                  </Box>
                ) : (
                  messages.map((message) => (
                    <MessageBubble key={message.id} isOwn={message.sender_type === 'lawyer'}>
                      <Typography variant="body2">{message.message}</Typography>
                      {message.attachment && (
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label="Attachment"
                            size="small"
                            icon={<AttachFileIcon />}
                            sx={{ bgcolor: alpha(colors.black, 0.3) }}
                          />
                        </Box>
                      )}
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
                        {new Date(message.created_at).toLocaleTimeString()}
                      </Typography>
                    </MessageBubble>
                  ))
                )}
                <div ref={messagesEndRef} />
              </MessagesList>

              <InputContainer>
                <StyledTextField
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  multiline
                  maxRows={4}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  sx={{
                    bgcolor: colors.gold,
                    color: colors.black,
                    '&:hover': { bgcolor: colors.darkGold },
                    '&:disabled': { bgcolor: alpha(colors.gold, 0.3) },
                  }}
                >
                  {sendingMessage ? <CircularProgress size={20} /> : <SendIcon />}
                </IconButton>
              </InputContainer>
            </ChatContainer>
          ) : (
            <Paper
              sx={{
                p: 8,
                backgroundColor: colors.lightBlack,
                textAlign: 'center',
                border: `1px solid ${alpha(colors.gold, 0.1)}`,
              }}
            >
              <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 2 }}>
                Select a consultation to start chatting
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Choose a consultation from the list on the left
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}

