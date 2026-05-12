from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from tasks.models import Task
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversation(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
        conversation, created = Conversation.objects.get_or_create(task=task)

        for user in task.assigned_to.all():
            conversation.participants.add(user)
        conversation.participants.add(task.created_by)
        conversation.participants.add(request.user)

        return Response({'id': str(conversation.id)})

    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=404)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request, conversation_id):
    try:
        conversation = Conversation.objects.get(id=conversation_id)
        messages = Message.objects.filter(
            conversation=conversation
        ).order_by('created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request, conversation_id):
    try:
        conversation = Conversation.objects.get(id=conversation_id)
        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=request.data.get('content')
        )
        serializer = MessageSerializer(message)
        return Response(serializer.data)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_seen(request, conversation_id):
    try:
        conversation = Conversation.objects.get(id=conversation_id)
        messages = Message.objects.filter(
            conversation=conversation
        ).exclude(seen_by=request.user)
        for msg in messages:
            msg.seen_by.add(request.user)
        return Response({'status': 'ok'})
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=404)