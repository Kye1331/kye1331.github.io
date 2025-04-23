//Quantum Worth + Eff
var quantumWorth
function updateQuantumWorth(mode) {
	if (!tmp.ngp3) return
	if (player.ghostify.milestones<8) {
		if (mode != "notation") mode=undefined
	} else if (mode == "notation") return
	if (mode != "notation") {
		if (mode != "display") {
			quantumWorth = qu_save.quarks.add(qu_save.usedQuarks.r).add(qu_save.usedQuarks.g).add(qu_save.usedQuarks.b).add(qu_save.gluons.rg).add(qu_save.gluons.gb).add(qu_save.gluons.br).round()
		}
		if (player.ghostify.times) {
			var automaticCharge = Math.max(Math.log10(quantumWorth.add(1).log10() / 150) / Math.log10(2), 0) + Math.max(qu_save.bigRip.spaceShards.add(1).log10() / 20 - 0.5, 0)
			player.ghostify.automatorGhosts.power = Math.max(automaticCharge, player.ghostify.automatorGhosts.power)
			if (mode != "quick") {
				el("automaticCharge").textContent = automaticCharge.toFixed(2)
				el("automaticPower").textContent = player.ghostify.automatorGhosts.power.toFixed(2)
			}
			while (player.ghostify.automatorGhosts.ghosts<MAX_AUTO_GHOSTS&&player.ghostify.automatorGhosts.power>=autoGhostRequirements[player.ghostify.automatorGhosts.ghosts-3]) {
				player.ghostify.automatorGhosts.ghosts++
				el("autoGhost"+player.ghostify.automatorGhosts.ghosts).style.visibility="visible"
				if (player.ghostify.automatorGhosts.ghosts == MAX_AUTO_GHOSTS) el("nextAutomatorGhost").parentElement.style.display="none"
				else {
					el("automatorGhostsAmount").textContent = player.ghostify.automatorGhosts.ghosts
					el("nextAutomatorGhost").parentElement.style.display = ""
					el("nextAutomatorGhost").textContent = autoGhostRequirements[player.ghostify.automatorGhosts.ghosts-3].toFixed(1)
				}
			}
		}
	}
	if (mode != "quick") for (var e = 1; e <= 2; e++) el("quantumWorth" + e).textContent = shortenDimensions(quantumWorth)
}

function getQuantumEff(x) {
	if (fluc.unl()) return Decimal.pow(10, Decimal.div(x, 10).pow(0.1))
	return x
}

function getQuantumLogEff(x, mul = 1, base = 10) {
	if (fluc.unl()) return Decimal.times(x, mul / 10).pow(0.1).div(Math.log10(base)).toNumber()
	return Decimal.times(x, mul).add(1).log(base)
}

//Quark Assertment Machine
function getAssortPercentage() {
	return qu_save.assortPercentage ? qu_save.assortPercentage : 100
}

function getAssortAmount() {
	return qu_save.quarks.floor().min(qu_save.quarks).times(getAssortPercentage() / 100).round()
}

var assortDefaultPercentages = [10, 25, 50, 100]
function updateAssortPercentage() {
	let percentage = getAssortPercentage()
	el("assort_percentage").value = percentage
	for (var i = 0; i < assortDefaultPercentages.length; i++) {
		var percentage2 = assortDefaultPercentages[i]
		el("assort_percentage_" + percentage2).className = percentage2 == percentage ? "chosenbtn" : "storebtn"
	}
}

function changeAssortPercentage(x) {
	qu_save.assortPercentage = Math.max(Math.min(parseFloat(x || el("assort_percentage").value), 100), 0)
	updateAssortPercentage()
	updateQuarksTabOnUpdate()
}

function assignQuark(color) {
	var usedQuarks = getAssortAmount()
	if (usedQuarks.eq(0)) {
		$.notify("Make sure you are assigning at least one quark!")
		return
	}
	qu_save.usedQuarks[color] = qu_save.usedQuarks[color].add(usedQuarks).round()
	qu_save.quarks = qu_save.quarks.sub(usedQuarks)
	el("quarks").innerHTML = "You have <b class='QKAmount'>0</b> quarks."
	if (!mult.eq(1)) updateQuantumWorth()
	updateColorCharge(true)
	if (player.ghostify.another > 0) player.ghostify.another--
}

function distributeQK(auto) {
	var ratios = qu_save.assignAllRatios
	var sum = ratios.r + ratios.g + ratios.b
	var assort = getAssortAmount()
	var left = assort

	if (assort.eq(0)) return
	for (c = 0; c < 3; c++) {
		var to = assort.times(ratios[colors[c]] / sum).min(left)
		if (c == 2) to = left
		if (to.gt(0)) {
			qu_save.usedQuarks[colors[c]] = qu_save.usedQuarks[colors[c]].add(to).round()
			if (player.ghostify.another > 0) player.ghostify.another--
			left = left.sub(to.min(left)).round()
		}
	}
	qu_save.quarks = qu_save.quarks.sub(assort).round()

	if (qu_save.autoOptions.assignQKRotate) {
		if (qu_save.autoOptions.assignQKRotate > 1) {
			qu_save.assignAllRatios = {
				r: qu_save.assignAllRatios.g,
				g: qu_save.assignAllRatios.b,
				b: qu_save.assignAllRatios.r
			}
		} else qu_save.assignAllRatios = {
			r: qu_save.assignAllRatios.b,
			g: qu_save.assignAllRatios.r,
			b: qu_save.assignAllRatios.g
		}
		for (c = 0; c < 3; c++) el("ratio_" + colors[c]).value = qu_save.assignAllRatios[colors[c]]
	}
	if (mult.gt(1)) updateQuantumWorth()
	updateColorCharge(true)
}

function changeRatio(color) {
	var value = parseFloat(el("ratio_" + color).value)
	if (value < 0 || isNaN(value)) {
		el("ratio_" + color).value = qu_save.assignAllRatios[color]
		return
	}
	var sum = 0
	var colors = ['r','g','b']
	for (c = 0; c < 3; c++) sum += colors[c] == color ? value : qu_save.assignAllRatios[colors[c]]
	if (sum == 0 || sum == 1/0) {
		el("ratio_" + color).value = qu_save.assignAllRatios[color]
		return
	}
	qu_save.assignAllRatios[color] = value
}

function toggleAutoAssign() {
	qu_save.autoOptions.assignQK = !qu_save.autoOptions.assignQK
	el('autoAssign').textContent="Auto: O"+(qu_save.autoOptions.assignQK?"N":"FF")
	if (qu_save.autoOptions.assignQK) distributeQK(true)
}

function rotateAutoAssign() {
	qu_save.autoOptions.assignQKRotate=qu_save.autoOptions.assignQKRotate?(qu_save.autoOptions.assignQKRotate+1)%3:1
	el('autoAssignRotate').textContent="Rotation: "+(qu_save.autoOptions.assignQKRotate>1?"Left":qu_save.autoOptions.assignQKRotate?"Right":"None")
}

function neutralizeQuarks() {
	if (colorCharge.normal.chargeAmt.eq(0) || !qu_save.quarks.gte(colorCharge.neutralize.total)) return

	var sum = 0
	for (var c = 0; c < 3; c++) {
		var color = colors[c]
		qu_save.usedQuarks[color] = qu_save.usedQuarks[color].add(colorCharge.neutralize[color]).round()
	}
	qu_save.quarks = qu_save.quarks.sub(colorCharge.neutralize.total)

	updateColorCharge()
	updateQuarksTabOnUpdate()
	if (player.ghostify.another > 0) player.ghostify.another--
}

