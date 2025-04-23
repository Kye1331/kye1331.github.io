//Modified Infinity Dimensions
var idBaseCosts = [null, 10, 100, 1e10, 1e20, 1e140, 1e200, 1e250, 1e280]
var idCostMults = [null, 10, 100, 1e10, 1e20, 1e140, 1e200, 1e250, 1e280]

function buyIDwithAM(t, auto) { // t is the dimension number, auto is either true or false.
	let d = player["infinityDimension" + t]
	let c = d.costAM
	if (getAmount(1) < 1) {
		if (!auto) {
		alert("You need to have at least 1 First Normal Dimension to be able to buy Infinity Dimensions.")
		}
		return
	}
	if (!player.infDimensionsUnlocked[t - 1]) return
	if (!player.money.gte(c)) return
	player.money = player.money.sub(c)
	d.costAM = d.costAM.times(idCostMults[t])
	d.bought += 10
	d.amount = d.amount.add(10)
	d.power = d.power.times(3)
	player.chall2Pow = 0
}

function maxIDwithAM(t, bulk) {
	let d = player["infinityDimension" + t]
	let c = d.costAM
	let m = idCostMults[t]
	if (getAmount(1) < 1) return
	if (!player.infDimensionsUnlocked[t - 1]) return
	if (!player.money.gte(c)) return

	let tb = Math.floor(player.money.div(c).times(m - 1).add(1).log(m))
	if (bulk) tb = Math.min(tb, bulk)
	let ts = Decimal.pow(m, tb).sub(1).div(m - 1).times(c)
	player.money = player.money.sub(ts.min(player.money))
	d.costAM = d.costAM.times(Decimal.pow(m, tb))
	d.bought += 10*tb
	d.amount = d.amount.add(10 * tb)
	d.power = d.power.times(Decimal.pow(3, tb))
	player.chall2Pow = 0
}

function maxAllIDswithAM() {
	for (var d = 1; d <= 8; d++) maxIDwithAM(d)
}

function resetIDsOnNGM5() {
	if (inNGM(5)) resetInfDimensions(true)
}

//Global Dimension unlocks
function isDimUnlocked(d) {
	if (d < 7) return true // bruh. seriously. 
	return false
}

//Paradox Sacrifices
function getPxGain() {
	let r = E(player.money.max(1000).log10()-2)
	for (var d = 1; d < 9; d++) r = r.times(Math.pow(player[TIER_NAMES[d]+"Amount"].max(10).log10(), 2/5)) //we are gonna fiddle with this value a LOT.
	r = r.times(puMults[12](hasPU(12, true)))
	if (hasPU(34)) r = r.times(puMults[34]())
	return r.floor()
}

function canPSac() {
	return pH.can("paradox")
}

function pSac(chall) {
	if (!canPSac()) return
	if (player.options.challConf && chall) if (!confirm("You will Paradox Sacrifice without gaining anything. You need to Paradox Sacrifice with special conditions to complete this challenge.")) return
	pSacReset(false, chall)
}

function pSacReset(force, chall, pxGain) {
	if (!chall) {
		player.pSac.px = player.pSac.px.add(force?pxGain:getPxGain()).round()
		player.pSac.times++
		player.pSac[force ? "forcedTimes" : "normalTimes"]++
		if (!force) {
			unlockInfinNGm5(2)
			giveAchievement("Make Antimatter Great Again!") 
		}
	}
	player.pSac.time = 0
	PXminpeak = E(0)
	//resetPDs()
	updateParadoxUpgrades()
	galaxyReset(-player.galaxies)
	pH.onPrestige("paradox")
}

