# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
import json
import os

import requests
# [START gae_python38_app]
# [START gae_python3_app]
from flask import Flask, request, Response, jsonify, make_response

# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
app = Flask(__name__)


@app.route('/hello')
def hello():
    """Return a friendly HTTP greeting."""
    return 'Hello World! BWAHAHA'


@app.route('/currentWeather', methods=['GET'])
def get_weather_json():
    all_args = request.args
    loc = all_args.get('location')

    if loc is not None:
        url = "https://api.tomorrow.io/v4/timelines"
        querystring = {
            "units": "metric", "timesteps": "current",
            "location": loc,
            "apikey": os.environ.get('TOMORROW_APIKEY'),
            "fields": [
                "temperature", "temperatureApparent",
                "temperatureMin", "temperatureMax",
                "windSpeed", "windDirection",
                "humidity", "pressureSeaLevel",
                "uvIndex", "weatherCode",
                "precipitationProbability", "precipitationType",
                "visibility", "cloudCover"
            ],
            "timezone": "America/Los_Angeles",
            "units": "imperial"
        }
        headers = {"Accept": "application/json", "Content-Type": "application/json"}
        response1 = requests.request("GET", url, headers=headers, params=querystring)
        querystring["timesteps"] = "1d"
        querystring["fields"].append("sunriseTime")
        querystring["fields"].append("moonPhase")
        querystring["fields"].append("sunsetTime")
        response2 = requests.request("GET", url, headers=headers, params=querystring)

        if response1.status_code == 200 and response2.status_code == 200:
            result_json = {"current": json.loads(response1.text), "day": json.loads(response2.text)}

        else:
            result_json = json.load(open('sampleData.json'))

        result = Response(json.dumps(result_json), mimetype='application/json')
        result.headers.add('Access-Control-Allow-Origin', '*')

        return result

    return Response("Oops!")


if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. You
    # can configure startup instructions by adding `entrypoint` to app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)
# [END gae_python3_app]
# [END gae_python38_app]
