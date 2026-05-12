from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Task, WorkUpdate

User = get_user_model()


class TaskSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    assigned_to_names = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'priority', 'status',
            'due_date', 'created_at', 'created_by_name',
            'assigned_to_names', 'user_progress'
        ]

    def get_assigned_to_names(self, obj):
        return [user.username for user in obj.assigned_to.all()]

    def get_user_progress(self, obj):
        result = []
        for user in obj.assigned_to.all():
            latest_update = WorkUpdate.objects.filter(
                task=obj, user=user
            ).order_by('-created_at').first()

            if latest_update:
                progress = latest_update.progress_percentage
                if progress >= 100:
                    status = 'completed'
                elif progress > 0:
                    status = 'in_progress'
                else:
                    status = 'pending'
                hours = latest_update.hours_spent
            else:
                status = 'pending'
                progress = 0
                hours = 0

            result.append({
                'username': user.username,
                'status': status,
                'progress': int(progress),
                'hours': hours
            })
        return result


class WorkUpdateSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)

    class Meta:
        model = WorkUpdate
        fields = [
            'id', 'task', 'task_title', 'user_name',
            'update_text', 'hours_spent', 'progress_percentage', 'created_at'
        ]
        read_only_fields = ['id', 'user_name', 'task_title', 'created_at']