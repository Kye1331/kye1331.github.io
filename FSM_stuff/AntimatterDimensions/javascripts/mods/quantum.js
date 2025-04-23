// v2.9
function quantum(auto, force, attrs, mode, quick) {
	if (tmp.ngp3 && qu_save.bigRip.active) force = true
	if (!(isQuantumReached()||force)||implosionCheck) return

	var data = {}
	if (mode == "qc") {
		if (((!QCs.done(1) && !pH.did("fluctuate")) || player.options.challConf || aarMod.quantumConf) && !quick) {
			if (!confirm("This starts a Quantum run, but nerfs will be applied. Are you sure do you want to conquer it?")) return
		}
		data.qc = [attrs.qc]
		if (QCs_tmp.show_perks) data.mod = "up"
	}
	if (mode == "pc") {
		if (((PCs_save.lvl == 1 && !pH.did("fluctuate")) || player.options.challConf || aarMod.quantumConf) && !quick) {
			if (!confirm("Starting a Paired Challenge also reduces all Meta Dimensions by ^0.95. Are you sure? Tip: If you are stuck, feel free to exit and reassign it with a different combination.")) return
		}
		data.pc = attrs.pc
		data.qc = PCs.convBack(PCs_save.challs[attrs.pc])
	}
	if (mode == "restart") {
		data.pc = PCs_save.in
		data.qc = QCs_save.in
		data.restart = true
	}

	var headstart = aarMod.newGamePlusVersion >= 1 && !tmp.ngp3
	if (aarMod.quantumConf && !(auto || force)) if (!confirm(player.masterystudies ? "Quantum will reset everything Eternity resets, and including all Eternity Content. You will gain a quark and unlock various upgrades." + (inNGM(2) ? " WARNING! THIS EXITS NG-- MODE DUE TO BALANCING REASONS!" : ""):"WARNING! Quantum wasn't fully implemented in NG++, so if you go Quantum now, you will gain quarks, but they'll have no use. Everything up to and including Eternity features will be reset.")) return
	if (!pH.did("quantum")) if (!confirm("Are you sure you want to do this? You will lose everything you have!")) return


	var implode = !auto && !force && !pH.did("ghostify") && tmp.quUnl && !QCs.unl()
	if (implode) {
		implosionCheck = 2
		dev.implode()
		setTimeout(function(){
			quantumReset(force, auto, data, true)
			implosionCheck = 1
		}, 1000)
		setTimeout(function(){
			implosionCheck = 0
		}, 2000)
	} else quantumReset(force, auto, data)

	updateTmp()
}

function getQuantumReq(base) {
	let exp = tmp.ngp3_mul ? 1 : tmp.ngp3 ? 1.25 : 1
	if (!base && tmp.ngp3) {
		if (QCs.inAny()) return QCs.getGoalMA()
		if (enB.active("pos", 4)) exp /= enB_tmp.eff.pos4
	}
	return Decimal.pow(Number.MAX_VALUE, exp)
}

function isQuantumReached() {
	return pH.can("quantum")
}

function getQuarkGain() {
	return quarkGain()
}

function getQKGain(){
	return quarkGain()
}

function getQuantumReqSource() {
	return tmp.ngp3 ? player.meta.bestAntimatter : player.meta.antimatter
}

function quarkGain(base) {
	if (!pH.did("quantum")) return E(1)

	let ma = getQuantumReqSource().max(1)
	let maReq = getQuantumReq()

	if (!tmp.ngp3) return Decimal.pow(10, ma.log(10) / Math.log10(Number.MAX_VALUE) - 1).floor()

	let log = Math.max(ma.div(maReq).log(2) * 5 / 8192, 0)
	log = Math.pow(log + 1, 3) - 1
	if (enB.active("pos", 11)) log += enB_tmp.eff.pos11.gain.log10()
	
	let r = Decimal.pow(10, log)
	if (!base) {
		r = r.pow(getAQGainExp(r))
		if (hasAch("ng3pr16")) r = r.times(3)
		if (fluc.unl()) {
			r = Decimal.pow(r.log10(), 10).add(1)
			r = r.div(Math.min(r.add(1).log10() / 10 + 1, 3))
		}
	}
	return r
}

function quarkGainNextAt(qk) {
	if (!qk) qk = quarkGain()

	qk = Decimal.add(qk, 1).log10()
	if (enB.active("pos", 11)) qk -= player.eternityPoints.max(1).log10() * enB_tmp.eff.pos11
	if (qk > 3 && PCs.unl()) qk = Math.pow(qk / 3, 1 / PCs_tmp.eff2) * 3
	qk = Math.pow(qk + 1, 1 / 3) - 1

	return Decimal.pow(2, qk * 8192 / 5).times(getQuantumReq())
}

