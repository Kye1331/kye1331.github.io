// NORMAL CHALLENGES
function startChallenge(name) {
	if (name == "postc3" && isIC3Trapped()) return
	if (name.includes("post")) {
		if (player.postChallUnlocked < checkICID(name)) return
		var target = getGoal(name)
	} else var target = E(Number.MAX_VALUE)
	if (player.options.challConf && name != "") if (!confirm("You will start over with just your Infinity upgrades, and achievements. You need to reach " + (name.includes("post") ? "a set goal" : "infinity") + " with special conditions. The 4th Infinity upgrade column doesn't work on challenges.")) return
	if (player.tickspeedBoosts != undefined) player.tickspeedBoosts = 0
	if (name == "postc1" && player.currentEternityChall != "" && QCs.in(4) && QCs.in(6)) giveAchievement("The Ultimate Challenge")

	player.currentChallenge = name
	player.challengeTarget = target
	doNormalChallengeResetStuff()
	
	player.tdBoosts = resetTDBoosts()
	resetPSac()
	resetTDsOnNGM4()
	reduceDimCosts()
	if (player.currentChallenge == "postc1") player.costMultipliers = [E(1e3), E(5e3), E(1e4), E(1.2e4), E(1.8e4), E(2.6e4), E(3.2e4), E(4.2e4)];
	if (player.currentChallenge == "postc2") {
		player.eightAmount = E(1);
		player.eightBought = 1;
		player.resets = 4;
	}
	updateNCVisuals()
	
	if (player.infinityUpgradesRespecced != undefined) {
		player.singularity.darkMatter = E(0)
		player.dimtechs.discounts = 0
	}
	updateSingularity()
	updateDimTechs()
	
	if (player.replicanti.unl) player.replicanti.amount = E(1)
	if (!tmp.ngC) player.replicanti.galaxies = 0

	// even if we're in a challenge, apparently if it's challenge 2 we might have four resets anyway.
	setInitialResetPower();

	GPminpeak = E(0)
	IPminpeak = E(0)
	if (player.currentChallenge.includes("post")) {
		player.break = true
		el("break").innerHTML = "FIX INFINITY"
	}
	if (hasAch("r36")) player.tickspeed = player.tickspeed.times(0.98);
	if (hasAch("r45")) player.tickspeed = player.tickspeed.times(0.98);
	if (hasAch("r66")) player.tickspeed = player.tickspeed.times(0.98);
	if (hasAch("r83")) player.tickspeed = player.tickspeed.times(Decimal.pow(0.95, player.galaxies));

	showTab('dimensions')
	updateChallenges()
	setInitialMoney()

	resetInfDimensions();
	hideDimensions()
	tmp.tickUpdate = true;

	skipResets()
	if (player.currentChallenge.includes("post") && player.currentEternityChall !== "") giveAchievement("I wish I had gotten 7 eternities")
	Marathon2 = 0;
}

function startNormalChallenge(x) {
	if (x == 7) {
		if (player.infinitied < 1 && player.eternities < 1 && !quantumed) return
		startChallenge("challenge7", Number.MAX_VALUE)
	}
	if (tmp.ngmX > 3) galacticSacrifice(false, true, x)
	else startChallenge("challenge" + x, Number.MAX_VALUE)
}

function inNC(x, n) {
	if (x == 6) {
		let on = player.currentChallenge == "challenge6" || player.currentChallenge == "postc1"
		if (!on) return false

		if (n == 1) return !tmp.exMode && tmp.ngmX < 2
		if (n == 2) return !tmp.exMode && tmp.ngmX >= 2
		if (n == 3) return tmp.exMode
	}
	if (x == 0) return player.currentChallenge == "" && (player.galacticSacrifice === undefined || !player.galacticSacrifice.chall) && inPxC(0)
	return player.currentChallenge == "challenge" + x || (tmp.ngmX > 3 && player.galacticSacrifice.chall == x) || inPxC(x)
}

