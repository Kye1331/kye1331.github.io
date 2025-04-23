var testHarderNGp3 = false

function updateNGP3EterUpgs() {
	if (pH.did("quantum"))  {
		el("eterrowMS").style.display = ""
		el("eter13").className = (player.eternityUpgrades.includes(13)) ? "eternityupbtnbought" : (player.eternityPoints.gte(1/0)) ? "eternityupbtn" : "eternityupbtnlocked"
		el("eter14").className = (player.eternityUpgrades.includes(14)) ? "eternityupbtnbought" : (player.eternityPoints.gte(1/0)) ? "eternityupbtn" : "eternityupbtnlocked"
		el("eter15").className = (player.eternityUpgrades.includes(15)) ? "eternityupbtnbought" : (player.eternityPoints.gte(1/0)) ? "eternityupbtn" : "eternityupbtnlocked"
	} else el("eterrowMS").style.display = "none"
}

//v1.5 
function showQuantumTab(tabName) {
	//iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
	var tabs = document.getElementsByClassName('quantumtab');
	var tab;
	var oldTab
	for (var i = 0; i < tabs.length; i++) {
		tab = tabs.item(i);
		if (tab.style.display == 'block') oldTab = tab.id
		if (tab.id === tabName) { 
			tab.style.display = 'block';
		} else {
			tab.style.display = 'none';
		}
	}
	if (oldTab != tabName) {
		aarMod.tabsSave.tabQuantum = tabName
		if (tabName == "uquarks" && el("quantumtab").style.display !== "none") {
			resizeCanvas()
			requestAnimationFrame(drawQuarkAnimation)
		}
		if (tabName == "strings") str.setupHTML()
	}
	closeToolTip()
}

var quantumTabs = {
	tabIds: ["uquarks", "gluons", "speedruns", "positrons", "strings"],
	update: {
		uquarks: updateQuarksTab,
		gluons: updateGluonsTab,
		speedruns: qMs.updateDisplayOnTick,
		positrons: pos.updateTab,
		strings: str.updateDispOnTick
	}
}

function updateQuantumTabs() {
	el("quarkEnergy").textContent = shorten(qu_save.quarkEnergy)
	el("quarkEnergyMult").textContent = "(" + (tmp.qe.div != 1 && shiftDown ? shorten(tmp.qe.mult) + "x, /" + shorten(tmp.qe.div) : shorten(tmp.qe.mult.div(tmp.qe.div)) + "x") + ")"

	el("qw_info").style.display = shiftDown ? "" : "none"
	el("qe_info").style.display = shiftDown ? "" : "none"
	el("bestQE").textContent = shorten(qu_save.bestEnergy)
	el("qeEff").textContent = "^" + qu_save.expEnergy.toFixed(3)
	el("qeFrac").textContent = shorten(tmp.qe.expNum) + "/" + shorten(tmp.qe.expDen)

	for (var i = 0; i < quantumTabs.tabIds.length; i++) {
		var id = quantumTabs.tabIds[i]
		if (el(id).style.display == "block") quantumTabs.update[id]()
	}
}

function toggleAutoTT() {
	if (qMs.tmp.amt < 1) maxTheorems()
	else {
		player.autoEterOptions.tt = !player.autoEterOptions.tt
		el("theoremmax").innerHTML = "Auto: " + (player.autoEterOptions.tt ? "ON" : "OFF")
	}
}

//v1.8
const MAX_DIL_UPG_PRIORITIES = [6, 4, 3, 1, 2]

function preQuantumAutoNGP3(diff) {
	//Pre-Quantum Automation
	if (qMs.tmp.amt >= 25) {
		doAutoMetaTick(1/0)
	} else {
		let tickPerDiff = qMs.tmp.metaSpeed

		qu_save.metaAutobuyerWait += diff
		if (qu_save.metaAutobuyerWait >= tickPerDiff) {
			doAutoMetaTick(Math.floor(qu_save.metaAutobuyerWait / tickPerDiff))
			qu_save.metaAutobuyerWait = qu_save.metaAutobuyerWait % tickPerDiff
		}
	}

	if (qMs.tmp.amt >= 20) {
		replicantiShopABRun()
		runIDBuyersTick()
	}
}

function doAutoMetaTick(ticks) {
	//Meta Dimensions
	let slowSpeed = 5
	if (qMs.tmp.amt >= 13) slowSpeed = Math.max(5 - (qMs.tmp.amt - 13 + 1), 1)

	let wait = (qu_save.metaAutobuyerSlowWait || 0) + ticks
	if (wait >= slowSpeed) {
		var bulk = Math.floor(wait / slowSpeed)
		wait = wait % slowSpeed
		for (var d = 1; d <= 8; d++) if (player.autoEterOptions["md" + d] && moreEMsUnlocked() && (pH.did("quantum") || getEternitied() >= tmp.ngp3_em[3])) buyMaxMetaDimension(d, bulk)
	}
	qu_save.metaAutobuyerSlowWait = wait

	//Others
	var bulk = ticks
	if (player.autoEterOptions.rebuyupg && qMs.tmp.amt >= 7) {
		if (tmp.ngp3) maxAllDilUpgs()
		else for (var i = 0; i < MAX_DIL_UPG_PRIORITIES.length; i++) {
			var id = "r" + MAX_DIL_UPG_PRIORITIES[i]
			if (isDilUpgUnlocked(id)) buyDilationUpgrade(id, false, true)
		}
	}
	if (player.autoEterOptions.metaboost) metaBoost()
}

function toggleAllMetaDims() {
	let turnOn = false
	let dim = 1
	while (dim <= 8) {
		if (!player.autoEterOptions["md" + dim]) turnOn = true
		if (turnOn) break
		dim++
	}

	for (dim = 1; dim <= 8; dim++) player.autoEterOptions["md" + dim] = turnOn
}

