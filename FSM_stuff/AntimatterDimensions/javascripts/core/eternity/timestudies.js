presets = {}

// Time studies
// Todo: Track how much TT you have bought

function buyWithAntimatter() {
	if (player.money.gte(player.timestudy.amcost)) {
		player.money = player.money.minus(player.timestudy.amcost)
		player.timestudy.amcost = player.timestudy.amcost.times(E("1e20000"))
		player.timestudy.theorem += 1
		updateTimeStudyButtons(true)
		return true
	} else return false
}

function buyWithIP() {
	if (player.infinityPoints.gte(player.timestudy.ipcost)) {
		player.infinityPoints = player.infinityPoints.minus(player.timestudy.ipcost)
		player.timestudy.ipcost = player.timestudy.ipcost.times(1e100)
		player.timestudy.theorem += 1
		updateTimeStudyButtons(true)
		return true
	} else return false
}

function buyWithEP() {
	if (!canBuyTTWithEP()) {
		alert("You need to buy at least 1 time dimension before you can purchase theorems with Eternity points.")
		return false;
	}
	if (player.eternityPoints.gte(player.timestudy.epcost)) {
		player.eternityPoints = player.eternityPoints.minus(player.timestudy.epcost)
		player.timestudy.epcost = player.timestudy.epcost.times(2)
		player.timestudy.theorem += 1
		updateTimeStudyButtons(true)
		updateEternityUpgrades()
		return true
	} else return false
}

function canBuyTTWithEP() {
	return aarMod.newGamePlusVersion || tmp.quUnl || player.timeDimension1.bought
}

function maxTheorems() {
	var gainTT = Math.floor((player.money.log10() - player.timestudy.amcost.log10()) / 20000 + 1)
	if (gainTT > 0) {
		player.timestudy.theorem += gainTT
		player.timestudy.amcost = player.timestudy.amcost.times(Decimal.pow("1e20000", gainTT))
		player.money = player.money.sub(player.timestudy.amcost.div("1e20000"))
	}
	
	gainTT = Math.floor((player.infinityPoints.log10() - player.timestudy.ipcost.log10()) / 100 + 1)
	if (gainTT > 0) {
		player.timestudy.theorem += gainTT
		player.timestudy.ipcost = player.timestudy.ipcost.times(Decimal.pow("1e100", gainTT))
		player.infinityPoints = player.infinityPoints.sub(player.timestudy.ipcost.div("1e100"))
	}
	
	gainTT = Math.floor(player.eternityPoints.div(player.timestudy.epcost).plus(1).log2())
	if (gainTT > 0 && canBuyTTWithEP()) {
		player.timestudy.theorem += gainTT
		player.eternityPoints = player.eternityPoints.sub(Decimal.pow(2, gainTT).sub(1).times(player.timestudy.epcost))
		if (!break_infinity_js && isNaN(player.eternityPoints.logarithm)) player.eternityPoints = E(0)
		player.timestudy.epcost = player.timestudy.epcost.times(Decimal.pow(2, gainTT))
	}

	updateTimeStudyButtons(true)
	updateEternityUpgrades()
}