function pSacrificed() {
	return player.pSac != undefined && !isEmptiness && (player.pSac.times || player.galacticSacrifice.times || player.infinitied > 0 || getEternitied() > 0 || quantumed)
}
//Paradox Upgrades
let puSizes = {x: 4, y: 6}
let puMults = {
	11(l) {
		//l - upgrade level
		return Math.pow(2, l)
	},
	12(l) {
		return Math.pow(2, l)
	},
	13(l) {
		return 1 + l / 20
	},
	14(l) {
		return Math.min(Math.pow(2, l), 1e3)
	},

	21() {
		return Math.floor(10  * Math.pow(1.5, player.galacticSacrifice.times))
	},
	22() {
		return player.postC3Reward.sqrt()
	},
	23() {
		return player.pSac.px.add(1).times(3).log10() / 500
	},
	24() {
		return player.postC3Reward.log10() / 3 + 1
	},

	31() {
		return Math.max(Math.cbrt(player.pSac.px.log10()), 1) //Todo
	},
	32() {
		let x = player.tickspeedBoosts
		if (x >= 10) x = Math.sqrt(5 * x + 50)
		return Decimal.pow(2.5, Math.log2(x + 1) * Math.sqrt(x)) //Aarex's suggestion
	},
	34() {
		return player.timeShards.add(1).log10() / 10 + 1
	},

	42() {
		return player.money.add(1).pow(0.2)
	},
	43() {
		return player.infinityPower.add(1).pow(0.15)
	},
	44() {
		return player.timeShards.add(1).pow(0.1)
	},

	52() {
		if (!onPostBreak()) return 1.5
		return Math.max(1 + player.galaxies / 20, 1.5)
	},
	54() {
		return 1 //Todo
	},

	61() {
		return 1 //Todo
	},
	62() {
		return 1 //Todo
	},
	63() {
		return 1 //Todo
	},
	64() {
		return 1 //Todo
	},
}

let puDescs = { 
	11: "Normal Dimension multipliers increase 2x faster.",
	12: "Boost Paradox Gain.",
	13: "Increase the Second Normal Dimension multiplier",
	14: "Time speed is 2x faster.",
	
	21() {
		return "Boost Time Dimensions" + (pH.did("galaxy") ? " based on your Galactic Sacrificed stat." : ".")
	},
	
	22: "Time Dimensions are affected by tickspeed at a reduced rate.",
	23: "Add Tickspeed Multiplier increase based on your Paradoxes.",
	24: "Infinity Power effect is stronger based on your Tickspeed Multiplier.",

	31: "Paradoxes boost Dimension Boosts.",
	32: "Tickspeed Boosts boost Infinity Dimensions.",
	33: "Reduce the cost multiplier of Time Dimension Boosts to 1.5x.", //Apeirogon wants this to be set to 2. should we let it? the roadmap says 1.5, so I'm keeping it here.
	34: "You gain more Paradoxes based on your Time Shards.",
	
	41: "Buying Tickspeed no longer resets your Dimension Percentage.",
	42: "Antimatter boosts Paradox Dimensions 1 & 4.",
	43: "Infinity Power boosts Paradox Dimensions 2 & 5.",
	44: "Time Shards boost Paradox Dimensions 3 & 6.",

	51: "Reduce Time Shard requirement multiplier to 1.3", 
	52()  { 
   		return "Tickspeed Boosts are stronger" + (player.infinitied > 0 || player.eternities > 0 || quantumed ? " based on galaxies." : ".") 
  	},
	53: "Galaxies are twice as powerful.", //Might have to change this one, but eh. 
	54: "Gain 1 galaxy for every 5 tickspeed boosts bought.", //Since this will give more galaxies than actually getting galaxies, I take this to be automatically unbalanced.
	61: "Total gained Paradoxes boost Paradox gain.",
	62: "Paradox Upgrade 34 is stronger based on your total antimatter.",
	63() {
		return player.galacticSacrifice.times > 0 || player.infinitied > 0 || player.eternities > 0 || quantumed ? "Paradoxes boost Galaxy Point gain." : "???"
	},
	64() {
		return player.galacticSacrifice.times > 0 || player.infinitied > 0 || player.eternities > 0 || quantumed ? "Time Dimension Boosts and Dimension Boosts boost each other." : "???"
	}
}
let puCosts = {
	11: function(l) { //l is still costs
		if (l >= 8) l *= Math.ceil(Math.sqrt(l - 6))
		return Math.pow(4, l + 1)
	},
	12: function(l) {
		return Math.pow(2, Math.pow(2, l)) //between the diminishing returns and terrible scaling, this one outta be good. 
	},
	13: function(l) {
		if (l >= 10) l *= l - 9 //very harsh softcap as a compromise between Apeirogon and Aarex.
		return Math.pow(4, l + 4)
	},
	14: function(l) {
		return Decimal.pow(4,Math.pow(2, l) - 1) //tbh I don't think that this upgrade needs a softcap, since the scaling is already pretty terrible. 
	},

	21: 1, //TODO
	22: 20,
	23: 512,
	24: 4096,

	31: Math.pow(2, 18),
	32: 1e6,
	33: 1e7,
	34: Math.pow(2, 28), //We really need to rebalance this

	41: 1e5, 
	42: Math.pow(2, 20),
	43: 3e6,
	44: Math.pow(2, 24),
}
let puScalings = {
	11(l) {
		if (l >= 8) return 1
		return 0
	},
	13(l) {
		if (l >= 10) return 1
		return 0
	}
}
let puSoftcaps = {
	32: () => player.tickspeedBoosts >= 10
}
let puCaps = {
	11: 25,
	//12: Infinity,
	13: 20,
	14: 5
}
let puConditions = {
	r3: () => player.galacticSacrifice.times >= 1 || player.infinitied >= 1 || onPostBreak(),
	r4: () => tmp.PDunl,
	r5: () => player.infinitied >= 1 || onPostBreak(),
	r6: () => onPostBreak(),
}