function toggleQuantumConf() {
	aarMod.quantumConf = !aarMod.quantumConf
	el("quantumConfirmBtn").textContent = "Quantum confirmation: " + (aarMod.quantumConf ? "ON" : "OFF")
}

var averageQk = E(0)
var bestQk
function updateLastTenQuantums() {
	if (!player.meta) return
	var listed = 0
	var tempTime = E(0)
	var tempQK = E(0)
	for (var i = 0; i < 10; i++) {
		if (qu_save.last10[i][1].gt(0)) {
			var qkpm = qu_save.last10[i][1].dividedBy(qu_save.last10[i][0] / 600)
			var tempstring = "(" + rateFormat(qkpm, "aQ") + ")"
			var msg = "The quantum " + (i == 0 ? '1 quantum' : (i + 1) + ' quantums') + " ago took " + timeDisplayShort(qu_save.last10[i][0], false, 3)
			if (qu_save.last10[i][2]) {
				if (typeof(qu_save.last10[i][2]) == "number") " in Quantum Challenge " + qu_save.last10[i][2]
				else msg += " in Paired Challenge " + qu_save.last10[i][2][0] + " (QC" + qu_save.last10[i][2][1][0] + "+" + qu_save.last10[i][2][1][1] + ")"
			}
			msg += " and gave " + shortenDimensions(qu_save.last10[i][1]) +" aQ. "+ tempstring
			el("quantumrun"+(i+1)).textContent = msg
			tempTime = tempTime.plus(qu_save.last10[i][0])
			tempQK = tempQK.plus(qu_save.last10[i][1])
			bestQk = qu_save.last10[i][1].max(bestQk)
			listed++
		} else el("quantumrun" + (i + 1)).textContent = ""
	}
	if (listed > 1) {
		tempTime = tempTime.dividedBy(listed)
		tempQK = tempQK.dividedBy(listed)
		var qkpm = tempQK.dividedBy(tempTime / 600)
		var tempstring = "(" + rateFormat(qkpm, "aQ") + ")"
		averageQk = tempQK
		el("averageQuantumRun").textContent = "Average time of the last " + listed + " Quantums: "+ timeDisplayShort(tempTime, false, 3) + " | Average QK gain: " + shortenDimensions(tempQK) + " aQ. " + tempstring
	} else el("averageQuantumRun").textContent = ""
}

function isQuantumFirst() {
	return QCs.inAny() ? !QCs.done(QCs_tmp.in[0]) : !pH.did("quantum")
}

function doQuantumProgress() {
	var percentage = 0
	var className = "metaProgress"
	var first = isQuantumFirst()
	var name = ""

	if (!first && quarkGain().gte(Number.MAX_VALUE)) {
		var fluctuate = Decimal.pow(10, Math.pow(10, 13.5))
		percentage = player.money.log(fluctuate)
		name = "Percentage until Fluctuate (" + shortenCosts(fluctuate) + " antimatter)"
		className = "quantumProgress"
	} else if (!first && quarkGain().gte(256)) {
		var qkLog = quarkGain().log(2)
		var qkNext = Math.pow(2, Math.floor(Math.log2(qkLog) + 1))
		percentage = qkLog / qkNext
		name = "Percentage until " + shorten(Decimal.pow(2, qkNext)) + " aQ"
		className = "quantumProgress"
	} else if (!first && pH.can("quantum")) {
		var qkNext = Math.pow(2, Math.floor(quarkGain().log(2) + 1))
		var goal = quarkGainNextAt(qkNext)
		percentage = getQuantumReqSource().log(goal)
		name = "Percentage until " + shorten(goal) + " MA (" + shortenDimensions(qkNext) + " aQ)"
	} else {
		var goal = QCs.inAny() ? QCs.getGoalMA() : getQuantumReq()
		percentage = getQuantumReqSource().log(goal)
		name = "Percentage until Quantum" + (QCs.inAny() ? " Challenge completion" : "") + " (MA)"
	}
	el("progresspercent").setAttribute('ach-tooltip', name)

	//Set percentage
	percentage = Math.min(percentage * 100, 100).toFixed(2) + "%"
	if (el("progressbar").className != className) el("progressbar").className = className
	el("progressbar").style.width = percentage
	el("progresspercent").textContent = percentage
}

