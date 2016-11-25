import boto3


session = boto3.Session(profile_name='rt')

table = session.resource('dynamodb').Table('lists')


def scan():

    return table.scan()['Items']