function buyPU(x,r) {
	//x = upgrade id, r = is repeatable
	if (hasPU(x,r) == (!r || puCaps[x] || 1/0)) return
	let c = getPUCost(x,r) || 0
	if (!player.pSac.px.gte(c)) return
	player.pSac.px = player.pSac.px.sub(c).round()
	if (r) player.pSac.rebuyables[x] = (player.pSac.rebuyables[x] || 0) + 1
	else player.pSac.upgs.push(x)
	updateParadoxUpgrades()
	if (r) updatePUCosts()
}

function getPUCost(x,r,l) {
	//x = upgrade id, r = is repeatable, l = upgrade level
	if (l == undefined) l = hasPU(x,r)
	if (puCosts[x] == undefined) return 1/0
	if (r) return puCosts[x](l)
	return puCosts[x]
}

function hasPU(x, r) { // x = upgrade id, r = level, nq = not quick matter reset
	let e = inNGM(5)
	if (r) return (e && player.pSac.rebuyables[x]) || 0
	return e && player.pSac.upgs.includes(x)
}

function updateParadoxUpgrades() {
	for (var r = 1; r <= puSizes.y; r++) {
		for (var c = 1; c <= puSizes.x; c++) {
			var id = r * 10 + c
			el("pu" + id).className = hasPU(id, r < 2) == (r > 1 || puCaps[id] || 1/0) ? "pubought" : player.pSac.px.gte(getPUCost(id, r < 2, hasPU(id, true))) ? "pupg" : "infinistorebtnlocked"
			if (typeof(puDescs[id]) == "function") el("pud" + id).textContent = puDescs[id]()
		}
	}
}

function updatePUMults() {
	for (var r = 1; r <= puSizes.y; r++) {
		for (var c = 1; c <= puSizes.x; c++) {
			var id = r * 10 + c
			if (puMults[id]) {
				if (id == 13) el("pue13").textContent = "^" + puMults[13](hasPU(13, true)).toFixed(2)
				else if (id == 23) el("pue23").textContent = "+" + puMults[23]().toFixed(4)
				else el("pue" + id).textContent = shorten(puMults[id](hasPU(id, true, r < 2))) + "x" + (puSoftcaps[id] && puSoftcaps[id]() ? " (softcapped)" : "")
			}
		}
	}
}

