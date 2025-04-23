//test
var gameLoopIntervalId;
var Marathon = 0;
var Marathon2 = 0;
var auto = false;
var autoS = true;
var shiftDown = false;
var controlDown = false;
var justImported = false;
var saved = 0;
var painTimer = 0;
var keySequence = 0;
var keySequence2 = 0;
var failureCount = 0;
var implosionCheck = 0;
var break_infinity_js = false
var forceHardReset = false
var player
var metaSave = null
var mods = {}
var gameSpeed = 1

function setupFooterHTML() {
	var html = "<table id='footer' style='display: table !important'><tr><td><div style='text-align: center'>" + 
			"<a href='http://mrredshark77.github.io/NG-plus-3CR/' target='_newtab'>NG+3 Classic Reloaded</a> (Take 2) |-| " +
			"NG+3 Respecced: " + 
			"<a href='howto.html' target='_newtab'>How to play</a> | " + 
			"<a href='about.html' target='_newtab'>About</a> | " + 
			"<a href='http://ng-plus-plus-plus.fandom.com' target='_newtab'>Wiki</a> | " + 
			"<a href='http://discord.gg/KsjcgskgTj' target='_newtab'>Discord</a>" +
		"</div></tr></td></table>"

	var footers = document.getElementsByClassName("footer")
	for (var f = 0; f < footers.length; f++) footers[f].innerHTML = html
}

function setupAutobuyerHTMLandData(){
	getAutobuyerReduction = function() {
		return tmp.ngC ? 0.3 : 0.6
	}

	buyAutobuyer = function(id, quick) {
		if ((inNGM(4) && id != 11 ? player.galacticSacrifice.galaxyPoints : player.infinityPoints).lt(player.autobuyers[id].cost)) return false

		if (inNGM(4) && id != 11) player.galacticSacrifice.galaxyPoints = player.galacticSacrifice.galaxyPoints.minus(player.autobuyers[id].cost)
		else player.infinityPoints = player.infinityPoints.minus(player.autobuyers[id].cost)

   		if (player.autobuyers[id].interval == 100) {
			if (id > 8) {
				if (!player.infinityUpgradesRespecced) return
				if (player.autobuyers[id].bulkBought || player.infinityPoints.lt(1e4) || id > 10) return
				player.infinityPoints = player.infinityPoints.sub(1e4)
				player.autobuyers[id].bulkBought = true
			} else {
				if (player.autobuyers[id].bulk >= 1e100) return false
		
				player.autobuyers[id].bulk = Math.min(player.autobuyers[id].bulk * 2, 1e100);
				player.autobuyers[id].cost = Math.ceil(2.4 * player.autobuyers[id].cost);
			}
		} else {
			player.autobuyers[id].interval = Math.max(player.autobuyers[id].interval * getAutobuyerReduction(), 100);
			if (player.autobuyers[id].interval > 120) player.autobuyers[id].cost *= 2; //if your last purchase wont be very strong, dont double the cost
		}

		if (!quick) updateAutobuyers()

		return true
	}

	el("buyerBtn" + 1).onclick = function () { 
		buyAutobuyer(1 - 1);
	}

	el("buyerBtn" + 2).onclick = function () { 
		buyAutobuyer(2 - 1);
	}

	el("buyerBtn" + 3).onclick = function () { 
		buyAutobuyer(3 - 1);
	}

	el("buyerBtn" + 4).onclick = function () { 
		buyAutobuyer(4 - 1);
	}

	el("buyerBtn" + 5).onclick = function () { 
		buyAutobuyer(5 - 1);
	}

	el("buyerBtn" + 6).onclick = function () { 
		buyAutobuyer(6 - 1);
	}

	el("buyerBtn" + 7).onclick = function () { 
		buyAutobuyer(7 - 1);
	}

	el("buyerBtn" + 8).onclick = function () { 
		buyAutobuyer(8 - 1);
	}

	el("buyerBtnTickSpeed").onclick = function () {
		buyAutobuyer(8);
	}

	el("buyerBtnDimBoost").onclick = function () {
		buyAutobuyer(9);
	}

	el("buyerBtnGalaxies").onclick = function () {
		buyAutobuyer(10);
	}

	el("buyerBtnInf").onclick = function () {
		buyAutobuyer(11);
	}

	toggleAutobuyerTarget = function(id) {
		if (!isABBuyUntil10(id)) {
			player.autobuyers[id-1].target = 10 + id
			el("toggleBtn" + id).textContent = "Buys until 10"
		} else {
			player.autobuyers[id-1].target = id
			el("toggleBtn" + id).textContent = "Buys singles"
		}
	}

	for (let abnum = 1; abnum <= 8; abnum ++){
		el("toggleBtn" + abnum).onclick = function () {
			toggleAutobuyerTarget(abnum)
		}
	}

	el("toggleBtnTickSpeed").onclick = function () {
		if (!isABBuyUntil10(9)) {
			player.autobuyers[8].target = 10
			el("toggleBtnTickSpeed").textContent = "Buys max"
		} else {
			player.autobuyers[8].target = 1
			el("toggleBtnTickSpeed").textContent = "Buys singles"
		}
	}
}

function setupInfUpgHTMLandData(){
	let iut = el("preinfupgrades")
	for (let r = 1; r <= 4; r++) {
		let row = iut.insertRow(r - 1)
		for (let c = 1; c <= 4; c++) {
			let col = row.insertCell(c - 1)
			let id = c * 10 + r
			col.innerHTML = "<button id='infi" + id + "' onclick='INF_UPGS.normal.buy(" + id + ")'>" +
				"<span id='infi" + id+ "desc'></span>" +
				"<br>Cost: <span id='infi" + id + "cost'></span> IP" +
			"</button>"
		}
	}

	el("infi14desc").textContent = "Decrease the number of Dimensions needed for Dimension Boosts and Galaxies by 9."
}

function setupParadoxUpgrades(){
	var pu = el("pUpgs")
	for (let r = 1; r <= puSizes.y; r++) {
		let row = pu.insertRow(r - 1)
		for (let c = 1; c <= puSizes.x; c++) {
			var col = row.insertCell(c - 1)
			var id = (r * 10 + c)
			col.innerHTML = "<button id='pu" + id + "' class='infinistorebtn1' onclick='buyPU("+id+","+(r<2)+")'>"+(typeof(puDescs[id])=="function"?"<span id='pud"+id+"'></span>":puDescs[id]||"???")+(puMults[id]?"<br>Currently: <span id='pue"+id+"'></span>":"")+"<br><span id='puc"+id+"'></span></button>"
		}
	}
}

function setupDimensionsHTML() {
	var ndsDiv = el("parent")
	for (let d = 1; d <= 8; d++) {
		var row = ndsDiv.insertRow(d - 1)
		row.id = d + "Row"
		row.style["font-size"] = "15px"
		row.innerHTML = '<td class="rel" id="D' + d + '" align="right" width="32%"> </td>' +
			'<td id="A' + d + '"></td>' +
			'<td align="right" width="10%"><button id="B' + d + '" style="color:black; height: 25px; font-size: 10px; width: 135px" class="storebtn" onclick="buyOneDimension(' + d + ')"></button></td>' +
			'<td align="right" width="10%"><button id="M' + d + '" style="color:black; width:210px; height: 25px; font-size: 10px" class="storebtn" onclick="buyManyDimension(' + d + ')"></button></td>' +
			'<td id="CondenseDiv'+d+'" align="right" width="10%"><button id="Condense' + d + '" style="color:black; width:210px; height: 25px; font-size: 10px" class="storebtn" onclick="ngC.condense.nds.buy(' + d + ')"></button></td>'
	}

	var idsDiv = el("idTable")
	for (let d = 1; d <= 8; d++) {
		var row = idsDiv.insertRow(d - 1)
		row.id = "infRow" + d
		row.style["font-size"] = "16px"
		row.innerHTML = '<td id="infD' + d + '" width="41%"></td>' +
			'<td id="infAmount' + d + '"></td>' +
			'<td><button id="infauto' + d + '" style="width:70px; font-size: 10px; float: right; visibility: hidden" onclick="switchAutoInf(' + d + ')" class="storebtn"></button></td>' +
			'<td align="right" width="10%"><button id="infMax' + d + '" style="color:black; width:195px; height:30px" class="storebtn" align="right" onclick="buyManyInfinityDimension(' + d + ')"></button></td>' +
			'<td id="infCndCont' + d + '" align="right" width="10%"><button id="infCnd' + d + '" style="color:black; width:195px; height:30px" class="storebtn" align="right" onclick="ngC.condense.ids.buy(' + d + ')"></button></td>'
	}

	var tdsDiv = el("tdTable")
	for (let d = 1; d <= 8; d++) {
		var row = tdsDiv.insertRow(d - 1)
		row.id = "timeRow" + d
		row.style["font-size"] = "17px"
		row.innerHTML = '<td id="timeD' + d + '" width="43%"></td>' +
			'<td id="timeAmount' + d + '"></td>' +
			'<td><button id="td' + d + 'auto" style="width:70px; font-size: 10px; float: right; visibility: hidden" onclick="toggleAutoEter(\'td' + d + '\')" class="storebtn"></button></td>' +
			'<td align="right" width="10%"><button id="timeMax' + d + '" style="color:black; width:195px; height:30px" class="storebtn" align="right" onclick="buyTimeDimension(' + d + ')"></button></td>' +
			'<td id="timeCndCont' + d + '" align="right" width="10%"><button id="timeCnd' + d + '" style="color:black; width:195px; height:30px" class="storebtn" align="right" onclick="ngC.condense.tds.buy(' + d + ')"></button></td>'
	}

	var pdsDiv = el("pdTable")
	for (let d = 1; d <= 8; d++) {
		var row = pdsDiv.insertRow(d-1)
		row.id = "pR" + d
		row.style["font-size"] = "16px"
		row.innerHTML = '<td id="pD' + d + '" width="41%"></td>' +
			'<td id="pA' + d + '"></td>' +
			'<td align="right" width="10%"><button id="pB'+d+'" style="color:black; width:195px; height:30px" class="storebtn" align="right" onclick="buyPD('+d+')"></button></td></tr>'
	}
}

function setupBraveMilestones(){
	for (var m = 1; m < 17; m++) el("braveMilestone" + m).textContent=getFullExpansion(tmp.bm[m - 1])+"x quantumed"
}

function setupBosonicExtraction(){
	var ben = el("enchants")
	for (var g2 = 2; g2 <= br.limits[maxBLLvl]; g2++) {
		var row = ben.insertRow(g2 - 2)
		row.id = "bEnRow" + (g2 - 1)
		for (var g1 = 1; g1 < g2; g1++) {
			var col = row.insertCell(g1 - 1)
			var id = (g1 * 10 + g2)
			col.innerHTML = "<button id='bEn" + id + "' class='gluonupgrade unavailablebtn' style='width: 240px; height: 120px; font-size: 10px' onclick='takeEnchantAction("+id+")'>" +
				(bEn.descs[id] || "???") + "<br>" +
				"Currently: <span id='bEnEffect" + id + "'>???</span><br><br>" +
				"<span id='bEnLvl" + id + "'></span> | <span id='bEnOn" + id + "'></span><br>" +
				"Cost: <span id='bEnG1Cost" + id + "'></span> <div class='bRune' type='" + g1 + "'></div>" + 
				" & <span id='bEnG2Cost" + id + "'></span> <div class='bRune' type='" + g2 + "'></div>" +
			"</button><br>"
		}
	}
	var toeDiv = ""
	for (var g = 1; g <= br.limits[maxBLLvl]; g++) toeDiv += ' <button id="typeToExtract' + g + '" class="storebtn" onclick="changeTypeToExtract(' + g + ')" style="width: 25px; font-size: 12px"><div class="bRune" type="' + g + '"></div></button>'
	el("typeToExtract").innerHTML=toeDiv
}

function setupBosonicUpgrades(){
	setupBosonicUpgReqData()
	var buTable=el("bUpgs")
	for (r = 1; r <= bu.limits[maxBLLvl]; r++) {
		var row = buTable.insertRow(r - 1)
		row.id = "bUpgRow" + r
		for (c = 1; c < 6; c++) {
			var col = row.insertCell(c - 1)
			var id = (r * 10 + c)
			col.innerHTML = "<button id='bUpg" + id + "' class='gluonupgrade unavailablebtn' style='font-size:" + (id == 51 || id == 52 ? 8 : 9) + "px' onclick='buyBosonicUpgrade(" + id + ")'>" + (bu.descs[id] || "???") + "<br>" +
				(bu.effects[id] !== undefined ? "Currently: <span id='bUpgEffect" + id + "'>0</span><br>" : "") +
				"Cost: <span id='bUpgCost" + id + "'></span> Bosonic Antimatter<br>" +
				"Requires: <span id='bUpgG1Req" + id + "'></span> <div class='bRune' type='" + bu.reqData[id][2] + "'></div> & <span id='bUpgG2Req" + id + "'></span> <div class='bRune' type='" + bu.reqData[id][4] + "'></div></button>"
		}
	}
}

function setupBosonicRunes(){
	var brTable=el("bRunes")
	for (var g = 1; g <= br.limits[maxBLLvl]; g++) {
		var col = brTable.rows[0].insertCell(g - 1)
		col.id = "bRuneCol" + g
		col.innerHTML = '<div class="bRune" type="' + g + '"></div>: <span id="bRune' + g + '"></span>'
	}
	var glyphs=document.getElementsByClassName("bRune")
	for (var g = 0 ; g < glyphs.length; g++) {
		var glyph = glyphs[g]
		var type = glyph.getAttribute("type")
		if (type > 0 && type <= br.limits[maxBLLvl]) {
			glyph.className = "bRune " + br.names[type]
			glyph.setAttribute("ach-tooltip", br.names[type] + " Bosonic Rune")
		}
	}
}

function setupHTMLAndData() {
	setupFooterHTML()
	setupDimensionsHTML()
	setupBreakInfUpgHTMLandData()
	pH.setupHTML()
	setupParadoxUpgrades()
	setupInfUpgHTMLandData()
	setupAutobuyerHTMLandData()
	setupDilationUpgradeList()
	setupMasteryStudiesHTML()
	pos.setupHTML()
	QCs.setupDiv()
	setupBraveMilestones()
	setupBosonicExtraction()
	setupBosonicUpgrades()
	setupBosonicRunes()
}

function updateNewPlayer(mode, preset) {
	let modsChosen = {}
	if (mode == "reset") {
		modsChosen = {
			ngm: aarMod.ngmR !== undefined ? 2 : aarMod.newGameMinusVersion !== undefined ? 1 : 0,
			ngp: aarMod.ngpX ? aarMod.ngpX - 2 : aarMod.newGamePlusVersion !== undefined ? 1 : 0,
			arrows: aarMod.newGameExpVersion !== undefined,
			ngpp: player.meta == undefined ? false : aarMod.ngp3lV ? 3 : tmp.ngp3 ? 2 : 1,
			ngmm: tmp.ngmX ? tmp.ngmX - 1 : inNGM(2) ? 1 : 0,
			rs: player.infinityUpgradesRespecced != undefined ? 2 : player.boughtDims !== undefined,
			ngud: aarMod.nguspV !== undefined ? 3 : aarMod.ngudpV !== undefined ? 2 : player.exdilation !== undefined ? 1 : 0,
			nguep: aarMod.nguepV !== undefined,
			ngmu: aarMod.newGameMult === 1,
			ngumu: aarMod.ngumuV !== undefined,
			ngex: tmp.exMode,
			aau: aarMod.aau !== undefined,
			ls: aarMod.ls !== undefined,
			ngc: tmp.ngC,
			diff: tmp.dtMode ? 3 : tmp.exMode ? 2 : tmp.bgMode ? 1 : 0
		}
	} else if (mode == "quick") {
		modsChosen = modPresets[preset]
	} else if (mode == "new") {
		modsChosen = mods
	} else if (mode == "meta_started") {
		modsChosen = modPresets.ngp3
	}

	player = {
		money: E(modsChosen.ngmm>2?200:modsChosen.ngp>1?20:10),
		tickSpeedCost: E(1000),
		tickspeed: E(modsChosen.ngp>1?500:1000),
		firstCost: E(10),
		secondCost: E(100),
		thirdCost: E(10000),
		fourthCost: E(1000000),
		fifthCost: E(1e9),
		sixthCost: E(1e13),
		seventhCost: E(1e18),
		eightCost: E(1e24),
		firstAmount: E(0),
		secondAmount: E(0),
		thirdAmount: E(0),
		fourthAmount: E(0),
		firstBought: modsChosen.ngm === 1 ? 5 : 0,
		secondBought: 0,
		thirdBought: 0,
		fourthBought: 0,
		fifthAmount: E(0),
		sixthAmount: E(0),
		seventhAmount: E(0),
		eightAmount: E(0),
		fifthBought: 0,
		sixthBought: 0,
		seventhBought: 0,
		eightBought: 0,
		sacrificed: E(0),
		achievements: [],
		infinityUpgrades: [],
		challenges: [],
		currentChallenge: "",
		infinityPoints: E(0),
		infinitied: modsChosen.ngm === 1 ? 990 : modsChosen.ngp%2>0 ? 1 : 0,
		infinitiedBank: modsChosen.ngm === 1 ? -1000 : 0,
		totalTimePlayed: 0,
		bestInfinityTime: 9999999999,
		thisInfinityTime: 0,
		resets: 0,
		galaxies: modsChosen.ngm === 1 ? -1 : 0,
		totalmoney: E(0),
		achPow: 1,
		newsArray: [],
		interval: null,
		lastUpdate: new Date().getTime(),
		autobuyers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
		costMultipliers: [E(1e3), E(1e4), E(1e5), E(1e6), E(1e8), E(1e10), E(1e12), E(1e15)],
		tickspeedMultiplier: E(10),
		chall2Pow: 1,
		chall3Pow: E(0.01),
		matter: E(0),
		chall11Pow: E(1),
		partInfinityPoint: modsChosen.ngm === 1 ? -1e300 : 0,
		partInfinitied: modsChosen.ngm === 1 ? -1e8 : 0,
		break: false,
		challengeTimes: [600*60*24*31, 600*60*24*31, 600*60*24*31, 600*60*24*31, 600*60*24*31, 600*60*24*31, 600*60*24*31, 600*60*24*31, 600*60*24*31, 600*60*24*31, 600*60*24*31],
		infchallengeTimes: [600*60*24*31, 600*60*24*31, 600*60*24*31, 600*60*24*31, 600*60*24*31, 600*60*24*31, 600*60*24*31, 600*60*24*31],
		lastTenRuns: [[600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0]],
		lastTenEternities: [[600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0]],
		infMult: E(modsChosen.ngm === 1 ? 0.5 : 1),
		infMultCost: E(modsChosen.ngm === 1 ? 30 : 10),
		tickSpeedMultDecrease: 10,
		tickSpeedMultDecreaseCost: 3e6,
		dimensionMultDecrease: modsChosen.ngm === 1 ? 11 : 10,
		dimensionMultDecreaseCost: 1e8,
		overXGalaxies: 10,
		version: 10,
		infDimensionsUnlocked: [],
		infinityPower: E(1),
		spreadingCancer: modsChosen.ngm === 1 ? -9990 : 0,
		postChallUnlocked: 0,
		postC4Tier: 0,
		postC3Reward: E(1),
		postC8Mult: E(1),
		eternityPoints: E(0),
		eternities: modsChosen.ngm === 1 ? -20 : 0,
		thisEternity: 0,
		bestEternity: 9999999999,
		eternityUpgrades: [],
		epmult: E(1),
		epmultCost: E(500),
		infinityDimension1 : {
			cost: E(1e8),
			amount: E(0),
			bought: 0,
			power: E(1),
			baseAmount: 0
		},
		infinityDimension2 : {
			cost: E(1e9),
			amount: E(0),
			bought: 0,
			power: E(1),
			baseAmount: 0
		},
		infinityDimension3 : {
			cost: E(1e10),
			amount: E(0),
			bought: 0,
			power: E(1),
			baseAmount: 0
		},
		infinityDimension4 : {
			cost: E(1e20),
			amount: E(0),
			bought: 0,
			power: E(modsChosen.ngm === 1 ? 0.0000125 : 1),
			baseAmount: 0
		},
		infinityDimension5 : {
			cost: E(1e140),
			amount: E(0),
			bought: 0,
			power: E(modsChosen.ngm === 1 ? 0.01 : 1),
			baseAmount: 0
		},
		infinityDimension6 : {
			cost: E(1e200),
			amount: E(0),
			bought: 0,
			power: E(modsChosen.ngm === 1 ? 0.015 : 1),
			baseAmount: 0
		},
		infinityDimension7 : {
			cost: E(1e250),
			amount: E(0),
			bought: 0,
			power: E(modsChosen.ngm === 1 ? 0.01 : 1),
			baseAmount: 0
		},
		infinityDimension8 : {
			cost: E(1e280),
			amount: E(0),
			bought: 0,
			power: E(modsChosen.ngm === 1 ? 0.01 : 1),
			baseAmount: 0
		},
		infDimBuyers: [false, false, false, false, false, false, false, false],
		timeShards: E(0),
		tickThreshold: E(1),
		totalTickGained: 0,
		timeDimension1: {
			cost: E(1),
			amount: E(0),
			power: E(modsChosen.ngm === 1 ? 0.01 : 1),
			bought: 0
		},
		timeDimension2: {
			cost: E(5),
			amount: E(0),
			power: E(modsChosen.ngm === 1 ? 0.03 : 1),
			bought: 0
		},
		timeDimension3: {
			cost: E(100),
			amount: E(0),
			power: E(modsChosen.ngm === 1 ? 0.025 : 1),
			bought: 0
		},
		timeDimension4: {
			cost: E(1000),
			amount: E(0),
			power: E(modsChosen.ngm === 1 ? 0.02 : 1),
			bought: 0
		},
		timeDimension5: {
			cost: E("1e2350"),
			amount: E(0),
			power: E(modsChosen.ngm === 1 ? 1e-5 : 1),
			bought: 0
		},
		timeDimension6: {
			cost: E("1e2650"),
			amount: E(0),
			power: E(modsChosen.ngm === 1 ? 5e-6 : 1),
			bought: 0
		},
		timeDimension7: {
			cost: E("1e3000"),
			amount: E(0),
			power: E(modsChosen.ngm === 1 ? 3e-6 : 1),
			bought: 0
		},
		timeDimension8: {
			cost: E("1e3350"),
			amount: E(0),
			power: E(modsChosen.ngm === 1 ? 2e-6 : 1),
			bought: 0
		},
		offlineProd: 0,
		offlineProdCost: modsChosen.ngm === 1 ? 5e11 : 1e7,
		challengeTarget: 0,
		autoSacrifice: 1,
		replicanti: {
			amount: E(0),
			unl: false,
			chance: 0.01,
			chanceCost: E(modsChosen.ngmm?1e90:1e150),
			interval: modsChosen.ngm === 1 ? 5000 : 1000,
			intervalCost: E(modsChosen.ngmm?1e80:modsChosen.rs==1?1e150:1e140),
			gal: 0,
			galaxies: 0,
			galCost: E(modsChosen.ngmm?1e110:1e170),
			auto: [false, false, false]
		},
		timestudy: {
			theorem: modsChosen.ngm === 1 ? -6 : 0,
			amcost: E("1e20000"),
			ipcost: E(modsChosen.ngm === 1 ? 1e-13 : 1),
			epcost: E(1),
			studies: [],
		},
		eternityChalls: modsChosen.ngm === 1 ? {eterc1: -6} : {},
		eternityChallGoal: E(Number.MAX_VALUE),
		currentEternityChall: "",
		eternityChallUnlocked: 0,
		etercreq: 0,
		autoIP: E(0),
		autoTime: 1e300, 
		infMultBuyer: false,
		autoCrunchMode: "amount",
		respec: false,
		eternityBuyer: {
			limit: E(0),
			isOn: false
		},
		eterc8ids: 50,
		eterc8repl: 40,
		dimlife: true,
		dead: true,
		dilation: {
			studies: [],
			active: false,
			tachyonParticles: E(0),
			dilatedTime: E(0),
			totalTachyonParticles: E(modsChosen.ngm === 1 ? 2000 :0),
			nextThreshold: E(1000),
			freeGalaxies: 0,
			upgrades: [],
			rebuyables: {
				1: 0,
				2: modsChosen.ngm === 1 ? 1 : 0,
				3: 0,
			}
		},
		why: 0,
		shameLevel: 0,
		options: {
			newsHidden: true,
			notation: "Scientific",
			scientific: false,
			challConf: metaSave.advOpts,
			sacrificeConfirmation: metaSave.advOpts,
			retryChallenge: false,
			bulkOn: true,
			cloud: true,
			hotkeys: true,
			theme: undefined,
			secretThemeKey: 0,
			eternityconfirm: !modsChosen.ngp && !metaSave.advOpts,
			commas: "Commas",
			updateRate: 50,
			hideProductionTab: !metaSave.advOpts,
			chart: {
				updateRate: 1000,
				duration: 10,
				warning: 0,
			},
			animations: {
				floatingText: metaSave.advOpts,
				bigCrunch: metaSave.advOpts,
				eternity: metaSave.advOpts,
				tachyonParticles: metaSave.advOpts,
			}
		},
		aarexModifications: {
			dilationConf: false,
			offlineProgress: true,
			autoSave: true,
			progressBar: metaSave.advOpts,
			logRateChange: metaSave.advOpts ? 0 : 2,
			hideProductionTab: !metaSave.advOpts,
			eternityChallRecords: {},
			popUpId: 0,
			tabsSave: {on: !metaSave.advOpts},
			breakInfinity: false,

			hideStats: !metaSave.advOpts,
			hideRepresentation: !metaSave.advOpts,
			hideCompletedAchs: !metaSave.advOpts,
			hideSecretAchs: !metaSave.advOpts,
			autoApply: !metaSave.advOpts,
			noFooter: !metaSave.advOpts,
			showAuto: !metaSave.advOpts,
		}
	}
	aarMod = player.aarexModifications

	if (mode) {
		// NG+x
		if (modsChosen.ngp) doNGPlusOneNewPlayer()
		if (modsChosen.ngpp) doNGPlusTwoNewPlayer()
		if (modsChosen.ngpp === 2) doNGPlusThreeNewPlayer()

		// NG-x
		if (modsChosen.ngm === 1) aarMod.newGameMinusVersion = 2.2
		if (modsChosen.ngm === 2) ngmR.setup()
		if (modsChosen.ngmm) {
			tmp.ngmX = modsChosen.ngmm + 1
			aarMod.ngmX = tmp.ngmX
			doNGMinusTwoNewPlayer()

			if (tmp.ngmX >= 3) doNGMinusThreeNewPlayer()
			if (tmp.ngmX >= 5) doNGMinusFivePlayer()
			if (tmp.ngmX >= 4) doNGMinusFourPlayer()
		}

		// NG Update
		if (modsChosen.ngud) doNGUDNewPlayer()
		if (modsChosen.ngud == 2) aarMod.ngudpV = 1.12
		if (modsChosen.ngud == 3) doNGUDSemiprimePlayer()

		// NG Multiplied
		if (modsChosen.ngmu) doNGMultipliedPlayer()
		if (modsChosen.ngumu) aarMod.ngumuV = 1.03

		// NG Exponential
		if (modsChosen.arrows) doNGEXPNewPlayer()
		if (modsChosen.nguep) aarMod.nguepV = 1.03

		// Difficulties
		if (modsChosen.diff === 1) aarMod.ez = 1
		if (modsChosen.diff === 2) aarMod.ngexV = 0.1
		if (modsChosen.diff === 3) aarMod.dtMode = true

		// Respecced
		if (modsChosen.rs == 1) doInfinityRespeccedNewPlayer()
		if (modsChosen.rs == 2) doEternityRespeccedNewPlayer()

		// Alternate
		if (modsChosen.ngc) ngC.setup()

		// Others
		if (modsChosen.aau) {
			aarMod.aau = 1
			aarMod.hideAchs = true
			dev.giveAllAchievements(true)
		}
		if (modsChosen.ls) aarMod.ls = {}
	}

	player.infDimensionsUnlocked = resetInfDimUnlocked()
}

function doNGMinusNewPlayer(){
	player.achievements.push("r22")
	player.achievements.push("r85")
	aarMod.newGameMinusVersion = 2.2
}

function doNGPlusOneNewPlayer(){
	for (i = 1; i <= 13; i++) { // get all achievements up to and including row 13
		for (j = 1; j <= 8; j++) {
			player.achievements.push("r" + i + j)
		}
	}

	player.money = E(2e25)
	player.resets = 4
	player.galaxies = 1
	player.infinitiedBank = 5e9
	player.infinityUpgrades = ["timeMult", "dimMult", "timeMult2", "unspentBonus", "27Mult", "18Mult", "36Mult", "resetMult", "passiveGen", "45Mult", "resetBoost", "galaxyBoost", "skipReset1", "skipReset2", "skipReset3", "skipResetGalaxy"]
	player.infMult = 2048
	player.dimensionMultDecrease = 2
	player.tickSpeedMultDecrease = 1.65
	player.eternities = 1012680
	player.challenges = challengesCompletedOnEternity()
	player.postChallUnlocked = order.length
	player.replicanti.unl = true
	player.replicanti.amount = E(1)
	for (ec = 1; ec <= 12; ec++) player.eternityChalls['eterc' + ec] = 5
	player.eternityChalls.eterc1 = 1
	player.eternityChalls.eterc4 = 1
	player.eternityChalls.eterc10 = 1
	player.dilation.studies = [1]
	player.dilation.rebuyables[3] = 2
	player.break = true
	aarMod.newGamePlusVersion = 3.01
}

function doNGPlusTwoNewPlayer(){
	aarMod.newGamePlusPlusVersion = 2.90142
	player.autoEterMode = "amount"
	player.dilation.rebuyables[4] = 0
	player.meta = {resets: 0, antimatter: 10, bestAntimatter: 10}
	for (dim = 1; dim <= 8; dim++) player.meta[dim] = {amount: 0, bought: 0, cost: initCost[dim]}
	player.autoEterOptions = {epmult:false}
	for (dim = 1; dim <= 8; dim++) player.autoEterOptions["td" + dim] = false
	player.galaxyMaxBulk = false
	player.quantum = {
		times: 0,
		time: 0,
		best: 9999999999,
		last10: [[600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0]],
		quarks: 0,
		producedGluons: 0,
		realGluons: 0,
		bosons: {
			'w+': 0,
			'w-': 0,
			'z0': 0
		},
		neutronstar: {
			quarks: 0,
			metaAntimatter: 0,
			dilatedTime: 0
		},
		rebuyables: {
			1: 0,
			2: 0
		},
		upgrades: []
	}
	aarMod.quantumConf = true
	qu_save = player.quantum
}

