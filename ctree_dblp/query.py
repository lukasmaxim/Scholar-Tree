from django.http import Http404, HttpResponse, HttpResponseRedirect
import os.path
import simplejson
from urllib2 import Request, urlopen, quote
from BeautifulSoup import BeautifulSoup as Soup
import random
import hashlib
import xml.etree.ElementTree as ET
import json

rand_str = str(random.random()).encode('utf8')
google_id = hashlib.md5(rand_str).hexdigest()[:16]
HEADERS = {'User-Agent': 'Mozilla/5.0', 'Cookie': 'GSP=ID=%s' % google_id}

def check_searching(request):
	period = []
	if request.GET.get('researcher'):
		ori_url = request.GET.get('researcher')
		# http://dblp.uni-trier.de/pers/hd/m/Ma:Kwan=Liu
		# http://dblp.uni-trier.de/pers/xx/m/Ma:Kwan=Liu.xml 
		# http://dblp.uni-trier.de/pers/hd/s/Shneiderman:Ben
		# print "request", request
		# ori_url = ori_url.encode('utf8')
		print "ori_url", ori_url
		if ori_url.find("/hd/") != -1:
			xml_url = ori_url.replace("/hd/", "/xx/")
			xml_url += ".xml"

			
			request = Request(xml_url, headers=HEADERS)
			try:
				response = urlopen(request)
				html = response.read()
				html = html.decode('utf8')
				soup = Soup(html)
				all_year = []
				author = soup.person.author.string
				# get all the published years
				
				for y in soup.findAll('year'):
					if y.string not in all_year:
						all_year.append(y.string)
				# print all_year
				period = [all_year[-1], all_year[0], author]
			except Exception:
				period = [-1]
		else:
			period = [-1]
	else:
		raise Http404

	return_json = simplejson.dumps(period, indent=4, use_decimal=True)
	# with open("./ctree_dblp/media/data/research_graph.json", "wb") as json_file:
	# 	json_file.write(return_json)

	return HttpResponse(return_json)


