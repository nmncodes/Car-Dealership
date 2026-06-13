import requests
import os
from dotenv import load_dotenv

load_dotenv()

# QWERTY(configure urls)
backend_url = os.getenv(
    'backend_url', default="http://localhost:3030")
sentiment_analyzer_url = os.getenv(
    'sentiment_analyzer_url',
    default="http://localhost:5000/")

# def get_request(endpoint, **kwargs):
def get_request(endpoint, **kwargs):
    params = ""

    if kwargs:
        for key, value in kwargs.items():
            params = params + key + "=" + str(value) + "&"

    request_url = backend_url + endpoint + "?" + params

    print("GET from {}".format(request_url))

    try:
        response = requests.get(request_url)
        return response.json()

    except Exception:
        print("Network exception occurred")


def analyze_review_sentiments(text):
    request_url = sentiment_analyzer_url + "analyze/" + text

    try:
        response = requests.get(request_url, timeout=2)
        response.raise_for_status()
        return response.json()

    except Exception:
        return {"sentiment": "neutral"}

def post_review(data_dict):
    request_url = backend_url + "/insert_review"

    response = requests.post(
        request_url,
        json=data_dict,
        timeout=10
    )
    response.raise_for_status()
    return response.json()
