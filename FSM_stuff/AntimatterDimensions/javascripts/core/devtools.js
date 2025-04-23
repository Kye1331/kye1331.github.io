var dev = {};

dev.giveAllAchievements = function(slient) {
	var gave = []
	Object.keys(allAchievements).forEach(function(key) {
		var got = hasAch(key)
		giveAchievement(allAchievements[key], true)
		if (hasAch(key) && !got) gave.push(key)
	})
	if (!slient) {
		if (gave.length < 11) for (var a = 0; a < gave.length; a++) $.notify(allAchievements[gave[a]], "success")
		if (gave.length > 1) $.notify("Gave "+gave.length+" achievements.", "success")
		updateAchievements()
	}
}

dev.giveAllNGAchievements = function() {
	var gave = []
	Object.keys(allAchievements).forEach(function(key) {
		if (key[0] == "r" || key[0] == "s") {
			var got = hasAch(key)
			giveAchievement(allAchievements[key], true)
			if (hasAch(key) && !got) gave.push(key)
		}
	})
	if (gave.length < 11) for (var a = 0; a < gave.length; a++) $.notify(allAchievements[gave[a]], "success")
	if (gave.length > 1) $.notify("Gave " + gave.length + " achievements.", "success")
	updateAchievements()
}

dev.forceMaxDB = function(){
	if (getShiftRequirement().tier < 8) {
		player.resets += Decimal.gte(getAmount(getShiftRequirement().tier), getShiftRequirement().amount) ? 1 : 0
		return
	}
	player.resets += doBulkSpent(getAmount(8), getShiftRequirement, 0, true, 1/0, player.resets).toBuy
}

dev.forceMaxTSB = function(){
	player.tickspeedBoosts += doBulkSpent(getAmount(8), getTickspeedBoostRequirement, player.tickspeedBoosts, true, 1/0).toBuy
}

dev.doubleEverything = function() {
	Object.keys(player).forEach( function(key) {
		if (typeof player[key] === "number") player[key] *= 2;
		if (typeof player[key] === "object" && player[key].constructor !== Object) player[key] = player[key].times(2);
		if (typeof player[key] === "object" && !isFinite(player[key])) {
			Object.keys(player[key]).forEach( function(key2) {
				if (typeof player[key][key2] === "number") player[key][key2] *= 2
				if (typeof player[key][key2] === "object" && player[key][key2].constructor !== Object) player[key][key2] = player[key][key2].times(2)
			})
		}
	})
}

dev.spin3d = function() {
	if (el("body").style.animation === "") el("body").style.animation = "spin3d 2s infinite"
	else el("body").style.animation = ""
}

dev.cancerize = function() {
	player.options.theme = "S4";
	player.options.secretThemeKey = "Cancer";
	setTheme(player.options.theme);
	player.options.notation = "Emojis"
	el("theme").textContent = "SO"
	el("notation").textContent = "BEAUTIFUL"
}

dev.fixSave = function() {
	var save = JSON.stringify(player, function(k, v) { return (v === Infinity) ? "Infinity" : v; })
  
	var fixed = save.replace(/NaN/gi, "10")
	var stillToDo = JSON.parse(fixed)
	for (var i = 0; i < stillToDo.autobuyers.length; i++) stillToDo.autobuyers[i].isOn = false
	console.log(stillToDo)
    
	var save_data = stillToDo
	if (!save_data || !verify_save(save_data)) {
		alert('could not load the save..');
		load_custom_game();
		return;
	}

	saved = 0;
	totalMult = 1
	currentMult = 1
	infinitiedMult = 1
	achievementMult = 1
	challengeMult = 1
	unspentBonus = 1
	infDimPow = 1
	postc8Mult = E(0)
	mult18 = E(1)
	ec10bonus = E(1)
	player = save_data;
	save_game();
	load_game();
	updateChallenges()
	transformSaveToDecimal()
}

dev.implode = function() {
	el("body").style.animation = "implode 2s 1";
	setTimeout(function(){ el("body").style.animation = ""; }, 2000)
}

