from rest_framework import serializers

from .models import (

    Conversation,
    Message
)


class MessageSerializer(

    serializers.ModelSerializer
):

    sender_username = serializers.CharField(

        source='sender.username',

        read_only=True
    )

    class Meta:

        model = Message

        fields = '__all__'


class ConversationSerializer(

    serializers.ModelSerializer
):

    messages = MessageSerializer(

        many=True,

        read_only=True
    )

    class Meta:

        model = Conversation

        fields = '__all__'