//v1.997
function respecTogglePC() {
	if (hasNU(16)) {
		if (!pH.can("quantum")) return
		qu_save.pairedChallenges.respec = true
		quantum(true)
	} else {
		qu_save.pairedChallenges.respec = !qu_save.pairedChallenges.respec
		el("respecPC").className = qu_save.pairedChallenges.respec ? "quantumbtn" : "storebtn"
	}
}

//v1.998
function toggleAutoQuantumContent(id) {
	qu_save.autoOptions[id] = !qu_save.autoOptions[id]
}

//v1.9986
function respecMasteryToggle() {
	player.respecMastery = !player.respecMastery
	updateRespecButtons()
}

//v1.99871
function fillAll() {
	var oldLength = player.timestudy.studies.length
	for (var t = 0; t < all.length; t++) buyTimeStudy(all[t], 0, true)
	if (player.timestudy.studies.length > oldLength) {
		updateTheoremButtons()
		updateTimeStudyButtons()
		drawStudyTree()
		if (player.timestudy.studies.length > 56) $.notify("All studies in time study tab are now filled.")
	}
}

//v1.99872
function maxAllDilUpgs() {
	let dt = player.dilation.dilatedTime
	let dtSub = dt.lte(Decimal.pow(10, 1e12))
	let update
	for (var i = 0; i < MAX_DIL_UPG_PRIORITIES.length; i++) {
		var num = MAX_DIL_UPG_PRIORITIES[i]
		if (isDilUpgUnlocked(id)) {
			if (num == 1) {	
				var cost = Decimal.pow(10, player.dilation.rebuyables[1] + 5)
				if (dt.gte(cost)) {
					var toBuy = Math.floor(dt.div(cost).times(9).add(1).log10())
					var toSpend = Decimal.pow(10, toBuy).sub(1).div(9).times(cost)
					if (dtSub) dt = dt.sub(dt.min(cost))
					player.dilation.rebuyables[1] += toBuy
					update = true
				}
			} else if (num == 2) {
				if (canBuyGalaxyThresholdUpg()) {
					if (tmp.ngp3) {
						var cost = Decimal.pow(10, player.dilation.rebuyables[2] * 2 + 6)
						if (dt.gte(cost)) {
							var toBuy = Math.floor(dt.div(cost).times(99).add(1).log(100))
							var toSpend = Decimal.pow(100,toBuy).sub(1).div(99).times(cost)
							if (dtSub) dt = dt.sub(dt.min(cost))
							player.dilation.rebuyables[2] += toBuy
							resetDilationGalaxies()
							update = true
						}
					} else {
						player.dilation.dilatedTime = dt
						if (buyDilationUpgrade("r2", true, true)) update = true
					}
				}
			} else {
				let data = doBulkSpent(dt, (x) => getRebuyableDilUpgCost(num, x), player.dilation.rebuyables[num] || 0)

				if (data.toBuy > 0) {
					if (dtSub) dt = data.res
					player.dilation.rebuyables[num] = (player.dilation.rebuyables[num] || 0) + data.toBuy
					update = true

					if (num >= 3) onBuyDilationUpgrade(num, data.toBuy)
				}
			}
		}
	}
	if (update) {
		player.dilation.dilatedTime = dt
		onDilationRebuyable()
	}
}

//v1.99874
function maybeShowFillAll() {
	var display = "none"
	if ((ETER_UPGS.has(10) && ETER_UPGS.has(11)) || ETER_UPGS.has(14)) display = "block"
	el("fillAll").style.display = display
	el("fillAll2").style.display = display
}

//v1.9995
function updateAutoQuantumMode() {
	if (qu_save.autobuyer.mode == "amount") {
		el("toggleautoquantummode").textContent = "Auto quantum mode: amount"
		el("autoquantumtext").textContent = "Amount of QK to wait until reset:"
	} else if (qu_save.autobuyer.mode == "relative") {
		el("toggleautoquantummode").textContent = "Auto quantum mode: X times last quantum"
		el("autoquantumtext").textContent = "X times last quantum:"
	} else if (qu_save.autobuyer.mode == "time") {
		el("toggleautoquantummode").textContent = "Auto quantum mode: time"
		el("autoquantumtext").textContent = "Minimal seconds between quantums:"
	} else if (qu_save.autobuyer.mode == "dilation") {
		el("toggleautoquantummode").textContent = "Auto quantum mode: dilation"
		el("autoquantumtext").textContent = "Amount of dilation runs to wait until reset:"
	}
}

function toggleAutoQuantumMode() {
	if (qu_save.autobuyer.mode == "amount") qu_save.autobuyer.mode = "time"
	else if (qu_save.autobuyer.mode == "time") qu_save.autobuyer.mode = "relative"
	else if (qu_save.autobuyer.mode == "relative") qu_save.autobuyer.mode = "dilation"
	else qu_save.autobuyer.mode = "amount"
	updateAutoQuantumMode()
}

//v1.9997
function toggleAutoReset() {
	qu_save.autoOptions.replicantiReset = !qu_save.autoOptions.replicantiReset
	el('autoReset').textContent = "Auto: " + (qu_save.autoOptions.replicantiReset ? "ON" : "OFF")
}