function updateTheoremButtons() {
	var offset = 80
	if (el("progress").style.display == "block") offset += 30
	if (hasDilationUpg(10) && getTTProduction() > 10) {
		offset -= 80
		el("theoremmax").style.display = "none"
		el("theoremam").style.display = "none"
		el("theoremip").style.display = "none"
		el("theoremep").style.display = "none"
		el("autopresetsbtn").style.display = player.timestudy.auto && qMs.tmp.amt >= 1 ? "" : "none"
	} else {
		el("theoremam").style.display = ""
		el("theoremip").style.display = ""
		el("theoremep").style.display = ""
		el("theoremmax").style.display = ""
		el("theoremmax").innerHTML = qMs.tmp.amt >= 1 ? ("Auto: "+(player.autoEterOptions.tt ? "ON" : "OFF")) : "Buy max"

		el("theoremam").style.bottom = (offset - 75) + "px"
		el("theoremip").style.bottom = (offset - 75) + "px"
		el("theoremep").style.bottom = (offset - 75) + "px"

		el("theoremam").className = player.money.gte(player.timestudy.amcost) ? "timetheorembtn" : "timetheorembtnlocked"
		el("theoremam").innerHTML = "+1 Time Theorem<br>Cost: " + shortenCosts(player.timestudy.amcost)
		el("theoremip").className = player.infinityPoints.gte(player.timestudy.ipcost) ? "timetheorembtn" : "timetheorembtnlocked"
		el("theoremip").innerHTML = "+1 Time Theorem<br>Cost: " + shortenCosts(player.timestudy.ipcost) + " IP"
		el("theoremep").className = player.eternityPoints.gte(player.timestudy.epcost) && canBuyTTWithEP() ? "timetheorembtn" : "timetheorembtnlocked"
		el("theoremep").innerHTML = (!canBuyTTWithEP() ? "(requires 1 Time Dimension)" : "+1 Time Theorem<br>Cost: " + shortenDimensions(player.timestudy.epcost) + " EP")

		el("autopresetsbtn").style.display = "none"
	}

	el("timetheorems").style.bottom = (offset) + "px"
	el("theoremmax").style.bottom = (offset - 3) + "px"
	el("presetsbtn").style.bottom = (offset - 3) + "px"
	el("autopresetsbtn").style.bottom = (offset - 3) + "px"
	el("theorembuybackground").style.bottom = (offset - 80) + "px"

	var tt = player.timestudy.theorem
	var html = "<span style='display:inline' class=\"TheoremAmount\">" + (tt >= 1e5 ? shortenMoney(tt) : getFullExpansion(Math.floor(tt))) + "</span> "
	if (tt >= 1e100) html += " Time Theorems" + (player.timestudy.theorem == 1e200 ? " (cap)" : "")
	else if (tt == 1) html = "You have " + html + " Time Theorem."
	else html = "You have " + html + " Time Theorems."
	el("timetheorems").innerHTML = html
}

function buyTimeStudy(name, quickBuy) {
	var cost = studyCosts[name]
	if (player.boughtDims) {
		if (player.timestudy.theorem < player.timestudy.ers_studies[name] + 1) return
		player.timestudy.theorem -= player.timestudy.ers_studies[name]+1
		player.timestudy.ers_studies[name]++
		updateTimeStudyButtons(true)
		return
	}
	if (!quickBuy) {
		if (shiftDown) studiesUntil(name)
		if (tmp.ngp3_boost) refreshAutoPreset()
	}
	if (player.timestudy.theorem >= cost && canBuyStudy(name) && !player.timestudy.studies.includes(name)) {
		player.timestudy.studies.push(name)
		player.timestudy.theorem -= cost
		updateBoughtTimeStudy(name)
		if (name == 131) el("replicantiresettoggle").textContent="Auto galaxy "+(player.replicanti.galaxybuyer?"ON":"OFF")+(!canAutoReplicatedGalaxy()?" (disabled)":"")
		if (quickBuy) return
		updateTimeStudyButtons(true)
		drawStudyTree()
		refreshAutoPreset()
	}
}

function hasRow(row) {
	for (let i = 0; i < player.timestudy.studies.length; i++) {
		if (Math.floor(player.timestudy.studies[i] / 10) == row) return true
	}
	return false
}

function hasTS(num){
	return hasTimeStudy(num)
}

