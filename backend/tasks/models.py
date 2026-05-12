import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Task(models.Model):
    PRIORITY_CHOICES = [('low','Low'),('medium','Medium'),('high','High')]
    STATUS_CHOICES = [('pending','Pending'),('in_progress','In Progress'),('completed','Completed')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)  # ← ADD THIS
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    due_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # ← assignment requires this
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    assigned_to = models.ManyToManyField(User, related_name='assigned_tasks', blank=True)

    def __str__(self):
        return self.title

class WorkUpdate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)  # ← ADD THIS
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='work_updates')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    update_text = models.TextField()
    hours_spent = models.FloatField(default=0)
    progress_percentage = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Update for {self.task.title}"