def get_tree_structure(request):
	if request.GET.get('final_setting'): 
		final_setting = json.loads(request.GET.get('final_setting'))
		ori_url = final_setting[0]
		sy = final_setting[1]
		ey = final_setting[2]
		career_period = final_setting[3]
		# http://dblp.uni-trier.de/pers/hd/m/Ma:Kwan=Liu
    	# http://dblp.uni-trier.de/pers/xx/m/Ma:Kwan=Liu.xml 
    	# http://dblp.uni-trier.de/pers/hd/s/Shneiderman:Ben
		xml_url = ori_url.replace("/hd/", "/xx/")
		xml_url += ".xml"

		request = Request(xml_url, headers=HEADERS)
		response = urlopen(request)
		html = response.read()
		html = html.decode('utf8')
		soup = Soup(html)
		author_name =  soup.person.findAll('author')
		author = []
		for n in author_name:
			author.append(n.string)
		display_author = soup.person.author.string
		coauthorship = dict()
		publication = dict()
		coauthorship[author[0]] = [1, int(sy), int(ey), []]
		# with open("./ctree_dblp/data/dblp_test.json", "rb") as json_file:
		# 	retuen_structure = json.load(json_file)

		print author
		unique_author_list = []
		unique_paper_list = []
		for y in soup.findAll('r'):
			co_author_list = []
			p_title = y.title.string
			p_year = y.year.string
			# print p_title
			if int(p_year) <= ey and int(p_year) >= sy:
				unique_paper_list.append(p_title)
			# if int(p_year) > ey or int(p_year) < sy:
			# 	continue
			paper_type = str(y.contents[0]).split('key="')[1].split("/")[0]
			for a in y.findAll('author'):
				co_author_list.append(a.string)
				if len(y.findAll('author')) == 1:
					coauthorship[author[0]][0] += 1 
					coauthorship[author[0]][3].append(p_title)
				if a.string not in author and a.string not in coauthorship:
					coauthorship[a.string] = [1, int(p_year), int(p_year), [p_title]]
					if int(p_year) <= ey and int(p_year) >= sy:
						unique_author_list.append(a.string)
				elif a.string not in author:
					coauthorship[a.string][0] += 1
					coauthorship[a.string][3].append(p_title)
					if int(p_year) < coauthorship[a.string][1]:
						coauthorship[a.string][1] = int(p_year)
					elif int(p_year) > coauthorship[a.string][2]:
						coauthorship[a.string][2] = int(p_year)

			if len(co_author_list) == 0:
				for a in y.findAll('editor'):
					co_author_list.append(a.string)
					if len(y.findAll('editor')) == 1:
						coauthorship[author[0]][0] += 1 
						coauthorship[author[0]][3].append(p_title)
					if a.string not in author and a.string not in coauthorship:
						coauthorship[a.string] = [1, int(p_year), int(p_year), [p_title]]
						if int(p_year) <= ey and int(p_year) >= sy:
							unique_author_list.append(a.string)
					elif a.string not in author:
						coauthorship[a.string][0] += 1
						coauthorship[a.string][3].append(p_title)
						if int(p_year) < coauthorship[a.string][1]:
							coauthorship[a.string][1] = int(p_year)
						elif int(p_year) > coauthorship[a.string][2]:
							coauthorship[a.string][2] = int(p_year)
			if y.pages:
				page_info = str(y.pages.string).split("-")
				if len(page_info) > 1:
					try:
						pages = int(page_info[1]) - int(page_info[0]) + 1
					except:
						pages = 1
				else:
					pages = 1
			else:
				pages = 1

			for a in author:
				try:
					author_order = co_author_list.index(a) + 1
					break
				except ValueError:
					continue

			# author_order = co_author_list.index(author) + 1

			if p_title not in publication:
				publication[p_title] = dict()
				publication[p_title]["coauthor"] = co_author_list
				publication[p_title]["author_count"] = len(co_author_list)-1
				publication[p_title]["author_order"] = int(author_order)
				publication[p_title]["year"] = int(p_year)
				publication[p_title]["type"] = paper_type
				publication[p_title]["pages"] = int(pages)
			else:
				print "<<<", p_title
	    # sys.exit()
		tree_egos, branches, legends = tree_mapping(career_period, publication, coauthorship, author, sy, ey)
		final_structure = dict()
		final_structure["all"] = dict()
		
		for one_ego in tree_egos:
			print one_ego
			one_tree = tree_structure(tree_egos[one_ego], branches)
			final_structure["all"][one_ego] = one_tree

		# sort sticks
		for d in final_structure:
		    for e in final_structure[d]:
		        # print final_structure[d][e]
		        for layer in final_structure[d][e]['right']:
		            layer['level']['down'] = sorted(layer['level']['down'], key=lambda k: k['sorting'])
		            layer['level']['up'] = sorted(layer['level']['up'], key=lambda k: k['sorting'])
		        for layer in final_structure[d][e]['left']:
		            layer['level']['down'] = sorted(layer['level']['down'], key=lambda k: k['sorting'])
		            layer['level']['up'] = sorted(layer['level']['up'], key=lambda k: k['sorting'])
			

	else:
		raise Http404

	
	final_unique_author_list = ["None"] + sorted(unique_author_list)
	final_unique_paper_list = ["None"] + sorted(unique_paper_list)
	# print final_unique_author_list
	# print final_unique_paper_list
	final_return = [final_structure, final_unique_author_list, final_unique_paper_list, legends]
	return_json = simplejson.dumps(final_return, indent=4, use_decimal=True)

	return HttpResponse(return_json)


