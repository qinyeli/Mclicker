from twilio.rest import TwilioRestClient
from random import random
#from twilio.rest.resource import message


class master:
#trial account
	account = "ACe2b8f26382a73cd9082699d899f68bf1"
	token = "35b3b94d56c3d9a113f65069a666dd93"
	number = "7348871398"

	def __init__(self, acnt=account, tkn=token, nmb=number):
		self.account = acnt
		self.token = tkn
		self.number = nmb
		self.client = TwilioRestClient(self.account, self.token)
	
#return all income messages
	def getIncomeMessages(self):
		return self.client.messages.list(to = self.number)
	
#generate a random authorization code
	def generateAuthCode(self, seed=0):
		random.seed(seed)	
		self.auth = random.randint(100000, 999999)
		return self.auth


#message = client.sms.messages.create(to="+17348461759",
#                                     from_="+17348871398",
#				     body="Hello there!")

client = master()

for message in client.getIncomeMessages():
	print "=========="
	print message.from_
	print message.body