function respecQuarks() {
	if (!confirm("Are you sure you want to respec your colored quarks? This will restart your Quantum run!")) return

	var sum = 0
	for (var c = 0; c < 3; c++) {
		var color = colors[c]
		sum = qu_save.usedQuarks[color].add(sum)
		qu_save.usedQuarks[color] = E(0)
	}
	qu_save.quarks = qu_save.quarks.add(sum)
	restartQuantum(true)

	if (qu_save.autoOptions.assignQK) distributeQK(true)
}

//Color Charge
colorCharge = {
	normal: {}
}
colorShorthands = {
	r: 'red',
	g: 'green',
	b: 'blue'
}
colors = ['r', 'g', 'b']
color_names = ['r', 'g', 'b']

function updateColorCharge(update) {
	if (!tmp.ngp3) return
	var usedQuarks = qu_save.usedQuarks

	var colorPowers = {}
	for (var i = 0; i < 3; i++) {
		var ret = getQuantumLogEff(usedQuarks[colors[i]], 0.5)
		colorPowers[colors[i]] = E(ret)
	}

	var sorted = []
	for (var s = 0; s < 3; s++) {
		var search = ''
		for (var i = 0; i < 3; i++) {
			var color = colors[i]
			if (!sorted.includes(color) && (!search || usedQuarks[color].gt(usedQuarks[search]))) search = color
		}
		sorted.push(search)
	}

	//Color Charge
	var charge = colorPowers[sorted[0]]
	if (quantumWorth.lte(Decimal.pow(10, 1e15))) charge = Decimal.div(
			Decimal.sub(usedQuarks[sorted[0]], usedQuarks[sorted[1]]),
			Decimal.add(usedQuarks[sorted[0]], 1)
		).times(charge)
	var chargeMult = E(1)
	if (QCs.done(2)) chargeMult = QCs.data[2].rewardEff(charge.times(chargeMult)).times(chargeMult) //Avoid recursion

	//Color Subcharge
	if (enB.active("glu", 12)) {
		colorCharge.sub = {
			color: sorted[1],
			charge: colorPowers[sorted[1]].times(quantumWorth.lte(Decimal.pow(10, 1e15)) ?
				Decimal.div(
					Decimal.sub(usedQuarks[sorted[1]], usedQuarks[sorted[2]]),
					Decimal.add(usedQuarks[sorted[1]], 1)
				)
			: 1).times(chargeMult)
		}
		colorCharge.sub.eff = Math.log10(getQuantumLogEff(colorCharge.sub.charge, 1, 4) + 1) * 1.5 + 1
		if (qu_superbalanced()) colorCharge.sub.eff = colorCharge.sub.charge.sqrt().div(1000).max(colorCharge.sub.eff)
		chargeMult = chargeMult.times(colorCharge.sub.eff)
	} else delete colorCharge.sub

	colorCharge.normal = {
		color: sorted[0],
		chargeAmt: Decimal.sub(usedQuarks[sorted[0]], usedQuarks[sorted[1]]).round(),
		charge: charge.times(chargeMult)
	}

	//Neutralization
	colorCharge.neutralize = {}
	colorCharge.neutralize[sorted[0]] = E(0)
	colorCharge.neutralize[sorted[1]] = Decimal.sub(usedQuarks[sorted[0]], usedQuarks[sorted[1]]).round()
	colorCharge.neutralize[sorted[2]] = Decimal.sub(usedQuarks[sorted[0]], usedQuarks[sorted[2]]).round()
	colorCharge.neutralize.total = colorCharge.neutralize[sorted[1]].add(colorCharge.neutralize[sorted[2]]).round()

	//Cancelling
	colorCharge.subCancel = hasAch("ng3p13") ? Math.pow(charge, 0.75) * 4 : 0

	//Death Mode
	if (tmp.dtMode) {
		var fixes = {
			rb: "br"
		}
		var color = sorted[0] + sorted[1]
		qu_save.entColor = usedQuarks[sorted[0]].gte(0) && usedQuarks[sorted[1]].gte(0) ? fixes[color] || color : ""
	}

	if (update) updateQuarksTabOnUpdate()
}

function getColorPowerQuantity(color, base) {
	if (QCs.in(2)) return 0

	var r
	if (colorCharge.normal.color == color) r = getColorChargeProduction(colorCharge.normal.charge, color)
	if (colorCharge.sub && colorCharge.sub.color == color) r = getColorChargeProduction(colorCharge.sub.charge, color)

	if (r) r = r.times(getColorPowerMult(color))
	else r = E(0)

	if (tmp.qe) r = r.add(tmp.qe.eff2)
	if (tmp.glB) r = r.sub(r.min(tmp.glB[color].sub))

	if (!base) {
		if (hasMTS(314)) r = r.add(getColorPowerQuantity(color == "r" ? "g" : color == "g" ? "b" : "r", true).div(5))
		if (PCs.milestoneDone(21)) r = r.add(getMinColorPower().div(4))
		if (color == "r" && hasMTS(272)) r = r.div(5)
	}
	return r
}

function getMinColorPower() {
	return getColorPowerQuantity("r", true).min(getColorPowerQuantity("g", true)).min(getColorPowerQuantity("b", true))
}

function getColorPowerMult(color) {
	var r = 1
	if (tmp.qe) r *= tmp.qe.eff1
	if (tmp.glB) r *= tmp.glB[color].mult
	return r
}

function getColorChargeProduction(x, color, disp) {
	var r = x.pow(2 * qu_save.expEnergy)
	if (disp) {
		r = r.times(getColorPowerMult(color))
		if (color == "r" && hasMTS(272)) r = r.div(5)
	}
	return r
}

colorBoosts = {
	r: 1,
	g: 1,
	b: 1
}

function updateColorPowers() {
	if (!tmp.quUnl) return

	let p23 = PCs.milestoneDone(23)

	//Exponents
	let e = 1
	if (PCs.milestoneDone(22)) e = Math.pow(1.025, (PCs_save.lvl - 1) / 7)

	//Red
	colorBoosts.r = Decimal.times(qu_save.colorPowers.r, 5).add(1).log10() / 3.5 + 1
	if (hasMTS(272)) colorBoosts.r += 0.25
	if (p23 && colorCharge.normal.color == "r") colorBoosts.r *= 1.1
	colorBoosts.r = softcap(colorBoosts.r, "rp")
	if (e > 1) colorBoosts.r = Math.pow(colorBoosts.r, e)

	//Green
	colorBoosts.g = Decimal.times(qu_save.colorPowers.g, 3).add(1).log10() + 1
	if (qu_superbalanced()) colorBoosts.g = Decimal.pow(qu_save.colorPowers.g, 1 / 4.4 / dev.quSb.k).div(1000).max(colorBoosts.g)
	if (p23 && colorCharge.normal.color == "g") colorBoosts.g *= 1.1
	if (e > 1) colorBoosts.g = Math.pow(colorBoosts.g, e)
	colorBoosts.g = softcap(colorBoosts.g, "gp")

	//Blue
	colorBoosts.b_base = Decimal.times(qu_save.colorPowers.b, 1.5).add(1)
	if (enB.active("glu", 10)) colorBoosts.b_base = colorBoosts.b_base.times(enB_tmp.eff.glu10)

	colorBoosts.b_exp = 1.5
	if (p23 && colorCharge.normal.color == "b") colorBoosts.b_exp *= 1.1
	if (enB.active("glu", 11)) colorBoosts.b_exp *= enB_tmp.eff.glu11
	if (e > 1) colorBoosts.b_exp *= e

	colorBoosts.b_base2 = colorBoosts.b_base.pow(colorBoosts.b_exp)
	if (hasMTS(313)) colorBoosts.b_exp *= getMTSMult(313, "update")

	colorBoosts.b = colorBoosts.b_base.pow(colorBoosts.b_exp)
}

