import random
import string

def generate_id(event, context):

    new_id = ''.join(
        random.choice(string.ascii_lowercase + string.ascii_uppercase)
        for _ in range(6)
    )

    return {'id': new_id}
