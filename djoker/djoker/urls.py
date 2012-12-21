from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
import socketio.sdjango

from .views import root, table

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'djoker.views.home', name='home'),
    # url(r'^djoker/', include('djoker.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    url(r'^$', root, name='root'),
    url(r'^(?P<uuid>[^/]+)/$', table, name='table'),
    url(r'^socket\.io', include(socketio.sdjango.urls)),

)

urlpatterns += staticfiles_urlpatterns()