function updatePUCosts() {
	for (var r = 1; r <= puSizes.y; r++) {
		for (var c = 1; c <= puSizes.x; c++) {
			var id = r * 10 + c
			var lvl = hasPU(id, true)
			el("puc" + id).innerHTML = lvl >= puCaps[id] ? "" : "Cost: " + shortenDimensions(getPUCost(id, r < 2, hasPU(id, true))) + " Px" + (r == 1 ? "<br>" + getGalaxyScaleName(puScalings[id] ? puScalings[id](lvl) : 0) + "Level: " + getFullExpansion(lvl) + (puCaps[id] ? " / " + puCaps[id] : "") : "")
		}
	}
}



//Paradox Challenges
function inPxC(x) {
	if (x == 0) return player.pSac == undefined || !player.pSac.chall
	return player.pSac != undefined && player.pSac.chall == x
}

//Paradox Dimensions
var pdBaseCosts = [null, 1, 2, 4, 16, 256, 2048, 1e250, 1e280]
var pdCostMults = [null, 3, 16, 64, 4096, 8192, 32768, 1e250, 1e280]

function buyPD(d) {
	if (!tmp.PDunl || tmp.ngmX < 5) return
	var ps = player.pSac
	var c = ps.dims[d].cost
	if (!ps.px.gte(c)) return
	ps.px = ps.px.sub(c.min(ps.px)).round()
	ps.dims[d].bought++
	ps.dims[d].amount = ps.dims[d].amount.add(1)
	ps.dims[d].cost = ps.dims[d].cost.times(pdCostMults[d])
	ps.dims[d].power = ps.dims[d].power.times(2)
	updateParadoxUpgrades()

	if (d === 3) giveAchievement("Impossible Equations")
	if (d === 6) giveAchievement("Logic is an illusion")
}

function maxPDs() {
	if (!tmp.PDunl) return
	let ps = player.pSac
	let upd = false
	for (var d = 1; d < 9; d++) {
		var c = player.pSac.dims[d].cost
		if (ps.px.gte(c)) {
			var m = pdCostMults[d]
			var tb = Math.floor(ps.px.div(c).times(m - 1).add(1).log(m))
			var ts = Decimal.pow(m,tb).sub(1).div(m - 1).times(c)
			ps.px = ps.px.sub(ts.min(ps.px)).round()
			ps.dims[d].bought += tb
			ps.dims[d].amount = ps.dims[d].amount.add(tb)
			ps.dims[d].cost = ps.dims[d].cost.times(Decimal.pow(m, tb))
			ps.dims[d].power = ps.dims[d].power.times(Decimal.pow(2, tb))
			upd = true

			if (d === 3) giveAchievement("Impossible Equations")
			if (d === 6) giveAchievement("Logic is an illusion")
		}
	}
	if (upd) updateParadoxUpgrades()
}

function getPDPower(d) {
	let r = player.pSac.dims[d].power
	if (d < 8) {
		var pu = ((d - 1) % 3) + 42
		if (hasPU(pu)) r = r.times(puMults[pu]())
	}
	if (d == 2) r = r.pow(puMults[13](hasPU(13, true)))
	return dilates(r)
}

function getPDProduction(d) {
	let r = player.pSac.dims[d].amount
	r = r.times(getPDPower(d))
	if (d < 2) r = r.add(getPDProduction(2))
	return r
}

function getPDDesc(d) {
	let txt = shortenDimensions(player.pSac.dims[d].amount)
	if (aarMod.logRateChange !== 2 && isDimUnlocked(d + 2)) txt += ' (+' + shorten(getPDRate(d)) + dimDescEnd
	return txt
}

function getPDRate(d) {
	let toGain = getPDProduction(d + 2).div(tmp.ec12Mult)
	var current = player.pSac.dims[d].amount.max(1)
	if (aarMod.logRateChange) {
		var change = current.add(toGain.div(10)).log10()-current.log10()
		if (change < 0 || isNaN(change)) change = 0
	} else var change = toGain.times(10).dividedBy(current)
	return change
}

