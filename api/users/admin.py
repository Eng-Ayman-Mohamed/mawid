# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserRole


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display  = ['email', 'role', 'is_approved', 'is_blocked', 'is_active', 'is_staff']
    list_filter   = ['role', 'is_approved', 'is_blocked', 'is_active']
    search_fields = ['email']
    ordering      = ['email']
    
    # actions
    actions = ['approve_users', 'block_users', 'unblock_users']

    fieldsets = (
        (None,          {'fields': ('email', 'password')}),
        ('Role',        {'fields': ('role', 'is_approved', 'is_blocked')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields':  ('email', 'password1', 'password2', 'role'),
        }),
    )

    @admin.action(description='Approve selected users')
    def approve_users(self, request, queryset):
        queryset.update(is_approved=True)

    @admin.action(description='Block selected users')
    def block_users(self, request, queryset):
        queryset.update(is_blocked=True)

    @admin.action(description='Unblock selected users')
    def unblock_users(self, request, queryset):
        queryset.update(is_blocked=False)