//v2
function switchAB() {
	var bigRip = qu_save.bigRip.active
	qu_save.bigRip["savedAutobuyers" + (bigRip ? "" : "No") + "BR"] = {}
	var data = qu_save.bigRip["savedAutobuyers" + (bigRip ? "" : "No") + "BR"]
	for (let d = 1; d < 9; d++) if (player.autobuyers[d-1] % 1 !== 0) data["d" + d] = {
		priority: player.autobuyers[d-1].priority,
		perTen: player.autobuyers[d-1].target > 10,
		on: player.autobuyers[d-1].isOn,
	}
	if (player.autobuyers[8] % 1 !== 0) data.tickspeed = {
		priority: player.autobuyers[8].priority,
		max: player.autobuyers[8].target == 10,
		on: player.autobuyers[8].isOn
	}
	if (player.autobuyers[9] % 1 !== 0) data.dimBoosts = {
		maxDims: player.autobuyers[9].priority,
		always: player.overXGalaxies,
		bulk: player.autobuyers[9].bulk,
		on: player.autobuyers[9].isOn
	}
	if (player.tickspeedBoosts !== undefined) if (player.autobuyers[13] % 1 !== 0) data.tickBoosts = {
		maxDims: player.autobuyers[13].priority,
		always: player.overXGalaxiesTickspeedBoost,
		bulk: player.autobuyers[13].bulk,
		on: player.autobuyers[13].isOn
	}
	if (inNGM(2)) if (player.autobuyers[12] % 1 !== 0) data.galSacrifice = {
		amount: player.autobuyers[12].priority,
		on: player.autobuyers[12].isOn
	}
	if (player.autobuyers[11] % 1 !== 0) data.crunch = {
		mode: player.autoCrunchMode,
		amount: E(player.autobuyers[11].priority),
		on: player.autobuyers[11].isOn
	}
	data.eternity = {
		mode: player.autoEterMode,
		amount: player.eternityBuyer.limit,
		dilation: player.eternityBuyer.dilationMode,
		dilationPerStat: player.eternityBuyer.dilationPerAmount,
		dilMode: player.eternityBuyer.dilMode,
		tpUpgraded: player.eternityBuyer.tpUpgraded,
		slowStop: player.eternityBuyer.slowStop,
		slowStopped: player.eternityBuyer.slowStopped,
		ifAD: player.eternityBuyer.ifAD,
		presets: Object.assign({}, player.eternityBuyer.presets),
		on: player.eternityBuyer.isOn
	}
	data.eternity.presets.order = []
	for (var i = 0; i < player.eternityBuyer.presets.order.length; i++) {
		var id = player.eternityBuyer.presets.order[i]
		data.eternity.presets[id] = Object.assign({}, player.eternityBuyer.presets[id])
		data.eternity.presets.order.push(id)
	}
	if (data.eternity.presets.dil !== undefined) data.eternity.presets.dil = Object.assign({}, data.eternity.presets.dil)
	if (data.eternity.presets.grind !== undefined) data.eternity.presets.grind = Object.assign({}, data.eternity.presets.grind)
	var data = qu_save.bigRip["savedAutobuyers" + (bigRip ? "No" : "") + "BR"]
	for (var d = 1; d < 9; d++) if (data["d" + d]) player.autobuyers[d - 1] = {
		interval: player.autobuyers[d - 1].interval,
		cost: player.autobuyers[d - 1].cost,
		bulk: player.autobuyers[d - 1].bulk,
		priority: data["d"+d].priority,
		tier: d,
		target: d + (data["d"+d].perTen ? 10 : 0),
		ticks: 0,
		isOn: data["d"+d].on
	}
	if (data.tickspeed) player.autobuyers[8] = {
		interval: player.autobuyers[8].interval,
		cost: player.autobuyers[8].cost,
		bulk: 1,
		priority: data.tickspeed.priority,
		tier: 1,
		target: player.autobuyers[8].target,
		ticks: 0,
		isOn: data.tickspeed.on
	}
	if (data.dimBoosts) {
		player.autobuyers[9] = {
			interval: player.autobuyers[9].interval,
			cost: player.autobuyers[9].cost,
			bulk: data.dimBoosts.bulk,
			priority: data.dimBoosts.maxDims,
			tier: 1,
			target: 11,
			ticks: 0,
			isOn: data.dimBoosts.on
		}
		player.overXGalaxies = data.dimBoosts.always
	}
	if (data.tickBoosts) {
		player.autobuyers[13] = {
			interval: player.autobuyers[13].interval,
			cost: player.autobuyers[13].cost,
			bulk: data.tickBoosts.bulk,
			priority: data.tickBoosts.maxDims,
			tier: 1,
			target: 14,
			ticks: 0,
			isOn: data.tickBoosts.on
		}
		player.overXGalaxiesTickspeedBoost = data.tickBoosts.always
	}
	if (data.galacticSacrifice) player.autobuyers[12] = {
		interval: player.autobuyers[12].interval,
		cost: player.autobuyers[12].cost,
		bulk: 1,
		priority: data.galacticSacrifice.amount,
		tier: 1,
		target: 13,
		ticks: 0,
		isOn: data.galacticSacrifice.on
	}
	if (data.crunch) {
		player.autobuyers[11] = {
			interval: player.autobuyers[11].interval,
			cost: player.autobuyers[11].cost,
			bulk: 1,
			priority: E(data.crunch.amount),
			tier: 1,
			target: 12,
			ticks: 0,
			isOn: data.crunch.on
		}
		player.autoCrunchMode = data.crunch.mode
	}
	if (data.eternity) {
		player.eternityBuyer = {
			limit: data.eternity.amount,
			dilationMode: data.eternity.dilation,
			dilationPerAmount: data.eternity.dilationPerStat,
			statBeforeDilation: data.eternity.dilationPerStat,
			dilMode: data.eternity.dilMode ? data.eternity.dilMode : "amount",
			tpUpgraded: data.eternity.tpUpgraded ? data.eternity.tpUpgraded : false,
			slowStop: data.eternity.slowStop ? data.eternity.slowStop : false,
			slowStopped: data.eternity.slowStopped ? data.eternity.slowStopped : false,
			ifAD: data.eternity.ifAD ? data.eternity.ifAD : false,
			presets: data.eternity.presets ? data.eternity.presets : {on: false, autoDil: false, selected: -1, selectNext: 0, left: 1, order: []},
			isOn: data.eternity.on
		}
		if (player.eternityBuyer.presets.selectNext === undefined) {
			player.eternityBuyer.presets.selected = -1
			player.eternityBuyer.presets.selectNext = 0
		}
		if (player.eternityBuyer.presets.left === undefined) player.eternityBuyer.presets.left = 1
		player.autoEterMode = data.eternity.mode
	}
	qu_save.bigRip["savedAutobuyers" + (bigRip ? "No" : "") + "BR"] = {}
	updateCheckBoxes()
	loadAutoBuyerSettings()
	if (player.autoCrunchMode == "amount") {
		el("togglecrunchmode").textContent = "Auto crunch mode: amount"
		el("limittext").textContent = "Amount of IP to wait until reset:"
	} else if (player.autoCrunchMode == "time") {
		el("togglecrunchmode").textContent = "Auto crunch mode: time"
		el("limittext").textContent = "Seconds between crunches:"
	} else {
		el("togglecrunchmode").textContent = "Auto crunch mode: X times last crunch"
		el("limittext").textContent = "X times last crunch:"
	}
	updateAutoEterMode()
}