function getTotalNormalChallenges() {
	let x = 11
	if (inNGM(2)) x += 2
	else if (player.infinityUpgradesRespecced) x++
	if (player.tickspeedBoosts != undefined) x++
	if (tmp.ngmX > 3) x++
	return x
}

function updateNCVisuals() {
	var chall = player.currentChallenge

	if (inNC(2) || chall == "postc1" || tmp.ngmR || inNGM(5)) el("chall2Pow").style.display = "inline-block"
	else el("chall2Pow").style.display = "none"

	if (inNC(3) || chall == "postc1") el("chall3Pow").style.display = "inline-block"
	else el("chall3Pow").style.display = "none"

	if (inMatterChallenge()) el("matter").style.display = "block"
	else el("matter").style.display = "none"

	if (isADSCRunning()) el("chall13Mult").style.display = "block"
	else el("chall13Mult").style.display = "none"

	if (inNC(14) && tmp.ngmX > 3) el("c14Resets").style.display = "block"
	else el("c14Resets").style.display = "none"

	if (inNC(6, 3) || inNC(9) || inNC(12) || ((inNC(5) || inNC(14) || chall == "postc4" || chall == "postc5") && tmp.ngmX < 3) || chall == "postc1" || chall == "postc6" || chall == "postc8") el("quickReset").style.display = "inline-block"
	else el("quickReset").style.display = "none"
}

let NC_NAMES = {
	challenge1: "",
	challenge2: "Second Dimension Autobuyer",
	challenge3: "Third Dimension Autobuyer",
	challenge4: "Automated Dimension Boosts",
	challenge5: "Tickspeed Autobuyer",
	challenge6: "Fifth Dimension Autobuyer",
	challenge7: "Automated Galaxies Autobuyer",
	challenge8: "Fourth Dimension Autobuyer",
	challenge9: "Seventh Dimension Autobuyer",
	challenge10: "Sixth Dimension Autobuyer",
	challenge11: "Eighth Dimension Autobuyer",
	challenge12: "Automated Big Crunches",
	challenge13: "Automated Dimensional Sacrifice",
	challenge14: "Automated Galactic Sacrifice",
	challenge15: "Automated Tickspeed Boosts",
	challenge16: "Automated Time Dimension Boosts",
}
let NC_IDS = {
	challenge1: 1,
	challenge2: 2,
	challenge3: 3,
	challenge4: 10,
	challenge5: 9,
	challenge6: 5,
	challenge7: 11,
	challenge8: 4,
	challenge9: 7,
	challenge10: 6,
	challenge11: 8,
	challenge12: 12,
	challenge13: 13,
	challenge14: 14,
	challenge15: 15,
	challenge16: 16,
}
function getNCName(x) {
	let ic = x.split("postc")
	if (ic[1]) return "Infinity Challenge " + IC_LOOKUP[x]

	return NC_NAMES[x] + " Challenge"
}

function inMatterChallenge() {
	return inNC(12) || player.currentChallenge == "postc1" || player.currentChallenge == "postc6"
}

var worstChallengeTime = 1
var worstChallengeBonus = 1
function updateWorstChallengeTime() {
	worstChallengeTime = 1
	for (var i = 0; i < getTotalNormalChallenges(); i++) worstChallengeTime = Math.max(worstChallengeTime, player.challengeTimes[i])
}

function updateWorstChallengeBonus() {
	updateWorstChallengeTime()
	var exp = inNGM(2) ? 2 : 1
	var timeeff = Math.max(33e-6, worstChallengeTime * 0.1)
	var base = tmp.ngmX >= 4 ? 3e4 : 3e3
	var eff = Decimal.max(Math.pow(base / timeeff, exp), 1)
	if (tmp.ngmX >= 4) eff = eff.times(Decimal.pow(eff.plus(10).log10(), 5)) 
	worstChallengeBonus = eff
}

