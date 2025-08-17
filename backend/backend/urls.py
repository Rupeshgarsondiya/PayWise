from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),  # This line is crucial
    path('api/expenses/', include('expenses.urls')),
]
from django.conf import settings
from django.conf.urls.static import static

# ADD this to serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