function getAMforGHPGain(){
	return E(1)
}

function getGHPGain() {
	return E(1)
}

function getGHPBaseMult() {
	return E(1)
}

function getGHPMult() {
	let x = getGHPBaseMult()
	if (hasAch("ng3p93")) x = x.times(500)
	if (hasAch("ng3p97")) x = x.times(Decimal.pow(player.ghostify.times + 1, 1/3))
	return x
}

function ghostify(auto, force) {
	if (!force && (implosionCheck || !pH.can("ghostify"))) return
	if (!auto && !force && aarMod.ghostifyConf && !confirm("Becoming a ghost resets everything Quantum resets, and also resets all your Quantum content and banked stats to gain a Ghost Particle. " + (aarMod.nguspV ? "You will also exit NGUdS' mode and permanently bring you to NGUd'! " : "") + "Are you ready for this?")) {
		denyGhostify()
		return
	}
	if (!pH.did("ghostify") && (!confirm("Are you sure you want to do this? You will lose everything you have!") || !confirm("ARE YOU REALLY SURE YOU WANT TO DO THAT? YOU CAN'T UNDO THIS AFTER YOU BECAME A GHOST AND PASS THE UNIVERSE EVEN IT IS BIG RIPPED! THIS IS YOUR LAST CHANCE!"))) {
		denyGhostify()
		return
	}
	var implode = player.options.animations.ghostify && !force
	if (implode) {
		var gain = getGHPGain()
		var amount = player.ghostify.ghostParticles.add(gain).round()
		var seconds = pH.did("ghostify") ? 4 : 10
		implosionCheck=1
		dev.ghostify(gain, amount, seconds)
		setTimeout(function(){
			isEmptiness = true
			showTab("")
		}, seconds * 250)
		setTimeout(function(){
			if (Math.random()<1e-3) giveAchievement("Boo!")
			ghostifyReset(true, gain, amount)
		}, seconds * 500)
		setTimeout(function(){
			implosionCheck=0
		}, seconds * 1000)
	} else ghostifyReset(false, 0, 0, force)
	updateAutoQuantumMode()
}

var ghostifyDenied
function denyGhostify() {
	ghostifyDenied++
	if (ghostifyDenied >= 15) giveAchievement("You are supposed to become a ghost!")
}

function ghostifyReset(implode, gain, amount, force) {
	var bulk = getGhostifiedGain()
	if (!force) {
		if (qu_save.times >= 1e3 && player.ghostify.milestones >= 16) giveAchievement("Scared of ghosts?")
		if (!implode) {
			var gain = getGHPGain()
			player.ghostify.ghostParticles = player.ghostify.ghostParticles.add(gain).round()
		} else player.ghostify.ghostParticles = amount
		for (var i=player.ghostify.last10.length-1; i>0; i--) player.ghostify.last10[i] = player.ghostify.last10[i-1]
		player.ghostify.last10[0] = [player.ghostify.time, gain]
		player.ghostify.times = c_add(player.ghostify.times, bulk)
		player.ghostify.best = Math.min(player.ghostify.best, player.ghostify.time)
		while (qu_save.times <= tmp.bm[player.ghostify.milestones]) player.ghostify.milestones++
		if (!pH.did("ghostify")) {
			pH.onPrestige("ghostify")
			pH.updateDisplay()
		}
	}
	if (isEmptiness) {
		showTab("dimensions")
		isEmptiness = false
		pH.updateDisplay()
	}

	if (aarMod.nguspV) {
		for (let d = 5; d <= 8; d++) delete player["blackholeDimension" + d]
		delete aarMod.nguspV
	}

	var nBRU = []
	var nBEU = []
	for (let u = 20; u > 0; u--) if (nBRU.includes(u + 1) || qu_save.bigRip.upgrades.includes(u)) nBRU.push(u)
	for (let u = 13; u > 0; u--) if (nBEU.includes(u + 1) || qu_save.breakEternity.upgrades.includes(u)) nBEU.push(u)
	if (qu_save.bigRip.active) switchAB()

	var bm = player.ghostify.milestones
	if (bm >= 7 && !force && hasAch("ng3p68")) gainNeutrinos(Decimal.times(2e3 * qu_save.bigRip.bestGals, bulk), "all")
	if (bm >= 16) giveAchievement("I rather oppose the theory of everything")

	if (player.eternityPoints.e>=22e4&&player.ghostify.under) giveAchievement("Underchallenged")
	if (player.ghostify.best<=6) giveAchievement("Running through Big Rips")

	player.ghostify.time = 0
	doGhostifyResetStuff(implode, gain, amount, force, bulk, nBRU, nBEU)
	
	qu_save = player.quantum
	pH.updateActive()
	doPreInfinityGhostifyResetStuff()
	doInfinityGhostifyResetStuff(implode, bm)
	doEternityGhostifyResetStuff(implode, bm)	
	doQuantumGhostifyResetStuff(implode, bm)
	doGhostifyGhostifyResetStuff(bm, force)

	//After that...
	qMs.update()
	qMs.updateDisplay()
	handleDispAndTmpOutOfQuantum()
	handleQuantumDisplays(true)
	resetUP()
}

function toggleGhostifyConf() {
	aarMod.ghostifyConf = !aarMod.ghostifyConf
	el("ghostifyConfirmBtn").textContent = "Ghostify confirmation: O" + (aarMod.ghostifyConf ? "N" : "FF")
}

