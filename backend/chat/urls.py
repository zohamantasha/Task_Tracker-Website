from django.urls import path
from .views import get_conversation, get_messages, send_message, mark_seen

urlpatterns = [
    path('conversation/<uuid:task_id>/', get_conversation),
    path('messages/<uuid:conversation_id>/', get_messages),
    path('send/<uuid:conversation_id>/', send_message),
    path('messages/<uuid:conversation_id>/mark-seen/', mark_seen),
]