//Gluons
function gainQuantumEnergy() {
	let xNoDiv = getBaseQuantumEnergy()
	let x = xNoDiv.div(tmp.qe.div)

	if (isNaN(xNoDiv.e)) xNoDiv = 0
	if (isNaN(x.e)) x = 0

	qu_save.quarkEnergy = Decimal.max(x, qu_save.quarkEnergy || 0)
	qu_save.bestEnergy = Decimal.max(xNoDiv, qu_save.bestEnergy || 0).max(qu_save.quarkEnergy)
}

function getBaseQuantumEnergy() {
	return Decimal.add(getQEQuarksPortion(), getQEGluonsPortion()).times(tmp.qe.mult)
}

function getQEQuarksPortion() {
	let exp = qu_save.expEnergy
	return Decimal.pow(getQuantumLogEff(quantumWorth), exp).times(1.25)
}

function getQEGluonsPortion() {
	var glu = enB.colorUsed()
	if (!glu) return 0
	if (tmp.dtMode) {
		if (colorCharge.normal.charge == 0) return 0
		if (glu[0] != colorCharge.normal.color && glu[1] != colorCharge.normal.color) return 0
	}

	let exp = qu_save.expEnergy
	return Decimal.pow(getQuantumLogEff(qu_save.gluons[glu]), exp).times(tmp.ngp3_mul ? 1 : 0.25)
}

function getQuantumEnergyMult() {
	if (QCs.in(2)) return E(1)

	let x = E(1)
	if (enB.active("glu", 1)) x = enB_tmp.eff.glu1
	if (tmp.ngp3_mul && tmp.glb) x = x.add((tmp.glB.r.mult + tmp.glB.g.mult + tmp.glB.b.mult) / 15)
	if (tmp.ngp3_mul) x = x.times(1.25)
	if (dev.boosts.tmp[3]) x = x.times(dev.boosts.tmp[3])
	return x
}

function getQuantumEnergyDiv() {
	let x = 1
	if (pos.on()) x = tmp.ngp3_mul ? 10 / 9 : 4 / 3
	return x
}

function updateQEGainTmp() {
	let data = {}
	tmp.qe = data
	if (!tmp.quActive) return

	//Quantum efficiency
	data.expDen = hasAch("ng3p14") ? 2 : 3
	if (tmp.ngp3_mul) data.expDen *= 0.8
	if (enB.active("pos", 1)) data.expDen = 1

	data.expNum = 1
	if (enB.active("pos", 1)) data.expNum = enB_tmp.eff.pos1
	if (data.expNum > data.expDen - 1) data.expNum = data.expDen - 1 / Math.sqrt(data.expNum - data.expDen + 2)
	if (QCs.in(2)) data.expNum += 0.5
	if (qu_superbalanced()) data.expNum = Math.max(data.expNum, data.expDen)

	data.exp = data.expNum / data.expDen
	qu_save.expEnergy = data.exp

	//Multiplier
	data.mult = getQuantumEnergyMult()
	data.div = getQuantumEnergyDiv()

	//Quantum Energy Loss
	data.total = qu_save.quarkEnergy.times(tmp.qe.div)
	data.sac = qu_save.quarkEnergy.times(1 - 1 / tmp.qe.div)
}

function updateQuarkEnergyEffects() {
	if (!tmp.quActive) return

	var eng = qu_save.quarkEnergy
	var exp = tmp.qe.exp
	var expMult = 2

	tmp.qe.eff1 = Math.pow(eng.div(2).add(1).log10() + 1, exp * expMult)
	tmp.qe.eff2 = eng.eq(0) ? E(0) : eng.pow(exp * expMult).times(tmp.qe.eff1 / 3)
}

function updateGluonicBoosts() {
	tmp.glB = {}
	if (!tmp.quActive) {
		enB.updateTmp()
		return
	}

	let data = tmp.glB
	let enBData = enB
	let gluons = qu_save.gluons

	data.r = { mult: getGluonEffBuff(gluons.rg), sub: getGluonEffNerf(gluons.br, "r") } //x -> x * [RG effect] - [BR effect]
	data.g = { mult: getGluonEffBuff(gluons.gb), sub: getGluonEffNerf(gluons.rg, "g") } //x -> x * [GB effect] - [RG effect]
	data.b = { mult: getGluonEffBuff(gluons.br), sub: getGluonEffNerf(gluons.gb, "b") } //x -> x * [BR effect] - [GB effect]

	let type = enB.colorUsed()
	let another = {
		rg: "gb",
		gb: "br",
		br: "rg",
	}
	data.enGlu = type ? gluons[type].add(gluons[another[type]]) : E(0)
	data.enAmt = enBData.glu.gluonEff(data.enGlu)
	data.masAmt = enBData.glu.gluonEff(tmp.exMode ? gluons[type].times(3) : gluons.rg.add(gluons.gb).add(gluons.br))

	//Entangled Boosts
	enB.updateTmp()
}

function getGluonEffBuff(x) {
	let r = Math.log10(getQuantumLogEff(x) * 3 + 1)
	if (tmp.ngp3_mul) r *= 1.5
	return r + 1
}

function getGluonEffNerf(x, color) {
	if (!QCs.isntCatched()) return 0

	let mult = 1
	if (enB.active("pos", 5)) mult /= enB_tmp.eff.pos5

	let r = Math.max(Math.pow(Decimal.add(x, 1).log10() * mult, 2) - colorCharge.subCancel, 0)
	if (tmp.ngp3_mul) r *= 0.5

	let gluon = enB.colorUsed()
	if (color == gluon[0] || color == gluon[1]) r *= tmp.exMode ? 0.5 : 0
	return r
}

