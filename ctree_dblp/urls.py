from django.conf.urls import patterns, include, url
import view
import query

from ctree_dblp import settings
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = patterns('',
    (r'^$', view.index),
    (r'^check_searching/$', query.check_searching),
    (r'^get_tree_structure/$', query.get_tree_structure)
)

urlpatterns += staticfiles_urlpatterns()

if settings.DEBUG:
    urlpatterns += patterns('',
        (r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_PATH}),
    ) 