dev.ghostify = function(gain, amount, seconds=4) {
	el("ghostifyani").style.display = ""
	el("ghostifyani").style.width = "100%"
	el("ghostifyani").style.height = "100%"
	el("ghostifyani").style.left = "0%"
	el("ghostifyani").style.top = "0%"
	el("ghostifyani").style.transform = "rotateZ(0deg)"
	el("ghostifyani").style["transition-duration"] = (seconds / 4) + "s"
	el("ghostifyanitext").style["transition-duration"] = (seconds / 8) + "s"
	setTimeout(function() {
		el("ghostifyanigained").innerHTML = ghostified ? "You now have <b>" + shortenDimensions(amount) + "</b> Ghost Particles. (+" + shortenDimensions(gain) + ")" : "Congratulations for beating a PC with qcData 6 & 8 combination!"
		el("ghostifyanitext").style.left = "0%"
		el("ghostifyanitext").style.opacity = 1
	}, seconds * 250)
	setTimeout(function() {
		el("ghostifyanitext").style.left = "100%"
		el("ghostifyanitext").style.opacity = 0
	}, seconds * 625)
	setTimeout(function() {
		el("ghostifyani").style.width = "0%"
		el("ghostifyani").style.height = "0%"
		el("ghostifyani").style.left = "50%"
		el("ghostifyani").style.top = "50%"
		el("ghostifyani").style.transform = "rotateZ(45deg)"
	}, seconds * 750)
	setTimeout(dev.resetGhostify, seconds * 1000)
}

dev.resetGhostify = function() {
	el("ghostifyani").style.width = "0%"
	el("ghostifyani").style.height = "0%"
	el("ghostifyani").style.left = "50%"
	el("ghostifyani").style.top = "50%"
	el("ghostifyani").style.transform = "rotateZ(-45deg)"
	el("ghostifyani").style["transition-duration"] = "0s"
	el("ghostifyanitext").style.left = "-100%"
	el("ghostifyanitext").style["transition-duration"] = "0s"
}

dev.updateCosts = function() {
	for (var i = 1; i < 9; i++) {
		var dim = player["timeDimension"+i]
		if (dim.cost.gte(Number.MAX_VALUE)) {
			dim.cost = Decimal.pow(timeDimCostMults[i]*1.5, dim.bought).times(timeDimStartCosts[i])
		}
		if (dim.cost.gte("1e1300")) {
			dim.cost = Decimal.pow(timeDimCostMults[i]*2.2, dim.bought).times(timeDimStartCosts[i])
		}
		if (i > 4) {
			dim.cost = Decimal.pow(timeDimCostMults[i]*100, dim.bought).times(timeDimStartCosts[i])
		}
	}
}

dev.testTDCosts = function() {
	for (var i=1; i<9; i++) {
		var timeDimStartCosts = [null, 1, 5, 100, 1000, "1e2350", "1e2650", "1e2900", "1e3300"]
		var dim = player["timeDimension"+i]
		if (dim.cost.gte(Number.MAX_VALUE)) {
			dim.cost = Decimal.pow(timeDimCostMults[i]*1.5, dim.bought).times(timeDimStartCosts[i])
		}
		if (dim.cost.gte("1e1300")) {
			dim.cost = Decimal.pow(timeDimCostMults[i]*2.2, dim.bought).times(timeDimStartCosts[i])
		}
		if (i > 4) {
			dim.cost = Decimal.pow(timeDimCostMults[i]*100, dim.bought).times(timeDimStartCosts[i])
		}
	}
}

dev.giveQuantumStuff = function(n, quick) {
	qu_save.usedQuarks.r = qu_save.usedQuarks.r.add(n)
	qu_save.usedQuarks.b = qu_save.usedQuarks.b.add(n)
	qu_save.usedQuarks.g = qu_save.usedQuarks.g.add(n)
	qu_save.gluons.rg = qu_save.gluons.rg.add(n)
	qu_save.gluons.gb = qu_save.gluons.gb.add(n)
	qu_save.gluons.br = qu_save.gluons.br.add(n)
	if (!quick) updateColorCharge()
}

dev.quickQuantum = function(n, quick) {
	if (!n) n = quarkGain()
	qu_save.usedQuarks.r = E(0)
	qu_save.usedQuarks.b = E(0)
	qu_save.usedQuarks.g = E(0)
	qu_save.gluons.rg = Decimal.div(n, 3)
	qu_save.gluons.gb = Decimal.div(n, 3)
	qu_save.gluons.br = Decimal.div(n, 3)
	gainQKOnQuantum(n, true)
	distributeQK(true)
	if (!quick) updateColorCharge()
}

dev.giveAllPCs = function() {
	let array = []
	for (var i = 1; i <= 8; i++) for (var j = 1; j < i; j++) array.push(j * 10 + i)
	PCs_save.comps = array
	PCs_save.lvl = 29

	PCs.updateTmp()
	PCs.updateDisp()
}

dev.addGHP = function(n){
	player.ghostify.ghostParticles = player.ghostify.ghostParticles.add(Decimal.pow(10,n))
}

