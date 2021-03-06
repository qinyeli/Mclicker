from twilio.rest import TwilioRestClient
from random import randint
from random import seed
from time import clock
from time import sleep
from flask import Flask,render_template, request,json, send_file
import json
import csv
import os


__doc__ = """
class master wraps up the twilio API. There are four methods and a constructor:

generateAuthCode(mySeed = 0) ------ return a random 6-digit integer as authentication code

checkAuth() ------ called when the twenty seconds down-count is over, collect all student present

countSubmission() ------ called as refresh, return the number of submissions

getAnswer() ------ called at the end of the quiz, fetch all answers and write grades to a csv file named grades.csv, return a map from student phone number to answer, students submitted authentication code but no answer get "present but no answer", students haven't submitted authentication code but submitted an answer get "invalid answer"

"""


app = Flask(__name__)


class master:
#trial account
	account = "ACe2b8f26382a73cd9082699d899f68bf1"
	token = "35b3b94d56c3d9a113f65069a666dd93"
	number = "+17348871398"

#constructor create a TwilioRestClient instance
	def __init__(self, acnt=account, tkn=token, nmb=number):
		self.account = acnt
		self.token = tkn
		self.number = nmb
		self.client = TwilioRestClient(self.account, self.token)
		for message in self.client.messages.list():
			self.client.messages.delete(message.sid)
		self.timeUp1 = 0
		self.timeUp2 = 0
		self.grades = {}
		self.presentStudent = {}

#generate a random authentication code
	def generateAuthCode(self, mySeed=0):
		seed()	
		num = randint(100000, 999999)
		self.auth = str(num)
		return json.dumps(num)

#when front-end finish twenty seconds count, this will be called, and collect all students who submitted the correct authentication code
	def checkAuth(self):
		self.timeUp = 1
		print self.presentStudent
		return json.dumps(0)

	def countSubmission(self):
		return json.dumps(len(self.grades))	

#fetch all answers and write to a csv file called grades.csv
	def getAnswerCount(self):
		self.countSubmission()
		with open('grades.csv', 'w') as csvfile:
			fieldnames = ["student", "answer"]
			writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
			writer.writeheader()
			for student in self.grades.items():
				if student[0] in self.presentStudent:
					writer.writerow({"student": student[0], "answer": student[1]})
					del self.presentStudent[student[0]]
				else:
					self.grades[student[0]] = "invalid answer"
					writer.writerow({"student": student[0], "answer": "invalid answer"})
			for student in self.presentStudent.items():
				self.grades[student[0]] = "present but no answer"
				writer.writerow({"student": student[0], "answer": "present but no answer"})
		return json.dumps(self.grades)
	
	def getGradeStats(self):
		countAnswer = {}
		for answer in self.grades.items():
			if answer[1] in countAnswer:
				countAnswer[answer[1]] += 1
			else:
				countAnswer[answer[1]] = 1
		return json.dumps(countAnswer)

m = master()

@app.route('/')
def start():
	return render_template('index.html')
	
@app.route('/generate',methods=['POST'])
def generate():
	return m.generateAuthCode() 

@app.route('/check', methods=['POST']) #20 seconds later call this
def check():
	return m.checkAuth()

@app.route('/count', methods=['POST']) #Number of submission
def count():
	return m.countSubmission()

@app.route('/stop',methods=['POST']) #Call when Stop. Note to console.log
def stop():
	return m.getAnswerCount()

@app.route('/stat', methods=['POST'])
def stat():
	return m.getGradeStats()

@app.route('/graph', methods=['POST'])
def graph():
	print "before render"
	return render_template('graph.html')

@app.route('/img/sunset.jpg', methods=['GET'])
def get_image_sunset():
	return send_file('img/sunset.jpg')

#refresh submission number
@app.route('/recv_submission', methods = ['POST'])
def recv_submission():
	from_ = request.form['From']
	sid = request.form['SmsMessageSid']
	body = request.form['Body']
	if body == m.auth and m.timeUp1 == 0:
		m.presentStudent[from_] = 1
		print "auth:" + from_
	else:
		if m.timeUp2 == 0:
			m.grades[from_] = body
			print "ans:" + from_ + body
	return '0'


if __name__ == "__main__":
	app.run(debug=True)

#for test
#client = master()
#print client.generateAuthCode()
#sleep(20)
#client.checkAuth()
#for i in range(40):
#	print client.countSubmission()
#print client.getAnswer()
