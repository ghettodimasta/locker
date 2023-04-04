
def update_fields(model, **kwargs):
    fields = list(kwargs.keys())

    for key in fields:
        setattr(model, key, kwargs[key])

    model.save(update_fields=fields)