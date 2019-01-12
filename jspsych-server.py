# 1. Serve static files including experiment.html, jspsych-ab-test.js
#    jspsych-6.0.5/, img/.
# 2. Save data to MongoDB.

import os
from glob import glob

from flask import Flask, send_from_directory
from flask.json import jsonify
from flask_pymongo import PyMongo


HOST = '0.0.0.0'
MONGO_URI = 'mongodb://{}:27017/test'.format(HOST) # 27017 is the default port
MONGO_COLLECTION = 'jspsych'
IMG_PATH = 'img'


app = Flask(__name__, static_url_path='', static_folder='')
app.config["MONGO_URI"] = MONGO_URI
mongo = PyMongo(app)

@app.route('/')
def index():
    return app.send_static_file('experiment.html')


@app.route('/img')
def get_images():

    png_files = glob(os.path.join(IMG_PATH, '*.png'))
    print(os.getcwd())
    print('os.listdir(IMG_PATH) =', os.listdir(IMG_PATH))
    print('png_files =', png_files)
    return jsonify(png_files)


# HTTP Errors handlers
@app.errorhandler(404)
def url_error(e):
    return """
    Wrong URL!
    <pre>{}</pre>""".format(e), 404

def save_to_mongodb(object):
    """
    """
    myclient = pymongo.MongoClient(MONGO_URL)
    mydb = myclient[MONGO_DB]
    mycol = mydb[MONGO_COLLECTION]

    insert_return = mycol.insert_one(object)

    print('save_to_mongodb: insert_return = {}'.format(insert_return))





if __name__ == '__main__':
    # This is used when running locally.
    app.run(host=HOST, debug=True)
