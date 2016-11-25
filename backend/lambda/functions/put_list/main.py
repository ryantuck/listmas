import boto3
from boto3.dynamodb.types import TypeSerializer


def put_list(event, context):

    ser = TypeSerializer()

    item = {k: ser.serialize(v) for k,v in event.items()}

    response = boto3.client('dynamodb').put_item(
        TableName='lists',
        Item=item,
    )

    return response['ResponseMetadata']['HTTPStatusCode']