function resetPDs(full) {
	if (full) player.pSac.dims={}
	player.pSac.dims.power = E(1)
	if (full) { 
		for (var d = 1; d < 9; d++) player.pSac.dims[d] = {cost: E(pdBaseCosts[d]), bought: 0, power: E(1)}
		tmp.PDunl = false //Wait until the next update. 
	}
	for (var d = 1; d < 9; d++) player.pSac.dims[d].amount = E(player.pSac.dims[d].bought)
}

function getPDAcceleration() {
	if (tmp.ngmX < 5 || !tmp.PDunl || !player.pSac.dims.power.gt(1)) return 1
	return 1 + Math.sqrt(player.pSac.dims.power.log10())
}

//Paradox Layer Reset
function resetPSac() {
	if (inNGM(5)) {
		PXminpeak = E(0)
		let keepPU = false //Wait until the next update comes.
		let keepPUR = tmp.Greward >= 3
		player.pSac = {
			time: 0,
			times: 0,
			normalTimes: 0,
			forcedTimes: 0,
			lostResets: (player.pSac && player.pSac.lostResets) || 0,
			px: tmp.Greward >= 4 ? E(25 * player.galacticSacrifice.times) : E(tmp.Greward >= 2 ? 20 : 0),
			upgs: keepPU ? player.pSac.upgs : [],
			rebuyables: keepPUR ? player.pSac.rebuyables : {}
		}
		resetPDs(true)
		updateParadoxUpgrades()
		updatePUCosts()
	}
}

//ngm5 remade

function ParadoxUpgradeButtonTypeDisplay() {
	if (tmp.ngmX < 5) return
	let t = el("pUpgs")
	for (let i = 1; i <= 6; i++) { //6 rows
		var r = t.rows[i-1]
		if (!puConditions["r"+i] || puConditions["r"+i]()) {
			r.style.display = ""
			for (let j = 1; j <= 4; j++) { //4 columns
				var c = r.cells[j-1]
				if (!puConditions["c"+j] || puConditions["c"+j]()) {
					c.style.display = ""
					var e = el('pu' + i + j);
					if (hasPU(i*10+j)) {
						e.className = 'pubought'
					} else if (i === 1 ? player.pSac.px.gte(puCosts[10+j](hasPU(10+j,true))) : player.pSac.px.gte(puCosts[i*10+j])) {
						e.className = 'pupg';
					} else {
						e.className = 'infinistorebtnlocked'
					}
					let upgId = i * 10 + j
					let mult = puMults[upgId]
					let elm = el('pue' + upgId)

					if (mult && elm) {
						let display = puMults["u" + upgId]
						mult = mult()
						el('pue' + upgId).textContent = display ? display(mult) : shorten(mult)
					}
				} else c.style.display = "none"
			}
		} else r.style.display = "none"
	}
}

function updateGalaxyTabs() {
	el("galupgsbtn").style.display = player.pSac !== undefined ? "" : "none"
	el("galStonesbtn").style.display = player.pSac !== undefined ? "" : "none"
	if (player.pSac === undefined) showGalTab("galUpgs")
}

function updateGalstones() {
	var galStoneRequirements = [1, 2, 5, 10, 25, 50]
	tmp.Greward = 0
	if (tmp.ngmX < 5) return 
	for (i=0; i<6; i++) {
		var name = "Greward" + i;
		if (player.galacticSacrifice.times >= galStoneRequirements[i]) {
			tmp.Greward++
			el(name).className = "galStonereward"
		} else {
			el(name).className = "galStonerewardlocked"
		}
	}
	if (tmp.Greward >= 5) tmp.PDunl = true
}

function unlockInfinNGm5(dim) {
	dim--
	if (player.infDimensionsUnlocked[dim]) return 
	player.infDimensionsUnlocked[dim] = true
	$.notify("Infinity Dimension " + (dim + 1) + " unlocked!", "info")
}