function getGHPRate(num) {
	if (num.lt(1 / 60)) return (num * 1440).toFixed(1) + " GhP/day"
	if (num.lt(1)) return (num * 60).toFixed(1) + " GhP/hr"
	return shorten(num) + " GhP/min"
}

var averageGHP = E(0)
var bestGHP
function updateLastTenGhostifies() {
	if (player.masterystudies === undefined) return
	var listed = 0
	var tempTime = E(0)
	var tempGHP = E(0)
	for (var i=0; i<10; i++) {
		if (player.ghostify.last10[i][1].gt(0)) {
			var qkpm = player.ghostify.last10[i][1].dividedBy(player.ghostify.last10[i][0]/600)
			var tempstring = shorten(qkpm) + " GhP/min"
			if (qkpm<1) tempstring = shorten(qkpm*60) + " GhP/hour"
			var msg = "The Ghostify " + (i == 0 ? '1 Ghostify' : (i+1) + ' Ghostifies') + " ago took " + timeDisplayShort(player.ghostify.last10[i][0], false, 3) + " and gave " + shortenDimensions(player.ghostify.last10[i][1]) +" GhP. "+ tempstring
			el("ghostifyrun"+(i+1)).textContent = msg
			tempTime = tempTime.plus(player.ghostify.last10[i][0])
			tempGHP = tempGHP.plus(player.ghostify.last10[i][1])
			bestGHP = player.ghostify.last10[i][1].max(bestGHP)
			listed++
		} else el("ghostifyrun"+(i+1)).textContent = ""
	}
	if (listed > 1) {
		tempTime = tempTime.dividedBy(listed)
		tempGHP = tempGHP.dividedBy(listed)
		var qkpm = tempGHP.dividedBy(tempTime/600)
		var tempstring = shorten(qkpm) + " GhP/min"
		averageGHP = tempGHP
		if (qkpm<1) tempstring = shorten(qkpm*60) + " GhP/hour"
		el("averageGhostifyRun").textContent = "Last " + listed + " Ghostifies average time: "+ timeDisplayShort(tempTime, false, 3)+" Average GhP gain: "+shortenDimensions(tempGHP)+" GhP. "+tempstring
	} else el("averageGhostifyRun").textContent = ""
}

function updateBraveMilestones() {
	if (pH.did("ghostify")) {
		for (var m = 1; m < 17;m++) el("braveMilestone" + m).className = "achievement achievement" + (player.ghostify.milestones < m ? "" : "un") + "locked"
		for (var r = 1; r < 3; r++) el("braveRow" + r).className = player.ghostify.milestones < r * 8 ? "" : "completedrow"
	}
}

function showGhostifyTab(tabName) {
	//iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
	var tabs = document.getElementsByClassName('ghostifytab');
	var tab;
	var oldTab
	for (var i = 0; i < tabs.length; i++) {
		tab = tabs.item(i);
		if (tab.style.display == 'block') oldTab = tab.id
		if (tab.id === tabName) {
			tab.style.display = 'block';
		} else {
			tab.style.display = 'none';
		}
	}
	if (oldTab !== tabName) aarMod.tabsSave.tabGhostify = tabName
}

function updateGhostifyTabs() {
	if (el("neutrinos").style.display == "block") updateNeutrinosTab()
	if (el("automaticghosts").style.display == "block") if (player.ghostify.milestones > 7) updateQuantumWorth("display")
	if (el("gphtab").style.display == "block" && player.ghostify.ghostlyPhotons.unl) updatePhotonsTab()
	if (el("bltab").style.display == "block" && player.ghostify.wzb.unl) updateBosonicLabTab()
}

function buyGHPMult() {
	let sum = player.ghostify.neutrinos.electron.add(player.ghostify.neutrinos.mu).add(player.ghostify.neutrinos.tau).round()
	let cost = getGHPMultCost()
	if (sum.lt(cost)) return
	subNeutrinos(cost)
	player.ghostify.multPower++
	player.ghostify.automatorGhosts[15].a = player.ghostify.automatorGhosts[15].a.times(5)
	el("autoGhost15a").value = formatValue("Scientific", player.ghostify.automatorGhosts[15].a, 2, 1)
	el("ghpMult").textContent = shortenMoney(getGHPBaseMult())
	el("ghpMultUpgCost").textContent = shortenDimensions(getGHPMultCost())
}

function maxGHPMult() {
	let sum = player.ghostify.neutrinos.electron.add(player.ghostify.neutrinos.mu).add(player.ghostify.neutrinos.tau).round()
	let cost = getGHPMultCost()
	let scaling = getGHPMultCostScalingStart()
	let totalBought = 0
	if (sum.lt(cost)) return
	if (player.ghostify.multPower < scaling) {
		let toBuy = Math.min(Math.floor(sum.div(cost).times(24).add(1).log(25)), scaling - player.ghostify.multPower)
		subNeutrinos(Decimal.pow(25, toBuy).sub(1).div(24).times(cost))
		totalBought += toBuy
		cost = getGHPMultCost(totalBought)
	}
	if (player.ghostify.multPower >= scaling) {
		let b = player.ghostify.multPower * 2 - scaling + 3
		let x = Math.floor((-b + Math.sqrt(b * b + 4 * sum.div(cost).log(5))) / 2) + 1
		if (x) {
			let toBuy=x
			let toSpend=0
			while (x > 0) {
				cost = getGHPMultCost(x + totalBought - 1)
				if (sum.div(cost).gt(1e16)) break
				toSpend=cost.add(toSpend)
				if (sum.lt(toSpend)) {
					toSpend=cost
					toBuy--
				}
				x--
			}
			subNeutrinos(toSpend)
			totalBought += toBuy
		}
	}

	player.ghostify.multPower += totalBought
	el("ghpMult").textContent = shortenMoney(getGHPBaseMult())
	el("ghpMultUpgCost").textContent = shortenDimensions(getGHPMultCost())

	player.ghostify.automatorGhosts[15].a = player.ghostify.automatorGhosts[15].a.times(Decimal.pow(5, totalBought))
	el("autoGhost15a").value = formatValue("Scientific", player.ghostify.automatorGhosts[15].a, 2, 1)
}

