import boto3


session = boto3.Session(profile_name='rt')

table = session.resource('dynamodb').Table('lists')


def scan():

    return table.scan()['Items']


if __name__ == '__main__':
    for record in scan():
        print record
