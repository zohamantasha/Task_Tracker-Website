from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_tasks, name='get_tasks'),
    path('create/', views.create_task, name='create_task'),
    path('<uuid:pk>/', views.task_details, name='task_details'),
    path('<uuid:pk>/add-update/', views.add_update, name='add_update'),
    path('<uuid:pk>/updates/', views.get_updates, name='get_updates'),
    path('<uuid:pk>/edit/', views.edit_task, name='edit_task'),
    path('<uuid:pk>/delete/', views.delete_task, name='delete_task'),
]