function canBuyStudy(name) {
	let row = Math.floor(name / 10)
	let col = name % 10
	let total = getTotalTT(player)
	let totalChalls = tmp.ec

	if (name == 33) return hasTS(21) 
	if (name == 62) return player.eternityChalls.eterc5 !== undefined && hasTS(42)

	if ((name == 71 || name == 72) && player.eternityChallUnlocked == 12) return false
	if ((name == 72 || name == 73) && player.eternityChallUnlocked == 11) return false

	if (name == 181) {
		return player.eternityChalls.eterc1 !== undefined && player.eternityChalls.eterc2 !== undefined && player.eternityChalls.eterc3 !== undefined && hasTS(171)
	}
	if (name == 201) return hasTS(192) && !hasDilationUpg(8)
	if (name == 211 || name == 212) return hasTS(191)
	if (name == 213 || name == 214) return hasTS(193)

	if (ngcStudies.includes(name)) {
		if (!tmp.ngC) return false
		switch(name) {
			case 12: 
				return hasTS(11)
				break;
			case 23:
				return hasTS(21)
				break; 
			case 24: 
			case 34:
				return hasTS(22)
				break; 
			case 25: 
				return hasTS(13)
				break; 
			case 35: 
				return hasTS(34) && (player.infinityPoints.plus(1).log10() >= 9000 || ETER_UPGS.has(11))
				break;
			case 43: 
				return hasTS(33)
				break;
			case 44: 
				return hasTS(34)
				break;
			case 52: 
				return hasTS(41)
				break;
			case 63:
				return hasTS(52) || hasTS(61)
				break;
			case 112:
				return total >= 250 && hasTS(111)
				break;
			case 113:
				return total >= 1800 && hasTS(112)
				break; 
			case 152:
				return totalChalls >= 20 && hasTS(141)
				break;
			case 172:
				return totalChalls >= 10 && hasTS(161)
				break;
			case 173:
				return totalChalls >= 20 && hasTS(162)
				break; 
			case 194:
				return hasTS(191)
				break;
			case 195:
			case 196:
			case 197:
				return hasTS(name - 2)
				break;
			case 202:
			case 203:
				return hasTS(name - 8)
				break;

		}
	}

	var always = row > 1 && (
		futureBoost("all_time_studies") || //NG+3
		(tmp.ngp3_mul && player.eternityUpgrades.includes(15)) //NG*+3
	)
	if (!always && tmp.ngC) {
		if (name == 61 && total < 18) return false
		if (name == 151 && total < 195) return false
		if (name == 171 && total < 200) return false
	}

	switch(row) {

		case 1: return true

		case 2:
		case 5:
		case 6:
		case 11:
		case 15:
		case 16:
		case 17:
			return hasRow(row - 1)

		case 3:
		case 4:
		case 8:
		case 9:
		case 10:
		case 13:
		case 14:
			return hasTS((row - 1) * 10 + col)

		case 12:
			let have = player.timestudy.studies.filter(function(x) {return Math.floor(x / 10) == 12}).length
			if (hasRow(row - 1)) {
				if (always || ETER_UPGS.has(10)) return true
				if (ETER_UPGS.has(15)) return have < 2
				return have < 1
			}
			return false

		case 7:
			if (!hasTS(61)) return false
			if (always) return true
			if (hasDilationUpg(8)) return true
			if (ETER_UPGS.has(10)) return true

			let have2 = player.timestudy.studies.filter(function(x) {return Math.floor(x / 10) == 7}).length
			if (hasTS(201)) return have2 < 2
			return have2 < 1

		case 19:
			return player.eternityChalls.eterc10 !== undefined && hasTS(181)

		case 22:
			if (!always && tmp.ngC && total < 4500) return false;
			return hasTS(210 + Math.round(col/2)) && (((name % 2 == 0) ? !hasTS(name-1) : !hasTS(name+1)) || (ETER_UPGS.has(11) && tmp.ngC) || ETER_UPGS.has(14) || always)

		case 23:
			return (hasTS(220 + Math.floor(col*2)) || hasTS(220 + Math.floor(col*2-1))) && (!hasTS((name%2 == 0) ? name-1 : name+1) || ETER_UPGS.has(11) || ETER_UPGS.has(13) || always)
	}
}

let vanillaStudies = [11, 21, 22, 33, 31, 32, 41, 42, 51, 61, 62, 71, 72, 73, 81, 82 ,83, 91, 92, 93, 101, 102, 103, 111, 121, 122, 123, 131, 132, 133, 141, 142, 143, 151, 161, 162, 171, 181, 191, 192, 193, 201, 211, 212, 213, 214, 221, 222, 223, 224, 225, 226, 227, 228, 231, 232, 233, 234]
let ngcStudies = [12, 13, 23, 24, 25, 34, 35, 43, 44, 52, 63, 112, 113, 152, 172, 173, 194, 195, 196, 197, 202, 203]