dev.setNeut = function(n){
	player.ghostify.neutrinos.electron = Decimal.pow(10,n)
	player.ghostify.neutrinos.mu = Decimal.pow(10,n)
	player.ghostify.neutrinos.tau = Decimal.pow(10,n)
}

dev.addNeut = function(n){
	player.ghostify.neutrinos.electron = player.ghostify.neutrinos.electron.add(Decimal.pow(10,n))
	player.ghostify.neutrinos.mu = player.ghostify.neutrinos.mu.add(Decimal.pow(10,n))
	player.ghostify.neutrinos.tau = player.ghostify.neutrinos.tau.add(Decimal.pow(10,n))
}

dev.giveNeutrinos = function(n){
	dev.addNeut(n)
}

dev.addNeutrinos = function(n){
	dev.addNeut(n)
}

dev.giveAllEmpowerments = function(){
	let old = player.ghostify.ghostlyPhotons.enpowerments
	maxLightEmpowerments()
	let diff = player.ghostify.ghostlyPhotons.enpowerments - old > 0
	$.notify("Gave " + getFullExpansion(diff) + " Light Empowerments.", diff ? "success" : "error")
}

//Placeholder for future boosts
dev.boosts = {
	on: false,
	tmp: {},
	update() {
		let data = { on: this.on }

		if (this.on) {
			for (var i = 1; i <= 8; i++) {
				if (this[i].unl()) {
					if (this.tmp[i] === undefined) console.log("Activating boost #" + i + " (" + this[i].name + ")")
					data[i] = this[i].eff()
				}
			}
		}
		if (this.on != this.tmp.on) console.log("Dev boosts: " + this.on)

		this.tmp = data
	},
	1: {
		name: "Timeless Fuse",
		unl() {
			return tmp.eterUnl
		},
		eff(x) {
			//Timeless Fuse: Eternity points multiply Tachyon Particles.
			if (x === undefined) x = player.eternityPoints
			x = Math.pow(x.add(1).log10() + 1, 1/3)
			return Decimal.pow(1.01, x)
		},
	},
	2: {
		name: "Excited Positrons",
		unl() {
			return pos.on()
		},
		eff(x) {
			//Excited Positrons: Antimatter multiplies Positrons.
			if (x === undefined) x = player.money
			x = Math.pow(x.add(1).log10() / 1e11 + 1, 0.15)
			return x
		}
	},
	3: {
		name: "Potential Strings",
		unl() {
			return tmp.quActive
		},
		eff(x) {
			//Potential Strings: Potential Vibration Energy (scaled by antimatter) multiply Quantum Energy and Positronic Charge.
			if (x === undefined) x = Math.log10(player.money.add(1).log10() + 1)
			return Math.max(x / 4 - 2, 1)
		},
	},
	4: {
		name: "Again and again...",
		unl() {
			return true
		},
		eff(x) {
			//Again and again...: Raise Infinitied and Eternitied gains to an exponent.
			return 1.5
		},
	},
	5: {
		name: "Quantum Tunneling",
		unl() {
			return tmp.quActive
		},
		eff(x) {
			//Quantum Tunneling: Green power effect boosts Replicanti Stealth at a reduced rate.
			return Math.pow(colorBoosts.g, 1/4)
		},
	},
	6: {
		name: "Hypergluonic Flux",
		unl() {
			return tmp.quActive
		},
		eff(x) {
			//Hypergluonic Flux: Increase the scaling of Quantum Power.
			return (3 - 40 / (Math.log10(player.money.add(1).log10() + 1) + 20)) / 3
		},
	},
	7: {
		name: "???",
		unl() {
			return false
		},
		eff(x) {
			return 1
		},
	},
	8: {
		name: "???",
		unl() {
			return false
		},
		eff(x) {
			return 1
		},
	},
}

function futureBoost(x) {
	return dev.boosts.on
}

//QUANTUM SINGULARITY / SUPREMACY?!
dev.quSb = {
	//^3 Quantum Power: Rebalancing
	k: 3, //Quantum Energy
	j: 6, //Quantum Power
	jP: 3, //Positronic Charge

	on: false //This boost should be enabled in this line, not in dev.boosts.on!

	/*
	Replicanti Upgrades: ^2.5 cap?
	QC2 reward: ^1
	Color Subcharge: ^0.5
	Green Power: n^1/4k
	Meta Accelerator Speed: n^1/6jP
	Meta Accelerator Slowdown: n^1/6jP
	*/
}

function qu_superbalanced() {
	return dev.quSb.on
}