function setupAutomaticGhostsData() {
	var data = {power: 0, ghosts: 3}
	for (var ghost = 1; ghost <= MAX_AUTO_GHOSTS; ghost++) data[ghost] = {on: false}
	data[4].mode = "q"
	data[4].rotate = "r"
	data[11].pw = 10
	data[11].cw = 10
	data[15].a = 1
	data[17].s = 60
	data[19].t = 0
	data[22].i = 3
	data[24].i = 5
	data[24].m = 1.1
	return data
}

var autoGhostRequirements=[2,4,4,4.5,5,5,6,6.5,7,7,7.5,8,20,22.5,25,27.5,30,35,40,40,40,45]
var powerConsumed
var powerConsumptions=[0,1,1,1,1,1,1.5,1,0.5,0.5,1,0.5,0.5,0.5,0.5,0.5,2,3,4,4,5,7,4,3,4,2]
function updateAutoGhosts(load) {
	var data = player.ghostify.automatorGhosts
	if (load) {
		for (var x = 1; x <= MAX_AUTO_GHOSTS; x++) if (data[x] === undefined) data[x] = {on: false}
		if (data.ghosts >= MAX_AUTO_GHOSTS) el("nextAutomatorGhost").parentElement.style.visibility="hidden"
		else {
			el("automatorGhostsAmount").textContent=data.ghosts
			el("nextAutomatorGhost").parentElement.style.visibility="visible"
			el("nextAutomatorGhost").textContent=autoGhostRequirements[data.ghosts-3].toFixed(2)
		}
	}
	powerConsumed=0
	for (var ghost = 1; ghost <= MAX_AUTO_GHOSTS; ghost++) {
		if (ghost>data.ghosts) {
			if (load) el("autoGhost" + ghost).style.visibility="hidden"
		} else {
			if (load) {
				el("autoGhost" + ghost).style.visibility="visible"
				el("isAutoGhostOn" + ghost).checked=data[ghost].on
			}
			if (data[ghost].on) powerConsumed+=powerConsumptions[ghost]
		}
		el("ghostcost" + ghost).textContent = powerConsumptions[ghost]
	}
	if (load) {
		el("autoGhostMod4").textContent = "Every " + (data[4].mode == "t" ? "second" : "Quantum")
		el("autoGhostRotate4").textContent = data[4].rotate == "l" ? "Left" : "Right"
		el("autoGhost11pw").value = data[11].pw
		el("autoGhost11cw").value = data[11].cw
		el("autoGhost13t").value = data[13].t
		el("autoGhost13u").value = data[13].u
		el("autoGhost13o").value = data[13].o
		el("autoGhost15a").value = formatValue("Scientific", data[15].a, 2, 1)
		el("autoGhost17s").value = data[17].s || 60
		el("autoGhost22t").value = data[22].time
		el("autoGhost24i").value = data[24].i
		el("autoGhost24m").value = data[24].m
	}
	el("consumedPower").textContent = powerConsumed.toFixed(2)
	isAutoGhostsSafe = data.power >= powerConsumed
	el("tooMuchPowerConsumed").style.display = isAutoGhostsSafe ? "none" : ""

	el("agbtn_pos_yes_auto").style.display = pH.did("ghostify") ? "" : "none"
}

function toggleAutoGhost(id) {
	player.ghostify.automatorGhosts[id].on = el("isAutoGhostOn" + id).checked
	updateAutoGhosts()
}

function isAutoGhostActive(id) {
	if (!pH.did("ghostify")) return
	return player.ghostify.automatorGhosts[id].on
}

function changeAutoGhost(o) {
	if (o == "4m") {
		player.ghostify.automatorGhosts[4].mode = player.ghostify.automatorGhosts[4].mode == "t" ? "q" : "t"
		el("autoGhostMod4").textContent = "Every " + (player.ghostify.automatorGhosts[4].mode == "t" ? "second" : "Quantum")
	} else if (o == "4r") {
		player.ghostify.automatorGhosts[4].rotate = player.ghostify.automatorGhosts[4].rotate == "l" ? "r" : "l"
		el("autoGhostRotate4").textContent = player.ghostify.automatorGhosts[4].rotate == "l" ? "Left" : "Right"
	} else if (o == "11pw") {
		var num = parseFloat(el("autoGhost11pw").value)
		if (!isNaN(num) && num > 0) player.ghostify.automatorGhosts[11].pw = num
	} else if (o == "11cw") {
		var num = parseFloat(el("autoGhost11cw").value)
		if (!isNaN(num) && num > 0) player.ghostify.automatorGhosts[11].cw = num
	} else if (o == "13t") {
		var num = parseFloat(el("autoGhost13t").value)
		if (!isNaN(num) && num >= 0) player.ghostify.automatorGhosts[13].t = num
	} else if (o == "13u") {
		var num = parseFloat(el("autoGhost13u").value)
		if (!isNaN(num) && num > 0) player.ghostify.automatorGhosts[13].u = num
	} else if (o == "13o") {
		var num = parseInt(el("autoGhost13o").value)
		if (!isNaN(num) && num >= 0) player.ghostify.automatorGhosts[13].o = num
	} else if (o == "15a") {
		var num = fromValue(el("autoGhost15a").value)
		if (!isNaN(break_infinity_js ? num : num.l)) player.ghostify.automatorGhosts[15].a = num
	} else if (o == "17s") {
		var num = parseFloat(el("autoGhost24m").value)
		if (!isNaN(num) && num > 1) player.ghostify.automatorGhosts[17].s = num
	} else if (o == "22t") {
		var num = parseFloat(el("autoGhost22t").value)
		if (!isNaN(num) && num > 0) player.ghostify.automatorGhosts[22].time = num
	} else if (o == "24i") {
		var num = parseFloat(el("autoGhost24i").value)
		if (num == Math.round(num) && num > 0) player.ghostify.automatorGhosts[24].i = num
	} else if (o == "24m") {
		var num = parseFloat(el("autoGhost24m").value)
		if (!isNaN(num) && num > 1) player.ghostify.automatorGhosts[24].m = num
	}
}