var enB = {
	buy(type) {
		var data = this[type]
		if (!data.unl()) return
		if (!data.cost()) return
		if (Decimal.lt(data.engAmt(), data.cost())) return

		data.lvlUp()
		updateGluonicBoosts()
		this.update(type)
	},

	name(type, x) {
		var data = this[type]
		return shiftDown ? data[x].title : data.name + " Boost " + x
	},
	has(type, x) {
		return enB_tmp.unl[type + x] >= 1
	},
	active(type, x) {
		var data = this[type][x]

		if (enB_tmp.eff[type + x] === undefined) return false

		if (!this.has(type, x)) return false
		if (!this[type].activeReq(x)) return false
		if (this.mastered(type, x)) return true

		if (data.activeReq && !data.activeReq()) return false
		return true
	},

	choose(x) {
		if (QCs.in(8)) {
			var qc8 = QCs_save.qc8
			if (qc8.order.length < 2 && !qc8.order.includes(x)) {
				qc8.order.push(x)
				QCs.data[8].updateDisp()
				if (qc8.order.length == 1 && enB.active("glu", 12)) updateColorCharge(true)
			}
			return
		}
		if (enB.colorUsed() == x) return
		if (!qu_save.entBoosts || !this.glu.unl()) {
			alert("You need to get at least 1 Entangled Boost and have gluons before choosing a type!")
			return
		}
		if (!confirm("This will perform a quantum reset without gaining anything. Are you sure?")) return
		qu_save.entColor = x
		restartQuantum(true)
	},
	colorUsed(type, x) {
		if (QCs.in(8)) {
			var qc8 = QCs_save.qc8
			return qc8.order.length ? qc8.order[qc8.index] : ""
		}
		if (qu_save.entColor === undefined) qu_save.entColor = "rg"
		return qu_save.entColor
	},
	colorMatch(type, x) {
		var data = this[type][x]
		var gluon = enB.colorUsed()
		if (!data.type) return true
		if (!gluon) return

		var r = data.type == gluon[0] || data.type == gluon[1]
		if (this.anti(type, x)) r = !r
		return r
	},
	anti(type, x) {
		if (type == "glu" && (QCs.perkActive(2) || QCs.in(8))) return true
		return this[type][x].anti
	},

	mastered(type, x) {
		if (enB_tmp.unl[type + x] !== 2) return false
		if (type == "glu" && QCs.perkActive(2)) return enB_tmp.eb.gte(500)
		return true
	},
	getMastered(type, x) {
		var data = this[type]
		var r = data[x].masReq
		if (type == "glu") {
			if (QCs.perkActive(8) && !this.colorMatch("glu", x)) r = 0
		}
		return r
	},

	updateTmp() {
		var data = {}
		enB_tmp = data

		data.unl = {}
		data.eff = {}
		if (!tmp.quActive) return

		for (var x = 0; x < this.types.length; x++) {
			var type = this.types[x]
			var typeData = this[type]
			var peek = true
			if (!typeData.unl()) continue
			for (var y = 1; y <= 12; y++) {
				var id = type + y
				var unl = typeData.amt() >= typeData[y].req
				if (unl) {
					data.unl[id] = 1
					if (type == "glu" && !QCs.perkActive(2) && QCs.in(8)) continue
					if (typeData.amt() >= this.getMastered(type, y)) data.unl[id] = 2
				}
			}
		}

		enB.updateTmpOnTick()
	},
	updateTmpOnTick() {
		var data = enB_tmp

		data.eb = enB.glu.boosterEff()
		for (var x = 0; x < this.priorities.length; x++) {
			var boost = this.priorities[x]
			var type = boost[0]
			var num = boost[1]

			if (this.has(type, num)) {
				var eff = this[type][num].eff
				if (eff !== undefined) data.eff[type + num] = eff(this[type].eff(num))
			}
		}
	},

	types: ["glu", "pos"],
	priorities: [
		["glu", 6], ["glu", 9],
		["pos", 7], ["pos", 9], ["pos", 11], ["pos", 12],

		["pos", 1], ["pos", 2], ["pos", 3], ["pos", 4], ["pos", 5], ["pos", 6], ["pos", 8], ["pos", 10],
		["glu", 1], ["glu", 2], ["glu", 3], ["glu", 4], ["glu", 5], ["glu", 7], ["glu", 8], ["glu", 10], ["glu", 11], ["glu", 12],
	],
	glu: {
		name: "Entangled",
		engName: "Quantum Energy",
		unl() {
			return (tmp.quActive && Decimal.add(qu_save.gluons.rg, qu_save.gluons.gb).add(qu_save.gluons.br).gt(0)) || fluc.unl()
		},

		costs: [1,4,6,7,8,9,10,12,13,15,36,40,45,60,80],
		cost(x) {
			if (x === undefined) x = this.amt()
			if (!this.costs[x]) return
			return Decimal.pow((this.costs[x] - 1) / 3, 1.5).add(1)
		},
		target(x, noBest) {
			var eng = x ? E(x) : this.engAmt(noBest)
			var pow = futureBoost("hypergluonic_flux") && dev.boosts.tmp[6] ? dev.boosts.tmp[6] : 2/3
			eng = eng.sub(eng.min(1))
			return eng.pow(pow).times(3).add(1)
		},

		amt() {
			return qu_save.entLvl || 0
		},
		engAmt(noBest) {
			var x = E(noBest ? qu_save.quarkEnergy : qu_save.bestEnergy)
			if (noBest && QCs_tmp.qc5) x = x.times(QCs_tmp.qc5.eff)
			return x
		},
		lvlUp() {
			qu_save.entLvl = this.amt() + 1
		},

		eff(x) {
			var amt = enB_tmp.eb
			var r = amt.times(2 / 3)
			r = r.sub(r.min(1))

			r = r.times(tmp.glB[enB.mastered("glu", x) ? "masAmt" : "enAmt"])
			if (QCs.perkActive(2) && enB.mastered("glu", x)) r = r.times(1.5)
			return r
		},
		boosterEff() {
			var amt = this.target(undefined, true)
			if (pos.on()) amt = amt.add(enB.pos.target())

			if (hasAch("ng3pr14")) amt = amt.times(1.1)
			if (str.unl() && str_tmp.effs) amt = amt.times(str_tmp.effs.a1)

			if (PCs.unl() && amt.gt(PCs_tmp.eff1_start)) amt = amt.div(PCs_tmp.eff1_start).pow(this.boosterExp()).times(PCs_tmp.eff1_start)

			return amt
		},
		boosterExp(amt, display) {
			amt = amt || this.target(undefined, true)
			var exp = 1
			if (hasAch("ng3p35")) exp = 1.02
			if (PCs.unl() && (display || amt.gte(PCs_tmp.eff1_start))) {
				exp *= PCs_tmp.eff1_base
				if (pH.did("fluctuate")) exp *= FDs_tmp.eff_qe
				if (qu_superbalanced()) exp = 3
			}
			return Math.min(exp, 3)
		},
		gluonEff(x) {
			let l = getQuantumLogEff(x)
			return Math.min(Math.pow(Math.log2(l + 2), 2 * (qu_save.expEnergy || 0)), 5e3)
		},

		activeReq(x) {
			return enB.mastered("glu", x) || enB.colorMatch("glu", x)
		},

		max: 12,
		1: {
			req: 1,
			masReq: 3,

			title: "Quantum Tesla",
			type: "r",
			eff(x) {
				return Decimal.cbrt(x).times(0.75).add(1)
			},
			disp(x) {
				return shorten(x) + "x"
			},
			dispFull(x) {
				return "Gain " + this.disp(x) + " more Quantum Energy."
			}
		},
		2: {
			req: 2,
			masReq: 5,

			title: "Extraclusters",
			type: "g",
			eff(x) {
				return Math.sqrt(Decimal.add(x, 1).log10() * 1.5 + 1)
			},
			disp(x) {
				return x.toFixed(3) + "x"
			},
			dispFull(x) {
				return "Gain " + this.disp(x) + " more extra Replicated Galaxies."
			}
		},
		3: {
			req: 3,
			masReq: 6,

			title: "Dilation Overflow",
			type: "b",
			eff(x) {
				return Decimal.div(x, 2).add(1).pow(tmp.ngp3_mul ? 0.5 : 0.4)
			},
			disp(x) {
				return formatReductionPercentage(x, 2, 3) + "%"
			},
			dispFull(x) {
				return "3x TP upgrade scales " + this.disp(x) + " slower after " + shortenCosts(1e100) + " DT."
			}
		},
		4: {
			req: 4,
			masReq: 7,

			title: "Meta Resynergizer",
			type: "r",
			eff(x) {
				x = Math.sqrt(1 + Math.log10(x / 10 + 1))
				if (x > 2.5) x = (x + 1.25) / 1.5
				return Math.min(0.003 * x, 0.012)
			},
			disp(x) {
				return "^" + x.toFixed(4)
			},
			dispFull(x) {
				return "Meta-antimatter boosts dilated time by " + this.disp(x) + "."
			}
		},
		5: {
			req: 6,
			masReq: 12,

			title: "Replicanti Stealth",
			type: "b",
			eff(x) {
				let r = {
					int: Decimal.div(x, 2).add(1).log10() / 2 + 1,
					exp: Math.min(Math.log10(Math.log10(x / 2e3 + 1) + 1) * (tmp.ngp3_mul ? 1 : 0.8) + 1, 2.5)
				}
				return r
			},
			disp(x) {
				return "Strengthen all replicanti upgrades by <span style='font-size: 18px'>^" + shorten(x.exp) + "</span>, <span style='font-size: 15px'>+" + formatPercentage(x.int - 1) + "%</span>."
			},
			dispFull(x) {
				return "Strengthen all replicanti upgrades by ^" + shorten(x.exp) + ", +" + formatPercentage(x.int - 1) + "%."
			},

			adjustChance(x) {
				x = Math.pow(x, Math.min(Math.sqrt(QCs_save.qc1.time / 6 + 1), 10))
				return x
			}
		},
		6: {
			req: 7,
			masReq: 9,

			title: "Energy Lever",
			type: "g",
			eff(x) {
				if (pos.on()) {
					return Math.min(Math.pow(x / 20 + 1, 0.2), 1 / (1 - pos_tmp.mults.mdb))
				} else {
					return Decimal.div(x, 2).sqrt()
				}
			},
			disp(x) {
				return pos.on() ? "Positrons on: Meta-Dimension Boosts are <span style='font-size: 18px'>" + formatPercentage(x - 1) + "%</span> stronger."
				: "Positrons off: You gain <span style='font-size: 18px'>+" + shorten(x) + "</span> extra Positronic Charge."
			},
			dispFull(x) {
				return pos.on() ? "Positrons on: Meta-Dimension Boosts are " + formatPercentage(x - 1) + "% stronger."
				: "Positrons off: You gain +" + shorten(x) + " extra Positronic Charge."
			}
		},
		7: {
			req: 8,
			masReq: 12,

			title: "Dilation Overflow II",
			type: "g",
			eff(x) {
				var lowLim = tmp.ngp3_mul ? 1.4 : 1.45
				return Math.max(lowLim + (2 - lowLim) / (Decimal.div(x, 20).add(1).log(2) / 3 + 1), 1.5)
			},
			disp(x) {
				return "^" + x.toFixed(3)
			},
			dispFull(x) {
				return "TP formula upgrade scales at " + this.disp(x) + " after " + shortenCosts(1e100) + " DT."
			}
		},
		8: {
			req: 8,
			masReq: 15,

			title: "Meta Resynergizer II",
			type: "r",
			eff(x) {
				return 0.125 - 0.025 / Decimal.add(x, 1).pow(tmp.ngp3_mul ? 0.3 : 0.2).toNumber()
			},
			disp(x) {
				return "x^" + x.toFixed(3)
			},
			dispFull(x) {
				return "Dilated time boosts Meta Dimensions at " + this.disp(x) + "."
			}
		},
		9: {
			req: 10,
			masReq: 11,

			title: "Inflation Resistor",
			type: "b",
			anti: true,
			eff(x) {
				var r = Decimal.div(x, 100).add(1).log(3) + 1
				if (qu_superbalanced()) r = Math.max(r, Decimal.pow(x, 1 / 6 / dev.quSb.jP).toNumber() / 100)
				return r
			},
			disp(x) {
				return shorten(x) + "x"
			},
			dispFull(x) {
				return "Meta Accelerator accelerates " + this.disp(x) + " faster."
			}
		},
		10: {
			req: 11,
			masReq: 15,

			title: "Blue Saturation",
			type: "g",
			anti: true,
			eff(x) {
				return Decimal.add(x, 1).pow(tmp.ngp3_exp ? 0.35 : 0.25)
			},
			disp(x) {
				return shorten(x) + "x"
			},
			dispFull(x) {
				return "Multiply the blue power base by " + this.disp(x) + "."
			}
		},
		11: {
			req: 13,
			masReq: 15,

			title: "Blue Unseeming",
			type: "r",
			eff(x) {
				var r = Math.sqrt(Decimal.div(x, 200).add(1).log10() / 3 + 1)
				if (qu_superbalanced()) r = Math.max(r, Decimal.add(x, 1).pow(1 / dev.quSb.jP / 12).toNumber())
				return r
			},
			disp(x) {
				return "^" + x.toFixed(4)
			},
			dispFull(x) {
				return "Raise the blue power effect by " + this.disp(x) + "."
			}
		},
		12: {
			req: 14,
			masReq: 15,

			title: "Color Subcharge",
			type: "b",
			anti: true,
			eff(x) {
				return 0
			},
			disp(x) {
				return "Unlock Color Subcharge."
			},
			dispFull(x) {
				return this.disp(x)
			}
		},
	},
	pos: {
		name: "Positronic",
		engName: "Positronic Charge",
		unl() {
			return pos.unl()
		},

		costs: [1,3,4,6,7,8,9,16,25,50,90,99,150],
		cost(x) {
			if (x === undefined) x = this.amt()
			if (!this.costs[x]) return
			return Decimal.pow((this.costs[x] - 1) / 2 + 1, 1.5)
		},
		target(x) {
			var eng = x || this.engAmt()
			eng = eng.pow(1 / 1.5)
			eng = eng.sub(eng.min(1))
			return eng.times(2).add(1)
		},

		amt() {
			if (pos_save === undefined) 0
			return pos_save.lvl || 0
		},
		engAmt() {
			if (pos_save === undefined) return E(0)
			return E(pos_save.eng)
		},
		lvlUp() {
			pos_save.lvl = this.amt() + 1
		},

		activeReq(x) {
			var lvl = enB.pos.lvl(x)
			var on = pos.on()
			var mas = enB.mastered("pos", x)
			return QCs.isntCatched() ? (on || mas) :
				(on && mas && (
					(futureBoost("exclude_any_boost") ? QCs.inAny() : QCs.in(2)) ?  lvl != QCs_save.qc2 :
					true)
				)
		},

		engEff(x) {
			var eng = this.engAmt()
			if (QCs_tmp.qc5) eng = eng.times(QCs_tmp.qc5.eff)
			return eng
		},
		eff(x) {
			var eng = this.engEff()
			var charge = this.chargeEff(x)
			if (this.charged(x)) eng = eng.times(charge)
			else if (hasAch("ng3pr13")) eng = eng.times(Math.pow(charge, 0.1))
			return eng
		},

		chargeReq(x, next, lvl) {
			var lvl = lvl || this.lvl(x, next)
			var scaling = PCs.milestoneDone(42) ? Math.sqrt(1 - (PCs_save.lvl - 1) / 28) : 1
			var req = this[x].chargeReq *
				Math.pow(1.5, Math.max((pos_tmp.cloud && pos_tmp.cloud.total) || 0, 2) * scaling) *
				Math.pow(2, (lvl - this[x].tier))
			if (hasAch("ng3p28")) req /= Math.sqrt(this[x].chargeReq)
			if (hasAch("ng3pr12")) req *= 0.8
			if (hasAch("ng3pr12")) req -= 2
			return Math.max(req, 0)
		},
		chargeEffs: [
			null,
			() => PCs.milestoneDone(42) ? 8 : 2,
			4,
			6,
		],
		chargeEff(x) {
			var lvl = this.lvl(x)
			var eff = evalData(this.chargeEffs[lvl])

			var scaling = PCs.milestoneDone(42) ? Math.sqrt(1 - (PCs_save.lvl - 1) / 28) : 1
			if (fluc.unl() && fluc_tmp.temp.pos) scaling *= fluc_tmp.temp.pos
			if (scaling < 1) eff = Math.pow(eff, scaling) * Math.pow(PCs.milestoneDone(42) ? 8 : 6, 1 - scaling)

			if (str.unl() && str_tmp.effs) eff += str_tmp.effs.b1
			if (hasAch("ng3pr13")) eff += 0.5
			return eff
		},
		charged(x, lvl) {
			return this.activeReq(x) && this.engAmt() >= this.chargeReq(x, false, lvl) && (enB.mastered("pos", x) || enB.colorMatch("pos", x))
		},

		lvl(x, next) {
			if (!pos_tmp.cloud) return this[x].tier

			var swaps = next ? pos_tmp.cloud.next : pos_tmp.cloud.swaps
			if (swaps[x]) x = swaps[x]
			return this[x].tier
		},

		max: 12,
		1: {
			req: 1,
			masReq: 3,
			chargeReq: 1,

			title: "Replicanti Launch",
			tier: 1,
			type: "g",
			eff(x) {
				var rep = getReplEff()
				var eff = Decimal.times(x, 4).add(1).log(2)
				return Math.log10(rep.max(1).log10() / 1e6 * eff + 1) * eff
			},
			disp(x) {
				return "(" + shorten(x) + ")"
			},
			dispFull(x) {
				return "Quantum efficiency is based on Replicantis " + this.disp(x) + ", but the denominator is decreased to 1."
			}
		},
		2: {
			req: 2,
			masReq: 4,
			chargeReq: 1.5,

			title: "Pata Accelerator",
			tier: 2,
			type: "b",
			eff(x) {
				var slowStart = 4
				var accSpeed = 1

				if (!QCs.in(3)) {
					if (enB.active("pos", 9)) {
						var p9 = 1 + enB_tmp.eff.pos9 / 4
						slowStart += enB_tmp.eff.pos9
						accSpeed /= p9 * Math.max(p9 / 2, 1)
					}
					if (PCs.milestoneDone(31)) slowStart *= Math.pow(1.01, PCs_save.lvl)
					if (enB.active("glu", 9)) accSpeed *= enB_tmp.eff.glu9
					if (QCs.done(7)) accSpeed *= 1.25
				}

				var mdb = player.meta.resets
				var base = Math.min(player.meta.bestAntimatter.add(1).log10() * getPataAccelerator() + 1, 1e10)
				var exp = mdb
				var rel_speed = tmp.ngp3_mul || tmp.ngp3_exp ? 30 : 60

				var pre_slow_mdb = Math.min(mdb, slowStart)
				exp += Math.pow(pre_slow_mdb, 2) * accSpeed
				exp /= rel_speed

				var speed = 1
				if (mdb < slowStart) speed += mdb * accSpeed

				var mult = Decimal.pow(base, exp)
				return {
					base: base,
					exp: exp,
					slowdown: slowStart,
					speed: speed / rel_speed,
					acc: accSpeed / rel_speed,
					mult: mult
				}
			},
			disp(x) {
				return getPataAccelerator().toFixed(3) + "x"
			},
			dispFull(x) {
				return "Unlock Meta-Accelerator. (with a base multiplier of " + this.disp(x) + ", based on time since quantum)"
			}
		},
		3: {
			req: 4,
			masReq: 5,
			chargeReq: 2,

			title: "Classical Positrons",
			tier: 1,
			type: "r",
			eff(x) {
				let gal = player.galaxies
				gal *= 0.0007
				gal *= Math.min(Math.pow(Math.log2(x + 1), 2), 100)
				return Math.pow(gal + 1, 1.5)
			},
			disp(x) {
				return "^" + shorten(x)
			},
			dispFull(x) {
				return "Galaxies raise the per-10 multiplier by " + this.disp(x) + "."
			}
		},
		4: {
			req: 6,
			masReq: 7,
			chargeReq: 2.5,

			title: "Quantum Scope",
			tier: 3,
			type: "b",
			anti: true,
			eff(x) {
				return Math.log10(x / 10 + 1) *
					Math.pow(x / (tmp.ngp3_mul ? 100 : 200) + 1, 0.25) / 3 + 1
			},
			disp(x) {
				return shorten(Decimal.pow(getQuantumReq(true), 1 / x))
			},
			dispFull(x) {
				return "Quantum requires " + this.disp(x) + " instead."
			}
		},
		5: {
			req: 6,
			masReq: 7,
			chargeReq: 3,

			title: "Gluon Flux",
			tier: 2,
			type: "r",
			anti: true,
			eff(x) {
				return Math.pow(Decimal.div(x, 10).add(1).log(2) + 1, tmp.ngp3_mul ? 2 : 1)
			},
			disp(x) {
				return formatReductionPercentage(x) + "%"
			},
			dispFull(x) {
				return "Reduce the gluon penalties by " + this.disp(x) + "."
			}
		},
		6: {
			req: 7,
			masReq: 8,
			chargeReq: 3.5,

			title: "Transfinite Time",
			tier: 3,
			type: "r",
			eff(x) {
				let r = Decimal.div(x, 600).add(1).log10() / 3 + 1
				r = Math.sqrt(r)
				if (r > 1.2) r = r / 2 + 0.6
				return r
			},
			disp(x) {
				return "^" + x.toFixed(3)
			},
			dispFull(x) {
				return "Raise all Time Dimensions by " + this.disp(x) + "."
			}
		},
		7: {
			req: 9,
			masReq: 9,
			chargeReq: 4,

			title: "Looped Dimensionality",
			tier: 3,
			eff(x) {
				x = Math.log10(player.dilation.tachyonParticles.max(1).log10() / 100 + 1) * Decimal.div(x, 10).add(1).log10() / 3 + 1
				return Math.pow(x, 2.5)
			},
			disp(x) {
				return formatValue(player.options.notation, x, 2, 3) + "x"
			},
			dispFull(x) {
				return "Tachyon particles speed up " + enB.name("pos", 2) + "  production by " + this.disp(x) + "."
			}
		},
		8: {
			req: 10,
			masReq: 10,
			chargeReq: 5,

			title: "308% Completionist",
			tier: 3,
			eff(x) {
				return Decimal.add(x, 1).log10() / 5
			},
			disp(x) {
				return formatReductionPercentage(x + 1) + "%"
			},
			dispFull(x) {
				return "EC14 reward is " + this.disp(x) + " closer to ^1."
			}
		},
		9: {
			req: 11,
			masReq: 11,
			chargeReq: 6,

			title: "MT-Force Preservation",
			tier: 2,
			eff(x) {
				var r = Decimal.times(x, 3).add(1).pow(1 / 18).toNumber() - 0.5
				return r
			},
			disp(x) {
				return shorten(x)
			},
			dispFull(x) {
				return "Meta Accelerator slowdown starts " + this.disp(x) + " later, but also slows down the acceleration."
			}
		},
		10: {
			req: 12,
			masReq: 12,
			chargeReq: 8,

			title: "Overpowered Infinities",
			tier: 2,
			eff(x) {
				var sqrt = Math.sqrt(Decimal.max(getInfinitied(), 1).log10())
				var exp = 5 - 5 / (1 + Decimal.div(x, 1e3).add(1).log10())
				return Math.max(sqrt, 1) * exp + 1
			},
			disp(x) {
				return "^" + shorten(x)
			},
			dispFull(x) {
				return "Infinitied stat raises itself by " + this.disp(x) + "."
			}
		},
		11: {
			req: 13,
			masReq: 13,
			chargeReq: 10,

			title: "Eternity Transfinition",
			tier: 3,
			eff(x) {
				let ep = player.eternityPoints
				let exp = Math.log10(ep.add(1).log(2) * Math.log2(x / 25 + 1) + 1)
				if (exp > 10) exp = Math.min(Math.cbrt(exp * 10), 50)
				exp *= getAQGainExp() / 1e8
				return {
					exp: exp,
					gain: ep.max(1).pow(exp)
				}
			},
			disp(x) {
				return shorten(x.gain) + "x"
			},
			dispFull(x) {
				return "Eternity Points boost Anti-Quarks by " + this.disp(x) + "."
			}
		},
		12: {
			req: 13,
			masReq: 13,
			chargeReq: 12,

			title: "Timeless Capability",
			tier: 3,
			eff(x) {
				return Math.log10(Math.pow(getReplEff().log10() * Decimal.add(x, 1).log10(), 0.2) + 10) - 1
			},
			disp(x) {
				return "+" + x.toFixed(3) + "x"
			},
			dispFull(x) {
				return "Replicantis add " + this.disp(x) + " to " + enB.name("pos", 2) + " cap."
			}
		},
	},

	update(type) {
		var data = enB
		var typeData = data[type]

		var cost = typeData.cost()
		el("enB_" + type + "_cost").textContent = cost ? "(" + shorten(cost) + " " + typeData.engName + " - Level " + getFullExpansion(typeData.amt()) + ")" : "(MAXED)"

		var has = true
		var allMastered = true
		var last = 0
		for (var e = 1; e <= typeData.max; e++) {
			var active = data.active(type, e)
			var mastered = data.mastered(type, e)
			var el_ = el("enB_" + type + e + "_name")

			if (has) {
				if (data.has(type, e)) last++
				else has = false
			}

			var localHas = has
			if (type == "pos" && QCs.inAny() && !mastered) localHas = false
			el_.parentElement.style.display = localHas ? "" : "none"

			if (localHas) {
				if (!mastered) allMastered = false
				el_.parentElement.className = data.color(e, type)
				el_.textContent = shiftDown ? (typeData[e].title || "Unknown title.") : (typeData.name + " Boost #" + e)
			}
		}
		el("enB_" + type + "_next").textContent = last == typeData.max ? "" : "Next " + typeData.name + " Boost unlocks at level " + typeData[last + 1].req + "."

		if (type == "pos" && pos_tmp.cloud) {
			pos.updateCloud()
			pos_tmp.cloud.allMastered = allMastered
			el("entangle_div_pos").style.display = allMastered ? "none" : ""
		}
	},
	color(e, type) {
		var colors = {
		
			r: "red",
			g: "green",
			b: "blue"
		}
		var data = enB
		var typeData = data[type]
		var light = data.mastered(type, e) && e % 2 == 1 ? " light" : ""
		return !data.active(type, e) ? "black" :
			data.mastered(type, e) || !typeData[e].type ? (
				type == "glu" ? "lime" + light :
				(shiftDown || pos_tmp.cloud.allMastered) && typeData.charged(e) ? [null, "red", "green", "blue"][typeData.lvl(e)] :
				"yellow" + light
			)				:
			enB.colorMatch(type, e) ? colors[typeData[e].type] + (data.anti(type, e) ? "_anti" : "") : "grey"
	},
	updateUnlock() {
		let gluUnl = enB.glu.unl()
		el("gluon_req").textContent = gluUnl ? "" : "To unlock anti-Gluons, you need to go Quantum with at least 2 colored kinds of anti-Quarks."
		el("gluonstabbtn").style.display = gluUnl ? "" : "none"
		if (!gluUnl && el("gluons").style.display == "block") showQuantumTab("uquarks")
	},
	updateOnTick(type) {
		var data = this[type]

		if (el("enB_" + type + "_eng") !== null) el("enB_" + type + "_eng").textContent = shorten(data.engAmt())
		el("enB_" + type + "_buy").className = data.cost() && Decimal.gte(data.engAmt(), data.cost()) ? "storebtn" : "unavailablebtn"

		for (var i = 1; i <= data.max; i++) {
			if (!this.has(type, i)) break

			var active = this.active(type, i)
			var mastered = this.mastered(type, i)
			var charged = type == "pos" && data.charged(i)

			var list = []
			if (!active) list.push("Inactive")
			else if (mastered && type == "pos") list.push("Tier " + data[i].tier)
			if (charged) list.push("<b class='charged'>" + shortenMoney(data.chargeEff(i)) + "x Charged</b>")
			else if (mastered && (type != "pos" || !pos_tmp.cloud.allMastered)) list.push("Mastered")
			if (!charged && type == "pos") list.push(!enB.mastered("pos", i) && !enB.colorMatch("pos", i) ? "Mismatched" : "Self-boost is at " + shorten(enB.pos.chargeReq(i)) + " charge")
			if (data[i].type && (!mastered || shiftDown)) list.push((this.anti(type, i) ? "anti-" : "") + data[i].type.toUpperCase() + "-type boost")
			if (!mastered && !QCs.in(8)) list.push("Get Level " + getFullExpansion(enB.getMastered(type, i)) + " to master")

			el("enB_" + type + i + "_name").textContent = shiftDown ? (data[i].title || "Unknown title.") : (data.name + " Boost #" + i)
			el("enB_" + type + i + "_type").innerHTML = "(" + wordizeList(list, false, " - ", false) + ")" + (data[i].activeDispReq ? "<br>Requirement: " + data[i].activeDispReq() : "")

			if (enB_tmp.eff[type + i] !== undefined) getEl("enB_" + type + i + "_eff").innerHTML = data[i].disp(enB_tmp.eff[type + i])
		}
	}
}
var enB_tmp = { unl: {}, eff: {} }
let ENTANGLED_BOOSTS = enB

