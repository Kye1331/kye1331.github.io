function bigRip(auto) {
	return false
}

function inBigRip() {
	return false
}

function setPCsForBigRip() {
	return
}

function toggleBigRipConf() {
	qu_save.bigRip.conf = !qu_save.bigRip.conf
	el("bigRipConfirmBtn").textContent = "Big Rip confirmation: O" + (qu_save.bigRip.conf ? "N" : "FF")
}

function unstoreTT() {
	if (qu_save.bigRip.storedTS===undefined) return
	player.timestudy.theorem = qu_save.bigRip.storedTS.tt
	player.timestudy.amcost = Decimal.pow(10, 2e4 * (qu_save.bigRip.storedTS.boughtA + 1))
	player.timestudy.ipcost = Decimal.pow(10, 100 * qu_save.bigRip.storedTS.boughtI)
	player.timestudy.epcost = Decimal.pow(2, qu_save.bigRip.storedTS.boughtE)
	var newTS = []
	var newMS = []
	var studies = qu_save.bigRip.storedTS.studies
	for (var s = 0; s < studies.length; s++) {
		var num=studies[s]
		if (typeof(num)=="string") num=parseInt(num)
		if (num<240) newTS.push(num)
		else newMS.push("t"+num)
	}
	for (var s = 7; s < 15; s++) if (player.masterystudies.includes("d" + s)) newMS.push("d" + s)
	player.timestudy.studies = newTS
	player.masterystudies = newMS
	updateBoughtTimeStudies()
	performedTS = false
	updateTheoremButtons()
	drawStudyTree()
	maybeShowFillAll()
	drawMasteryTree()
	updateMasteryStudyButtons()
	delete qu_save.bigRip.storedTS
}

function getSpaceShardsGain() {
	if (!tmp.quActive) return E(0)
	let ret = qu_save.bigRip.active ? qu_save.bigRip.bestThisRun : player.money
	ret = Decimal.pow(ret.add(1).log10() / 2000, 1.5).times(player.dilation.dilatedTime.add(1).pow(0.05))
	if (!qu_save.bigRip.active || tmp.be) {
		if (qu_save.breakEternity.upgrades.includes(3)) ret = ret.times(getBreakUpgMult(3))
		if (qu_save.breakEternity.upgrades.includes(6)) ret = ret.times(getBreakUpgMult(6))
	}
	if (hasNU(9)) ret = ret.times(Decimal.max(getEternitied(), 1).pow(0.1))
	if (qu_save.breakEternity.upgrades.includes(12)) ret = ret.pow(getBreakUpgMult(12))

	/*
	removed the softcap for now, it can go back in later maybe
	
	
	let log = ret.log10()
	let log4log = Math.log10(log) / Math.log10(4)
	let start = 6 //Starts at e4,096 = 10^(4^6)
	if (log4log > start) {
		let capped = Math.min(Math.floor(Math.log10(Math.max(log4log + 2 - start, 1)) / Math.log10(2)), 10 - start)
		log4log = (log4log - Math.pow(2, capped) - start + 2) / Math.pow(2, capped) + capped + start - 1
		log = Math.pow(4, log4log)
	}
	ret = Decimal.pow(10, log)
	*/

	if (isNaN(ret.e)) return E(0)
	return ret.floor()
}

let bigRipUpgCosts = [0, 2, 3, 5, 20, 30, 45, 60, 150, 300, 2000, 1e9, 3e14, 1e17, 3e18, 3e20, 5e22, 1e32, 1e145, 1e150, Number.MAX_VALUE]
function buyBigRipUpg(id) {
	if (qu_save.bigRip.spaceShards.lt(bigRipUpgCosts[id]) || qu_save.bigRip.upgrades.includes(id)) return
	qu_save.bigRip.spaceShards = qu_save.bigRip.spaceShards.sub(bigRipUpgCosts[id])
	if (player.ghostify.milestones < 8) qu_save.bigRip.spaceShards=qu_save.bigRip.spaceShards.round()
	qu_save.bigRip.upgrades.push(id)
	el("spaceShards").textContent = shortenDimensions(qu_save.bigRip.spaceShards)
	if (qu_save.bigRip.active) tweakBigRip(id, true)
	if (id == 10 && !qu_save.bigRip.upgrades.includes(9)) {
		qu_save.bigRip.upgrades.push(9)
		if (qu_save.bigRip.active) tweakBigRip(9, true)
	}
}

function tweakBigRip(id, reset) {
	if (id == 2) {
		for (var ec = 1; ec <= mTs.ecsUpTo; ec++) player.eternityChalls["eterc" + ec] = 5
		player.eternities = Math.max(player.eternities, 1e5)
		if (!reset) updateEternityChallenges()
	}
	if (!qu_save.bigRip.upgrades.includes(9)) {
		if (id == 3) player.timestudy.theorem += 5
		if (id == 5) player.timestudy.theorem += 20
		if (id == 7 && !player.timestudy.studies.includes(192)) player.timestudy.studies.push(192)
	}
	if (id == 9) {
		if (reset) player.timestudy = {
			theorem: 0,
			amcost: E("1e20000"),
			ipcost: E(1),
			epcost: E(1),
			studies: []
		}
		if (!qu_save.bigRip.upgrades.includes(12)) player.timestudy.theorem += 1350
	}
	if (id == 10) {
		if (!player.dilation.studies.includes(1)) player.dilation.studies.push(1)
		if (reset) {
			showTab("eternitystore")
			showEternityTab("dilation")
		}
	}
	if (id == 11) {
		if (reset) player.timestudy = {
			theorem: 0,
			amcost: E("1e20000"),
			ipcost: E(1),
			epcost: E(1),
			studies: []
		}
		player.dilation.tachyonParticles = player.dilation.tachyonParticles.max(player.dilation.bestTP.sqrt())
		player.dilation.totalTachyonParticles = player.dilation.totalTachyonParticles.max(player.dilation.bestTP.sqrt())
	}
}

