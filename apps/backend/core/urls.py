"""
URL configuration for HRMS project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/employees/', include('employees.urls')),
    path('api/v1/leaves/', include('leaves.urls')),
    path('api/v1/timesheets/', include('timesheets.urls')),
    path('api/v1/projects/', include('projects.urls')),
    path('api/v1/reports/', include('reports.urls')),
    path('api/v1/audit-logs/', include('audit.urls')),
    path('api/v1/settings/', include('settings.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)



