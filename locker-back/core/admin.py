import json

from django.urls import reverse, reverse_lazy
from django.contrib import admin
from django.contrib.gis.admin import OSMGeoAdmin
from django.utils.safestring import mark_safe

# Register your models here.

from core.models import User, Role, StoragePoi, Order
from django import forms
from django.conf import settings

print(settings.TEMPLATES)

admin.site.register(User)

admin.site.register(Role)


class AddressAutocompleteWidget(forms.TextInput):
    class Media:
        css = {
            'all': (
                'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/themes/base/jquery-ui.min.css',
            )
        }
        js = (
            'https://code.jquery.com/jquery-3.6.0.min.js',
            'https://code.jquery.com/ui/1.13.1/jquery-ui.min.js'
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.attrs['class'] = 'select2'
        self.attrs['style'] = 'width: 100%;'

    def render(self, name, value, attrs=None, renderer=None):
        attrs['autocomplete_url'] = reverse('address_autocomplete')
        html = super().render(name, value, attrs, renderer)
        # process_results = '''
        #         function(data) {
        #             return {
        #                 results: $.map(data, function(obj) {
        #                     return {id: obj.value, text: obj.label};
        #                 })
        #             };
        #         }
        #     '''
        #
        # on_select = '''
        #                 function(data) {{
        #                     var element = $("#id_{}");
        #                     console.log("element", element);
        #                     console.log("data", data);
        #                     element.val(data.id).trigger("change");
        #                 }}
        #             '''.format(name)
        #use f-string
        html += f'''
            <script type="text/javascript">
                $("input[name=address]").autocomplete({{
                    source: function (request, response) {{
                        jQuery.ajax({{
                            url: '{attrs['autocomplete_url']}',
                            method: 'GET',
                            data: {{'q': request.term}},
                            success: response
                        }})
                    }},
                    select: function (event, ui) {{
                        $("input[name=lat]").val(ui.item.lat)
                        $("input[name=lon]").val(ui.item.lon)
                    }}
                }});
            </script>
            '''
        return html


class StoragePOIForm(forms.ModelForm):
    address = forms.CharField(widget=AddressAutocompleteWidget(),label='Address',
        required=True)

    class Meta:
        model = StoragePoi
        fields = "__all__"


@admin.register(StoragePoi)
class POIAdmin(OSMGeoAdmin):
    list_display = ('name', 'address', 'description')
    search_fields = ('name', 'address', 'description')
    form = StoragePOIForm


admin.site.register(Order)
