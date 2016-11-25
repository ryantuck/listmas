import boto3
from boto3.dynamodb.types import TypeDeserializer


def get_list(event, context):

    deser = TypeDeserializer()

    response = boto3.client('dynamodb').get_item(
        TableName='lists',
        Key={
            'id': {
                'S': event['id'],
            },
        },
    )

    return {
        k: deser.deserialize(v)
        for k, v in response['Item'].items()
    }
