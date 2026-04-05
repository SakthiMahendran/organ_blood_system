import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import HealthAndSafetyRoundedIcon from '@mui/icons-material/HealthAndSafetyRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { aiService } from '../../services/aiService';
import { donorService } from '../../services/donorService';
import { getErrorMessage } from '../../utils/errorUtils';
import { normalizeRole } from '../../utils/roleUtils';

const ROLE_PROMPTS = {
  DONOR: ['Am I eligible to donate?', 'What is the cooldown after donating?', 'How does organ donation work?'],
  ACCEPTOR: ['How do I create a request?', 'What blood types are compatible?', 'How long does matching take?'],
  HOSPITAL: ['How do I approve a request?', 'What is priority scoring?', 'How does SOS broadcast work?'],
  ADMIN: ['Show redistribution thresholds', 'How is priority score calculated?', 'What are expiry alert levels?'],
};

const DONATION_TYPES = [
  { value: 'whole_blood', label: 'Whole Blood (56 days)' },
  { value: 'power_red', label: 'Power Red (112 days)' },
  { value: 'platelets', label: 'Platelets (7 days)' },
  { value: 'plasma', label: 'Plasma (28 days)' },
];

const AIAssistantPage = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const role = normalizeRole(user?.user_type);
  const showEligibilityChecker = role === 'DONOR' || role === 'ACCEPTOR';

  // Chatbot state
  const [message, setMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      text: 'Hello. I can help with eligibility, emergency workflow, AI matching, notifications, and analytics interpretation.',
    },
  ]);
  const [quickQuestions, setQuickQuestions] = useState([]);
  const chatContainerRef = useRef(null);

  // Eligibility checker state
  const [eligibilityForm, setEligibilityForm] = useState({
    age: '',
    weight_kg: '',
    last_donation_date: '',
    last_donation_type: 'whole_blood',
    recent_tattoo: false,
    recent_travel: false,
    is_pregnant: false,
    recent_medications: false,
  });
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);

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
    if (!chatElement) return;
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

  const handleEligibilityChange = (field, value) => {
    setEligibilityForm((prev) => ({ ...prev, [field]: value }));
  };

  const checkEligibility = async () => {
    const age = Number(eligibilityForm.age);
    const weight = Number(eligibilityForm.weight_kg);

    if (!eligibilityForm.age || !eligibilityForm.weight_kg) {
      showToast('Please enter your age and weight before checking eligibility.', 'warning');
      return;
    }
    if (age <= 0 || weight <= 0) {
      showToast('Age and weight must be positive numbers.', 'warning');
      return;
    }

    if (eligibilityForm.last_donation_date) {
      const donated = new Date(eligibilityForm.last_donation_date);
      const today = new Date();
      const year = donated.getFullYear();
      if (isNaN(donated.getTime()) || year < 1900 || year > today.getFullYear()) {
        showToast('Please enter a valid last donation date.', 'warning');
        return;
      }
      if (donated > today) {
        showToast('Last donation date cannot be in the future.', 'warning');
        return;
      }
    }

    setEligibilityLoading(true);
    setEligibilityResult(null);
    try {
      const data = await donorService.checkEligibility(eligibilityForm);
      setEligibilityResult(data);
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Eligibility check failed.'), 'error');
    } finally {
      setEligibilityLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AutoAwesomeRoundedIcon color="primary" />
          <Typography variant="h4">AI Assistant</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {role === 'DONOR' || role === 'ACCEPTOR'
            ? 'Check your donation eligibility or ask medical questions about blood & organ donation.'
            : 'Ask questions about platform workflows, matching, or clinical guidelines.'}
        </Typography>
      </Stack>

      <Alert severity="info" sx={{ fontSize: '0.82rem' }}>
        AI outputs are assistive and prototype-level. Final decisions must be validated by certified clinicians.
      </Alert>

      {/* ─── Eligibility Checker (donor/acceptor only) ─── */}
      {showEligibilityChecker && <Card>
        <CardContent>
          <Stack spacing={2.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <HealthAndSafetyRoundedIcon color="secondary" />
              <Typography variant="h6">Donor Eligibility Checker</Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              Answer a few questions to check if you are eligible to donate blood today. Based on Red Cross guidelines.
            </Typography>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Age"
                  type="number"
                  value={eligibilityForm.age}
                  onChange={(e) => handleEligibilityChange('age', e.target.value)}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1, max: 120 }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Weight (kg)"
                  type="number"
                  value={eligibilityForm.weight_kg}
                  onChange={(e) => handleEligibilityChange('weight_kg', e.target.value)}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1, max: 300 }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Last Donation Date"
                  type="date"
                  value={eligibilityForm.last_donation_date}
                  onChange={(e) => handleEligibilityChange('last_donation_date', e.target.value)}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: new Date().toISOString().split('T')[0], min: '1900-01-01' }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  select
                  label="Donation Type"
                  value={eligibilityForm.last_donation_type}
                  onChange={(e) => handleEligibilityChange('last_donation_type', e.target.value)}
                  fullWidth
                  size="small"
                  SelectProps={{ native: true }}
                >
                  {DONATION_TYPES.map((dt) => (
                    <option key={dt.value} value={dt.value}>
                      {dt.label}
                    </option>
                  ))}
                </TextField>
              </Grid2>
            </Grid2>

            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={eligibilityForm.recent_tattoo}
                    onChange={(e) => handleEligibilityChange('recent_tattoo', e.target.checked)}
                    size="small"
                  />
                }
                label="Recent tattoo/piercing (< 3 months)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={eligibilityForm.recent_travel}
                    onChange={(e) => handleEligibilityChange('recent_travel', e.target.checked)}
                    size="small"
                  />
                }
                label="Recent travel to endemic area"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={eligibilityForm.is_pregnant}
                    onChange={(e) => handleEligibilityChange('is_pregnant', e.target.checked)}
                    size="small"
                  />
                }
                label="Currently pregnant"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={eligibilityForm.recent_medications}
                    onChange={(e) => handleEligibilityChange('recent_medications', e.target.checked)}
                    size="small"
                  />
                }
                label="On medications"
              />
            </Stack>

            <Stack direction="row" justifyContent="flex-end">
              <Button
                variant="contained"
                color="secondary"
                onClick={checkEligibility}
                disabled={eligibilityLoading}
              >
                {eligibilityLoading ? 'Checking...' : 'Check Eligibility'}
              </Button>
            </Stack>

            {eligibilityResult && (
              <>
                <Divider />
                <Alert
                  severity={eligibilityResult.eligible ? 'success' : 'warning'}
                  icon={eligibilityResult.eligible ? <CheckCircleRoundedIcon /> : <ErrorRoundedIcon />}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {eligibilityResult.eligible
                      ? 'You are eligible to donate blood!'
                      : 'You are currently deferred from donating.'}
                  </Typography>
                </Alert>

                {eligibilityResult.reasons?.length > 0 && (
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">Reasons:</Typography>
                    {eligibilityResult.reasons.map((reason, i) => (
                      <Typography key={i} variant="body2" color="text.secondary">
                        • {reason}
                      </Typography>
                    ))}
                  </Stack>
                )}

                {eligibilityResult.next_eligible_date && (
                  <Typography variant="body2" color="text.secondary">
                    Next eligible date: <strong>{eligibilityResult.next_eligible_date}</strong>
                    {eligibilityResult.cooldown_remaining_days > 0 &&
                      ` (${eligibilityResult.cooldown_remaining_days} days remaining)`}
                  </Typography>
                )}
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      }

      {/* ─── Medical Chatbot ─── */}
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PsychologyRoundedIcon color="primary" />
              <Typography variant="h6">Medical Chatbot</Typography>
            </Stack>

            {((ROLE_PROMPTS[role] || []).concat(quickQuestions)).slice(0, 6).length > 0 && (
              <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                {((ROLE_PROMPTS[role] || []).concat(quickQuestions)).slice(0, 6).map((question) => (
                  <Chip
                    key={question}
                    label={question}
                    variant="outlined"
                    size="small"
                    onClick={() => askAssistant(question)}
                    clickable
                    sx={{ borderRadius: 2 }}
                  />
                ))}
              </Stack>
            )}

            <Box
              ref={chatContainerRef}
              sx={(theme) => ({
                bgcolor: alpha(theme.palette.background.default, 0.5),
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                p: 2,
                minHeight: 260,
                maxHeight: 400,
                overflowY: 'auto',
              })}
            >
              <Stack spacing={1.5}>
                {chatHistory.map((entry, index) => (
                  <Stack
                    key={`${entry.role}-${index}`}
                    direction="row"
                    spacing={1}
                    sx={{
                      alignSelf: entry.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '82%',
                      flexDirection: entry.role === 'user' ? 'row-reverse' : 'row',
                    }}
                  >
                    {entry.role === 'assistant' && (
                      <Avatar sx={(t) => ({ width: 28, height: 28, bgcolor: alpha(t.palette.primary.main, 0.1), mt: 0.25 })}>
                        <SmartToyRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      </Avatar>
                    )}
                    <Box
                      sx={(theme) => ({
                        bgcolor: entry.role === 'user' ? 'primary.main' : theme.palette.background.paper,
                        color: entry.role === 'user' ? '#fff' : 'text.primary',
                        border: entry.role === 'user' ? 'none' : `1px solid ${theme.palette.divider}`,
                        borderRadius: entry.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        px: 1.75,
                        py: 1,
                        boxShadow: entry.role === 'user' ? 'none' : `0 1px 3px ${alpha('#000', 0.04)}`,
                      })}
                    >
                      <Typography variant="body2" sx={{ lineHeight: 1.55 }}>{entry.text}</Typography>
                      {entry.role === 'assistant' && entry.matchedQuestion ? (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.68rem' }}>
                          Matched: {entry.matchedQuestion}
                          {entry.confidence ? ` &middot; ${Math.round(entry.confidence * 100)}% confidence` : ''}
                        </Typography>
                      ) : null}
                      {entry.role === 'assistant' && entry.suggestedQuestions?.length ? (
                        <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                          {entry.suggestedQuestions.slice(0, 3).map((question) => (
                            <Chip
                              key={question}
                              size="small"
                              variant="outlined"
                              label={question}
                              onClick={() => askAssistant(question)}
                              clickable
                              sx={{ fontSize: '0.68rem', height: 22, borderRadius: 1.5 }}
                            />
                          ))}
                        </Stack>
                      ) : null}
                    </Box>
                  </Stack>
                ))}
                {chatLoading && (
                  <Stack direction="row" spacing={1} sx={{ alignSelf: 'flex-start' }}>
                    <Avatar sx={(t) => ({ width: 28, height: 28, bgcolor: alpha(t.palette.primary.main, 0.1), mt: 0.25 })}>
                      <SmartToyRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    </Avatar>
                    <Box sx={(t) => ({ bgcolor: t.palette.background.paper, border: `1px solid ${t.palette.divider}`, borderRadius: '16px 16px 16px 4px', px: 2, py: 1.25 })}>
                      <Stack direction="row" spacing={0.5}>
                        {[0, 1, 2].map((i) => (
                          <Box key={i} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'text.secondary', opacity: 0.3, animation: 'typing-dot 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s`, '@keyframes typing-dot': { '0%, 60%, 100%': { opacity: 0.3, transform: 'translateY(0)' }, '30%': { opacity: 0.8, transform: 'translateY(-4px)' } } }} />
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                )}
              </Stack>
            </Box>

            <Stack direction="row" spacing={1}>
              <TextField
                placeholder="Type your question..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                fullWidth
                size="small"
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    askAssistant();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={() => askAssistant()}
                disabled={chatLoading}
                sx={{ minWidth: 48, px: 1.5 }}
              >
                <SendRoundedIcon sx={{ fontSize: 20 }} />
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default AIAssistantPage;