function gainQKOnQuantum(qkGain, quick) {
	var oldGluUnl = enB.glu.unl()

	//Nothing -> Quarks
	qu_save.quarks = qu_save.quarks.add(qkGain)
	if (!tmp.ngp3 || player.ghostify.milestones < 8) qu_save.quarks = qu_save.quarks.round()

	//Quarks -> Gluons
	var u = qu_save.usedQuarks
	var g = qu_save.gluons
	var p = ["rg", "gb", "br"]
	var d = []
	for (var c = 0; c < 3; c++) {
		d[c] = u[p[c][0]].min(u[p[c][1]])
		if (qu_save.keep_50) d[c] = d[c].div(2).round()
	}
	for (var c = 0; c < 3; c++) {
		g[p[c]] = g[p[c]].add(d[c]).round()
		u[p[c][0]] = u[p[c][0]].sub(d[c]).round()
	}
	if (enB.glu.unl() && !oldGluUnl) {
		$.notify("Congratulations, you have unlocked Anti-Gluons!")
		enB.updateUnlock()
	}

	if (!quick) {
		//Quarks -> Colors
		if (qu_save.autoOptions.assignQK) distributeQK(true)
		updateColorCharge()

		//Quarks & Gluons -> Energy
		updateQuantumWorth()
		updateQEGainTmp()
		gainQuantumEnergy()
	}
}

