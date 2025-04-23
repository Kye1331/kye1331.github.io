var pH = {
	order: ["paradox", "accelerate", "galaxy", "infinity", "eternity", "interreality", "singularity", "quantum", "fluctuate", "ghostify"],
	names: {
		infinity: "Infinity",
		eternity: "Eternity",
		quantum: "Quantum",
		fluctuate: "Fluctuate"
	},
	reqs: {
		paradox() {
			return player.money.max(1).log10() >= 3 && player.totalTickGained && !tmp.ri
		},
		accelerate() {
			return false
		},
		galaxy() {
			return getGSAmount().gte(1) && !tmp.ri
		},
		infinity() {
			return player.money.gte(Number.MAX_VALUE) && player.currentChallenge == "" && player.break
		},
		eternity() {
			var id7unlocked = player.infDimensionsUnlocked[7]
			if (getEternitied() >= 25 || (tmp.ngp3 && qu_save.bigRip.active)) id7unlocked = true
			return player.infinityPoints.gte(player.currentEternityChall != "" ? player.eternityChallGoal : Number.MAX_VALUE) && id7unlocked
		},
		interreality() {
			return ECComps("eterc10") >= 1
		},
		singularity() {
			return ngSg.can()
		},
		quantum() {
			return QCs.inAny() ? QCs.getGoal() :
				Decimal.gte(getQuantumReqSource(), getQuantumReq()) &&
				(!tmp.ngp3 || tmp.ngp3_mul || ECComps("eterc14") >= 1) &&
				getQuarkGain().gte(1)
		},
		fluctuate() {
			return fluc.res().gte(fluc.req())
		},
		ghostify() {
			return false
		}
	},
	modReqs: {
		paradox() {
			return inNGM(5)
		},
		accelerate() {
			return tmp.ngmX >= 6
		},
		galaxy() {
			return inNGM(2)
		},
		interreality() {
			return inNGM(2)
		},
		singularity() {
			return tmp.ngSg
		},
		quantum() {
			return player.meta !== undefined
		},
		fluctuate() {
			return tmp.ngp3
		},
		ghostify() {
			return tmp.ngp3
		}
	},
	resetFuncs: {
		paradox() {
			pSac()
		},
		accelerate() {
			alert("Coming soon...")
		},
		galaxy() {
			galacticSacrifice()
		},
		infinity() {
			bigCrunch()
		},
		eternity() {
			el("eternitybtn").onclick()
		},
		interreality() {
			alert("Coming soon...")
		},
		singularity() {
			alert("Coming soon...")
		},
		quantum() {
			if (player.meta) {
				if (!QCs.inAny()) quantum(false, false, 0)
				else quantum()
			}
		},
		fluctuate() {
			fluc.reset()
		},
		ghostify() {
			ghostify()
		}
	},
	tabLocs: {
		paradox: "paradox",
		accelerate: "accTab",
		galaxy: "galaxy",
		infinity: "infinity",
		eternity: "eternitystore",
		interreality: "irTab",
		singularity: "sgTab",
		quantum: "quantumtab",
		fluctuate: "flucTab",
		ghostify: "ghostify"
	},
	hotkeys: {
		paradox: "p",
		accelerate: "a",
		galaxy: "g",
		infinity: "c",
		eternity: "e",
		interreality: "i",
		singularity: "s",
		quantum: "q",
		fluctuate: "f",
		ghostify: "g"
	},
	can(id) {
		return pH_tmp[id] && pH.reqs[id]()
	},
	didData: {
		paradox() {
			return player.pSac.times >= 1
		},
		accelerate() {
			return pH.did("galaxy")
		},
		galaxy() {
			return player.galacticSacrifice.times >= 1
		},
		infinity() {
			return player.infinitied >= 1
		},
		eternity() {
			return player.eternities >= 1
		},
		interreality() {
			return pH.did("singularity") || pH.did("quantum")
		},
		singularity() {
			return ngSg.save.times >= 1
		},
		quantum() {
			return qu_save.times >= 1
		},
		fluctuate() {
			return fluc.unl()
		},
		ghostify() {
			return player.ghostify.times >= 1
		}
	},
	did(id) {
		return pH_tmp[id] && pH_tmp[id].did
	},
	has(id){
		return pH_tmp[id] && pH_tmp[id].did
	},
	displayData: {
		paradox: ["pSac", "px", "paradoxbtn"],
		accelerate: ["accReset", "vel", "accTabBtn"],
		galaxy: ["sacrificebtn", "galaxyPoints2", "galaxybtn"],
		infinity: ["postInfinityButton", "infinityPoints2", "infinitybtn"],
		eternity: ["eternitybtn", "eternityPoints2", "eternitystorebtn"],
		interreality: ["irReset", "irEmpty", "irTabBtn"],
		singularity: ["sgReset", "sgEmpty", "sgTabBtn"],
		quantum: ["quantumbtn", "quantumInfo", "quantumtabbtn"],
		fluctuate: ["fluctuateReset", "fluctuateInfo", "fluctuateBtn"],
		ghostify: ["ghostifybtn", "ghostparticles", "ghostifytabbtn"]
	},
	shown(id, force) {
		if (!pH_tmp[id]) return false
		if (!pH_tmp[id].did) return false

		if (id == "eternity" && !tmp.eterUnl) return false
		if (id == "quantum" && !tmp.quUnl) return false

		return !aarMod.layerHidden[id]
	},
	onHotkey(layer) {
		if (!layer) layer = pH_tmp.lastDid
		if (shiftDown) {
			if (pH.shown(layer)) showTab(pH.tabLocs[layer])
		} else pH.resetFuncs[layer]()
	},
	tmp: {},
	reset() {
		el("layerDispOptions").style.display = "none"
		//el("resetDispOptions").style.display = "none"

		var type = aarMod.layerHidden.auto
		el("show_layers_amt").textContent = type ? "Show last " + (type + 1) + " layers" : "Show all layers"

		var did = false
		pH_tmp = { layers: 0 }
		for (var x = pH.order.length; x > 0; x--) {
			var p = pH.order[x - 1]
			if (pH.modReqs[p] === undefined || pH.modReqs[p]()) {
				pH_tmp[p] = {}
				if (!did && pH.didData[p]()) {
					did = true
					pH_tmp.lastDid = p
				}
				if (did) pH.onPrestige(p)
				else el("hide_" + p).style.display = "none"
			} else el("hide_" + p).style.display = "none"
		}

		pH.updateActive()
	},
	updateDisplay() {
		var o = pH.order
		var data = pH.displayData

		//Preparations
		var a = 0
		var a2 = 0
		var layers = [1/0, 2, 3][aarMod.layerHidden.auto || 0]
		for (var x = o.length; x > 0; x--) {
			var p = o[x-1]
			var t = pH_tmp[p]
			var d = data[p]
			var s = false

			var pres = pH.can(p)
			var tab = pH.did(p)
			if (t && (pres || tab)) {
				s = !isEmptiness && !aarMod.layerHidden[p] && layers > a
				s2 = !isEmptiness && layers > a
				if (s) {
					a++
					t.shown = a
					el(d[0]).className = "presBtn presPos" + a + " " + p + "btn"
					el(d[1]).className = "presCurrency" + a
				} else delete t.shown
			}
			if (tab) a2++

			el(d[0]).style.display = s && pres ? "" : "none"
			el(d[1]).style.display = s && tab ? "" : "none"
			el(d[2]).style.display = s && tab ? "" : "none"
			el("hide_" + p).style.display = tab && layers >= a2 ? "" : "none"
		}

		//Blockages
		var blockRank = a
		if (!isEmptiness && QCs.in(4)) blockRank = blockRank + 2

		var haveBlock = blockRank >= 3
		el("bigcrunch").parentElement.style.top = haveBlock ? (Math.floor(blockRank / 3) * 120 + 19) + "px" : "19px"
		el("quantumBlock").style.display = haveBlock ? "" : "none"
		el("quantumBlock").style.height = haveBlock ? (Math.floor(blockRank / 3) * 120 + 12) + "px" : "120px"

		//Infinity Dimension unlocks
		if (player.break && !player.infDimensionsUnlocked[7] && getEternitied() < 25) {
			newDimPresPos = pH_tmp.eternity.shown || a + 1
			if (!pH_tmp.eternity.shown) a++
		}

		//Time Dilation
		if (player.dilation.active) el("eternitybtn").className = "presBtn presPos" + pH_tmp.eternity.shown + " dilationbtn"

		//Quantum (after Neutrino Upgrade 16)
		let bigRipAndQuantum = !hasNU(16)
		if (!bigRipAndQuantum && !QCs.inAny()) el("quantumbtn").style.display = "none"
	},
	updateActive() {
		tmp.eterUnl = pH.did("eternity")
		tmp.quUnl = tmp.ngp3 && pH.did("quantum")
		tmp.quActive = tmp.quUnl
	},
	onPrestige(layer) {
		if (pH_tmp[layer].did) return

		pH_tmp.layers++
		pH_tmp[layer].did = true
		pH_tmp[layer].order = pH_tmp.layers

		if (metaSave.advOpts) el("layerDispOptions").style.display = ""
		el("hide_" + layer).innerHTML = (aarMod.layerHidden[layer] ? "Show" : "Hide") + " " + (pH.names[layer] || layer)

		pH.updateActive()
	},

	//Visibility
	setupHTML(layer) {
		var html = '<button id="show_layers_amt" onclick="pH.updateLayersAmt(true)" class="storebtn" style="color:black; width: 200px; height: 30px; font-size: 15px"></button>'
		for (var x = 0; x < pH.order.length; x++) {
			var p = pH.order[x]
			html += '<button id="hide_' + p + '" onclick="pH.hideOption(\'' + p + '\')" class="storebtn" style="color:black; width: 200px; height: 55px; font-size: 15px"></button> '
		}
		el("hideLayers").innerHTML = html
		pH.updateLayersAmt()
	},
	hideOption(layer) {
		if (aarMod.layerHidden[layer]) delete aarMod.layerHidden[layer]
		else aarMod.layerHidden[layer] = true

		el("hide_" + layer).innerHTML = (aarMod.layerHidden[layer] ? "Show" : "Hide") + " " + (pH.names[layer] || layer)

		if (layer == "infinity") el("postctabbtn").parentElement.style.display = pH.shown("infinity") && (player.postChallUnlocked >= 1 || pH.did("eternity")) ? "" : "none"
		if (layer == "eternity") updateEternityChallenges()
		if (layer == "quantum") handleDispOutOfQuantum()
		if (!aarMod.layerHidden[layer]) return

		if (layer == "infinity") {
			if (el("infinitydimensions").style.display == "block") showDimTab("antimatterdimensions")
			if (el("breakchallenges").style.display == "block") showChallengesTab("normalchallenges")
		}
		if (layer == "eternity") {
			if (el("timedimensions").style.display == "block" || el("metadimensions").style.display == "block") showDimTab("antimatterdimensions")
			if (el("eternitychallenges").style.display == "block") showChallengesTab("normalchallenges")
		}
	},
	updateLayersAmt(toggle) {
		if (toggle) {
			aarMod.layerHidden.auto = ((aarMod.layerHidden.auto || 0) + 1) % 3
			pH.reset()
		}
	}
}
var pH_tmp = {}
let PRESTIGES = pH