function updateChallenges() {
	var buttons = Array.from(el("normalchallenges").getElementsByTagName("button")).concat(Array.from(el("breakchallenges").getElementsByTagName("button")))
	for (var i=0; i < buttons.length; i++) {
		buttons[i].className = "challengesbtn";
		buttons[i].textContent = "Start"
	}

	tmp.cp = 0
	for (var i=0; i < player.challenges.length; i++) {
		let elm = el(player.challenges[i])
		if (elm) {
			elm.className = "completedchallengesbtn";
			elm.textContent = "Completed"
			if (player.challenges[i].search("postc") == 0) tmp.cp++
		}
	}

	let running = []
	if (player.currentChallenge === "") {
		if (!player.challenges.includes("challenge1")) running.push("challenge1")
	} else running.push(player.currentChallenge)
	if (inNGM(4)) {
		var chall = player.galacticSacrifice.chall
		if (chall) running.push("challenge" + chall)
	}
	for (var i = 0; i < running.length; i++) {
		var chall = running[i]
		el(chall).className = "onchallengebtn";
		el(chall).textContent = "Running"
	}

	el("challenge7").parentElement.parentElement.style.display = player.infinitied < 1 && player.eternities < 1 && !pH.did("quantum") ? "none" : ""

	if (isIC3Trapped()) {
		el("postc3").className = "onchallengebtn";
		el("postc3").textContent = "Trapped in"
	}

	if (player.postChallUnlocked > 0 || Object.keys(player.eternityChalls).length > 0 || player.eternityChallUnlocked !== 0) el("challTabButtons").style.display = "table"
	for (c = 0; c < order.length; c++) el(order[c]).parentElement.parentElement.style.display = player.postChallUnlocked >= c + 1 ? "" : "none"
	el("postctabbtn").parentElement.style.display = pH.shown("infinity") && (player.postChallUnlocked >= 1 || pH.did("eternity")) ? "" : "none"

	resetIC1Reward()
	updateInChallenges()
}

function updateInChallenges() {
	let array = []
	if (inNGM(4) && player.galacticSacrifice.chall > 0) array.push(NC_NAMES["challenge" + player.galacticSacrifice.challenge])
	if (player.currentChallenge != "") array.push(getNCName(player.currentChallenge))
	if (player.dilation.active) array.push("Time Dilation")
	else if (player.currentEternityChall != "") array.push("Eternity Challenge " + player.eternityChallUnlocked)
	if (QCs.inAny()) array.push("Quantum Challenge " + wordizeList(QCs_save.in, false, " + ", false) + (PCs.in() ? " (Pair " + PCs.name(PCs_save.in) + ")" : ""))

	setAndMaybeShow("inchall", array.length > 0, () => "You are currently in " + wordizeList(array))
}

var infchallengeTimes = 999999999
function updateChallengeTimes() {
	if (!pH.shown("infinity")) {
		el("challengetimesbtn").style.display = "none"
		el("infchallengesbtn").style.display = "none"
		return
	}

	//Normal Challenges
	var counter = 0
	var totalTime = 0
	for (let c = 2; c <= getTotalNormalChallenges() + 1; c++) {
		var completed = player.challenges.includes("challenge" + c) && player.challengeTimes[c - 2] < 60 * 60 * 24 * 31 * 10
		if (completed) {
			counter++
			totalTime += player.challengeTimes[c - 2]
		}
		setAndMaybeShow("challengetime" + NC_IDS["challenge" + c], completed, () => getNCName("challenge" + c) + ": " + timeDisplayShort(player.challengeTimes[c - 2], false, 3))
	}

	setAndMaybeShow("challengetimesum", counter >= 2, () => "Sum: " + timeDisplayShort(totalTime, false, 3) + ".")
	el("challengetimesbtn").style.display = counter > 0 ? "inline-block" : "none"

	//Infinity Challenges
	var temp=0
	var tempcounter=0
	for (var i=0;i<14;i++) {
		setAndMaybeShow("infchallengetime"+(i+1),player.infchallengeTimes[i]<600*60*24*31,'"Infinity Challenge '+(i+1)+' time record: "+timeDisplayShort(player.infchallengeTimes['+i+'], false, 3)')
		if (player.infchallengeTimes[i]<600*60*24*31) {
			temp+=player.infchallengeTimes[i]
			tempcounter++
		}
	}
	setAndMaybeShow("infchallengetimesum",tempcounter>1,'"The sum of your completed Infinity Challenge time records is " + timeDisplayShort(' + temp + ', false, 3) + "."')
	el("infchallengesbtn").style.display = tempcounter>0 ? "inline-block" : "none"
	updateWorstChallengeBonus();
}

