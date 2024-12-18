#!/opt/local/bin/python

import csv
import sys
from pprint import pprint
from unidecode import unidecode

xx1 = { 'Category':{'Name':"Application",                               'Owner': "aa", 'Arch': "", 'Desc': "" } }
xx2 = { 'Category':{'Name':"Application->Cloud Native",                 'Owner': "bb", 'Arch': "", 'Desc': "" } }
xx3 = { 'Category':{'Name':"Application->Cloud Native->Micro Services", 'Owner': "cc", 'Arch': "", 'Desc': "" }, 'Product': { 'Name': "abc", 'Status': "green" } }
xx4 = { 'Category':{'Name':"Software",                                  'Owner': "dd", 'Arch': "", 'Desc': "" } }
xx5 = { 'Category':{'Name':"Software->Microsoft",                       'Owner': "dd", 'Arch': "", 'Desc': "" }, 'Product': { 'Name': "Powerpoint", 'Status': "green" } }
xx6 = { 'Category':{'Name':"Software->Microsoft",                       'Owner': "dd", 'Arch': "", 'Desc': "" }, 'Product': { 'Name': "Outlook", 'Status': "red" } }

debuglvl=0

def Debug(lvl,format,*args):
	if debuglvl >= lvl:
		sys.stdout.write(format % args)

def printf(format,*args):
	sys.stdout.write(format % args)

def UTFstr2ascii(xx):
	xx = unidecode(xx)
	if xx[0] == '"' and xx[len(xx)-1] == '"':
		xx=xx.replace('\"','')
	xx=xx.replace('\'','')
	xx=xx.replace('\"','')
	return xx

class Node:
	Obj = {}
	CatKeys = [ "Name","Owner","Arch","Desc"]
	Root = "Root"

	###
	def __init__(self, __obj=None ):
		if __obj==None:
			__obj=self.Root
		if isinstance(__obj,str):
			self.Obj['Name']=__obj
		if isinstance(__obj,dict):
			self.Obj = __obj
			if not 'Name' in __obj:
				self.Obj['Name']=self.Root

		self.Obj['Category'] = {}
		self.Obj['Lvl'] = 0
		self.Obj['Products'] = []

	###
	def Add(self, obj):
		if not isinstance(obj,dict):
			printf("Wrong Type\n")
			exit(0)

		# Iterate through the category parts and if found move to next node
		depth = self.Obj['Lvl']
		parts = [ x.strip() for x in obj['Category']['Name'].split('->') ]
		
		Debug(1,"Add [%s] lenparts=%d\n",obj['Category']['Name'],len(parts))
		for i,px in enumerate(parts):
			Debug(1,"Part %d Want >>%s<<\n",i,px)
			depth = depth+1
			if px in self.Obj['Category'].keys():
				self=self.Obj['Category'][px]
			else:
				tmpself=Node( { 'Name': px } )
				tmpself.Obj['Lvl']=depth
				tmpself.copyCat(obj['Category'])

				self.Obj['Category'][px]=tmpself
				self=tmpself

			if i == len(parts)-1:
				if 'Product' in obj and obj['Product']['Name']:
					#Debug(1,"Adding Product [%s]\n",obj['Product'])
					self.copyProducts(obj['Product'])

	###
	def copyCat(self, obj):
		for cat in obj:
			if cat != "Name" and obj[cat] != "":
				self.Obj[cat] = obj[cat]

	###
	def copyProducts(self, obj):
		self.Obj['Products'].append(obj)
				
	###
	def indent(self, n):
		if n==0:
			return ""	
		return "    "*n

	###
	def Print(self, terse=None, prefix=None):
		if terse==None:
			terse=0
		if prefix == None:
			prefix=""
		if self.Obj['Name']==self.Root and prefix=="":
			prefix=self.Root

		printf("%d [%s] ",self.Obj['Lvl'], prefix)
		if terse>0:
			self.PrintObj(0,0)
			if len(self.Obj['Category']) > 0:
				self.PrintSubSections(0)
			if len(self.Obj['Products']) > 0:
				self.PrintProducts(0)
		printf("\n")

	###
	def PrintObj(self, z, more):
		olen=len(self.Obj)-1;	
		for i, key in enumerate(self.Obj):
			if key == "Category" or key == "Products":
				continue

			ch=" " if i == olen else ","
			if more:
				ch=","
			printf("%s\"%s\": \"%s\"%s\n",self.indent(z),key,self.Obj[key],ch)

	###
	def PrintProducts(self, z):
		plen=len(self.Obj['Products'])-1
		printf("%s\"Products\": [ {\n",self.indent(z))
		for i, obj in enumerate(self.Obj['Products']):
			more=0 if i == plen else 1

			klen = len(obj.keys())-1
			for i, key in enumerate(obj.keys()):
				ch="\n" if i == klen else ",\n"
				printf("%s\"%s\": \"%s\"%s",self.indent(z+1),key,obj[key],ch)

			ch="}, {\n" if more else ""
			printf("%s%s",self.indent(z),ch)
		printf("} ]\n")

	###
	def PrintSubSections(self, z, more):
		clen=len(self.Obj['Category'])-1
		printf("%s\"Subsections\": [ {\n",self.indent(z))
		for i, key in enumerate(self.Obj['Category'].keys()):
			self.Obj['Category'][key].JSON(i, (i != clen))
		ch="," if more else ""
		printf(" ]%s\n",ch)

	###
	def JSON(self, idx=0, more=0):
		if self.Obj['Name'] == self.Root:
			printf("{\n")

		z=self.Obj['Lvl']+1

		#printf(">>Len obj = %d [%s]>>\n",len(self.Obj), ",".join(list(self.Obj.keys())))
		clen=len(self.Obj['Category'])
		plen=len(self.Obj['Products'])
		
		self.PrintObj(z,clen+plen)

		if clen > 0:
			self.PrintSubSections(z,plen)

		if plen > 0:
			self.PrintProducts(z)

		if self.Obj['Name'] != self.Root:
			ch=", {\n" if more else ""
			#ch="" if more == 0 else ", {\n"
			printf("%s}%s",self.indent(z-1),ch)
		else:
			printf("}\n")

test=2

tree = Node()

if test==1:
	#tree.Add( xx1 )
	#tree.Add( xx2 )
	#tree.Add( xx3 )
	#tree.Add( xx4 )
	tree.Add( xx5 )
	tree.Add( xx6 )
	#tree.Print()
	tree.JSON()

if test==2:
	with open('TechnologiesInventory.csv', mode='r', encoding='utf-8') as file:
		csvFile = csv.reader(file)
		i=0

		# "Name","Owner","Arch","Desc","Status","Prod"
		for row in csvFile:
			for idx,val in enumerate(row):
				if val == "":
					continue;
				row[idx]=UTFstr2ascii(row[idx])
			
			if (i == 0 and row[0] == "Level 1") or len(row[10]) == 0:
				continue

			category = UTFstr2ascii(row[10])
			category = category.replace("  -> ","->")
			category = category.replace(" -> ","->")

			desc=row[12]
			owner=row[14]
			arch=row[16]
			prod=row[17]
			status=row[24]
			
			#printf("%3d [%s]\n",i,category)
			tree.Add( { 'Category': { 'Name':   category,
						'Owner':  owner,
						'Arch':   arch,
						'Desc':   desc },
				    	'Product':  { 'Name':   prod,
						'Status': status } } )
			i=i+1

	tree.JSON()