let all = vanillaStudies.concat(ngcStudies)
let studyCosts = { // vanilla study costs
	11: 1,
	21: 3,		22: 2,
	33: 2,		31: 3,		32: 2,
	41: 4,		42: 6,
	51: 3,
	61: 3,		62: 3,
	71: 4, 		72: 6,		73: 5,
	81: 4,		82: 6,		83: 5,
	91: 4, 		92: 5,		93: 7,
	101: 4,		102: 6,		103: 6,
	111: 12,
	121: 9,		122: 9,		123: 9,
	131: 5,		132: 5,		133: 5,
	141: 4,		142: 4,		143: 4,
	151: 8,
	161: 7,		162: 7,
	171: 15,
	181: 200,
	191: 400,	192: 730,	193: 300,
	201: 900,
	211: 120,	212: 150,	213: 200,	214: 120,
	221: 900,	222: 900,	223: 900,	224: 900,	225: 900,	226: 900,	227: 900,	228: 900,
	231: 500,	232: 500,	233: 500,	234: 500,

	// NG Condensed
	12: 6,		13: 5,
	23: 6,		24: 7,		25: 20,
	34: 5,	 	35: 10,
	43: 4,	 	44: 2,
	52: 9,
	63: 7,
	112: 12,	113: 24,
	152: 25,
	172: 10,	173: 25,
	194: 450,	195: 375,	196: 375,	197: 500,
	202: 200,	203: 200
}

function setupTimeStudies() {
	let before = [... all]
	let after = [... vanillaStudies]
	if (tmp.ngC) after = after.concat(ngcStudies)
	let combined = before.concat(after)
	for (let i = 0; i < combined.length; i++) {
		let id = combined[i]
		if (before.includes(id) != after.includes(id)) {
			el(id).style.visibility = after.includes(id) ? "visible" : "hidden"
			el(id).className = "timestudy"
		}
	}
	all = after
	updateBoughtTimeStudies()
}

var performedTS
function updateTimeStudyButtons(changed, forceupdate = false) {
	if (!forceupdate && (changed ? hasDilationUpg(10) : performedTS && !hasDilationUpg(10))) return
	performedTS = true
	if (player.boughtDims) {
		var locked = getTotalTT(player) < 60
		el("nextstudy").textContent = locked ? "Next time study set unlocks at 60 total Time Theorems." : ""
		el("tsrow3").style.display = locked ? "none" : ""
		for (var id = 1; id < (locked ? 5 : 7); id++) {
			var b = player.timestudy.ers_studies[id]
			var c = b + 1
			el("ts" + id + "bought").textContent = getFullExpansion(b)
			el("ts" + id + "cost").textContent = getFullExpansion(c)
			el("ts" + id).className = "eternityttbtn" + (player.timestudy.theorem < c ? "locked" : "")
		}
		return
	}
	for (let i = 0; i < all.length; i++) {
		let id = all[i]
		if (!hasTimeStudy(id)) updateTimeStudyClass(id, canBuyStudy(id) && player.timestudy.theorem >= studyCosts[id] ? "" : "locked")
	}

	for (let i = 1; i <= 6; i++) {
		if (hasDilationStudy(i)) el("dilstudy" + i).className = "dilationupgbought"
		else if (canBuyDilationStudy(i)) el("dilstudy" + i).className = "dilationupg"
		else el("dilstudy" + i).className = "timestudylocked"
	}

	el("dilstudy6").style.display = player.meta ? "" : "none"
	el("masteryportal").style.display = player.masterystudies ? "" : "none"
	if (tmp.ngp3) {
		el("masteryportal").innerHTML = mTs.unl() ? "Mastery portal<span>Continue into mastery studies.</span>" : !hasDilationStudy(1) ? "To be continued...." : "Mastery portal (" + (hasDilationStudy(6) ? "66%: requires "+shortenCosts(1e100)+" dilated time upgrade)" : "33%: requires meta-dimensions)") 
		el("masteryportal").className = mTs.unl() ? "dilationupg" : "timestudylocked"
	}
}

function updateTimeStudyClass(id, type = "") {
	let className = "timestudy" + type
	if (id > 70 && id < 110) {
		className += " " + [null, "normal", "inf", "time"][id % 10] + "dimstudy"
	} else if (id > 120 && id < 150) {
		className += " " + [null, "active", "passive", "idle"][id % 10] + "study"
	} else if (id > 220) {
		className += " " + ["light", "dark"][id % 2] + "study"
	}
	el(id).className = className
}