function toggle50Quarks() {
	qu_save.keep_50 = !qu_save.keep_50
	updateQuarksTabOnUpdate()
}

//Display
function updateQuarksTab(tab) {
	el("redPower").textContent = shorten(qu_save.colorPowers.r)
	el("greenPower").textContent = shorten(qu_save.colorPowers.g)
	el("bluePower").textContent = shorten(qu_save.colorPowers.b)

	el("redTranslation").textContent = "+" + formatPercentage(colorBoosts.r - 1) + "%"
	el("greenTranslation").textContent = shorten(colorBoosts.g) + "x"
	el("blueTranslation").textContent = shorten(colorBoosts.b) + "x"
	el("blueTransInfo").textContent = shiftDown ? "(Base: " + shorten(colorBoosts.b_base) + ", raised by ^" + shorten(colorBoosts.b_exp) + ")" : ""

	el("quarkEnergyEffect1").textContent = shorten(tmp.qe.eff1) + "x"
	el("quarkEnergyEffect2").textContent = "+" + shorten(tmp.qe.eff2.times(3))

	var charge = colorCharge.normal
	el("colorChargeEff").textContent = "+" + shorten(getColorChargeProduction(charge.charge, charge.color, true)) + " " + colorShorthands[charge.color] + " power" +
		(hasAch("ng3p13") ? ", -" + shorten(colorCharge.subCancel) + " gluon penalties" : "")

	var subcharge = colorCharge.sub
	if (subcharge) {
		el("colorSubchargeEff").textContent = "+" + shorten(getColorChargeProduction(subcharge.charge, subcharge.color, true)) + " " + colorShorthands[subcharge.color] + " power" +
			", x" + shorten(subcharge.eff) + " color charge"
	}

	//Post-Quantum content
	if (player.ghostify.milestones >= 8) {
		updateQuarkAssort()
		updateQuantumWorth("display")
	}
}

