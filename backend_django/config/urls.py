from django.contrib import admin
from django.urls import include, path

from . import ai_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts_app.urls')),
    path('api/donors/', include('donors.urls')),
    path('api/requests/', include('requests_app.urls')),
    path('api/matching/', include('matching.urls')),
    path('api/search/', include('matching.search_urls')),
    path('api/hospital/', include('hospitals.urls')),
    path('api/notifications/', include('notifications_app.urls')),
    path('api/recipients/', include('recipients.urls')),
    path('api/donations/', include('donations_app.urls')),
    path('api/admin/', include('audit_app.urls')),
    path('api/ai/chatbot/questions', ai_views.chatbot_questions, name='ai-chatbot-questions'),
    path('api/ai/chatbot/ask', ai_views.chatbot_ask, name='ai-chatbot-ask'),
    path('api/ai/blood-group/detect', ai_views.blood_group_detect, name='ai-blood-detect'),
]