const MAX_AUTO_GHOSTS = 25

//v2.1
function startEC10() {
	if (canUnlockEC(10, 550, 181)) {
		justImported = true
		el("ec10unl").onclick()
		justImported = false
	}
	startEternityChallenge(10)
}

function getGHPMultCost(offset = 0) {
	let lvl = player.ghostify.multPower + offset
	let pow5 = lvl * 2 - 1
	let scaling = getGHPMultCostScalingStart()
	if (lvl > scaling) pow5 += Math.max(lvl - scaling, 0) * (lvl - scaling + 1)
	return Decimal.pow(5, pow5).times(25e8)
}

function getGHPMultCostScalingStart() {
	return 85
}

//v2.2
function showNFTab(tabName) {
	//iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
	var tabs = document.getElementsByClassName('nftab');
	var tab;
	var oldTab
	for (var i = 0; i < tabs.length; i++) {
		tab = tabs.item(i);
		if (tab.style.display == 'block') oldTab = tab.id
		if (tab.id === tabName) {
			tab.style.display = 'block';
		} else {
			tab.style.display = 'none';
		}
	}
	if (oldTab !== tabName) aarMod.tabsSave.tabNF = tabName
	closeToolTip()
}

function getGhostifiedGain() {
	let r = 1
	if (hasBosonicUpg(15)) r = c_conv(tmp.blu[15].gh)
	return r
}

function toggleLEConf() {
	aarMod.leNoConf = !aarMod.leNoConf
	el("leConfirmBtn").textContent = "Light Empowerment confirmation: O" + (aarMod.leNoConf ? "FF" : "N")
}

//v2.302
function NGP3andVanillaCheck() {
	return tmp.ngp3 || !player.aarexModifications.newGamePlusPlusVersion
}

//v3
function moreEMsUnlocked() {
	return tmp.ngp3 && (hasDilationStudy(1) || pH.did("quantum"))
}

function getNGP3EterMilestones() {
	let r = [1e6, 1e8, 1e10, 1e12, 7e14, 1e18]
	if (tmp.bgMode) {
		r[3] = 1e10
		r[4] = 1e10
	}
	if (tmp.exMode) {
		r[2] = 1e13
		r[5] = 1e20
	}
	if (tmp.dtMode) {
		r[2] = 1e16
		r[5] = 1e25
	}
	return r
}

function doubleMSMult(x) {
	//For NG*+3
	if (tmp.ngp3_mul) {
		if (x + 0 === x) x *= 2
		else x = Decimal.times(x, 2)
	}
	return x
}

function isAtEndGame() {
	return fluc.unl() && fluc_save.eng >= 11
}

//Auto-Preset
let autoPresets = {
	eternity: "Eternity",
	dilation: "Dilation",
	qc1: "Quantum Challenge 1",
	qc7: "Quantum Challenge 7"
}

function openAutoPresets() {
	closeToolTip()
	el("autoPresets").style.display = "flex"

	el("autoPresetToggle").textContent = player.timestudy.auto.on ? "Auto: ON" : "Auto: OFF"
	el("autoPresetTarget").textContent = "Assigning updates the preset you are choosing. (" + autoPresets[targetAutoPreset()] + ")"

	el("autoPresetEternity").value = player.timestudy.auto.eternity || ""
	el("autoPresetDilation").value = player.timestudy.auto.dilation || ""

	el("autoPresetQC1Div").style.display = autoPresetUnlocked("qc1") ? "" : "none"
	el("autoPresetQC7Div").style.display = autoPresetUnlocked("qc7") ? "" : "none"
	el("autoPresetQC1").value = player.timestudy.auto.qc1 || ""
	el("autoPresetQC7").value = player.timestudy.auto.qc7 || ""
}

function toggleAutoPreset() {
	player.timestudy.auto.on = !player.timestudy.auto.on
	el("autoPresetToggle").textContent = player.timestudy.auto.on ? "Auto: ON" : "Auto: OFF"
}

function changeAutoPreset(x, id) {
	player.timestudy.auto[x] = el(id).value
}

function loadAutoPreset(x) {
	importStudyTree(player.timestudy.auto[x])
}

function targetAutoPreset(dilated) {
	if (QCs.in(7) && autoPresetUnlocked("qc7")) return "qc7"
	if (QCs.in(1) && autoPresetUnlocked("qc1")) return "qc1"
	return (dilated !== undefined ? dilated : player.dilation.active) ? "dilation" : "eternity"
}

function refreshAutoPreset(update) {
	if (!update && !player.timestudy.auto.on) return
	player.timestudy.auto[targetAutoPreset()] = getStudyTreeStr()
	if (el("autoPresets").style.display == "flex") openAutoPresets()
}

function autoPresetUnlocked(x) {
	return qMs.tmp.amt >= 2 && (x == "qc1" || x == "qc7" ? hasAch("ng3p25") : true)
}

function setupSaveDataNGP3() {
	//Fluctuant
	fluc_save = player.fluc
	fluc_tmp.unl = fluc.unl(true)
	fluc.compile()

	if (fluc_save) {
		FDs_save = (fluc_save && fluc_save.dims)
		FDs.compile()

		delete fluc_save.synt
		ff_save = (fluc_save && fluc_save.ff)
		ff.compile()
	}

	//Quantum
	pos_save = (qu_save && qu_save.pos)
	QCs_save = (qu_save && qu_save.qc)
	PCs_save = (qu_save && qu_save.pc)
	str_save = (qu_save && qu_save.str)

	pos_tmp.unl = pos.unl(true)
	pos.compile()

	QCs_tmp.unl = QCs.unl(true)
	QCs.compile()

	PCs_tmp.unl = PCs.unl(true)
	PCs.compile()

	str_tmp.unl = str.unl(true)
	str.compile()

	updateQuantumTemp()
}

