function toggleChallengeRetry() {
	player.options.retryChallenge = !player.options.retryChallenge
	el("retry").textContent = "Automatically retry challenges: O" + (player.options.retryChallenge ? "N" : "FF")
}

function togglePerformanceTicks() {
	aarMod.performanceTicks = ((aarMod.performanceTicks || 0) + 1) % 4
	updatePerformanceTicks()
}

function toggleLogRateChange() {
	aarMod.logRateChange = (aarMod.logRateChange + 1) % 3
	el("toggleLogRateChange").textContent = "Rate displays: " + ["Normal", "Logarithm", "None"][aarMod.logRateChange]
	dimDescEnd = (aarMod.logRateChange ? " OoM" : "%") + "/s)"
}

function toggleTabsSave() {
	aarMod.tabsSave.on =! aarMod.tabsSave.on
	el("tabsSave").textContent = "Saved tabs: O" + (aarMod.tabsSave.on ? "N" : "FF")
}

function infMultAutoToggle() {
	if (getEternitied()<1) {
		if (canBuyIPMult()) {
			let toBuy = Math.max(Math.floor(player.infinityPoints.div(player.infMultCost).times(ipMultCostIncrease - 1).plus(1).log(ipMultCostIncrease)), 1)
			let toSpend = Decimal.pow(ipMultCostIncrease, toBuy).sub(1).div(ipMultCostIncrease - 1).times(player.infMultCost).round()

			if (toSpend.gt(player.infinityPoints)) player.infinityPoints = E(0)
			else player.infinityPoints = player.infinityPoints.sub(toSpend)

			let multInc = Decimal.pow(getIPMultPower(), toBuy)
			player.infMult = player.infMult.times(multInc)
			player.infMultCost = player.infMultCost.times(Decimal.pow(ipMultCostIncrease, toBuy))
			player.autoIP = player.autoIP.times(multInc)

			if (player.autobuyers[11].priority !== undefined && player.autobuyers[11].priority !== null && player.autoCrunchMode == "amount") player.autobuyers[11].priority = multInc.times(player.autobuyers[11].priority)
			if (player.autoCrunchMode == "amount") el("priority12").value = formatValue("Scientific", player.autobuyers[11].priority, 2, 0)
		}
	} else {
		player.infMultBuyer = !player.infMultBuyer
		el("infmultbuyer").textContent = "Autobuy IP mult: O" + (player.infMultBuyer ? "N" : "FF")
	}
}

function toggleEternityConf() {
	player.options.eternityconfirm = !player.options.eternityconfirm
	el("eternityconf").textContent = "Eternity confirmation: O" + (player.options.eternityconfirm ? "N" : "FF")
}

function toggleDilaConf() {
	aarMod.dilationConf = !aarMod.dilationConf
	el("dilationConfirmBtn").textContent = "Dilation confirmation: O" + (aarMod.dilationConf ? "N" : "FF")
}

function toggleOfflineProgress() {
	aarMod.offlineProgress = !aarMod.offlineProgress
	el("offlineProgress").textContent = "Offline progress: O"+(aarMod.offlineProgress?"N":"FF")
}

function toggleAutoBuyers() {
	var bool = player.autobuyers[0].isOn
	for (var i = 0; i<player.autobuyers.length; i++) {
		if (player.autobuyers[i]%1 !== 0) {
			player.autobuyers[i].isOn = !bool
		}
	}
	player.autoSacrifice.isOn = !bool
	player.eternityBuyer.isOn = !bool
	if (qMs.tmp.amt >= 17) qu_save.autobuyer.enabled = !bool
	updateCheckBoxes()
	updateAutobuyers()
}

function toggleBulk() {
	if (player.options.bulkOn) {
		player.options.bulkOn = false
		el("togglebulk").textContent = "Enable bulk buy"
	} else {
		player.options.bulkOn = true
		el("togglebulk").textContent = "Disable bulk buy"
	}
}

function toggleHotkeys() {
	if (player.options.hotkeys) {
		player.options.hotkeys = false
		el("hotkeys").textContent = "Enable hotkeys"
	} else {
		player.options.hotkeys = true
		el("hotkeys").textContent = "Disable hotkeys"
	}
}

function respecToggle() {
	player.respec = !player.respec
	updateRespecButtons()
}

function toggleProductionTab() {
	// 0 == visible, 1 == not visible
	aarMod.hideProductionTab=!aarMod.hideProductionTab
	el("hideProductionTab").textContent = (aarMod.hideProductionTab?"Show":"Hide")+" production tab"
	if (el("production").style.display == "block") showDimTab("antimatterdimensions")
}

function toggleRepresentation() {
	// 0 == visible, 1 == not visible
	aarMod.hideRepresentation=!aarMod.hideRepresentation
	el("hideRepresentation").textContent=(aarMod.hideRepresentation?"Show":"Hide")+" antimatter representation"
}

function toggleReplAuto(i) {
	if (i == "chance") {
		if (player.replicanti.auto[0]) {
			player.replicanti.auto[0] = false
			el("replauto1").textContent = "Auto: OFF"
		} else {
			player.replicanti.auto[0] = true
			el("replauto1").textContent = "Auto: ON"
		}
	} else if (i == "interval") {
		if (player.replicanti.auto[1]) {
			player.replicanti.auto[1] = false
			el("replauto2").textContent = "Auto: OFF"
		} else {
			player.replicanti.auto[1] = true
			el("replauto2").textContent = "Auto: ON"
		}
	} else if (i == "galaxy") {
		if (player.replicanti.auto[2]) {
			player.replicanti.auto[2] = false
			el("replauto3").textContent = "Auto: OFF"
		} else {
			player.replicanti.auto[2] = true
			el("replauto3").textContent = "Auto: ON"
		}
	}
}