function updateBoughtTimeStudy(id) {
	updateTimeStudyClass(id, "bought")
}

function updateBoughtTimeStudies() {
	for (let i = 0; i < player.timestudy.studies.length; i++) {
		let id = player.timestudy.studies[i]
		if (typeof(id) != "number") id = parseInt(id)
		if (!all.includes(id)) continue
		updateBoughtTimeStudy(id)
	}	
}

function studiesUntil(id) {
	let col = id % 10;
	let row = Math.floor(id / 10);
	let path = [0,0];
	for (let i = 1; i < 4; i++){
		if (player.timestudy.studies.includes(70 + i)) path[0] = i;
		if (player.timestudy.studies.includes(120 + i)) path[1] = i;
	}
	if ((row > 10 && path[0] === 0) || (row > 14 && path[1] === 0)) {
		return;
	}
	for (let i = 1; i < row; i++) {
		var chosenPath = path[i > 11 ? 1 : 0];
		if (row > 6 && row < 11) var secondPath = col;
		if ((i > 6 && i < 11) || (i > 11 && i < 15)) buyTimeStudy(i * 10 + (chosenPath === 0 ? col : chosenPath), true);
		if ((i > 6 && i < 11) && player.timestudy.studies.includes(201)) buyTimeStudy(i * 10 + secondPath, true);
		else for (var j = 1; all.includes(i * 10 + j) ; j++) buyTimeStudy(i * 10 + j, true);
	}
	refreshAutoPreset()
}

function respecTimeStudies(force) {
	let respecTime = player.respec || force
	let gotAch = !force
	if (respecTime) {
		if (player.boughtDims) {
			var temp = player.timestudy.theorem
			for (var id = 1; id <= 6; id++) player.timestudy.theorem += player.timestudy.ers_studies[id] * (player.timestudy.ers_studies[id] + 1) / 2
			if (temp > player.timestudy.theorem) gotAch = false
			player.timestudy.ers_studies = [null, 0, 0, 0, 0, 0, 0]
		} else {
			for (var i = 0; i < all.length; i++) {
				if (player.timestudy.studies.includes(all[i])) {
					player.timestudy.theorem += studyCosts[all[i]]
					gotAch = false
				}
			}
			if (player.masterystudies) if (player.timestudy.studies.length>1) qu_save.wasted = false
			player.timestudy.studies = []
		}

		updateTimeStudyButtons(true, true)
		if (player.respec) respecToggle()
		if (player.eternityChallUnlocked <= 12) resetEternityChallUnlocks()
	}

	let respecMastery = false
	if (mTs.unl()) respecMastery = player.respecMastery || force
	if (respecMastery) {
		let oldMS = player.masterystudies.concat()
		mTs.respec()

		if (player.masterystudies.length > oldMS.length) {
			qu_save.wasted = false
			gotAch = false
		}
	}

	drawStudyTree()
	if (gotAch) giveAchievement("You do know how these work, right?")
	doInitInfMultStuff()
	if (player.replicanti.galaxybuyer) el("replicantiresettoggle").textContent = "Auto galaxy: ON"
	else el("replicantiresettoggle").textContent = "Auto galaxy: OFF"
}

function respecUnbuyableTimeStudies() {
	var respecedTS = []

	for (var t = 0; t < all.length; t++) {
		var id = all[t]
		if (hasTS(id)) respecedTS.push(id)
	}
	player.timestudy.studies = respecedTS
}

function getTotalTT(tree) {
	tree = tree.timestudy
	let result = tree.theorem
	if (tree.boughtDims) {
		for (let id = 1; id < 7; id++) result += tree.ers_studies[id] * (tree.ers_studies[id] + 1) / 2
		return result
	} else {
		let ecCosts = [null, 30, 35, 40, 70, 130, 85, 115, 115, 415, 550, 1, 1]
		for (let id = 0; id < all.length; id++) if (tree.studies.includes(all[id])) result += studyCosts[all[id]]
		return result + ecCosts[player.eternityChallUnlocked]
	}
}

