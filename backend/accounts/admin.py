# accounts/admin.py - DELETE EVERYTHING and replace:
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser  # ✅ CustomUser, not User

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'is_active', 'date_joined']
    list_filter = ['role', 'is_active', 'is_staff']
    search_fields = ['username', 'email']
    ordering = ['-date_joined']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('role',)
        }),
    )