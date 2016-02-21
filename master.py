from twilio.rest import TwilioRestClient
from random import randint
from random import seed
from time import clock
from time import sleep
import csv


__doc__ = """
class master wraps up the twilio API. There are four methods and a constructor:

generateAuthCode(mySeed = 0) ------ return a random 6-digit integer as authentication code

checkAuth() ------ called when the twenty seconds down-count is over, collect all student present

countSubmission() ------ called as refresh, return the number of submissions

getAnswer() ------ called at the end of the quiz, fetch all answers and write grades to a csv file named grades.csv, return a map from student phone number to answer, students submitted authentication code but no answer get "present but no answer", students haven't submitted authentication code but submitted an answer get "invalid answer"

"""

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
		self.grades = {}

#generate a random authentication code
	def generateAuthCode(self, mySeed=0):
		for message in self.client.messages.list():
			self.client.messages.delete(message.sid)
		seed()	
		self.auth = str(randint(100000, 999999))
		return self.auth

#when front-end finish twenty seconds count, this will be called, and collect all students who submitted the correct authentication code
	def checkAuth(self):
		self.presentStudent = {}
		for message in self.client.messages.list(to = self.number):
			if message.body == self.auth:
				self.presentStudent[str(message.from_)] = 1
				self.client.messages.delete(message.sid)
		print self.presentStudent

#refresh submission number
	def countSubmission(self):
		for message in self.client.messages.list(to = self.number):
			self.grades[str(message.from_)] = message.body
			self.client.messages.delete(message.sid)
		return len(self.grades)

#fetch all answers and write to a csv file called grades.csv
	def getAnswer(self):
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
		return self.grades

#for test
#client = master()
#print client.generateAuthCode()
#sleep(20)
#client.checkAuth()
#for i in range(40):
#	print client.countSubmission()
#print client.getAnswer()
