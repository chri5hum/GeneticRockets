from flask import Flask, render_template, url_for, send_from_directory

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('Rockets.html')

@app.route('/sketches/<path:path>')
def send_sketches(path):
    return send_from_directory('sketches', path)

if __name__ == '__main__':
  app.run()