function doNGMinusTwoNewPlayer(){
	aarMod.newGameMinusMinusVersion = 2.41
	player.galacticSacrifice = {}
	player.galacticSacrifice = resetGalacticSacrifice()
	player.totalBoughtDims = {}
	player.tickBoughtThisInf = resetTickBoughtThisInf()
	player.challengeTimes.push(600*60*24*31)
	player.challengeTimes.push(600*60*24*31)
	player.autobuyers[12] = 13
	player.extraDimPowerIncrease = 0
	player.dimPowerIncreaseCost = player.tickspeedBoosts == undefined ? 1e3 : 3e5
	player.infchallengeTimes.push(600*60*24*31)
	player.infchallengeTimes.push(600*60*24*31)
	player.options.gSacrificeConfirmation = true
}

function getBrandNewBigRipData(){
	return {
		active: false,
		conf: true,
		times: 0,
		bestThisRun: 0,
		totalAntimatter: 0,
		savedAutobuyersNoBR: {},
		savedAutobuyersBR: {},
		spaceShards: 0,
		upgrades: []
	}
}

function getBrandNewBreakEternityData(){
	return {
		unlocked: false,
		break: false,
		eternalMatter: 0,
		upgrades: [],
		epMultPower: 0
	}
}

function getBrandNewNeutrinoData(){
	return {
		electron: 0,
		mu: 0,
		tau: 0,
		generationGain: 1,
		boosts: 0,
		multPower: 1,
		upgrades: []
	}
}

function getBrandNewPhotonsData(){
	return {
		unl: false,
		amount: 0,
		ghostlyRays: 0,
		darkMatter: 0,
		lights: [0,0,0,0,0,0,0,0],
		maxRed: 0,
		enpowerments: 0
	}
}

function getBrandNewBosonicLabData() {
	let x = {
		watt: 0,
		speed: 1,
		ticks: 0,
		am: 0,
		typeToExtract: 1,
		extracting: false,
		extractProgress: 0,
		autoExtract: 0,
		glyphs: [],
		enchants: {},
		usedEnchants: [],
		upgrades: [],
		battery: 0,
		odSpeed: 1
	}
	tmp.bl = x
	return x
}

function getBrandNewWZBosonsData() {
	return {
		unl: false,
		dP: 0,
		dPUse: 0,
		wQkUp: true,
		wQkProgress: 0,
		zNeGen: 1,
		zNeProgress: 0,
		zNeReq: 1,
		wpb: 0,
		wnb: 0,
		zb: 0
	}
}

function getBrandNewGhostifyData() {
	player.ghostify = {}
	return {
		reached: false,
		times: 0,
		time: 0,
		best: 9999999999,
		last10: [[600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0], [600*60*24*31, 0]],
		milestones: 0,
		disabledRewards: {},
		ghostParticles: 0,
		multPower: 1,
		neutrinos: getBrandNewNeutrinoData(),
		automatorGhosts: setupAutomaticGhostsData(),
		ghostlyPhotons: getBrandNewPhotonsData(),
		bl: getBrandNewBosonicLabData(),
		wzb: getBrandNewWZBosonsData()
	}
}

function doNGPlusThreeNewPlayer(){
	aarMod.newGame3PlusVersion = 2.21 //Keep that line forever due to NG+3.1 / NG+3L compatibility
	el("quantumison").checked = false
	player.respecMastery = false
	player.dbPower = 1
	player.dilation.times = 0
	player.masterystudies = []
	qu_save.reached = false
	player.options.animations.quarks = true
	player.meta.bestOverQuantums = 0
	qu_save.usedQuarks = {r: 0, g: 0, b: 0}
	qu_save.colorPowers = {r: 0, g: 0, b: 0}
	qu_save.assignAllRatios = {r: 1, g: 1, b: 1}
	qu_save.gluons = {rg: 0, gb: 0, br: 0}
	player.eternityBuyer.dilationMode = false
	player.eternityBuyer.statBeforeDilation = 0
	player.eternityBuyer.dilationPerAmount = 10
	player.eternityBuyer.dilMode = "amount"
	player.eternityBuyer.tpUpgraded = false
	player.eternityBuyer.slowStop = false
	player.eternityBuyer.slowStopped = false
	player.eternityBuyer.ifAD = false
	player.eternityBuyer.presets = {on: false, autoDil: false, selected: -1, selectNext: 0, left: 1, order: []}
	qu_save.autobuyer = {enabled: false, limit: 1, mode: "amount", peakTime: 0}
	qu_save.disabledRewards = {}
	qu_save.metaAutobuyerWait = 0
	qu_save.metaAutobuyerSlowWait = 0
	qu_save.multPower = {rg : 0, gb : 0, br : 0, total : 0}
	player.eternitiesBank = 0
	player.dilation.bestTP = 0
	player.old = true
	qu_save.autoOptions = {}
	qu_save.qc = QCs.setup()
	player.dontWant = false
	qu_save.notrelative = false
	qu_save.wasted = false
	qu_save.bigRip = getBrandNewBigRipData() 
	qu_save.breakEternity = getBrandNewBreakEternityData()
	player.dilation.bestTPOverGhostifies = 0
	player.meta.bestOverGhostifies = 0
	player.ghostify = getBrandNewGhostifyData()
	for (var g = 1; g < br.limits[maxBLLvl]; g++) player.ghostify.bl.glyphs.push(0)
	player.options.animations.ghostify = true
	aarMod.ghostifyConf = true
	tmp.ngp3 = true
}

function doEternityRespeccedNewPlayer(){
	aarMod.ersVersion = 1.02
	player.boughtDims = []
	player.replicanti.limit = Number.MAX_VALUE
	player.replicanti.newLimit = Number.MAX_VALUE
	player.timestudy.ers_studies = [null, 0, 0, 0, 0, 0, 0]
	player.timestudy.studyGroupsUnlocked = 0
}

function doNGMinusThreeNewPlayer(){
	aarMod.newGame3MinusVersion = 3.202
	player.tickspeedBoosts = 0
	player.autobuyers[13] = 14
	player.challengeTimes.push(600*60*24*31)
	player.infchallengeTimes.push(600*60*24*31)
	player.infchallengeTimes.push(600*60*24*31)
	player.infchallengeTimes.push(600*60*24*31)
	player.infchallengeTimes.push(600*60*24*31)
	player.overXGalaxiesTickspeedBoost=10
	player.replicanti.chanceCost = Decimal.pow(10, 150)
	player.replicanti.intervalCost = Decimal.pow(10, 140)
	player.replicanti.galCost = Decimal.pow(10, 170)
}

function doNGEXPNewPlayer(){
	aarMod.newGameExpVersion = 1.11
	for (u=1;u<5;u++) player.infinityUpgrades.push("skipReset" + (u > 3 ? "Galaxy" : u))
	player.resets=4
}

function doNGUDNewPlayer(){
	aarMod.newGameUpdateVersion = 1.1
	resetNGUdData()
	player.options.animations.blackHole = true 
	player.options.exdilationconfirm = true
}

function doInfinityRespeccedNewPlayer(){
	aarMod.irsVersion = 1.1
	player.infinityUpgradesRespecced = {1: 0, 3: 0, 4: 0, 5: 0, 6: 0}
	player.singularity = {
		unlocked: false,
		upgraded: 0,
		sacrificed: 0,
		singularityPower: 0,
		darkMatter: 0
	}
	player.dimtechs = {
		unlocked: false,
		discounts: 0,
		tickUpgrades: 0,
		respec: false
	}
	for (dim = 1; dim <= 8; dim++) player.dimtechs["dim" + dim + "Upgrades"] = 0
	player.setsUnlocked = 0
	player.infMultCost = 1
}

function doNGUDSemiprimePlayer(){
	for (var d = 5; d < 9; d++) player["blackholeDimension" + d] = {
		cost: blackholeDimStartCosts[d],
		amount: 0,
		power: 1,
		bought: 0
	}
	aarMod.nguspV = 1
}

function doNGMinusFourPlayer(){
	aarMod.newGame4MinusVersion = 2.111
	player.tdBoosts = 0
	player.challengeTimes.push(600 * 60 * 24 * 31)
	player.autobuyers.push(15)
	resetTDsOnNGM4()
	reduceDimCosts()
}

function doNGMinusFivePlayer(){
	aarMod.ngm5V = 0.52
	updateGalstones()
	resetPSac()
	resetIDsOnNGM5()
}

function doNGMultipliedPlayer(){
	aarMod.newGameMult = 1
	player.infMult = 2048
	player.eternities = 1012680
	player.replicanti.unl = true
	player.replicanti.amount = E(1)
}

if (!String.prototype.includes) {
	String.prototype.includes = function(search, start) {
		'use strict';
		if (typeof start !== 'number') {
			start = 0;
		}
		if (start + search.length > this.length) {
			return false;
		} else {
			return this.indexOf(search, start) !== -1;
		}
	};
  }


