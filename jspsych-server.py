# 1. Serve static files including experiment.html, jspsych-ab-test.js
#    jspsych-6.0.5/, img/.
# 2. Save data to MongoDB.

import os
import datetime
from glob import glob
import json

from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask.json import jsonify
from flask_pymongo import PyMongo

from crossdomain import crossdomain


HOST = '0.0.0.0'
MONGO_URI = 'mongodb://{}:27017/test'.format(HOST) # 27017 is the default port
MONGO_COLLECTION = 'jspsych'
IMG_PATH = 'img'


app = Flask(__name__, static_url_path='', static_folder='')
CORS(app)
app.config["MONGO_URI"] = MONGO_URI
mongo = PyMongo(app)

@app.route('/')
# @cross_origin()
@crossdomain(origin='*')
def index():
    return app.send_static_file('experiment.html')


@app.route('/img')
# @cross_origin()
# @crossdomain(origin='*')
def get_images():
    png_files = glob(os.path.join(IMG_PATH, '*.png'))
    # print(os.getcwd())
    # print('os.listdir(IMG_PATH) =', os.listdir(IMG_PATH))
    # print('png_files =', png_files)
    return jsonify(png_files)


# HTTP Errors handlers
@app.errorhandler(404)
def url_error(e):
    return """
    Wrong URL!
    <pre>{}</pre>""".format(e), 404


@app.route('/save', methods=['POST'])
# @cross_origin()
def save_to_mongodb():
    """
    """
    # jspsychData = json.loads(request.data)
    jspsychData = request.get_json()
    print('save_to_mongodb: trying to save object')
    # from pprint import pprint
    # pprint(jspsychData)
    # if request.is_json:
    #     print("is json")
    #     data = request.get_json()
    #     print("type of data {}".format(type(data))) # type dict
    #     print("data as string {}".format(json.dumps(data)))
    #     print ("keys {}".format(json.dumps(data.keys())))
    if isinstance(jspsychData, list):
        jspsychData = {
            'timestamp': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'data': jspsychData,
        }
    try:
        mongo.db.jspsych.insert_one(jspsychData)
    except Exception as e:
        raise RuntimeError('save_to_mongodb: something bad happened: {}'.format(e))
    # myclient = PyMongo.MongoClient(MONGO_URI)
    # mydb = myclient[MONGO_COLLECTION]
    # mycol = mydb[MONGO_COLLECTION]
    #
    # insert_return = mycol.insert_one(object)
    #
    # print('save_to_mongodb: insert_return = {}'.format(insert_return))
    return jsonify(message='success')





if __name__ == '__main__':
    # This is used when running locally.
    app.run(host=HOST, debug=True)