function updateBreakEternity() {
	if (el("breakEternityTabbtn").style == "none") return

	if (qu_save.breakEternity.unlocked) {
		el("breakEternityReq").style.display = "none"
		el("breakEternityShop").style.display = ""
		el("breakEternityNoBigRip").style.display = qu_save.bigRip.active ? "none" : ""
		el("breakEternityBtn").textContent = (qu_save.breakEternity.break ? "FIX" : "BREAK") + " ETERNITY"
		for (var u = 1; u <= 13; u++) el("breakUpg" + u + "Cost").textContent = shortenDimensions(getBreakUpgCost(u))
		el("breakUpg7MultIncrease").textContent = shortenDimensions(1e9)
		el("breakUpg7Mult").textContent = shortenDimensions(getBreakUpgMult(7))
		el("breakUpgRS").style.display = qu_save.bigRip.active ? "" : "none"
	} else {
		el("breakEternityReq").style.display = ""
		el("breakEternityReq").textContent = "You need to get " + shorten(E("1e1200")) + " EP before you can Break Eternity."
		el("breakEternityNoBigRip").style.display = "none"
		el("breakEternityShop").style.display = "none"
	}
}

function breakEternity() {
	qu_save.breakEternity.break = !qu_save.breakEternity.break
	qu_save.breakEternity.did = true
	el("breakEternityBtn").textContent = (qu_save.breakEternity.break ? "FIX" : "BREAK") + " ETERNITY"
	if (qu_save.bigRip.active) {
		tmp.be = tmp.quActive && qu_save.breakEternity.break
		updateTmp()
		if (!tmp.be && el("timedimensions").style.display == "block") showDimTab("antimatterdimensions")
	}
	if (!player.dilation.active && isSmartPeakActivated) {
		EPminpeakType = 'normal'
		EPminpeak = E(0)
	}
}

function getEMGain() {
	if (!tmp.quActive) return E(0)
	let log = player.timeShards.div(1e9).log10() * 0.25
	if (log > 15) log = Math.sqrt(log * 15)
	if (player.ghostify.neutrinos.boosts >= 12) log *= tmp.nb[12]
	
	let log2log = Math.log10(log) / Math.log10(2)
	let start = 10 //Starts at e1024.
	if (log2log > start) { //every squaring there is a sqrt softcap
		let capped = Math.min(Math.floor(Math.log10(Math.max(log2log + 2 - start, 1)) / Math.log10(2)), 20 - start)
		log2log = (log2log - Math.pow(2, capped) - start + 2) / Math.pow(2, capped) + capped + start - 1
		log = Math.pow(2, log2log)
	}

	if (!tmp.be) log /= 2

	return Decimal.pow(10, log).floor()
}

var breakUpgCosts = [1, 1e3, 2e6, 2e11, 8e17, 1e45, null, 1e290, E("1e350"), E("1e375"), E("1e2140"), E("1e2800"), E("1e3850")]
function getBreakUpgCost(id) {
	if (id == 7) return Decimal.pow(2, qu_save.breakEternity.epMultPower).times(1e5)
	return breakUpgCosts[id - 1]
}

function buyBreakUpg(id) {
	if (!qu_save.breakEternity.eternalMatter.gte(getBreakUpgCost(id)) || qu_save.breakEternity.upgrades.includes(id)) return
	qu_save.breakEternity.eternalMatter = qu_save.breakEternity.eternalMatter.sub(getBreakUpgCost(id))
	if (player.ghostify.milestones < 15) qu_save.breakEternity.eternalMatter = qu_save.breakEternity.eternalMatter.round()
	if (id == 7) {
		qu_save.breakEternity.epMultPower++
		el("breakUpg7Mult").textContent = shortenDimensions(getBreakUpgMult(7))
		el("breakUpg7Cost").textContent = shortenDimensions(getBreakUpgCost(7))
	} else qu_save.breakEternity.upgrades.push(id)
	el("eternalMatter").textContent = shortenDimensions(qu_save.breakEternity.eternalMatter)
}

function getBreakUpgMult(id) {
	return tmp.beu[id]
}

function maxBuyBEEPMult() {
	let cost = getBreakUpgCost(7)
	if (!qu_save.breakEternity.eternalMatter.gte(cost)) return
	let toBuy = Math.floor(qu_save.breakEternity.eternalMatter.div(cost).add(1).log(2))
	let toSpend = Decimal.pow(2,toBuy).sub(1).times(cost).min(qu_save.breakEternity.eternalMatter)
	qu_save.breakEternity.epMultPower += toBuy
	qu_save.breakEternity.eternalMatter = qu_save.breakEternity.eternalMatter.sub(toSpend)
	if (player.ghostify.milestones < 15) qu_save.breakEternity.eternalMatter = qu_save.breakEternity.eternalMatter.round()
	el("eternalMatter").textContent = shortenDimensions(qu_save.breakEternity.eternalMatter)
	el("breakUpg7Mult").textContent = shortenDimensions(getBreakUpgMult(7))
	el("breakUpg7Cost").textContent = shortenDimensions(getBreakUpgCost(7))
}

function getMaxBigRipUpgrades() {
	if (player.ghostify.ghostlyPhotons.unl) return 20
	return 17
}
