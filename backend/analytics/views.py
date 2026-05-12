from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model  # ← fix this line
from tasks.models import Task, WorkUpdate

User = get_user_model()  # ← add this


@api_view(['GET'])
def dashboard_analytics(request):
    total_tasks = Task.objects.count()
    completed_tasks = Task.objects.filter(status='completed').count()
    pending_tasks = Task.objects.exclude(status='completed').count()
    total_users = User.objects.count()
    total_updates = WorkUpdate.objects.count()

    return Response({
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'pending_tasks': pending_tasks,
        'total_users': total_users,
        'total_updates': total_updates
    })