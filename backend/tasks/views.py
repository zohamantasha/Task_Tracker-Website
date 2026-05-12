from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Task, WorkUpdate
from .serializers import TaskSerializer, WorkUpdateSerializer

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tasks(request):
    if request.user.role == 'admin':
        tasks = Task.objects.all().order_by('-created_at')
    else:
        tasks = Task.objects.filter(assigned_to=request.user).order_by('-created_at')
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_task(request):
    try:
        title = request.data.get('title')
        description = request.data.get('description')
        priority = request.data.get('priority')
        due_date = request.data.get('due_date')
        assigned_users = request.data.get('assigned_to', [])

        task = Task.objects.create(
            title=title,
            description=description,
            priority=priority,
            due_date=due_date,
            created_by=request.user
        )

        for user_id in assigned_users:
            try:
                user = User.objects.get(id=user_id)
                task.assigned_to.add(user)
            except User.DoesNotExist:
                pass

        serializer = TaskSerializer(task)
        return Response(serializer.data, status=201)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_details(request, pk):
    try:
        task = Task.objects.get(id=pk)
        serializer = TaskSerializer(task)
        return Response(serializer.data)
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_update(request, pk):
    try:
        task = Task.objects.get(id=pk)
        update = WorkUpdate.objects.create(
            task=task,
            user=request.user,
            update_text=request.data.get('update_text'),
            hours_spent=request.data.get('hours_spent', 1),
            progress_percentage=request.data.get('progress_percentage', 0)
        )

        progress = int(request.data.get('progress_percentage', 0))
        if progress >= 100:
            task.status = 'completed'
        elif progress > 0:
            task.status = 'in_progress'
        else:
            task.status = 'pending'
        task.save()

        serializer = WorkUpdateSerializer(update)
        return Response(serializer.data)
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=404)
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_task(request, pk):
    try:
        task = Task.objects.get(id=pk)
        task.title = request.data.get('title', task.title)
        task.description = request.data.get('description', task.description)
        task.priority = request.data.get('priority', task.priority)
        task.status = request.data.get('status', task.status)
        task.due_date = request.data.get('due_date', task.due_date)
        task.save()

        assigned_users = request.data.get('assigned_to', None)
        if assigned_users is not None:
            task.assigned_to.clear()
            for user_id in assigned_users:
                try:
                    user = User.objects.get(id=user_id)
                    task.assigned_to.add(user)
                except User.DoesNotExist:
                    pass

        serializer = TaskSerializer(task)
        return Response(serializer.data)
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=404)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_task(request, pk):
    try:
        task = Task.objects.get(id=pk)
        task.delete()
        return Response({'message': 'Task deleted'}, status=204)
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=404)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_updates(request, pk):
    try:
        task = Task.objects.get(id=pk)
        updates = WorkUpdate.objects.filter(task=task).order_by('-created_at')
        serializer = WorkUpdateSerializer(updates, many=True)
        return Response(serializer.data)
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=404) 