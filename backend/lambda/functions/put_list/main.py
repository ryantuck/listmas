import datetime

import boto3


def put_list(event, context):

    print event

    event.update({'updated': str(datetime.datetime.utcnow())})

    response = boto3.resource('dynamodb').Table('lists').put_item(
        Item=event,
    )

    return response['ResponseMetadata']['HTTPStatusCode']