// INFINITY CHALLENGES
function getNextAt(chall) {
	let ret = nextAt[chall]
	if (inNGM(2)) {
		let retMod = nextAt[chall+"_ngmm"]
		if (retMod) ret = retMod
	}
	if (player.tickspeedBoosts != undefined) {
		let retMod = nextAt[chall+"_ngm3"]
		if (retMod) ret = retMod
	}
	if (tmp.ngmX >= 4){
		let retMod = nextAt[chall+"_ngm4"]
		if (retMod) ret = retMod
	}
	if (tmp.ngC) {
		let retMod = nextAt[chall+"_ngC"]
		if (retMod) ret = retMod
	}
	return ret
}

function getGoal(chall) {
	let ret = goals[chall]
	if (inNGM(2)) {
		let retMod = goals[chall+"_ngmm"]
		if (retMod) ret = retMod
	}
	if (player.tickspeedBoosts != undefined) {
		let retMod = goals[chall+"_ngm3"]
		if (retMod) ret = retMod
	}
	if (tmp.ngmX >= 4){
		let retMod = goals[chall+"_ngm4"]
		if (retMod) ret = retMod
	}
	if (tmp.ngC) {
		let retMod = goals[chall+"_ngC"]
		if (retMod) ret = retMod
	}
	return ret
}

function checkICID(name) {
	return IC_LOOKUP[name]
}

function resetIC1Reward() {
	infDimPow = 1
	if (!player.challenges.includes("postc1")) return

	let ics = 0
	for (var i = 0; i < player.challenges.length; i++) {
		var name = player.challenges[i]
		if (name && name.split("postc")[1]) ics++
	}
	infDimPow = Math.pow(inNGM(2) ? 2 : 1.3, ics)
}

var nextAt = {}
var goals = {}
var order = []

function loadICData() {
	nextAt = {
		postc1: E("1e2000"), postc1_ngmm: E("1e3000"), postc1_ngm3: E("1e3760"), postc1_ngm4: E("1e4350"), postc1_ngC: E("1e5555"),
		postc2: E("1e5000"), postc2_ngC: E("1e5860"),
		postc3: E("1e12000"), postc3_ngC: E("1e7175"),
		postc4: E("1e14000"), postc4_ngC: E("1e8475"),
		postc5: E("1e18000"), postc5_ngm3: E("1e21500"), postc5_ngC: E("1e21000"),
		postc6: E("1e20000"), postc6_ngm3: E("1e23000"), postc6_ngC: E("1e21000"),
		postc7: E("1e23000"), postc7_ngm3: E("1e25500"), postc7_ngC: E("1e32000"),
		postc8: E("1e28000"), postc8_ngm3: E("1e39000"), postc8_ngC: E("1e37500"),

		postcngmm_1: E("1e750"), postcngmm_1_ngm3: E("1e1080"),
		postcngmm_2: E("1e1350"),
		postcngmm_3: E("1e2000"), postcngmm_3_ngm3: E("1e2650"),

		postcngm3_1: E("1e1560"), postcngm3_1_ngm4: E("1e1800"),
		postcngm3_2: E("1e2085"),
		postcngm3_3: E("1e8421"),
		postcngm3_4: E("1e17000"),

		postcngc_1: E("1e38000"),
		postcngc_2: E("1e42250"),
	}
	goals = {      
		postc1: E("1e850"), postc1_ngmm: E("1e650"), postc1_ngm3: E("1e375"), postc1_ngm4: E("1e575"),
		postc2: E("1e10500"), postc2_ngm3: E("1e4250"), postc2_ngm4: E("1e4675"), postc2_ngC: E("1e5850"),
		postc3: E("1e5000"), postc3_ngC: E("1e2675"), 
		postc4: E("1e13000"), postc4_ngm3: E("1e4210"), postc4_ngC: E("1e5750"),
		postc5: E("1e11111"), postc5_ngm3: E("7.77e7777"), postc5_ngC: E("1e2400"),
		postc6: E("2e22222"), postc6_ngC: E("2.1e21111"),
		postc7: E("1e10000"), postc7_ngmm: E("1e15000"), postc7_ngm3: E("1e5100"), postc7_ngC: E("1e4300"),
		postc8: E("1e27000"), postc8_ngm3: E("1e35000"), 

		postcngmm_1: E("1e550"), postcngmm_1_ngm3: E("1e650"), postcngmm_1_ngm4: E("1e950"),
		postcngmm_2: E("1e950"), postcngmm_2_ngm3: E("1e1090"), postcngmm_2_ngm4: E("1e1200"),
		postcngmm_3: E("1e1200"), postcngmm_3_ngm3: E("1e1230"), postcngmm_3_ngm4: E("1e1425"),

		postcngm3_1: E("1e550"), postcngm3_1_ngm4: E("1e1210"),
		postcngm3_2: E("1e610"), postcngm3_2_ngm4: E("1e750"),
		postcngm3_3: E("8e888"), postcngm3_4: E("1e1500"),
		postcngm3_4: E("1e12345"),

		postcngc_1: E("1e10525"),					
		postcngc_2: E("1e27225"),
	}
	order = []
}