//v2.90142
function quantumReset(force, auto, data, mode, implode = false) {
	var headstart = aarMod.newGamePlusVersion > 0 && !tmp.ngp3
	if (implode && qMs.tmp.amt < 1) {
		showTab("dimensions")
		showDimTab("antimatterdimensions")
		showChallengesTab("normalchallenges")
		showInfTab("preinf")
		showEternityTab("timestudies", true)
	}
	if (!pH.did("quantum")) {
		exitNGMM()
		giveAchievement("Sub-atomic")
		pH.onPrestige("quantum")
		pH.updateDisplay()
		if (tmp.ngp3) {
			el("bestAntimatterType").textContent = "Your best meta-antimatter for this quantum"
			el("quarksAnimBtn").style.display = "inline-block"

			updateMasteryStudyBoughts()
			updateUnlockedMasteryStudies()
			updateSpentableMasteryStudies()
		}
	}
	if (isEmptiness) {
		showTab("dimensions")
		isEmptiness = false
		pH.updateDisplay()
	}
	el("quantumbtn").style.display = "none"

	// check if forced quantum
	// otherwise, give rewards
	if (!force) {
		for (var i = qu_save.last10.length - 1; i > 0; i--) {
			qu_save.last10[i] = qu_save.last10[i - 1]
		}
		var qkGain = quarkGain()
		var array = [qu_save.time, qkGain]
		qu_save.last10[0] = array
		if (qu_save.best > qu_save.time) qu_save.best = qu_save.time
		qu_save.times++

		gainQKOnQuantum(qkGain)

		if (qu_save.times >= 1e4) giveAchievement("Prestige No-lifer")

		if (hasAch("ng3p73")) player.infinitiedBank = c_add(player.infinitiedBank, gainBankedInf())
	} //bounds the else statement to if (force)
	var oheHeadstart = tmp.ngp3
	var keepABnICs = oheHeadstart || hasAch("ng3p51")
	var oldTime = qu_save.time
	qu_save.time = 0
	updateQuarkDisplay()

	if (player.tickspeedBoosts !== undefined) player.tickspeedBoosts = 0
	if (hasAch("r104")) player.infinityPoints = E(2e25);
	else player.infinityPoints = E(0);

	// ng-2 display
	el("galaxyPoints2").innerHTML = "You have <span class='GPAmount'>0</span> Galaxy points."

	/*
		NEW GAME PLUS 3
	*/

	// Quantum
	if (tmp.ngp3) {
		qMs.update()
		qu_save.quarkEnergy = E(0)
		enB.updateTmpOnTick()
	} else qu_save.gluons = 0;

	// Positrons
	if (pos.unl()) {
		pos_save.eng = E(0)
		pos_save.swaps = {...pos_tmp.cloud.next}
	}

	// Quantum Challenges
	var qcDataPrev = QCs_save.in
	if (QCs.unl()) {
		var isQC = data.qc !== undefined
		var qcData = PCs.sort(data.qc)

		if (!force && qcDataPrev.length == 1) {
			var qc = qcDataPrev[0]
			QCs_save.comps = Math.max(QCs_save.comps, qc)
			QCs_save.best[qc] = Math.max(QCs_save.best[qc] || 1/0, qu_save.best)
		}

		delete QCs_save.mod
		QCs_save.disable_swaps.active = isQC && QCs_save.disable_swaps.on

		if (isQC) {
			QCs_save.in = qcData
			QCs_tmp.in = qcData

			if ((hasAch("ng3pr11") ? QCs.in(1) || QCs.in(7) : !QCs.isntCatched()) && !QCs_save.kept) QCs_save.kept = {
				tt: player.timestudy.theorem,
				ms: [...player.masterystudies]
			}
		} else if (force || !player.options.retryChallenge) {
			QCs_save.in = []
			QCs_tmp.in = []

			if (QCs_save.kept) {
				player.timestudy.theorem += QCs_save.kept.tt
				player.masterystudies = [...QCs_save.kept.ms]

				updateMasteryStudyBoughts()
				updateMasteryStudyCosts()

				delete QCs_save.kept
			}
		}

		QCs.reset()
	}

	// Paired Challenges
	if (!PCs.unl()) PCs_tmp.unl = PCs.unl(true)
	if (PCs.unl()) {
		var pc_pos = PCs_save.in
		delete PCs_save.in
		if (data.pc) {
			PCs_save.in = data.pc
			PCs.updateButton(data.pc)
		}

		if (qcDataPrev.length == 2) {
			var pc = PCs.conv(qcDataPrev)
			if (!PCs_save.comps.includes(pc)) {
				if (force) {
					if (pc_pos != data.pc) delete PCs_save.challs[pc_pos]
				} else PCs_save.comps.push(pc)
				PCs.updateButton(pc_pos)
			}
		}

		PCs.resetButtons()
		PCs.updateUsed()
	}

	// Strings
	if (!str.unl()) str_tmp.unl = str.unl(true)
	if (str.unl()) {
		//Positronic Cloud Fix
		pos_save.swaps = {...pos_tmp.cloud.next}
		pos_tmp.cloud.swaps = !pos.swapsDisabled() ? {...pos_tmp.cloud.next} : {}

		if (!data.restart && data.qc && data.qc.includes(5) && data.mod == "up") str_save.energy = 0
	}

	/*
		END OF NG+3 MECHANICS
	*/
	updateQuantumTemp(true)

	doQuantumResetStuff(5, false, isQC, QCs_save.in)

	player.challenges = challengesCompletedOnEternity()
	if (getEternitied() < 50) {
		el("replicantidiv").style.display = "none"
		el("replicantiunlock").style.display = "inline-block"
	} else if (el("replicantidiv").style.display === "none" && getEternitied() >= 50) {
		el("replicantidiv").style.display = "inline-block"
		el("replicantiunlock").style.display = "none"
	}
	player.dilation.totalTachyonParticles = player.dilation.tachyonParticles

	if (tmp.ngp3) {
		if (!force && pH.did("ghostify")) player.ghostify.neutrinos.generationGain = player.ghostify.neutrinos.generationGain % 3 + 1

		pH.updateActive()

		player.eternityBuyer.tpUpgraded = false
		player.eternityBuyer.slowStopped = false
		qu_save.notrelative = true
	} // bounds if tmp.ngp3
	if (qMs.tmp.amt < 1) {
		el("infmultbuyer").textContent = "Autobuy IP mult: OFF"
		el("togglecrunchmode").textContent = "Auto crunch mode: amount"
		el("limittext").textContent = "Amount of IP to wait until reset:"
	}
	if (!oheHeadstart) {
		player.autobuyers[9].bulk = Math.ceil(player.autobuyers[9].bulk)
		el("bulkDimboost").value = player.autobuyers[9].bulk
	}

	// last few updates
	setInitialResetPower()
	resetUP()
	player.replicanti.galaxies = 0
	updateRespecButtons()
	if (hasAch("r36")) player.tickspeed = player.tickspeed.times(0.98);
	if (hasAch("r45")) player.tickspeed = player.tickspeed.times(0.98);
	if (player.infinitied >= 1 && !player.challenges.includes("challenge1")) player.challenges.push("challenge1");
	updateAutobuyers()
	if (hasAch("r85")) player.infMult = player.infMult.times(4);
	if (hasAch("r93")) player.infMult = player.infMult.times(4);
	if (hasAch("r104")) player.infinityPoints = E(2e25);
	resetInfDimensions();
	updateChallenges();
	updateNCVisuals()
	updateChallengeTimes()
	updateLastTenRuns()
	updateLastTenEternities()
	updateLastTenQuantums()
	if (!hasAch("r133")) {
		var infchalls = Array.from(document.getElementsByClassName('infchallengediv'))
		for (var i = 0; i < infchalls.length; i++) infchalls[i].style.display = "none"
	}
	GPminpeak = E(0)
	IPminpeak = E(0)
	EPminpeakType = 'normal'
	EPminpeak = E(0)
	QKminpeak = E(0)
	QKminpeakValue = E(0)
	updateAutobuyers()
	updateMilestones()
	resetTimeDimensions()
	if (oheHeadstart) {
		el("replicantiresettoggle").style.display = "inline-block"
		skipResets()
	} else {
		hideDimensions()
		if (tmp.ngp3) el("infmultbuyer").textContent="Max buy IP mult"
		else el("infmultbuyer").style.display = "none"
		hideMaxIDButton()
		el("replicantidiv").style.display="none"
		el("replicantiunlock").style.display="inline-block"
		el("replicantiresettoggle").style.display = "none"
		delete player.replicanti.galaxybuyer
	}
	var shortenedIP = shortenDimensions(player.infinityPoints)
	el("infinityPoints1").innerHTML = "You have <span class=\"IPAmount1\">" + shortenedIP + "</span> Infinity points."
	el("infinityPoints2").innerHTML = "You have <span class=\"IPAmount2\">" + shortenedIP + "</span> Infinity points."
	updateEternityUpgrades()
	el("totaltickgained").textContent = "You've gained "+player.totalTickGained.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" tickspeed upgrades."
	hideDimensions()
	tmp.tickUpdate = true
	el("eternityPoints2").innerHTML = "You have <span class=\"EPAmount2\">"+shortenDimensions(player.eternityPoints)+"</span> Eternity point"+((player.eternityPoints.eq(1)) ? "." : "s.")
	updateTheoremButtons()
	updateTimeStudyButtons()
	updateDilationUpgradeCosts()
	drawStudyTree()
	handleDispOnQuantum(false)

	Marathon2 = 0;
	setInitialMoney()
	el("quantumConfirmBtn").style.display = "inline-block"
}

