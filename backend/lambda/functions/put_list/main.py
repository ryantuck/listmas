import datetime

import boto3


def put_list(event, context):

    # append updated timestamp
    event.update({'updated': str(datetime.datetime.utcnow())})

    # dynamodb can't handle blank strings, so convert to nulls
    for item in event['items']:
        for k,v in item.items():
            if v == '':
                item[k] = None

    print event

    response = boto3.resource('dynamodb').Table('lists').put_item(
        Item=event,
    )

    return response['ResponseMetadata']['HTTPStatusCode']
