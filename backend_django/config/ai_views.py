from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

CHATBOT_FAQ = [
    {
        'question': 'Who can donate blood?',
        'keywords': ['who can donate', 'eligibility', 'blood donate', 'age', 'weight'],
        'answer': 'Most healthy adults aged 18 to 65 with acceptable hemoglobin and weight can donate blood. Final eligibility is confirmed during screening at the donation center.',
    },
    {
        'question': 'How often can I donate blood?',
        'keywords': ['how often', 'frequency', 'interval', 'next donation'],
        'answer': 'Whole blood donation is usually allowed after a recovery interval (commonly around 90 days). Follow your local medical guideline and doctor advice.',
    },
    {
        'question': 'How does AI matching work in this system?',
        'keywords': ['ai matching', 'matching', 'score', 'compatibility'],
        'answer': 'AI matching ranks donors using compatibility, urgency, location alignment, donor availability, and response history signals to prioritize high-probability matches.',
    },
    {
        'question': 'What is an emergency request?',
        'keywords': ['emergency', 'critical', 'urgent request'],
        'answer': 'Emergency requests are high-priority cases requiring immediate review and faster donor outreach. Include accurate location and notes for better triage.',
    },
    {
        'question': 'Can I donate organs and blood both?',
        'keywords': ['organ and blood', 'both', 'organ donation'],
        'answer': 'Yes, depending on your medical eligibility and consent. Organ donation requires additional legal and clinical screening compared to blood donation.',
    },
    {
        'question': 'How can hospitals verify donor profiles?',
        'keywords': ['verify donor', 'hospital verify', 'verification'],
        'answer': 'Hospitals verify donors by reviewing submitted profile details, medical context, and status checks before approving eligibility in the dashboard workflow.',
    },
    {
        'question': 'What does match response status mean?',
        'keywords': ['match response', 'accepted', 'declined', 'pending'],
        'answer': 'Pending means donor has not responded, Accepted means donor confirmed readiness, and Declined means donor is unavailable for that request.',
    },
    {
        'question': 'How do notifications help?',
        'keywords': ['notifications', 'alerts', 'updates'],
        'answer': 'Notifications provide real-time updates for new matches, request status changes, verification actions, and important workflow events.',
    },
    {
        'question': 'How can admin use analytics dashboard?',
        'keywords': ['analytics', 'dashboard', 'admin report', 'insights'],
        'answer': 'The analytics dashboard helps admins monitor donor growth, request trends, emergency load, fulfillment rate, and operational health for decision-making.',
    },
    {
        'question': 'Is AI output final medical advice?',
        'keywords': ['medical advice', 'ai final', 'disclaimer', 'safe'],
        'answer': 'No. AI output is assistive guidance only. Clinical decisions must be validated by certified medical professionals and hospital protocols.',
    },
]


def _normalize(text: str) -> str:
    return ' '.join((text or '').strip().lower().split())


def _match_chatbot_response(message: str):
    normalized = _normalize(message)
    if not normalized:
        return None

    scored = []
    for item in CHATBOT_FAQ:
        score = 0
        q_normalized = _normalize(item['question'])

        if q_normalized in normalized or normalized in q_normalized:
            score += 6

        for keyword in item['keywords']:
            keyword_norm = _normalize(keyword)
            if keyword_norm and keyword_norm in normalized:
                score += 3

        token_overlap = set(normalized.split()) & set(q_normalized.split())
        score += min(4, len(token_overlap))

        scored.append((score, item))

    scored.sort(key=lambda row: row[0], reverse=True)
    best_score, best_item = scored[0]

    if best_score <= 0:
        return {
            'matched_question': None,
            'response': 'I can help with blood eligibility, emergency requests, matching score logic, donor verification, notifications, and analytics usage. Try asking one of the suggested questions.',
            'confidence': 0.35,
            'suggested_questions': [item['question'] for item in CHATBOT_FAQ[:4]],
        }

    suggestions = [item['question'] for _, item in scored[1:4]]
    confidence = min(0.98, 0.45 + (best_score * 0.06))

    return {
        'matched_question': best_item['question'],
        'response': best_item['answer'],
        'confidence': round(confidence, 2),
        'suggested_questions': suggestions,
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chatbot_questions(request):
    questions = [item['question'] for item in CHATBOT_FAQ]
    return Response({'success': True, 'data': {'questions': questions}})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chatbot_ask(request):
    message = str(request.data.get('message') or '').strip()

    if not message:
        return Response(
            {'success': False, 'error': {'code': 'BAD_REQUEST', 'message': 'message is required'}},
            status=400,
        )

    result = _match_chatbot_response(message)
    return Response({'success': True, 'data': result})
