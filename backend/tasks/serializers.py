from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Task, WorkUpdate

User = get_user_model()


class TaskSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    assigned_to_names = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'priority', 'status',
            'due_date', 'created_at', 'created_by_name', 'assigned_to_names'
        ]

    def get_assigned_to_names(self, obj):
        return [user.username for user in obj.assigned_to.all()]


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