import boto3


def get_list(event, context):

    table = boto3.resource('dynamodb').Table('lists')

    response = table.get_item(Key={'id': event.get('id')})

    return response.get('Item', {
        'error': 'item not found',
        'id': event.get('id'),
        'items': None
    })