function updateGluonsTab() {
	if (player.ghostify.milestones >= 8) updateGluonsTabOnUpdate("display")

	for (var c = 0; c < 3; c++) {
		var color = colors[c]
		el(color + "PowerBuff").textContent = shorten(tmp.glB[color].mult)
		el(color + "PowerNerf").textContent = "-" + shorten(tmp.glB[color].sub)
		el(color + colors[(c + 1) % 3]).textContent = shortenDimensions(qu_save.gluons[color + colors[(c + 1) % 3]])
	}

	let typeUsed = enB.colorUsed()
	for (var c = 0; c < 3; c++) {
		var glu = colors[c] + colors[(c + 1) % 3]
		el("entangle_" + glu).innerHTML = "<b style='font-size: 12px'>Entangle " + glu.toUpperCase() + "</b>" +
			(glu == typeUsed ? "<br>(" + shortenDimensions(tmp.glB.enGlu) + " power)<br>(+" + shorten(getQEGluonsPortion() * tmp.qe.mult / tmp.qe.div) + " quantum energy, " + shorten(enB.glu.gluonEff(tmp.glB.enGlu)) + "x stronger boosts)" : "")
	}

	enB.updateOnTick("glu")
	el("enB_eff").textContent = "Quantum Power: " + shorten(enB_tmp.eb) + (enB.glu.boosterExp() > 1 ? " (^" + shorten(enB.glu.boosterExp()) + ")" : "")
}