function exportSpec() {
	let l = [];
	for (let i = 1; i <= numTimeStudies; i++) {
		if (studyHasBeenUnlocked(i)) {
			l.push(player.timestudy.studies[i]);
		}
	}
	let s = l.join('/');
	copyToClipboard(s);
}

function importSpec () {
	let s = prompt('Enter your spec');
	let l = s.split('/');
	for (let i = 1; i <= l.length; i++) {
		for (let j = 0; j < +l[i - 1]; j++) {
			if (!buyTimeStudy(i)) break;
		}
	}
}

function getStudyTreeStr() {
	if (player.boughtDims) {
		let l = [];
		for (let i = 1; i < 7; i++) {
			if (i < 5 || getTotalTT(player) > 59) {
				l.push(player.timestudy.ers_studies[i]);
			}
		}
		return l.join('/')
	} else {
		var mtsstudies = []
		if (tmp.ngp3) {
			for (id = 0; id < player.masterystudies.length; id++) {
				var t = player.masterystudies[id].split("t")[1]
				if (t) mtsstudies.push(t - 230)
			}
		}
		return player.timestudy.studies + (mtsstudies.length ? "|ms" + mtsstudies : "") + "|" + player.eternityChallUnlocked
	}
}

function exportStudyTree() {
	copyToClipboard(getStudyTreeStr())
}

function importStudyTree(input) {
	onImport = true
	if (typeof input !== 'string') var input = prompt()
	onImport = false
	if (sha512_256(input) == "08b819f253b684773e876df530f95dcb85d2fb052046fa16ec321c65f3330608") giveAchievement("You followed the instructions")
	if (input === "") return false
	if (player.boughtDims) {
		let l = input.split('/');
		for (let i = 1; i <= l.length; i++) {
			for (let j = 0; j < l[i - 1]; j++) {
				if (!buyTimeStudy(i)) break;
			}
		}
	} else {
		var data = parsePreset(input)
		var oldLength = player.timestudy.studies.length
		var oldLengthMS = tmp.ngp3 && player.masterystudies.length

		//Time studies
		var studiesToBuy = data.ts
		var secondSplitPick = 0
		var laterSecondSplits = []
		var earlyDLStudies = []
		var laterDLStudies = []
		for (var i = 0; i < studiesToBuy.length; i++) {
			var study = parseInt(studiesToBuy[i])
			if ((study < 120 || study > 150 || (secondSplitPick < 1 || study % 10 == secondSplitPick)) && (study < 220 || study > 240 || earlyDLStudies.includes(study + (study % 2 > 0 ? - 1 : 1)))) {
				if (study > 120 && study < 150) secondSplitPick = study % 10
				else if (study > 220 && study < 240) earlyDLStudies.push(study)
				buyTimeStudy(study, true)
			} else if (study < 150) laterSecondSplits.push(study)
			else laterDLStudies.push(study)
		}
		for (var i=0; i < laterSecondSplits.length; i++) buyTimeStudy(laterSecondSplits[i], true)
		for (var i=0; i < laterDLStudies.length; i++) buyTimeStudy(laterDLStudies[i], true)

		//Mastery Studies
		if (data.ms) {
			var studiesToBuy = data.ms
			for (var i = 0; i < studiesToBuy.length; i++) {
				var study = parseInt(studiesToBuy[i].split("t")[1])
				buyMasteryStudy("t", study, true)
			}
		}

		//Eternity Challenges
		var ec = data.ec
		if (ec > 0) {
			justImported = true

			if (ec > 12) buyMasteryStudy("ec", ec, true)
			else el("ec" + ec + "unl").click()

			justImported = false
		}
		if (tmp.ngp3 && player.masterystudies.length > oldLengthMS) {
			updateMasteryStudyCosts()
			updateMasteryStudyButtons()
			updateMasteryStudyTextDisplay()
			drawMasteryTree()
		}
		if (player.timestudy.length > oldLength) {
			updateTimeStudyButtons(true)
			drawStudyTree()
		}
	}
}