function rollbackQuantum(aQ) {
	player.totalMoney = E(1)
	qu_save.quarks = E(0)
	qu_save.gluons = {
		rg: E(0),
		gb: E(0),
		br: E(0),
	}
	qu_save.entBoosts = 0
	pos_save.boosts = 0
	QCs_save.comps = aQ <= 1e20 ? 7 : 8
	if (aQ <= 1e20) PCs.reset()
	str_save.energy = 0
	str_save.vibrated = []

	dev.giveQuantumStuff(aQ, true)
	gainQKOnQuantum(aQ, true)
	forceToQuantumAndRemove = true
	setTTAfterQuantum = 1e80
}

function updateQuantumTemp(update) {
	QCs.updateTmp()
	PCs.updateTmp()
	str.updateTmp()
	pos.updateTmp()

	if (update) {
		QCs.updateDisp()
		PCs.updateDisp()
		str.updateDisp()
	}
}

function updateAutoApplyDisp(toggle) {
	if (toggle) {
		if (!aarMod.autoApply) {
			if (!confirm("This will reset upcoming changes. Are you sure do you want to turn this on?")) return
			if (pos_tmp.cloud && pos_tmp.cloud.sum >= 4) {
				pos_tmp.cloud.next = {... pos_save.swaps}
				pos.updateCloud()
			}
		}
		aarMod.autoApply = !aarMod.autoApply
	}

	var on = aarMod.autoApply
	el("autoApply").style.display = pos_tmp.cloud && pos_tmp.cloud.sum >= 4 ? "" : "none"
	el("autoApply").textContent = "Auto-apply changes: " + (on ? "ON" : "OFF")

	el("pos_apply_div").style.display = on ? "none" : ""
	//el("str_apply_div").style.display = on ? "none" : ""
}

//Recent boosts
function getReplDilBonus() {
	let log = getReplEff().max(1).log10()
	let x = Math.sqrt(log / 1e4 + 1) - 1
	x *= Math.pow(log / 1e7 + 1, 1/6)
	x *= Math.min(Math.log10(log / 1e6 + 1) / 2 + 1, 5)
	return Decimal.pow(1.6, x)
}

function getAQGainExp(x) {
	if (!x) x = quarkGain(true)

	let r = 1
	if (PCs.unl()) r = Math.log10(x.log10() + 1) * PCs_tmp.eff2 + 1
	if (futureBoost("quark_gluon_plasma")) r = Math.pow(x.log10() * r / 100 + 1, 1/3)
	return Math.min(r, 2e4)
}

function getReplStealth() {
	var x = 1
	if (enB.active("glu", 5)) x *= enB_tmp.eff.glu5.int
	if (ff.unl()) x *= ff_tmp.eff.f2
	if (futureBoost("quantum_tunneling") && dev.boosts.tmp[5]) x *= dev.boosts.tmp[5]
	return x
}

//Update Messages
var ngp3Welcomes = {
	msgs: {
		0.5: "<b class='lime'>Paired Challenges!</b> Can you complete 2 challenges at once, and level up your progression? Unlocks after completing Quantum Challenge 7!",
		0.6: "<b class='lime'>Strings!</b> Can you vibrate a string of boosts, which adjusts them at a sawtooth rate?",
		0.61: "<b class='lime'>Strings, again!</b> Yes, I decided to rework Strings for better balancing and less confusion. This also removes Nerfed modifier and reworks Entangled Boosters and Perks.",
		0.611: "<b class='lime'>PC8 combinations!</b> Due to a severe bug for QC8, I am releasing an extra update, which PC8 combinations are slightly easier! (+ some String-era buffs)",
		0.62: () => "<b class='green'>Mostly Paired Challenges + Strings!</b> Yep. This update reworks the gameplay of Paired Challenges and Strings. Any suggestion is welcomed in Discord, and I will implement yours if accepted."
	},
	verbs: {
		0.61: "reworks",
		0.611: "nerfs",
		0.62: "rebalances"
	},
	goals: {
		0.5: () => getFullExpansion(8) + " PC combinations + " + shortenCosts(Decimal.pow(10, 1e13)) + " antimatter",
		0.6: () => shortenCosts(Decimal.pow(10, Math.pow(10, 13.5))) + " antimatter",
		0.61: () => shortenCosts(Decimal.pow(10, Math.pow(10, 13.5))) + " antimatter",
		0.611: () => shortenCosts(Decimal.pow(10, Math.pow(10, 13.5))) + " antimatter",
		0.62: () => shortenCosts(Decimal.pow(10, Math.pow(10, 13.5))) + " antimatter"
	}
}

/*
dump


el("plAniTier").textContent = "Tier " + getFullExpansion(pl.save.layer) + " -> " + getFullExpansion(pl.save.layer + 1)
el("plAniBg").style.display = ""
el("plAniBg2").style.display = "none"
el("plAniTxt").style.display = "none"
el("plAni").style.display = ""
setTimeout(function() {
	el("plAniBg2").style.display = ""
	el("plAniTxt").style.display = ""
}, 1000)
setTimeout(function() {
	el("plAni").style.animation = "plEnd 2s ease"
}, 4000)
setTimeout(function() {
	el("plAni").style.display = "none"
	el("plAni").style.animation = ""
	el("plAniBg").style.display = "none"
}, 5000)
*/

function endGoalAfterStrings(x, slog = 0) {
	let dMult = 13.5
	let tBase = 14/13.5
	let tExp = x
	let qExp = 1.24
	if (x > 4) tExp = (Math.pow(qExp, x - 4) - 1) / Math.log(qExp) + 4

	if (slog >= 3) {
		return tExp * Math.log10(tBase) + Math.log10(dMult)
	} else {
		let dExp = dMult * Math.pow(tBase, tExp)
		let r = dExp
		if (slog < 2) r = Math.pow(10, r)
		if (slog < 1) r = Decimal.pow(10, r)
		return r
	}
}