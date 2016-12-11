import boto3


def put_list(event, context):

    response = boto3.resource('dynamodb').Table('lists').put_item(
        Item=event,
    )

    return response['ResponseMetadata']['HTTPStatusCode']
