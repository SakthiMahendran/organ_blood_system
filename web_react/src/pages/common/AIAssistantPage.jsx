import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import { useToast } from '../../contexts/ToastContext';
import { aiService } from '../../services/aiService';
import { getErrorMessage } from '../../utils/errorUtils';

const AIAssistantPage = () => {
  const { showToast } = useToast();

  const [message, setMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      text: 'Hello. I can help with eligibility, emergency workflow, AI matching, notifications, and analytics interpretation.',
    },
  ]);
  const [quickQuestions, setQuickQuestions] = useState([]);

  const [source, setSource] = useState('camera-upload');
  const [detectFile, setDetectFile] = useState(null);
  const [detectLoading, setDetectLoading] = useState(false);
  const [detectResult, setDetectResult] = useState(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await aiService.getChatbotQuestions();
        setQuickQuestions(Array.isArray(data?.questions) ? data.questions : []);
      } catch {
        setQuickQuestions([]);
      }
    };

    loadQuestions();
  }, []);

  useEffect(() => {
    const chatElement = chatContainerRef.current;
    if (!chatElement) {
      return;
    }

    // Scroll only inside chat container; avoid moving the whole page.
    chatElement.scrollTop = chatElement.scrollHeight;
  }, [chatHistory, chatLoading]);

  const askAssistant = async (inputValue) => {
    const prompt = (inputValue ?? message).trim();
    if (!prompt) {
      showToast('Enter a question for AI assistant.', 'warning');
      return;
    }

    setChatHistory((prev) => [...prev, { role: 'user', text: prompt }]);
    setMessage('');
    setChatLoading(true);

    try {
      const data = await aiService.askChatbot(prompt);
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data?.response || 'No response received.',
          confidence: data?.confidence,
          matchedQuestion: data?.matched_question,
          suggestedQuestions: data?.suggested_questions || [],
        },
      ]);
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'AI assistant request failed.'), 'error');
    } finally {
      setChatLoading(false);
    }
  };

  const detectBloodGroup = async () => {
    setDetectLoading(true);
    try {
      const data = await aiService.detectBloodGroup({
        source: source || 'sample',
        imageFile: detectFile,
      });
      setDetectResult(data || null);
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Blood group detection failed.'), 'error');
    } finally {
      setDetectLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <AutoAwesomeRoundedIcon color="primary" />
        <Typography variant="h4">AI Assistant</Typography>
      </Stack>

      <Alert severity="info">
        AI outputs are assistive and prototype-level. Final medical decisions must be validated by certified clinicians.
      </Alert>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PsychologyRoundedIcon color="primary" />
              <Typography variant="h6">Medical Chatbot</Typography>
            </Stack>

            {quickQuestions.length > 0 ? (
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {quickQuestions.map((question) => (
                  <Chip
                    key={question}
                    label={question}
                    variant="outlined"
                    onClick={() => askAssistant(question)}
                    clickable
                  />
                ))}
              </Stack>
            ) : null}

            <Box ref={chatContainerRef}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 1.5,
                minHeight: 220,
                maxHeight: 360,
                overflowY: 'auto',
              }}
            >
              <Stack spacing={1.25}>
                {chatHistory.map((entry, index) => (
                  <Box
                    key={`${entry.role}-${index}`}
                    sx={{
                      alignSelf: entry.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '86%',
                      bgcolor: entry.role === 'user' ? 'primary.main' : 'background.paper',
                      color: entry.role === 'user' ? 'primary.contrastText' : 'text.primary',
                      border: '1px solid',
                      borderColor: entry.role === 'user' ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      px: 1.5,
                      py: 1,
                    }}
                  >
                    <Typography variant="body2">{entry.text}</Typography>
                    {entry.role === 'assistant' && entry.matchedQuestion ? (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
                        Matched intent: {entry.matchedQuestion}
                        {entry.confidence ? ` | Confidence: ${Math.round(entry.confidence * 100)}%` : ''}
                      </Typography>
                    ) : null}
                    {entry.role === 'assistant' && entry.suggestedQuestions?.length ? (
                      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                        {entry.suggestedQuestions.slice(0, 3).map((question) => (
                          <Chip
                            key={question}
                            size="small"
                            variant="outlined"
                            label={question}
                            onClick={() => askAssistant(question)}
                            clickable
                          />
                        ))}
                      </Stack>
                    ) : null}
                  </Box>
                ))}
              </Stack>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
              <TextField
                label="Ask your question"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                fullWidth
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    askAssistant();
                  }
                }}
              />
              <Button
                variant="contained"
                startIcon={<SendRoundedIcon />}
                onClick={() => askAssistant()}
                disabled={chatLoading}
                sx={{ minWidth: 140 }}
              >
                {chatLoading ? 'Thinking...' : 'Send'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <ScienceRoundedIcon color="primary" />
              <Typography variant="h6">Blood Group Detection (Prototype)</Typography>
            </Stack>

            <TextField
              label="Source Label (camera-upload, sample-strip, lab-image)"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              fullWidth
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'center' }}>
              <Button component="label" variant="outlined" startIcon={<UploadFileRoundedIcon />}>
                Choose Photo
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setDetectFile(file);
                  }}
                />
              </Button>
              <Typography variant="body2" color="text.secondary">
                {detectFile ? `Selected: ${detectFile.name}` : 'No photo selected (optional).'}
              </Typography>
              {detectFile ? (
                <Button variant="text" color="inherit" onClick={() => setDetectFile(null)}>
                  Remove
                </Button>
              ) : null}
            </Stack>

            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" onClick={detectBloodGroup} disabled={detectLoading}>
                {detectLoading ? 'Detecting...' : 'Run Detection'}
              </Button>
            </Stack>

            {detectResult ? (
              <Stack spacing={1.25}>
                <Divider />
                <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                  <Typography variant="subtitle1">Predicted Group:</Typography>
                  <Chip color="primary" label={detectResult.blood_group || '-'} />
                  <Chip variant="outlined" label={`Confidence: ${detectResult.confidence || 0}%`} />
                  <Chip variant="outlined" label={`Input: ${detectResult.input_type || 'text'}`} />
                </Stack>
                <Typography color="text.secondary">{detectResult.summary}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Source: {detectResult.source_label || source}
                </Typography>
                <Alert severity="warning">{detectResult.disclaimer}</Alert>
              </Stack>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default AIAssistantPage;
