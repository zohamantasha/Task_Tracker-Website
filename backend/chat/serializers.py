from rest_framework import serializers
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    seen_by_names = serializers.SerializerMethodField()
    seen_by_all = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_name',
            'content', 'created_at', 'seen_by_names', 'seen_by_all'
        ]

    def get_seen_by_names(self, obj):
        return [user.username for user in obj.seen_by.all()]

    def get_seen_by_all(self, obj):
        conversation = obj.conversation
        participants = conversation.participants.all()
        seen_by = obj.seen_by.all()
        return all(p in seen_by for p in participants if p != obj.sender)


class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = ['id', 'task', 'participants', 'created_at']