if (!Array.prototype.includes) {
	Object.defineProperty(Array.prototype, 'includes', {
		value: function(searchElement, fromIndex) {

        // 1. Let O be ? ToObject(this value).
        if (this == null) {
          throw new TypeError('"this" is null or not defined');
        }

        var o = Object(this);

        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = o.length >>> 0;

        // 3. If len is 0, return false.
        if (len === 0) {
          return false;
        }

        // 4. Let n be ? ToInteger(fromIndex).
        //    (If fromIndex is undefined, this step produces the value 0.)
        var n = fromIndex | 0;

        // 5. If n ≥ 0, then
        //  a. Let k be n.
        // 6. Else n < 0,
        //  a. Let k be len + n.
        //  b. If k < 0, let k be 0.
        var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

        function sameValueZero(x, y) {
          return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
        }

        // 7. Repeat, while k < len
        while (k < len) {
          // a. Let elementK be the result of ? Get(O, ! ToString(k)).
          // b. If SameValueZero(searchElement, elementK) is true, return true.
          // c. Increase k by 1.
          if (sameValueZero(o[k], searchElement)) {
            return true;
          }
          k++;
        }

        // 8. Return false
        return false;
      }
    });
  }

    if (!Math.log10) {
        Math.log10 = Math.log10 || function(x) {
            return Math.log(x) * Math.LOG10E;
        };
    }

    if (!Math.log2) {
        Math.log2 = Math.log2 || function(x) {
            return Math.log(x) * Math.LOG2E;
        };
    }

    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = function (callback, thisArg) {
            thisArg = thisArg || window;
            for (var i = 0; i < this.length; i++) {
                callback.call(thisArg, this[i], i, this);
            }
        };
    }

    if (!Array.prototype.find) {
        Object.defineProperty(Array.prototype, 'find', {
          value: function(predicate) {
           // 1. Let O be ? ToObject(this value).
            if (this == null) {
              throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
            if (typeof predicate !== 'function') {
              throw new TypeError('predicate must be a function');
            }

            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
            var thisArg = arguments[1];

            // 5. Let k be 0.
            var k = 0;

            // 6. Repeat, while k < len
            while (k < len) {
              // a. Let Pk be ! ToString(k).
              // b. Let kValue be ? Get(O, Pk).
              // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
              // d. If testResult is true, return kValue.
              var kValue = o[k];
              if (predicate.call(thisArg, kValue, k, o)) {
                return kValue;
              }
              // e. Increase k by 1.
              k++;
            }

            // 7. Return undefined.
            return undefined;
          }
        });
      }


Array.max = function( array ){
	return Math.max.apply( Math, array );
};

Array.min = function( array ){
	return Math.min.apply( Math, array );
};

Object.invert = function(obj) {
	var result = {};
	var keys = Object.keys(obj);
	for (var i = 0, length = keys.length; i < length; i++) {
		result[obj[keys[i]]] = keys[i];
	}
	return result;
};

function sortNumber(a,b) {
	return a - b;
}

function toString(x) {
	if (typeof(x) == "number") x = x.toString()
	return x
}

function wordizeList(list, caseFirst, prefix, useAnd = true) {
	let length = list.length
	if (caseFirst && length > 0) {
		let split0 = [list[0][0], list[0].slice(1)]
		list[0] = split0[0].toUpperCase()
		if (split0[1]) list[0] += split0[1]
	}
	let ret = ""
	for (var i=0; i < length; i++) {
		if (i > 0 && length >= 2) {
			ret += prefix || ", "
			if (useAnd && i == length - 1) ret += "and "
		} else if (useAnd && i > 0) ret += " and "
		ret += list[i]
	}
	return ret
}

function factorizeDescs(list, descs) {
	let length = list.length
	if (length < 2) return ""

	let ret = ""
	for (var i = 0; i < length; i++) {
		if (i > 0) ret += " * "
		ret += shorten(list[i])
		if (descs[i] != "") ret += " (" + descs[i] + ")"
	}
	return ret + " = "
}

//Theme stuff
function setTheme(name) {
	document.querySelectorAll("link").forEach( function(e) {
		if (e.href.includes("theme")) e.remove();
	});
	
	player.options.theme=name
	if(name !== undefined && name.length < 3) giveAchievement("Shhh... It's a secret")
	var themeName=player.options.secretThemeKey
	if(name === undefined) {
		themeName="Normal"
	} else if(name === "S1") {
		Chart.defaults.global.defaultFontColor = 'black';
		normalDimChart.data.datasets[0].borderColor = '#000'
	} else if(name === "S2") {
		Chart.defaults.global.defaultFontColor = 'black';
		normalDimChart.data.datasets[0].borderColor = '#000'
	} else if(name === "S3") {
		Chart.defaults.global.defaultFontColor = 'black';
		normalDimChart.data.datasets[0].borderColor = '#000'
	} else if(name === "S4") {
		Chart.defaults.global.defaultFontColor = 'black';
		normalDimChart.data.datasets[0].borderColor = '#000'
	} else if(name === "S5") {
		Chart.defaults.global.defaultFontColor = 'black';
		normalDimChart.data.datasets[0].borderColor = '#000'
	} else if (name !== "S6") {
		themeName=name;
	}
	if (theme=="Dark"||theme=="Dark Metro"||name === "S6") {
		Chart.defaults.global.defaultFontColor = '#888';
		normalDimChart.data.datasets[0].borderColor = '#888'
	} else {
		Chart.defaults.global.defaultFontColor = 'black';
		normalDimChart.data.datasets[0].borderColor = '#000'
		}
	el("theme").innerHTML="<p style='font-size:15px'>Themes</p>Current theme: " + themeName;
	el("chosenTheme").textContent="Current theme: " + themeName;
	
	if (name === undefined) return;
	name = name.replace("'", "")
	
	var head = document.head;
	var link = document.createElement('link');
	
	link.type = 'text/css';
	link.rel = 'stylesheet';
	link.href = "stylesheets/theme-" + name + ".css";
	
	head.appendChild(link);
}

function doWeakerPowerReductionSoftcapNumber(num,start,exp){
	if (num < start || num < 1) return num
	return start*(( (num/start)**exp -1)/exp+1)
}

function doWeakerPowerReductionSoftcapDecimal(num,start,exp){
	if (num.lt(start) || num.lt(1)) return num
	return start.times( num.div(start).pow(exp).minus(1).div(exp).plus(1) )
}

function doStrongerPowerReductionSoftcapNumber(num,start,exp){
	if (num < start || num < 1) return num
	return start*((num/start)**exp)
}

function doStrongerPowerReductionSoftcapDecimal(num,start,exp){
	if (num.lt(start) || num.lt(1)) return num
	return start.times(num.div(start).pow(exp))
}

function showTab(tabName, init) {
	if (tabName == 'quantumtab' && !tmp.ngp3) {
		alert("Because Quantum was never fully developed due to the abandonment of development, you cannot access the Quantum tab in NG++. This is the definitive endgame.")
		return
	}
	//iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
	var tabs = document.getElementsByClassName("tab");
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
	if (oldTab !== tabName) {
		aarMod.tabsSave.tabMain = tabName
		setProgressBar()

		if ((el("timestudies").style.display != "none" || el("ers_timestudies").style.display != "none" || el("masterystudies").style.display != "none") && tabName=="eternitystore") el("TTbuttons").style.display = "block";
		else el("TTbuttons").style.display = "none"
		if (tabName == "eternitystore") {
			if (el('timestudies') !== "none" || el('masterystudies') !== "none" || el('dilation') !== "none" || el("blackhole") !== "none") resizeCanvas()
			if (el("dilation") !== "none") requestAnimationFrame(drawAnimations)
			if (el("blackhole") !== "none") requestAnimationFrame(drawBlackhole)
		}
		if (tabName == "quantumtab") {
			if (el('uquarks') !== "none") resizeCanvas()
			if (el("uquarks") !== "none") requestAnimationFrame(drawQuarkAnimation)
		}
	}
	if (!init) closeToolTip();
}


function updateMoney() {
	el("coinAmount").textContent = shortenMoney(player.money)

	var element2 = el("matter");
	if (player.currentChallenge == "postc6") element2.textContent = "There is " + formatValue(player.options.notation, player.matter, 2, 1) + " " + "matter."; //TODO
	else if (inNC(12) || player.currentChallenge == "postc1") element2.innerHTML = "There is " + formatValue(player.options.notation, player.matter, 2, 1) + " matter."

	var element3 = el("chall13Mult");
	if (isADSCRunning()) {
		var mult = getProductBoughtMult()
		element3.innerHTML = formatValue(player.options.notation, productAllTotalBought(), 2, 1) + 'x multiplier on all Dimensions (product of '+(inNGM(3)&&(inNC(13)||player.currentChallenge=="postc1")?"1+log10(amount)":"bought")+(mult==1?"":"*"+shorten(mult))+').'
	}
	if (inNC(14) && inNGM(4)) el("c14Resets").textContent = "You have "+getFullExpansion(10-getTotalResets())+" resets left."
	el("ec12Mult").textContent = tmp.inEC12 ? "Time speed: 1 / " + shorten(tmp.ec12Mult) + "x" : ""
	el("qc3Mult").textContent = QCs.in(3) ? "Antimatter exponent: " + QCs.data[3].amExp().toFixed(2) : ""
	el("qc6Mult").textContent = QCs.in(6) ? "There are " + shorten(QCs_save.qc6 + 30) + " Nullons, which speed up Replicate Slowdown by " + shorten(QCs_tmp.qc6) + "x." : ""
	if (QCs.in(4)) el("qc4_boost").textContent = "Bonus: Strengthen all galaxies by " + formatPercentage(QCs_tmp.qc4.boost - 1) + "%"
}

function updateCoinPerSec() {
	var element = el("coinsPerSec");
	var ret = getDimensionProductionPerSecond(1)
	if (tmp.inEC12) ret = ret.div(tmp.ec12Mult)
	element.innerHTML = ret.gt(0) ? 'You are getting ' + shortenND(ret) + ' antimatter per second.' : "<br>"
}

var clickedAntimatter
function onAntimatterClick() {
	clickedAntimatter++
	if (clickedAntimatter >= 10) giveAchievement("This is NOT a clicker game!")
}

function getEternitied() {
	return player.eternities
}

function sacrificeConf() {
	el("confirmation").checked = player.options.sacrificeConfirmation
	player.options.sacrificeConfirmation = !player.options.sacrificeConfirmation
	el("sacConfirmBtn").textContent = "Sacrifice confirmation: O" + (player.options.sacrificeConfirmation ? "N" : "FF")
}

//DISPLAY FUNCTIONS
function hideDimensions() {
	for (var d = 2; d <= 8; d++) if (!canBuyDimension(d)) el(d + "Row").style.display = "none"
}

function updatePerformanceTicks() {
	if (aarMod.performanceTicks) el("updaterateslider").min=1
	else {
		slider.min = 5
		if (player.options.updateRate < 5) {
			clearInterval(gameLoopIntervalId)
			player.options.updateRate = 5
			sliderText.textContent = "Update rate: " + player.options.updateRate + "ms"
			startInterval()
		}
	}
	el("performanceTicks").textContent = "Optimization: " + ["OFF", "LOW", "MEDIUM", "HIGH"][(aarMod.performanceTicks || 0) + 0]
}

function updateCosts() {
	var costPart = pH.did("quantum") ? '' : 'Cost: '
	if (el("dimensions").style.display == "block" && el("antimatterdimensions").style.display == "block") {
		var until10CostPart = pH.did("quantum") ? '' : 'Until 10, Cost: '
		for (var i=1; i<9; i++) {
			var cost = player[TIER_NAMES[i] + "Cost"]
			var resource = getOrSubResource(i)
			el('B'+i).style.display = pH.did("quantum") ? "none" : ""
			el('B'+i).className = cost.lte(resource) ? 'storebtn' : 'unavailablebtn'
			el('B'+i).textContent = costPart + shortenPreInfCosts(cost)
			el('M'+i).className = cost.times(10 - dimBought(i)).lte(resource) ? 'storebtn' : 'unavailablebtn'
			el('M'+i).textContent = until10CostPart + shortenPreInfCosts(cost.times(10 - dimBought(i)));
			if (tmp.ngC) ngC.condense.nds.update(i)
		}
	}
	el("tickSpeed").textContent = costPart + shortenPreInfCosts(player.tickSpeedCost);
}

function floatText(id, text, leftOffset = 150) {
	if (!player.options.animations.floatingText) return
	var el_ = $("#"+id)
	el_.append("<div class='floatingText' style='left: "+leftOffset+"px'>"+text+"</div>")
	setTimeout(function() {
		el_.children()[0].remove()
	}, 1000)
}

function glowText(id) {
	var text = el(id);
	text.style.setProperty("-webkit-animation", "glow 1s");
	text.style.setProperty("animation", "glow 1s");
}

el("news").onclick = function () {
	if (el("news").textContent === "Click this to unlock a secret achievement.") giveAchievement("Real news")
	if (el("news").textContent === "If you are a ghost, try to click me!" && pH.did("ghostify") && (player.options.secrets === undefined || player.options.secrets.ghostlyNews === undefined)) {
		if (player.options.secrets === undefined) {
			player.options.secrets = {}
			el("secretoptionsbtn").style.display = ""
		}
		player.options.secrets.ghostlyNews = false
		el("ghostlynewsbtn").style.display = ""
		$.notify("You unlocked the ghostly news ticker option!", "success")
		giveAchievement("News for other species")
	}
	if (el("news").textContent === "Don't click this news") {
		alert("I told you so.")
		clearInterval(gameLoopIntervalId)
		simulateTime(0, false, "lair")
		player.lastUpdate = new Date().getTime()
		startInterval()
		giveAchievement("Lie the news")
	}
};

el("game").onclick = function () {
	if (tmp.blankedOut) giveAchievement("Blanked out")
}

el("secretstudy").onclick = function () {
	el("secretstudy").style.opacity = "1";
	el("secretstudy").style.cursor = "default";
	giveAchievement("Go study in real life instead");
	setTimeout(drawStudyTree, 2000);
};

el("The first one's always free").onclick = function () {
	giveAchievement("The first one's always free")
}

function setupBreakInfUpgHTMLandData() {
	el("postinfi11").onclick = function() {
		buyInfinityUpgrade("totalMult", 1e4);
	}

	el("postinfi21").onclick = function() {
		buyInfinityUpgrade("currentMult", 5e4);
	}

	el("postinfi31").onclick = function() {
		if (player.infinityPoints.gte(player.tickSpeedMultDecreaseCost) && player.tickSpeedMultDecrease > 2) {
			player.infinityPoints = player.infinityPoints.minus(player.tickSpeedMultDecreaseCost)
			player.tickSpeedMultDecreaseCost *= 5
			player.tickSpeedMultDecrease -= 1
			if (player.tickSpeedMultDecrease > 2) el("postinfi31").innerHTML = "Reduce the tickspeed cost multiplier increase post-" + shorten(Number.MAX_VALUE) + ".<br>" + player.tickSpeedMultDecrease+"x -> "+(player.tickSpeedMultDecrease-1)+"x<br>Cost: "+shortenDimensions(player.tickSpeedMultDecreaseCost) +" IP"
			else el("postinfi31").innerHTML = "Reduce the tickspeed cost multiplier increase post-" + shorten(Number.MAX_VALUE) + ".<br>" + player.tickSpeedMultDecrease.toFixed(player.tickSpeedMultDecrease < 2 ? 2 : 0)+"x"
		}
	}

	el("postinfi41").onclick = function() {
		buyInfinityUpgrade("postGalaxy", 5e11);
	}

	el("postinfi12").onclick = function() {
		buyInfinityUpgrade("infinitiedMult", 1e5);
	}

	el("postinfi22").onclick = function() {
		buyInfinityUpgrade("achievementMult", 1e6);
	}

	el("postinfi32").onclick = function() {
		buyInfinityUpgrade("challengeMult", 1e7);
	}

	el("postinfi42").onclick = function() {
		if (player.infinityPoints.gte(player.dimensionMultDecreaseCost) && player.dimensionMultDecrease > 3) {
			player.infinityPoints = player.infinityPoints.minus(player.dimensionMultDecreaseCost)
			player.dimensionMultDecreaseCost *= 5000
			player.dimensionMultDecrease -= 1
			if (player.dimensionMultDecrease > 3) el("postinfi42").innerHTML = "Reduce the Dimension  cost multiplier increase post-" + shorten(Number.MAX_VALUE) + ".<br>" + player.dimensionMultDecrease + "x -> " + (player.dimensionMultDecrease - 1) + "x<br>Cost: " + shorten(player.dimensionMultDecreaseCost) +" IP"
			else el("postinfi42").innerHTML = "Reduce the Dimension cost multiplier increase post-" + shorten(Number.MAX_VALUE) + ".<br>"+player.dimensionMultDecrease.toFixed(ECComps("eterc6") % 5 > 0 ? 1 : 0) + "x"
		}
	}

	el("postinfi23").onclick = function() {
		buyInfinityUpgrade("bulkBoost",inNGM(3) ? 2e4 : inNGM(2)?5e6:5e9);
	}

	el("offlineProd").onclick = function() {
		if (player.infinityPoints.gte(player.offlineProdCost) && player.offlineProd < 50) {
			player.infinityPoints = player.infinityPoints.minus(player.offlineProdCost)
			player.offlineProdCost *= 10
			player.offlineProd += 5
		}
	}
}

function glowText(id) {
	var text = el(id);
	text.style.setProperty("-webkit-animation", "glow 1s");
	text.style.setProperty("animation", "glow 1s");
}

el("maxall").onclick = function () {
	if (tmp.ri) return false
	if (player.currentChallenge !== 'challenge14' || tmp.ngmX !== 2) buyMaxTickSpeed()
	for (var tier=1; tier<9;tier++) buyBulkDimension(tier, 1/0)
	if (inNGM(4)) buyMaxTimeDimensions()
	if (player.pSac!=undefined) maxAllIDswithAM()
	if (tmp.ngC) for (let i=1;i<=8;i++) ngC.condense.nds.max(i)
}

el("challengeconfirmation").onclick = function () {
	player.options.challConf = !player.options.challConf
	el("challengeconfirmation").textContent = "Challenge confirmation: O" + (player.options.challConf ? "N" : "FF")
}

el("infiMult").onclick = function() {
	if (canBuyIPMult()) {
		player.infinityPoints = player.infinityPoints.minus(player.infMultCost)
		player.infMult = player.infMult.times(getIPMultPower());
		player.autoIP = player.autoIP.times(getIPMultPower());
		player.infMultCost = player.infMultCost.times(ipMultCostIncrease)
		if (player.autobuyers[11].priority !== undefined && player.autobuyers[11].priority !== null && player.autoCrunchMode == "amount") player.autobuyers[11].priority = Decimal.times(player.autobuyers[11].priority, 2);
		if (player.autoCrunchMode == "amount") el("priority12").value = formatValue("Scientific", player.autobuyers[11].priority, 2, 0);
	}
}

function playerInfinityUpgradesOnEternity() {
	if (getEternitied() >= 20 || hasAch("ng3p51")) return
	else if (getEternitied() >= 4) {
		var filter = ["timeMult", "dimMult", "timeMult2", "skipReset1", "skipReset2", "unspentBonus", "27Mult", "18Mult", "36Mult", "resetMult", "skipReset3", "passiveGen", "45Mult", "resetBoost", "galaxyBoost", "skipResetGalaxy"]
		var newUpgrades = []
		for (u = 0; u < player.infinityUpgrades.length; u++) if (filter.includes(player.infinityUpgrades[u])) newUpgrades.push(player.infinityUpgrades[u])
		player.infinityUpgrades = newUpgrades
	} else player.infinityUpgrades = []
}

//MORE DISPLAY STUFF
function updateInfCosts() {
	if (el("repMajor").style.display == "block") replicantiDisplay()
	if (el("replicantis").style.display == "block" && el("infinity").style.display == "block") replicantiDisplay()
	if (el("timestudies").style.display == "block" && el("eternitystore").style.display == "block") mainTimeStudyDisplay()
	if (el("ers_timestudies").style.display == "block" && el("eternitystore").style.display == "block") updateERSTTDesc()
}

function updateMilestones() {
	var eters = getEternitied()
	var moreUnlocked = moreEMsUnlocked()
	var milestoneRequirements = [1, 2, 3, 4, 5, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 25, 30, 40, 50, 60, 80, 100].concat(tmp.ngp3_em)
	for (i = 0; i < (moreUnlocked ? 30 : 24); i++) {
		var name = "reward" + i;
		if (i >= 24) el("milestone" + i).textContent = shortenMoney(milestoneRequirements[i]) + " Eternities:"
		el(name).className = "milestonereward" + (eters >= milestoneRequirements[i] ? "" : "locked")
	}
	if (pH.did("quantum")) el("reward27").className = "milestonereward"

	el("mdmilestonesrow1a").style.display = moreUnlocked ? "" : "none"
	el("mdmilestonesrow1b").style.display = moreUnlocked ? "" : "none"
	el("mdmilestonesrow2a").style.display = moreUnlocked ? "" : "none"
	el("mdmilestonesrow2b").style.display = moreUnlocked ? "" : "none"
	el("mdmilestonesrow3a").style.display = moreUnlocked ? "" : "none"
	el("mdmilestonesrow3b").style.display = moreUnlocked ? "" : "none"
}

el("save").onclick = function () {
	saved++
	if (saved > 99) giveAchievement("Just in case")
	save_game();
};

var loadedSaves=0
var onLoading=false
var latestRow
var loadSavesIntervalId
var occupied=false
function load_saves() {
	closeToolTip()
	el("loadmenu").style.display = "block"
	changeSaveDesc(metaSave.current, savePlacement)
	clearInterval(loadSavesIntervalId)
	occupied = false
	loadSavesIntervalId = setInterval(function(){
		if (occupied) return
		else occupied = true
		if (loadedSaves == metaSave.saveOrder.length) {
			clearInterval(loadSavesIntervalId)
			return
		} else if (!onLoading) {
			latestRow = el("saves").insertRow(loadedSaves)
			onLoading = true
		}
		try {
			var id = metaSave.saveOrder[loadedSaves]
			latestRow.innerHTML = getSaveLayout(id)
			changeSaveDesc(id, loadedSaves+1)
			loadedSaves++
			onLoading = false
		} catch (_) {}
		occupied=false
	}, 0)
}

function getSaveLayout(id) {
	return "<b id='save_"+id+"_title'>Save #"+(loadedSaves+1)+"</b><div id='save_"+id+"_desc'></div><button class='storebtn' onclick='overwrite_save("+id+")'>Save</button><button class='storebtn' onclick='change_save("+id+")'>Load</button><button class='storebtn' onclick='rename_save("+id+")'>Rename</button><button class='storebtn' onclick='export_save("+id+")'>Export</button><button class='storebtn' onclick='import_save("+id+")'>Import</button><button class='storebtn' onclick='delete_save(" + id + ")'>Delete</button>" +

	"<span class='metaOpts'>" +
		"<button class='storebtn' onclick='move(" + id + ", -1)'>⭡</button>" +
		"<button class='storebtn' onclick='move(" + id + ", 1)'>⭣</button>" +
	"</span>"
}

function changeSaveDesc(saveId, placement) {
	var element = el("save_" + saveId + "_desc")
	if (element == undefined) return
	try {
		var isSaveCurrent = metaSave.current == saveId
		var temp = isSaveCurrent ? player : get_save(saveId)
		if (temp.aarexModifications == null) temp.aarexModifications = {}
		var msg = ""
		var exp = ""
		if (temp.aarexModifications.newGameExpVersion) exp += "^"
		if (temp.aarexModifications.newGameMult) exp += "*"
		if (temp.exdilation) {
			msg += (temp.meta || exp != "" || temp.aarexModifications.newGameMinusVersion || temp.galacticSacrifice) ? "Ud" : " Update"
			if (temp.aarexModifications.nguepV) msg += "^"
			if (temp.aarexModifications.ngumuV) msg += "*"
			if (temp.aarexModifications.nguspV) msg += "S'"
			else if (temp.aarexModifications.ngudpV) msg += "'"
			msg += exp
			if (!temp.aarexModifications.nguspV && !temp.aarexModifications.ngudpV && temp.meta) msg += "+"
		} else if (temp.meta) msg += exp + "++" + (temp.masterystudies ? "+" : "")
		else if (temp.aarexModifications.newGamePlusVersion) msg += exp + "+"
		var ngmX = calcNGMX(temp)
		if (ngmX >= 4) msg += "-" + ngmX
		else if (ngmX) msg += "-".repeat(ngmX)
		var diffNum = calcDifficulty(temp)
		if (ngmX < 2 && temp.aarexModifications.ngmR !== undefined) msg = msg != "" || ex ? msg + "-R" : msg + "- Remade"
		if (temp.condensed !== undefined) msg = msg != "" || ex ? msg + "C" : msg + " Condensed"
		if (temp.boughtDims) msg = msg != "" || ex ? "ER" + msg : "Eternity Respecced"
		else if (temp.singularity) msg = msg != "" || ex ? "IR" + msg : "Infinity Respecced"
		else msg = "NG" + msg
		if (temp.galacticSacrifice) {
			if (temp.aarexModifications.ngmR) msg += ", NG-R"
			if (temp.aarexModifications.newGameMinusVersion) msg += ", NG-"
		}
		if ((temp.exdilation || temp.meta) && !temp.aarexModifications.newGamePlusVersion) msg += ", The Grand Run [No NG+]"
		if (temp.aarexModifications.aau) msg = (msg == "NG" ? "" : msg + ", ") + "AAU"
		if (temp.aarexModifications.ls) msg = (msg == "NG" ? "" : msg + ", ") + "Light Speed"
		var diffNum = calcDifficulty(temp)
		if (diffNum == 0) msg = (msg == "NG" ? "" : msg + ", ") + "Beginner Mode (Easy)"
		if (diffNum == 2) msg = (msg == "NG" ? "" : msg + ", ") + "Expert Mode (Normal+)"
		if (diffNum == 3) msg = (msg == "NG" ? "" : msg + ", ") + "Death Mode 💀 (Hard)"
		msg = (msg == "NG" ? "(<b>Vanilla</b>)<br>" : "(<b>" + msg + "</b>)<br>") +
			(isSaveCurrent ? "Selected" : "Played for " + timeDisplayShort(temp.totalTimePlayed)) + "<br>" +
			"<span style='font-size: 16px'>" + shortenMoney(E(temp.totalmoney)) + " antimatter</span><br>"

		var isSaveFluctuated = temp.fluc ? temp.fluc.energy > 0 : false
		var isSaveQuantumed = temp.quantum ? temp.quantum.times > 0 : false

		msg += "<span style='font-size: 12px'>"
		if (isSaveFluctuated) {
			msg += "Fluctuant Energy: " + getFullExpansion(temp.fluc.energy)
		} else if (isSaveQuantumed) {
			if (!temp.masterystudies) msg += "Endgame of NG++"
			else {
				var quantum = temp.quantum
				var qk = Decimal.add(quantum.quarks,quantum.usedQuarks.r).add(quantum.usedQuarks.g).add(quantum.usedQuarks.b)
				if (quantum.gluons.rg) qk = qk.add(quantum.gluons.rg,quantum.gluons.gb).add(quantum.gluons.br)
				if (quantum.qc && quantum.qc.comps >= 1) msg += "Quantum Energy: " + shorten(quantum.bestEnergy || quantum.quarkEnergy) + ", Replicanti Compressors: " + getFullExpansion(quantum.qc.qc1.best || quantum.qc.qc1.boosts)
				else msg += "Quantum Worth: " + shortenDimensions(qk) + ", Quantum Energy: " + shorten(quantum.bestEnergy || quantum.quarkEnergy)

				if (quantum.qc && quantum.qc.comps >= 7) msg += ", Paired Challenges: " + (quantum.pc ? getFullExpansion(quantum.pc.best || 0) : "This has been rewritten while you are away!")
				else if (temp.masterystudies.includes('d8')) msg += ", Quantum Challenges: " + (quantum.qc ? getFullExpansion(quantum.qc.comps) : "This has been rewritten while you are away!")
				else if (temp.masterystudies.includes('d7')) msg += ", Positronic Charge: " + (quantum.pos ? getFullExpansion(quantum.pos.eng) : "This has been rewritten while you are away!")
				else msg += ", Best quantum: " + timeDisplayShort(quantum.best)
			}
		} else if (temp.dilation && temp.dilation.studies.includes(1)) {
			var temp2 = ""
			var mastery = temp.masterystudies && temp.dilation.upgrades.includes("ngpp6")
			if (!mastery) temp2 = "Tachyon particles: " + shortenMoney(E(temp.dilation.totalTachyonParticles)) +
				", Dilated time: " + shortenMoney(E(temp.dilation.dilatedTime))

			if (temp.dilation.studies.includes(6)) temp2 += (mastery ? "" : ", ") + "Meta-antimatter: " + shortenMoney(E(temp.meta.bestAntimatter))
			else if (!temp.dilation.upgrades.includes(10)) temp2 = "Eternity points: " + shorten(E(temp.eternityPoints)) + ", " + temp2
			else temp2 = "Time Theorems: " + shortenMoney(getTotalTT(temp)) + ", " + temp2
			if (mastery) temp2 += ", Mastery Studies: " + getFullExpansion(temp.masterystudies.length)

			msg += temp2
		} else {
			var totalChallengeCompletions = (temp.aarexModifications.newGameMinusVersion ? -6 : 0)
			for (ec = 1; ec <= 12; ec++) totalChallengeCompletions += temp.eternityChalls['eterc' + ec] || 0
			if (totalChallengeCompletions > 0) {
				msg += "Time Theorems: " + getFullExpansion(getTotalTT(temp)) + ", Challenge completions: " + totalChallengeCompletions
			} else if (temp.eternities>(temp.aarexModifications.newGameMinusVersion?-20:0)) msg += "Eternity points: " + shortenDimensions(E(temp.eternityPoints)) + ", Eternities: " + temp.eternities.toString().replace(/\B(?=(\d{3}) + (?!\d))/g, ",") + ", Time Theorems: " + getTotalTT(temp)
			else if (temp.achievements.includes("r51")) {
				msg += ", Infinity points: " + shortenDimensions(E(temp.infinityPoints))
				if (temp.infDimensionsUnlocked[0]) msg += ", Infinity Power: " + shorten(new Decays(temp.infinityPower))

				if (temp.replicanti.gal) msg += ", Max Replicated Galaxies: " + getFullExpansion(temp.replicanti.gal)
				else if (temp.replicanti.unl) msg += ", Replicantis: " + shorten(E(temp.replicanti.amount))
				else {
					var comps = 0
					for (var i = 0; i < temp.challenges.length; i++) if (temp.challenges[i].includes("postc")) comps++
					msg += ", Infinity Challenges: " + getFullExpansion(comps)
				}
			} else if (temp.infinited > 0 || temp.challenges.length > 0) msg += ", Infinity points: " + shortenDimensions(E(temp.infinityPoints)) +
				", Challenge completions: " + getFullExpansion(temp.challenges.length)
			else if (temp.galacticSacrifice && temp.galacticSacrifice.times) msg += ", Galaxy points: " + shortenDimensions(E(temp.galacticSacrifice.galaxyPoints))
			else msg += "Dimension Boosts: " + getFullExpansion(temp.resets) +
				", Galaxies: " + getFullExpansion(temp.galaxies)
		}
		msg += "</span>"

		el("save_" + saveId + "_title").textContent = temp.aarexModifications.save_name?temp.aarexModifications.save_name : "Save #" + placement
	} catch (_) {
		var msg = "New game"
	}
	element.innerHTML = msg
}

var modsShown = false
var modPresets = {
	vanilla: {},
	ngp3: {ngpp: 2, ngp: 1},
	grand_run: {ngpp: 2},
	beginner_mode: {ngpp: 2, diff: 1},
	expert_mode: {ngpp: 2, ngp: 1, diff: 2}
}
var modFullNames = {
	diff: "Difficulty",
	journey: "Journey (NG+3)",
	rs: "Respecced",
	arrows: "NG↑",
	ngpp: "NG++",
	ngp: "NG+",
	ngmm: "NG--",
	ngm: "NG-",
	ngud: "NGUd",
	nguep: "NGUd↑'",
	ngmu: "NG*",
	ngumu: "NGUd*'",
	aau: "AAU",
	ngprw: "NG+ Reworked",
	ls: "Light Speed",
	ngc: "NG Condensed",
	ngm5rg: "NG-5 Regulated",
	us: "Upsided"
}
var modSubNames = {
	ngm: ["OFF", "ON", "NG- Remade"],
	ngp: ["OFF", "ON", "NG+4"/*, "NG+5"*/], //There's no NG+ Classic, because earth doesn't want us to bring NG+ Classic back.
	ngpp: ["OFF", "ON", "NG+++"],
	arrows: ["Linear (↑⁰)", "Exponential (↑)"/*, "Tetrational (↑↑)"*/],
	ngmm: ["OFF", "ON", "NG---", "NG-4", "NG-5"/*, "NG-6"*/],
	rs: ["OFF", "Infinity 💀", "Eternity 💀", /*"Dilation"*/], //Dilation won't be rewritten. >:)
	ngud: ["OFF", "ON", "Prime (')", "Semiprime (S')"/*, "Semiprime.1 (S'.1)"*/],
	nguep: ["Linear' (↑⁰')", "Exponential' (↑')"/*, "Tetrational' (↑↑')"*/],
	ngmu: ["OFF", "ON", /*"NG**", "NG***"*/], //NG** won't be made.
	ngumu: ["OFF", "ON", /*"NGUd**'", "NGUd***'"*/], //Same goes to NGUd**'.
	diff: ["Normal", "Beginner", "Expert", "Death 💀"] // modes that aren't even made yet
}
function toggle_mod(id) {
	if (id == "rs" && !mods.rs) {
		if (!confirm("WARNING! Most Respecced mods are extremely broken and will be fixed in a far future! Are you sure to proceed?"))
		return
	}
	if (id == "ngm5rg" || id == "us") {
		alert("Coming soon...")
		return
	}

	hasSubMod = Object.keys(modSubNames).includes(id)

	// Change submod
	var subMode = ((mods[id] || 0) + 1) % ((hasSubMod && modSubNames[id].length) || 2)
	if (id == "ngpp" && subMode == 1 && mods.ngud) subMode = 2
	else if (id == "arrows" && subMode == 2 && mods.rs) subMode = 0
	mods[id] = subMode

	//Setup notifications
	var notifyExpert = id == "ngpp" || id == "ngex"

	// Update displays
	el(id + "Btn").textContent = `${modFullNames[id]}: ${hasSubMod?modSubNames[id][subMode] : subMode ? "ON" : "OFF"}`
	if (id == "diff" && subMode) {
		mods.ngp = 0
		mods.aau = 0
		mods.ls = 0
		el("ngpBtn").textContent = "NG+: OFF"
		el("aauBtn").textContent = "AAU: OFF"
		el("lsBtn").textContent = "Light Speed: OFF"
	}
	if ((id == "ngpp" || id=="ngud") && subMode && (mods.rs != 0 && mods.rs != 3)) {
		//if (!mods.ngp && !mods.ngex) toggle_mod("ngp")
		mods.rs = 0
		el("rsBtn").textContent = "Respecced: NONE"
	}
	if (
		(id=="ngpp" && !subMode && mods.ngp >= 2) ||
		(id=="rs" && subMode && mods.ngp >= 2) ||
		(id=="ngmm" && subMode && mods.ngp >= 2) ||
		(id=="ngud" && subMode && mods.ngp >= 3)
	) {
		mods.ngp=1
		el("ngpBtn").textContent = "NG+: ON"
	}
	if (subMode && (
		(id=="ngud" && ((subMode >= 2 && !mods.ngpp) || mods.ngpp == 1)) ||
		(id=="ngp" && subMode >= 2)
	)) {
		mods.ngpp = 2
		notifyExpert = true
		el("ngppBtn").textContent = "NG++: NG+++"
	}
	if (id=="rs" && subMode) {
		mods.ngpp = 0
		mods.ngud = 0
		el("ngppBtn").textContent = "NG++: OFF"
		el("ngudBtn").textContent = "NGUd: OFF"
	}
	if (id == "ngp" && subMode >= 3) {
		mods.ngud = 0
		el("ngudBtn").textContent = "NGUd: OFF"
	}
	if (((id=="ngpp" || id=="ngud") && !subMode) || (id == "rs" && subMode) || (id == "ngp" && subMode >= 1)) {
		if (mods.ngud > 1) {
			mods.ngud = 1
			el("ngudBtn").textContent = "NGUd: ON"
		}
		if (id == "rs" && mods.arrows > 1) {
			mods.arrows=1
			el("arrowsBtn").textContent = "NG↑: Exponential (↑)"
		}
		mods.nguep = 0
		mods.ngumu = 0
		el("nguepBtn").textContent = "NGUd↑': Linear' (↑⁰')"
		el("ngumuBtn").textContent = "NGUd*': OFF"
	}
	if ((id == "ngumu" || id == "nguep") && !(mods.ngud >= 2) && subMode) {
		mods.ngud = 1
		toggle_mod("ngud")
	}

	if (id == "diff" && subMode) {
		delete mods.journey
		//el("journeyBtn").textContent = "Journey (NG+3): OFF"
	}

	if (id == "journey" && !subMode) el("diffBtn").textContent = "Difficulty: Normal"
	if (id == "journey" && subMode) {
		delete mods.diff
		el("diffBtn").textContent = "Difficulty: Fluctuant"

		delete mods.ngp
		el("ngpBtn").textContent = "NG+: OFF"

		mods.ngpp = 2
		notifyExpert = true
		el("ngppBtn").textContent = "NG++: NG+++"
	}

	var ngp3ex = mods.diff >= 2 && mods.ngpp == 2
	if (mods.ngp3ex != ngp3ex) {
		if (notifyExpert && ngp3ex) $.notify("A space crystal begins to collide with reality...")
		mods.ngp3ex = ngp3ex
	}

	/* 
	this function is a MESS someone needs to clean it up
	Also, id=NGC should force NG+++ and not NG+, 
	NGC being on, and id = ngpp then NG+ off
	I also dont know how to do this and this is supa ugly so pls fix
	*/
}

function new_save() {
	if (modsShown == "adv") new_game()
	else show_mods('basic')
}

function show_mods(type) {
	modsShown = type

	el("savesTab").style.display = modsShown ? "none" : ""
	el("modsTab").style.display = modsShown === 'basic' ? "" : "none"
	el("advModsTab").style.display = modsShown === 'adv' ? "" : "none"

	el("newSaveBtn").style.display = modsShown ? (modsShown === 'adv' ? "" : "none") : ""
	el("newAdvSaveBtn").style.display = modsShown === "basic" ? "" : "none"
	el("newImportBtn").style.display = modsShown ? "none" : ""
	el("cancelNewSaveBtn").style.display = modsShown ? "" : "none"
}

function calcDifficulty(x) {
	var aarexMod = x.aarexModifications
	if (!aarexMod) return 0

	return aarexMod.dtMode ? 3 : aarexMod.ngexV ? 2 : aarexMod.ez ? 0 : 1
}

function showOptions(id) {
	closeToolTip();
	el(id).style.display = id == "advnotationmenu" ? "inline" : "flex"
}

function showNextModeMessage(click) {
	if (ngModeMessages.length > 0) {
		el("welcome").style.display = "flex"
		el("welcomeMessage").innerHTML = ngModeMessages[ngModeMessages.length - 1]
		ngModeMessages.pop()
	} else if (welcomeUpdates.length > 0) {
		var ver = welcomeUpdates.pop()
		el("welcome").style.display = "flex"
		el("welcomeMessage").innerHTML = ver == "alpha" ? (
			"<b class='red'>Welcome to NG+3 v" + aarMod.ngp3r + ": Alpha Test Server!</b><br>You are in alpha test server. I recommend you to use the save bank so you can start testing a new feature.<br><br>" +
			"<b class='warning'>Anything will break! If this happens, report it in the server below!</b>" +
			"<br><br><b>Test Discord</b>: <a href='http://discord.gg/7v82CAX' target='_newtab'>http://discord.gg/7v82CAX</a>" +
			"<br><br>Thank you for testing NG+3R!<br>~Aarex"
		) : (
			"<b class='lime'>Welcome to NG+3 Respecced v" + ver + "!</b><br>This update " + evalData(ngp3Welcomes.verbs[ver] || "introduces") + "...<br><br>" +
			evalData(ngp3Welcomes.msgs[ver] || "???") +
			"<br><br><b>Discord</b>: <a href='http://discord.gg/KsjcgskgTj' target='_newtab'>http://discord.gg/KsjcgskgTj</a>" +
			"<br><br>Thank you for playing NG+3R!<br>~Aarex" +
			"<br><br>Goal: " + evalData(ngp3Welcomes.goals[ver])
		)
	} else if (click) el("welcome").style.display = "none"
}

function verify_save(obj) {
	if (typeof obj != 'object') return false;
	return true;
}

var onImport = false
function import_save(type) {
	if (type=="current") type=metaSave.current
	else if (type!="new") {
		var placement=1
		while (metaSave.saveOrder[placement-1]!=type) placement++
	}
	onImport = true
	var save_data = prompt("Input your save. "+(type=="new"?"":"("+(type==metaSave.current?"your current save file":"save #"+placement)+" will be overwritten!)"));
	onImport = false
	if (save_data.constructor !== String) save_data = "";
	if (sha512_256(save_data.replace(/\s/g, '').toUpperCase()) === "80b7fdc794f5dfc944da6a445a3f21a2d0f7c974d044f2ea25713037e96af9e3") {
		el("body").style.animation = "barrelRoll 5s 1";
		giveAchievement("Do a barrel roll!")
		setTimeout(function(){ el("body").style.animation = ""; }, 5000)
	}
	if (sha512_256(save_data.replace(/\s/g, '').toUpperCase()) === "857876556a230da15fe1bb6f410ca8dbc9274de47c1a847c2281a7103dd2c274") giveAchievement("So do I");
	if (sha512_256(save_data.replace(/\s/g, '').toUpperCase()) === "8aaff3cdcf68f6392b172ee9924a22918451e511c8e60b120f09e2c16d4e26ac") giveAchievement("The Forbidden Layer");
	if (sha512_256(save_data) === "de24687ee7ba1acd8f5dc8f71d41a3d4b7f14432fff53a4d4166e7eea48a88c0") {
		player.options.theme = "S1";
		player.options.secretThemeKey = save_data;
		setTheme(player.options.theme);
	} else if (sha512_256(save_data) === "76269d18c05c9ebec8a990a096cee046dea042a0421f8ab81d17f34dd1cdbdbf") {
		player.options.theme = "S2";
		player.options.secretThemeKey = save_data;
		setTheme(player.options.theme);
	} else if (sha512_256(save_data) === "d764e9a1d1e18081be19f3483b537ae1159ab40d10e096df1d9e857d68d6ba7a") {
		player.options.theme = "S3";
		player.options.secretThemeKey = save_data;
		setTheme(player.options.theme);
	} else if (sha512_256(save_data) === "ae0199482ecfa538a03eb37c67866e67a11f1832516c26c7939e971e514d40c5") {
		player.options.theme = "S4";
		player.options.secretThemeKey = save_data;
		setTheme(player.options.theme);
	} else if (sha512_256(save_data) === "7a668b64cdfe1bcdf7a38d3858429ee21290268de66b9784afba27dc5225ce28") {
		player.options.theme = "S5";
		player.options.secretThemeKey = save_data;
		setTheme(player.options.theme);
	} else if (sha512_256(save_data) === "4f82333af895f5c89e6b2082a7dab5a35b964614e74908961fe915cefca1c6d0") {
		player.options.theme = "S6";
		player.options.secretThemeKey = save_data;
		setTheme(player.options.theme);
	} else {
		var decoded_save_data = JSON.parse(atob(save_data, function(k, v) { return (v === Infinity) ? "Infinity" : v; }));
		if (!verify_save(decoded_save_data)) {
			forceHardReset = true
			reset_game()
			forceHardReset = false
			return
		} else if (!decoded_save_data||!save_data) {
			alert('could not load the save..')
			return
		}
		/*
		// Live-server only
		let ghostify_data=decoded_save_data.ghostify
		if (ghostify_data&&ghostify_data.wzb&&ghostify_data.wzb.unlReal!==undefined&&ghostify_data.wzb.unl!=ghostify_data.wzb.unlReal) {
			alert('You are not allowed to import this save as this save comes from the testing branch of the game.')
			return
		}
		*/
		if (type==metaSave.current) {
			clearInterval(gameLoopIntervalId)
			infiniteCheck2 = false
			player = decoded_save_data;
			if (detectInfinite()) infiniteDetected=true
			if (!game_loaded) {
				set_save(metaSave.current, player)
				document.location.reload(true)
				return
			}
			onLoad()
			if (infiniteDetected) {
				if (el("welcome").style.display != "flex") el("welcome").style.display = "flex"
				el("welcomeMessage").innerHTML = "Because you imported a save that has an Infinite bug in it, saving is disabled. Most functionality is disabled to prevent further damage. It is highly recommended that you report this occurrence to the #bugs_and_glitches channel on the Discord server, so the bug can be looked into and fixed. It is not recommended to modify the save as it may result in undesirable effects, and will be hard reset after you switch saves or refresh the game."
			}
			startInterval()
		} else if (type === "new") {
			var newSaveId=1
			while (metaSave.saveOrder.includes(newSaveId)) newSaveId++
			metaSave.saveOrder.push(newSaveId)
			localStorage.setItem(btoa(savePrefix+newSaveId),save_data)
			if (!game_loaded) {
				metaSave.current=newSaveId
				localStorage.setItem(metaSaveId,btoa(JSON.stringify(metaSave)))
				document.location.reload(true)
				return
			}
			latestRow=el("saves").insertRow(loadedSaves)
			latestRow.innerHTML=getSaveLayout(newSaveId)
			loadedSaves++
			changeSaveDesc(newSaveId, loadedSaves)
			localStorage.setItem(metaSaveId,btoa(JSON.stringify(metaSave)))
		} else {
			set_save(type, decoded_save_data)
			if (!game_loaded) {
				metaSave.current=type
				localStorage.setItem(metaSaveId,btoa(JSON.stringify(metaSave)))
				document.location.reload(true)
				return
			}
			changeSaveDesc(type, placement)
			$.notify("Save #"+placement+" imported", "info")
		}
	}
}

function reset_game() {
	if (!forceHardReset) if (!confirm("Do you really want to erase all your progress in this save?")) return
	clearInterval(gameLoopIntervalId)
	infiniteDetected = false
	updateNewPlayer("reset")
	if (!game_loaded) {
		set_save(metaSave.current, player)
		document.location.reload(true)
		return
	}
	save_game(true)
	onLoad()
	startInterval()
};

function getEPGainBase() {
	let base = 308
	if (hasAch("ng3p23")) base = 307.8
	if (hasTS(112) && tmp.ngC) base /= 2
	if (hasTS(113) && tmp.ngC) base /= 1.5
	return base;
}

function gainedEternityPoints() {
	let uEPM = player.dilation.upgrades.includes("ngp3c7") && tmp.ngC
	var ret = Decimal.pow(5, player.infinityPoints.plus(gainedInfinityPoints()).e / getEPGainBase() - 0.7).times(uEPM ? 1 : player.epmult)
	if (aarMod.newGameExpVersion) ret = ret.times(10)
	if (hasTimeStudy(61)) ret = ret.times(tsMults[61]())
	if (hasTimeStudy(121)) ret = ret.times(tmp.ngp3_boost && hasAch("ngpp11") ? 50 : ((253 - averageEp.dividedBy(player.epmult).dividedBy(10).min(248).max(3))/5)) 
	if (hasTimeStudy(122)) ret = ret.times(35)
	if (hasTimeStudy(123)) ret = ret.times(Math.sqrt(1.39*player.thisEternity/10))
	if (hasGalUpg(51)) ret = ret.times(galMults.u51())
	if (tmp.ngp3 && tmp.be) ret = ret.times(getBreakUpgMult(7))
	if (tmp.ngC) ret = softcap(ret, "ep_ngC")
	if (hasTS(172) && tmp.ngC) ret = ret.times(tsMults[172]())
	if (uEPM) ret = ret.times(player.epmult)
	return ret.floor()
}

//notation stuff
var notationArray = [
	"Scientific", "Engineering", "Logarithm",
	"Mixed scientific", "Mixed engineering", "Mixed logarithm",
	"Explained scientific", "Explained engineering", "Explained logarithm",

	"Tetration", "Hyperscientific", "Layered scientific", "Layered logarithm", "Tetrational scientific", "Hyper-E", "Psi",

	"Standard", "AAS", "Maximus Standard",

	"Letters", "Emojis", "Brackets", "Infinity", "Game percentages", "Greek", "Hexadecimal", "Morse code", "Spazzy", "Country Codes", "Iroha", "Symbols", "Lines", "Simplified Written", "Time", "Base-64", "Myriads", "Fonster", "Fonster (Words)", /*"Layered Symbols",*/ "AF2019", "AF5LN", "Blind"
]

function updateNotationOption() {
	var notationMsg = (player.options.notation == "Emojis" ? "Cancer" : player.options.notation)
	var commasMsg = (player.options.commas == "Emojis" ? "Cancer" : player.options.commas) + " on exponents"
	el("notation").innerHTML = "<p style='font-size:15px'>Notations</p>" + notationMsg
	el("chosenNotation").textContent = player.options.notation=="AF5LN"?"Notation: Aarex's Funny 5-letter Notation":"Notation: " + notationMsg
	el("chosenCommas").textContent = player.options.commas=="AF5LN"?"Aarex's Funny 5-letter Notation on exponents":commasMsg
	
	let tooltip=""
	if (player.options.notation=="AAS") tooltip="Notation: Aarex's Abbreviation System"
	if (player.options.notation=="AF5LN") tooltip="Notation: Aarex's Funny 5-letter Notation"
	if (tooltip=="") el("notation").removeAttribute('ach-tooltip')
	else el("notation").setAttribute('ach-tooltip', tooltip)
}

function onNotationChange() {
	document.getElementsByClassName("hideInMorse").display = player.options.notation == "Morse code" || player.options.notation == 'Spazzy' ? "none" : ""
	updateNotationOption()
	if (player.pSac !== undefined) updatePUCosts()
	updateLastTenRuns();
	updateLastTenEternities();
	updateLastTenQuantums();
	updateLastTenGhostifies()
	tmp.tickUpdate = true;
	setAchieveTooltip();
	updateSingularity()
	updateDimTechs()
	updateDilationUpgradeCosts()
	updateExdilation()
	updateMilestones()
	if (tmp.ngp3) {
		qMs.updateDisplay()
		updateQuarksTabOnUpdate()
		updateGluonsTabOnUpdate("notation")
		updateQuantumWorth("notation")
		QCs.updateDisp()
		updateMasteryStudyTextDisplay()
		updateBreakEternity()
		onNotationChangeNeutrinos()
		updateBosonicStuffCosts()
		if (!player.ghostify.ghostlyPhotons.unl) el("gphUnl").textContent = "To unlock Ghostly Photons, you need to get "+shortenCosts(Decimal.pow(10,6e9))+" antimatter while your universe is Big Ripped first."
		else if (!player.ghostify.wzb.unl) updateBLUnlockDisplay()
		else updateBosonUnlockDisplay()
	}
	el("achmultlabel").textContent = "Current achievement multiplier on each Dimension: " + shortenMoney(player.achPow) + "x"
}

function setNotation(id) {
	player.options.notation = id
	player.options.commas = "Commas"
	onNotationChange()
}

function setAdvNotation(id) {
	if (player.options.notation == notationArray[id]) return
	player.options.notation = notationArray[id]
	onNotationChange()
}

function setCommas(id) {
	if (id > 1) id = notationArray[id-2]
	else if (id > 0) id = "Same notation"
	else id = "Commas"
	if (player.options.commas == id) return
	player.options.commas = id
	onNotationChange()
}

var notationMenuDone = false
function openAdvNotations() {
	if (!notationMenuDone) {
		notationMenuDone = true
		let notationsTable = el("notationOptions")
		let commasTable = el("commasOptions")
		let subTable = el("subNotationOptions")
		let selectList = ""
		
		var row = commasTable.insertRow(0)
		row.innerHTML = "<button class='storebtn' style='width:160px; height: 40px' onclick='setCommas(0)'>Commas on exponents</button>"
		row = commasTable.insertRow(1)
		row.innerHTML = "<button class='storebtn' style='width:160px; height: 40px' onclick='setCommas(1)'>Same notation on exponents</button>"
		
		for (n = 0; n < notationArray.length; n++) {
			var name = notationArray[n] == "Emojis" ? "Cancer" : notationArray[n]
			row = notationsTable.insertRow(n)
			row.innerHTML = "<button class='storebtn' id='select" + name + "' style='width:160px; height: 40px' onclick='setAdvNotation(" + n + ")' ach-tooltip='Examples: " + formatValue(notationArray[n], 4.16e19, 2, 2) + ", " + formatValue(notationArray[n], E("4.12e619"), 2, 2, true) + "'>Select " + name + "</button>"
			row = commasTable.insertRow(n + 2)
			row.innerHTML="<button class='storebtn' id='selectCommas" + name + "' style='width:160px; height: 40px' onclick='setCommas(" + (n + 2) + ")'>" + name + " on exponents</button>"
			if (n > 18) {
				row = subTable.insertRow(n - 1)
				row.innerHTML="<button class='storebtn' id='selectSub" + name + "' style='width:160px; height: 40px' onclick='switchSubNotation(" + n + ")'>Select " + name + "</button>"
			} else if (n < 18) {
				row = subTable.insertRow(n)
				row.innerHTML = "<button class='storebtn' style='width:160px; height: 40px' onclick='switchSubNotation(" + n + ")'>Select " + name + "</button>"	
			}
		}
	}
	showOptions("advnotationmenu")
};

function openNotationOptions() {
	if (el("mainnotationoptions1").style.display == "") {
		formatPsi(1, 1)
		el("openpsioptions").textContent = "Go back"
		el("mainnotationoptions1").style.display = "none"
		el("mainnotationoptions2").style.display = "none"
		el("notationoptions").style.display = ""
		
		el("significantDigits").value = player.options.scientific.significantDigits ? player.options.scientific.significantDigits : 0
		el("logBase").value = player.options.logarithm.base
		el("tetrationBase").value = player.options.tetration.base
		el("hypersciBump").value = player.options.hypersci.bump || 10
		el("maxLength").value = player.options.psi.chars
		el("maxArguments").value = Math.min(player.options.psi.args, 4)
		el("maxLetters").value = player.options.psi.maxletters
		el("psiSide").textContent = "Non-first arguments on " + (player.options.psi.side == "r" ? "right" : "left") + " side"
		var letters = [null, 'E', 'F', 'G', 'H']
		el("psiLetter").textContent = (player.options.psi.letter[0] ? "Force " + letters[player.options.psi.letter[0]] : "Automatically choose letter")
		el("chosenSubNotation").textContent = "Sub-notation: " + (player.options.spazzy.subNotation == "Emojis" ? "Cancer" : player.options.spazzy.subNotation)
		el("useDe").checked = player.options.aas.useDe
		el("useMyr").checked = player.options.standard.useMyr
		el("useTam").checked = player.options.standard.useTam
	} else {
		el("openpsioptions").textContent = "Notation options"
		el("mainnotationoptions1").style.display = ""
		el("mainnotationoptions2").style.display = ""
		el("notationoptions").style.display = "none"
	}
}

function switchNotationOption(notation,id) {
	if (notation == "scientific") {
		if (id === "significantDigits") {
			var value = parseFloat(el(id).value)
			if (isNaN(value)) return
			if (value % 1 != 0) return
			if (value < 0 || value > 10) return
			if (value == 0) player.options.scientific.significantDigits = undefined
			else player.options.scientific.significantDigits = value
		}
	} else if (notation === "logarithm") {
		if (id == "base") {
			var value=parseFloat(el("logBase").value)
		}
		if (isNaN(value)) return
		if (id == "base") {
			if (value <= 1 || value > Number.MAX_VALUE) return
			else player.options.logarithm.base = value
		}
	} else if (notation === "tetration") {
		if (id == "base") {
			var value=parseFloat(el("tetrationBase").value)
		}
		if (isNaN(value)) return
		if (id == "base") {
			if (value < 1.6 || value > Number.MAX_VALUE) return
			else player.options.tetration.base = value
		}
	} else if (notation === "hypersci") {
		if (id == "bump") {
			var value = parseFloat(el("hypersciBump").value)
		}
		if (isNaN(value)) return
		if (id == "bump") {
			if (value < 10 || value > 1e3) return
			else player.options.hypersci.bump = value
		}
	} else if (notation === "psi") {
		if (id.slice(0, 7) === "psiSide") {
			player.options.psi.side = id.slice(7, 8)
			el("psiSide").textContent = "Non-first arguments on " + (player.options.psi.side === "r" ? "right" : "left") + " side"
			return
		}
		if (id.slice(0, 9) === "psiLetter") {
			var letters = {None: [], E: [1], F: [2], G: [3], H: [4]}
			player.options.psi.letter = letters[id.slice(9, id.length)]
			el("psiLetter").textContent = (player.options.psi.letter[0] ? "Force " + id.slice(9, id.length) : "Automatically choose letter")
			return
		}
		var value = parseFloat(el(id).value)
		if (isNaN(value)) return
		if (value % 1 != 0) return
		if (id === "maxLength") {
			if (value < 2 || value > 30) return
			player.options.psi.chars=value
		}
		if (id === "maxArguments") {
			if (value < 1||value > 6) return
			player.options.psi.args=value
		}
		if (id === "maxLetters") {
			if (value < 1 || value > 4) return
			player.options.psi.maxletters=value
		}
	} else if (notation === "standard" || notation === "aas") player.options[notation][id] = el(id).checked
	onNotationChange()
}

function switchSubNotation(id) {
	if (player.options.spazzy.subNotation == notationArray[id]) return
	player.options.spazzy.subNotation = notationArray[id]
	el("chosenSubNotation").textContent = "Sub-notation: " + (player.options.spazzy.subNotation == "Emojis" ? "Cancer" : player.options.spazzy.subNotation)
	onNotationChange()
}

function showHideFooter(toggle) {
	if (toggle) aarMod.noFooter = !aarMod.noFooter
	el("footerBtn").textContent = (aarMod.noFooter ? "Show" : "Hide") + " footer"
	document.documentElement.style.setProperty('--footer', aarMod.noFooter ? "none" : "")
}

el("newsbtn").onclick = function(force) {
	player.options.newsHidden=!player.options.newsHidden
	el("newsbtn").textContent=(player.options.newsHidden?"Show":"Hide")+" news ticker"
	el("game").style.display=player.options.newsHidden?"none":"block"
	if (!player.options.newsHidden) scrollNextMessage()
}

function getSacrificeBoost(){
	return calcSacrificeBoost()
}

function getTotalSacrificeBoost(next = false) {
	return calcTotalSacrificeBoost(next)
}

function calcSacrificeBoostBeforeSoftcap() {
	let ret
	let pow
	if (player.firstAmount == 0) return E(1);
	if (player.challenges.includes("postc2") || (inNGM(3) && player.currentChallenge == "postc2")) {
		pow = 0.01
		if (hasTimeStudy(228)) pow = 0.013
		else if (hasAch("r97") && player.boughtDims) pow = 0.012
		else if (hasAch("r88")) pow = 0.011
		ret = player.firstAmount.div(player.sacrificed.max(1)).pow(pow).max(1)
	} else if (!inNC(11)) {
		pow = 2
		if (hasAch("r32")) pow += inNGM(3) ? 2 : 0.2
		if (hasAch("r57")) pow += player.boughtDims ? 0.3 : 0.2 //this upgrade was too OP lol
		if (player.infinityUpgradesRespecced) pow *= getInfUpgPow(5)
		if (tmp.ngmR) pow *= 1.5
		if (tmp.bgMode) pow *= 1.5
		ret = Decimal.pow(Math.max(player.firstAmount.e / 10, 1) / Math.max(player.sacrificed.e / 10, 1), pow).max(1)
	} else ret = player.firstAmount.pow(0.05).dividedBy(player.sacrificed.pow(inNGM(4)?0.05:0.04).max(1)).max(1)
	if (player.boughtDims) ret = ret.pow(1 + Math.log(1 + Math.log(1 + player.timestudy.ers_studies[1] / 5)))
	if (tmp.ngC) ret = ret.pow(ngC.getSacrificeExpBoost())
	if (hasTS(196)) ret = ret.pow(20)
	return ret
}

function calcTotalSacrificeBoostBeforeSoftcap(next) {
	if (player.resets < 5) return E(1)
	let ret
	let pow
	if (player.challenges.includes("postc2") || (inNGM(3) && player.currentChallenge == "postc2")) {
		pow = 0.01
		if (hasTimeStudy(228)) pow = 0.013
		else if (hasAch("r97") && player.boughtDims) pow = 0.012
		else if (hasAch("r88")) pow = 0.011
		ret = player.sacrificed.pow(pow).max(1)
	} else if (!inNC(11)) {
		pow = 2
		if (hasAch("r32")) pow += inNGM(3) ? 2 : 0.2
		if (hasAch("r57")) pow += player.boughtDims ? 0.3 : 0.2 //this upgrade was too OP lol
		if (player.infinityUpgradesRespecced) pow *= getInfUpgPow(5)
		if (tmp.ngmR) pow *= 1.5
		if (tmp.bgMode) pow *= 1.5
		ret = Decimal.pow(Math.max(player.sacrificed.e / 10, 1), pow)
	} else ret = player.chall11Pow 
	if (player.boughtDims) ret = ret.pow(1 + Math.log(1 + Math.log(1 + (player.timestudy.ers_studies[1] + (next ? 1 : 0))/ 5)))
	if (tmp.ngC) ret = ret.pow(ngC.getSacrificeExpBoost())
	if (hasTS(196)) ret = ret.pow(20)
	return ret
}

function calcSacrificeBoost() {
	let ret = calcSacrificeBoostBeforeSoftcap()
	if (tmp.ngC) {
		let total = calcTotalSacrificeBoostBeforeSoftcap()
		ret = softcap(ret.times(total), "sac_ngC").div(tmp.sacPow)
		if (hasTS(196)) ret = ret.pow(20)
	}
	return ret.max(1)
}

function calcTotalSacrificeBoost(next) {
	let ret = calcTotalSacrificeBoostBeforeSoftcap(next)
	if (tmp.ngC) ret = softcap(ret, "sac_ngC")
	if (hasTS(196)) ret = ret.pow(20)	
	return ret
}

function sacrifice(auto = false) {
	if (player.eightAmount == 0) return false;
	if (player.resets < 5) return false
	if (player.currentEternityChall == "eterc3") return false
	var sacGain = calcSacrificeBoost()
	var maxPower = inNGM(2) ? "1e8888" : Number.MAX_VALUE
	if (inNC(11) && (tmp.sacPow.gte(maxPower) || player.chall11Pow.gte(maxPower))) return false
	if (!auto) floatText("D8", "x" + shortenMoney(sacGain))
	player.sacrificed = player.sacrificed.plus(player.firstAmount);
	if (!inNC(11)) {
		if ((inNC(7) || player.currentChallenge == "postcngm3_3" || player.pSac !== undefined) && !hasAch("r118")) clearDimensions(6);
		else if (!hasAch("r118")) clearDimensions(7);
	} else {
		player.chall11Pow = player.chall11Pow.times(sacGain)
		if (!hasAch("r118")) resetDimensions();
		setInitialMoney()
	}
	tmp.sacPow = tmp.sacPow.times(sacGain)
}

el("sacrifice").onclick = function () {
	if (player.eightAmount.eq(0)) return false
	if (!el("confirmation").checked) {
		if (!confirm("Dimensional Sacrifice will remove all of your First to Seventh Dimensions (with the cost and multiplier unchanged) for a boost to the Eighth Dimension. It will take time to regain production.")) {
			return false;
		}
	}
	auto = false;
	return sacrifice();
}

var ndAutobuyersUsed = 0
function updateAutobuyers() {
	var autoBuyerDim1 = new Autobuyer (1)
	var autoBuyerDim2 = new Autobuyer (2)
	var autoBuyerDim3 = new Autobuyer (3)
	var autoBuyerDim4 = new Autobuyer (4)
	var autoBuyerDim5 = new Autobuyer (5)
	var autoBuyerDim6 = new Autobuyer (6)
	var autoBuyerDim7 = new Autobuyer (7)
	var autoBuyerDim8 = new Autobuyer (8)
	var autoBuyerDimBoost = new Autobuyer (9)
	var autoBuyerGalaxy = new Autobuyer (el("secondSoftReset"))
	var autoBuyerTickspeed = new Autobuyer (el("tickSpeed"))
	var autoBuyerInf = new Autobuyer (el("bigcrunch"))
	var autoSacrifice = new Autobuyer(13)

	var ngpInterval = aarMod.newGamePlusVersion && 100

	if (aarMod.newGameExpVersion || tmp.bgMode || ngpInterval) {
		var dimInt = ngpInterval || 1000
		autoBuyerDim1.interval = dimInt
		autoBuyerDim2.interval = dimInt
		autoBuyerDim3.interval = dimInt
		autoBuyerDim4.interval = dimInt
		autoBuyerDim5.interval = dimInt
		autoBuyerDim6.interval = dimInt
		autoBuyerDim7.interval = dimInt
		autoBuyerDim8.interval = dimInt
	} else {
		autoBuyerDim1.interval = 1500
		autoBuyerDim2.interval = 2000
		autoBuyerDim3.interval = 2500
		autoBuyerDim4.interval = 3000
		autoBuyerDim5.interval = 4000
		autoBuyerDim6.interval = 5000
		autoBuyerDim7.interval = 6000
		autoBuyerDim8.interval = 7500
	}

	autoBuyerDimBoost.interval = 8000
	if (tmp.bgMode) autoBuyerDimBoost.interval = 1000
	if (ngpInterval) autoBuyerDimBoost.interval = ngpInterval
	if (player.infinityUpgradesRespecced) autoBuyerDimBoost.bulkBought = false

	autoBuyerGalaxy.interval = inNGM(2) ? 6e4 : 1.5e4
	if (tmp.bgMode) autoBuyerGalaxy.interval /= 10
	if (ngpInterval) autoBuyerGalaxy.interval = ngpInterval
	if (player.infinityUpgradesRespecced) autoBuyerGalaxy.bulkBought = false

	autoBuyerTickspeed.interval = 5000
	if (tmp.bgMode) autoBuyerTickspeed.interval = 1000
	if (ngpInterval) autoBuyerTickspeed.interval = ngpInterval

	autoBuyerInf.interval = inNGM(2) ? 6e4 : 3e5
	if (tmp.bgMode) autoBuyerInf.interval /= 10
	if (ngpInterval) autoBuyerInf.interval = ngpInterval
   	if (player.boughtDims) {
		autoBuyerInf.requireMaxReplicanti = false
		autoBuyerInf.requireIPPeak = false
	}

	autoSacrifice.interval = inNGM(2) ? 1.5e4 : player.infinityUpgradesRespecced ? 3500 : 100
	if (tmp.bgMode) autoSacrifice.interval /= 10
	if (ngpInterval) autoSacrifice.interval = ngpInterval
	autoSacrifice.priority = 5

	autoBuyerDim1.tier = 1
	autoBuyerDim2.tier = 2
	autoBuyerDim3.tier = 3
	autoBuyerDim4.tier = 4
	autoBuyerDim5.tier = 5
	autoBuyerDim6.tier = 6
	autoBuyerDim7.tier = 7
	autoBuyerDim8.tier = 8
	autoBuyerTickSpeed.tier = 9

	if (inNGM(2)) {
		var autoGalSacrifice = new Autobuyer(14)
		autoGalSacrifice.interval = 1.5e4
		if (tmp.bgMode) autoGalSacrifice.interval /= 10
		if (ngpInterval) autoGalSacrifice.interval = ngpInterval
		autoGalSacrifice.priority = 5
	}
	if (inNGM(3)) {
		var autoTickspeedBoost = new Autobuyer(15)
		autoTickspeedBoost.interval = 1.5e4
		if (tmp.bgMode) autoTickspeedBoost.interval /= 10
		if (ngpInterval) autoTickspeedBoost.interval = ngpInterval
		autoTickspeedBoost.priority = 5
	}
	if (inNGM(4)) {
		var autoTDBoost = new Autobuyer(16)
		autoTDBoost.interval = 1.5e4
		if (tmp.bgMode) autoTDBoost.interval /= 10
		if (ngpInterval) autoTDBoost.interval = ngpInterval
		autoTDBoost.priority = 5
		autoTDBoost.overXGals = 0
	}

    	if (player.challenges.includes("challenge1") && player.autobuyers[0] == 1) {
        	player.autobuyers[0] = autoBuyerDim1
        	el("autoBuyer1").style.display = "inline-block"
    	} else el("autoBuyer1").style.display = "none"
    	if (player.challenges.includes("challenge2") && player.autobuyers[1] == 2) {
        	player.autobuyers[1] = autoBuyerDim2
        	el("autoBuyer2").style.display = "inline-block"
    	} else el("autoBuyer2").style.display = "none"
    	if (player.challenges.includes("challenge3") && player.autobuyers[2] == 3) {
        	player.autobuyers[2] = autoBuyerDim3
        	el("autoBuyer3").style.display = "inline-block"
    	} else el("autoBuyer3").style.display = "none"
    	if (player.challenges.includes("challenge4") && player.autobuyers[9] == 10) {
        	player.autobuyers[9] = autoBuyerDimBoost
        	el("autoBuyerDimBoost").style.display = "inline-block"
    	} else {
        	el("autoBuyerDimBoost").style.display = "none"
        	el("buyerBtnDimBoost").style.display = ""
    	}
    	if (player.challenges.includes("challenge5") && player.autobuyers[8] == 9) {
        	player.autobuyers[8] = autoBuyerTickspeed
        	el("autoBuyerTickSpeed").style.display = "inline-block"
	} else {
        	el("autoBuyerTickSpeed").style.display = "none"
        	el("buyerBtnTickSpeed").style.display = ""
    	}
    	if (player.challenges.includes("challenge6") && player.autobuyers[4] == 5) {
        	player.autobuyers[4] = autoBuyerDim5
        	el("autoBuyer5").style.display = "inline-block"
    	} else el("autoBuyer5").style.display = "none"
    	if (player.challenges.includes("challenge7") && player.autobuyers[11] == 12) {
        	player.autobuyers[11] = autoBuyerInf
        	el("autoBuyerInf").style.display = "inline-block"
    	} else {
        	el("autoBuyerInf").style.display = "none"
        	el("buyerBtnInf").style.display = ""
    	}
    	if (player.challenges.includes("challenge8") && player.autobuyers[3] == 4) {
        	player.autobuyers[3] = autoBuyerDim4
        	el("autoBuyer4").style.display = "inline-block"
    	} else el("autoBuyer4").style.display = "none"
    	if (player.challenges.includes("challenge9") && player.autobuyers[6] == 7) {
        	player.autobuyers[6] = autoBuyerDim7
        	el("autoBuyer7").style.display = "inline-block"
    	} else el("autoBuyer7").style.display = "none"
    	if (player.challenges.includes("challenge10") && player.autobuyers[5] == 6) {
        	player.autobuyers[5] = autoBuyerDim6
        	el("autoBuyer6").style.display = "inline-block"
    	} else el("autoBuyer6").style.display = "none"
    	if (player.challenges.includes("challenge11") && player.autobuyers[7] == 8) {
        	player.autobuyers[7] = autoBuyerDim8
        	el("autoBuyer8").style.display = "inline-block"
    	} else el("autoBuyer8").style.display = "none"
    	if (player.challenges.includes("challenge12") && player.autobuyers[10] == 11) {
        	player.autobuyers[10] = autoBuyerGalaxy
        	el("autoBuyerGalaxies").style.display = "inline-block"
        	el("buyerBtnGalaxies").style.display = ""
    	} else el("autoBuyerGalaxies").style.display = "none"
    	if ((player.challenges.includes("postc2") || player.challenges.includes("challenge13") || player.challenges.includes("challenge16")) && player.autoSacrifice == 1) {
        	player.autoSacrifice = autoSacrifice
        	el("autoBuyerSac").style.display = "inline-block"
        	el("buyerBtnSac").style.display = ""
    	} else el("autoBuyerSac").style.display = "none"
    	if (player.challenges.includes("challenge14") && player.autobuyers[12] == 13) {
        	player.autobuyers[12] = autoGalSacrifice
        	el("autoBuyerGalSac").style.display = "inline-block"
        	el("buyerBtnGalSac").style.display = ""
    	} else el("autoBuyerGalSac").style.display = "none"
   	if (player.challenges.includes("challenge15") && player.autobuyers[13] == 14) {
        	player.autobuyers[13] = autoTickspeedBoost
        	el("autoBuyerTickspeedBoost").style.display = "inline-block"
        	el("buyerBtnTickspeedBoost").style.display = ""
    	} else el("autoBuyerTickspeedBoost").style.display = "none"
    	if (player.challenges.includes("challenge16") && player.autobuyers[14] == 15) {
        	player.autobuyers[14] = autoTDBoost
        	el("autoTDBoost").style.display = "inline-block"
		el("buyerBtnTDBoost").style.display = ""
    	} else el("autoTDBoost").style.display = "none"

	if (getEternitied() >= 100) el("autoBuyerEter").style.display = "inline-block"
    	else el("autoBuyerEter").style.display = "none"

	var intervalUnits = player.infinityUpgrades.includes("autoBuyerUpgrade") ? 1/2000 : 1/1000
	for (var tier = 1; tier <= 8; ++tier) {
		el("interval" + tier).textContent = "Current interval: " + (player.autobuyers[tier-1].interval * intervalUnits).toFixed(2) + " seconds"
	}
	el("intervalTickSpeed").textContent = "Current interval: " + (player.autobuyers[8].interval * intervalUnits).toFixed(2) + " seconds"
	el("intervalDimBoost").textContent = "Current interval: " + (player.autobuyers[9].interval * intervalUnits).toFixed(2) + " seconds"
	el("intervalGalaxies").textContent = "Current interval: " + (player.autobuyers[10].interval * intervalUnits).toFixed(2) + " seconds"
	el("intervalInf").textContent = "Current interval: " + (player.autobuyers[11].interval * intervalUnits).toFixed(2) + " seconds"
	el("intervalSac").textContent = "Current interval: " + (player.autoSacrifice.interval * intervalUnits).toFixed(2) + " seconds"
	if (inNGM(2)) el("intervalGalSac").textContent = "Current interval: " + (player.autobuyers[12].interval * intervalUnits).toFixed(2) + " seconds"
	if (inNGM(3)) el("intervalTickspeedBoost").textContent = "Current interval: " + (player.autobuyers[13].interval * intervalUnits).toFixed(2) + " seconds"
	if (inNGM(4)) el("intervalTDBoost").textContent = "Current interval: " + (player.autobuyers[14].interval * intervalUnits).toFixed(2) + " seconds"

		var reduction = Math.round(100 - getAutobuyerReduction() * 100)
    	var maxedAutobuy = 0;
    	var e100autobuy = 0;
    	var currencyEnd = inNGM(4) ? " GP" : " IP"
    	for (let tier = 1; tier <= 8; ++tier) {
        	el("toggleBtn" + tier).style.display = "inline-block";
        	if (player.autobuyers[tier-1].bulk >= 1e100) {
			player.autobuyers[tier-1].bulk = 1e100;
        		el("buyerBtn" + tier).textContent = shortenDimensions(player.autobuyers[tier-1].bulk)+"x bulk purchase";
        		e100autobuy++;
		} else {
			if (player.autobuyers[tier-1].interval <= 100) {
				if (player.autobuyers[tier-1].bulk * 2 >= 1e100) {
					el("buyerBtn" + tier).innerHTML = shortenDimensions(1e100)+"x bulk purchase<br>Cost: " + shortenDimensions(player.autobuyers[tier-1].cost) + currencyEnd;
				} else {
					el("buyerBtn" + tier).innerHTML = shortenDimensions(player.autobuyers[tier-1].bulk*2)+"x bulk purchase<br>Cost: " + shortenDimensions(player.autobuyers[tier-1].cost) + currencyEnd;
				}
				maxedAutobuy++;
			}
			else el("buyerBtn" + tier).innerHTML = reduction + "% smaller interval <br>Cost: " + shortenDimensions(player.autobuyers[tier-1].cost) + currencyEnd
		}
	}

	var b1 = 0
	for (let i = 0; i < 8; i++) if (player.autobuyers[i] % 1 !== 0 && player.autobuyers[i].bulk >= 512) b1++
	if (b1 == 8) giveAchievement("Bulked up")

	for (var i = 0; i <= 8; i++) el("priority" + (i + 1)).selectedIndex = player.autobuyers[i].priority - 1
	updateABBulks()

	if (player.autobuyers[8].interval <= 100) {
		el("buyerBtnTickSpeed").style.display = "none"
		el("toggleBtnTickSpeed").style.display = "inline-block"
		maxedAutobuy++;
	}

	if (player.autobuyers[11].interval <= 100) {
		el("buyerBtnInf").style.display = "none"
		maxedAutobuy++
	}

	if (canBreakInfinity()) {
		el("postinftable").style.display = "inline-block"
		el("breaktable").style.display = "inline-block"
		el("abletobreak").style.display = "none"
		el("break").style.display = "inline-block"
	} else {
		el("postinftable").style.display = "none"
		el("breaktable").style.display = "none"
		el("abletobreak").textContent = "You need to get Automated Big Crunch interval to 0.1 to be able to break infinity"
		el("abletobreak").style.display = "block"
		el("break").style.display = "none"
		el("break").textContent = "BREAK INFINITY"
	}

	if (player.autoSacrifice.interval <= 100) {
		el("buyerBtnSac").style.display = "none"
		if (inNGM(2) || player.infinityUpgradesRespecced) maxedAutobuy++;
	}

	el("buyerBtnTickSpeed").innerHTML = reduction + "% smaller interval <br>Cost: " + player.autobuyers[8].cost + currencyEnd
	el("buyerBtnDimBoost").innerHTML = reduction + "% smaller interval <br>Cost: " + player.autobuyers[9].cost + currencyEnd
	el("buyerBtnGalaxies").innerHTML = reduction + "% smaller interval <br>Cost: " + player.autobuyers[10].cost + currencyEnd
	el("buyerBtnInf").innerHTML = reduction + "% smaller interval <br>Cost: " + player.autobuyers[11].cost + " IP"
	el("buyerBtnSac").innerHTML = reduction + "% smaller interval <br>Cost: " + player.autoSacrifice.cost + currencyEnd
	if (player.autobuyers[9].interval <= 100) {
		if (player.infinityUpgradesRespecced && !player.autobuyers[9].bulkBought) el("buyerBtnDimBoost").innerHTML = "Buy bulk feature<br>Cost: "+shortenCosts(1e4)+currencyEnd
		else el("buyerBtnDimBoost").style.display = "none"
		maxedAutobuy++;
		if (!player.infinityUpgradesRespecced) delete player.autobuyers[9].bulkBought
	}
	if (player.autobuyers[10].interval <= 100) {
		if (player.infinityUpgradesRespecced && !player.autobuyers[10].bulkBought) el("buyerBtnGalaxies").innerHTML = "Buy bulk feature<br>Cost: "+shortenCosts(1e4)+currencyEnd
		else el("buyerBtnGalaxies").style.display = "none"
		maxedAutobuy++;
		if (!player.infinityUpgradesRespecced) delete player.autobuyers[10].bulkBought
	}

	el("autoGalMax").textContent = "Max Galaxies" + (tmp.ngp3_boost && getEternitied() >= 10 ? " (0 to max all galaxies)" : "") + ":"

	//NG-X Hell
	if (inNGM(2)) {
		el("buyerBtnGalSac").innerHTML = reduction + "% smaller interval <br>Cost: " + player.autobuyers[12].cost + currencyEnd
		if (player.autobuyers[12].interval <= 100) {
			el("buyerBtnGalSac").style.display = "none"
			maxedAutobuy++;
		}
	}
	if (inNGM(3)) {
		el("buyerBtnTickspeedBoost").innerHTML = reduction + "% smaller interval <br>Cost: " + player.autobuyers[13].cost + currencyEnd
		if (player.autobuyers[13].interval <= 100) {
			el("buyerBtnTickspeedBoost").style.display = "none"
			maxedAutobuy++;
		}
	}
	if (inNGM(4)) {
		el("buyerBtnTDBoost").innerHTML = reduction + "% smaller interval <br>Cost: " + player.autobuyers[14].cost + currencyEnd
		if (player.autobuyers[14].interval <= 100) {
			el("buyerBtnTDBoost").style.display = "none"
			maxedAutobuy++;
		}
	}

	if (maxedAutobuy >= 9) giveAchievement("Age of Automation");
	if (maxedAutobuy >= getTotalNormalChallenges() + 1) giveAchievement("Definitely not worth it");
	if (e100autobuy >= 8) giveAchievement("Professional bodybuilder");


	ndAutobuyersUsed = 0
	for (var i = 0; i < 8; i++) {
		if (player.autobuyers[i] % 1 !== 0) {
			el("autoBuyer" + (i + 1)).style.display = "inline-block"
			player.autobuyers[i].isOn = el((i + 1) + "ison").checked
			if (player.autobuyers[i].isOn) ndAutobuyersUsed++
		}
	}
	el("maxall").style.display = ndAutobuyersUsed >= 8 && player.challenges.includes("postc8") ? "none" : ""

	if (player.autobuyers[8] % 1 !== 0) el("autoBuyerTickSpeed").style.display = "inline-block"
	if (player.autobuyers[9] % 1 !== 0) el("autoBuyerDimBoost").style.display = "inline-block"
	if (player.autobuyers[10] % 1 !== 0) el("autoBuyerGalaxies").style.display = "inline-block"
	if (player.autobuyers[11] % 1 !== 0) el("autoBuyerInf").style.display = "inline-block"
	for (var i = 9; i <= 12; i++) player.autobuyers[i-1].isOn = el(i + "ison").checked
	if (player.autoSacrifice % 1 !== 0) {
		el("autoBuyerSac").style.display = "inline-block"
		player.autoSacrifice.isOn = el("13ison").checked
	}
	player.eternityBuyer.isOn = el("eternityison").checked

	//NG-X
	if (inNGM(2) && player.autobuyers[12] % 1 !== 0) {
		el("autoBuyerGalSac").style.display = "inline-block"
		player.autobuyers[12].isOn = el("14ison").checked
	}
	if (inNGM(3) && player.autobuyers[13] % 1 !== 0) {
		el("autoBuyerTickspeedBoost").style.display = "inline-block"
		player.autobuyers[13].isOn = el("15ison").checked
	}
	if (inNGM(4) && player.autobuyers[14] % 1 !== 0) {
		el("autoTDBoost").style.display = "inline-block"
		player.autobuyers[14].isOn = el("16ison").checked
	}

	//NG+3
	player.eternityBuyer.dilationMode = el("dilatedeternityison").checked
	player.eternityBuyer.dilationPerAmount = Math.max(parseInt(el("prioritydil").value), 1)
	player.eternityBuyer.statBeforeDilation = Math.min(player.eternityBuyer.statBeforeDilation, player.eternityBuyer.dilationPerAmount)

	if (qu_save && qu_save.autobuyer) qu_save.autobuyer.enabled = el("quantumison").checked
	priorityOrder()
}

function autoBuyerArray() {
	var tempArray = []
	for (var i=0; i<player.autobuyers.length && i<9; i++) {
		if (player.autobuyers[i]%1 !== 0 ) tempArray.push(player.autobuyers[i])
	}
	return tempArray;
}

var priority = []

function priorityOrder() {
	var tempArray = []
	var i = 1;
	while(tempArray.length != autoBuyerArray().length) {
		for (var x=0 ; x< autoBuyerArray().length; x++) {
			if (autoBuyerArray()[x].priority == i) tempArray.push(autoBuyerArray()[x])
		}
		i++;
	}
	priority = tempArray;
}

function fromValue(value) {
	value = value.replace(/,/g, '')
	let E=value.toUpperCase().split("E")
	if (E.length > 2 && value.split(" ")[0] !== value) {
		var temp = E(0)
		temp.mantissa = parseFloat(E[0])
		temp.exponent = parseFloat(E[1]+"e"+E[2])
	}
	if (value.includes(" ")) {
		const prefixes = [['', 'U', 'D', 'T', 'Qa', 'Qt', 'Sx', 'Sp', 'O', 'N'],
		['', 'Dc', 'Vg', 'Tg', 'Qd', 'Qi', 'Se', 'St', 'Og', 'Nn'],
		['', 'Ce', 'Dn', 'Tc', 'Qe', 'Qu', 'Sc', 'Si', 'Oe', 'Ne']]
		const prefixes2 = ['', 'MI', 'MC', 'NA', 'PC', 'FM', ' ']
		let e = 0;
		let m,k,l;
		if (value.split(" ")[1].length < 5) {
			for (l=101;l>0;l--) {
				if (value.includes(FormatList[l])) {
					e += l*3
					break
				}
			}
			return Decimal.fromMantissaExponent(parseInt(value.split(" ")[0]), e)
		}
		for (let i=1;i<5;i++) {
			if (value.includes(prefixes2[i])) {
				m = value.split(prefixes2[i])[1]
				for (k=0;k<3;k++) {
					for (l=1;l<10;l++) {
						if (m.includes(prefixes[k][l])) break;
					}
					if (l != 10) e += Math.pow(10,k)*l;
				}
				break;
			}
			return Decimal.fromMantissaExponent(value.split, e*3)
		}
		for (let i=1;i<=5;i++) {
			if (value.includes(prefixes2[i])) {
				for (let j=1;j+i<6;j++) {
					if (value.includes(prefixes2[i+j])) {
						m=value.split(prefixes2[i+j])[1].split(prefixes2[i])[0]
						if (m == "") e += Math.pow(1000,i);
						else {
							for (k=0;k<3;k++) {
								for (l=1;l<10;l++) {
									if (m.includes(prefixes[k][l])) break;
								}
								if (l != 10) e += Math.pow(10,k+i*3)*l;
							}
						}
						break;
					}
				}
			}
		}
		return Decimal.fromMantissaExponent(parseFloat(value), i*3+3)
	}
	if (!isFinite(parseFloat(value[value.length-1]))) { //needs testing
		const l = " abcdefghijklmnopqrstuvwxyz"
		const v = value.replace(parseFloat(value),"")
		let e = 0;
		for (let i=0;i<v.length;i++) {
			for (let j=1;j<27;j++) {
				if (v[i] == l[j]) e += Math.pow(26,v.length-i-1)*j
			}
		}
		return Decimal.fromMantissaExponent(parseFloat(value), e*3)
	}
	value = value.replace(',','')
	if (E[0] === "") return Decimal.fromMantissaExponent(Math.pow(10,parseFloat(E[1])%1), parseInt(E[1]))
	return Decimal.fromString(value)
}

let MAX_BULK = Math.pow(2, 512)
function doBulkSpent(res, scaling, bought, fixed, max, bgtFix) {
	//Log2 Skip
	let log2Skip = Math.pow(2,
		Math.max(
			Math.floor(Math.log2(
				Math.min(bgtFix || bought, max || 1/0)
			))
		- 20, 0)
	)

	//Set Max
	if (!max) max = MAX_BULK * log2Skip

	//Maximize (Multiply)
	let inc = log2Skip
	let pow32 = Math.pow(2, 32)
	while (inc <= max && c_gte(res, scaling(bought + inc * pow32 - 1))) inc *= pow32
	while (inc <= max && c_gte(res, scaling(bought + inc * 2 - 1))) inc *= 2

	//Maximize (Add)
	let toBuy = 0
	for (var p = 1; p < 53; p++) {
		if (toBuy + inc <= max && c_gte(res, scaling(bought + toBuy + inc - 1))) toBuy += inc
		inc /= 2

		if (inc < 1) break
	}

	//Sum-checking failsafe
	if (!fixed && toBuy <= Math.pow(2, 53)) {
		let num = toBuy
		let newRes = res
		while (num > 0 && num <= Math.pow(2, 53)) {
			let temp = newRes
			let cost = scaling(bought + num - 1)
			if (newRes.lt(cost)) {
				newRes = m_sub(res, cost)
				toBuy--
			} else newRes = m_sub(newRes, cost)
			if (c_eq(newRes, temp)) break
			num--
		}

		res = newRes
		if (res + 0 === res) {
			if (isNaN(newRes.e)) res = E(0)
		} else if (isNaN(newRes)) res = 0
	}

	return {res: res, toBuy: toBuy}
}

function updatePriorities() {
	auto = false;
	for (var x=0 ; x < autoBuyerArray().length; x++) {
		if (x < 9) autoBuyerArray()[x].priority = parseInt(el("priority" + (x+1)).value)
	}
	if (parseInt(el("priority10").value) === 69
	    || parseInt(el("priority11").value) === 69
	    || parseInt(fromValue(el("priority12").value).toString()) === 69
	    || parseInt(el("bulkDimboost").value) === 69
	    || parseInt(el("overGalaxies").value) === 69
	    || parseInt(fromValue(el("prioritySac").value).toString()) === 69
	    || parseInt(el("bulkgalaxy").value) === 69
	    || parseInt(fromValue(el("priority13").value).toString()) === 69
	    || parseInt(fromValue(el("priority14").value).toString()) === 69
	    || parseInt(el("overGalaxiesTickspeedBoost").value) === 69
	    || parseInt(el("bulkTickBoost").value) === 69
	    || parseInt(fromValue(el("priority15").value).toString()) === 69
	    || parseInt(el("prioritydil").value) === 69
	    || parseInt(fromValue(el("priorityquantum").value).toString()) === 69) giveAchievement("Nice.");
	player.autobuyers[9].priority = parseInt(el("priority10").value)
	player.autobuyers[10].priority = parseInt(el("priority11").value)
	const infValue = fromValue(el("priority12").value)
	if (!isNaN(break_infinity_js ? infValue : infValue.l)) player.autobuyers[11].priority = infValue
	else if (player.autoCrunchMode=="replicanti"&&el("priority12").value.toLowerCase()=="max") player.autobuyers[11].priority = el("priority12").value
	if (getEternitied() < 10 && !player.autobuyers[9].bulkBought) {
		var bulk = Math.floor(Math.max(parseFloat(el("bulkDimboost").value), 1))
	} else {
		var bulk = Math.max(parseFloat(el("bulkDimboost").value), 0.05)
	}
	player.autobuyers[9].bulk = (isNaN(bulk)) ? 1 : bulk
	player.overXGalaxies = parseInt(el("overGalaxies").value)
	const sacValue = fromValue(el("prioritySac").value)
	if (!isNaN(break_infinity_js ? sacValue : sacValue.l)) player.autoSacrifice.priority = Decimal.max(sacValue, 1.01)
	if (inNGM(2)) {
		const galSacValue = fromValue(el("priority14").value)
		if (!isNaN(break_infinity_js ? galSacValue : galSacValue.l)) player.autobuyers[12].priority = galSacValue
	}
	if (player.autobuyers[13]!=undefined) {
		player.autobuyers[13].priority = parseInt(el("priority15").value)
		player.overXGalaxiesTickspeedBoost = parseInt(el("overGalaxiesTickspeedBoost").value)
		player.autobuyers[13].bulk = Math.floor(Math.max(parseFloat(el("bulkTickBoost").value), 1))
		player.autobuyers[13].bulk = (isNaN(player.autobuyers[13].bulk)) ? 1 : player.autobuyers[13].bulk
	}
	if (player.autobuyers[14]!=undefined) {
		player.autobuyers[14].priority = parseInt(el("priority16").value)
		player.autobuyers[14].overXGals = parseInt(el("overGalaxiesTDBoost").value)
	}
	player.autobuyers[10].bulk = parseInt(el("bulkgalaxy").value)
	const eterValue = fromValue(el("priority13").value)
	if (!isNaN(break_infinity_js ? eterValue : eterValue.l)) {
		player.eternityBuyer.limit = eterValue
	}
	if (tmp.ngp3) {
		const dilValue = parseFloat(el("prioritydil").value)
		if (dilValue == Math.round(dilValue) && dilValue > 1) player.eternityBuyer.dilationPerAmount = dilValue
		if (player.eternityBuyer.dilationMode && player.eternityBuyer.statBeforeDilation <= 0) {
			dilateTime(true)
			return
		}
	
		player.eternityBuyer.alwaysDil = el("autoalwaysdil").checked
		if (!player.eternityBuyer.alwaysDil) player.eternityBuyer.alwaysDilCond = false
	
		const quantumValue = fromValue(el("priorityquantum").value)
		if (!isNaN(break_infinity_js ? quantumValue : quantumValue.l) && qu_save.autobuyer) qu_save.autobuyer.limit = quantumValue

		const autoDisableQuantum = parseFloat(el("priorityAutoDisableQuantum").value)
		if (autoDisableQuantum == Math.round(autoDisableQuantum) && autoDisableQuantum >= 0) qu_save.autobuyer.autoDisable = autoDisableQuantum
	}
	priorityOrder()
}

function updateCheckBoxes() {
	for (var i = 0; i < player.autobuyers.length; i++) {
		if (player.autobuyers[i]%1 !== 0) {
			var id = (i + (i > 11 ? 2 : 1)) + "ison"
			el(id).checked = player.autobuyers[i].isOn ? "true" : ""
		}
	}
	if (player.autoSacrifice.isOn) el("13ison").checked = "true"
	else el("13ison").checked = ""
	el("eternityison").checked = player.eternityBuyer.isOn

	el("dilatedeternityison").checked = player.eternityBuyer.dilationMode
	if (qu_save && qu_save.autobuyer) el("quantumison").checked = qu_save.autobuyer.enabled
}

function updateHotkeys() {
	let html = "Hotkeys: 1-8 to buy 10 Dimensions, shift+1-8 to buy 1 Dimension, T to buy max Tickspeed upgrades, shift+T to buy one Tickspeed upgrade, M to Max All,<br>S to Sacrifice"
	html += ", P to reset at latest unlocked layer"
	if (!hasAch("r136")) html += ", D to Dimension Boost"
	if (!hasAch("ng3p51")) {
		if (inNGM(3)) html += ", B to Tickspeed Boost"
		if (inNGM(4)) html += ", N to Time Dimension Boost"
		html += ", G to " + (pH.did("galaxy") ? "Galactic Sacrifice" : "buy a Galaxy")
	}
	html += ", C / I to Crunch, A to toggle autobuyers, R to buy Replicanti Galaxies, E to Eternity"
	if (hasAch("r136")) html += ", D to Dilate Time"
	if (hasAch("ngpp11")) html += ", shift+D to Meta-Dimension Boost"
	if (player.meta) html += ",<br>Q to Quantum"
	if (pH.can("fluctuate") || pH.did("fluctuate")) html += ", F to Fluctuate"
	if (hasAch("ng3p51")) html += ", B to Big Rip, G to become a ghost"
	html += "."
	if (player.boughtDims) html += "<br>You can hold Shift while buying time studies to buy all up until that point, see each study's number, and save study trees."
	html += "<br>Hotkeys do not work while holding the Control key (Ctrl). Hold the Shift key to see details on many formulas."
	el("hotkeysDesc").innerHTML = html
	//also uhh H for forcing achievement tooltip display update so yeah lol
}

var bestECTime
function updateEterChallengeTimes() {
	bestECTime=0
	var temp=0
	var tempcounter=0
	for (var i=1;i<15;i++) {
		setAndMaybeShow("eterchallengetime"+i,aarMod.eternityChallRecords[i],'"Eternity Challenge '+i+' time record: "+timeDisplayShort(aarMod.eternityChallRecords['+i+'], false, 3)')
		if (aarMod.eternityChallRecords[i]) {
			bestECTime=Math.max(bestECTime, aarMod.eternityChallRecords[i])
			temp+=aarMod.eternityChallRecords[i]
			tempcounter++
		}
	}
	el("eterchallengesbtn").style.display = tempcounter > 0 ? "inline-block" : "none"
	setAndMaybeShow("eterchallengetimesum",tempcounter>1,'"The sum of your completed Eternity Challenge time records is "+timeDisplayShort(' + temp + ', false, 3) + "."')
}

var averageEp = E(0)
var bestEp
function updateLastTenEternities() {
	var listed = 0
	var tempTime = E(0)
	var tempEP = E(0)
	for (var i=0; i<10; i++) {
		if (player.lastTenEternities[i][1].gt(0)) {
			var eppm = player.lastTenEternities[i][1].dividedBy(player.lastTenEternities[i][0]/600)
			var unit = player.lastTenEternities[i][2] ? player.lastTenEternities[i][2] == "b" ? "EM" : player.lastTenEternities[i][2] == "d2" ? "TP" : "EP" : "EP"
			var tempstring = "(" + rateFormat(eppm, unit) + ")"
			msg = "The Eternity " + (i == 0 ? '1 eternity' : (i+1) + ' eternities') + " ago took " + timeDisplayShort(player.lastTenEternities[i][0], false, 3)
			if (player.lastTenEternities[i][2]) {
				if (player.lastTenEternities[i][2] == "b") msg += " while it was broken"
				else if (player.lastTenEternities[i][2].toString().slice(0,1) == "d") msg += " while Dilated"
				else msg += " in Eternity Challenge " + player.lastTenEternities[i][2]
			}
			msg += " and gave " + shortenDimensions(player.lastTenEternities[i][1]) + " " + unit + ". " + tempstring
			el("eternityrun"+(i+1)).textContent = msg
			tempTime = tempTime.plus(player.lastTenEternities[i][0])
			tempEP = tempEP.plus(player.lastTenEternities[i][1])
			bestEp = player.lastTenEternities[i][1].max(bestEp)
			listed++
		} else el("eternityrun"+(i+1)).textContent = ""
	}
	if (listed > 1) {
		tempTime = tempTime.dividedBy(listed)
		tempEP = tempEP.dividedBy(listed)
		var eppm = tempEP.dividedBy(tempTime/600)
		var tempstring = "(" + rateFormat(eppm, "EP") + ")"
		averageEp = tempEP
		el("averageEternityRun").textContent = "Average time of the last " + listed + " Eternities: " + timeDisplayShort(tempTime, false, 3) + " | Average EP gain: " + shortenDimensions(tempEP) + " EP. " + tempstring
	} else el("averageEternityRun").textContent = ""
}

function addEternityTime(array) {
	for (var i=player.lastTenEternities.length-1; i>0; i--) {
		player.lastTenEternities[i] = player.lastTenEternities[i-1]
	}
	player.lastTenEternities[0] = array
}

function addTime(array) {
	for (var i=player.lastTenRuns.length-1; i>0; i--) {
		player.lastTenRuns[i] = player.lastTenRuns[i-1]
	}
	player.lastTenRuns[0] = array
}

function getLimit() {
	if (player.infinityUpgradesRespecced == undefined || player.currentChallenge != "") return Number.MAX_VALUE
	return Decimal.pow(Number.MAX_VALUE, 1 + player.infinityUpgradesRespecced[3] / 2)
}

function updateRespecButtons() {
	var className = player.respec ? "timestudybought" : "storebtn"
	el("respec").className = className
	el("respec2").className = className
	el("respec3").className = className

	className = player.respecMastery ? "timestudybought" : "storebtn"
	el("respecMastery").className = className
	el("respecMastery2").className = className
}

function eternity(force, auto, forceRespec, dilated = false) {
	var canEternity = force || ((forceRespec || pH.can("eternity")) && (auto || !player.options.eternityconfirm || confirm("Eternity will reset everything except achievements and challenge records. You will also gain an Eternity point and unlock various upgrades.")))
	if (!canEternity) return false

	if (force) player.currentEternityChall = ""
	else if (player.thisEternity < player.bestEternity) player.bestEternity = player.thisEternity

	if (player.thisEternity < 2) giveAchievement("Eternities are the new infinity")
	if (player.currentEternityChall == "eterc6" && ECComps("eterc6") < 5 && player.dimensionMultDecrease < 4) player.dimensionMultDecrease = Math.max(parseFloat((player.dimensionMultDecrease - 0.2).toFixed(1)),2)
	if ((player.currentEternityChall == "eterc11" || (player.currentEternityChall == "eterc12" && pH.did("ghostify"))) && ECComps("eterc11") < 5) player.tickSpeedMultDecrease = Math.max(parseFloat((player.tickSpeedMultDecrease - 0.07).toFixed(2)), 1.65)
	if (player.infinitied < 10 && !force && !player.boughtDims) giveAchievement("Do you really need a guide for this?");
	if (Decimal.round(player.replicanti.amount) == 9) giveAchievement("We could afford 9");
	if (player.dimlife && !force) giveAchievement("8 nobody got time for that")
	if (player.dead && !force) giveAchievement("You're already dead.")
	if (player.infinitied <= 1 && !force) giveAchievement("Do I really need to infinity")
	if (gainedEternityPoints().gte("1e600") && player.thisEternity <= 600 && player.dilation.active && !force) giveAchievement("Now you're thinking with dilation!")
	if (pH.did("ghostify") && player.currentEternityChall == "eterc11" && QCs.in(6) && QCs.in(8) && player.infinityPoints.e >= 15500) giveAchievement("The Deep Challenge")
	if (isEmptiness) {
		showTab("dimensions")
		isEmptiness = false
		pH.updateDisplay()
	}
	if (gainedEternityPoints().gte(player.eternityPoints) && player.eternityPoints.gte("1e1185") && (tmp.ngp3 ? player.dilation.active && player.quantum.bigRip.active : false)) giveAchievement("Gonna go fast")

	var oldEP = player.eternityPoints
	if (pH.can("eternity")) player.eternityPoints = player.eternityPoints.plus(gainedEternityPoints())
	if (player.eternityPoints.lt(1e16)) player.eternityPoints = player.eternityPoints.round()
	var array = [player.thisEternity, gainedEternityPoints()]
	if (player.dilation.active) array = [player.thisEternity, getTPGain().sub(player.dilation.totalTachyonParticles).max(0), "d2"]
	else if (player.currentEternityChall != "") array.push(player.eternityChallUnlocked)
	addEternityTime(array)

	player.thisEternity = 0
	forceRespec = doCheckECCompletionStuff() || forceRespec

	player.infinitiedBank = c_add(player.infinitiedBank, gainBankedInf())
	player.eternities = c_add(player.eternities, gainEternitiedStat())

	player.eternityChallGoal = E(Number.MAX_VALUE)
	player.currentEternityChall = ""

	if (player.dilation.active && (!force || player.infinityPoints.gte(Number.MAX_VALUE))) {
		let gain = getTPGain()
		if (gain.gte(player.dilation.totalTachyonParticles)) {
			if (player.dilation.totalTachyonParticles.gt(0) && gain.div(player.dilation.totalTachyonParticles).lt(2)) player.eternityBuyer.slowStopped = true
			if (tmp.ngp3) player.dilation.times = (player.dilation.times || 0) + 1
			player.dilation.totalTachyonParticles = gain
			setTachyonParticles(gain)
		}
	}
	if (!hasDilationStudy(1)) dilated = false
	else if (!force && !dilated) {
		if (player.eternityBuyer.dilationMode) {
			player.eternityBuyer.statBeforeDilation--
			if (player.eternityBuyer.statBeforeDilation <= 0) dilated = true
			if (player.eternityBuyer.alwaysDilCond) dilated = true
		}
	}
	if (dilated) {
		player.eternityBuyer.statBeforeDilation = player.eternityBuyer.dilationPerAmount
		player.eternityBuyer.alwaysDilCond = false
	}

	if (!force) {
		var autoOn = player.timestudy.auto && player.timestudy.auto.on
		if (autoOn && (player.respec || player.respecMastery)) {
			toggleAutoPreset()
			autoOn = false
		}

		var autoPreset = targetAutoPreset(dilated)
		var canSwitch = autoOn && player.timestudy.auto[autoPreset] && player.timestudy.auto[autoPreset] != "" && autoPresetUnlocked(autoPreset)
		if (autoOn && !player.timestudy.auto[autoPreset]) refreshAutoPreset(autoPreset)
		el("autoPresetTarget").textContent = "Assigning updates the preset you are choosing. (" + autoPresets[autoPreset] + ")"

		if (canSwitch) forceRespec = true
		if (player.respec || player.respecMastery || forceRespec) respecTimeStudies(forceRespec)
		if (canSwitch) loadAutoPreset(autoPreset)

		if (PCs.milestoneDone(62)) {
			metaDimsUpdating(3)
			replicantiIncrease(30)
		}
	}

	doEternityResetStuff(4, dilated ? "dil" : 0)
	doAfterEternityResetStuff()

	if (player.eternities <= 1) {
		showTab("dimensions")
		showDimTab("timedimensions")
		loadAutoBuyerSettings()
		pH.onPrestige("eternity")
	}
	doAutoEterTick()
	if (QCs.in(6)) QCs_save.qc6 = Math.max(QCs_save.qc6 - 30 / (player.dilation.active ? 2 : 1), QCs.perkActive(6) ? 0 : -30)
	if (tmp.ngp3) updateBreakEternity()
}

function doAfterEternityResetStuff() {
	if (getInfinitied() >= 1 && !player.challenges.includes("challenge1")) player.challenges.push("challenge1")
	var autobuyers = document.getElementsByClassName('autoBuyerDiv')
	if (getEternitied() < 2) {
		for (var i = 0; i < autobuyers.length; i++) autobuyers.item(i).style.display = "none"
		el("buyerBtnDimBoost").style.display = "inline-block"
		el("buyerBtnGalaxies").style.display = "inline-block"
		el("buyerBtnInf").style.display = "inline-block"
		el("buyerBtnTickSpeed").style.display = "inline-block"
		el("buyerBtnSac").style.display = "inline-block"
	}
	if (inNGM(2) && getEternitied() <= 1) player.autobuyers[12] = 13
	if (inNGM(3) && getEternitied() <= 1) player.autobuyers[13] = 14
	if (inNGM(4) && getEternitied() <= 1) player.autobuyers[14] = 15
	updateAutobuyers();
	updateChallenges()
	updateNCVisuals()
	updateLastTenRuns()

	if (getEternitied() > 0) {
		el("infmultbuyer").style.display = "inline-block"
		el("infmultbuyer").textContent = "Autobuy IP mult O" + (player.infMultBuyer ? "N" : "FF")
	}
	hideMaxIDButton()
	el("eternitybtn").style.display = "none"
	updateEternityUpgrades()
	el("totaltickgained").textContent = "You've gained "+getFullExpansion(player.totalTickGained)+" tickspeed upgrades."
	hideDimensions()
	tmp.tickUpdate = true;
	el("eternityPoints2").innerHTML = "You have <span class=\"EPAmount2\">"+shortenDimensions(player.eternityPoints)+"</span> Eternity point"+((player.eternityPoints.eq(1)) ? "." : "s.")
	Marathon2 = 0

	if (getEternitied() < 20) {
		player.autobuyers[9].bulk = 1
		el("bulkDimboost").value = player.autobuyers[9].bulk
	}
	if (getEternitied() < 50) {
		el("replicantidiv").style.display = "none"
		el("replicantiunlock").style.display = "inline-block"
	} else if (el("replicantidiv").style.display === "none" && getEternitied() >= 50) {
		el("replicantidiv").style.display = "inline-block"
		el("replicantiunlock").style.display = "none"
	}
	if (player.currentEternityChall == "eterc14") player.replicanti.amount = E(1)
	updateReplicantiTemp()

	EPminpeakType = 'normal'
	EPminpeak = E(0)

	giveAchievement("Time is relative")
	el("eternityconf").style.display = "inline-block"
	updateMilestones()
	updateLastTenEternities()
	updateEternityChallenges()
	updateEterChallengeTimes()

	resetUP()
}

function resetReplicantiUpgrades() {
	let keepPartial = moreEMsUnlocked() && getEternitied() >= tmp.ngp3_em[1]

	player.replicanti.chance = keepPartial ? Math.min(player.replicanti.chance, 1) : 0.01
	player.replicanti.chanceCost = Decimal.pow(1e15, player.replicanti.chance * 100).times((inNGM(2) && player.tickspeedBoosts == undefined) ? 1e75 : 1e135)

	player.replicanti.interval = keepPartial ? Math.max(player.replicanti.interval, hasTimeStudy(22) ? 1 : 50) : 1000
	player.replicanti.intervalCost = Decimal.pow(1e10, Math.round(Math.log10(1000 / player.replicanti.interval) / -Math.log10(0.9))).times((inNGM(2) && player.tickspeedBoosts == undefined) ? 1e80 : player.boughtDims ? 1e150 : 1e140)

	player.replicanti.gal = 0
	player.replicanti.galCost = E((inNGM(2) && player.tickspeedBoosts == undefined) ? 1e110 : 1e170)
	player.replicanti.galaxies = 0	

}

function challengesCompletedOnEternity() {
	var array = []
	var keepABs = getEternitied() > 1 || hasAch("ng3p12")
	for (i = 1; i <= getTotalNormalChallenges() + 1; i++) {
		if (keepABs) array.push("challenge" + i)
		else player.autobuyers[i] = i + 1
	}
	if (!keepABs) player.autobuyers[0] = 1

	player.postChallUnlocked = 0
	if (hasAch("r133") && (!tmp.ngp3 || tmp.bgMode || player.currentEternityChall == "")) {
		player.postChallUnlocked = order.length
		for (i = 0; i < order.length; i++) {
			var ic = order[i]
			array.push(ic)
		}
	}
	return array
}

function gainEternitiedStat() {
	var dtExp = getEternitiesAndDTBoostExp()
	var ret = f_mul([
		[hasTS(34) && tmp.ngC, 10],
		[hasTS(35) && tmp.ngC, () => tsMults[35]()],
		[hasAch("r132") && tmp.ngp3_boost, () => getInfBoostInput(player.infinitied).add(1).log10() / 5 + 1],
		[tmp.ngp3 && hasAch("ngpp18"), 10],
		[dtExp > 0, () => player.dilation.dilatedTime.max(1).pow(dtExp)],
		[tmp.ngC & dtExp > 0, () => Decimal.pow(player.dilation.tachyonParticles.plus(1).log10() + 1, dtExp)]
	])
	if (futureBoost("again_and_again") && dev.boosts.tmp[4]) ret = c_mul(ret, Decimal.pow(ret, dev.boosts.tmp[4] - 1))
	if (typeof(ret) == "number") ret = Math.floor(ret)
	return ret
}

function gainBankedInf() {
	let ret = 0 
	let numerator = player.infinitied
	if (qMs.tmp.amt >= 22 || hasAch("ng3p73")) numerator = c_add(getInfinitiedGain(), player.infinitied)
	let frac = 0.05
	if (hasTimeStudy(191)) ret = c_mul(numerator, frac)
	if (hasAch("r131")) ret = c_add(c_mul(numerator, frac), ret)
	if (player.exdilation != undefined) ret = c_mul(ret, getBlackholePowerEffect().pow(1/3))
	return ret
}

function exitChallenge() {
	if (inNGM(4) && player.galacticSacrifice.chall) {
		galacticSacrifice(false, true)
		showTab("dimensions")
		return
	}
	if (player.currentChallenge !== "") {
		startChallenge("")
		updateChallenges()
		return
	}
	if (player.currentEternityChall !== "") {
		player.currentEternityChall = ""
		player.eternityChallGoal = E(Number.MAX_VALUE)
		eternity(true)
		updateEternityChallenges()
		return
	}
	if (QCs.inAny()) {
		quantum(false, true)
		return
	}
}

function onChallengeFail() {
	el("challfail").style.display = "block"
	giveAchievement("You're a mistake")
	failureCount++
	if (failureCount > 9) giveAchievement("You're a failure")
}

function quickReset() {
	if (inNC(14)) if (player.tickBoughtThisInf.pastResets.length < 1) return
	if (player.resets > 0 && !(inNGM(2) && inNC(5))) player.resets--
	if (inNC(14)) {
		while (player.tickBoughtThisInf.pastResets.length > 0) {
			let entry = player.tickBoughtThisInf.pastResets.pop()
			if (entry.resets < player.resets) {
				// it has fewer resets than we do, put it back and we're done.
				player.tickBoughtThisInf.pastResets.push(entry);
				break;
			} else {
				// we will have at least this many resets, set our remaining tickspeed upgrades
				// and then throw the entry away
				player.tickBoughtThisInf.current = entry.bought;
			}
		}
	}
	softReset(0)
}

var blink = true
var nextAt
var goals
var order

function evalData(x, attrs, allowEval) {
	var type = typeof(x)
	return type == "string" && allowEval ? eval(x) : type == "function" ? (attrs ? x(attrs[0], attrs[1], attrs[2], attrs[3], attrs[4], attrs[5]) : x()) : x
}

function setAndMaybeShow(elementName, condition, contents) {
	var elem = el(elementName)
	var type = typeof(contents)
	if (condition) {
		elem.innerHTML = evalData(contents, null, true)
		elem.style.display = ""
	} else {
		elem.innerHTML = ""
		elem.style.display = "none"
	}
}

function runAutoSave() {
	if (!player) return
	if (!aarMod) return
	if (aarMod.autoSave) {
		autoSaveSeconds++
		if (autoSaveSeconds >= getAutoSaveInterval()) {
			save_game()
			autoSaveSeconds=0
		}
	}
}

function updateBlinkOfAnEye(){
	if (blink && !hasAch("r78")) {
		el("Blink of an eye").style.display = "none"
		blink = false
	}
	else {
		el("Blink of an eye").style.display = "block"
		blink = true
	}
}

function canQuickBigRip() {
	return false
}

function runIDBuyersTick(){
	if (getEternitied() > 10 && player.currentEternityChall !== "eterc8") {
		for (var i=1;i<getEternitied()-9 && i < 9; i++) {
			if (player.infDimBuyers[i-1]) {
				buyMaxInfDims(i, true)
				buyManyInfinityDimension(i, true)
			}
		}
	}
}

function crunchAnimationBtn(){
	if (player.infinitied !== 0 || getEternitied() !== 0 || pH.did("quantum")) el("bigCrunchAnimBtn").style.display = "inline-block"
	else el("bigCrunchAnimBtn").style.display = "none"
}

function TPAnimationBtn(){
	if (!player.dilation.tachyonParticles.eq(0) || pH.did("quantum")) el("tachyonParticleAnimBtn").style.display = "inline-block"
	else el("tachyonParticleAnimBtn").style.display = "none"
}

function dilAndBHDisplay() {
	el("dilationTabbtn").style.display = (hasDilationStudy(1)) ? "table-cell" : "none"
	el("blackHoleTabbtn").style.display = hasDilationStudy(1) && player.exdilation != undefined ? "table-cell" : "none"
	updateDilationUpgradeButtons()
}

function replicantiShopABRun() {
	if (getEternitied() >= 40 && (player.replicanti.auto[0]) && player.currentEternityChall !== "eterc8" && isChanceAffordable()) {
		var chance = Math.round(player.replicanti.chance * 100)
		var maxCost = hasMTS(265) ? 1 / 0 : E("1e1620").div(tmp.ngmX == 2 ? 1e60 : 1);
		var bought = Math.max(Math.floor(player.infinityPoints.min(maxCost).div(getRepChanceCost()).log(1e15) + 1), 0)
		if (!hasMTS(265)) bought = Math.min(bought, 100 - chance)
		player.replicanti.chance = (chance + bought) / 100
		player.replicanti.chanceCost = player.replicanti.chanceCost.times(Decimal.pow(1e15, bought))
	}

	if (getEternitied() >= 60 && (player.replicanti.auto[1]) && player.currentEternityChall !== "eterc8") {
		while (player.infinityPoints.gte(player.replicanti.intervalCost) && player.currentEternityChall !== "eterc8" && isIntervalAffordable()) upgradeReplicantiInterval()
	}

	if (getEternitied() >= 80 && (player.replicanti.auto[2]) && player.currentEternityChall !== "eterc8") autoBuyRG()
}

function failedEC12Check(){
	if (player.currentEternityChall == "eterc12" && player.thisEternity >= getEC12TimeLimit()) {
		setTimeout(exitChallenge, 500)
		onChallengeFail()
	}
}

function updateNGpp17Reward(){
	el('epmultauto').style.display=hasAch("ngpp17")?"":"none"
	for (i=1;i<9;i++) el("td"+i+'auto').style.visibility=hasAch("ngpp17")?"visible":"hidden"
	el('togglealltimedims').style.visibility=hasAch("ngpp17")?"visible":"hidden"
}

function updateNGpp16Reward(){
	el('replicantibulkmodetoggle').style.display = (hasAch(tmp.ngp3_boost ? "r134" : "ngpp16") || (tmp.ngC && player.eternityUpgrades.includes(6))) ? "inline-block" : "none"
}

function notifyQuantumMilestones(){
	var amt = fluc.unl() ? 27 : Math.min(qMs.tmp.amt, 27)
	if (typeof notifyId == "undefined") notifyId = amt
	if (amt > notifyId) {
		notifyId = amt
		$.notify("You have got a total of " + qMs[notifyId].req + " Milestone Points! " + qMs[notifyId].effGot(), "success")
	}
}

function notifyGhostifyMilestones(){
	if (typeof notifyId2 == "undefined") notifyId2 = 16
	if (notifyId2 <= 0) notifyId2 = 0
	if (player.ghostify.milestones > notifyId2) {
		$.notify("You became a ghost in at most "+getFullExpansion(tmp.bm[notifyId2])+"x quantumed stat! "+(["You now start with all Speedrun Milestones and all "+shorten(Number.MAX_VALUE)+" QK assignation features unlocked, all Paired Challenges completed, all Big Rip upgrades bought, and you get quarks based on your best MA this quantum", "From now on, colored quarks do not cancel, you keep your gluon upgrades, you can quick Big Rip, and completing an Eternity Challenge doesn't respec your Time Studies.", "???", "From now on, Quantum doesn't reset your Tachyon particles unless you are in a QC, and unstabilizing quarks doesn't lose your colored quarks.", "From now on, Quantum doesn't reset your Meta-Dimension Boosts unless you are in a QC or undoing Big Rip", "From now on, Quantum doesn't reset your normal replicants unless you are in a QC or undoing Big Rip", "You now start with 10 worker replicants and Ghostify now doesn't reset Neutrinos.", "You are now gaining ^0.5 amount of quarks, ^0.5 amount of gluons, and 1% of Space Shards gained on Quantum per second.", "You now start with 10 Emperor Dimensions of each tier up to the second tier"+(aarMod.ngudpV?", and from now on, start Big Rips with the 3rd row of Eternity Upgrades":""), "You now start with 10 Emperor Dimensions of each tier up to the fourth tier", "You now start with 10 Emperor Dimensions of each tier up to the sixth tier, and the IP multiplier no longer costs IP", "You now start with 10 of each Emperor Dimension", "You now start with 16 Nanofield rewards", "You now start with "+shortenCosts(1e25)+" quark spins, and Branches are faster based on your spins", "You now start with Break Eternity unlocked and all Break Eternity upgrades bought and generate 1% of Eternal Matter gained on Eternity per second", "From now on, you gain 1% of quarks you will gain per second and you keep your Tachyon particles on Quantum and Ghostify outside of Big Rip."])[notifyId2]+".","success")
		notifyId2++
	}
}

function dilationStuffABTick(){
	var canAutoUpgs = canAutoDilUpgs()
	el('dilUpgsauto').style.display = canAutoUpgs ? "" : "none"
	el('distribEx').style.display = hasAch("ngud14") && aarMod.nguspV !== undefined ? "" : "none"

	if (isGamePaused()) return
	if (canAutoUpgs && player.autoEterOptions.dilUpgs) autoBuyDilUpgs()
	if (qMs.isObtained(21) && player.dilation.active && getTPGain().gt(player.dilation.tachyonParticles)) {
		setTachyonParticles(getTPGain())
		player.eternityBuyer.alwaysDilCond = false
	}
}

function doBosonsUnlockStuff() {
	player.ghostify.wzb.unl=true
	$.notify("Congratulations! You have unlocked Bosonic Lab!", "success")
	giveAchievement("Even Ghostlier than before")
	updateTmp()
	updateNeutrinoBoosts()
	updateBLUnlocks()
	updateBosonicLimits()
}

function doPhotonsUnlockStuff(){
	player.ghostify.ghostlyPhotons.unl=true
	$.notify("Congratulations! You have unlocked Ghostly Photons!", "success")
	giveAchievement("Progressing as a Ghost")
	updateTmp()
	QCs.updateDisp()
	updateBreakEternity()
	updateGPHUnlocks()
}

function inEasierMode() {
	return aarMod.newGameMult || aarMod.newGameExpVersion || aarMod.ngudpV || aarMod.ngumuV || aarMod.nguepV || aarMod.aau || aarMod.ls
}

function doBreakEternityUnlockStuff(){
	qu_save.breakEternity.unlocked = true
	$.notify("Congratulations! You have unlocked Break Eternity!", "success")
	updateBreakEternity()
}

function doGhostifyUnlockStuff(){
	player.ghostify.reached = true
	if (el("welcome").style.display != "flex") el("welcome").style.display = "flex"
	else aarMod.popUpId = ""
	el("welcomeMessage").innerHTML = "You are finally able to complete PC6+8 in Big Rip! However, because of the unstability of this universe, the only way to go further is to become a ghost. This allows you to pass Big Rip universes and unlock new stuff in Ghostify in exchange for everything that you have. Therefore, this is the sixth layer of NG+3."
}

function doQuantumUnlockStuff(){
	qu_save.reached = true
	if (el("welcome").style.display != "flex") el("welcome").style.display = "flex"
	else aarMod.popUpId = ""
	el("welcomeMessage").innerHTML = "Congratulations! You reached " + shorten(getQuantumReq()) + " MA and completed EC14 for the first time! This allows you to go Quantum (the 5th layer), giving you a quark in exchange for everything up to this point, which can be used to get more powerful upgrades. This allows you to get gigantic numbers!"
}

function doNGP3UnlockStuff(){
	if (!qu_save.reached && isQuantumReached()) doQuantumUnlockStuff()

	var inEasierModeCheck = !inEasierMode()
	if (player.eternityPoints.gte("1e1200") && qu_save.bigRip.active && !qu_save.breakEternity.unlocked) doBreakEternityUnlockStuff()
	if (tmp.quActive) {
		if (!player.ghostify.reached && qu_save.bigRip.active && qu_save.bigRip.bestThisRun.gte(Decimal.pow(10, QCs.getGoalMA(undefined, true)))) doGhostifyUnlockStuff()
		if (!player.ghostify.ghostlyPhotons.unl && qu_save.bigRip.active && qu_save.bigRip.bestThisRun.gte(Decimal.pow(10, 6e9))) doPhotonsUnlockStuff()
		if (!player.ghostify.wzb.unl && canUnlockBosonicLab()) doBosonsUnlockStuff()
	}
}

function updateResetTierButtons(){
	pH.updateDisplay()

	if (pH.did("ghostify")) {
		el("GHPAmount").textContent = shortenDimensions(player.ghostify.ghostParticles)
		var showQuantumed = player.ghostify.times > 0 && player.ghostify.milestones < 16
		el("quantumedBM").style.display = showQuantumed ? "" : "none"
		if (showQuantumed) el("quantumedBMAmount").textContent = getFullExpansion(qu_save.times)
	}
}

function updateOrderGoals(){
	el("postc6desc").textContent = "Reward: Tickspeed affects Infinity Dimensions with reduced effect" + (tmp.ngC ? ", and the IP gain softcap is 75% weaker." : ".")
	if (order) for (var i=0; i<order.length; i++) el(order[i]+"goal").textContent = "Goal: "+shortenCosts(getGoal(order[i]))
}

function updateReplicantiGalaxyToggels(){
	if (getEternitied() < 3 || player.boughtDims) el("replicantiresettoggle").style.display = "none"
	else el("replicantiresettoggle").style.display = "inline-block"
}

function givePerSecondNeuts(){
	if (!hasAch("ng3p75")) return
	var mult = 1 //in case you want to buff in the future
	var n = getNeutrinoGain().times(mult)
	player.ghostify.neutrinos.electron = player.ghostify.neutrinos.electron.plus(n)
	player.ghostify.neutrinos.mu       = player.ghostify.neutrinos.mu.plus(n)
	player.ghostify.neutrinos.tau      = player.ghostify.neutrinos.tau.plus(n)
}

function doPerSecondNGP3Stuff(){
	if (!tmp.ngp3) return

	if (PCs.milestoneDone(13)) QCs.data[1].autoExpand()

	doNGP3UnlockStuff()
	notifyGhostifyMilestones()
	ghostifyAutomationUpdatingPerSecond()
	if (qu_save.autoOptions.assignQK) distributeQK(true)

	givePerSecondNeuts()
}

function ghostifyAutomationUpdatingPerSecond() {
	if (!isAutoGhostsSafe) return

	//Ghostify Layer
	//Priorities: Light Empowerment -> Rest
	if (player.ghostify.ghostlyPhotons.unl && isAutoGhostActive(23)) lightEmpowerment(true)
	if (player.ghostify.wzb.unl && isAutoGhostActive(20)) buyMaxBosonicUpgrades()
	if (isAutoGhostActive(16)) {
		maxNeutrinoMult()
		maxGHPMult()
	}

	//Quantum Layer
	if (!tmp.quUnl) return
	if (isAutoGhostActive(14)) maxBuyBEEPMult()
}

function checkGluonRounding(){
	if (!tmp.ngp3) return
	if (player.ghostify.milestones > 7 || !pH.did("quantum")) return
	if (qu_save.gluons.rg.lte(100)) qu_save.gluons.rg = qu_save.gluons.rg.round()
	if (qu_save.gluons.gb.lte(100)) qu_save.gluons.gb = qu_save.gluons.gb.round()
	if (qu_save.gluons.br.lte(100)) qu_save.gluons.br = qu_save.gluons.br.round()
	if (qu_save.quarks.lte(100)) qu_save.quarks = qu_save.quarks.round()
}

function doNGm2CorrectPostC3Reward(){
	return
	/*
	this should be for testing purposes only so i can properly hack in TDB/DB

	player.postC3Reward = Decimal.pow(getIC3Mult(), getInitPostC3Power() + player.tickspeedMultiplier.div(10).log(getTickSpeedCostMultiplierIncrease()))
	*/
}

let autoSaveSeconds=0
setInterval(function() {
	updateTmp()
	runAutoSave()
	if (!player) return

	//Achieve:
	cantHoldInfinitiesCheck()
	antitablesHaveTurnedCheck()
	updateBlinkOfAnEye()
	ALLACHIEVECHECK()
	bendTimeCheck()
	bWtAchMultLabelUpdate()

	// AB Display
	updateReplicantiGalaxyToggels()
	ABTypeDisplay()
	dimboostABTypeDisplay()
	IDABDisplayCorrection()
	replicantiShopABDisplay()

	// AB Stuff
	autoPerSecond()

	// Button Displays
	infPoints2Display()
	eterPoints2Display()
	updateResetTierButtons()
	updateQuarkDisplay()
	if (tmp.ngp3) fluc.updateHeader()
	primaryStatsDisplayResetLayers()
	crunchAnimationBtn()
	TPAnimationBtn()
	dilAndBHDisplay()

	// EC Stuff
	ECCompletionsDisplay()
	ECchallengePortionDisplay()
	updateECUnlockButtons()
	EC8PurchasesDisplay()
 	failedEC12Check()

	// Other 
	moveAutoTabs()
	isEmptinessDisplayChanges()
	DimBoostBulkDisplay()
	updateChallTabDisplay()
	updateOrderGoals()
	handleReplTabs()
	bankedInfinityDisplay()
	if (tmp.quUnl) {
		qMs.update()
		qMs.updateDisplay()
	}
	notifyQuantumMilestones()
	updateQuantumWorth()
	updateNGM2RewardDisplay()
	updateGalaxyUpgradesDisplay()
	updateTimeStudyButtons(false, true)
	updateHotkeys()
	updateSoftcapStatsTab()
	doNGm2CorrectPostC3Reward()

	//Rounding errors
	if (isNaN(player.totalmoney.e)) player.totalmoney = E(10)
	if (!tmp.ngp3 || !pH.did("quantum")) if (player.infinityPoints.lt(100)) player.infinityPoints = player.infinityPoints.round()
	checkGluonRounding()
}, 1000)

function autoPerSecond() {
	dilationStuffABTick()

	if (isGamePaused()) return

	if (qMs.tmp.amt < 20) {
		replicantiShopABRun()
		runIDBuyersTick()
	}
	doAutoEterTick()
	updateNGpp17Reward()
	updateNGpp16Reward()
	doPerSecondNGP3Stuff()
}

var postC2Count = 0;
var IPminpeak = E(0)
var EPminpeakType = 'normal'
var EPminpeak = E(0)
var replicantiTicks = 0
var isSmartPeakActivated = false

function updateEPminpeak(diff, type) {
	if (type == "EP") {
		var gainedPoints = gainedEternityPoints()
		var oldPoints = player.eternityPoints
	} else if (type == "TP") {
		var gainedPoints = getTPGain().sub(player.dilation.totalTachyonParticles).max(0)
		var oldPoints = player.dilation.totalTachyonParticles
	} else {
		var gainedPoints = getEMGain()
		var oldPoints = qu_save.breakEternity.eternalMatter
	}
	var newPoints = oldPoints.plus(gainedPoints)
	var newLog = Math.max(newPoints.log10(),0)
	var minutes = player.thisEternity / 600
	if (newLog > 1000 && EPminpeakType == 'normal') {
		EPminpeakType = 'logarithm'
		EPminpeak = E(0)
	}
	// for logarithm, we measure the amount of exponents gained from current
	var currentEPmin = (EPminpeakType == 'logarithm' ? E(Math.max(0, newLog - Math.max(oldPoints.log10(), 0))) : gainedPoints).dividedBy(minutes)
	if (currentEPmin.gt(EPminpeak) && player.infinityPoints.gte(Number.MAX_VALUE)) EPminpeak = currentEPmin
	return currentEPmin;
}

function checkMatter(diff){
	let pow = 0
	if (inNC(12) || player.currentChallenge == "postc1") pow = 1
	if (player.currentChallenge == "postc6") pow = 20

	if (pow > 0) {
		if (isNaN(player.matter.e)) player.matter = E(0)
		if (getAmount(1) > 0) player.matter = player.matter.max(1).times(Decimal.pow(tmp.mv, diff))
		if (player.matter.pow(pow).gt(player.money)) quickReset()
	}
}

function passiveIPupdating(diff) {
	if (player.infinityUpgrades.includes("passiveGen")) player.partInfinityPoint += diff / player.bestInfinityTime * 10
	else player.partInfinityPoint = 0
	if (player.bestInfinityTime == 9999999999) player.partInfinityPoint = 0
	let x = Math.floor(player.partInfinityPoint / 10)
	player.partInfinityPoint -= x * 10
	player.infinityPoints = player.infinityPoints.plus(getIPMult().times(x));
}

function passiveInfinitiesUpdating(diff){
	let tempPA = player.partInfinitied || 0
	if (player.infinityUpgrades.includes("infinitiedGeneration") && player.currentEternityChall !== "eterc4") {
		let gain = diff / player.bestInfinityTime;
		if (player.eternities>0) gain = diff / 50;
		if (hasTS(35) && tmp.ngC) gain = c_mul(gain, getInfinitiedGain());
		tempPA = c_add(tempPA, gain);
	}
	if (c_gt(tempPA, 1/2)) {
		let x = Decimal.floor(c_mul(tempPA, 2))
		tempPA = c_sub(tempPA, c_div(x, 2))
		player.infinitied = c_add(player.infinitied || 0, x);
	}
	player.partInfinitied = Math.max(Math.min(E(tempPA||0).toNumber(), 1), 0);
}

function infinityRespeccedDMUpdating(diff){
	var prod = getDarkMatterPerSecond()
	player.singularity.darkMatter = player.singularity.darkMatter.add(getDarkMatterPerSecond().times(diff))
	if (prod.gt(0)) tmp.tickUpdate = true
	if (player.singularity.darkMatter.gte(getNextDiscounts())) {
		player.dimtechs.discounts++
		for (d=1;d<9;d++) {
			var name = TIER_NAMES[d]
			player[name+"Cost"] = player[name+"Cost"].div(getDiscountMultiplier("dim" + d))
		}
		player.tickSpeedCost = player.tickSpeedCost.div(getDiscountMultiplier("tick"))
	}
}

function changingDecimalSystemUpdating(){
	el("decimalModeBtn").style.visibility = "hidden"
	if (break_infinity_js) {
		player.totalmoney = Decimal.pow(10, 9e15 - 1)
		player.money = player.totalmoney
		clearInterval(gameLoopIntervalId)
		alert("You have reached the limit of break_infinity.js. In order for the game to continue functioning, the game will switch the library to logarithmica_numerus.js, requiring a game reload, but will have a higher limit. You cannot change libraries for this save again in the future.")
		aarMod.breakInfinity = !aarMod.breakInfinity
		save_game(true)
		document.location.reload(true)
		return
	}
}

function incrementTimesUpdating(diffStat){
	player.totalTimePlayed += diffStat

	if (qu_save && implosionCheck !== 2) qu_save.time += diffStat
	if (QCs.done(1) || pH.did("fluctuate")) {
		QCs_save.qc1.time += diffStat
		QCs_save.qc1.timeLast += diffStat
	}
	if (QCs.in(8)) {
		QCs_save.qc8.time += diffStat
		if (QCs_save.qc8.time > 50) {
			QCs_save.qc8.time = 0
			QCs.data[8].switch()
			if (tmp.ri) bigCrunch(true)
		}
	}

	if (player.currentEternityChall == "eterc12") diffStat /= 1e3
	player.thisEternity += diffStat * (QCs.perkActive(6) ? 0.5 : 1)
   	player.thisInfinityTime += diffStat
	if (inNGM(2)) player.galacticSacrifice.time += diffStat
	if (player.pSac) player.pSac.time += diffStat
	failsafeDilateTime = false
}

function normalDimUpdating(diff){
	if (!QCs.in(3)) {
		let steps = getDimensionSteps()
		let dims = getMaxGeneralDimensions()
		for (let tier = dims - steps; tier >= 1; tier--) {
			var name = TIER_NAMES[tier];
			player[name + 'Amount'] = player[name + 'Amount'].plus(getDimensionProductionPerSecond(tier + steps).times(diff / 10))
		}
		if (tmp.ngp3 && player.firstAmount.gt(0)) player.dontWant = false
	}

	var amProd = QCs.in(3) ? QCs.data[3].amProd() : getDimensionProductionPerSecond(1)
	amProd = amProd.times(diff)
	player.money = player.money.plus(amProd)
	player.totalmoney = player.totalmoney.plus(amProd)
	if (fluc.unl()) fluc_save.bestAM = player.money.max(fluc_save.bestAM)
}

function checkForInfinite() {
	if (isInfiniteDetected()) return
	if (player.totalmoney.gt("1e9000000000000000")) changingDecimalSystemUpdating()
	tmp.ri = player.money.gte(getLimit()) && ((player.currentChallenge != "" && player.money.gte(player.challengeTarget)) || !onPostBreak())
}

function chall2PowerUpdating(diff){
	var div = 180
	if (inNGM(5)) div /= puMults[11](hasPU(11, true, true))
	if (tmp.ngmR) div /= 100
	player.chall2Pow = Math.min(player.chall2Pow + diff / div, 1);
}

function normalChallPowerUpdating(diff){
	if (player.currentChallenge == "postc8") player.postC8Mult = player.postC8Mult.times(Math.pow(0.000000046416, diff))

	if (inNC(3) || player.matter.gte(1)) player.chall3Pow = player.chall3Pow.times(Decimal.pow(1.00038, diff)).min(1e200);

	if (inNC(2) || player.currentChallenge == "postc1" || tmp.ngmR || inNGM(5)) chall2PowerUpdating(diff)

	if (player.currentChallenge == "postc2") {
		postC2Count++;
		if (postC2Count >= 8 || diff > 80) {
			sacrifice();
			postC2Count = 0;
		}
	}
}

function incrementParadoxUpdating(diff) {
	if (inNGM(5)) {
		//Paradox Power
		player.pSac.dims.power=player.pSac.dims.power.add(getPDProduction(1).times(diff))
		for (var t=1;t<7;t++) {
			if (!isDimUnlocked(t+2)) break
			player.pSac.dims[t].amount=player.pSac.dims[t].amount.add(getPDProduction(t+2).times(diff))
		}
		if (player.pSac.dims.power.gte(1e10)) giveAchievement("Time Paradox")
	}
}

function dimensionButtonDisplayUpdating() {
	el("pdtabbtn").style.display = pH.shown("paradox") && player.galacticSacrifice.times >= 25 ? "" : "none"
   	el("idtabbtn").style.display = ((player.infDimensionsUnlocked[0] || pH.did("eternity")) && (inNGM(5) || pH.shown("infinity"))) ? "" : "none"
	el("tdtabbtn").style.display = (pH.shown("eternity") || inNGM(4)) ? "" : "none"
	el("mdtabbtn").style.display = (!pH.did("quantum") || pH.shown("quantum")) && hasDilationStudy(6) ? "" : "none"
	el("fdtabbtn").style.display = pH.shown("fluctuate") ? "" : "none"
	el('toggleallmetadims').style.display = moreEMsUnlocked() && (pH.did("quantum") || getEternitied() >= tmp.ngp3_em[3]) ? "" : "none"
}

function ghostifyAutomationUpdating(diff){
	if (!isAutoGhostsSafe) return

	//Ghostify Layer
	if (player.ghostify.wzb.unl) {
		if (isAutoGhostActive(17)) {
			let ag = player.ghostify.automatorGhosts[17]

			let change = getRemainingExtractTime().gte(ag.s || 60)
			if (!change) change = ag.oc && ag.t >= 1 / (hasAch("ng3p103") ? 10 : 1)
			if (change) changeTypeToExtract(tmp.bl.typeToExtract % br.limit + 1)

			if (!tmp.bl.extracting) extract()
		}
		if (isAutoGhostActive(21)) {
			let data = player.ghostify.wzb
			let hasWNB = data.wnb.gt(0)

			if (data.dPUse == 0 && data.dP.gt(0)) useAntipreon(hasWNB ? 3 : 1)
			if (data.dPUse == 1) useAntipreon(hasWNB ? 3 : 2)
			if (data.dPUse == 2) useAntipreon(1)
			if (data.dPUse == 3 && !hasWNB) useAntipreon(2)
		}
	}
	if (isAutoGhostActive(19)) {
		let ag = player.ghostify.automatorGhosts[19]
		let perSec = (hasAch("ng3p103") ? 10 : 1) / 2
		ag.t = (ag.t || 0) + diff * perSec
		let times = Math.floor(ag.t)
		if (times > 0) {
			let max = times
			if (isEnchantUsed(35)) max = tmp.bEn[35].times(max)
			autoMaxAllEnchants(max)
			ag.t = ag.t - times
		}
	}
	if (isAutoGhostActive(15) && hasNU(16) && getGHPGain().gte(player.ghostify.automatorGhosts[15].a)) ghostify(true)

	//Quantum Layer
	if (!tmp.quUnl) return

	let limit = player.ghostify.automatorGhosts[13].o || 1 / 0
	if (hasMTS("d14") && isAutoGhostActive(13)) {
		if (qu_save.bigRip.active) {
			if (qu_save.time >= player.ghostify.automatorGhosts[13].u * 10 && qu_save.bigRip.times <= limit) quantumReset(true, true)
		} else if (qu_save.time >= player.ghostify.automatorGhosts[13].t * 10 && qu_save.bigRip.times < limit) bigRip(true)
	}
}

function WZBosonsUpdating(diff){
	diff *= ls.mult("bl")

	player.ghostify.automatorGhosts[17].t += diff

	var data = tmp.bl
	var wattGain = E(getBosonicWattGain())
	if (wattGain.gt(data.watt)) {
		if (wattGain.gt(data.speed)) data.speed = wattGain.sub(data.watt).times(10).add(data.speed).min(wattGain)
		data.watt = wattGain
	}

	if (data.speed > 0) {
		var limitDiff = data.speed.times(14400).min(diff).toNumber()
		bosonicTick(data.speed.sub(limitDiff / 28800).times(limitDiff))
		data.speed = data.speed.max(limitDiff / 14400).sub(limitDiff / 14400)
	}
}

function ghostlyPhotonsUpdating(diff){
	var data = player.ghostify.ghostlyPhotons
	data.amount = data.amount.add(getGPHProduction().times(diff))
	data.darkMatter = data.darkMatter.add(getDMProduction().times(diff))
	data.ghostlyRays = data.ghostlyRays.add(getGHRProduction().times(diff)).min(getGHRCap())

	for (var c = 0; c < 8; c++) {
		if (data.ghostlyRays.gte(getLightThreshold(c))) {
			data.lights[c] += Math.floor(data.ghostlyRays.div(getLightThreshold(c)).log(getLightThresholdIncrease(c)) + 1)
			tmp.updateLights = true
		}
	}
	data.maxRed = Math.max(data.lights[0], data.maxRed)
}

function quantumOverallUpdating(diff){
	if (tmp.quActive) {
		//Quantum Challenges
		if (QCs.in(6)) QCs_save.qc6 = Math.min(QCs_save.qc6 + diff / (player.dilation.active ? 2 : 1), 60)

		//Quantum Energy
		gainQuantumEnergy()

		//Color Powers
		for (var c = 0; c < 3; c++) qu_save.colorPowers[colors[c]] = getColorPowerQuantity(colors[c])

		if (str.unl()) str.updateFeatureOnTick() //Strings
	}
}

function specialDimUpdating(diff){
	var step = inNGM(5) ? 2 : 1
	var max = inNGM(5) ? 6 : 8

	// Infinity
	if (!QCs.in(3)) {
		for (let tier = max; tier >= 1; tier--) {
			if (tier <= max - step) player["infinityDimension" + tier].amount = player["infinityDimension"+tier].amount.plus(infDimensionProduction(tier + step).times(diff / 10))
		}
	}

	// Time
	var stepT = inNC(7) && inNGM(4) ? 2 : step
	if (!QCs.in(3)) {
		for (let tier = max; tier >= 1; tier--) {
			if ((tmp.eterUnl || inNGM(4)) && tier <= max - stepT) player["timeDimension" + tier].amount = player["timeDimension" + tier].amount.plus(getTimeDimensionProduction(tier + stepT).times(diff / 10))
		}
	}

	// Black Hole
	var stepB = step
	if (!QCs.in(3)) {
		for (let tier = max; tier >= 1; tier--) {
			if (isBHDimUnlocked(tier + stepB) && tier <= max - stepB) player["blackholeDimension"+tier].amount = player["blackholeDimension" + tier].amount.plus(getBlackholeDimensionProduction(tier + stepB).times(diff / 10))
		}
	}

	metaDimsUpdating(diff)
}

function dimensionPageTabsUpdating(){
	var showProdTab=false
	el("dimTabButtons").style.display = "none"
	if (player.infinitied > 0 || player.eternities !== 0 || pH.did("quantum")) {
		el("hideProductionTab").style.display = ""
		showProdTab=!aarMod.hideProductionTab
	} else el("hideProductionTab").style.display = "none"
	if (player.infDimensionsUnlocked[0] || player.eternities !== 0 || pH.did("quantum") || showProdTab || inNGM(4)) el("dimTabButtons").style.display = "inline-block"
	el("prodtabbtn").style.display=showProdTab ? "inline-block":"none"
	if (!showProdTab) player.options.chart.on=false
}

function otherDimsUpdating(diff) {
	if (QCs.in(3)) return

	//Infinity Dimensions
	let infProd = infDimensionProduction(1)
	if (inNGM(5)) infProd = infDimensionProduction(2).add(infProd)

	if (player.currentEternityChall !== "eterc7") player.infinityPower = player.infinityPower.plus(infProd.times(diff))
	else if (!haveSixDimensions()) player.seventhAmount = player.seventhAmount.plus(infProd.times(diff))

	if (inNGM(5) && !onPostBreak() && player.infinityPower.gt(Number.MAX_VALUE)) player.infinitypower = E(Number.MAX_VALUE)

	//Time Dimensions
	let timeProd = getTimeDimensionProduction(1)
	if (inNGM(5)) timeProd = getTimeDimensionProduction(2).add(timeProd)
	if (player.currentEternityChall !== "eterc7") player.timeShards = player.timeShards.plus(timeProd.times(diff)).max(0)

	//Eternity Challenge 7
	let id8Prod = getECReward(7)
	if (id8Prod.gt(0)) player.infinityDimension8.amount = player.infinityDimension8.amount.plus(id8Prod.times(diff))
}

function ERFreeTickUpdating(){
	var oldT = player.totalTickGained
	player.totalTickGained = getTotalTickGained()
	player.tickThreshold = tickCost(player.totalTickGained+1)
	player.tickspeed = player.tickspeed.times(Decimal.pow(tmp.tsReduce, player.totalTickGained - oldT))
}

function nonERFreeTickUpdating(){
	let gain;
	let thresholdMult = 1.33
	var easier = inNGM(2) && !(inNGM(4))
	if (easier) {
		thresholdMult = hasTimeStudy(171) ? 1.1 : 1.15
		if (inNGM(3)) thresholdMult = hasTimeStudy(171) ? 1.03 : 1.05
	} else if (hasTimeStudy(171)) {
		thresholdMult = 1.25
		if (aarMod.newGameMult) thresholdMult -= 0.08
	}
	if (inNGM(5)) thresholdMult = 1.5
	if (pH.did("ghostify") && player.ghostify.neutrinos.boosts > 9) thresholdMult -= tmp.nb[10]
	if (thresholdMult < 1.1 && player.galacticSacrifice == undefined) thresholdMult = 1.05 + 0.05 / (2.1 - thresholdMult)
	if (thresholdMult < 1.01 && inNGM(2)) thresholdMult = 1.005 + 0.005 / (2.01 - thresholdMult)

	let thresholdExp = 1

	gain = Math.ceil(E(player.timeShards).dividedBy(player.tickThreshold).log10() / Math.log10(thresholdMult) / thresholdExp)
	player.totalTickGained += gain
	player.tickspeed = player.tickspeed.times(Decimal.pow(tmp.tsReduce, gain))
	player.postC3Reward = Decimal.pow(getIC3Mult(), gain * getIC3EffFromFreeUpgs()).times(player.postC3Reward)
	var base = inNGM(4) ? 0.01 : (player.tickspeedBoosts ? .1 : 1)
	player.tickThreshold = Decimal.pow(thresholdMult, player.totalTickGained * thresholdExp).times(base)
	el("totaltickgained").textContent = "You've gained " + getFullExpansion(player.totalTickGained) + " tickspeed upgrades."
	tmp.tickUpdate = true
}

function bigCrunchButtonUpdating(){
	el("bigcrunch").style.display = 'none'
	el("postInfinityButton").style.display = 'none'
	if (tmp.ri) {
		el("bigcrunch").style.display = 'inline-block';
		if ((player.bestInfinityTime > 600 && player.bestEternity > 600) || (!player.options.retryChallenge && (player.currentChallenge != "" || (inNGM(4) && player.galacticSacrifice.chall > 0)))) {
			isEmptiness = true
			showTab('emptiness')
			pH.updateDisplay()
		}
	} else if ((player.break && player.currentChallenge == "") || player.infinityUpgradesRespecced != undefined) {
		if (player.money.gte(Number.MAX_VALUE) && pH_tmp.infinity.shown) {
			el("postInfinityButton").style.display = "inline-block"
			var currentIPmin = gainedInfinityPoints().dividedBy(player.thisInfinityTime/600)
			if (currentIPmin.gt(IPminpeak)) IPminpeak = currentIPmin
			if (IPminpeak.log10() > 1e9) el("postInfinityButton").innerHTML = "Big Crunch"
			else {
				var IPminpart = IPminpeak.log10() > 1e5 ? "" : "<br>" + shortenDimensions(currentIPmin) + " IP/min" + "<br>Peaked at " + shortenDimensions(IPminpeak) + " IP/min"
				el("postInfinityButton").innerHTML = "<b>" + (IPminpeak.log10() > 3e5 ? "Gain " : "Big Crunch for ") + shortenDimensions(gainedInfinityPoints()) + " Infinity points.</b>" + IPminpart
			}
		}
	}
}

function nextICUnlockUpdating(){
	let nextUnlock = getNextAt(order[player.postChallUnlocked])
	if (!nextUnlock) {
		el("nextchall").textContent = ""
		return
	}

	let newChallsUnlocked = false
	while (player.money.gte(nextUnlock) && nextUnlock) {
		var name = order[player.postChallUnlocked]

		player.postChallUnlocked++
		if (name && getEternitied() >= 7) {
			if (name == "postc2") updateAutobuyers()
			player.challenges.push(name)
		}

		nextUnlock = getNextAt(name)
		newChallsUnlocked = true
	}

	el("nextchall").textContent = !nextUnlock ? "" :
		"Get " + shortenCosts(nextUnlock) + " antimatter to unlock Infinity Challenge " + (player.postChallUnlocked + 1) + "."

	if (!newChallsUnlocked) return
	if (getEternitied() >= 7 && player.postChallUnlocked >= 8) {
		ndAutobuyersUsed = 0
		for (i = 0; i <= 8; i++) if (player.autobuyers[i] % 1 !== 0 && player.autobuyers[i].isOn) ndAutobuyersUsed++
		el("maxall").style.display = ndAutobuyersUsed > 8 && player.challenges.includes("postc8") ? "none" : ""
	}
	updateChallenges()
}

function passiveIPperMUpdating(diff){
	player.infinityPoints = player.infinityPoints.plus(bestRunIppm.times(player.offlineProd / 100).times(diff / 60))
}

function giveBlackHolePowerUpdating(diff){
	if (player.exdilation != undefined) player.blackhole.power = player.blackhole.power.plus(getBlackholeDimensionProduction(1).times(diff))
}

function freeTickspeedUpdating(){
	if (player.boughtDims) ERFreeTickUpdating()
	if (player.timeShards.gt(player.tickThreshold) && !player.boughtDims) nonERFreeTickUpdating()
}

function IRsetsUnlockUpdating(){
	if (player.infinityUpgradesRespecced != undefined) if (setUnlocks.length > player.setsUnlocked) if (player.money.gte(setUnlocks[player.setsUnlocked])) player.setsUnlocked++
}

function IPMultBuyUpdating() {
	if (player.infMultBuyer && (!player.boughtDims || canBuyIPMult())) {
		var dif = Math.floor(player.infinityPoints.div(player.infMultCost).log(aarMod.newGameExpVersion ? 4 : 10)) + 1
		if (dif > 0) {
			player.infMult = player.infMult.times(Decimal.pow(getIPMultPower(), dif))
			player.infMultCost = player.infMultCost.times(Decimal.pow(ipMultCostIncrease, dif))
			if (player.infinityPoints.lte(Decimal.pow(10, 1e9))) {
				if (pH.did("ghostify")) {
					if (player.ghostify.milestones < 11) player.infinityPoints = player.infinityPoints.minus(player.infMultCost.dividedBy(aarMod.newGameExpVersion?4:10).min(player.infinityPoints))
				}
				else player.infinityPoints = player.infinityPoints.minus(player.infMultCost.dividedBy(aarMod.newGameExpVersion?4:10).min(player.infinityPoints))
			}
			if (player.autobuyers[11].priority !== undefined && player.autobuyers[11].priority !== null && player.autoCrunchMode == "amount") player.autobuyers[11].priority = Decimal.times(player.autobuyers[11].priority, Decimal.pow(getIPMultPower(), dif));
			if (player.autoCrunchMode == "amount") el("priority12").value = formatValue("Scientific", player.autobuyers[11].priority, 2, 0);
		}
	}
}

function doEternityButtonDisplayUpdating(diff){
	var isSmartPeakActivated = tmp.ngp3
	var EPminUnits = isSmartPeakActivated ? (player.dilation.active ? 'TP' : tmp.be ? 'EM' : 'EP') : 'EP'
	var EPminpeakUnits = EPminUnits
	var currentEPmin = updateEPminpeak(diff, EPminpeakUnits)
	EPminpeakUnits = (EPminpeakType == 'logarithm' ? ' log(' + EPminpeakUnits + ')' : ' ' + EPminpeakUnits)
	if (el("eternitybtn").style.display != "none") {
		el("eternitybtnFlavor").textContent = (((!player.dilation.active && gainedEternityPoints().lt(1e6)) || player.eternities < 1 || player.currentEternityChall!=="") ? ((player.currentEternityChall!=="" ? "Other challenges await..." : player.eternities > 0 && !showEPmin ? "" : "Other times await...") + " I need to become Eternal.") : "")
		if (player.dilation.active && player.dilation.totalTachyonParticles.gte(getTPGain())) el("eternitybtnEPGain").innerHTML = getReqForTPGainDisp()
		else {
			el("eternitybtnEPGain").innerHTML = ((tmp.eterUnl && player.currentEternityChall == "") ?
				EPminUnits == "EP" && gainedEternityPoints().e >= 1e8 ? "<b>Other times await... I need to become Eternal.</b>" :
				"Gain <b>" + (player.dilation.active?shortenMoney(getTPGain().sub(player.dilation.totalTachyonParticles)):shortenDimensions(gainedEternityPoints()))+"</b> " + (EPminpeakType == "logarithm" ? EPminUnits + "." : player.dilation.active? "Tachyon particles." : "Eternity points.")
			: "")
		}
		var showEPmin = tmp.eterUnl && gainedEternityPoints().e < 1e8 && Decimal.gt(EPminpeak, 0)
		if (EPminUnits != "TP") {
			el("eternitybtnRate").textContent = (showEPmin
										  ? rateFormat(currentEPmin, EPminpeakUnits) : "")
			el("eternitybtnPeak").textContent = showEPmin ? "Peaked at " + rateFormat(EPminpeak, EPminpeakUnits) : ""
		} else {
			el("eternitybtnRate").textContent = ''
			el("eternitybtnPeak").textContent = ''
		}
	}
}

function doQuantumButtonDisplayUpdating(diff){
	if (pH.did("quantum") && isQuantumReached()) {
		currentQKmin = quarkGain().dividedBy(qu_save.time / 600)
		if (currentQKmin.gt(QKminpeak) && pH.can("quantum")) {
			QKminpeak = currentQKmin
			QKminpeakValue = quarkGain()
		}
	} else currentQKmin = E(0)

	var showGain = !isQuantumFirst() ? "QK" : ""
	el("quantumbtnFlavor").textContent = showGain != "" ? "" : QCs.inAny() ? "The unseening has been detected... Complete this challenging experiment!" : "The spacetime has been conceptualized... It's time to go quantum!"
	el("quantumbtnQKGain").textContent = showGain == "QK" ? "Gain " + shortenDimensions(quarkGain()) + " anti-Quark" + (quarkGain().eq(1) ? "." : "s.") : ""
	el("quantumbtnQKNextAt").textContent = showGain == "QK" && currentQKmin.lt(10) && !PCs.unl() && !fluc.unl() ? "Next at " + shorten(getQuantumReqSource()) + " / " + shorten(quarkGainNextAt()) + " MA" : ""
	if (showGain != "QK" || currentQKmin.gt(1e30) || pH.did("fluctuate")) {
		el("quantumbtnRate").textContent = ''
		el("quantumbtnPeak").textContent = ''
	} else if (currentQKmin.gt(1e6)) {
		el("quantumbtnRate").textContent = ''
		el("quantumbtnPeak").textContent = 'Peaked at ' + rateFormat(QKminpeak) + " at " + shortenDimensions(QKminpeakValue) + " aQ"
	} else {
		el("quantumbtnRate").textContent = rateFormat(currentQKmin, "aQ")
		el("quantumbtnPeak").textContent = "(" + rateFormat(QKminpeak) + " at " + shortenDimensions(QKminpeakValue) + " aQ)"
	}
}

function doGhostifyButtonDisplayUpdating(diff){
	var currentGHPmin = E(0)
	if (pH.did("ghostify") && bigRipped) {
		currentGHPmin = getGHPGain().dividedBy(player.ghostify.time / 600)
		if (currentGHPmin.gt(GHPminpeak)) {
			GHPminpeak = currentGHPmin
			GHPminpeakValue = getGHPGain()
		}
	}
	var ghostifyGains = []
	if (pH.did("ghostify")) {
		ghostifyGains.push(shortenDimensions(getGHPGain()) + " Ghost Particles")
		if (hasAch("ng3p78")) ghostifyGains.push(shortenDimensions(Decimal.times(6e3 * qu_save.bigRip.bestGals, getGhostifiedGain()).times(getNeutrinoGain())) + " Neutrinos")
		if (hasBosonicUpg(15)) ghostifyGains.push(getFullExpansion(getGhostifiedGain()) + " Ghostifies")
	}
	el("ghostifybtnFlavor").textContent = ghostifyGains.length > 1 ? "" : (ghostifyGains.length ? "" : "I need to ascend from this broken universe... ") + "I need to become a ghost."
	el("GHPGain").textContent = ghostifyGains.length ? "Gain " + ghostifyGains[0] + (ghostifyGains.length > 2 ? ", " + ghostifyGains[1] + "," : "") + (ghostifyGains.length > 1 ? " and " + ghostifyGains[ghostifyGains.length-1] : "") + "." : ""
	var showGHPPeakValue = GHPminpeakValue.lt(1e6) || player.options.theme=="Aarex's Modifications"
	el("GHPRate").textContent = ghostifyGains.length == 1 && showGHPPeakValue ? getGHPRate(currentGHPmin) : ""
	el("GHPPeak").textContent = ghostifyGains.length == 1 ? (showGHPPeakValue?"":"Peaked at ")+getGHPRate(GHPminpeak)+(showGHPPeakValue?" at "+shortenDimensions(GHPminpeakValue)+" GhP":"") : ""
}

function tickspeedButtonDisplay(){
	if (player.tickSpeedCost.gt(player.money)) {
		el("tickSpeed").className = 'unavailablebtn';
		el("tickSpeedMax").className = 'unavailablebtn';
	} else {
		el("tickSpeed").className = 'storebtn';
		el("tickSpeedMax").className = 'storebtn';
	}
}

function passiveGPGen(diff){
	let passiveGPGen = false
	if (inNGM(3)) passiveGPGen = hasAch("r56")
	else if (inNGM(2)) passiveGPGen = hasTimeStudy(181)
	var mult = 1
	if (inNGM(4)){
		if (hasAch("r43")) mult = Math.pow(player.galacticSacrifice.galaxyPoints.plus(1e20).log10() / 10, 2) /2
		if (mult > 100) mult = 100
	}
	if (passiveGPGen) player.galacticSacrifice.galaxyPoints = player.galacticSacrifice.galaxyPoints.add(getGSAmount().times(diff / 100 * mult))
}


function normalSacDisplay(){
	if (player.eightBought > 0 && player.resets > 4 && player.currentEternityChall !== "eterc3") el("sacrifice").className = "storebtn"
   	else el("sacrifice").className = "unavailablebtn"
}

function sacLayersDisplay(){
	if (el("paradox").style.display=='block') updatePUMults()
	if (el("galaxy").style.display=='block') {
		galacticUpgradeSpanDisplay()
		galacticUpgradeButtonTypeDisplay()
	}
}

function isEmptinessDisplayChanges(){
	if (isEmptiness) {
		el("dimensionsbtn").style.display = "none";
		el("optionsbtn").style.display = "none";
		el("statisticsbtn").style.display = "none";
		el("automationbtn").style.display = "none";
		el("repMajorBtn").style.display = "none";
		el("achievementsbtn").style.display = "none";
		el("tickSpeed").style.visibility = "hidden";
		el("tickSpeedMax").style.visibility = "hidden";
		el("tickLabel").style.visibility = "hidden";
		el("tickSpeedAmount").style.visibility = "hidden";
		updateTickspeed()
	} else {
		el("dimensionsbtn").style.display = "inline-block";
		el("optionsbtn").style.display = "inline-block";
		el("statisticsbtn").style.display = aarMod.hideStats ? "none" : "inline-block";
		el("achievementsbtn").style.display = aarMod.hideAchs ? "none" : "inline-block";
	}
}

function DimBoostBulkDisplay(){
	var bulkDisplay = player.infinityUpgrades.includes("bulkBoost") || player.autobuyers[9].bulkBought === true ? "inline" : "none"
	el("bulkdimboost").style.display = bulkDisplay
	if (inNGM(3)) el("bulkTickBoostDiv").style.display = bulkDisplay
}

function currentChallengeProgress(){
	var p = Math.min((Decimal.log10(player.money.plus(1)) / Decimal.log10(player.challengeTarget) * 100), 100).toFixed(2) + "%"
	el("progressbar").style.width = p
	el("progresspercent").textContent = p
	el("progresspercent").setAttribute('ach-tooltip',"Percentage to challenge goal")
}

function preBreakProgess(){
	var p = Math.min((Decimal.log10(player.money.plus(1)) / Decimal.log10(getLimit()) * 100), 100).toFixed(2) + "%"
	el("progressbar").style.width = p
	el("progresspercent").textContent = p
	el("progresspercent").setAttribute('ach-tooltip',"Percentage to Infinity")
}

function infDimProgress(){
	var p = Math.min(player.money.e / getNewInfReq().money.e * 100, 100).toFixed(2) + "%"
	el("progressbar").style.width = p
	el("progresspercent").textContent = p
	el("progresspercent").setAttribute('ach-tooltip',"Percentage to next dimension unlock")
}

function currentEChallengeProgress(){
	var p = Math.min(Decimal.log10(player.infinityPoints.plus(1)) / player.eternityChallGoal.log10() * 100, 100).toFixed(2) + "%"
	el("progressbar").style.width = p
	el("progresspercent").textContent = p
	el("progresspercent").setAttribute('ach-tooltip',"Percentage to Eternity Challenge goal")
}

function preEternityProgress(){
	var p = Math.min(Decimal.log10(player.infinityPoints.plus(1)) / Decimal.log10(Number.MAX_VALUE)  * 100, 100).toFixed(2) + "%"
	el("progressbar").style.width = p
	el("progresspercent").textContent = p
	el("progresspercent").setAttribute('ach-tooltip',"Percentage to Eternity")
}

function r128Progress(){
	var p = (Decimal.log10(player.infinityPoints.plus(1)) / 220).toFixed(2) + "%"
	el("progressbar").style.width = p
	el("progresspercent").textContent = p
	el("progresspercent").setAttribute('ach-tooltip','Percentage to "What do I have to do to get rid of you"') 
}

function r138Progress(){
	var p = Math.min(Decimal.log10(player.infinityPoints.plus(1)) / 200, 100).toFixed(2) + "%"
	el("progressbar").style.width = p
	el("progresspercent").textContent = p
	el("progresspercent").setAttribute('ach-tooltip','Percentage to "That is what I have to do to get rid of you."')
}

function gainTPProgress(){
	var p = (getTPGain().log10() / player.dilation.totalTachyonParticles.log10()).toFixed(2) + "%"
	el("progressbar").style.width = p
	el("progresspercent").textContent = p
	el("progresspercent").setAttribute('ach-tooltip','Percentage to the requirement for tachyon particle gain')
}

function ngpp13Progress(){
	var gepLog = gainedEternityPoints().log2()
	var goal = Math.pow(2,Math.ceil(Math.log10(gepLog) / Math.log10(2)))
	goal = Decimal.sub("1e40000", player.eternityPoints).log2()
	var percentage = Math.min(gepLog / goal * 100, 100).toFixed(2) + "%"
	el("progressbar").style.width = percentage
	el("progresspercent").textContent = percentage
	el("progresspercent").setAttribute('ach-tooltip','Percentage to "In the grim darkness of the far endgame"')
}

function r127Progress(){
	var gepLog = gainedEternityPoints().log2()
	var goal = Math.pow(2,Math.ceil(Math.log10(gepLog) / Math.log10(2)))
	goal = Decimal.sub(Number.MAX_VALUE, player.eternityPoints).log2()
	var percentage = Math.min(gepLog / goal * 100, 100).toFixed(2) + "%"
	el("progressbar").style.width = percentage
	el("progresspercent").textContent = percentage
	el("progresspercent").setAttribute('ach-tooltip','Percentage to "But I wanted another prestige layer..."')
}

function preQuantumNormalProgress(){
	var gepLog = gainedEternityPoints().log2()
	var goal = Math.pow(2,Math.ceil(Math.log10(gepLog) / Math.log10(2)))
	if (goal > 131072 && player.meta && !hasAch('ngpp13')) {
		ngpp13Progress()
	} else if (goal > 512 && !hasAch('r127')) {
		r127Progress()
	} else {
		var percentage = Math.min(gepLog / goal * 100, 100).toFixed(2) + "%"
		el("progressbar").style.width = percentage
		el("progresspercent").textContent = percentage
		el("progresspercent").setAttribute('ach-tooltip',"Percentage to "+shortenDimensions(Decimal.pow(2,goal))+" EP gain")
	}
}

function progressBarUpdating(){
	if (el("progress").style.display == "none") return
	el("progressbar").className = ""
	el("progress").style.bottom = aarMod.noFooter || el("TTbuttons").style.display == "block" ? "5px" : ""

	if (aarMod.featureProgress === 2) doGoogologicalProgress()
	else if (aarMod.featureProgress) doFeatureProgress()
	else if (el("metadimensions").style.display == "block") doQuantumProgress() 
	else if (player.currentChallenge !== "") {
		currentChallengeProgress()
	} else if (!player.break) {
		preBreakProgess()
	} else if (player.infDimensionsUnlocked.includes(false)) {
		infDimProgress()
	} else if (player.currentEternityChall !== '' && player.infinityPoints.lt(player.eternityChallGoal.pow(2))) {
		currentEChallengeProgress()
	} else if (player.infinityPoints.lt(Number.MAX_VALUE) || player.eternities == 0) {
		preEternityProgress()
	} else if (hasAch('r127') && !hasAch('r128') && player.timestudy.studies.length == 0) {
		r128Progress()
	} else if (hasDilationStudy(5) && player.dilation.active && !hasAch('r138') && player.timestudy.studies.length == 0) {
		r138Progress()
	} else if (player.dilation.active && player.dilation.totalTachyonParticles.gte(getTPGain())) {
		gainTPProgress()
	} else if ((QCs.inAny() || gainedEternityPoints().gte(Decimal.pow(2, 1048576))) && player.meta) doQuantumProgress()
	else preQuantumNormalProgress()
}

function challengeOverallDisplayUpdating(){
	if (el("challenges").style.display == "block") {
		if (el("eternitychallenges").style.display == "block") ECRewardDisplayUpdating()
		if (el("quantumchallenges").style.display == "block") QCs.updateDispOnTick()
		if (el("pairedChalls").style.display == "block") PCs.updateDispOnTick()
		if (el("pairedChallPerks").style.display == "block") PCs.updatePerksOnTick()
	}
}

function chall23PowerUpdating(){
	el("chall2Pow").textContent = (player.chall2Pow*100).toFixed(2) + "%"
	el("chall3Pow").textContent = shorten(player.chall3Pow*100) + "%"
}

function dimboostBtnUpdating(){
	var shiftRequirement = getShiftRequirement();

	if (getAmount(shiftRequirement.tier) >= shiftRequirement.amount) {
		el("softReset").className = 'storebtn';
	} else {
		el("softReset").className = 'unavailablebtn';
	}
}

function galaxyBtnUpdating(){
	if (getAmount(inNC(4)||player.pSac!=undefined?6:8) >= getGalaxyRequirement()) {
		el("secondSoftReset").className = 'storebtn';
	} else {
		el("secondSoftReset").className = 'unavailablebtn';
	}
}

let newDimPresPos = 1
function newIDDisplayUpdating() {
	el("newDimensionButton").style.display = "none"
	var req = getNewInfReq()
	if (getEternitied() >= 25) {
		while (req.money.lt(player.money) && !player.infDimensionsUnlocked[7]) {
			newDimension()
			if (player.infDimBuyers[req.tier-1] && player.currentEternityChall != "eterc8") buyMaxInfDims(req.tier)
			req = getNewInfReq()
		}
	} else if (player.break && player.currentChallenge == "" && !player.infDimensionsUnlocked[7] && pH_tmp.infinity.shown) {
		el("newDimensionButton").style.display = "inline-block"
		el("newDimensionButton").textContent = "Get " + shortenCosts(req.money) + " antimatter to unlock a new Dimension."
		if (player.money.gte(req.money)) el("newDimensionButton").className = "presPos" + newDimPresPos + " newdim"
		else el("newDimensionButton").className = "presPos" + newDimPresPos + " newdimlocked"
	}
}

function d8SacDisplay() {
	let desc = tmp.ngC ? "Boost all Dimensions" : "Boost the 8th Dimension"
	if (calcTotalSacrificeBoost().lte(Decimal.pow(10, 1e9))) {
		el("sacrifice").setAttribute('ach-tooltip', desc + " by " + formatValue(player.options.notation, calcSacrificeBoost(), 2, 2) + "x");
		el("sacrifice").textContent = "Dimensional Sacrifice (" + formatValue(player.options.notation, calcSacrificeBoost(), 2, 2) + "x)"
	} else {
		el("sacrifice").setAttribute('ach-tooltip', desc);
		el("sacrifice").textContent = "Dimensional Sacrifice (Total: " + formatValue(player.options.notation, calcTotalSacrificeBoost(), 2, 2) + "x)"
	}
}

function pSacBtnUpdating(){
	if (canPSac()) {
		let px = getPxGain()
		el("pSac").innerHTML = "Paradox Sacrifice for " + shortenDimensions(px) + " Paradox" + (px.eq(1) ? "." : "es.")
	}
}

function galSacBtnUpdating() {
	if (el("gSacrifice").style.display === "inline-block") {
		el("gSacrifice").innerHTML = "Galactic Sacrifice (" + formatValue(player.options.notation, getGSAmount(), 2, 0) + " GP)"
		el("gSacrifice").setAttribute('ach-tooltip', "Gain " + formatValue(player.options.notation, getGSAmount(), 2, 0) + " GP")
		el("gSacrifice").className = getGSAmount().gt(0) ? "storebtn" : "unavailablebtn"
	}
	if (el("sacrificebtn").style.display !== "none") {
		var currentGPmin = getGSAmount().dividedBy(player.galacticSacrifice.time / 600)
		if (currentGPmin.gt(GPminpeak)) GPminpeak = currentGPmin
		var notationOkay = (GPminpeak.gt("1e300000") && player.options.theme != "Aarex's Modifications") || player.options.notation == "Morse code" || player.options.notation == 'Spazzy'
		var notation2okay = (GPminpeak.gt("1e3000") && player.options.theme != "Aarex's Modifications") || player.options.notation == "Morse code" || player.options.notation == 'Spazzy'
		el("sacrificebtn").innerHTML = (notationOkay ? "Gain " : "Galactic Sacrifice for ") + shortenDimensions(getGSAmount()) + " Galaxy points." +
			(notation2okay ? "" : "<br>" + shortenMoney(currentGPmin) + " GP/min" + "<br>Peaked at " + shortenMoney(GPminpeak) + " GP/min")
	}
}

function IPonCrunchPassiveGain(diff){
	if (hasTimeStudy(181)) player.infinityPoints = player.infinityPoints.plus(gainedInfinityPoints().times(diff / 100))
	if (hasAch("r127") && tmp.ngp3_boost) player.infinityPoints = player.infinityPoints.plus(gainedInfinityPoints().times(diff / 100))
}

function EPonEternityPassiveGain(diff){
	if (moreEMsUnlocked() && getEternitied() >= tmp.ngp3_em[5]) {
		player.eternityPoints = player.eternityPoints.plus(gainedEternityPoints().times(diff / 100))
		el("eternityPoints2").innerHTML = "You have <span class=\"EPAmount2\">"+shortenDimensions(player.eternityPoints)+"</span> Eternity points."
	}
}

function ngp3DilationUpdating(){
	let gain = getTPGain()
	if (inNGM(2)) player.dilation.bestIP = player.infinityPoints.max(player.dilation.bestIP)
}

function setTachyonParticles(x) {
	player.dilation.tachyonParticles = E(x)
	if (!player.dilation.active) player.dilation.totalTachyonParticles = player.dilation.tachyonParticles
	if (tmp.ngp3) {
		qu_save.notrelative = false
		player.dilation.bestTP = Decimal.max(player.dilation.bestTP || 0, player.dilation.tachyonParticles)
	}
}

function passiveQuantumLevelStuff(diff){
	if (hasAch("ng3p112") && pH.can("ghostify")) player.ghostify.ghostParticles = player.ghostify.ghostParticles.add(getGHPGain().times(diff / 100))
	if (hasAch("ng3p112")) player.ghostify.times = c_add(player.ghostify.times, c_mul(getGhostifiedGain(), diff))

	if (hasBosonicUpg(24)) qu_save.bigRip.spaceShards = qu_save.bigRip.spaceShards.add(getSpaceShardsGain().times(diff / 100))
	if (hasBosonicUpg(51) || (tmp.be && player.ghostify.milestones > 14)) qu_save.breakEternity.eternalMatter = qu_save.breakEternity.eternalMatter.add(getEMGain().times(diff / 100))

	qu_save.quarks = qu_save.quarks.add(quarkGain().sqrt().times(diff))
	var p = ["rg", "gb", "br"]
	for (var i = 0; i < 3; i++) {
		var r = qu_save.usedQuarks[p[i][0]].min(qu_save.usedQuarks[p[i][1]])
		if (hasAch("ng3p71")) r = r.div(100)
		else r = r.sqrt()
		qu_save.gluons[p[i]] = qu_save.gluons[p[i]].add(r.times(diff))
	}
	if (player.ghostify.milestones >= 16) qu_save.quarks = qu_save.quarks.add(quarkGain().times(diff / 100))

	updateQuarkDisplay()
	updateQuantumWorth("quick")
}

function generateTT(diff){
	if (player.dilation.upgrades.includes(10)) {
		var speed = getTTProduction()
		var div = player.timestudy.theorem / speed
		player.timestudy.theorem += diff * speed  
		if (div < 3600 && hasAch("ng3p44")) player.timestudy.theorem += Math.min(diff * 9, 3600 - div) * speed
		if (player.timestudy.theorem > 1e200) player.timestudy.theorem = 1e200
	}
}

function thisQuantumTimeUpdating(){
	setAndMaybeShow("quantumClock", tmp.quUnl, '"Quantum time: <b class=\'QKAmount\'>"+timeDisplayShort(qu_save.time)+"</b>"')
}

function updateInfinityTimes(){
	if (player.thisInfinityTime < -10) player.thisInfinityTime = Infinity
	if (player.bestInfinityTime < -10) player.bestInfinityTime = Infinity
}

function infUpgPassiveIPGain(diff){
	if (diff > player.autoTime && !player.break) player.infinityPoints = player.infinityPoints.plus(player.autoIP.div(player.autoTime).times(diff))
}

function gameLoop(diff) {
	var thisUpdate = new Date().getTime();
	if (typeof diff === 'undefined') {
		if (player.options.secrets && player.options.secrets.ghostlyNews) nextGhostlyNewsTickerMsg()
		diff = Math.min(thisUpdate - player.lastUpdate, 21600000);
	}
	player.lastUpdate = thisUpdate

	diff = Math.max(diff / 1e3, 0)
	if (tmp.gameSpeed != 1) diff = diff * tmp.gameSpeed
	var diffStat = diff * 10
	if (player.version === 12.2 && typeof player.shameLevel === 'number') diff *= Math.min(Math.pow(10, player.shameLevel), 1)
	if (tmp.inEC12) diff /= tmp.ec12Mult

	updateInfinityTimes()
	updateTmp()
	infUpgPassiveIPGain(diff)

	if (!isGamePaused()) {
		incrementParadoxUpdating(diff)
		checkMatter(diff * 10)
		passiveIPupdating(diff)
		passiveInfinitiesUpdating(diff)

		if (!tmp.ri) {
			if (player.infinityUpgradesRespecced !== undefined) infinityRespeccedDMUpdating(diff)
			normalDimUpdating(diff)
		}
		checkForInfinite()

		normalChallPowerUpdating(diff)
		passiveIPperMUpdating(diff)
		incrementTimesUpdating(diffStat)

		specialDimUpdating(diff) //production of those dims
		otherDimsUpdating(diff)
		giveBlackHolePowerUpdating(diff)
		freeTickspeedUpdating()

		passiveGPGen(diff)
		IPonCrunchPassiveGain(diff)
		EPonEternityPassiveGain(diff)
		generateTT(diff)
		if (hasDilationStudy(1)) {
			let old = player.dilation.dilatedTime
			let gain = getDilTimeGainPerSecond()
			player.dilation.dilatedTime = old.plus(gain.times(diff))
			gainDilationGalaxies()
		}

		if (tmp.ngp3) {
			if (hasDilationStudy(1) && player.dilation.active) ngp3DilationUpdating()
			if (player.ghostify.milestones >= 8 && tmp.quActive) passiveQuantumLevelStuff(diff)
			if (ETER_UPGS.has(15)) updateEternityUpgrades() // to fix the 5ep upg display
			if (pH.did("ghostify")) {
				if (player.ghostify.wzb.unl) WZBosonsUpdating(diff) // Bosonic Lab
				if (player.ghostify.ghostlyPhotons.unl) ghostlyPhotonsUpdating(diff) // Ghostly Photons
				ghostifyAutomationUpdating(diff)
			}
			if (pH.did("fluctuate")) fluc.update(diff)
			if (pH.did("quantum")) quantumOverallUpdating(diff)
			preQuantumAutoNGP3(diff * 10)
		}

		replicantiIncrease(diff * 10)
	}

	if (simulate) return

	aarMod.render.tick++
	if (aarMod.render.tick >= aarMod.render.rate) aarMod.render.tick = 0
	else return

	dimensionButtonDisplayUpdating()
	dimensionPageTabsUpdating()
	bigCrunchButtonUpdating()
	IRsetsUnlockUpdating()
	nextICUnlockUpdating()

	if (player.break) el("iplimit").style.display = "inline"
	else el("iplimit").style.display = "none"
	el("IPPeakDiv").style.display = (player.break && player.boughtDims) ? "" : "none"
	if (inNGM(2) && pH.shown("galaxy")) el("GPAmount").textContent = shortenDimensions(player.galacticSacrifice.galaxyPoints)
	if (inNGM(5) && pH.shown("paradox")) el("pxAmount").textContent = shortenDimensions(player.pSac.px)

	if (tmp.tickUpdate) {
		updateTickspeed()
		tmp.tickUpdate = false
	}
	IPMultBuyUpdating()
	doEternityButtonDisplayUpdating(diff)
	doQuantumButtonDisplayUpdating(diff)
	if (pH.can("fluctuate")) el("fluctuateReset").textContent = fluc.unl() ? "Fluctuate the Quantum Mechanics for +" + getFullExpansion(fluc.gain()) + " Energy." : "It's time for science... Fluctuate the Quantum!"
	doGhostifyButtonDisplayUpdating(diff)

	updateMoney();
	updateCoinPerSec();

	updateDimensionsDisplay()
	updateInfCosts()

	updateDilationDisplay()

	checkMarathon()
	checkMarathon2()
	checkPain()
	checkSupersanic()
	tickspeedButtonDisplay()
	updateCosts()

	normalSacDisplay()
	sacLayersDisplay()
	d8SacDisplay()

	el("challengesbtn").style.display = pH.did(inNGM(4) ? "galaxy" : "infinity") && !isEmptiness ? "inline-block" : "none"

	progressBarUpdating()
	challengeOverallDisplayUpdating()
	chall23PowerUpdating()
	
	pSacBtnUpdating()
	dimboostBtnUpdating()
	galaxyBtnUpdating()  
	newIDDisplayUpdating()
	galSacBtnUpdating()

	thisQuantumTimeUpdating()
	var s = shortenDimensions(player.infinityPoints)
	el("infinityPoints1").innerHTML = "You have <span class=\"IPAmount1\">"+s+"</span> Infinity points."
	el("infinityPoints2").innerHTML = "You have <span class=\"IPAmount2\">"+s+"</span> Infinity points."

	if (el("loadmenu").style.display == "block") changeSaveDesc(metaSave.current, savePlacement)
}

function isGamePaused() {
	return player && aarMod && aarMod.pause
}

let simulate = false
function simulateTime(seconds, real, id) {
	simulate = true

	//the game is simulated at a 50ms update rate, with a max of 1000 ticks
	//warning: do not call this function with real unless you know what you're doing
	var ticks = seconds * 20;
	var bonusDiff = 0;
	var playerStart = Object.assign({}, player);
	var storage = {}
	if (player.blackhole !== undefined) storage.bp = player.blackhole.power
	if (player.meta !== undefined) storage.ma = player.meta.antimatter
	if (tmp.ngp3) {
		storage.dt = player.dilation.dilatedTime
		storage.bAm = player.ghostify.bl.am
	}
	if (ticks > 1000 && !real) {
		bonusDiff = (ticks - 1000) / 20;
		ticks = 1000;
	}
	let ticksDone = 0
	for (ticksDone=0; ticksDone<ticks; ticksDone++) {
		gameLoop(50+bonusDiff)
		autoBuyerTick();
	}

	simulate = false
	if (seconds >= 21600) giveAchievement("Don't you dare sleep")

	closeToolTip()
	var popupString = "While you were away"
	if (player.money.gt(playerStart.money)) popupString += ",<br> your antimatter increased "+shortenMoney(player.money.log10() - (playerStart.money).log10())+" orders of magnitude"
	if (player.infinityPower.gt(playerStart.infinityPower) && !pH.did("quantum")) popupString += ",<br> infinity power increased "+shortenMoney(player.infinityPower.log10() - (Decimal.max(playerStart.infinityPower, 1)).log10())+" orders of magnitude"
	if (player.timeShards.gt(playerStart.timeShards) && !pH.did("quantum")) popupString += ",<br> time shards increased "+shortenMoney(player.timeShards.log10() - (Decimal.max(playerStart.timeShards, 1)).log10())+" orders of magnitude"
	if (storage.dt && player.dilation.dilatedTime.gt(storage.dt)) popupString += ",<br> dilated time increased "+shortenMoney(player.dilation.dilatedTime.log10() - (Decimal.max(storage.dt, 1)).log10())+" orders of magnitude"
	if (storage.bp && player.blackhole.power.gt(storage.bp)) popupString += ",<br> black hole power increased "+shortenMoney(player.blackhole.power.log10() - (Decimal.max(storage.bp, 1)).log10())+" orders of magnitude"
	if (storage.ma && player.meta.antimatter.gt(storage.ma) && !pH.did("ghostify")) popupString += ",<br> meta-antimatter increased "+shortenMoney(player.meta.antimatter.log10() - (Decimal.max(storage.ma, 1)).log10())+" orders of magnitude"
	if (storage.dt) {
		if (Decimal.gt(player.ghostify.bl.am, storage.bAm) && pH.did("ghostify")) popupString += ",<br> Bosonic Antimatter increased "+shortenMoney(player.ghostify.bl.am.log10() - (Decimal.max(storage.bAm, 1)).log10())+" orders of magnitude"
	}
	if (player.infinitied > playerStart.infinitied || player.eternities > playerStart.eternities) popupString += ","
	else popupString += "."
	if (player.infinitied > playerStart.infinitied) popupString += "<br>you infinitied "+getFullExpansion(player.infinitied-playerStart.infinitied)+" times."
	if (player.eternities > playerStart.eternities) popupString += " <br>you eternitied "+getFullExpansion(player.eternities-playerStart.eternities)+" times."
	if (popupString.length == 20) {
		popupString = popupString.slice(0, -1);
		popupString += "... Nothing happened."
		if (id == "lair") popupString += "<br><br>I told you so."
		giveAchievement("While you were away... Nothing happened.")
	}
	el("offlineprogress").style.display = "block"
	el("offlinePopup").innerHTML = popupString
}

var tickWait = 0
var tickWaitStart = 0
var tickDiff = 0
var fps = 0
function startInterval() {
	gameLoopIntervalId = setInterval(function() {
		var tickStart = new Date().getTime()
		if (aarMod.performanceTicks) {
			if (tickStart - tickWaitStart < tickWait) return
			tickWait = 1/0
		}

		try {
			gameLoop()
		} catch (e) {
			console.error(e)
		}
		var tickEnd = new Date().getTime()

		tickDiff = tickEnd - tickStart
		fps = 1000 / tickDiff
		if (aarMod.fps) el("fps").textContent = fps.toFixed(1) + " fps: " + tickDiff + "ms update"

		tickWait = tickDiff * (aarMod.performanceTicks * 2)
		tickWaitStart = tickEnd
	}, player.options.updateRate);
}

function enableChart() {
	if (el("chartOnOff").checked) {
		player.options.chart.on = true;
		if (player.options.chart.warning < 1) alert("Warning: Using the chart can cause performance issues. Please disable it if you're experiencing lag.")
	} else {
		player.options.chart.on = false;
	}
}

function enableChartDips() {
	if (el("chartDipsOnOff").checked) {
		player.options.chart.dips = true;
	} else {
		player.options.chart.dips = false;
	}
}

function updateChart(first) {
	if (player.options.chart.on === true && first !== true) addData(normalDimChart, "0", getDimensionProductionPerSecond(1))
	setTimeout(updateChart, player.options.chart.updateRate || 1000)
}

var slider = el("updaterateslider");
var sliderText = el("updaterate");

slider.oninput = function() {
	player.options.updateRate = parseInt(this.value);
	sliderText.textContent = "Update rate: " + this.value + "ms"
	if (player.options.updateRate === 200) giveAchievement("You should download some more RAM")
	clearInterval(gameLoopIntervalId)
	startInterval()
}

el("renderrateslider").oninput = function() {
	aarMod.render.rate = parseInt(this.value);
	el("renderrate").textContent = "Render rate: " + this.value + " tick"
}

function setFPSDisplay(toggle) {
	if (toggle) aarMod.fps = !aarMod.fps
	el("hideFPS").textContent = (aarMod.fps ? "Hide" : "Show") + " FPS ticker"
	el("fps").style.display = aarMod.fps ? "" : "none"
}

function dimBoolean() {
	var req = getShiftRequirement()
	var amount = getAmount(req.tier)
	if (!player.autobuyers[9].isOn) return false
	if (player.autobuyers[9].ticks*100 < player.autobuyers[9].interval) return false
	if (amount < req.amount) return false
	if (inNGM(4) && inNC(14)) return false
	if (getEternitied() < 10 && !player.autobuyers[9].bulkBought && amount < getNextShiftReq(player.autobuyers[9].bulk - 1)) return false
	if (player.overXGalaxies <= player.galaxies) return true
	if (player.autobuyers[9].priority < req.amount && req.tier == ((inNC(4) || player.currentChallenge == "postc1") ? 6 : 8)) return false
	return true
}

function autoQuantumABTick() {
	let data = qu_save.autobuyer

	if (data.autoDisable && qu_save.times >= data.autoDisable) return
	if (data.mode == "amount") {
		if (quarkGain().gte(Decimal.round(data.limit))) quantum(true, false, 0)
	} else if (data.mode == "relative") {
		if (quarkGain().gte(Decimal.round(data.limit).times(qu_save.last10[0][1]))) quantum(true, false, 0)
	} else if (data.mode == "time") {
		if (qu_save.time / 10 >= E(data.limit).toNumber()) quantum(true, false, 0)
	} else if (data.mode == "peak") {
		if (data.peakTime >= E(data.limit).toNumber()) quantum(true, false, 0)
	} else if (data.mode == "dilation") {
		if (player.dilation.times >= Math.round(E(data.limit).toNumber())) quantum(true, false, 0)
	}
}

function autoEternityABTick(){
	if (player.autoEterMode === undefined || player.autoEterMode == "amount") {
		if (gainedEternityPoints().gte(player.eternityBuyer.limit)) eternity(false, true)
	} else if (player.autoEterMode == "time") {
		if (player.thisEternity / 10 >= E(player.eternityBuyer.limit).toNumber()) eternity(false, true)
	} else if (player.autoEterMode == "relative") {
		if (gainedEternityPoints().gte(player.lastTenEternities[0][1].times(player.eternityBuyer.limit))) eternity(false, true)
	} else if (player.autoEterMode == "relativebest") {
		if (gainedEternityPoints().gte(bestEp.times(player.eternityBuyer.limit))) eternity(false, true)
	} else if (player.autoEterMode == "eternitied") {
		var eternitied = getEternitied()
		if (Decimal.gte(
			c_add(eternitied, gainEternitiedStat()),
			Decimal.times(eternitied, player.eternityBuyer.limit)
		)) eternity(false, true)
	} else if (player.autoEterMode == "exponent") {
		var eternitied = getEternitied()
		if (Decimal.gte(
			c_add(eternitied, gainEternitiedStat()),
			Decimal.pow(eternitied, player.eternityBuyer.limit)
		)) eternity(false, true)
	}
}

function galSacABTick(){
	if (player.autobuyers[12].ticks*100 >= player.autobuyers[12].interval && getGSAmount().gte(player.autobuyers[12].priority) && player.autobuyers[12].isOn) {
		galacticSacrifice(true);
		player.autobuyers[12].ticks=0
	}
	player.autobuyers[12].ticks++
}

function galaxyABTick(){
	if (
		player.autobuyers[10].isOn &&
		player.autobuyers[10].ticks * 100 >= player.autobuyers[10].interval &&
		getAmount(inNC(4) || player.pSac != undefined ? 6 : 8) >= getGalaxyRequirement() &&
		(!inNC(14) || tmp.ngmX <= 3)
	) {
		let bulk = getEternitied() >= 9
		if (bulk && (
			player.autobuyers[10].bulk == 0 ||
			Math.round(timer * 100) % Math.round(player.autobuyers[10].bulk * 100) == 0
		)) {
			maxBuyGalaxies()
		} else {
			if ((bulk && tmp.ngp3_boost && player.autobuyers[10].priority == 0) || player.autobuyers[10].priority > player.galaxies) {
				autoS = false;
				el("secondSoftReset").click()
				player.autobuyers[10].ticks = 0
			}
		}
	}
	player.autobuyers[10].ticks += 1
}

function TSBoostABTick(){
	if (autoTickspeedBoostBoolean()) {
		tickspeedBoost(player.autobuyers[13].bulk)
		player.autobuyers[13].ticks = 0
	}
	player.autobuyers[13].ticks += 1;
}

function TDBoostABTick(){
	if (autoTDBoostBoolean()) {
		buyMaxTDB()
		player.autobuyers[14].ticks = 0
	}
	player.autobuyers[14].ticks += 1;
}

function dimBoostABTick(){
	if (player.autobuyers[9].isOn && dimBoolean()) {
		if (player.resets < 4) softReset(1)
		else if (getEternitied() < 10 && !player.autobuyers[9].bulkBought) softReset(player.autobuyers[9].bulk)
		else if ((Math.round(timer * 100))%(Math.round(player.autobuyers[9].bulk * 100)) == 0 && getAmount(8) >= getShiftRequirement().amount) maxBuyDimBoosts()
		player.autobuyers[9].ticks = 0
	}
	player.autobuyers[9].ticks += 1;
}

var timer = 0
function autoBuyerTick() {
	if (tmp.ngp3) {
		if (QCs.inAny() && isQuantumReached() && QCs_save.auto) quantum(true)
		if (qMs.tmp.amt >= 17 && qu_save.autobuyer.enabled) autoQuantumABTick()
	}
	
	if (getEternitied() >= 100 && isEterBuyerOn()) autoEternityABTick()

	if (player.autobuyers[11]%1 !== 0) {
		if (player.autobuyers[11].ticks*100 >= player.autobuyers[11].interval && player.money !== undefined && player.money.gte(player.currentChallenge == "" ? getLimit() : player.challengeTarget)) {
			if (player.autobuyers[11].isOn) {
				if ((!player.autobuyers[11].requireIPPeak || IPminpeak.gt(gainedInfinityPoints().div(player.thisInfinityTime/600))) && player.autobuyers[11].priority) {
					if (player.autoCrunchMode == "amount") {
						if (!player.break || player.currentChallenge != "" || gainedInfinityPoints().gte(player.autobuyers[11].priority)) {
							autoS = false;
							bigCrunch(true)
						}
					} else if (player.autoCrunchMode == "time"){
						if (!player.break || player.currentChallenge != "" || player.thisInfinityTime / 10 >= E(player.autobuyers[11].priority).toNumber()) {
							autoS = false;
							bigCrunch(true)
						}
					} else if (player.autoCrunchMode == "replicanti"){
						if (!player.break || player.currentChallenge != "" || (player.replicanti.galaxies >= (player.autobuyers[11].priority.toString().toLowerCase()=="max"?player.replicanti.gal:Math.round(E(player.autobuyers[11].priority).toNumber())) && (!player.autobuyers[11].requireMaxReplicanti || player.replicanti.amount.gte(getReplicantiLimit())))) {
							autoS = false;
							bigCrunch(true)
						}
					} else {
						if (!player.break || player.currentChallenge != "" || gainedInfinityPoints().gte(player.lastTenRuns[0][1].times(player.autobuyers[11].priority))) {
							autoS = false;
							bigCrunch(true)
						}
					}
				}
				player.autobuyers[11].ticks = 1;
			}
		} else player.autobuyers[11].ticks += 1;
	}
	
	if (player.autobuyers[9]%1 !== 0) dimBoostABTick()
	if (player.autobuyers[10]%1 !== 0) galaxyABTick()
	if (inNGM(2)) if (player.autobuyers[12]%1 !== 0) galSacABTick()
	if (inNGM(3)) if (player.autobuyers[13]%1 !== 0) TSBoostABTick()
	if (inNGM(4)) if (player.autobuyers[14]%1 !== 0) TDBoostABTick()

	if (player.autoSacrifice%1 !== 0) {
		if ((inNGM(2) ? player.autoSacrifice.ticks * 100 >= player.autoSacrifice.interval : true) && calcSacrificeBoost().gte(player.autoSacrifice.priority) && player.autoSacrifice.isOn) {
			sacrifice(true)
			if (inNGM(2)) player.autoSacrifice.ticks=0
		}
		if (inNGM(2)) player.autoSacrifice.ticks++
	}

	for (var i=0; i<priority.length; i++) {
		if (priority[i].ticks * 100 >= priority[i].interval || priority[i].interval == 100) {
			if (priority[i].isOn) {
				if (priority[i] == player.autobuyers[8]) {
					if (!inNC(14) | inNGM(3)) {
						if (priority[i].target == 10) buyMaxTickSpeed()
						else buyTickSpeed()
					}
				} else if (canBuyDimension(priority[i].tier)) {
					if (priority[i].target > 10) {
						if (player.options.bulkOn) buyBulkDimension(priority[i].target - 10, priority[i].bulk, true)
						else buyBulkDimension(priority[i].target - 10, 1, true)
						if (tmp.ngC) ngC.condense.nds.max(priority[i].target - 10)
					} else {
						buyOneDimension(priority[i].target)
						if (tmp.ngC) ngC.condense.nds.max(priority[i].target)
					}
				}
				if (inNGM(4)) buyMaxTimeDimension(priority[i].tier, priority[i].bulk)
				priority[i].ticks = 0;
			}
		} else priority[i].ticks += 1;
	}
}


setInterval(function() {
	if (isGamePaused()) return
	timer += 0.05
	if (player) if (!player.infinityUpgrades.includes("autoBuyerUpgrade")) autoBuyerTick()
}, 100)

setInterval(function() {
	if (isGamePaused()) return
	if (player) if (player.infinityUpgrades.includes("autoBuyerUpgrade")) autoBuyerTick()
}, 50)

for (let ncid = 2; ncid <= 12; ncid++){
	el("challenge" + ncid).onclick = function () {
		startNormalChallenge(ncid)
	}
}

function isEterBuyerOn() {
	if (!player.eternityBuyer.isOn) return
	if (!player.eternityBuyer.ifAD || player.dilation.active) return true
	if (!player.eternityBuyer.dilationMode) return false
	return (player.eternityBuyer.dilMode != "upgrades" && !player.eternityBuyer.slowStopped) || (player.eternityBuyer.dilMode == "upgrades" && player.eternityBuyer.tpUpgraded)
}

function showGalTab(tabName) {
	//iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
	var tabs = document.getElementsByClassName('galaxytab');
	var tab;
	for (var i = 0; i < tabs.length; i++) {
		tab = tabs.item(i);
		if (tab.id === tabName) {
			tab.style.display = 'block';
		} else {
			tab.style.display = 'none';
		}
	}
	aarMod.tabsSave.tabGalaxy = tabName
}


function showInfTab(tabName) {
	//iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
	var tabs = document.getElementsByClassName('inftab');
	var tab;
	for (var i = 0; i < tabs.length; i++) {
		tab = tabs.item(i);
		if (tab.id === tabName) {
			tab.style.display = 'block';
		} else {
			tab.style.display = 'none';
		}
	}
	aarMod.tabsSave.tabInfinity = tabName
}

function showStatsTab(tabName) {
	//iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
	var tabs = document.getElementsByClassName('statstab');
	var tab;
	for (var i = 0; i < tabs.length; i++) {
		tab = tabs.item(i);
		if (tab.id === tabName) {
			tab.style.display = 'block';
		} else {
			tab.style.display = 'none';
		}
	}
	aarMod.tabsSave.tabStats = tabName
}

function showDimTab(tabName) {
	//iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
	var tabs = document.getElementsByClassName('dimtab');
	var tab;
	for (var i = 0; i < tabs.length; i++) {
		tab = tabs.item(i);
		if (tab.id === tabName) {
			tab.style.display = 'block';
		} else {
			tab.style.display = 'none';
		}
	}

	aarMod.tabsSave.tabDims = tabName
	setProgressBar()
}

function showChallengesTab(tabName) {
	//iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
	var tabs = document.getElementsByClassName('challengeTab');
	var tab;
	for (var i = 0; i < tabs.length; i++) {
		tab = tabs.item(i);
		if (tab.id === tabName) {
			tab.style.display = 'block';
		} else {
			tab.style.display = 'none';
		}
	}
	if (tabName == "pairedChalls") PCs.setupHTML()
	aarMod.tabsSave.tabChalls = tabName
}

function showEternityTab(tabName, init) {
	if (tabName == "timestudies" && player.boughtDims) tabName = "ers_" + tabName
	//iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
	var tabs = document.getElementsByClassName('eternitytab');
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
	if ((tabName === 'timestudies' || tabName === 'ers_timestudies' || tabName === 'masterystudies') && !init) el("TTbuttons").style.display = "block"
	else el("TTbuttons").style.display = "none"
	if (tabName != oldTab) {
		aarMod.tabsSave.tabEternity = tabName
		if (tabName === 'timestudies' || tabName === 'masterystudies' || tabName === 'dilation' || tabName === 'blackhole') resizeCanvas()
		if (tabName === "dilation") requestAnimationFrame(drawAnimations)
		if (tabName === "blackhole") requestAnimationFrame(drawBlackhole)
	}
	if (!init) closeToolTip()
}

function showAchTab(tabName) {
	//iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
	var tabs = document.getElementsByClassName('achtab');
	var tab;
	for (var i = 0; i < tabs.length; i++) {
		tab = tabs.item(i);
		if (tab.id === tabName) {
			tab.style.display = 'block';
		} else {
			tab.style.display = 'none';
		}
	}
	aarMod.tabsSave.tabAchs = tabName
}

function showOptionTab(tabName) {
	//iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
	var tabs = document.getElementsByClassName('optionstab');
	var tab;
	for (var i = 0; i < tabs.length; i++) {
		tab = tabs.item(i);
		if (tab.id === tabName) {
			tab.style.display = 'block';
		} else {
			tab.style.display = 'none';
		}
	}
	aarMod.tabsSave.tabOptions = tabName
	closeToolTip()
}

function closeToolTip(showStuck) {
	var elements = document.getElementsByClassName("popup")
	for (var i=0; i<elements.length; i++) if (elements[i].id!='welcome') elements[i].style.display = "none"
	if (showStuck && !game_loaded) showStuckPopup()
}

var game_loaded
function initGame() {
	//Setup stuff.
	initiateMetaSave()
	migrateOldSaves()
	updateNewPlayer(meta_started ? "meta_started" : "")
	setupHTMLAndData()
	localStorage.setItem(metaSaveId, btoa(JSON.stringify(metaSave)))

	//Load a save.
	load_game(false, true)
	game_loaded=true

	//show one tab during init or they'll all start hidden
	let tabsSaveData = aarMod.tabsSave
	let tabsSave = tabsSaveData&&tabsSaveData.on
	showTab((tabsSave && tabsSaveData.tabMain) || "dimensions",true)
	showOptionTab((tabsSave && tabsSaveData.tabOptions) || "saving")
	tmp.tickUpdate = true
	updateAutobuyers()
	updateChallengeTimes()
	window.addEventListener("resize", resizeCanvas);

	//On load
	updateAdvOpts()
	updateChart(true)
	setTimeout(function(){
		el("container").style.display = "block"
		el("loading").style.display = "none"
	},1000)
	clearInterval(stuckTimeout)

	//Check for Test Server
	if (!checkCorrectBeta()) {
		el("welcome").style.display = "flex"
		el("welcomeMessage").innerHTML = "Wait a moment! It is appeared that you are at a wrong test server! Click the 'test server' link to go to the one we are currently testing."
	}
}

function checkCorrectBeta() {
	if (!beta) return true
	if (!window.location.href.includes("https")) return true
	if (window.location.href.includes(betaLink)) return true

	return false
}

window.addEventListener('keydown', function(event) {
	if (keySequence == 0 && event.keyCode == 38) keySequence++
	else if (keySequence == 1 && event.keyCode == 38) keySequence++
	else if (keySequence == 2 && event.keyCode == 40) keySequence++
	else if (keySequence == 3 && event.keyCode == 40) keySequence++
	else if (keySequence == 4 && event.keyCode == 37) keySequence++
	else if (keySequence == 5 && event.keyCode == 39) keySequence++
	else if (keySequence == 6 && event.keyCode == 37) keySequence++
	else if (keySequence == 7 && event.keyCode == 39) keySequence++
	else if (keySequence == 8 && event.keyCode == 66) keySequence++
	else if (keySequence == 9 && event.keyCode == 65) giveAchievement("30 Lives")
	else keySequence = 0;
	if (keySequence2 == 0 && event.keyCode == 49) keySequence2++
	else if (keySequence2 == 1 && event.keyCode == 55) keySequence2++
	else if (keySequence2 == 2 && event.keyCode == 55) keySequence2++
	else if (keySequence2 == 3 && event.keyCode == 54) giveAchievement("Revolution, when?")
	else keySequence2 = 0
	
	if (event.keyCode == 17) controlDown = true;
	if (event.keyCode == 16) {
		shiftDown = true;
		updateSoftcapStatsTab()
		drawStudyTree()
		drawMasteryTree()
	}
	if ((controlDown && shiftDown && (event.keyCode == 67 || event.keyCode == 73 || event.keyCode == 74)) || event.keyCode == 123) {
		giveAchievement("Stop right there criminal scum!")
	}
}, false);

window.addEventListener('keyup', function(event) {
	if (event.keyCode == 17) controlDown = false;
	if (event.keyCode == 16) {
		shiftDown = false;
		updateSoftcapStatsTab()
		drawStudyTree()
		drawMasteryTree()
	}
}, false);

window.onfocus = function() {
	controlDown = false;
	shiftDown = false;
	drawStudyTree()
	drawMasteryTree()
}

window.addEventListener('keydown', function(event) {
	if (!player.options.hotkeys || controlDown === true || document.activeElement.type === "text" || document.activeElement.type === "number" || onImport) return false
	const key = event.keyCode;
	if (key >= 49 && key <= 56) {
		if (shiftDown) buyOneDimension(key-48)
		else buyManyDimension(key-48)
		return false;
	} else if (key >= 97 && key <= 104) {
		if (shiftDown) buyOneDimension(key-96)
		else buyManyDimension(key-96)
		return false;
	}
	switch (key) {
		case 65: // A
			toggleAutoBuyers();
		break;

		case 66: // B
			if (hasAch("ng3p51")) bigRip()
			else if (inNGM(3)) manualTickspeedBoost()
		break;

		case 67: // C
			pH.onHotkey("infinity")
		break;

		case 68: // D
			if (shiftDown && hasAch("ngpp11")) metaBoost()
			else if (hasAch("r136")) dilateTime(false, true)
			else el("softReset").onclick()
		break;

		case 69: // E, also, nice.
			pH.onHotkey("eternity")
		break;

		case 70: // F, for fluctuate.
			pH.onHotkey("fluctuate")
		break;

		case 71: // G
			if (hasAch("ng3p51")) pH.onHotkey("ghostify")
			else if (pH.did("galaxy")) pH.onHotkey("galaxy")
			else el("secondSoftReset").onclick()
		break;

		case 72: // H
			setAchieveTooltip()
		break

		case 73: // I
			pH.onHotkey("infinity")
		break;

		case 76: // N
			if (inNGM(4)) buyMaxTDB()
		break;

		case 77: // M
			if (ndAutobuyersUsed <= 8) el("maxall").onclick()
			if (hasDilationStudy(6)) el("metaMaxAll").onclick()
		break;

		case 80: // P, reset at latest layer
			pH.onHotkey()
		break;

		case 81: // Q, for quantum.
			pH.onHotkey("quantum")
		break;

		case 82: //R
			replicantiGalaxy()
		break;

		case 83: // S
			el("sacrifice").onclick()
		break;

		case 84: // T
			if (shiftDown) buyTickSpeed()
			else buyMaxTickSpeed()
		break;
	}
}, false);

window.addEventListener('keyup', function(event) {
	if (event.keyCode === 70) {
		$.notify("Paying respects", "info")
		giveAchievement("It pays to have respect")
	}
	if (Math.random() <= 1e-6) giveAchievement("keyboard broke?")
	if (!player.options.hotkeys || controlDown === true || document.activeElement.type === "text") return false
}, false);

/* MIGHT MOVE THIS */
function switchDecimalMode() {
	if (confirm('You will change the number library preference to ' + (aarMod.breakInfinity ? 'logarithmica_numerus_lite':'break_infinity.min') + '.js. This requires the webpage to reload for this to take effect. Are you sure you want to do this?')) {
		aarMod.breakInfinity = !aarMod.breakInfinity
		if (aarMod.breakInfinity && !aarMod.performanceTicks && confirm("WARNING: The game may become laggy with this library! Do you want to turn on Performance Ticks? This will increase the performance of the game, but may cause detrimental effects for lower-end computers. The option for Performance Ticks can be changed at any time.")) aarMod.performanceTicks = true
		save_game(true)
		document.location.reload(true)
	}
}

function updateAdvOpts(toggle) {
	if (toggle) {
		metaSave.advOpts = !metaSave.advOpts
		localStorage.setItem(metaSaveId, btoa(JSON.stringify(metaSave)))
	}

	var on = metaSave.advOpts
	el("advOpts").textContent = "Advanced Options: " + (on ? "ON" : "OFF")

	el("renderrate_div").style.display = on ? "" : "none"
	el("animationoptionsbtn").style.display = on ? "" : "none"
	el("autoSave").style.display = on ? "" : "none"
	el("autoSaveIntDiv").style.display = on ? "" : "none"
	el("pause").style.display = on ? "" : "none"
	el("rename").style.display = on ? "" : "none"
	el("load").style.display = on ? "" : "none"
	el("reload").style.display = on ? "" : "none"
	el("visibilityOpts").style.display = on ? "" : "none"
	el("save_name").style.display = on ? "" : "none"
	el("notation").style.display = on ? "" : "none"
	el("tabsSave").style.display = on ? "" : "none"
	el("hotkeys").style.display = on ? "" : "none"
	el("retry").style.display = on ? "" : "none"
	el("autoApply").style.display = on ? "" : "none"
	el("toggleLogRateChange").style.display = on ? "" : "none"
	el("decimalModeBtn").style.visibility = Decimal.gt(player.totalmoney, Decimal.pow(10, 9e15)) || !on ? "hidden" : "visible"
	for (var i = 1; i <= 8; i++) el("advTheme" + i).style.display = on ? "" : "none"
	pH.reset()
}