let IC_LOOKUP = {}
function identifyICs() {
	IC_LOOKUP = {}
	for (var x = 0; x < order.length; x++) IC_LOOKUP[order[x]] = x + 1
}

//Infinity Challenge 3
function getIC3Mult() {
	let base = getIC3Base()
	let exp = getIC3Exp()
	if (exp > 1) return Decimal.pow(base, exp)
	return base
}

function getIC3Base() {
	if (player.currentChallenge == "postcngmm_3") return 1

	let perGalaxy = 0.005
	if (inNGM(4)) perGalaxy = 0.002
	if (!inNGM(2)) return player.galaxies * perGalaxy + 1.05

	if (tmp.cp > 1) {
		if (player.tickspeedBoosts != undefined) perGalaxy *= tmp.cp / 10 + .9
		else perGalaxy *= tmp.cp / 5 + .8
	}
	let g = initialGalaxies()
	perGalaxy *= getGalaxyEff()
	let ret = getGalaxyPower(g) * perGalaxy + 1.05
	if (inNC(6, 2)) ret -= tmp.ngmX >= 3 ? 0.02 : 0.05
	else if (tmp.ngmX == 3) ret -= 0.03
	if (hasPU(23)) ret += puMults[23]()
	if (tmp.be && ret > 1e8) ret = Math.pow(Math.log10(ret) + 2, 8)
	return ret
}

function getIC3Exp() {
	let x = 1
	if (hasAch("r66") && tmp.ngmX >= 4) {
		x *= Decimal.min(5, player.galacticSacrifice.galaxyPoints.div(1e58).max(1).pow(.05)).toNumber()
		if (x > 1.25) x = Math.log10(8 * x) * 1.25
		if (x > 4/3) x = 1 + x/4
	}
	if (inNGM(2)) {
		let g = getGalaxyPower(0, false, true)
		if (g < 7) return x * (1 + g / 5)
		let y = 5
		let z = .5
		if (tmp.ec > 29) {
			if (player.currentEternityChall == "" || player.currentEternityChall == "eterc12") {
				z = .9
				if (tmp.ec > 53) y = 1.4 - ((tmp.ec - 54) / 15)
				else if (tmp.ec > 42) y = 2
				else if (tmp.ec > 37) y = 3.5
			} else z = .6
		}
		x *= 2 + Math.pow(g - 5, z) / y
	}
	if (tmp.ngC) {
		let g = player.galaxies
		x *= Math.log2(g + 1) * 10 + 1
	}
	return x
}

function resetIC3Mult() {
	//IC3 Multiplier
	ic3Power = getInitPostC3Power()
	player.postC3Reward = Decimal.pow(getIC3Mult(), ic3Power)
}