def tree_mapping(career_period, publication, coauthors, ego, sy, ey):
	tree_egos = dict()
	tree_egos["tree1"] = []
	tree_egos["tree2"] = []
	tree_egos["tree3"] = []
	tree_egos["tree4"] = []
	period = ey - sy + 1
	# gap = 1
	year_gap = []
	color_gap = []
	# branch_layer = period
	if period <= 10:
		gap = 1
	elif 10 < period <= 20:
		gap = 2
	elif 20 < period <= 30:
		gap = 3
	elif 30 < period <= 40:
		gap = 4
	elif 40 < period <= 50:
		gap = 5
	else:
		gap = 6
	# print gap

	start =  int(career_period[0])
	end = int(career_period[1])
	t_gap = int(career_period[2])
	
	for x in range(start+t_gap, end, t_gap):
		# print x
		color_gap.append(int(x))
	
	for y in range(sy+gap, ey, gap):
		year_gap.append(int(y))

	print gap, year_gap, len(year_gap)
	branch_layer = len(year_gap) + 1
	# color_gap = year_gap
    # sys.exit()
    # ["stick", "leaf", "trunk", "branch", "b_side", "leaf_color", "leaf_size", "fruit"]
	for paper in publication:
		if publication[paper]["year"] > ey or publication[paper]["year"] < sy:
				continue
		# solo paper
		if publication[paper]["author_count"] == 0:
			# print paper
			# print "in solo publication"
			first_real_year = 0
			paper_real_year = int(publication[paper]["year"]) - sy
			data1 = [paper, ego[0], "trunk", "branch", "b_side", "leaf_color", "leaf_size", "fruit", ego[0], first_real_year, paper_real_year]
			data2 = [paper, ego[0], "trunk", "branch", "b_side", "leaf_color", "leaf_size", "fruit", ego[0], first_real_year, paper_real_year]
			
			# trunk			
			data1[4] = 0
			data2[2] = 0
            # branch as year
			if publication[paper]["year"] < year_gap[0]:
				data1[3] = 0
				data2[3] = 0
			elif publication[paper]["year"] >= year_gap[-1]:
				data1[3] = len(year_gap)
				data2[3] = len(year_gap)
			else:
				for g in range(len(year_gap)-1):
					if year_gap[g] <= publication[paper]["year"] < year_gap[g+1]:
						data1[3] = g+1
						data2[3] = g+1
			# branch as author order
			# branch side
			if publication[paper]["type"] == "conf":
				# print publication[paper]["type"]
				data1[2] = 0
				data2[4] = 0
			else:
				data1[2] = 1
				data2[4] = 1

			data1[5] = 1 # leaf color for solo paper
			data1[6] = 0 # leaf size for solo paper
	
			data2[5] = 1 # leaf color for solo paper
			data2[6] = 0 # leaf size for solo paper

			p_length = int(publication[paper]["pages"])
			
			if p_length == 1:
				data1[7] = 0 # fruit
			elif 1 < p_length <= 4:
				data1[7] = 0 # fruit
			elif 4 < p_length <= 8:
				data1[7] = 2 # fruit
			elif 8 < p_length <= 12:
				data1[7] = 3 # fruit
			elif 12 < p_length:
				data1[7] = 4 # fruit

			data2[7] = 0
			
			tree_egos["tree1"].append(data1)
			tree_egos["tree2"].append(data2)
			
			continue

		# general paper
		# print paper
		coauthor_order = 1
		for author in publication[paper]["coauthor"]:
			if author in ego:
				coauthor_order += 1
				continue
			first_real_year = int(coauthors[author][1]) - sy
			paper_real_year = int(publication[paper]["year"]) - sy
			data1 = [paper, author, "trunk", "branch", "b_side", "leaf_color", "leaf_size", "fruit", author, first_real_year, paper_real_year] # stick, leaf
			data2 = [paper, author, "trunk", "branch", "b_side", "leaf_color", "leaf_size", "fruit", author, first_real_year, paper_real_year]
			
			# trunk
			if publication[paper]["author_order"] > 1:
				data1[4] = 1
				data2[2] = 1
			else:
				data1[4] = 0
				data2[2] = 0

			# branch as year
			if publication[paper]["year"] < year_gap[0]:
				data1[3] = 0
				data2[3] = 0
			elif publication[paper]["year"] >= year_gap[-1]:
				data1[3] = len(year_gap)
				data2[3] = len(year_gap)
			else:
				for g in range(len(year_gap)-1):
					if year_gap[g] <= publication[paper]["year"] < year_gap[g+1]:
						data1[3] = g+1
						data2[3] = g+1

			# branch side
			if publication[paper]["type"] == "conf":
				# print publication[paper]["type"]
				data1[2] = 0
				data2[4] = 0
			else:
				data1[2] = 1
				# data5[7] = 0 # fruit
				# data6[2] = 1
				data2[4] = 1

			total_collaborate_paper = coauthors[author][0]
			first_collaborated = coauthors[author][1]
			
			if first_collaborated < color_gap[0]:
				data1[5] = 0
				data2[5] = 0
			elif first_collaborated >= color_gap[-1]:
				data1[5] = len(color_gap)
				data2[5] = len(color_gap)
			else:
				for g in range(len(color_gap)-1):
					if color_gap[g] <= first_collaborated < color_gap[g+1]:
						data1[5] = g+1
						data2[5] = g+1
			if len(color_gap) <= 6:
				data1[5] += 2
				data2[5] += 2
			
			if total_collaborate_paper == 1:
				data1[6] = 1 # leaf size
				data2[6] = 1
			elif 1 < total_collaborate_paper <= 3:
				data1[6] = 2 # leaf size
				data2[6] = 2
			elif 3 < total_collaborate_paper <= 5:
				data1[6] = 3 # leaf size
				data2[6] = 3
			elif 5 < total_collaborate_paper <= 10:
				data1[6] = 4 # leaf size
				data2[6] = 4
			elif 10 < total_collaborate_paper <= 20:
				data1[6] = 5 # leaf size
				data2[6] = 5
			elif 20 < total_collaborate_paper:
				data1[6] = 6 # leaf size
				data2[6] = 6

			p_length = int(publication[paper]["pages"])
			
			if p_length == 1:
				data1[7] = 0 # fruit
			elif 1 < p_length < 4:
				data1[7] = 0 # fruit
			elif 4 <= p_length <= 8:
				data1[7] = 2 # fruit
			elif 8 < p_length <= 12:
				data1[7] = 3 # fruit
			elif 12 < p_length:
				data1[7] = 4 # fruit

			# data6[7] = 0 # fruit
			data2[7] = 0 # fruit

			tree_egos["tree1"].append(data1)
			tree_egos["tree2"].append(data2)
			
			coauthor_order += 1

	for coauthor in coauthors:
		# solo paper
		if coauthor == "none":
			print coauthor
			print coauthors[coauthor]
		# data3 = [coauthor, ego[0], "trunk", "branch", "b_side", "leaf_color", "leaf_size", "fruit", "leafid"]
		# data4 = [coauthor, ego[0], "trunk", "branch", "b_side", "leaf_color", "leaf_size", "fruit", "leafid"]
		data3_stick = [coauthor, ego[0], "trunk", "branch", "b_side"]
		data4_stick = [coauthor, ego[0], "trunk", "branch", "b_side"]
		
		# trunk
		if coauthors[coauthor][0] >= 5:
			data3_stick[2] = 1
			data4_stick[2] = 1
		else:
			data3_stick[2] = 0
			data4_stick[2] = 0

        # branch as year
		if coauthors[coauthor][1] < year_gap[0]:
			data3_stick[3] = 0
			data4_stick[3] = 0
		elif coauthors[coauthor][1] >= year_gap[-1]:
			data3_stick[3] = len(year_gap)
			data4_stick[3] = len(year_gap)
		else:
			for g in range(len(year_gap)-1):
				if year_gap[g] <= coauthors[coauthor][1] < year_gap[g+1]:
					data3_stick[3] = g+1
					data4_stick[3] = g+1

		co_period = coauthors[coauthor][2] - coauthors[coauthor][1] + 1
		co_frequency = float(coauthors[coauthor][0]) / float(co_period)
		# print co_frequency
		if co_frequency > 1:
			data3_stick[4] = 0
			data4_stick[4] = 0
		else:
			data3_stick[4] = 1
			data4_stick[4] = 1

		fruit_val = 0
		if coauthor == "none":
			fruit_val = 5

		first_real_year = int(coauthors[coauthor][1]) - sy
		for paper in coauthors[coauthor][3]:
			if publication[paper]["year"] > ey or publication[paper]["year"] < sy:
				continue
			paper_real_year = int(publication[paper]["year"]) - sy
			data3 = data3_stick + ["leaf_color", "leaf_size"] + [fruit_val, paper, paper_real_year, first_real_year]
			data4 = data4_stick + ["leaf_color", "leaf_size", 0, paper, paper_real_year, first_real_year]
			
			if publication[paper]["type"] == "journals":# "conf":
				data3[5] = 4
				# data4[4] = 0
			elif publication[paper]["type"] == "conf":
				data3[5] = 6
				# data4[4] = 1
			else:
				# print "*", publication[paper]["type"]
				data3[5] = 0

			# co-author order
			# leaf size
			order = publication[paper]["author_order"]
			if order >= 5:
				data4[6] = 1
			elif order <= 1:
				data4[6] = 5
			elif order == 2:
				data4[6] = 4
			elif order == 3:
				data4[6] = 3
			elif order == 4:
				data4[6] = 2
			# if order <= 1:
			# 	data4[6] = 1
			# elif order >= 5:
			# 	data4[6] = 5
			# else:
			# 	data4[6] = order
			

			p_length = int(publication[paper]["pages"])
			
			# leaf size
			if p_length == 1:
				data3[6] = 1
			elif 1 < p_length <= 4:
				data3[6] = 2
			elif 4 < p_length <= 8:
				data3[6] = 3
			elif 8 < p_length <= 12:
				data3[6] = 4
			elif 12 < p_length:
				data3[6] = 5

			# leaf color
			if publication[paper]["year"] < color_gap[0]:
				data4[5] = 0
			elif publication[paper]["year"] >= color_gap[-1]:
				data4[5] = len(color_gap) 
			else:
				for g in range(len(color_gap)-1):
					if color_gap[g] <= publication[paper]["year"] < color_gap[g+1]:
						data4[5] = g+1
			if len(color_gap) <= 6:
				data4[5] += 2
			# if coauthor == "none":
			# 	print data4

			tree_egos["tree3"].append(data3)
			tree_egos["tree4"].append(data4)
			
			
	return tree_egos, branch_layer, color_gap


