//PAIRED CHALLENGES
var PCs = {
	milestones: {
		11: "Replicanti Compressors are better. (per PC level)",
		21: "The minimum Color Power adds all Color Powers by 25%.",
		31: "Meta Accelerator slowdown starts 1% later per PC level.",
		41: "More galaxies are contributed to Positronic Charge.",
		51: "Sacrificed sources are greatly stronger.",
		61: "The QC6 reward is squared.",
		71: "Meta Accelerator accelerates faster based on your PC level.",
		81: "EC14 reward power speeds up Replicantis more.",

		12: "Unlock Replicated Dilaters.",
		22: "Raise the Color Power effects based on PC level.",
		32: "Replicanti Stealth boosts interval from Meta Accelerator.",
		42: "Positronic Boosts affect the charge requirement less.",
		52: "Replicated Compressors raise Replicanti Energy by an exponent.",
		62: "Eternitying timewraps Meta Dimensions and Replicantis by 3 seconds.",
		72: "Mastery Studies are 5x cheaper.",
		82: "Remote Galaxies scaling is slower based on its starting point.",

		13: "Unlock Replicated Expanders.",
		23: "Color Charge multiplies its respective efficency by 10%.",
		33: "Meta Accelerator raises Replicate Chance to an exponent.",
		43: "Tier 1 - 2 charges are closer to Tier 3.",
		53: "Compressor Time raises Replicanti Stealth to Chance.",
		63: "QC6 reward decay is 5x slower.",
		73: "Remove the second softcap of TT generation.",
		83: "Unlock the Omega Sets.",

		14: "Perk: Gain extra Compressors on quick Compressing",
		24: "Perk: Mastery is stronger, but requires more",
		34: "Perk: Start with 1 TP and EP boosts Meta Dimensions",
		44: "Perk: Disable galaxies separately in dilation",
		54: "Perk: Double the Replicanti Energy effects",
		64: "Perk: Eternity time is 5x slower",
		74: "Perk: Temporaily convert base RGs into extra base RGs",
		84: "Perk: Master the Entangled Boosts that are matched",

		15: "Compressing keeps you dilated, and also give you 1 Dilater.",
	},
	setupData() {
		var data = {
			row_unls: [null,
				true,
				() => PCs_save.lvl >= PCs.lvlReq(21),
				() => PCs_save.lvl >= PCs.lvlReq(31),
				() => PCs_save.lvl >= PCs.lvlReq(41) && str.unl(),
				() => PCs.milestoneDone(83),
				() => PCs.milestoneDone(83) && fluc.unl() && PCs.lvl >= 14,
				() => PCs.milestoneDone(83) && fluc.unl() && PCs.lvl >= 18,
				false
			],
			goal_divs: [null, 0.1, 0.95, 0.35, 0.95, 0.45, 0.5, 0.4, 0.775],
			milestone_reqs: [null, 1, 2, 3, 4, 5],
			milestone_unls: [null,
				true,
				true,
				() => hasAch("ng3pr12"),
				() => hasAch("ng3pr12"),
				() => fluc.unl()
			],
			letters: [null, "A", "B", "C", "D", "Ω1", "Ω2", "Ω3", "Ω4"],
			all: [],
			setup: true
		}
		PCs.data = data
		el("pc_table").innerHTML = ""

		for (var x = 1; x <= 8; x++) {
			for (var y = 1; y < x; y++) {
				data.all.push(y * 10 + x)
			}
		}
	},

	setup() {
		PCs_save = {
			challs: {},
			comps: [],
			lvl: 1,
			best: PCs_save && PCs_save.best
		}
		qu_save.pc = PCs_save
		return PCs_save
	},
	compile() {
		PCs.data = {}
		PCs_tmp = { unl: PCs.unl() }
		if (!tmp.ngp3 || qu_save === undefined) {
			this.updateTmp()
			return
		}

		let data = PCs_save || this.setup()
		if (data.best === undefined) data.best = data.lvl - 1

		this.updateTmp()
		this.updateUsed()
	},
	reset() {
		PCs_save = this.setup()

		this.updateTmp()
		this.updateUsed()
		this.updateDisp()
		this.resetButtons()
	},

	unl: (force) => force ? (QCs_save && QCs.done(7)) || fluc.unl() : PCs_tmp.unl,
	updateTmp() {
		if (!PCs_tmp.unl) return
		if (!PCs.data.setup) this.setupData()
		var data = PCs_tmp

		//Occupation (Picking)
		PCs_tmp.occupied = []
		if (PCs_tmp.pick) {
			var l = PCs_tmp.picked.length + 1
			var f = PCs_tmp.picked[0]
			var s = Math.floor(PCs_tmp.pick / 10)
			var c = PCs_save.challs
			for (var i = 1; i <= 4; i++) {
				var c_a = c[s * 10 + i]
				if (c_a) {
					this.occupy(Math.floor(c_a / 10))
					this.occupy(c_a % 10)
				}
			}

			if (f) this.occupy(f)
			if (l == 1) {
				var d = PCs_tmp.used.d1
				for (var i = 0; i < d.length; i++) this.occupy(d[i])
			}
			if (l == 2) {
				var d = PCs_tmp.used.d2
				for (var i = 1; i <= 8; i++) {
					var p = PCs.sort(i * 10 + f)
					if (d.includes(p)) this.occupy(i)
				}

				var p1 = PCs_tmp.used.p1
				var p2 = PCs_tmp.used.p2
				var omega = PCs_tmp.pick < 50
				var p = p1.includes(PCs_tmp.picked[0]) ? p1 : p2
				for (var i = 1; i <= 8; i++) if (omega == p.includes(i)) this.occupy(i)
			}
		}

		//Positionist
		data.comps = {}
		data.row_comps = {}
		for (var i = 1; i <= 8; i++) {
			data.comps[i] = 0
			data.row_comps[i] = 0
		}
		for (var i = 0; i < PCs_save.comps.length; i++) {
			var id = PCs.convBack(PCs_save.comps[i])
			data.comps[id[0]]++
			data.comps[id[1]]++
		}
		for (var y = 1; y <= 7; y++) {
			for (var x = 1; x <= 4; x++) {
				var c = PCs_save.challs[y * 10 + x]
				if (PCs_save.comps.includes(c)) data.row_comps[y]++
			}
		}


		//Level up!
		var oldLvl = PCs_save.lvl
		var comps = PCs_save.comps.length
		while (PCs_save.lvl < 17 && comps >= PCs_save.lvl) PCs_save.lvl++
		if (PCs.data.setupHTML && PCs_save.lvl > oldLvl) this.resetButtons()
		PCs_save.best = Math.max(PCs_save.best, comps)
		PCs_save.best = Math.max(PCs_save.best, PCs_save.lvl - 1)

		//Boosts
		var eff = (PCs_save.lvl - 1) / 28
		data.eff1_base = 1 + 0.75 * eff
		data.eff1_start = qu_superbalanced() ? 1000 : tmp.ngp3_mul ? 125 : 150
		data.eff2 = Math.sqrt(eff) * Math.pow(1.03, eff * 4) / 3
	},
	occupy(x, c) {
		var d = PCs_tmp.occupied
		if (!d.includes(x)) d.push(x)
	},

	updateUsed() {
		if (!PCs_tmp.unl || !PCs_save.challs) return
		PCs_tmp.used = {
			d1: [],
			d2: [],

			p1: [],
			p2: [],

			d1_tmp: {},
			p_tmp: []
		}
		for (var y = 1; y <= 4; y++) {
			for (var x = 1; x <= 4; x++) {
				var c = PCs_save.challs[y * 10 + x]
				if (c) {
					this.increaseUsed(c, 1)
					this.increaseUsed(c, 2)
					PCs_tmp.used.d2.push(PCs.sort(c))
				}
			}
		}
	},
	increaseUsed(c, dig) {
		var y = dig == 1 ? Math.floor(c / 10) : c % 10
		var used = PCs_tmp.used
		var dig_other = (dig % 2) + 1
		var y_other = dig_other == 1 ? Math.floor(c / 10) : c % 10

		var d = used["d1_tmp"]
		d[y] = (d[y] || 0) + 1
		if (d[y] == 7) used.d1.push(y)

		if (!used.p_tmp.includes(y)) {
			var p = used["p" + dig]
			var p_other = used["p" + dig]
			if (p.includes(y) || p_other.includes(y_other)) p = used["p" + dig_other]

			p.push(y)
			used.p_tmp.push(y)
		}
	},

	assign(x) {
		var picked = PCs_tmp.picked
		if (picked.includes(x)) {
			PCs_tmp.picked = []
		} else if (PCs_tmp.occupied.includes(x)) return
		else {
			picked.push(x)
			if (picked.length == 2) {
				if (PCs_tmp.used.p1.includes(picked[1]) || PCs_tmp.used.p2.includes(picked[0])) picked = [picked[1], picked[0]]

				PCs_save.challs[PCs_tmp.pick] = picked[0] * 10 + picked[1]
				PCs.updateUsed()

				delete PCs_tmp.pick
				PCs.resetButtons()
			}
		}
		PCs.updateTmp()
		PCs.updateDisp()
	},
	start(x) {
		if (!PCs.posUnl(x)) return
		if (PCs_tmp.pick && PCs_tmp.pick != x) return
		var c = PCs_save.challs
		if (c[x]) {
			quantum(false, true, {pc: x}, "pc")
			return
		} else {
			if (PCs_tmp.pick == x) delete PCs_tmp.pick
			else PCs_tmp.pick = x
			PCs_tmp.picked = []

			PCs.updateTmp()
			PCs.resetButtons()
			PCs.updateDisp()
		}
	},
	in(x) {
		return PCs_save && PCs_save.in
	},
	goal(pc, pos) {
		var list = pc || QCs_tmp.in
		if (this.overlapped(list)) return QCs.getGoalMA(pc % 10, "ol")
		if (typeof(list) == "number") list = this.convBack(list)
		pos = pos || PCs_save.in

		var qc1 = QCs.data[list[0]].goalMA
		var qc2 = QCs.data[list[1]].goalMA
		var div = PCs.data.goal_divs[list[0]] + PCs.data.goal_divs[list[1]] + 1
		var relDiv = div
		if (fluc.unl() && fluc_tmp.temp) relDiv += fluc_tmp.temp.pc

		var base = Number.MAX_VALUE
		var r = qc1.pow(qc2.log(base) / relDiv)

		var scaling = 1
		if (str.unl() && str_tmp.effs) scaling /= str_tmp.effs.b2

		var mul = PCs_save.comps.length * Math.max(PCs_save.comps.length / 4, 3) * scaling + //Completion Scaling
			(Math.floor(pos / 10) - 1) + //Row Scaling
			PCs_tmp.row_comps[Math.floor(pos / 10)] - //Row Completion Scaling
			(PCs_tmp.row_comps[5] + PCs_tmp.row_comps[6] + PCs_tmp.row_comps[7]) * 5 //Omega Sets
		if (pos >= 50) mul += Math.floor(pos / 10) - 4

		var pow = Math.pow(1 + div / 150, mul)
		if (str.unl() && str_tmp.effs) pow /= str_tmp.effs.a2
		return r.pow(pow)
	},
	done(pc) {
		return PCs.unl() && PCs_save.comps.includes(this.sort(pc))
	},
	posDone(pc) {
		return PCs.done(PCs_save.challs[pc])
	},
	conv(c1, c2) {
		if (!c1) { //Current (No augments)
			c1 = QCs_tmp.in[0]
			c2 = QCs_tmp.in[1]
		} else if (typeof(c1) !== "number") { //Table lookup
			c2 = c1[1]
			c1 = c1[0]
		}
		return c1 * 10 + c2
	},
	convBack(pc) {
		return [Math.floor(pc / 10), pc % 10]
	},
	sort(pc) {
		if (!pc) return
		if (typeof(pc) != "number") {
			if (pc[0] > pc[1]) pc = [pc[1], pc[0]]
			return pc
		}
		return Math.min(pc, Math.floor(pc / 10) + (pc % 10) * 10)
	},
	name(pc) {
		return PCs.data.letters[Math.floor(pc / 10)] + pc % 10
	},
	milestoneUnl(pos) {
		if (!PCs.unl()) return false
		if (!PCs_tmp.comps) return false
		return evalData(PCs.data.milestone_unls[pos])
	},
	milestoneDone(pos) {
		if (!PCs.milestoneUnl(pos % 10)) return false
		if (hasAch("ng3pr17") && pos % 10 == 1) return true
		return PCs_tmp.comps[Math.floor(pos / 10)] >= PCs.data.milestone_reqs[pos % 10]
	},
	lvlReq(pc) {
		let y = Math.floor(pc / 10)
		if (y > 4) return this.rowUnl(y) ? 0 : 1/0

		let lvl = pc % 10
		if (y >= 3) lvl += y * 3 - 1
		else if (y == 2) lvl += 2
		return lvl
	},
	posUnl(pc) {
		let y = Math.floor(pc / 10)
		if (y > 4) return PCs.milestoneDone(83) && (pc % 10 == 1 || PCs.posDone(pc - 1))

		let lvl = pc % 10
		if (y >= 3) lvl += y * 3 - 1
		else if (y == 2) lvl += 2

		return PCs_save.comps.length + 1 >= lvl
	},
	rowUnl(x) {
		return evalData(PCs.data.row_unls[x])
	},
	overlapped(x) {
		return Math.floor(x / 10) == x % 10
	},

	setupButton: (pc) => '<td><button id="pc' + pc + '" class="challengesbtn" style="border-radius: 10px" onclick="PCs.start(' + pc + ')"></button></td>',
	buttonTxt(pc) {
		var id = PCs.sort(PCs_save.challs[pc])
		var r = '<b style="font-size: 16px">' + PCs.name(pc) + "</b>"
		if (PCs.posUnl(pc)) r += '<br>' + (
			PCs_save.challs[pc] ? "QC " + wordizeList(PCs.convBack(id), false, " + ", false) :
			PCs_tmp.pick == pc ? "Cancel" :
			!PCs_tmp.pick ? "Assign" : ""
		) + (
			PCs_tmp.pick || !PCs_save.challs[pc] || PCs.posDone(pc) ? "" : "<br>Goal: " + shorten(PCs.goal(id, pc)) + " MA"
		)
		return r
	},
	setupMilestone: (qc) => (qc % 4 == 1 ? "<tr>" : "") + "<td id='pc_comp" + qc + "_div' style='text-align: center'><span style='font-size: 20px'>QC" + qc + "</span><br><span id='pc_comp" + qc + "' style='font-size: 15px'>0 / 8</span><br><button class='secondarytabbtn' onclick='PCs.showMilestones(" + qc + ")'>Show</button></td>" + (qc % 4 == 0 ? "</tr>" : ""),
	setupMilestoneHeader() {
		var x = "<tr><td></td>"
		for (var i = 1; i < PCs.data.milestone_reqs.length; i++) x += "<td id='qc_milestone_header_" + i + "'></td>"
		x += "</tr>"
		return x
	},
	setupMilestoneRow(qc) {
		var x = "<tr id='qc_milestone_all_" + qc + "'><td>QC" + qc + "</td>"
		for (var i = 1; i < PCs.data.milestone_reqs.length; i++) {
			var id = qc * 10 + i
			x += "<td id='qc_milestone_" + id + "_div'><button class='qMs_reward small_milestone' id='qc_milestone_" + id + "'>???</button></td>"
		}
		x += "</tr>"
		return x
	},
	setupHTML() {
		var el_ = el("pc_table")
		var data = PCs.data
		if (PCs.data.setupHTML) return
		data.setupHTML = true

		//Setup milestones
		var html = ""
		for (var i = 1; i <= 8; i++) html += this.setupMilestone(i)
		el("qc_milestones").innerHTML = html

		//Setup buttons
		var html = "<br>"
		for (var i = 1; i <= 8; i++) html += "<button id='pc_pick" + i + "' style='height: 60px; width: 60px' onclick='PCs.assign(" + i + ")'>QC" + i + "</button>"
		el("pc_pick").innerHTML = html

		//Setup header
		var html = "<td></td>"
		for (var x = 1; x <= 4; x++) html += "<td>#" + x + "</td>"
		el_.insertRow(0).innerHTML = html

		//Setup rows
		for (var y = 1; y <= 8; y++) {
			var html = "<td>Set " + this.data.letters[y] +
			"<br><button class='storebtn' id='pc_respec_" + y + "' style='height: 24px; width: 60px' onclick='PCs.respec(" + y + ")'>Respec</button>" +
			"<br><button class='storebtn' id='pc_export_" + y + "' style='height: 24px; width: 60px' onclick='PCs.exportRow(" + y + ")'>Export</button>" +
			"</td>"
			for (var x = 1; x <= 4; x++) html += this.setupButton(y * 10 + x)

			var row = el_.insertRow(y)
			row.innerHTML = html
			row.id = 'pc_row_' + y
		}

		//Setup "all milestones"
		var html = this.setupMilestoneHeader()
		for (var c = 1; c <= 8; c++) html += this.setupMilestoneRow(c)
		el("qc_milestone_all").innerHTML = html

		this.resetButtons()
		this.updateDisp()
	},
	updateButton(pc, exit) {
		if (!PCs.data.setupHTML) return

		var el_ = el("pc" + pc)
		if (PCs_save.lvl < PCs.lvlReq(pc)) {
			el_.style.display = "none"
			return
		}

		el_.style.display = ""
		el_.className = (
			!PCs.posUnl(pc) ? "lockedchallengesbtn" :
			PCs_tmp.pick ? (PCs_tmp.pick == pc ? "onchallengebtn" : "lockedchallengesbtn") :
			PCs_save.in == pc && !exit ? "onchallengebtn" :
			PCs_save.challs[pc] && PCs_save.comps.includes(PCs.sort(PCs_save.challs[pc])) ? "completedchallengesbtn" :
			PCs_save.challs[pc] ? "quantumbtn" : "challengesbtn"
		)
		el_.innerHTML = this.buttonTxt(pc)
	},
	resetButtons(force) {
		if (!PCs.unl()) return
		var data = PCs.data
		for (var y = 1; y <= 8; y++) {
			for (var x = 1; x <= 4; x++) this.updateButton(y * 10 + x)
		}
	},

	updateDisp() {
		if (!PCs_tmp.unl) return
		if (!PCs.data.setupHTML) return
		var data = PCs

		for (var i = 1; i <= 8; i++) {
			el("pc_comp" + i + "_div").style.display = PCs_tmp.comps[i] ? "" : "none"
			el("pc_comp" + i).textContent = PCs_tmp.comps[i] + " / 7"
		}

		el("pc_lvl").textContent = "Level " + getFullExpansion(PCs_save.lvl)
		el("pc_comps").textContent = PCs_save.lvl > 28 ? "" : ": " + getFullExpansion(PCs_save.comps.length) + " completed / " + getFullExpansion(PCs_save.lvl)
		for (var i = 1; i <= 8; i++) {
			var respec = PCs_save.challs[i * 10 + 1] || PCs_save.challs[i * 10 + 2] || PCs_save.challs[i * 10 + 3] || PCs_save.challs[i * 10 + 4]
			el("pc_row_" + i).style.display = data.rowUnl(i) ? "" : "none"
			el("pc_respec_" + i).style.display = respec ? "" : "none"
			el("pc_export_" + i).style.display = respec ? "" : "none"
		}
		el("pc_info").style.display = PCs_save.lvl == 1 ? "none" : ""
		el("pctabbtn_milestone").style.display = PCs_save.lvl == 1 ? "none" : ""
		el("pctabbtn_perk").style.display = PCs_save.lvl < 4 ? "none" : ""

		el("pc_enter").style.display = PCs_tmp.pick ? "none" : ""
		el("pc_omega").style.display = PCs_tmp.pick >= 50 ? "" : "none"
		el("pc_penalty").style.display = tmp.bgMode || tmp.ngp3_mul || tmp.ngp3_exp ? "none" : ""
		el("pc_pick").style.display = PCs_tmp.pick ? "" : "none"
		if (PCs_tmp.pick) {
			for (var i = 1; i <= 8; i++) {
				el("pc_pick" + i).className = PCs_tmp.picked.includes(i) ? "chosenbtn" :
					PCs_tmp.occupied.includes(i) ? "unavailablebtn" :
					"storebtn"
				el("pc_pick" + i).style.display = QCs.done(i) ? "" : "none"
			}
		}

		this.showMilestones(PCs_tmp.milestone || 0)

		//Perks
		el("disable_qc2_perk").style.display = QCs.perkUnl(2) ? "" : "none"
		el("disable_qc2_perk").textContent = (QCs_save.disable_perks[2] ? "Enable" : "Disable") + " QC2 Perk"
		for (var i = 1; i <= 8; i++) {
			el("pc_perk_" + i).className = QCs.perkUnl(i) ? 
				(QCs.data[i].perkToggle ? "qMs_toggle_" + (!QCs_save.disable_perks[i] ? "on" : "off") : "qMs_reward")
			: "qMs_locked"
		}
	},
	updateDispOnTick() {
		if (!PCs_tmp.unl) return
		if (!PCs.data.setupHTML) return

		el("pc_eff1").textContent = "^" + enB.glu.boosterExp(0, true).toFixed(3)
		el("pc_eff1_start").textContent = shorten(PCs_tmp.eff1_start)
		el("pc_eff2").textContent = "^" + shorten(getAQGainExp())
	},
	updatePerksOnTick() {
		for (var i = 1; i <= 8; i++) {
			el("pc_perk_" + i).textContent = QCs.perkUnl(i) ? QCs.data[i].perkDesc(QCs_tmp.perks[i]) : "Locked (" + PCs_tmp.row_comps[i] + " / 4 QC" + i + " combinations)"
		}
	},
	showMilestones(qc) {
		PCs_tmp.milestone = qc

		let shown = qc != 0 && qc != "all"
		el("qc_milestones").style.display = qc != 0 || PCs_save.lvl == 1 ? "none" : ""
		el("qc_milestone_div").style.display = shown ? "" : "none"
		if (shown) {
			el("qc_milestone_header").textContent = "QC" + qc + " Milestones"
			for (var i = 1; i < PCs.data.milestone_reqs.length; i++) {
				var unl = this.milestoneUnl(i)
				var req = this.data.milestone_reqs[i]
				el("qc_milestone" + i + "_div").textContent = req + " combination" + (req == 1 ? "" : "s")
				el("qc_milestone" + i + "_div").style.display = unl ? "" : "none"
				el("qc_milestone" + i + "_div2").style.display = unl ? "" : "none"

				el("qc_milestone" + i).className = "qMs_" + (this.milestoneDone(qc * 10 + i) ? "reward" : "locked")
				el("qc_milestone" + i).textContent = evalData(PCs.milestones[qc * 10 + i]) || "???"
			}
		}

		el("qc_milestone_all_btn").style.display = qc != 0 || PCs_save.lvl == 1 ? "none" : ""
		el("qc_milestone_all_div").style.display = qc == "all" ? "" : "none"
		if (qc == "all") {
			for (var i = 1; i < PCs.data.milestone_reqs.length; i++) {
				var unl = this.milestoneUnl(i)
				var req = this.data.milestone_reqs[i]
				el("qc_milestone_header_" + i).textContent = req + " combination" + (req == 1 ? "" : "s")
				el("qc_milestone_header_" + i).style.display = unl ? "" : "none"

				for (var c = 1; c <= 8; c++) {
					if (QCs.done(c)) {
						var id = c * 10 + i
						el("qc_milestone_" + id + "_div").style.display = unl ? "" : "none"
						if (unl) {
							el("qc_milestone_" + id).className = "qMs_" + (this.milestoneDone(id) ? "reward" : "locked") + " small_milestone"
							el("qc_milestone_" + id).textContent = evalData(PCs.milestones[id]) || "???"
						}
					}
				}
			}
			for (var c = 1; c <= 8; c++) {
				el("qc_milestone_all_" + c).style.display = QCs.done(c) ? "" : "none"
			}
		}
	},
	back() {
		if (!PCs_tmp.milestone) showChallengesTab("pairedChalls")
		else PCs.showMilestones(0)
	},

	respec(x) {
		if (!confirm("Are you sure do you want to respec this set?")) return

		var exclude = []
		for (var i = 1; i <= 4; i++) {
			var c = PCs_save.challs[x * 10 + i]
			if (c) exclude.push(x * 10 + i)
		}
		this.respecSet(exclude)
	},
	respecSet(exclude, quick) {
		var toRespec = []
		for (var i = 0; i < exclude.length; i++) {
			toRespec.push(PCs.sort(PCs_save.challs[exclude[i]]))
			delete PCs_save.challs[exclude[i]]
		}

		var array = []
		for (var i = 0; i < PCs_save.comps.length; i++) {
			var item = PCs_save.comps[i]
			if (!toRespec.includes(item)) array.push(item)
		}
		PCs_save.comps = array

		if (!quick) {
			PCs.updateUsed()
			quantum(false, true)
			PCs.resetButtons()
		}
	},
	exportPreset(y) {
		let str = []
		let letters = " abcdefgh"
		for (var y = 1; y <= 8; y++) {
			for (var x = 1; x <= 4; x++) {
				var c = PCs_save.challs[y * 10 + x]
				if (c) str.push(letters[y] + x + c)
			}
		}
		str = str.join(",")

		copyToClipboard(str)
	},
	exportRow(y) {
		let str = []
		let letters = " abcdefgh"
		for (var x = 1; x <= 4; x++) {
			var c = PCs_save.challs[y * 10 + x]
			if (c) str.push(letters[y] + x + c)
		}
		str = str.join(",")

		copyToClipboard(str)
	},
	getPreset(x) {
		x = x.split(",")

		let rev_letters = {
			a: 1,
			b: 2,
			c: 3,
			d: 4,
			e: 5,
			f: 6,
			g: 7,
			h: 8
		}
		let set = []

		for (var i = 0; i < x.length; i++) {
			var item = x[i]
			set.push([rev_letters[item[0]] + item[1], parseInt(item[2] + item[3])])
		}
		return set
	},
	importPreset() {
		var str = prompt("WARNING! Importing a preset will respec some combinations! Be careful! CAUTION: This is currently buggy! Have some bugs you experienced on this feature? Report it into #bugs_and_glitches!")
		str = PCs.getPreset(str)

		var rows = []
		var toRespec = []
		for (var i = 0; i < str.length; i++) {
			var item = str[i]
			var y = Math.floor(item[0] / 10)
			if (PCs_save.challs[item[0]] && PCs_save.challs[item[0]] != item[1] && !rows.includes(y)) {
				for (var i = 1; i <= 4; i++) {
					var c = PCs_save.challs[x * 10 + i]
					if (c) toRespec.push(x * 10 + i)
				}
				rows.push(y)
			}
		}
		if (toRespec.length >= 1) this.respecSet(toRespec, true)

		for (var i = 0; i < str.length; i++) {
			var item = str[i]
			if (PCs.rowUnl(Math.floor(item[0] / 10))) PCs_save.challs[item[0]] = item[1]
		}
		if (str.length >= 1) {
			PCs.updateUsed()
			quantum(false, true)
			PCs.resetButtons()
		}
	},
}
var PCs_save = undefined
var PCs_tmp = { unl: false }