function parsePreset(str) {
	let splits = str.split("|")
	let data = {}

	let tsAssigned = false
	let msAssigned = false
	let ecAssigned = false

	if (splits.length >= 1) {
		tsAssigned = true

		var tmpData = splits[0].split(",")
		var tmpData2 = []
		data.ts = tmpData
	
		for (var i = 0; i < tmpData.length; i++) {
			let num = parseInt(tmpData[i])
			if (num > 240) tmpData2.push("t" + num) //Old format compatability
			else tmpData[i] = num
		}

		if (tmpData2.length > 0) {
			data.ms = tmpData2
			msAssigned = true
		}
	}
	if (splits.length >= 3 && !msAssigned) {
		msAssigned = true

		var tmpData = splits[1].split(",")
		for (var i = 0; i < tmpData.length; i++) tmpData[i] = "t" + (tmpData[i] == "ms11" ? 241 : parseInt(tmpData[i]) + 230)
		data.ms = tmpData
	}
	if (splits.length >= 2) {
		ecAssigned = true

		data.ec = parseInt(splits[splits.length - 1])
	}

	return data
}

function shouldRespec(str) {
	return true
}

function new_preset(importing) {
	var input

	if (importing) {
		onImport = true
		input = prompt()

		onImport = false
		if (input === null) return
	} else input = getStudyTreeStr()

	var placement = 1
	while (poData.includes(placement)) placement++
	presets[placement] = {preset: input}
	localStorage.setItem(btoa(presetPrefix + placement), btoa(JSON.stringify(presets[placement])))
	poData.push(placement)
	latestRow = el("presets").insertRow(loadedPresets)
	latestRow.innerHTML = getPresetLayout(placement)
	loadedPresets++
	changePresetTitle(placement, loadedPresets)
	localStorage.setItem(metaSaveId,btoa(JSON.stringify(metaSave)))
	$.notify("Preset created", "info")
}

function hasTimeStudy(x) {
	return tmp.eterUnl && player.timestudy.studies.includes(x)
}