function handleDispOnQuantum(bigRip, prestige) {
	handleDispOutOfQuantum()
	handleQuantumDisplays(prestige)

	if (!tmp.ngp3) return

	let keepECs = qMs.tmp.amt >= 2
	if (!keepECs && el("eternitychallenges").style.display == "block") showChallengesTab('normalchallenges')

	let keepDil = player.dilation.studies.includes(1)
	if (!keepDil && el("dilation").style.display == "block") showEternityTab("timestudies", el("eternitystore").style.display=="block")

	let keepMDs = keepDil && qMs.tmp.amt >= 6
	if (!keepMDs && el("metadimensions").style.display == "block") showDimTab("antimatterdimensions")

	let keepMSs = mTs.unl()
	el("masterystudyunlock").style.display = keepMSs ? "" : "none"
	el("respecMastery").style.display = keepMSs ? "block" : "none"
	el("respecMastery2").style.display = keepMSs ? "block" : "none"
	if (keepMSs) drawMasteryTree()
	else {
		performedTS = false
		if (el("masterystudies").style.display == "block") showEternityTab("timestudies", el("eternitystore").style.display != "block")
	}

	if (tmp.quActive) {
		enB.updateUnlock()

		let keepPos = pos.unl()
		let keepStr = str.unl()

		el("positronstabbtn").style.display = keepPos ? "" : "none"
		el("stringstabbtn").style.display = keepStr ? "" : "none"
		str.updateDisp()
	
		if (!keepPos && el("positrons").style.display == "block") showQuantumTab("uquarks")
		if (!keepStr && el("strings").style.display == "block") showQuantumTab("uquarks")
	}
}