def tree_structure(tree_ego, branch_layer):
	structure = dict()
	egoid_index = -1
	alterid_index = 0
	# leafid_index = 1
	trunk_index = 2
	branch_index = 3
	bside_index = 4
	leaf_color_index = 5
	leaf_size_index = 6
	fruit_size_index = 7

	sorting_index = 10
	leafid_index = 8
	order_index = 9

	# branch_layer = 10
	stick = alterid_index
	

	# print stick_unique
	structure["right"] = []
	structure["left"] = []

	alter_array_right_up = []
	alter_array_left_up = []
	alter_array_right_down = []
	alter_array_left_down = []

	for total in range(branch_layer):
		structure["right"].append({"level": {"up": [], "down": []}})
		structure["left"].append({"level": {"up": [], "down": []}})
		alter_array_right_up.append([])
		alter_array_left_up.append([])
		alter_array_right_down.append([])
		alter_array_left_down.append([])

	# for tree in tree_egos:
	# ["stick", "leaf", "trunk", "branch", "b_side", "leaf_color", "leaf_size", "fruit"]
	for meeting in tree_ego:
		# print "********"
		# print meeting
		# left
		if meeting[trunk_index] == 0:
			level = 0
			new_alter = -1
			for l in range(branch_layer):
				# level and up
				if meeting[branch_index] == l and meeting[bside_index] == 1:
					if len(alter_array_left_up[level]) == 0:
						structure["left"][level]["level"]["up"].append({"id": meeting[stick], "fruit": meeting[fruit_size_index],  "sorting": meeting[sorting_index], "leaf": []})
						structure["left"][level]["level"]["up"][len(alter_array_left_up[level])]["leaf"].append({"size": meeting[leaf_size_index], "color": meeting[leaf_color_index], "leaf_id": meeting[leafid_index], "order": meeting[order_index]}) 
						alter_array_left_up[level].append(meeting[stick])

					else:
						count_alter = 0
						for a in alter_array_left_up[level]:
							if meeting[stick] == a:
								new_alter = count_alter
								break
							count_alter += 1
						if new_alter == -1:
							structure["left"][level]["level"]["up"].append({"id": meeting[stick], "fruit": meeting[fruit_size_index], "sorting": meeting[sorting_index], "leaf": []})
							structure["left"][level]["level"]["up"][len(alter_array_left_up[level])]["leaf"].append({"size": meeting[leaf_size_index], "color": meeting[leaf_color_index], "leaf_id": meeting[leafid_index], "order": meeting[order_index]})
							alter_array_left_up[level].append(meeting[stick])
						else:
							structure["left"][level]["level"]["up"][new_alter]["leaf"].append({"size": meeting[leaf_size_index], "color": meeting[leaf_color_index], "leaf_id": meeting[leafid_index], "order": meeting[order_index]})
					break

				# level and down
				elif meeting[branch_index] == l and meeting[bside_index] == 0:
					if len(alter_array_left_down[level]) == 0:
						structure["left"][level]["level"]["down"].append({"id": meeting[stick], "fruit": meeting[fruit_size_index], "sorting": meeting[sorting_index], "leaf": []})
						structure["left"][level]["level"]["down"][len(alter_array_left_down[level])]["leaf"].append({"size": meeting[leaf_size_index], "color": meeting[leaf_color_index], "leaf_id": meeting[leafid_index], "order": meeting[order_index]})
						alter_array_left_down[level].append(meeting[stick])
					else:
						count_alter = 0
						for a in alter_array_left_down[level]:
							if meeting[stick] == a:
								new_alter = count_alter
								break
							count_alter += 1
						if new_alter == -1:
							structure["left"][level]["level"]["down"].append({"id": meeting[stick], "fruit": meeting[fruit_size_index], "sorting": meeting[sorting_index], "leaf": []})
							structure["left"][level]["level"]["down"][len(alter_array_left_down[level])]["leaf"].append({"size": meeting[leaf_size_index], "color": meeting[leaf_color_index], "leaf_id": meeting[leafid_index], "order": meeting[order_index]})
							alter_array_left_down[level].append(meeting[stick])
						else:
							structure["left"][level]["level"]["down"][new_alter]["leaf"].append({"size": meeting[leaf_size_index], "color": meeting[leaf_color_index], "leaf_id": meeting[leafid_index], "order": meeting[order_index]})
					break
				level += 1
		# right
		else:
			level = 0
			new_alter = -1
			for l in range(branch_layer):
				# level and up
				if meeting[branch_index] == l and meeting[bside_index] == 1:
					if len(alter_array_right_up[level]) == 0:
						structure["right"][level]["level"]["up"].append({"id": meeting[stick], "fruit": meeting[fruit_size_index], "sorting": meeting[sorting_index], "leaf": []})
						structure["right"][level]["level"]["up"][len(alter_array_right_up[level])]["leaf"].append({"size": meeting[leaf_size_index], "color": meeting[leaf_color_index], "leaf_id": meeting[leafid_index], "order": meeting[order_index]})
						alter_array_right_up[level].append(meeting[stick])
					else:
						count_alter = 0
						for a in alter_array_right_up[level]:
							if meeting[stick] == a:
								new_alter = count_alter
								break
							count_alter += 1
						if new_alter == -1:
							structure["right"][level]["level"]["up"].append({"id": meeting[stick], "fruit": meeting[fruit_size_index], "sorting": meeting[sorting_index], "leaf": []})
							structure["right"][level]["level"]["up"][len(alter_array_right_up[level])]["leaf"].append({"size": meeting[leaf_size_index], "color": meeting[leaf_color_index], "leaf_id": meeting[leafid_index], "order": meeting[order_index]})
							alter_array_right_up[level].append(meeting[stick])
						else:
							structure["right"][level]["level"]["up"][new_alter]["leaf"].append({"size": meeting[leaf_size_index], "color": meeting[leaf_color_index], "leaf_id": meeting[leafid_index], "order": meeting[order_index]})
					break
				# level and down
				elif meeting[branch_index] == l and meeting[bside_index] == 0:
					if len(alter_array_right_down[level]) == 0:
						structure["right"][level]["level"]["down"].append({"id": meeting[stick], "fruit": meeting[fruit_size_index], "sorting": meeting[sorting_index], "leaf": []})
						structure["right"][level]["level"]["down"][len(alter_array_right_down[level])]["leaf"].append({"size": meeting[leaf_size_index], "color": meeting[leaf_color_index], "leaf_id": meeting[leafid_index], "order": meeting[order_index]})
						alter_array_right_down[level].append(meeting[stick])
					else:
						count_alter = 0
						for a in alter_array_right_down[level]:
							if meeting[stick] == a:
								new_alter = count_alter
								break
							count_alter += 1
						if new_alter == -1:
							structure["right"][level]["level"]["down"].append({"id": meeting[stick], "fruit": meeting[fruit_size_index], "sorting": meeting[sorting_index], "leaf": []})
							structure["right"][level]["level"]["down"][len(alter_array_right_down[level])]["leaf"].append({"size": meeting[leaf_size_index], "color": meeting[leaf_color_index], "leaf_id": meeting[leafid_index], "order": meeting[order_index]})
							alter_array_right_down[level].append(meeting[stick])
						else:
							structure["right"][level]["level"]["down"][new_alter]["leaf"].append({"size": meeting[leaf_size_index], "color": meeting[leaf_color_index], "leaf_id": meeting[leafid_index], "order": meeting[order_index]})
					break
				level += 1

	return structure