//Time Study Effects
let tsMults = {
	11() {
		let log = -player.tickspeed.div(1e3).pow(0.005).times(0.95).plus(player.tickspeed.div(1e3).pow(0.0003).times(0.95)).log10()

		if (tmp.ngp3_mul) log = Math.min(log, 25000) // buff to NG*+3
		else log = Math.min(log, 2500)

		if (log < 0) log = 0
		return Decimal.pow(10, log)
	},
	32() {
		let ret = Math.pow(Math.max(getTotalDBs(), 1), aarMod.newGameMult ? 4 : 1)
		if (player.timestudy.studies.includes(197) && tmp.ngC) ret = Math.pow(ret, 3)
		return ret
	},
	41() {
		if (tmp.ngC) return 1.1
		return aarMod.newGameExpVersion ? 1.5 : 1.2
	},
	42() {
		if (tmp.ngC) return 29/30
		return (aarMod.newGameExpVersion ? 12 : 13) / 15
	},
	51(){
		if (tmp.ngC) return Decimal.pow((ngC.save.repl + 1) * (getFullEffRGs() + 1), 160)
		return aarMod.newGameExpVersion ? 1e30 : 1e15
	},
	61() {
		return tmp.ngC ? Decimal.pow(25, Math.log10(getReplEff().log10() / 308.25 + 1) / Math.log10(2)) : (tmp.ngp3_exp ? 100 : 10)
	},
	62() {
		let r = aarMod.newGameExpVersion ? 4 : 3
		if (tmp.exMode) r -= 0.5
		if (tmp.ngC) r /= 2
		return r
	},
	83() {
		let x = Decimal.pow(1.0004, player.totalTickGained)
		if (tmp.ngpX < 2) x = x.min(1e30)
		if (tmp.ngp3) x = softcap(x, "ts83")
		return x
	},
	141() {
		return Decimal.div(1e45, Decimal.pow(15, Math.log(player.thisInfinityTime + 1) * Math.pow(player.thisInfinityTime + 1, 0.125))).max(hasAch("r137") && tmp.ngp3_boost && !tmp.exMode ? 1e25 : 1)
	},
	211() {
		return inNGM(2) ? 1 : 5
	},
	212() {
		let r = player.timeShards.max(2).log2()
		if (aarMod.newGameExpVersion || tmp.ngC) return Math.min(Math.pow(r, 0.006), 1.15)
		return Math.min(Math.pow(r, 0.005), 1.1)
	},
	213() {
		return tmp.ngC ? 2 : tmp.exMode ? 15 : 20
	},
	222() {
		return inNGM(2) ? 0.5 : 2
	},
	221() {
		return Decimal.pow(1.0025, getTotalDBs())
	},
	224() {
		return Math.floor(getTotalDBs() / 2000)
	},
	225() {
		let x = Math.floor(getReplEff().e / 1e3)
		if (tmp.ngp3) x = softcap(x, "ts225")
		return Math.floor(x)
	},
	226() {
		let x = Math.floor(player.replicanti.gal / 15)
		return x
	},
	227() {
		return Decimal.pow(tmp.sacPow.max(10).log10(), 10)
	},
	231() {
		let db = getTotalDBs()
		let x = Decimal.pow(Math.max(db, 1), 0.3)
		if (tmp.ngp3 && hasAch("ngpp15")) {
			let str = Math.min(Math.log2(db / 2e6 + 2), 10)
			str *= Math.min(str, 10) * 3e-6
			x = x.max(Decimal.pow(2, db * str))
		}
		return x
	},
	232() {
		return Math.pow(1 + player.galaxies / 1000, 0.2)
	},
	233() {
		let rep = getReplEff().max(1).log10()
		rep *= 0.3
		if (hasMTS(302)) rep *= rep / 1e5 + 1

		return Decimal.pow(10, rep)
	},

	//NG Condensed
	13() {
		return Math.pow(player.galaxies + 1, 4/9)
	},
	25() {
		let x = Decimal.pow(player.infinityPower.plus(1).log10() + 1, 10);
		if (hasTimeStudy(197)) x = x.pow(3)
		if (hasDilationUpg("ngp3c3")) x = x.pow(getDil46Mult())
		return x
	},
	35() {
		let ip = player.infinityPoints
		let reached = false
		if (ip.gte("1e9000")) reached = true
		ip = ip.div("1e9500")

		let x = Decimal.pow(ip.plus(1).log10()/100+1, 4).max(10)
		if (reached && ip.lt(1)) x = E(10) //this does nothing?
		return x
	},
	43() {
		let rg = getFullEffRGs()
		let x = rg * 0.02
		if (hasTimeStudy(197)) x *= 3
		return x + 1
	},
	52() {
		let rg = getFullEffRGs()
		let x = Math.sqrt(rg / 2)
		if (hasTimeStudy(172)) x *= Math.cbrt(rg / 10 + 1)
		return x + 1
	},
	63() {
		let x = player.eternityPoints.plus(1).pow(100)
		if (x.gte("1e1000")) x = Decimal.pow(x.log10(), 1000/3)
		return x
	},
	152() {
		return Decimal.pow(10, Math.sqrt(player.galaxies * 5))
	},
	172() {
		let rg = getFullEffRGs()
		let repl = player.replicanti.amount
		if (hasTimeStudy(197)) repl = repl.pow(Math.sqrt(rg / 2.5 + 1))
		else if (repl.gte("1e4000")) repl = Decimal.pow(repl.log10(), 1110.49).min(repl)
	
		let x = repl.plus(1).pow(1e-3)
		if (x.gte(1e285)) x = E(x.log10()).times(Decimal.div(1e285, 285))
		return x
	},
	191() {
		let inf = getInfinitied()
		let x = Decimal.add(inf, 1).log10()/5
		return x
	},
	202() {
		let cond = player.condensed.normal.reduce((a,c) => (a||0)+(c||0))
		let x = Decimal.pow(10, 25000 * Math.sqrt(cond))
		return x
	},
	203() {
		let cond = player.condensed.time.reduce((a,c) => (a||0)+(c||0))
		let x = Decimal.pow(10, 50 * Math.sqrt(cond))
		return x
	}
}

function getTSReplEff() {
	let r = 1
	if (hasTS(132)) r += 0.4
	if (hasTS(133)) r += 0.5

	return r
}