function handleDispOutOfQuantum(bigRip) {
	let keepQuantum = pH.shown("quantum")
	let keepQCs = keepQuantum && QCs.unl()
	let keepPCs = keepQuantum && PCs.unl()
	let keepBE = false
	let keepRC = keepQuantum && (QCs.done(1) || pH.did("fluctuate")) && QCs_save.qc1.last && QCs_save.qc1.last.length >= 1

	if (!keepQCs && el("quantumchallenges").style.display == "block") showChallengesTab("normalchallenges")
	if (!keepPCs && el("pairedChalls").style.display == "block") showChallengesTab("normalchallenges")
	if (!keepBE && el("breakEternity").style.display == "block") showEternityTab("timestudies", el("eternitystore").style.display != "block")
	if (!keepRC && el("lasttencompressors").style.display == "block") showStatsTab("stats")

	el("qctabbtn").parentElement.style.display = keepQCs ? "" : "none"
	el("pctabbtn").parentElement.style.display = keepPCs ? "" : "none"
	el("breakEternityTabbtn").style.display = keepBE ? "" : "none"
	el("pastcompressors").style.display = keepRC ? "" : "none"
}

function handleQuantumDisplays(prestige) {
	qMs.updateDisplay()
	updateAutoApplyDisp()
	if (!tmp.ngp3) return

	updateLastTenQuantums()
	updateAutoQuantumMode()

	updateColorCharge()
	updateAssortPercentage()
	updateQuarksTabOnUpdate()
	updateGluonsTabOnUpdate()

	QCs.updateDisp()

	updateBreakEternity()
}

function updateQuarkDisplay() {
	let msg = ""
	if (pH.did("quantum")) {
		msg += "You have <b class='QKAmount'>"+shortenDimensions(qu_save.quarks)+"</b> anti-Quark" + (qu_save.quarks.round().eq(1) ? "" : "s") + "."
	}
	el("quarks").innerHTML=msg
}

function metaReset2() {
	if (tmp.ngp3 && qu_save.bigRip.active) ghostify()
	else quantum()
}

function restartQuantum(autoReset) {
	var auto = autoReset && isQuantumReached()
	quantum(auto, !auto, {}, "restart")
}