//Display: On load
function updateQuarksTabOnUpdate(mode) {
	//Quark Assort
	updateQuarkAssort()
	el("neutralize_req").innerHTML = shortenDimensions(colorCharge.neutralize.total)
	el("neutralize_quarks").className = qu_save.quarks.gte(colorCharge.neutralize.total) ? "storebtn" : "unavailablebtn"

	//Color Charge
	var color = colorShorthands[colorCharge.normal.color]
	var charge = colorCharge.normal.charge
	var neutral = charge == 0
	el("colorChargeDiv").className = neutral ? "black" : color
	el("colorCharge").innerHTML = neutral ? "Neutral charge" : "<span style='font-size: 30px'>" + shorten(charge) + "</span> " + color + " charge</span>"

	//Color Subcharge
	var sub = enB.active("glu", 12)
	el("colorSubchargeDiv").style.visibility = sub ? "visible" : "hidden"
	if (sub) {
		var color = colorShorthands[colorCharge.sub.color]
		var charge = colorCharge.sub.charge
		var neutral = charge == 0
		el("colorSubchargeDiv").className = neutral ? "black" : color + " light"
		el("colorSubcharge").innerHTML = neutral ? "Neutral subcharge" : "<span style='font-size: 30px'>" + shorten(charge) + "</span> " + color + " subcharge</span>"
	}

	//Colored Quarks
	el("redQuarks").textContent = shortenDimensions(qu_save.usedQuarks.r)
	el("greenQuarks").textContent = shortenDimensions(qu_save.usedQuarks.g)
	el("blueQuarks").textContent = shortenDimensions(qu_save.usedQuarks.b)

	var uq = qu_save.usedQuarks
	var gl = qu_save.gluons
	for (var p = 0; p < 3; p++) {
		var pair = (["rg", "gb", "br"])[p]
		var diff = uq[pair[0]].min(uq[pair[1]])
		if (qu_save.keep_50) diff = diff.div(2).round()
		el(pair + "_info").textContent = shortenDimensions(uq[pair[0]].sub(diff).round()) + " (+" + shortenDimensions(diff) + " gluons)"
	}

	//Others
	el('keep_50_quarks').style.display = hasAch("ng3pr16") ? "" : "none"
	el("keep_50_quarks").textContent = "50% gluon gain: " + (qu_save.keep_50 ? "ON" : "OFF")
}

function updateQuarkAssort() {
	var assortAmount = getAssortAmount()
	var canAssign = assortAmount.gt(0)
	el("assort_amount").textContent = shortenDimensions(assortAmount)
	el("redAssort").className = canAssign ? "storebtn" : "unavailablebtn"
	el("greenAssort").className = canAssign ? "storebtn" : "unavailablebtn"
	el("blueAssort").className = canAssign ? "storebtn" : "unavailablebtn"
	el("assignAllButton").className = canAssign ? "storebtn" : "unavailablebtn"
}

function updateGluonsTabOnUpdate(mode) {
	if (!tmp.ngp3) return
	else if (!qu_save.gluons.rg) {
		qu_save.gluons = {
			rg: E(0),
			gb: E(0),
			br: E(0)
		}
	}

	enB.update("glu")
	enB.update("pos")

	let typeUsed = enB.colorUsed()
	let types = ["rg", "gb", "br"]
	for (var i = 0; i < types.length; i++) {
		var type = types[i]
		el("entangle_" + type).style.display = tmp.dtMode ? "none" : ""
		el("entangle_" + type).className = "gluonupgrade " + type
		el("entangle_" + type + "_pos").style.display = tmp.dtMode ? "none" : ""
		el("entangle_" + type + "_pos").className = "gluonupgrade " + type
	}

	if (typeUsed != "") {
		el("entangle_" + typeUsed).className = "gluonupgrade chosenbtn"
		el("entangle_" + typeUsed + "_pos").className = "gluonupgrade chosenbtn"
	}
}

//Quarks animation
var quarks={}
var centerX
var centerY
var maxDistance
var code

function drawQuarkAnimation(ts){
	centerX = canvas.width/2
	centerY = canvas.height/2
	maxDistance = Math.sqrt(Math.pow(centerX,2)+Math.pow(centerY,2))
	code = player.options.theme=="Aarex's Modifications"?"e5":"99"
	if (el("quantumtab").style.display !== "none" && el("uquarks").style.display !== "none" && player.options.animations.quarks) {
		qkctx.clearRect(0, 0, canvas.width, canvas.height);
		quarks.sum = qu_save.colorPowers.r + qu_save.colorPowers.g + qu_save.colorPowers.b
		quarks.amount=Math.ceil(Math.min(quarks.sum, 200))
		for (p=0;p<quarks.amount;p++) {
			var particle=quarks['p'+p]
			if (particle==undefined) {
				particle={}
				var random=Math.random()
				if (random<=qu_save.colorPowers.r/quarks.sum) particle.type='r'
				else if (random>=1-qu_save.colorPowers.b/quarks.sum) particle.type='b'
				else particle.type='g'
				particle.motion=Math.random()>0.5?'in':'out'
				particle.direction=Math.random()*Math.PI*2
				particle.distance=Math.random()
				quarks['p'+p]=particle
			} else {
				particle.distance+=0.01
				if (particle.distance>=1) {
					var random=Math.random()
					if (random<=qu_save.colorPowers.r/quarks.sum) particle.type='r'
					else if (random>=1-qu_save.colorPowers.b/quarks.sum) particle.type='b'
					else particle.type='g'
					particle.motion=Math.random()>0.5?'in':'out'
					particle.direction=Math.random()*Math.PI*2
					particle.distance=0
				}
				var actualDistance=particle.distance*maxDistance
				if (particle.motion=="in") actualDistance=maxDistance-actualDistance
				qkctx.fillStyle=particle.type=="r"?"#"+code+"0000":particle.type=="g"?"#00"+code+"00":"#0000"+code
				point(centerX+Math.sin(particle.direction)*actualDistance, centerY+Math.cos(particle.direction)*actualDistance, qkctx)
			}
		}
		delta = (ts - lastTs) / 1000;
		lastTs = ts;
		requestAnimationFrame(drawQuarkAnimation);
	}
}
